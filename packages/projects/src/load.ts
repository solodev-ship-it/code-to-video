// Node-only preflight; never imported by browser scenes.
import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {validateProjectManifest} from './manifest.ts';
import {createProjectRegistry} from './registry.ts';
import type {ThemeRegistry} from '../../themes/src/index.ts';
export async function containedFile(root: string, relative: string): Promise<string> {
  if (!/^[a-zA-Z0-9_./-]+$/.test(relative) || relative.startsWith('/') || relative.split('/').some(p => !p || p === '.' || p === '..')) throw new Error(`${relative}: must be a safe relative path`);
  const base = await realpath(root);
  let file: string;
  try {file = await realpath(path.resolve(base, relative));}
  catch {throw new Error(`${relative}: missing file`);}
  const rel = path.relative(base, file);
  if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error(`${relative}: escapes project root`);
  if (!(await stat(file)).isFile()) throw new Error(`${relative}: must be a file`);
  return file;
}
export async function loadProject(root: string, registry: ThemeRegistry = createProjectRegistry(), frameworkVersion = '0.1.0') {
  const projectRoot = await realpath(root);
  const file = await containedFile(projectRoot, 'code-to-video.project.json');
  const manifest = validateProjectManifest(JSON.parse(await readFile(file, 'utf8')), registry, frameworkVersion);
  const assets: Record<string, string> = {};
  for (const asset of manifest.assets) assets[asset.id] = await containedFile(projectRoot, asset.path);
  const compositions: Record<string, string> = {};
  for (const composition of manifest.compositions) compositions[composition.id] = await containedFile(projectRoot, `compositions/${composition.id}.tsx`);
  return Object.freeze({root: projectRoot, manifest, assets: Object.freeze(assets), compositions: Object.freeze(compositions)});
}
