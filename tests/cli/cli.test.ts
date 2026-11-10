import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm, lstat, symlink, realpath} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {parseArgs} from '../../scripts/cli/args.ts';
import {createProject} from '../../scripts/cli/create.ts';
import type {CreateOptions} from '../../scripts/cli/args.ts';
import {projectCommand} from '../../scripts/cli.ts';
import {loadProject} from '../../packages/projects/src/load.ts';
import {projectEntry} from '../../scripts/project-entry.ts';
import {prepareProjectCommand, validateRenderOutput} from '../../scripts/project-host.ts';
const frameworkRoot = fileURLToPath(new URL('../../',import.meta.url));
const options = (directory:string):CreateOptions => ({directory,template:'title-card',brandId:'aurora-finance',styleId:'cinematic',motionId:'elegant'});
async function withTemp(run:(root:string)=>Promise<void>) {
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'ctv-cli-')));
  try {await run(root);} finally {await rm(root,{recursive:true,force:true});}
}
test('CLI help and version need no project',()=>{
  assert.deepEqual(parseArgs([]),{command:'help'});assert.deepEqual(parseArgs(['create','--help']),{command:'help'});
  assert.deepEqual(parseArgs(['--version']),{command:'version'});
});
test('CLI parses explicit themes, quoted titles, equals options and literal paths',()=>{
  const c=parseArgs(['create','my-project','--template=explainer','--id','MyProject','--title','A clear title','--brand','ember-studio','--style','minimal','--motion','energetic']);
  assert.deepEqual(c,{command:'create',directory:'my-project',template:'explainer',id:'MyProject',title:'A clear title',brandId:'ember-studio',styleId:'minimal',motionId:'energetic'});
  assert.deepEqual(parseArgs(['preview','--port','3014','--','-project']),{command:'preview',directory:'-project',port:3014});
  assert.deepEqual(parseArgs(['render','my-project','TitleCard','--output','out/new.mp4']),{command:'render',directory:'my-project',compositionId:'TitleCard',output:'out/new.mp4'});
});
const rejects:[string[],RegExp][] = [
  [['unknown'],/Unknown command/], [['create'],/requires <directory>/], [['create','a','b'],/requires/],
  [['create','a','--brand'],/requires a value/], [['create','a','--brand','--style'],/requires a value/],
  [['create','a','--brand','x','--brand','y'],/Duplicate/], [['create','a','--typo','x'],/Unknown option/],
  [['preview','a','--port','0'],/port/], [['preview','a','--port','65536'],/port/],
  [['preview','a','--port','1.5'],/port/], [['preview','a','--port','abc'],/port/],
  [['render','a'],/requires/], [['render','a','TitleCard'],/requires --output/],
  [['render','a','TitleCard','--output',''],/requires a value/], [['render','a','TitleCard','--overwrite','true'],/Unknown option/],
];
for(const [args,expected] of rejects)test(`CLI rejects ${JSON.stringify(args)}`,()=>assert.throws(()=>parseArgs(args),expected));
test('preview/render routing uses explicit selected roots and fixed shared host modes',()=>{
  const preview=parseArgs(['preview','project','--port','3014']);assert.equal(preview.command,'preview');
  if(preview.command!=='preview')throw new Error('test setup');
  assert.deepEqual(projectCommand(preview,frameworkRoot),{frameworkRoot,projectRoot:path.resolve('project'),mode:'studio',args:['--port=3014']});
  const render=parseArgs(['render','project','TitleCard','--output','outputs/new.mp4']);
  if(render.command!=='render')throw new Error('test setup');
  const route=projectCommand(render,frameworkRoot);assert.equal(route.mode,'render');assert.equal(route.allowExternalOutput,true);assert.deepEqual(route.args,['TitleCard',path.resolve('outputs/new.mp4')]);
});
for(const template of ['title-card','explainer']) for(const brandId of ['aurora-finance','ember-studio']) for(const styleId of ['cinematic','minimal']) {
  test(`${template} creates valid ${brandId}/${styleId} source and editable registration`,async()=>withTemp(async root=>{
    const target=path.join(root,`new-${template}`);const created=await createProject({...options(target),template,brandId,styleId,motionId:'energetic'},frameworkRoot);
    const loaded=await loadProject(target);assert.deepEqual(loaded.manifest,created.manifest);
    assert.equal(loaded.manifest.schemaVersion,1);assert.equal(loaded.manifest.width,1920);assert.equal(loaded.manifest.fps,30);
    assert.equal(loaded.manifest.theme.brandId,brandId);assert.equal(loaded.manifest.theme.styleId,styleId);
    assert.ok(Object.isFrozen(loaded.manifest));assert.ok((await lstat(path.join(target,'assets'))).isDirectory());
    assert.equal(existsSync(path.join(target,'node_modules')),false);assert.equal(existsSync(path.join(target,'.git')),false);
    const id=created.manifest.compositions[0]!.id;const source=await readFile(loaded.compositions[id]!,'utf8');
    assert.doesNotMatch(source,/development-control|video-projects|https?:\/\/|Math\.random|Date\.now/);
    const props=created.manifest.compositions[0]!.props;assert.match(String(props.label),/SAMPLE COPY/);assert.equal(props.reducedMotion,false);
    const entry=projectEntry(loaded,frameworkRoot);const require=createRequire(import.meta.url);
    const {CodemodsInternals,setCompositionDefaultProps,applyCodemodChanges}=require('@remotion/codemods');
    const extracted=CodemodsInternals.computeCanUpdateDefaultPropsFromContent(entry,id);assert.equal(extracted.canUpdate,true,extracted.reason);
    const file=path.join(root,'Generated.tsx');const project={rootDir:root,files:{[file]:entry}};const changed={...extracted.currentDefaultProps,reducedMotion:true};
    const edits=setCompositionDefaultProps({project,compositionFile:file,compositionId:id,defaultProps:changed});
    const result=applyCodemodChanges(project,edits.changes);assert.deepEqual(CodemodsInternals.computeCanUpdateDefaultPropsFromContent(result.files[file],id).currentDefaultProps,changed);
  }));
}
for(const field of ['brandId','styleId','motionId','template','id'] as const)test(`invalid ${field} leaves no project directory`,async()=>withTemp(async root=>{
  const directory=path.join(root,'rejected');const value=field==='id'?'../invalid':'unknown';
  await assert.rejects(createProject({...options(directory),[field]:value},frameworkRoot),field==='id'?/id:/:/Unknown/);
  assert.equal(existsSync(directory),false);
}));
test('create refuses existing directories/files and preserves their contents',async()=>withTemp(async root=>{
  const directory=path.join(root,'existing');await mkdir(directory);await writeFile(path.join(directory,'user.txt'),'keep');
  await assert.rejects(createProject(options(directory),frameworkRoot),/already exists/);assert.equal(await readFile(path.join(directory,'user.txt'),'utf8'),'keep');
  const file=path.join(root,'existing-file');await writeFile(file,'keep too');await assert.rejects(createProject(options(file),frameworkRoot),/already exists/);assert.equal(await readFile(file,'utf8'),'keep too');
}));
test('create rejects engine containment through a parent symlink',async()=>withTemp(async root=>{
  await symlink(frameworkRoot,path.join(root,'engine'),'dir');
  await assert.rejects(createProject(options(path.join(root,'engine','must-not-create')),frameworkRoot),/outside the framework/);
  assert.equal(existsSync(path.join(frameworkRoot,'must-not-create')),false);
}));
test('render output is explicit, external only when allowed and never overwrites',async()=>withTemp(async root=>{
  const output=path.join(root,'outputs','new.mp4');assert.equal(await validateRenderOutput(frameworkRoot,output,true),output);
  await assert.rejects(validateRenderOutput(frameworkRoot,output),/ignored renders/);
  await assert.rejects(validateRenderOutput(frameworkRoot,path.join(frameworkRoot,'new.mp4'),true),/ignored renders/);
  await assert.rejects(validateRenderOutput(frameworkRoot,path.join(root,'new.mov'),true),/\.mp4/);
  const existing=path.join(root,'existing.mp4');await writeFile(existing,'keep');await assert.rejects(validateRenderOutput(frameworkRoot,existing,true),/already exists/);assert.equal(await readFile(existing,'utf8'),'keep');
  const dangling=path.join(root,'link.mp4');await symlink('missing.mp4',dangling);await assert.rejects(validateRenderOutput(frameworkRoot,dangling,true),/already exists/);
}));
test('render rejects symlink parents leading into tracked framework source or dangling roots',async()=>withTemp(async root=>{
  const link=path.join(root,'source');await symlink(path.join(frameworkRoot,'apps/studio/src'),link,'dir');
  await assert.rejects(validateRenderOutput(frameworkRoot,path.join(link,'new.mp4'),true),/ignored renders/);
  await symlink(path.join(root,'missing'),path.join(root,'dangling'),'dir');
  await assert.rejects(validateRenderOutput(frameworkRoot,path.join(root,'dangling','new.mp4'),true),/dangling symlink/);
}));
test('unset host retains original entry and public directory configuration',async()=>{
  const launch=await prepareProjectCommand({frameworkRoot,mode:'compositions',args:[]});
  const browser=process.env.REMOTION_BROWSER_EXECUTABLE;
  assert.deepEqual(launch.args,['compositions',path.join(frameworkRoot,'apps/studio/src/index.ts'),...(browser ? [`--browser-executable=${path.resolve(browser)}`] : [])]);
  assert.equal(launch.cwd,path.join(frameworkRoot,'apps/studio'));
});
test('shared host checks composition and output before rendering',async()=>withTemp(async root=>{
  const p=await createProject(options(path.join(root,'project')),frameworkRoot);const output=path.join(root,'new.mp4');
  await assert.rejects(prepareProjectCommand({frameworkRoot,projectRoot:p.root,mode:'render',args:['MissingComposition',output],allowExternalOutput:true}),/manifest composition/);
  await writeFile(output,'keep');await assert.rejects(prepareProjectCommand({frameworkRoot,projectRoot:p.root,mode:'render',args:['TitleCard',output],allowExternalOutput:true}),/already exists/);
  assert.equal(await readFile(output,'utf8'),'keep');
}));
test('CLI error path preserves structured cause through nonzero command outcome',async()=>{
  const {main}=await import('../../scripts/cli.ts');await assert.rejects(main(['render','missing','TitleCard'],frameworkRoot),/requires --output/);
});
test('shared host forwards an explicitly provisioned browser to the Remotion CLI',async()=>{
  const previous=process.env.REMOTION_BROWSER_EXECUTABLE;
  try {
    process.env.REMOTION_BROWSER_EXECUTABLE=path.resolve('provisioned-browser');
    const launch=await prepareProjectCommand({frameworkRoot,mode:'compositions',args:[]});
    assert(launch.args.includes(`--browser-executable=${path.resolve('provisioned-browser')}`));
  } finally {
    if(previous===undefined) delete process.env.REMOTION_BROWSER_EXECUTABLE;
    else process.env.REMOTION_BROWSER_EXECUTABLE=previous;
  }
});
