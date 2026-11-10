import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,cp,readFile,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectTooling} from '../../scripts/project-tooling.ts';
import {createProject} from '../../scripts/cli/create.ts';
import {prepareProjectCommand} from '../../scripts/project-host.ts';
const root=fileURLToPath(new URL('../../',import.meta.url));

test('source tooling resolves pinned CLI and explicit first-party exports',async()=>{
  const tooling=await projectTooling(root);
  assert.equal(tooling.sourceWorkspace,true);
  assert.equal(tooling.aliases['@code-to-video/ui/icons/adapters$'],path.join(root,'packages/ui/src/icon-adapters.tsx'));
  assert.equal(tooling.aliases['@code-to-video/themes/react$'],path.join(root,'packages/themes/src/react.tsx'));
  assert.equal(path.basename(tooling.remotionExecutable),'remotion-cli.js');
});

test('project config preserves upstream shared Config import and explicit export aliases',async()=>{
  const temporary=await mkdtemp(path.join(tmpdir(),'ctv-config-'));
  try {
    const created=await createProject({directory:path.join(temporary,'project'),template:'title-card',brandId:'aurora-finance',styleId:'cinematic',motionId:'elegant'},root);
    const launch=await prepareProjectCommand({frameworkRoot:root,projectRoot:created.root,mode:'compositions',args:[]});
    const config=await readFile(launch.args[launch.args.indexOf('--config')+1]!,'utf8');
    assert(config.startsWith("import {Config} from '@remotion/cli/config';"));
    assert(config.includes('"@code-to-video/themes$"'));assert(config.includes('"@code-to-video/ui/icons/adapters$"'));
  }finally{await rm(temporary,{recursive:true,force:true});}
});

test('hoisted install resolves dependency tools/types outside the package root',async()=>{
  const temporary=await realpath(await mkdtemp(path.join(tmpdir(),'ctv-hoisted-')));
  const modules=path.join(temporary,'node_modules');const installed=path.join(modules,'code-to-video');
  try {
    for(const directory of [installed,path.join(modules,'react'),path.join(modules,'@remotion/cli')])await mkdir(directory,{recursive:true});
    await writeFile(path.join(installed,'package.json'),JSON.stringify({name:'code-to-video',type:'module',version:'0.1.0',private:true}));
    await writeFile(path.join(modules,'react/package.json'),JSON.stringify({name:'react',version:'19.3.1'}));
    await writeFile(path.join(modules,'@remotion/cli/package.json'),JSON.stringify({name:'@remotion/cli',bin:{remotion:'remotion-cli.js'}}));
    for(const name of ['themes','ui']){
      await mkdir(path.join(installed,'packages',name),{recursive:true});
      await cp(path.join(root,'packages',name,'package.json'),path.join(installed,'packages',name,'package.json'));
    }
    await cp(path.join(root,'templates'),path.join(installed,'templates'),{recursive:true});
    const tooling=await projectTooling(installed);
    assert.equal(tooling.modulesRoot,modules);assert.equal(tooling.sourceWorkspace,false);
    assert.equal(tooling.remotionExecutable,path.join(modules,'@remotion/cli/remotion-cli.js'));
    const destination=path.join(temporary,'project');
    await createProject({directory:destination,template:'title-card',brandId:'aurora-finance',styleId:'cinematic',motionId:'elegant'},installed);
    const config=JSON.parse(await readFile(path.join(destination,'tsconfig.json'),'utf8'));
    assert.equal(path.resolve(destination,config.compilerOptions.typeRoots[0]),path.join(modules,'@types'));
    assert.equal(path.resolve(installed,config.compilerOptions.paths.react[0]),path.join(modules,'@types/react/index.d.ts'));
    const ui=JSON.parse(await readFile(path.join(installed,'packages/ui/package.json'),'utf8'));
    ui.exports['./escape']='../../outside.ts';await writeFile(path.join(installed,'packages/ui/package.json'),JSON.stringify(ui));
    await assert.rejects(projectTooling(installed),/Unsupported first-party package export/);
  }finally{await rm(temporary,{recursive:true,force:true});}
});
