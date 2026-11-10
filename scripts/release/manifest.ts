import assert from 'node:assert/strict';
type Metadata={name:string;version:string;license?:string;author?:string;private?:boolean;engines?:Record<string,string>;bin?:Record<string,string>;dependencies?:Record<string,string>;devDependencies?:Record<string,string>};

// A local candidate, not a publish manifest. No internal package is fetched from npm.
export function candidateManifest(root:Metadata,studio:Metadata,ui:Metadata,themes:Metadata) {
  assert.equal(root.private,true,'Preparation must not remove the private flag');
  assert.match(root.version,/^0\.1\.\d+$/,'Final version/compatibility decision is not authorized');
  assert.equal(root.license,'MIT','Candidate must retain the human-selected first-party license');
  const dependencies:Record<string,string>={};
  function add(name:string,version:string) {
    if(name.startsWith('@code-to-video/'))return;
    assert.match(version,/^\d+\.\d+\.\d+$/,'Candidate dependencies must remain exact pins');
    if(dependencies[name])assert.equal(dependencies[name],version,`Conflicting dependency ${name}`);
    dependencies[name]=version;
  }
  for(const metadata of [studio,ui,themes])for(const [name,version] of Object.entries(metadata.dependencies??{}))add(name,version);
  for(const name of ['@remotion/cli','typescript','@types/node','@types/react','@types/react-dom']){
    const version=studio.devDependencies?.[name];assert(version,`Missing existing tooling dependency ${name}`);add(name,version);
  }
  for(const name of ['@remotion/bundler','@remotion/renderer']){const version=root.devDependencies?.[name];assert(version);add(name,version);}
  return {name:root.name,version:root.version,private:true,type:'module',description:'Private local-install release-preparation candidate; not a public release',
    license:root.license,author:root.author,engines:root.engines,bin:root.bin,dependencies:Object.fromEntries(Object.entries(dependencies).sort(([a],[b])=>a.localeCompare(b))),
    files:['bin','dist','templates','scripts','packages','apps','docs','README.md','LICENSE','CHANGELOG.md','THIRD_PARTY_NOTICES.md']};
}

export function assertArchivePaths(paths:readonly string[]):void {
  assert(paths.length>0,'Empty package archive');
  for(const name of paths){
    assert(!name.startsWith('/') && !name.split('/').some(part=>part==='..'),'Unsafe archive path');
    assert(!/(^|\/)(?:node_modules|development-control|video-projects|renders|outputs|staging|\.cache|\.git)(\/|$)/.test(name),`Private/generated archive entry: ${name}`);
    assert(!/(^|\/)\.env(?:\.|$)|\.(?:pem|key|mp4|mov|wav|mp3|tgz)$/i.test(name),`Secret/production-media archive entry: ${name}`);
    assert(/^(?:package\.json$|README\.md$|LICENSE$|CHANGELOG\.md$|THIRD_PARTY_NOTICES\.md$|bin\/|dist\/|templates\/|scripts\/|packages\/|apps\/studio\/|docs\/)/.test(name),`Not allowlisted: ${name}`);
    assert(!/\.test\.[cm]?[jt]sx?$/.test(name),`Test leaked into archive: ${name}`);
  }
}
