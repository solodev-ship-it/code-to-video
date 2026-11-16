// Host-only: translate Studio's literal defaultProps into validated project data.
import {watchFile, unwatchFile} from 'node:fs';
import {open, mkdir, lstat, readFile, writeFile, rename, unlink, realpath} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {isDeepStrictEqual} from 'node:util';
import {containedFile} from '../packages/projects/src/load.ts';
import type {loadProject} from '../packages/projects/src/load.ts';
import {applyStudioProps, manifestHash, readStudioProps, studioPropsName} from '../packages/projects/src/studio-props.ts';
import type {ThemeRegistry} from '../packages/themes/src/index.ts';

type Project = Awaited<ReturnType<typeof loadProject>>;
export async function startProjectPersistence(project: Project, entry: string, frameworkRoot: string, registry: ThemeRegistry, onError: (error: Error) => void) {
  const directory = path.join(project.root, '.code-to-video');
  await mkdir(directory, {recursive:true});
  async function checkDirectory() {
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink() || await realpath(project.root) !== project.root) throw new Error('Persistence directory/root must not be a symlink');
  }
  await checkDirectory();
  const lock = path.join(directory, 'preview.lock');
  const token = randomUUID();
  let handle;
  try {handle = await open(lock, 'wx');}
  catch (error) {throw new Error(`Cannot lock project preview (${lock}). Stop the other preview first; if stale, inspect its PID before manually removing the lock.`, {cause:error});}
  try {await handle.writeFile(JSON.stringify({pid:process.pid, token}) + '\n');}
  catch (error) {await unlink(lock);throw error;}
  finally {await handle.close();}
  const require = createRequire(path.join(frameworkRoot, 'package.json'));
  let parser: (source: string, id: string) => {canUpdate:boolean; reason?:string; currentDefaultProps?:Record<string,unknown>};
  let lastSaved: string | undefined;
  let initialEntry: string;
  try {
    parser = require('@remotion/codemods').CodemodsInternals.computeCanUpdateDefaultPropsFromContent;
    lastSaved = await readStudioProps(project.root);
    // Refuse changes between load and acquiring the writer lock.
    const current = applyStudioProps(project.sourceManifest, project.manifestRevision, lastSaved, registry);
    if (!isDeepStrictEqual(current, project.manifest)) throw new Error('Saved props changed during preview setup; restart preview');
    initialEntry = await readFile(entry, 'utf8');
  } catch (error) {await checkDirectory();await unlink(lock);throw error;}
  let lastEntry = initialEntry;
  let failure: Error | undefined;
  let queue = Promise.resolve();
  let closed = false;
  async function sync() {
    if (failure) throw failure;
    const content = await readFile(entry, 'utf8');
    if (content === lastEntry) return;
    await checkDirectory();
    const sourceFile = await containedFile(project.root, 'code-to-video.project.json');
    if (manifestHash(await readFile(sourceFile, 'utf8')) !== project.manifestRevision) throw new Error('Manifest changed while Studio was open; persistence stopped to avoid stale overrides');
    const compositions: Record<string,unknown> = {};
    for (const c of project.manifest.compositions) {
      const result = parser(content, c.id);
      if (!result.canUpdate || !result.currentDefaultProps) throw new Error(`Cannot persist ${c.id}: ${result.reason ?? 'literal defaultProps required'}`);
      const {assets, brandId, styleId, motionId, ...props} = result.currentDefaultProps;
      const expectedAssets = Object.fromEntries(project.manifest.assets.map(a => [a.id, `project-assets/${a.path}`]));
      if (!isDeepStrictEqual(assets, expectedAssets) || brandId !== project.manifest.theme.brandId ||
          styleId !== project.manifest.theme.styleId || motionId !== project.manifest.theme.motionId) {
        throw new Error('Persist only content props in Studio; change theme/assets in the manifest, then restart');
      }
      compositions[c.id] = props;
    }
    const next = JSON.stringify({schemaVersion:1, manifestSHA256:project.manifestRevision, compositions}, null, 2) + '\n';
    applyStudioProps(project.sourceManifest, project.manifestRevision, next, registry);
    if (await readStudioProps(project.root) !== lastSaved) throw new Error('studio-props.json changed outside this preview; refusing to overwrite');
    if (next === lastSaved) {lastEntry = content;return;}
    // Every revision is recoverable. Cooperative previews serialize with the lock;
    // external editors do not honor that lock, so recheck immediately before rename.
    if (lastSaved !== undefined) await writeFile(path.join(directory, `props-backup-${randomUUID()}.json`), lastSaved, {flag:'wx'});
    const temporary = path.join(project.root, `.studio-props-${randomUUID()}.tmp`);
    try {
      const file = await open(temporary, 'wx');
      try {await file.writeFile(next);await file.sync();} finally {await file.close();}
      if (await readStudioProps(project.root) !== lastSaved) throw new Error('studio-props.json conflict before commit; refusing to overwrite');
      if (manifestHash(await readFile(await containedFile(project.root, 'code-to-video.project.json'), 'utf8')) !== project.manifestRevision) throw new Error('Manifest conflict before commit; refusing to save stale props');
      await checkDirectory();
      await rename(temporary, path.join(project.root, studioPropsName));
    } finally {
      try {await unlink(temporary);} catch (error) {if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;}
    }
    lastSaved = next;lastEntry = content;
    console.log(`Project props saved: ${path.join(project.root, studioPropsName)}`);
  }
  function schedule(): Promise<void> {
    queue = queue.then(sync).catch(async error => {
      if (!failure) {
        failure = error instanceof Error ? error : new Error(String(error));
        // Retain the user's last Studio source when persistence fails.
        try {await checkDirectory();await writeFile(path.join(directory, `unsaved-${randomUUID()}.tsx`), await readFile(entry), {flag:'wx'});}
        catch (backupError) {console.error('Could not preserve unsaved entry:', backupError);}
        onError(failure);
      }
    });
    return queue;
  }
  const listener = () => {if (!closed) void schedule();};
  watchFile(entry, {interval:100, persistent:false}, listener);
  return {
    async flush() {await schedule();if (failure) throw failure;},
    async close() {
      if (closed) {await queue;if (failure) throw failure;return;}
      closed = true;unwatchFile(entry, listener);
      try {await schedule();if (failure) throw failure;}
      finally {
        await checkDirectory();
        const current = JSON.parse(await readFile(lock, 'utf8'));
        if (current.token !== token) throw new Error('Preview lock ownership changed; refusing to remove it');
        await unlink(lock);
      }
    },
  };
}
