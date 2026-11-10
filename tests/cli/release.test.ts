import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {candidateManifest,assertArchivePaths} from '../../scripts/release/manifest.ts';
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
  for(const name of ['development-control/state.json','renders/video.mp4','apps/studio/.cache/data','docs/.env.secret','docs/private.key','tests/foo.ts','packages/ui/src/foo.test.ts','../README.md','/README.md','docs/movie.mp4'])assert.throws(()=>assertArchivePaths([name]));
  assert.throws(()=>assertArchivePaths([]));
});
