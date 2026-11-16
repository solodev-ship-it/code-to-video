import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm, realpath, readdir, symlink, mkdir, rename} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {watch} from 'node:fs';
import {createProject} from '../../scripts/cli/create.ts';
import {prepareProjectCommand} from '../../scripts/project-host.ts';
import {startProjectPersistence} from '../../scripts/project-persistence.ts';
import {loadProject} from '../../packages/projects/src/load.ts';
import {createProjectRegistry} from '../../packages/projects/src/registry.ts';
import {applyStudioProps, readStudioProps} from '../../packages/projects/src/studio-props.ts';

const frameworkRoot = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const {CodemodsInternals, setCompositionDefaultProps, applyCodemodChanges} = require('@remotion/codemods');
async function fixture(run: (root:string, launch:Awaited<ReturnType<typeof prepareProjectCommand>>) => Promise<void>) {
  const temporary = await realpath(await mkdtemp(path.join(tmpdir(), 'ctv-persist-')));
  let session: string | undefined;
  try {
    const project = await createProject({directory:path.join(temporary, 'project'), template:'title-card', brandId:'aurora-finance', styleId:'cinematic', motionId:'elegant'}, frameworkRoot);
    const launch = await prepareProjectCommand({frameworkRoot, projectRoot:project.root, mode:'studio', args:[]});
    session = path.dirname(launch.args[1]!);
    await run(project.root, launch);
  } finally {
    if (session) await rm(session, {recursive:true, force:true});
    await rm(temporary, {recursive:true, force:true});
  }
}
async function edit(entry: string, changes: Record<string,unknown>) {
  const content = await readFile(entry, 'utf8');
  const extracted = CodemodsInternals.computeCanUpdateDefaultPropsFromContent(content, 'TitleCard');
  const source = {rootDir:path.dirname(entry), files:{[entry]:content}};
  const edits = setCompositionDefaultProps({project:source, compositionFile:entry, compositionId:'TitleCard',
    defaultProps:{...extracted.currentDefaultProps, ...changes}, enumPaths:[]});
  await writeFile(entry, applyCodemodChanges(source, edits.changes).files[entry]);
}
test('project props persist across reload/render preparation, preserve sources and back up revisions', async () => fixture(async (root, launch) => {
  const manifestFile = path.join(root, 'code-to-video.project.json');
  const sceneFile = path.join(root, 'compositions/TitleCard.tsx');
  const manifestBefore = await readFile(manifestFile, 'utf8');
  const sceneBefore = await readFile(sceneFile, 'utf8');
  const errors: Error[] = [];
  const session = launch.persistence!;
  const writer = await startProjectPersistence(session.project, session.entry, frameworkRoot, session.registry, e => errors.push(e));
  try {
    await edit(session.entry, {title:'Persisted first'});
    await writer.flush();
    assert.equal((await loadProject(root)).manifest.compositions[0]!.props.title, 'Persisted first');
    await edit(session.entry, {title:'Persisted second'});
    await writer.flush();
    const backups = (await readdir(path.join(root, '.code-to-video'))).filter(n => n.startsWith('props-backup-'));
    assert.equal(backups.length, 1);
    assert.match(await readFile(path.join(root, '.code-to-video', backups[0]!), 'utf8'), /Persisted first/);
    const render = await prepareProjectCommand({frameworkRoot, projectRoot:root, mode:'render', args:['TitleCard', path.join(root, 'outputs/test.mp4')], allowExternalOutput:true});
    try {assert.match(await readFile(render.args[1]!, 'utf8'), /Persisted second/);}
    finally {await rm(path.dirname(render.args[1]!), {recursive:true, force:true});}
    assert.equal(await readFile(manifestFile, 'utf8'), manifestBefore);
    assert.equal(await readFile(sceneFile, 'utf8'), sceneBefore);
    assert.deepEqual(errors, []);
  } finally {await writer.close();}
  assert.equal((await loadProject(root)).manifest.compositions[0]!.props.title, 'Persisted second');
  assert.equal((await readdir(path.join(root, '.code-to-video'))).includes('preview.lock'), false);
}));

test('second preview writer fails closed; close flushes pending edits and removes only its lock', async () => fixture(async (root, launch) => {
  const s = launch.persistence!;
  const writer = await startProjectPersistence(s.project, s.entry, frameworkRoot, s.registry, () => {});
  try {
    await assert.rejects(startProjectPersistence(s.project, s.entry, frameworkRoot, s.registry, () => {}), /Cannot lock project preview/);
    await edit(s.entry, {title:'Saved on stop'});
  } finally {await writer.close();}
  assert.equal((await loadProject(root)).manifest.compositions[0]!.props.title, 'Saved on stop');
}));

