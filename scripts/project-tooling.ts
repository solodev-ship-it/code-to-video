// Node-only dependency resolution works in both a workspace and a hoisted install.
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

export async function projectTooling(root:string) {
  const require=createRequire(path.join(root,'package.json'));
  const cliFile=require.resolve('@remotion/cli/package.json');
  const cli=JSON.parse(await readFile(cliFile,'utf8'));
  const modulesRoot=path.dirname(path.dirname(require.resolve('react/package.json')));
  const aliases:Record<string,string>={};
  for(const folder of ['themes','ui']) {
    const directory=path.join(root,'packages',folder);
    const manifest=JSON.parse(await readFile(path.join(directory,'package.json'),'utf8')) as {name:string;exports:Record<string,string>};
    for(const [key,value] of Object.entries(manifest.exports)) {
      if(!value.startsWith('./src/') || value.includes('..'))throw new Error('Unsupported first-party package export');
      aliases[`${manifest.name}${key==='.'?'':key.slice(1)}$`]=path.join(directory,value);
    }
  }
  const manifest=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  return {modulesRoot,aliases,remotionExecutable:path.resolve(path.dirname(cliFile),cli.bin.remotion),sourceWorkspace:Array.isArray(manifest.workspaces)};
}
