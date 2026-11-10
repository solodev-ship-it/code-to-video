// Local tarball consumer smoke; never publishes, tags, or approves visual references.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,cp,rm,lstat,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {prepareProjectCommand} from '../project-host.ts';
import {comparePng,strictComparison} from './compare.ts';
import {verifyPngOutput} from './artifacts.ts';

const root=fileURLToPath(new URL('../../',import.meta.url));
const args=process.argv.slice(2);assert.equal(args.length,1,'Usage: npm run qa:package -- /absolute/path/to/candidate/report.json');
const candidate=JSON.parse(await readFile(path.resolve(args[0]!),'utf8'));
assert.equal(candidate.status,'prepared');assert.equal(candidate.private,true);
const hash=async(file:string)=>createHash('sha256').update(await readFile(file)).digest('hex');
assert.equal(await hash(candidate.archive),candidate.sha256,'Archive changed after preparation');
const directory=await mkdtemp(path.join(path.dirname(path.resolve(args[0]!)),'consumer-check-'));
// Outside the framework so a broken package cannot fall back to workspace deps.
const consumer=await mkdtemp(path.join(os.tmpdir(),'ctv-installed-consumer-'));
const report:Record<string,unknown>={schemaVersion:1,status:'failed',releaseReady:false,humanReview:'PENDING',candidateSha256:candidate.sha256,
  node:process.version,platform:os.platform(),arch:os.arch(),commands:[]};
const commands:Record<string,unknown>[]=[];report.commands=commands;
const env:NodeJS.ProcessEnv={...process.env,NODE_PATH:'',CODE_TO_VIDEO_PROJECT:'',BROWSER:'none'};
function run(executable:string,arguments_:string[],name:string,cwd=consumer):string {
  console.log(`${name}…`);
  const result=spawnSync(executable,arguments_,{cwd,env,encoding:'utf8',timeout:300000,maxBuffer:8*1024*1024});
  commands.push({name,executable,args:arguments_,code:result.status,signal:result.signal,error:result.error?.message});
  const output=(result.stdout??'')+'\n'+(result.stderr??'');
  // Writes are awaited separately; all stdout/stderr are also preserved in report.
  commands.at(-1)!.output=output;
  assert.ifError(result.error);assert.equal(result.status,0,`${name} failed:\n${output}`);assert.equal(result.signal,null);
  return result.stdout;
}
async function browserPath():Promise<string>{
  if(process.env.REMOTION_BROWSER_EXECUTABLE)return path.resolve(process.env.REMOTION_BROWSER_EXECUTABLE);
  async function search(folder:string,depth:number):Promise<string|undefined>{
    for(const item of await readdir(folder,{withFileTypes:true}).catch(()=>[])){
      const file=path.join(folder,item.name);if(item.isFile()&&item.name==='chrome-headless-shell')return file;
      if(item.isDirectory()&&depth>0){const found=await search(file,depth-1);if(found)return found;}
    }return undefined;
  }
  for(const folder of ['apps/studio/node_modules/.remotion','node_modules/.remotion']){const found=await search(path.join(root,folder),5);if(found)return found;}
  throw new Error('Provision a browser before qa:package; it does not download one.');
}
try {
  const browser=await browserPath();assert((await lstat(browser)).isFile());env.REMOTION_BROWSER_EXECUTABLE=browser;process.env.REMOTION_BROWSER_EXECUTABLE=browser;
  report.browserSha256=await hash(browser);report.browserVersion=run(browser,['--version'],'browser-version');
  for(const [name,digest] of Object.entries(candidate.sourceFiles) as [string,string][])assert.equal(await hash(path.join(root,name)),digest,`Candidate source changed: ${name}`);
  await writeFile(path.join(consumer,'package.json'),JSON.stringify({name:'ctv-local-consumer',private:true,type:'module'}),{flag:'wx'});
  assert(!existsSync(path.join(consumer,'node_modules')));
  run('npm',['install','--omit=dev','--prefer-offline','--no-audit','--no-fund',candidate.archive],'clean-consumer-install');
  const installed=path.join(consumer,'node_modules/code-to-video');
  const metadata=JSON.parse(await readFile(path.join(installed,'package.json'),'utf8'));assert.equal(metadata.private,true);assert(!metadata.workspaces);
  assert(!existsSync(path.join(consumer,'node_modules/@code-to-video')),'Unpublished first-party package fetched');
  await writeFile(path.join(directory,'installed-package.json'),JSON.stringify(metadata,null,2)+'\n',{flag:'wx'});
  const bin=path.join(consumer,'node_modules/.bin/code-to-video');
  run(bin,['--help'],'installed-help');
  const project=path.join(consumer,'sample');run(bin,['create',project,'--template','title-card','--id','InstalledSample'],'installed-create');
  await cp(project,path.join(directory,'sample-source'),{recursive:true,errorOnExist:true,force:false});
  run(path.join(consumer,'node_modules/.bin/tsc'),['-p',path.join(project,'tsconfig.json')],'installed-project-typecheck');
  const video=path.join(directory,'InstalledSample.mp4');run(bin,['render',project,'TitleCard','--output',video],'installed-render');
  const probe=JSON.parse(run('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-show_entries','format=duration,size','-of','json',video],'installed-probe'));
  const stream=probe.streams[0];assert.deepEqual([stream.codec_name,stream.width,stream.height,stream.r_frame_rate,stream.nb_read_frames],['h264',1920,1080,'30/1','180']);
  assert.equal(Number(probe.format.duration),6);assert(Number(probe.format.size)>0);
  run('ffmpeg',['-v','error','-i',video,'-f','null','-'],'installed-full-decode');report.video={file:video,sha256:await hash(video),metadata:probe,fullDecode:true};
  const frames:Record<string,string>={};
  for(const [name,frameworkRoot] of [['source',root],['installed',installed],['repeat',installed]] as const){
    const launch=await prepareProjectCommand({frameworkRoot,projectRoot:project,mode:'compositions',args:[]});
    if(name==='installed')run(launch.executable,launch.args,'installed-discovery',launch.cwd);
    const frame=path.join(directory,`${name}-f90.png`);frames[name]=frame;
    run(launch.executable,['still',...launch.args.slice(1),'TitleCard',frame,'--frame=90','--image-format=png','--gl=swangle','--scale=1','--overwrite=false'],`${name}-still`,launch.cwd);
    await verifyPngOutput(frame,1920,1080);
  }
  const sourceToInstalled=comparePng(await readFile(frames.source!),await readFile(frames.installed!),strictComparison).metrics;
  const repeated=comparePng(await readFile(frames.installed!),await readFile(frames.repeat!),strictComparison).metrics;
  assert.equal(sourceToInstalled.differingPixels,0);assert.equal(repeated.differingPixels,0);
  report.frames={files:frames,sourceToInstalled,repeated};
  report.status='passed';console.log('PASS: private tarball installs without workspaces, renders/decodes, matches source pixels and repeats exactly. Human/license/release approvals still pending.');
}catch(error){report.error={message:String(error),stack:error instanceof Error?error.stack:undefined};console.error(error);process.exitCode=1;}
finally {
  for(const command of commands)await writeFile(path.join(directory,`${command.name}.log`),String(command.output??''),{flag:'wx'});
  await writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  // Only this command's temporary consumer/dependencies are removed; copies/logs/video remain.
  await rm(consumer,{recursive:true,force:true});console.log(`Installed-consumer evidence: ${directory}`);
}
