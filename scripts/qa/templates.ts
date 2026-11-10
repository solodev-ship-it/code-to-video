// Focused local template gate. This does not approve baselines or production copy.
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, writeFile, cp, rm, readdir} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadProject} from '../../packages/projects/src/load.ts';
import {prepareProjectCommand} from '../project-host.ts';
import {comparePng, strictComparison} from './compare.ts';
import {verifyPngOutput} from './artifacts.ts';
const root = fileURLToPath(new URL('../../',import.meta.url));
const directory = await mkdtemp(await (async()=>{const parent=path.join(root,'renders/template-checks');await mkdir(parent,{recursive:true});return path.join(parent,'templates-');})());
const temporary = await mkdtemp(path.join(tmpdir(),'ctv-template-render-'));
const bin = path.join(root,'bin/code-to-video.mjs');
const relative = (file:string)=>path.relative(root,file).split(path.sep).join('/');
const hash = async(file:string)=>createHash('sha256').update(await readFile(file)).digest('hex');
const report: {status:string;humanReview:string;cases:Record<string,unknown>[];error?:string} = {status:'failed',humanReview:'PENDING',cases:[]};
async function run(executable:string,args:string[],name:string,cwd=root) {
  const result = await new Promise<{code:number|null;output:string}>((resolve,reject)=>{
    const child=spawn(executable,args,{cwd,env:{...process.env,BROWSER:'none'},stdio:['ignore','pipe','pipe']});let output='';
    child.stdout.on('data',bytes=>{output+=String(bytes);});child.stderr.on('data',bytes=>{output+=String(bytes);});
    child.once('error',reject);child.once('exit',code=>resolve({code,output}));
  });
  await writeFile(path.join(directory,`${name}.log`),result.output,{flag:'wx'});
  assert.equal(result.code,0,`${name} failed:\n${result.output}`);
  return result.output;
}
async function cachedBrowserExists():Promise<boolean> {
  if(process.env.REMOTION_BROWSER_EXECUTABLE) {await readFile(process.env.REMOTION_BROWSER_EXECUTABLE);return true;}
  async function search(dir:string,depth:number):Promise<boolean>{
    for(const e of await readdir(dir,{withFileTypes:true}).catch(()=>[])){
      if(e.isFile()&&['chrome-headless-shell','chrome-headless-shell.exe'].includes(e.name))return true;
      if(e.isDirectory()&&depth>0&&await search(path.join(dir,e.name),depth-1))return true;
    }return false;
  }
  return await search(path.join(root,'node_modules/.remotion'),5) || await search(path.join(root,'apps/studio/node_modules/.remotion'),5);
}
try {
  assert(await cachedBrowserExists(),'No cached renderer browser. Run npm run browser:ensure during setup; QA does not acquire one.');
  for(const [template,brand,style] of [['title-card','aurora-finance','cinematic'],['explainer','ember-studio','minimal']] as const) {
    console.log(`Checking ${template} with ${brand}/${style}…`);
    const projectRoot=path.join(temporary,template);
    await run(process.execPath,[bin,'create',projectRoot,'--template',template,'--brand',brand,'--style',style],`${template}-create`);
    const project=await loadProject(projectRoot);const composition=project.manifest.compositions[0]!;
    await cp(projectRoot,path.join(directory,`${template}-project`),{recursive:true,errorOnExist:true,force:false});
    await run(path.join(root,'node_modules/.bin/tsc'),['-p',path.join(projectRoot,'tsconfig.json')],`${template}-typecheck`);
    const video=path.join(directory,`${composition.id}.mp4`);
    // Exercise the actual compiled CLI for the final MP4, with a temporary external project.
    await run(process.execPath,[bin,'render',projectRoot,composition.id,'--output',video],`${template}-render`);
    const probe=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-show_entries','format=duration,size','-of','json',video],`${template}-probe`));
    const stream=probe.streams[0];
    assert.deepEqual([stream.codec_name,stream.width,stream.height,stream.r_frame_rate,stream.nb_read_frames],['h264',project.manifest.width,project.manifest.height,`${project.manifest.fps}/1`,String(composition.durationInFrames)]);
    assert.equal(Number(probe.format.duration),composition.durationInFrames/project.manifest.fps);
    await run('ffmpeg',['-v','error','-i',video,'-f','null','-'],`${template}-decode`);
    const launch=await prepareProjectCommand({frameworkRoot:root,projectRoot,mode:'compositions',args:[]});
    await run(launch.executable,launch.args,`${template}-compositions`,launch.cwd);
    const stills: Record<string,string>={};
    for(const [name,frame] of [['entry',15],['settled',90],['repeat',90]] as const) {
      const file=path.join(directory,`${template}-${name}.png`);stills[name]=file;
      await run(launch.executable,['still',...launch.args.slice(1),composition.id,file,`--frame=${frame}`,'--image-format=png','--overwrite=false'],`${template}-${name}`,launch.cwd);
      await verifyPngOutput(file,project.manifest.width,project.manifest.height);
    }
    const pixels=comparePng(await readFile(stills.settled!),await readFile(stills.repeat!),strictComparison).metrics.differingPixels;
    assert.equal(pixels,0,`${template} independent settled frames differ`);
    const motionPixels=comparePng(await readFile(stills.entry!),await readFile(stills.settled!),strictComparison).metrics.differingPixels;
    assert(motionPixels!==null&&motionPixels>0,`${template} entry and settled must differ`);
    report.cases.push({template,brand,style,compositionId:composition.id,manifest:project.manifest,video:relative(video),videoSha256:await hash(video),metadata:probe,fullDecode:true,stills:Object.fromEntries(Object.entries(stills).map(([k,v])=>[k,relative(v)])),differingRepeatPixels:pixels,motionPixels});
  }
  report.status='passed';console.log(`PASS: both generated templates typecheck, register, render, fully decode and repeat exactly. ${relative(directory)}`);
} catch(error) {report.error=error instanceof Error?error.message:String(error);console.error(error);process.exitCode=1;}
finally {
  // Only the suite-owned temporary fixture is removed. Artifacts/snapshots/logs survive.
  await rm(temporary,{recursive:true,force:true});
  await writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