test('running preview watcher persists edits without requiring a flush or restart', async () => fixture(async (root, launch) => {
  const s = launch.persistence!;
  let rejectSaved!: (error:Error)=>void;
  const observed = new Promise<void>((resolve,reject) => {
    rejectSaved = reject;
    const watcher = watch(root, (_event, name) => {
      if (String(name) === 'studio-props.json') {watcher.close();clearTimeout(timer);resolve();}
    });
    const timer = setTimeout(() => {watcher.close();reject(new Error('Sidecar not written by running preview watcher'));}, 5000);
  });
  const writer = await startProjectPersistence(s.project, s.entry, frameworkRoot, s.registry, rejectSaved);
  try {
    await edit(s.entry, {title:'Saved while playing'});
    await observed;
    assert.equal((await loadProject(root)).manifest.compositions[0]!.props.title, 'Saved while playing');
  } finally {await writer.close();}
}));

for (const kind of ['manifest', 'sidecar', 'theme', 'unsafe', 'computed'] as const) {
  test(`persistence rejects ${kind} conflict/invalid edit and preserves recoverable entry`, async () => fixture(async (root, launch) => {
    const s = launch.persistence!;
    const failures: Error[] = [];
    const writer = await startProjectPersistence(s.project, s.entry, frameworkRoot, s.registry, e => failures.push(e));
    const manifest = path.join(root, 'code-to-video.project.json');
    const sidecar = path.join(root, 'studio-props.json');
    let sidecarBefore: string | undefined;
    if (kind === 'manifest') await writeFile(manifest, (await readFile(manifest, 'utf8')) + '\n');
    if (kind === 'sidecar') {
      sidecarBefore = '{"external":"do not overwrite"}\n';
      await writeFile(sidecar, sidecarBefore);
    }
    if (kind === 'computed') await writeFile(s.entry, (await readFile(s.entry, 'utf8')).replace('defaultProps={{', 'defaultProps={getProps({').replace('}}} calculateMetadata', '})} calculateMetadata'));
    else await edit(s.entry, kind === 'theme' ? {brandId:'ember-studio'} : kind === 'unsafe' ? {title:'https://not-allowed.example'} : {title:'Changed'});
    await assert.rejects(writer.flush(), kind === 'manifest' ? /Manifest changed/ : kind === 'sidecar' ? /changed outside/ : kind === 'theme' ? /content props/ : kind === 'unsafe' ? /URLs/ : /Cannot persist/);
    assert.equal(failures.length, 1);
    await assert.rejects(writer.close());
    assert.equal(await readStudioProps(root), sidecarBefore);
    assert.ok((await readdir(path.join(root, '.code-to-video'))).some(n => n.startsWith('unsaved-')));
    assert.equal((await readdir(path.join(root, '.code-to-video'))).includes('preview.lock'), false);
  }));
}

test('saved data rejects schema/hash/unknown compositions/reserved props without evaluating code', async () => fixture(async (root) => {
  const project = await loadProject(root);
  const registry = createProjectRegistry();
  const base = {schemaVersion:1, manifestSHA256:project.manifestRevision, compositions:{TitleCard:{title:'Saved'}}};
  for (const value of [
    {...base, extra:true}, {...base, schemaVersion:2}, {...base, manifestSHA256:'wrong'},
    {...base, compositions:{Unknown:{title:'Saved'}}}, {...base, compositions:{TitleCard:{brandId:'ember-studio'}}},
    {...base, compositions:{TitleCard:{title:'file:///private'}}},
    {...base, compositions:{TitleCard:JSON.parse('{"__proto__":{"bad":true}}')}},
  ]) assert.throws(() => applyStudioProps(project.sourceManifest, project.manifestRevision, JSON.stringify(value), registry));
  await writeFile(path.join(root, 'studio-props.json'), 'not JSON');
  await assert.rejects(loadProject(root), /JSON/);
}));

test('persistence rejects sidecar and control-directory symlinks, including dangling links', async () => fixture(async (root, launch) => {
  await symlink(path.join(root, 'missing.json'), path.join(root, 'studio-props.json'));
  await assert.rejects(loadProject(root), /non-symlink/);
  await rm(path.join(root, 'studio-props.json'));
  await symlink(path.dirname(root), path.join(root, '.code-to-video'), 'dir');
  const s = launch.persistence!;
  await assert.rejects(startProjectPersistence(s.project, s.entry, frameworkRoot, s.registry, () => {}), /symlink/);
}));

test('recovery does not follow a control-directory symlink swapped during preview', async () => fixture(async (root, launch) => {
  const s = launch.persistence!;
  const errors: Error[] = [];
  const writer = await startProjectPersistence(s.project, s.entry, frameworkRoot, s.registry, e => errors.push(e));
  const destination = path.join(root, 'other-directory');
  await mkdir(destination);
  await rename(path.join(root, '.code-to-video'), path.join(root, 'original-control'));
  await symlink(destination, path.join(root, '.code-to-video'), 'dir');
  await edit(s.entry, {title:'Do not write through the symlink'});
  await assert.rejects(writer.flush(), /symlink/);
  await assert.rejects(writer.close(), /symlink/);
  assert.equal(errors.length, 1);
  assert.deepEqual(await readdir(destination), []);
  assert.equal(await readStudioProps(root), undefined);
}));
