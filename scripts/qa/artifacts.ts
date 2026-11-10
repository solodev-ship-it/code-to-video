import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {PNG} from 'pngjs';
import {within} from './baselines.ts';
import type {FontManifest} from '../../packages/ui/src/font-manifest.ts';

export async function verifyPngOutput(file: string, width: number, height: number): Promise<void> {
  try {
    if (!(await stat(file)).size) throw new Error('empty file');
    const image = PNG.sync.read(await readFile(file));
    if (image.width !== width || image.height !== height) throw new Error('unexpected dimensions');
  } catch (error) {throw new Error(`Missing/invalid render output: ${file}: ${String(error)}`);}
}
export async function verifyFontManifestAssets(manifest: FontManifest, publicRoot: string): Promise<void> {
  const root = await realpath(publicRoot);
  for (const face of manifest.faces) {
    try {
      const file = within(root, face.src.slice(1)); const resolved = await realpath(file); within(root, resolved);
      const bytes = await readFile(resolved); const magic = bytes.subarray(0, 4).toString('hex');
      if (!['00010000', '4f54544f', '774f4646', '774f4632'].includes(magic)) throw new Error('not a supported font file header');
    } catch (error) {throw new Error(`Missing/invalid required font asset ${face.id} (${face.family} ${face.weight} ${face.style}): ${String(error)}`);}
  }
}
