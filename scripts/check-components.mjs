import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdtempSync, readFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputRoot = path.join(root, 'renders', 'component-checks');
mkdirSync(outputRoot, {recursive: true});
const output = mkdtempSync(path.join(outputRoot, 'run-'));
const cli = path.join(root, 'node_modules', '.bin', 'remotion');
const hashes = new Map();
for (const [index, [brandId, styleId, motionId, frame, reducedMotion]] of [
  ['aurora-finance', 'cinematic', 'elegant', 30, false],
  ['aurora-finance', 'cinematic', 'elegant', 180, false],
  ['ember-studio', 'minimal', 'energetic', 180, false],
  ['aurora-finance', 'minimal', 'elegant', 180, false],
  ['ember-studio', 'cinematic', 'elegant', 180, false],
  ['aurora-finance', 'cinematic', 'elegant', 30, false],
  ['aurora-finance', 'cinematic', 'elegant', 180, false],
  ['ember-studio', 'minimal', 'energetic', 180, false],
  ['aurora-finance', 'cinematic', 'elegant', 30, true],
  ['aurora-finance', 'cinematic', 'elegant', 30, true],
].entries()) {
  const filename = path.join(output, `${index}-${brandId}-${styleId}-${frame}.png`);
  const props = JSON.stringify({schemaVersion: 1, brandId, styleId, motionId, reducedMotion});
  const result = spawnSync(cli, ['still', 'src/index.ts', 'ComponentShowcase', filename,
    `--frame=${frame}`, `--props=${props}`, '--overwrite=false', '--log=error'],
  {cwd: path.join(root, 'apps/studio'), stdio: 'inherit'});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Component frame failed: ${props}, frame ${frame}`);
  const bytes = readFileSync(filename);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), 1920);
  assert.equal(bytes.readUInt32BE(20), 1080);
  const hash = createHash('sha256').update(bytes).digest('hex');
  const key = `${brandId}/${styleId}/${frame}/${reducedMotion}`;
  if (hashes.has(key)) assert.equal(hash, hashes.get(key), `Frame changed independently: ${key}`);
  hashes.set(key, hash);
}
assert.notEqual(hashes.get('aurora-finance/cinematic/180/false'), hashes.get('ember-studio/minimal/180/false'));
assert.notEqual(hashes.get('aurora-finance/cinematic/180/false'), hashes.get('aurora-finance/minimal/180/false'));
assert.notEqual(hashes.get('aurora-finance/cinematic/30/false'), hashes.get('aurora-finance/cinematic/180/false'));
assert.notEqual(hashes.get('aurora-finance/cinematic/30/false'), hashes.get('aurora-finance/cinematic/30/true'));
const invalidFile = path.join(output, 'invalid-props-must-not-render.png');
const invalid = spawnSync(cli, ['still', 'src/index.ts', 'ComponentShowcase', invalidFile, '--frame=180',
  `--props=${JSON.stringify({schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: 'auto'})}`, '--log=error'],
{cwd: path.join(root, 'apps/studio'), encoding: 'utf8'});
if (invalid.error) throw invalid.error;
assert.notEqual(invalid.status, 0);
assert.match(invalid.stdout + invalid.stderr, /reducedMotion must be a boolean/);
assert.equal(existsSync(invalidFile), false);
console.log(`PASS: component PNGs for all four brand/style pairs, independent repeated frames, explicit reduced motion, and invalid-props rejection. Images: ${output}`);
