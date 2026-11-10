// Inventory only: package metadata and license text hashes are not legal approval.
import {readFile,readdir,mkdir,mkdtemp,writeFile,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const parent=path.join(root,'renders/release-checks');await mkdir(parent,{recursive:true});
const directory=await mkdtemp(path.join(parent,'inventory-'));
const lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
const rows=[];
for(const [location,entry] of Object.entries(lock.packages) as [string,{link?:boolean;version?:string;license?:string;integrity?:string;optional?:boolean}][]) {
  if(!location.includes('node_modules/') || entry.link)continue;
  const folder=path.join(root,location);let manifest:{name?:string;version?:string;license?:unknown}|undefined;
  try{manifest=JSON.parse(await readFile(path.join(folder,'package.json'),'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  const texts=[];
  if(manifest)for(const name of (await readdir(folder)).filter(name=>/^(?:licen[sc]e|copying|notice)(?:[.-]|$)/i.test(name)).sort()){
    const file=path.join(folder,name);if(!(await lstat(file)).isFile())continue;
    texts.push({file:name,sha256:createHash('sha256').update(await readFile(file)).digest('hex')});
  }
  rows.push({location,name:manifest?.name??location.split('node_modules/').at(-1),version:entry.version,installed:!!manifest,optional:entry.optional??false,
    declaredLicense:manifest?.license??entry.license??null,integrity:entry.integrity??null,licenseTexts:texts,humanReview:'PENDING'});
}
const firstParty=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const assets=[];
for(const relative of ['LICENSE','docs/licenses/LUCIDE.txt','docs/licenses/PHOSPHOR.txt','docs/licenses/REMOTION.md',
  'apps/studio/public/fonts/atkinson/PROVENANCE.json','apps/studio/public/fonts/atkinson/OFL.txt','apps/studio/public/advanced-effects/LICENSE.txt']) {
  assets.push({file:relative,sha256:createHash('sha256').update(await readFile(path.join(root,relative))).digest('hex')});
}
const report={schemaVersion:1,status:'inventoried-not-approved',releaseReady:false,humanReview:'PENDING',
  lockSha256:createHash('sha256').update(await readFile(path.join(root,'package-lock.json'))).digest('hex'),
  firstPartyLicense:{spdx:firstParty.license??'NOT_SELECTED',holder:firstParty.author??null,text:'LICENSE'},remotionTerms:'CONDITIONAL_LICENSE_REQUIRES_HUMAN_REVIEW',packages:rows,assets,
  counts:{packages:rows.length,installed:rows.filter(r=>r.installed).length,withoutDeclaredLicense:rows.filter(r=>!r.declaredLicense).length,withoutLocalLicenseText:rows.filter(r=>r.installed&&!r.licenseTexts.length).length},
  limitations:['Metadata is not a legal determination. Review terms, notices, optional platform dependencies and redistribution obligations before release.','First-party license records the owner selection only; it does not relicense dependencies or decide Remotion company-license/white-label eligibility.']};
await writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(`Inventory generated, NOT legal approval: ${path.join(directory,'report.json')}`);
console.log(JSON.stringify(report.counts));
