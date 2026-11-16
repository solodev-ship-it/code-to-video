// Focused installed-candidate persistence gate; no publication or baseline changes.
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, mkdir, realpath} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {spawn, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:net';

assert.ok(process.argv.length === 3 || (process.argv.length === 4 && ['--probe-runtime','--hosted'].includes(process.argv[3]!)), 'Pass local candidate report.json [--probe-runtime|--hosted]');
const hosted = process.argv[3] === '--hosted';
const runtimeProbe = process.argv[3] === '--probe-runtime';
const candidate = JSON.parse(await readFile(path.resolve(process.argv[2]!), 'utf8'));
assert.equal(candidate.status, 'prepared');
if (hosted) candidate.archive = path.join(path.dirname(path.resolve(process.argv[2]!)), path.basename(candidate.archive.replaceAll('\\','/')));
assert.equal(createHash('sha256').update(await readFile(candidate.archive)).digest('hex'), candidate.sha256);
const directory = await mkdtemp(path.join(path.dirname(path.resolve(process.argv[2]!)), 'persistence-check-'));
const consumer = await realpath(await mkdtemp(path.join(os.tmpdir(), 'ctv-persistent-consumer-')));
const commands: unknown[] = [];
const report: Record<string,unknown> = {status:'failed', candidateSHA256:candidate.sha256, directory, consumer, commands, node:process.version, manualReview:'PENDING',
   platform:process.platform, arch:process.arch, hosted, runtimeProbe, scope:runtimeProbe ? 'Experimental installed internal CLI main; public binary support unchanged' : 'Supported installed public CLI binary'};
const env: NodeJS.ProcessEnv = {...process.env, NODE_PATH:'', BROWSER:'none'};
if (!hosted) assert.ok(env.REMOTION_BROWSER_EXECUTABLE, 'Provide an existing browser; local gate never downloads one');
function run(executable: string, args: string[], name: string, cwd = consumer) {
  const mediaBinary = /^ff(?:mpeg|probe)(?:\.exe)?$/.test(path.basename(executable));
  const result = spawnSync(executable, args, {cwd:mediaBinary ? path.dirname(executable) : cwd, env:mediaBinary && process.platform === 'darwin' ? {...env,DYLD_LIBRARY_PATH:path.dirname(executable)} : env, encoding:'utf8', timeout:240000, maxBuffer:8*1024*1024});
  commands.push({name, executable, args, code:result.status, signal:result.signal, error:result.error?.message, output:(result.stdout ?? '') + (result.stderr ?? '')});
  assert.ifError(result.error);assert.equal(result.status, 0, `${name}: ${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
const servers: {child:ReturnType<typeof spawn>; exited:Promise<void>; log:()=>string; stop:()=>Promise<void>}[] = [];
try {
  await writeFile(path.join(consumer, 'package.json'), '{"name":"persistence-consumer","private":true}\n');
  assert.ok(process.env.npm_execpath, 'Run through npm so the npm CLI is known on Windows');
  run(process.execPath, [process.env.npm_execpath,'install',...(hosted ? ['--prefer-offline'] : ['--offline']),'--omit=dev','--no-audit','--no-fund',candidate.archive], 'candidate install');
  const engine = path.join(consumer, 'node_modules', candidate.manifest.name);
  const require = createRequire(path.join(engine, 'package.json'));
  const renderer = require('@remotion/renderer');
  if (hosted) {
    // Explicit setup before preview/render, never acquire a browser during frames.
    const browser = await renderer.ensureBrowser({logLevel:'info'});
    assert.ok(browser.type === 'local-puppeteer-browser' || browser.type === 'user-defined-path');
    env.REMOTION_BROWSER_EXECUTABLE = browser.path;
  }
  const executable = (type:'ffmpeg'|'ffprobe') => renderer.RenderInternals.getExecutablePath({type,indent:false,logLevel:'error',binariesDirectory:null});
  const installed = JSON.parse(await readFile(path.join(engine,'package.json'),'utf8'));
  assert.equal(installed.version,candidate.manifest.version);
  assert.equal(installed.name,candidate.manifest.name);
  report.installed = {name:installed.name, version:installed.version};
  await writeFile(path.join(directory,'consumer-package-lock.json'), await readFile(path.join(consumer,'package-lock.json')), {flag:'wx'});
  let bin = path.join(engine, 'bin/code-to-video.mjs');
  if (runtimeProbe) {
    // Deliberately qualify internal APIs without disabling the user-facing guard.
    // This driver is QA-owned and outside the installed package, never shipped.
    const guarded = spawnSync(process.execPath, [bin,'create',path.join(consumer,'guarded-must-not-exist')], {cwd:consumer, env, encoding:'utf8'});
    assert.equal(guarded.status, 1);
    assert.match(guarded.stderr, /Unsupported runtime/);
    commands.push({name:'public binary retains unsupported-runtime rejection',code:guarded.status,output:guarded.stderr,expectedFailure:true});
    bin = path.join(consumer, 'experimental-cli-driver.mjs');
    await writeFile(bin, `import {main} from ${JSON.stringify(pathToFileURL(path.join(engine,'dist/scripts/cli.js')).href)};\nprocess.exitCode = await main(process.argv.slice(2), ${JSON.stringify(engine)});\n`, {flag:'wx'});
  }
  const project = path.join(consumer, 'sample');
  if (runtimeProbe) {
    run(process.execPath, [bin,'doctor'], 'experimental installed doctor');
    run(process.execPath, [bin,'create',project], 'experimental installed create');
  } else {
    const doctor = JSON.parse(run(process.execPath, [process.env.npm_execpath!,'exec','--offline','--','code-to-video','doctor'], 'installed npm exec doctor'));
    assert.equal(doctor.nodeSupported, true);
    assert.equal(doctor.npmSupported, true);
    assert.equal(doctor.node, process.version);
    report.doctor = doctor;
    assert.equal(run(process.execPath, [process.env.npm_execpath!,'exec','--offline','--','code-to-video','--version'], 'installed npm exec version').trim(), candidate.manifest.version);
    run(process.execPath, [process.env.npm_execpath!,'exec','--offline','--','code-to-video','create',project], 'installed npm exec create');
  }
  run(process.execPath, [require.resolve('typescript/bin/tsc'),'-p',path.join(project,'tsconfig.json')], 'installed project typecheck');
  const manifestFile = path.join(project, 'code-to-video.project.json');
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  manifest.width = 1280;manifest.height = 720;manifest.compositions[0].durationInFrames = 60;
  await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  assert.equal(manifest.framework.version,candidate.manifest.version);
  // Existing schema1/0.1.0 projects must still load on the new engine.
  manifest.framework.version = '0.1.0';
  await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  const manifestBefore = await readFile(manifestFile, 'utf8');
  const sceneFile = path.join(project, 'compositions/TitleCard.tsx');
  const sceneBefore = await readFile(sceneFile, 'utf8');
  const server = createServer();
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();assert.ok(address && typeof address !== 'string');
  const port = address.port;
  await new Promise<void>((resolve,reject) => server.close(error => error ? reject(error) : resolve()));
  async function preview() {
    const child = spawn(process.execPath, [bin, 'preview', project, '--port', String(port)], {cwd:consumer, env, stdio:['ignore','pipe','pipe']});
    let output = '';
    let resolveReady!: (entry:string)=>void;
    let rejectReady!: (error:Error)=>void;
    let entry: string | undefined;
    const ready = new Promise<string>((resolve,reject) => {resolveReady=resolve;rejectReady=reject;});
    const timer = setTimeout(() => {child.kill('SIGTERM');rejectReady(new Error(`Studio timeout:\n${output}`));}, 60000);
    const consume = (chunk: Buffer) => {
      output += chunk.toString();
      entry ??= /generated entry ([^\r\n]+)/.exec(output)?.[1];
      if (entry && output.includes('Server ready')) {clearTimeout(timer);resolveReady(entry);}
    };
    child.stdout.on('data', consume);child.stderr.on('data', consume);
    const exited = new Promise<void>((resolve,reject) => {
      child.once('error', error => {clearTimeout(timer);rejectReady(error);reject(error);});
      child.once('exit', (code,signal) => {
        clearTimeout(timer);
        if (!entry || !output.includes('Server ready')) rejectReady(new Error(`Studio exited early (${code}/${signal}): ${output}`));
        resolve();
      });
    });
    const instance = {child, exited, log:()=>output, stop:async () => {
      if (child.exitCode === null && child.signalCode === null) {
        if (output.includes('Server ready')) {
          const response = await fetch(`http://localhost:${port}/api/shutdown-studio`, {method:'POST',headers:{'Content-Type':'application/json',Origin:`http://localhost:${port}`},body:'{}',signal:AbortSignal.timeout(10000)});
          assert.equal(response.status,200);
        } else child.kill('SIGTERM');
      }
      let timeout:ReturnType<typeof setTimeout>|undefined;
      try {await Promise.race([exited,new Promise<never>((_,reject) => {timeout=setTimeout(() => {child.kill('SIGKILL');reject(new Error('Preview did not stop gracefully'));},20000);})]);}
      finally {clearTimeout(timeout);}
    }};
    servers.push(instance);
    const file = await ready;
    const response = await fetch(`http://localhost:${port}`);
    assert.equal(response.status, 200);
    return {file, instance};
  }
  const first = await preview();
  const {CodemodsInternals} = require('@remotion/codemods');
  const extract = async (file:string) => CodemodsInternals.computeCanUpdateDefaultPropsFromContent(await readFile(file,'utf8'), 'TitleCard');
  const original = await extract(first.file);assert.equal(original.canUpdate, true);
  const props = {...original.currentDefaultProps, title:'Persistent installed title'};
  const response = await fetch(`http://localhost:${port}/api/update-default-props`, {
    method:'POST', headers:{'Content-Type':'application/json', Origin:`http://localhost:${port}`},
    body:JSON.stringify({compositionId:'TitleCard', defaultProps:JSON.stringify(props), enumPaths:[],
      symbolicatedStack:{originalFileName:path.relative(path.join(engine,'apps/studio'), first.file)}}),
  });
  assert.equal(response.status, 200);
  const body = await response.json() as {success:boolean; data:{success:boolean;reason?:string}};
  assert.equal(body.success, true);assert.equal(body.data.success, true, body.data.reason);
  assert.equal((await extract(first.file)).currentDefaultProps.title, props.title);
  // Stop immediately: host must flush even if polling has not observed the edit.
  await first.instance.stop();
  const saved = JSON.parse(await readFile(path.join(project,'studio-props.json'), 'utf8'));
  assert.equal(saved.compositions.TitleCard.title, props.title);
  assert.equal(await readFile(manifestFile,'utf8'), manifestBefore);
  assert.equal(await readFile(sceneFile,'utf8'), sceneBefore);
  const second = await preview();
  assert.notEqual(second.file, first.file);
  assert.equal((await extract(second.file)).currentDefaultProps.title, props.title);
  await second.instance.stop();
  const {prepareProjectCommand} = await import(pathToFileURL(path.join(engine, 'dist/scripts/project-host.js')).href);
  const output = path.join(directory, 'persistent.mp4');
  const prepared = await prepareProjectCommand({frameworkRoot:engine, projectRoot:project, mode:'render', args:['TitleCard',output], allowExternalOutput:true});
  assert.equal((await extract(prepared.args[1])).currentDefaultProps.title, props.title);
  run(process.execPath, [bin,'render',project,'TitleCard','--output',output], 'installed render saved props');
  const probe = JSON.parse(run(executable('ffprobe'),['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_read_frames,r_frame_rate','-of','json',output], 'probe'));
  assert.equal(probe.streams[0].codec_name, 'h264');
  assert.equal(probe.streams[0].nb_read_frames, '60');
  assert.equal(probe.streams[0].width, 1280);assert.equal(probe.streams[0].height, 720);
  assert.equal(probe.streams[0].r_frame_rate, '30/1');
  run(executable('ffmpeg'),['-v','error','-i',output,'-c:v','rawvideo','-f','null','-'], 'full decode');
  Object.assign(report, {status:'passed', checks:['HTTP Save', 'graceful stop flush', 'project sidecar', 'source preservation', 'actual restart reuses title', 'render entry reuses title', 'MP460 frames1280x720', 'full decode'], output, probe});
} finally {
  for (const instance of servers) {try {await instance.stop();} catch (error) {report.cleanupError=String(error);process.exitCode=1;}}
  report.serverLogs = servers.map(s => s.log());
  await mkdir(directory, {recursive:true});
  await writeFile(path.join(directory, 'report.json'), JSON.stringify(report,null,2) + '\n');
  console.log(`Persistence evidence: ${path.join(directory, 'report.json')}`);
}
