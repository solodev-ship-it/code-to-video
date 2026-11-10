import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync, readFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputRoot = path.join(root, 'renders', 'frame-checks');
mkdirSync(outputRoot, {recursive: true});
// Unique output preserves previous runs; no silent overwrites or cleanup.
const output = mkdtempSync(path.join(outputRoot, 'run-'));
const cli = path.join(root, 'node_modules', '.bin', 'remotion');
const hashes = new Map();
for (const [index, frame] of [0, 45, 90, 149, 90, 45, 0, 149].entries()) {
  const filename = path.join(output, `${index}-frame-${frame}.png`);
  const result = spawnSync(cli, ['still', 'src/index.ts', 'CodeToVideoIntro', filename,
    `--frame=${frame}`, '--log=error'], {cwd: path.join(root, 'apps/studio'), stdio: 'inherit'});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Frame ${frame} render failed.`);
  const hash = createHash('sha256').update(readFileSync(filename)).digest('hex');
  if (hashes.has(frame)) assert.equal(hash, hashes.get(frame), `Frame ${frame} changed between independent renders.`);
  hashes.set(frame, hash);
}
assert.notEqual(hashes.get(0), hashes.get(90), 'Animation must change the frame content.');
console.log(`PASS: frames 0, 45, 90, 149 match repeated out-of-order renders. Images: ${output}`);
