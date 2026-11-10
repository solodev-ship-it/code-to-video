// Node-only project host shared by npm scripts and the optional CLI.
import {cp, mkdir, mkdtemp, readFile, writeFile, access, lstat, realpath} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {containedFile, loadProject} from '../packages/projects/src/load.ts';
import {createProjectRegistry} from '../packages/projects/src/registry.ts';
import {projectEntry} from './project-entry.ts';

export type ProjectMode = 'studio' | 'compositions' | 'render';
export type ProjectCommand = {
  frameworkRoot: string; mode: ProjectMode; projectRoot?: string; args: readonly string[];
  // Existing npm render:project remains scoped to framework renders/.
  allowExternalOutput?: boolean;
};
function inside(root: string, file: string): boolean {
  const relative = path.relative(root, file);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}
async function canonicalDestination(file: string): Promise<string> {
  let parent = path.dirname(file); const tail = [path.basename(file)];
  for (;;) {
    try {return path.join(await realpath(parent), ...tail);}
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      // A dangling symlink is not a missing directory we may safely traverse.
      try {if ((await lstat(parent)).isSymbolicLink()) throw new Error('Output parent contains a dangling symlink');}
      catch (check) {if ((check as NodeJS.ErrnoException).code !== 'ENOENT') throw check;}
      const next = path.dirname(parent);
      if (next === parent) throw error;
      tail.unshift(path.basename(parent)); parent = next;
    }
  }
}
export async function validateRenderOutput(root: string, output: string, allowExternal = false): Promise<string> {
  const destination = path.resolve(output);
  if (path.extname(destination).toLowerCase() !== '.mp4') throw new Error('Output must have an .mp4 extension');
  const canonicalRoot = await realpath(root);
  const canonical = await canonicalDestination(destination);
  const renders = path.join(canonicalRoot, 'renders');
  if ((!allowExternal || inside(canonicalRoot, canonical)) && (!inside(renders, canonical) || canonical === renders)) {
    throw new Error('Output inside the framework must be under ignored renders/');
  }
  // lstat also rejects existing/dangling symlinks. Never truncate a file.
  try {await lstat(destination); throw new Error('Output already exists');}
  catch (error) {if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;}
  return destination;
}
export async function prepareProjectCommand(command: ProjectCommand) {
  const {frameworkRoot: root, mode, projectRoot: selected} = command;
  if (!['studio','compositions','render'].includes(mode)) throw new Error('Expected studio, compositions or render');
  const extra = [...command.args];
  let entry = path.join(root, 'apps/studio/src/index.ts');
  let config: string | undefined;
  let project: Awaited<ReturnType<typeof loadProject>> | undefined;
  let themeModule: string | undefined;
  if (selected) {
    const projectRoot = path.resolve(selected);
    try {await access(path.join(projectRoot,'compositions/themes.ts')); themeModule = await containedFile(projectRoot,'compositions/themes.ts');}
    catch (error) {if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;}
    // Selecting project code is a trust decision; JSON validation does not sandbox it.
    const register = themeModule ? (await import(pathToFileURL(themeModule).href)).registerThemes : undefined;
    if (themeModule && typeof register !== 'function') throw new Error('compositions/themes.ts must export registerThemes(registry)');
    const version = JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version as string;
    project = await loadProject(projectRoot, createProjectRegistry(register), version);
    const existing = await readFile(path.join(root,'apps/studio/src/Root.tsx'),'utf8');
    const ids = new Set([...existing.matchAll(/id="([A-Za-z0-9-]+)"/g)].map(m => m[1]));
    ids.add('CodeToVideoIntro');
    for (const c of project.manifest.compositions) if (ids.has(c.id)) throw new Error(`compositions.${c.id}: collides with framework composition`);
  }
  if (mode === 'render') {
    if (!project) throw new Error('render:project requires CODE_TO_VIDEO_PROJECT');
    if (!project.manifest.compositions.some(c => c.id === extra[0])) throw new Error('render requires a manifest composition id');
    if (extra.length !== 2 || !extra[1] || extra[1].startsWith('-')) throw new Error('render requires a composition id and an explicit output path; settings are fixed');
    extra[1] = await validateRenderOutput(root, extra[1], command.allowExternalOutput);
    extra.push('--codec=h264','--pixel-format=yuv420p','--concurrency=1','--disallow-parallel-encoding','--overwrite=false');
  }
  if (project) {
    // All preflight checks precede session staging and output creation.
    await mkdir(path.join(root,'.cache/projects'), {recursive:true});
    const cache = await mkdtemp(path.join(root,'.cache/projects/session-'));
    const publicDir = path.join(cache,'public');
    await cp(path.join(root,'apps/studio/public'), publicDir, {recursive:true,errorOnExist:true,force:false});
    const paths = new Set<string>();
    for (const a of project.manifest.assets) {
      if (paths.has(a.path)) continue; paths.add(a.path);
      const destination = path.join(publicDir,'project-assets',a.path);
      await mkdir(path.dirname(destination), {recursive:true});
      await cp(await containedFile(project.root,a.path), destination, {errorOnExist:true,force:false});
    }
    entry = path.join(cache,'ProjectRoot.tsx');
    await writeFile(entry,projectEntry(project,root,themeModule),{flag:'wx'});
    config = path.join(cache,'remotion.config.ts');
    await writeFile(config,`import {Config} from '@remotion/cli/config';\nConfig.setPublicDir(${JSON.stringify(publicDir)});\nConfig.overrideWebpackConfig(c => ({...c, resolve: {...c.resolve, modules: [${JSON.stringify(path.join(root,'node_modules'))}, ...(c.resolve?.modules ?? [])]}}));\n`,{flag:'wx'});
    console.log(`Validated project ${project.manifest.id}; generated entry ${entry}`);
  }
  return {executable: path.join(root,'node_modules/.bin/remotion'), args:[mode,entry,...extra,...(config ? ['--config',config] : [])], cwd:path.join(root,'apps/studio')};
}
export async function runProjectCommand(command: ProjectCommand): Promise<number> {
  const launch = await prepareProjectCommand(command);
  return new Promise((resolve, reject) => {
    const child = spawn(launch.executable, launch.args, {cwd:launch.cwd,stdio:'inherit',env:process.env});
    const interrupt = () => child.kill('SIGINT'); const terminate = () => child.kill('SIGTERM');
    process.on('SIGINT',interrupt); process.on('SIGTERM',terminate);
    const cleanup = () => {process.off('SIGINT',interrupt);process.off('SIGTERM',terminate);};
    child.once('error', error => {cleanup();reject(error);});
    child.once('exit', (code, signal) => {cleanup();resolve(code ?? (signal ? 1 : 0));});
  });
}
