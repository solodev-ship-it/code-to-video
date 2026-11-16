import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, realpath, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {createProject} from '../../scripts/cli/create.ts';
import {prepareProjectCommand} from '../../scripts/project-host.ts';

const frameworkRoot = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const server = path.dirname(require.resolve('@remotion/studio-server/package.json'));
const {computeCanUpdateDefaultProps} = require(path.join(server, 'dist/preview-server/routes/can-update-default-props.js'));
const {updateDefaultPropsHandler} = require(path.join(server, 'dist/preview-server/routes/update-default-props.js'));
const {createFileWatcherRegistry, setFileWatcherRegistry} = require(path.join(server, 'dist/file-watcher.js'));
const renderer = require.resolve('@remotion/renderer');

test('preview host permits real Studio Save, preserves sources and resets on new session', async () => {
  const temporary = await realpath(await mkdtemp(path.join(tmpdir(), 'ctv-studio-save-')));
  const sessions = new Set<string>();
  const resetRegistry = setFileWatcherRegistry(createFileWatcherRegistry());
  try {
    const project = await createProject({
      directory:path.join(temporary, 'project'), template:'title-card',
      brandId:'aurora-finance', styleId:'cinematic', motionId:'elegant',
    }, frameworkRoot);
    const manifestFile = path.join(project.root, 'code-to-video.project.json');
    const sceneFile = path.join(project.root, 'compositions/TitleCard.tsx');
    const manifestBefore = await readFile(manifestFile, 'utf8');
    const sceneBefore = await readFile(sceneFile, 'utf8');
    const launch = await prepareProjectCommand({frameworkRoot, projectRoot:project.root, mode:'studio', args:[]});
    const entry = launch.args[1]!;
    sessions.add(path.dirname(entry));
    // Use the CLI's actual cwd-to-root discovery, not an invented test root.
    const discovery = spawnSync(process.execPath, ['-e',
      `process.stdout.write(require(${JSON.stringify(renderer)}).RenderInternals.findRemotionRoot())`,
    ], {cwd:launch.cwd, encoding:'utf8'});
    assert.equal(discovery.status, 0, discovery.stderr);
    const remotionRoot = discovery.stdout;
    const symbolicatedStack = {originalFileName:path.relative(remotionRoot, entry)};
    const request = {compositionId:'TitleCard', symbolicatedStack, remotionRoot, entryPoint:entry};
    const canSave = await computeCanUpdateDefaultProps(request);
    assert.equal(canSave.result.canUpdate, true, canSave.result.reason);
    const changed = {...canSave.result.currentDefaultProps, title:'Saved in this session'};
    const saved = await updateDefaultPropsHandler({
      remotionRoot, entryPoint:entry, logLevel:'error',
      input:{compositionId:'TitleCard', symbolicatedStack, defaultProps:JSON.stringify(changed), enumPaths:[]},
    });
    assert.equal(saved.success, true, saved.reason);
    assert.match(await readFile(entry, 'utf8'), /Saved in this session/);
    const after = await computeCanUpdateDefaultProps(request);
    assert.deepEqual(after.result.currentDefaultProps, changed);
    assert.equal(await readFile(manifestFile, 'utf8'), manifestBefore);
    assert.equal(await readFile(sceneFile, 'utf8'), sceneBefore);
    // A symbolicated location outside the actual Studio root must still fail.
    const rejected = await computeCanUpdateDefaultProps({...request,
      symbolicatedStack:{originalFileName:path.relative(remotionRoot, sceneFile)},
    });
    assert.equal(rejected.result.canUpdate, false);
    assert.match(rejected.result.reason, /outside the project/);
    const rejectedSave = await updateDefaultPropsHandler({
      remotionRoot, entryPoint:entry, logLevel:'error',
      input:{compositionId:'TitleCard', symbolicatedStack:{originalFileName:path.relative(remotionRoot, sceneFile)},
        defaultProps:JSON.stringify(changed), enumPaths:[]},
    });
    assert.equal(rejectedSave.success, false);
    assert.match(rejectedSave.reason, /outside the project/);
    assert.equal(await readFile(sceneFile, 'utf8'), sceneBefore);
    const restart = await prepareProjectCommand({frameworkRoot, projectRoot:project.root, mode:'studio', args:[]});
    const nextEntry = restart.args[1]!;
    sessions.add(path.dirname(nextEntry));
    assert.notEqual(nextEntry, entry);
    const fresh = await computeCanUpdateDefaultProps({...request, entryPoint:nextEntry,
      symbolicatedStack:{originalFileName:path.relative(remotionRoot, nextEntry)},
    });
    assert.equal(fresh.result.canUpdate, true, fresh.result.reason);
    assert.deepEqual(fresh.result.currentDefaultProps, canSave.result.currentDefaultProps);
  } finally {
    resetRegistry();
    for (const session of sessions) await rm(session, {recursive:true, force:true});
    await rm(temporary, {recursive:true, force:true});
  }
});
