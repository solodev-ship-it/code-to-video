import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {candidateManifest,previewManifest,assertArchivePaths} from '../../scripts/release/manifest.ts';
const json=async(file:string)=>JSON.parse(await readFile(new URL('../../'+file,import.meta.url),'utf8'));
test('candidate flattens existing exact runtime/tool pins but stays private and unchanged-version',async()=>{
  const root=await json('package.json');const studio=await json('apps/studio/package.json');const ui=await json('packages/ui/package.json');const themes=await json('packages/themes/package.json');
  const result=candidateManifest(root,studio,ui,themes);
  assert.equal(result.private,true);assert.equal(result.version,root.version);
  assert.equal(result.license,'MIT');assert.equal(result.author,'Rorn Bunthong');
  assert(!('workspaces' in result));assert(!('scripts' in result));
  assert(!Object.keys(result.dependencies).some(name=>name.startsWith('@code-to-video/')));
  assert.equal(result.dependencies['@remotion/cli'],'4.0.541');assert.equal(result.dependencies.typescript,'5.9.3');
  assert.throws(()=>candidateManifest({...root,private:false},studio,ui,themes),/private flag/);
  assert.throws(()=>candidateManifest({...root,license:undefined},studio,ui,themes),/human-selected/);
  assert.throws(()=>candidateManifest({...root,version:'1.0.0'},studio,ui,themes),/not authorized/);
  assert.throws(()=>candidateManifest(root,{...studio,dependencies:{...studio.dependencies,react:'^19.3.1'}},ui,themes),/exact pins/);
  assert.throws(()=>candidateManifest(root,studio,{...ui,dependencies:{react:'19.0.0'}},themes),/Conflicting/);
});
test('archive audit rejects private/generated/media/secret/test/traversal paths',()=>{
  assert.doesNotThrow(()=>assertArchivePaths(['package.json','LICENSE','bin/code-to-video.mjs','apps/studio/public/fonts/atkinson/OFL.txt','packages/ui/src/index.ts']));
  for(const name of ['development-control/state.json','renders/video.mp4','apps/studio/.cache/data','docs/.env.secret','docs/private.key','tests/foo.ts','packages/ui/src/foo.test.ts','../README.md','/README.md','docs/movie.mp4','dist/.DS_Store','docs/._README.md'])assert.throws(()=>assertArchivePaths([name]));
  assert.throws(()=>assertArchivePaths([]));
});
test('public preview uses owner-selected scoped identity/access without mutating source or adding dependencies',async()=>{
  const root=await json('package.json');const studio=await json('apps/studio/package.json');const ui=await json('packages/ui/package.json');const themes=await json('packages/themes/package.json');
  const before=JSON.stringify([root,studio,ui,themes]);
  const candidate=candidateManifest(root,studio,ui,themes);
  const preview=previewManifest(root,studio,ui,themes);
  assert.equal(preview.name,'@krungtech/code-to-video');assert.equal(preview.version,'0.1.0');
  assert.equal(preview.private,false);assert.equal(preview.publishConfig.access,'public');
  assert.equal(preview.license,'MIT');assert.equal(preview.author,'Rorn Bunthong');
  assert.deepEqual(preview.dependencies,{...candidate.dependencies,'@babel/helper-module-transforms':'7.29.13'});assert.deepEqual(preview.bin,candidate.bin);
  assert.equal(preview.repository.url,'git+https://github.com/solodev-ship-it/code-to-video.git');
  assert(!('workspaces' in preview));assert(!('scripts' in preview));
  assert.equal(JSON.stringify([root,studio,ui,themes]),before);
  assert.equal(root.private,true);assert.equal(root.name,'code-to-video');
});
test('preview Babel constraint matches the existing tested lock and does not change private candidates',async()=>{
  const root=await json('package.json');const studio=await json('apps/studio/package.json');const ui=await json('packages/ui/package.json');const themes=await json('packages/themes/package.json');
  const lock=await json('package-lock.json');
  const preview=previewManifest(root,studio,ui,themes);
  assert.equal(preview.dependencies['@babel/helper-module-transforms'],lock.packages['node_modules/@babel/helper-module-transforms'].version);
  assert.equal(candidateManifest(root,studio,ui,themes).dependencies['@babel/helper-module-transforms'],undefined);
});
test('public preview refuses unselected version and cannot bypass private-source/license/pin checks',async()=>{
  const root=await json('package.json');const studio=await json('apps/studio/package.json');const ui=await json('packages/ui/package.json');const themes=await json('packages/themes/package.json');
  assert.throws(()=>previewManifest({...root,version:'0.1.1'},studio,ui,themes),/selected 0.1.0/);
  assert.throws(()=>previewManifest({...root,private:false},studio,ui,themes),/private flag/);
  assert.throws(()=>previewManifest({...root,license:undefined},studio,ui,themes),/human-selected/);
  assert.throws(()=>previewManifest(root,{...studio,dependencies:{...studio.dependencies,react:'^19.3.1'}},ui,themes),/exact pins/);
});
