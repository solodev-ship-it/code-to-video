import {realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {validateAssetSource} from '../../packages/ui/src/cinematic.ts';
// Host preflight only. This is not staging or permission to load external projects.
export async function verifyCinematicAssets(publicRoot: string, input: unknown): Promise<void> {
  const source = validateAssetSource(input);
  const root = await realpath(publicRoot);
  for (const name of source.type === 'sequence' ? source.frames : [source.src]) {
    let file: string;
    try {file = await realpath(path.join(root, name));}
    catch {throw new Error(`Missing cinematic asset: ${name}`);}
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Cinematic asset escapes public root: ${name}`);
    if (!(await stat(file)).isFile()) throw new Error(`Cinematic asset is not a file: ${name}`);
  }
}
