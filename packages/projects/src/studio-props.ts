// Node-only persisted content props. Never imported by rendered scenes.
import {lstat, readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateProjectManifest} from './manifest.ts';
import type {ProjectManifest} from './manifest.ts';
import type {ThemeRegistry} from '../../themes/src/index.ts';

export const studioPropsName = 'studio-props.json';
export const manifestHash = (text: string): string => createHash('sha256').update(text).digest('hex');

// Writable state may not use symlinks, including dangling links.
export async function readStudioProps(root: string): Promise<string | undefined> {
  const file = path.join(root, studioPropsName);
  try {
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error(`${studioPropsName}: expected a regular non-symlink file`);
    return await readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export function applyStudioProps(source: ProjectManifest, revision: string, text: string | undefined, registry: ThemeRegistry, version = '0.1.0'): ProjectManifest {
  if (text === undefined) return source;
  const saved = JSON.parse(text);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved) ||
      Object.keys(saved).sort().join(',') !== 'compositions,manifestSHA256,schemaVersion' ||
      saved.schemaVersion !== 1 || saved.manifestSHA256 !== revision) {
    throw new Error(`${studioPropsName}: invalid schema or manifest changed; review/move saved props before retrying (nothing overwritten)`);
  }
  if (!saved.compositions || typeof saved.compositions !== 'object' || Array.isArray(saved.compositions)) throw new Error(`${studioPropsName}: compositions must be an object`);
  const ids = new Set(source.compositions.map(c => c.id));
  for (const id of Object.keys(saved.compositions)) if (!ids.has(id)) throw new Error(`${studioPropsName}: unknown composition ${id}`);
  return validateProjectManifest({...source, compositions:source.compositions.map(c =>
    Object.hasOwn(saved.compositions, c.id) ? {...c, props:saved.compositions[c.id]} : c,
  )}, registry, version);
}
