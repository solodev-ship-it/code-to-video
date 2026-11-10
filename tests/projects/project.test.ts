import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, symlink, rm, realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {validateProjectManifest} from '../../packages/projects/src/manifest.ts';
import {createProjectRegistry} from '../../packages/projects/src/registry.ts';
import {loadProject} from '../../packages/projects/src/load.ts';
import {projectEntry} from '../../scripts/project-entry.ts';
const registry = createProjectRegistry();
function fixture() {return {
  schemaVersion:1, id:'IndependentExample', title:'Independent example', framework:{name:'code-to-video',version:'0.1.0'},
  width:640,height:360,fps:30,theme:{brandId:'aurora-finance',styleId:'minimal',motionId:'elegant'},
  assets:[{id:'art',path:'assets/art.svg',type:'image'}],compositions:[{id:'IndependentScene',durationInFrames:30,props:{title:'Independent project',nested:{values:[1,true,null]}}}],
};}
test('manifest clones and deeply freezes JSON without freezing caller data',() => {
  const input=fixture(); const p=validateProjectManifest(input,registry);
  assert.ok(Object.isFrozen(p)); assert.ok(Object.isFrozen(p.theme)); assert.ok(Object.isFrozen(p.compositions[0]!.props.nested));
  assert.ok(Object.isFrozen(p.assets[0])); assert.notEqual(p,input);
  input.title='Changed'; assert.equal(p.title,'Independent example');
});
const mutations: [string,(p: any) => void,RegExp][] = [
  ['schema',p=>p.schemaVersion=2,/schemaVersion/], ['version missing',p=>delete p.framework.version,/framework.version/],
  ['version incompatible',p=>p.framework.version='0.2.0',/framework.version/], ['framework',p=>p.framework.name='other',/framework.name/],
  ['unknown root',p=>p.extra=true,/project.extra/], ['unknown nested',p=>p.theme.extra=true,/theme.extra/],
  ['unknown asset',p=>p.assets[0].extra=true,/assets\[0\].extra/], ['unknown composition',p=>p.compositions[0].extra=true,/compositions\[0\].extra/],
  ['width',p=>p.width=0,/width/], ['odd width',p=>p.width=641,/width/], ['height',p=>p.height=NaN,/height/],
  ['fps',p=>p.fps=1.5,/fps/], ['duration',p=>p.compositions[0].durationInFrames=-1,/durationInFrames/],
  ['empty compositions',p=>p.compositions=[],/compositions/], ['duplicate composition',p=>p.compositions.push(p.compositions[0]),/duplicate/],
  ['duplicate asset',p=>p.assets.push(p.assets[0]),/duplicate/], ['brand',p=>p.theme.brandId='unknown',/theme.*Unknown brand/],
  ['style',p=>p.theme.styleId='unknown',/theme.*Unknown visual/], ['motion',p=>p.theme.motionId='unknown',/theme.*Unknown motion/],
  ['path escape',p=>p.assets[0].path='assets/../outside.svg',/path/], ['absolute',p=>p.assets[0].path='/tmp/art.svg',/path/],
  ['query',p=>p.assets[0].path='assets/art.svg?q=1',/path/], ['backslash',p=>p.assets[0].path='assets\\art.svg',/path/],
  ['scheme',p=>p.assets[0].path='https://host/art.svg',/path/], ['asset directory',p=>p.assets[0].path='compositions/art.svg',/assets\//],
  ['asset type',p=>p.assets[0].type='script',/type/], ['props url',p=>p.compositions[0].props.title='https://host',/URLs/],
  ['props function',p=>p.compositions[0].props.title=()=>1,/JSON/], ['reserved theme',p=>p.compositions[0].props.brandId='x',/reserved/],
  ['reserved asset',p=>p.compositions[0].props.assets={},/reserved/], ['cyclic props',p=>p.compositions[0].props.self=p,/cyclic/],
];
for (const [name,mutate,expected] of mutations) test(`rejects ${name}`,()=>{const p=fixture();mutate(p);assert.throws(()=>validateProjectManifest(p,registry),expected);});
test('typed project theme registration uses the existing registry validation',()=>{
  const custom=createProjectRegistry(r=>r.registerMotionPreset({...registry.getMotionPreset('elegant'),id:'project-motion'}));
  const p=fixture();p.theme.motionId='project-motion';assert.equal(validateProjectManifest(p,custom).theme.motionId,'project-motion');
  assert.throws(()=>createProjectRegistry(r=>r.registerMotionPreset({...registry.getMotionPreset('elegant')})),/Duplicate/);
});
async function withProject(run: (root:string,outside:string)=>Promise<void>) {
  const temp=await mkdtemp(path.join(tmpdir(),'ctv-project-')); const root=path.join(temp,'project');
  try {
    await mkdir(path.join(root,'assets'),{recursive:true});await mkdir(path.join(root,'compositions'));
    await writeFile(path.join(root,'code-to-video.project.json'),JSON.stringify(fixture()));
    await writeFile(path.join(root,'assets/art.svg'),'<svg/>');await writeFile(path.join(root,'compositions/IndependentScene.tsx'),'export default function Scene() {return null;}');
    const outside=path.join(temp,'outside.svg');await writeFile(outside,'outside');await run(root,outside);
  } finally {await rm(temp,{recursive:true,force:true});}
}
test('external project resolves assets; generated registrations support actual Studio extraction and save',async()=>withProject(async(root)=>{
  const project=await loadProject(root); assert.equal(project.assets.art,await realpath(path.join(root,'assets/art.svg')));
  const entry=projectEntry(project,process.cwd());
  const require=createRequire(import.meta.url);
  const {CodemodsInternals,setCompositionDefaultProps,applyCodemodChanges}=require('@remotion/codemods');
  const extracted=CodemodsInternals.computeCanUpdateDefaultPropsFromContent(entry,'IndependentScene');
  assert.equal(extracted.canUpdate,true,extracted.reason);
  assert.equal(extracted.currentDefaultProps.assets.art,'project-assets/assets/art.svg');
  assert.equal(extracted.currentDefaultProps.brandId,'aurora-finance');
  const file=path.join(root,'Generated.tsx');const source={rootDir:root,files:{[file]:entry}};
  const props={...extracted.currentDefaultProps,title:'Saved'};
  const edits=setCompositionDefaultProps({project:source,compositionFile:file,compositionId:'IndependentScene',defaultProps:props});
  const updated=applyCodemodChanges(source,edits.changes);
  assert.deepEqual(CodemodsInternals.computeCanUpdateDefaultPropsFromContent(updated.files[file],'IndependentScene').currentDefaultProps,props);
  assert.doesNotMatch(entry,/development-control/);
}));
test('missing asset fails host load',async()=>withProject(async root=>{
  await rm(path.join(root,'assets/art.svg'));await assert.rejects(loadProject(root),/assets\/art.svg: missing/);
}));
test('asset symlink escape fails host load',async()=>withProject(async(root,outside)=>{
  await rm(path.join(root,'assets/art.svg'));await symlink(outside,path.join(root,'assets/art.svg'));await assert.rejects(loadProject(root),/escapes project root/);
}));
test('composition and manifest symlink escapes fail host load',async()=>withProject(async(root,outside)=>{
  await rm(path.join(root,'compositions/IndependentScene.tsx'));await symlink(outside,path.join(root,'compositions/IndependentScene.tsx'));await assert.rejects(loadProject(root),/escapes project root/);
  await rm(path.join(root,'code-to-video.project.json'));await symlink(outside,path.join(root,'code-to-video.project.json'));await assert.rejects(loadProject(root),/escapes project root/);
}));
test('contained asset symlinks are supported',async()=>withProject(async root=>{
  await writeFile(path.join(root,'assets/real.svg'),'<svg/>');await rm(path.join(root,'assets/art.svg'));await symlink('real.svg',path.join(root,'assets/art.svg'));
  assert.equal((await loadProject(root)).assets.art,await realpath(path.join(root,'assets/real.svg')));
}));
test('rejects accessor and symbol properties without executing an accessor',()=>{
  const p=fixture();let called=false;
  Object.defineProperty(p,'title',{get(){called=true;return 'side effect';},enumerable:true});
  assert.throws(()=>validateProjectManifest(p,registry),/accessors/);assert.equal(called,false);
  const symbolInput=fixture();Object.defineProperty(symbolInput,Symbol('hidden'),{value:1});
  assert.throws(()=>validateProjectManifest(symbolInput,registry),/symbol/);
});
test('rejects sparse arrays, excessive nesting and nonfinite nested JSON',()=>{
  const p:any=fixture();p.compositions[0].props.bad=Array(2);assert.throws(()=>validateProjectManifest(p,registry),/dense/);
  p.compositions[0].props.bad=Infinity;assert.throws(()=>validateProjectManifest(p,registry),/JSON/);
  let nested:any={};p.compositions[0].props.bad=nested;for(let i=0;i<33;i++){nested.next={};nested=nested.next;}
  assert.throws(()=>validateProjectManifest(p,registry),/nesting/);
});
test('invalid manifest exits the project runner before creating render output',async()=>withProject(async root=>{
  const {spawnSync}=await import('node:child_process');const {existsSync}=await import('node:fs');
  const p=fixture();p.schemaVersion=9;await writeFile(path.join(root,'code-to-video.project.json'),JSON.stringify(p));
  const output=path.join(root,'must-not-exist.mp4');
  const result=spawnSync(process.execPath,['--experimental-strip-types','scripts/project-runner.ts','render','IndependentScene',output],{cwd:process.cwd(),env:{...process.env,CODE_TO_VIDEO_PROJECT:root},encoding:'utf8'});
  assert.equal(result.status,1);assert.match(result.stderr,/schemaVersion: unsupported version/);assert.equal(existsSync(output),false);
}));
