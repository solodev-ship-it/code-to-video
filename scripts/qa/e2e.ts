// Isolated source-checkout gate. No registry publication or baseline approval.
import assert from 'node:assert/strict';
import {cp, lstat, mkdir, mkdtemp, readFile, readdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {comparePng, strictComparison} from './compare.ts';
import {verifyPngOutput} from './artifacts.ts';
import {assertProjectRejection, fullGateOutcome, projectFailureKinds} from './e2e-check.ts';
import type {CommandEvidence, ProjectFailureEvidence} from './e2e-check.ts';
import type {QualityReport} from './reports.ts';
import {visualCases} from '../../tests/visual/cases.ts';
import {caseKey} from './cases.ts';

const root=fileURLToPath(new URL('../../',import.meta.url));
const args=process.argv.slice(2);
if(args.length) throw new Error('qa:e2e takes no arguments; every run creates a unique isolated source checkout.');
const parent=path.join(root,'renders/e2e-checks');await mkdir(parent,{recursive:true});
const directory=await mkdtemp(path.join(parent,'e2e-'));
const checkout=path.join(directory,'framework');
const project=path.join(directory,'sample');
const label=path.basename(directory);
const relative=(file:string)=>path.relative(root,file).split(path.sep).join('/');
const hash=(data:Buffer|string)=>createHash('sha256').update(data).digest('hex');
const hashFile=async(file:string)=>hash(await readFile(file));
const report:Record<string,unknown>={schemaVersion:1,status:'failed',technicalStatus:'incomplete',humanReview:'PENDING',aiEnabled:false,
  timestamp:new Date().toISOString(),directory:relative(directory),commands:[],failures:[],
  warnings:['System-font compatibility only; cross-machine pixels and glyph coverage are not certified.','Interactive Studio play/scrub/Save and human visual acceptance are separate.']};
const commands:Record<string,unknown>[]=[];report.commands=commands;
const env:NodeJS.ProcessEnv={...process.env,BROWSER:'none',CODE_TO_VIDEO_PROJECT:''};
async function run(executable:string,arguments_:string[],name:string,cwd=checkout):Promise<CommandEvidence> {
  const log=path.join(directory,`${name}.log`);
  console.log(`${name}: ${executable} ${arguments_.join(' ')}`);
  const result=await new Promise<CommandEvidence>((resolve,reject)=>{
    const child=spawn(executable,arguments_,{cwd,env,stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
    let stdout='',stderr='',timedOut=false;
    const stop=()=>{if(child.pid) {try {if(process.platform!=='win32')process.kill(-child.pid,'SIGKILL');else child.kill('SIGKILL');} catch(error) {if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;}}};
    const timer=setTimeout(()=>{timedOut=true;stop();},20*60*1000);
    const interrupt=()=>stop();process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
    const cleanup=()=>{clearTimeout(timer);process.off('SIGINT',interrupt);process.off('SIGTERM',interrupt);};
    child.stdout.on('data',bytes=>{stdout+=String(bytes);});child.stderr.on('data',bytes=>{stderr+=String(bytes);});
    child.once('error',error=>{cleanup();reject(error);});
    child.once('close',(code,signal)=>{cleanup();resolve({code,signal,stdout,stderr,timedOut});});
  });
  await writeFile(log,`$ ${executable} ${arguments_.join(' ')}\n--- stdout ---\n${result.stdout}\n--- stderr ---\n${result.stderr}\nexit=${result.code} signal=${result.signal} timeout=${result.timedOut}\n`,{flag:'wx'});
  commands.push({name,executable,args:arguments_,cwd,code:result.code,signal:result.signal,timedOut:result.timedOut,log:relative(log)});
  return result;
}
async function success(executable:string,arguments_:string[],name:string,cwd=checkout) {
  const result=await run(executable,arguments_,name,cwd);
  assert.equal(result.code,0,`${name} failed; see ${relative(path.join(directory,name+'.log'))}\n${result.stderr}`);
  assert.equal(result.signal,null);assert.equal(result.timedOut,false);return result.stdout;
}
async function browserPath():Promise<string> {
  if(process.env.REMOTION_BROWSER_EXECUTABLE) {const file=path.resolve(process.env.REMOTION_BROWSER_EXECUTABLE);assert((await lstat(file)).isFile());return file;}
  async function search(folder:string,depth:number):Promise<string|undefined> {
    for(const item of await readdir(folder,{withFileTypes:true}).catch(()=>[])) {
      const file=path.join(folder,item.name);
      if(item.isFile() && ['chrome-headless-shell','chrome-headless-shell.exe'].includes(item.name)) return file;
      if(item.isDirectory() && depth>0) {const found=await search(file,depth-1);if(found)return found;}
    }
    return undefined;
  }
  for(const folder of ['apps/studio/node_modules/.remotion','node_modules/.remotion']) {const file=await search(path.join(root,folder),5);if(file)return file;}
  throw new Error('Provision a browser first with npm run browser:ensure; qa:e2e does not acquire one.');
}
async function staging():Promise<string[]> {return (await readdir(path.join(checkout,'.cache/projects')).catch(()=>[])).sort();}
try {
  const browser=await browserPath();env.REMOTION_BROWSER_EXECUTABLE=browser;
  process.env.REMOTION_BROWSER_EXECUTABLE=browser; // Also used by the imported clean host for still/discovery commands.
  await success('ffmpeg',['-version'],'ffmpeg-version',root);
  await success('ffprobe',['-version'],'ffprobe-version',root);
  const npmVersion=(await success('npm',['--version'],'npm-version',root)).trim();
  assert.match(process.version,/^v24\./,'Use documented Node 24.x');assert.match(npmVersion,/^11\./,'Use npm 11.x');
  const revision=(await success('git',['rev-parse','HEAD'],'revision',root)).trim();
  assert.equal((await success('git',['rev-parse','--show-toplevel'],'git-root',root)).trim(),root.replace(/\/$/,''),'Unexpected Git root');
  const names=(await success('git',['ls-files','--cached','--others','--exclude-standard','-z'],'source-files',root)).split('\0').filter(Boolean).sort();
  const sourceHashes:Record<string,string>={};
  for(const name of names) {
    assert(!path.isAbsolute(name) && !name.split('/').some(p=>['..','.git','node_modules','renders','development-control','video-projects'].includes(p)),'Unsafe snapshot path');
    assert(!/(^|\/)\.env(?:\.|$)|\.(pem|key)$/.test(name),'Secret-like file in source snapshot');
    const source=path.join(root,name);assert((await lstat(source)).isFile(),`Snapshot requires regular source files: ${name}`);
    const destination=path.join(checkout,name);await mkdir(path.dirname(destination),{recursive:true});
    await cp(source,destination,{errorOnExist:true,force:false});sourceHashes[name]=await hashFile(source);
  }
  await writeFile(path.join(directory,'source-hashes.json'),JSON.stringify(sourceHashes,null,2)+'\n',{flag:'wx'});
  const lockHash=sourceHashes['package-lock.json'];assert(lockHash);
  report.provenance={revision,sourceSnapshotSha256:hash(JSON.stringify(sourceHashes)),lockSha256:lockHash,node:process.version,npm:npmVersion,
    os:{platform:os.platform(),release:os.release(),arch:os.arch()},browserExecutable:browser,
    browserSha256:await hashFile(browser),browserVersion:(await success(browser,['--version'],'browser-version',root)).trim(),
    stillSettings:{gl:'swangle',scale:1,deviceScaleFactor:1,format:'png'},videoSettings:{codec:'h264',pixelFormat:'yuv420p',concurrency:1,parallelEncoding:false}};
  assert(!existsSync(path.join(checkout,'node_modules')),'Install must start without dependencies');
  await success('npm',['ci','--prefer-offline','--no-audit','--no-fund'],'clean-install');
  assert.equal(await hashFile(path.join(checkout,'package-lock.json')),lockHash,'Install changed lockfile');
  await success('npm',['run','check'],'clean-check');
  await success('npm',['run','build:cli'],'build-cli');
  const bin=path.join(checkout,'bin/code-to-video.mjs');
  await success(process.execPath,[bin,'create',project,'--template','title-card','--id','EndToEndSample'],'create',directory);
  const manifestFile=path.join(project,'code-to-video.project.json');
  const scene=path.join(project,'compositions/TitleCard.tsx');
  const before={manifestSha256:await hashFile(manifestFile),sourceSha256:await hashFile(scene)};
  const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
  manifest.compositions[0].props.title='Local production check';
  manifest.compositions[0].props.subtitle='Edited outside the framework. No AI services required.';
  await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
  const source=await readFile(scene,'utf8');assert.equal(source.split('width:96').length,2,'Expected scene-local accent');
  await writeFile(scene,source.replace('width:96','width:160'));
  const after={manifestSha256:await hashFile(manifestFile),sourceSha256:await hashFile(scene)};
  assert.notEqual(before.manifestSha256,after.manifestSha256);assert.notEqual(before.sourceSha256,after.sourceSha256);
  report.project={root:relative(project),before,after,manifest};
  await success(path.join(checkout,'node_modules/.bin/tsc'),['-p',path.join(project,'tsconfig.json')],'project-typecheck');
  const video=path.join(project,'outputs/EndToEndSample.mp4');
  await success(process.execPath,[bin,'render','.','TitleCard','--output','outputs/EndToEndSample.mp4'],'sample-render',project);
  const probe=JSON.parse(await success('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-show_entries','format=duration,size','-of','json',video],'sample-probe'));
  assert.equal(probe.streams.length,1);const stream=probe.streams[0];
  assert.deepEqual([stream.codec_name,stream.width,stream.height,stream.r_frame_rate,stream.nb_read_frames],['h264',manifest.width,manifest.height,`${manifest.fps}/1`,String(manifest.compositions[0].durationInFrames)]);
  assert.equal(Number(probe.format.duration),manifest.compositions[0].durationInFrames/manifest.fps);assert(Number(probe.format.size)>0);
  await success('ffmpeg',['-v','error','-i',video,'-f','null','-'],'sample-decode');
  report.video={file:relative(video),sha256:await hashFile(video),metadata:probe,fullDecode:true};
  const host=await import(pathToFileURL(path.join(checkout,'scripts/project-host.ts')).href) as typeof import('../project-host.ts');
  const launch=await host.prepareProjectCommand({frameworkRoot:checkout,projectRoot:project,mode:'compositions',args:[]});
  await success(launch.executable,launch.args,'project-discovery',launch.cwd);
  const frames:Record<string,string>={};
  for(const [name,frame] of [['entry',15],['settled',90],['repeat',90]] as const) {
    const file=path.join(directory,`${name}.png`);frames[name]=file;
    await success(launch.executable,['still',...launch.args.slice(1),'TitleCard',file,`--frame=${frame}`,'--image-format=png','--gl=swangle','--scale=1','--overwrite=false'],`sample-${name}`,launch.cwd);
    await verifyPngOutput(file,manifest.width,manifest.height);
  }
  const repeated=comparePng(await readFile(frames.settled!),await readFile(frames.repeat!),strictComparison).metrics;
  const motion=comparePng(await readFile(frames.entry!),await readFile(frames.settled!),strictComparison).metrics;
  assert.equal(repeated.status,'passed');assert.equal(repeated.differingPixels,0);
  assert(motion.differingPixels!==null && motion.differingPixels>0,'Entry and settled frame must differ');
  report.frames={files:Object.fromEntries(Object.entries(frames).map(([k,v])=>[k,relative(v)])),repeated,motion,
    hashes:Object.fromEntries(await Promise.all(Object.entries(frames).map(async([k,v])=>[k,await hashFile(v)])))};
  const failures:ProjectFailureEvidence[]=[];report.failures=failures;
  for(const kind of projectFailureKinds) {
    const negative=path.join(directory,kind);await cp(project,negative,{recursive:true,errorOnExist:true,force:false,filter:file=>path.basename(file)!=='outputs'});
    const file=path.join(negative,'code-to-video.project.json');const data=structuredClone(manifest);
    if(kind==='missing-asset')data.assets=[{id:'MissingAsset',path:'assets/missing.png',type:'image'}];
    if(kind==='invalid-manifest')data.schemaVersion=999;
    if(kind==='incompatible-framework')data.framework.version='99.0.0';
    await writeFile(file,JSON.stringify(data,null,2)+'\n');
    const compositionId=kind==='unknown-composition'?'NotRegistered':'TitleCard';const beforeStaging=await staging();
    const result=await run(process.execPath,[bin,'render','.',compositionId,'--output','outputs/rejected.mp4'],kind,negative);
    const evidence:ProjectFailureEvidence={...result,kind,compositionId,outputExists:existsSync(path.join(negative,'outputs/rejected.mp4')),
      newStagingDirectories:(await staging()).filter(name=>!beforeStaging.includes(name)),manifestSha256:await hashFile(file),sourceSha256:await hashFile(path.join(negative,'compositions/TitleCard.tsx'))};
    failures.push(evidence);assertProjectRejection(evidence,kind,manifest.framework.version);
    console.log(`PASS — expected rejection ${kind}`);
  }
  report.technicalStatus='passed';
  const full=await run('npm',['run','qa:all','--','--run',label],'full-gate');
  const reports=path.join(checkout,'tests/visual/reports');
  const comparisons=(await readdir(reports)).filter(name=>name.startsWith(`${label}-visual-compare-`) && name.endsWith('.json'));
  assert.equal(comparisons.length,1,'Full gate did not produce exactly one comparison report; inspect full-gate.log');
  const comparisonFile=path.join(reports,comparisons[0]!);
  const comparison=JSON.parse(await readFile(comparisonFile,'utf8')) as QualityReport;
  const outcome=fullGateOutcome(full,comparison,label,visualCases.map(caseKey));
  report.fullGate={status:outcome,code:full.code,comparison:relative(comparisonFile),missingBaselines:comparison.cases.filter(c=>c.error?.code==='MISSING_BASELINE').length};
  for(const [name,digest] of Object.entries(sourceHashes)) assert.equal(await hashFile(path.join(checkout,name)),digest,`Framework source changed during gate: ${name}`);
  report.frameworkSourceUnchanged=true;
  report.status=outcome;
  if(outcome==='blocked') {process.exitCode=1;console.error('BLOCKED: standalone technical checks passed; full gate has unapproved visual references. No baseline was approved.');}
  else console.log('PASS: standalone and aggregate technical gates passed; human review is still required.');
} catch(error) {
  report.status='failed';report.error={message:String(error),stack:error instanceof Error?error.stack:undefined};
  console.error(error);process.exitCode=1;
} finally {
  await writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(`Evidence and review sample: ${relative(directory)}`);
}
