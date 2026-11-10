import {mkdir, readFile, writeFile, stat, readdir, realpath, lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {PNG} from 'pngjs';
import type {CaseResult} from './reports.ts';
import {caseKey} from './cases.ts';

export const hash = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');
export function within(base: string, file: string): string {
  const absolute = path.resolve(base, file);
  if (absolute !== path.resolve(base) && !absolute.startsWith(path.resolve(base) + path.sep)) throw new Error('QA artifact path escapes its approved root.');
  return absolute;
}
export async function approveBaseline(root: string, row: CaseResult, reviewer: string, reason: string, replace = false): Promise<void> {
  if (!reviewer.trim() || !reason.trim()) throw new Error('Approval requires explicit reviewer and review reason.');
  if (row.status === 'failed' || !row.environment || !row.hashes || row.key !== caseKey(row.case) || row.layoutDiagnostics.some((d) => d.severity === 'error')) throw new Error('Cannot approve an invalid/failed candidate.');
  const currentRoot = path.join(root, 'tests/visual/current');
  within(await realpath(root), await realpath(currentRoot));
  const image = within(currentRoot, path.relative(currentRoot, within(root, row.artifacts.image)));
  const real = await realpath(image); within(await realpath(currentRoot), real);
  const bytes = await readFile(real);
  if (hash(bytes) !== row.hashes.png) throw new Error('Candidate changed after capture; recapture before approval.');
  const decoded = PNG.sync.read(bytes);
  if (decoded.width !== row.case.width || decoded.height !== row.case.height) throw new Error('Candidate dimensions do not match its case.');
  if (bytes.length > 2 * 1024 * 1024) throw new Error('Baseline exceeds the 2 MiB per-image limit.');
  const directory = path.join(root, 'tests/visual/baselines'); await mkdir(directory, {recursive: true});
  within(await realpath(root), await realpath(directory));
  if ((await lstat(directory)).isSymbolicLink()) throw new Error('Baseline directory must not be a symlink.');
  const png = path.join(directory, `${row.key}.png`); const metadata = path.join(directory, `${row.key}.json`);
  for (const file of [png, metadata]) {
    const entry = await lstat(file).catch((error: NodeJS.ErrnoException) => {if (error.code === 'ENOENT') return undefined; throw error;});
    if (entry?.isSymbolicLink()) throw new Error('Baseline destinations must not be symlinks.');
    if (entry && !replace) throw new Error('EEXIST: baseline replacement requires explicit --replace and review reason.');
  }
  const total = (await Promise.all((await readdir(directory)).filter((file) => file.endsWith('.png')).map(async (file) => (await stat(path.join(directory, file))).size))).reduce((a, b) => a + b, 0);
  if (total + bytes.length > 20 * 1024 * 1024) throw new Error('Approved baseline budget exceeds 20 MiB; review/reduce the case matrix.');
  if (replace) {
    // Explicit replacement still refuses symlink destinations.
    for (const file of [png, metadata]) {
      const resolved = await realpath(file).catch(() => file); within(directory, resolved);
    }
  }
  await writeFile(png, bytes, {flag: replace ? 'w' : 'wx'});
  await writeFile(metadata, JSON.stringify({schemaVersion: 1, case: row.case, key: row.key, environment: row.environment,
    sourceHash: row.sourceHash, sha256: row.hashes.png, approval: {reviewer, reason, timestamp: new Date().toISOString()}}, null, 2) + '\n', {flag: replace ? 'w' : 'wx'});
}
