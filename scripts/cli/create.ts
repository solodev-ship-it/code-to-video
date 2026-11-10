import {readFile, realpath, lstat, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {validateProjectManifest} from '../../packages/projects/src/manifest.ts';
import {createProjectRegistry} from '../../packages/projects/src/registry.ts';
import {getTemplate} from './templates.ts';
import type {CreateOptions} from './args.ts';

export async function createProject(options: CreateOptions, frameworkRoot: string) {
  const root = await realpath(frameworkRoot);
  const destination = path.resolve(options.directory);
  const template = getTemplate(options.template);
  const version = JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version as string;
  const manifest = validateProjectManifest({
    schemaVersion:1,id:options.id ?? path.basename(destination),title:options.title ?? path.basename(destination),
    framework:{name:'code-to-video',version},width:1920,height:1080,fps:30,
    theme:{brandId:options.brandId,styleId:options.styleId,motionId:options.motionId},assets:[],
    compositions:[{id:template.compositionId,durationInFrames:template.durationInFrames,props:template.props}],
  },createProjectRegistry(),version);
  // Validate all data and read template inputs before the first project write.
  const source = await readFile(path.join(root,'templates',template.id,`${template.compositionId}.tsx`),'utf8');
  const parent = await realpath(path.dirname(destination)).catch(() => {throw new Error('Create requires an existing parent directory');});
  const canonical = path.join(parent,path.basename(destination));
  const relative = path.relative(root,canonical);
  if (relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))) throw new Error('Create an independent project outside the framework directory');
  try {await lstat(destination);throw new Error('Destination already exists; choose a new directory');}
  catch (error) {if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;}
  const engineRelative = path.relative(destination,root).split(path.sep).join('/') || '.';
  const tsconfig = {
    extends:`${engineRelative}/apps/studio/tsconfig.json`,
    compilerOptions:{baseUrl:engineRelative,typeRoots:[`${engineRelative}/node_modules/@types`],paths:{
      '@code-to-video/themes':['packages/themes/src/index.ts'],'@code-to-video/themes/*':['packages/themes/src/*'],
      '@code-to-video/ui':['packages/ui/src/index.ts'],'@code-to-video/ui/*':['packages/ui/src/*'],
      react:['node_modules/@types/react/index.d.ts'],'react/*':['node_modules/@types/react/*'],
      'react-dom':['node_modules/@types/react-dom/index.d.ts'],'react-dom/*':['node_modules/@types/react-dom/*'],
      '*':['node_modules/*'],
    }},include:['compositions'],
  };
  const bin = path.join(root,'bin/code-to-video.mjs');
  const quotedBin = "'" + bin.replaceAll("'", "'\\''") + "'";
  const readme = `# ${manifest.title}\n\nGenerated ${template.id} project. All initial copy is sample copy. Review facts, rights, layout and fonts before production.\n\nFrom this project directory, run (Node 24.7+ with the framework CLI built):\n\n\`\`\`sh\nnode ${quotedBin} preview .\nnode ${quotedBin} render . ${template.compositionId} --output outputs/${template.compositionId}-v1.mp4\n\`\`\`\n\nEdit code-to-video.project.json for copy/theme/timing. Scene source is in compositions/. Assets stay in assets/ and must be listed by id in the manifest. Animation uses frames and FPS. No packages were installed and no Git repository was initialized. The generated tsconfig points to the selected framework; update its path if either directory moves.\n\nStudio Save edits a disposable engine cache entry; persist intended changes in the manifest before restarting. Only run project source you trust. This project does not need management files or AI credentials. System-font layout can differ across machines.\n`;
  const files: [string,string][] = [
    ['code-to-video.project.json',JSON.stringify(manifest,null,2)+'\n'],
    [`compositions/${template.compositionId}.tsx`,source],['assets/README.txt','Add your reviewed local assets here and list them in the manifest. No media is bundled.\n'],
    ['tsconfig.json',JSON.stringify(tsconfig,null,2)+'\n'],['README.md',readme],
    ['.gitignore','node_modules/\noutputs/\n.renders/\n.cache/\n.env\n.env.*\n'],
  ];
  // mkdir without recursive/rename refuses a racing pre-existing directory too.
  await mkdir(destination);
  try {
    await mkdir(path.join(destination,'assets'));await mkdir(path.join(destination,'compositions'));
    for (const [name,content] of files) await writeFile(path.join(destination,name),content,{flag:'wx'});
  } catch (error) {
    // Preserve all files: a user may have touched the directory after it was created.
    throw new Error(`Project creation interrupted at ${destination}; inspect that directory before retrying`,{cause:error});
  }
  return {root:destination,manifest};
}
