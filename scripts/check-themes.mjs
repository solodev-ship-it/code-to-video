import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdtempSync, readFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputRoot = path.join(root, 'renders', 'theme-checks');
mkdirSync(outputRoot, {recursive: true});
const output = mkdtempSync(path.join(outputRoot, 'run-'));
const cli = path.join(root, 'node_modules', '.bin', 'remotion');
const hashes = new Map();
const firstFrames = new Map();
// Same scene with two selections supplied through actual Remotion inputProps.
for (const [index, [brandId, styleId, motionId, frame]] of [
  ['aurora-finance', 'cinematic', 'elegant', 20],
  ['ember-studio', 'minimal', 'energetic', 90],
  ['aurora-finance', 'minimal', 'elegant', 90],
  ['aurora-finance', 'cinematic', 'elegant', 90],
  ['aurora-finance', 'cinematic', 'energetic', 20],
  ['ember-studio', 'minimal', 'energetic', 20],
  ['aurora-finance', 'cinematic', 'elegant', 20],
  ['ember-studio', 'minimal', 'energetic', 90],
  ['aurora-finance', 'cinematic', 'elegant', 90],
].entries()) {
  const filename = path.join(output, `${index}-${brandId}-${styleId}-${frame}.png`);
  const props = JSON.stringify({schemaVersion: 1, brandId, styleId, motionId});
  const result = spawnSync(cli, ['still', 'src/index.ts', 'ThemeShowcase', filename,
    `--frame=${frame}`, `--props=${props}`, '--overwrite=false', '--log=error'],
  {cwd: path.join(root, 'apps/studio'), stdio: 'inherit'});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Theme ${brandId}/${styleId} frame ${frame} render failed.`);
  const bytes = readFileSync(filename);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Expected a PNG image.');
  assert.equal(bytes.readUInt32BE(16), 1920);
  assert.equal(bytes.readUInt32BE(20), 1080);
  const hash = createHash('sha256').update(bytes).digest('hex');
  const key = `${brandId}/${styleId}/${motionId}/${frame}`;
  if (hashes.has(key)) assert.equal(hash, hashes.get(key), `Non-deterministic frame: ${key}`);
  hashes.set(key, hash);
  if (frame === 90) firstFrames.set(`${brandId}/${styleId}`, hash);
}
assert.notEqual(firstFrames.get('aurora-finance/cinematic'), firstFrames.get('ember-studio/minimal'));
assert.notEqual(firstFrames.get('aurora-finance/cinematic'), firstFrames.get('aurora-finance/minimal'));
assert.notEqual(hashes.get('aurora-finance/cinematic/elegant/20'), hashes.get('aurora-finance/cinematic/elegant/90'));
assert.notEqual(hashes.get('aurora-finance/cinematic/elegant/20'), hashes.get('aurora-finance/cinematic/energetic/20'));
const invalidOutput = path.join(output, 'invalid-brand-must-not-render.png');
const invalid = spawnSync(cli, ['still', 'src/index.ts', 'ThemeShowcase', invalidOutput, '--frame=90',
  `--props=${JSON.stringify({schemaVersion: 1, brandId: 'missing-brand', styleId: 'minimal', motionId: 'elegant'})}`, '--log=error'],
{cwd: path.join(root, 'apps/studio'), encoding: 'utf8'});
if (invalid.error) throw invalid.error;
assert.notEqual(invalid.status, 0, 'Unknown brand must not render a fallback.');
assert.match(invalid.stdout + invalid.stderr, /Unknown brand ID: missing-brand/);
assert.equal(existsSync(invalidOutput), false);
console.log(`PASS: valid 1920×1080 theme PNGs, distinct brands/styles/motion, repeated out-of-order frames, and invalid-brand render rejection. Images: ${output}`);
