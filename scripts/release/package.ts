import assert from 'node:assert/strict';
import {cp,lstat,mkdir,mkdtemp,readFile,readdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {candidateManifest,assertArchivePaths} from './manifest.ts';
const root=fileURLToPath(new URL('../../',import.meta.url));
const parent=path.join(root,'renders/release-checks');await mkdir(parent,{recursive:true});
const directory=await mkdtemp(path.join(parent,'candidate-'));const stage=path.join(directory,'package');await mkdir(stage);
const readJson=async(file:string)=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const hash=async(file:string)=>createHash('sha256').update(await readFile(file)).digest('hex');
const report:Record<string,unknown>={schemaVersion:1,status:'failed',releaseReady:false,private:true,firstPartyLicense:'MIT',thirdPartyReview:'PENDING',humanReview:'PENDING'};
try {
  const source=await readJson('package.json');
  const manifest=candidateManifest(source,await readJson('apps/studio/package.json'),await readJson('packages/ui/package.json'),await readJson('packages/themes/package.json'));
  const entries=[...source.files,'README.md','LICENSE','CHANGELOG.md','THIRD_PARTY_NOTICES.md','docs/','packages/ui/README.md','packages/themes/README.md'];
  const files:Record<string,string>={};
  async function copy(relative:string):Promise<void> {
    const file=path.join(root,relative);const info=await lstat(file);assert(!info.isSymbolicLink(),'Source symlinks are not packaged');
    if(info.isDirectory()){for(const name of (await readdir(file)).sort())await copy(path.join(relative,name));return;}
    if(/\.test\.[cm]?[jt]sx?$/.test(relative))return;
    assert(info.isFile());assert(info.size<=2*1024*1024,`Review source asset above 2 MiB before packaging: ${relative}`);
    const normalized=relative.split(path.sep).join('/');assertArchivePaths([normalized]);
    if(normalized.startsWith('dist/')){
      assert(normalized.endsWith('.js'),'Only compiled JavaScript belongs in candidate dist');
      await lstat(path.join(root,normalized.slice(5,-3)+'.ts'));
    }
    const destination=path.join(stage,relative);await mkdir(path.dirname(destination),{recursive:true});
    if(!files[normalized])await cp(file,destination,{force:false,errorOnExist:true});files[normalized]=await hash(file);
  }
  for(const entry of entries)await copy(entry.replace(/\/$/,''));
  await writeFile(path.join(stage,'package.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  const packed=spawnSync('npm',['pack','--json','--ignore-scripts','--pack-destination',directory],{cwd:stage,encoding:'utf8',timeout:120000});
  await writeFile(path.join(directory,'npm-pack.log'),packed.stdout+'\n'+packed.stderr,{flag:'wx'});
  assert.ifError(packed.error);assert.equal(packed.status,0,packed.stderr);
  const archive=JSON.parse(packed.stdout)[0];assertArchivePaths(archive.files.map((f:{path:string})=>f.path));
  const expected=new Set([...Object.keys(files),'package.json']);
  assert.deepEqual([...archive.files.map((f:{path:string})=>f.path)].sort(),[...expected].sort(),'Packed archive differs from staged allowlist');
  const tarball=path.join(directory,archive.filename);
  report.status='prepared';report.archive=tarball;report.sha256=await hash(tarball);report.manifest=manifest;report.sourceFiles=files;report.pack=archive;
  console.log(`PRIVATE CANDIDATE (not released): ${tarball}`);
}catch(error){report.error={message:String(error),stack:error instanceof Error?error.stack:undefined};console.error(error);process.exitCode=1;}
finally{await writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(`Candidate report: ${path.join(directory,'report.json')}`);}
