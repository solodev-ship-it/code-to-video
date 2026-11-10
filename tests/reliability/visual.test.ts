import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PNG} from 'pngjs';
import {comparePng, compareFiles, strictComparison} from '../../scripts/qa/compare.ts';
import {caseKey, validateCase} from '../../scripts/qa/cases.ts';
import {approveBaseline, hash, within} from '../../scripts/qa/baselines.ts';
import {visualCases} from '../visual/cases.ts';
import type {CaseResult, Fingerprint} from '../../scripts/qa/reports.ts';

function image(width = 2, height = 2, changed = false): Buffer {
  const png = new PNG({width, height}); png.data.fill(255);
  if (changed) {png.data[0] = 0; png.data[1] = 0; png.data[2] = 0;}
  return PNG.sync.write(png);
}
test('identical PNGs pass exact pixel comparison, changed pixels fail and generate a valid diff', () => {
  assert.equal(comparePng(image(), image()).metrics.differingPixels, 0);
  const result = comparePng(image(), image(2, 2, true));
  assert.equal(result.metrics.status, 'different'); assert.equal(result.metrics.differingPixels, 1);
  assert.equal(result.metrics.differencePercent, 25); assert(result.diff);
  assert.equal(PNG.sync.read(result.diff).width, 2);
});
test('threshold boundary is inclusive and invalid tolerances fail', () => {
  assert.equal(comparePng(image(), image(2, 2, true), {...strictComparison, maxDiffPercent: 25}).metrics.status, 'passed');
  assert.equal(comparePng(image(), image(2, 2, true), {...strictComparison, maxDiffPercent: 24.99}).metrics.status, 'different');
  assert.throws(() => comparePng(image(), image(), {...strictComparison, pixelThreshold: -1}), /threshold/);
  assert.equal(comparePng(image(), image(), {mode: 'perceptual', pixelThreshold: 0.05, maxDiffPercent: 0}).metrics.status, 'passed');
});
test('dimensions, corrupt PNGs and missing baseline are distinct failures', () => {
  assert.equal(comparePng(image(), image(3, 2)).metrics.status, 'dimension-mismatch');
  assert.equal(comparePng(Buffer.from('not a PNG'), image()).metrics.status, 'invalid-image');
  assert.equal(compareFiles('not-read', '/missing-qa-baseline-file', 'not-written').status, 'missing-baseline');
});
test('case keys are stable across property order, include props and reject invalid JSON/cases', () => {
  const c = visualCases[0]!;
  assert.equal(caseKey(c), caseKey(JSON.parse(JSON.stringify(c))));
  assert.equal(caseKey({...c, props: Object.fromEntries(Object.entries(c.props).reverse())}), caseKey(c));
  assert.notEqual(caseKey({...c, frame: c.frame + 1}), caseKey(c));
  assert.throws(() => validateCase({...c, frame: -1}), /frame/);
  assert.throws(() => validateCase({...c, props: {...c.props, bad: () => 1}}), /JSON/);
  assert.throws(() => validateCase({...c, brandId: 'wrong-brand'}), /match/);
  assert.throws(() => validateCase({...c, unknown: true}), /Unknown/);
  assert.throws(() => within('/approved', '../outside'), /escapes/);
});
test('all matrix case names are unique, versioned and cover meaningful nonzero frames', () => {
  assert.equal(new Set(visualCases.map(caseKey)).size, visualCases.length);
  assert(visualCases.every((c) => c.frame > 0));
  assert.equal(new Set(visualCases.filter((c) => c.compositionId === 'ReliabilityFixture').map((c) => `${c.brandId}/${c.styleId}`)).size, 4);
});
test('approval is explicit, preserves hashes/environment/report fields and never silently replaces baseline', async () => {
  const base = path.resolve('.cache/qa-unit'); await mkdir(base, {recursive: true});
  const root = await mkdtemp(path.join(base, 'baseline-'));
  const directory = path.join(root, 'tests/visual/current/unit'); await mkdir(directory, {recursive: true});
  const imagePath = path.join(directory, 'candidate.png'); const png = image(); await writeFile(imagePath, png);
  const c = {...visualCases[0]!, width: 2, height: 2};
  const environment: Fingerprint = {os: {platform: 'unit-fixture', release: 'unit'}, arch: 'unit', node: 'unit', remotion: 'unit',
    browser: {product: 'unit', revision: 'unit', userAgent: 'unit'}, viewport: {width: 2, height: 2}, deviceScaleFactor: 1, render: {gl: 'unit', scale: 1, imageFormat: 'png', fps: 30}};
  const row: CaseResult = {key: caseKey(c), case: c, status: 'captured', sourceHash: 'unit', environment, fontDiagnostics: [], layoutDiagnostics: [], hashes: {png: hash(png)}, artifacts: {image: 'tests/visual/current/unit/candidate.png'}};
  await assert.rejects(approveBaseline(root, row, '', ''), /reviewer/);
  await approveBaseline(root, row, 'Unit test reviewer', 'Synthetic fixture, not a real visual approval');
  const metadata = JSON.parse(await readFile(path.join(root, 'tests/visual/baselines', `${row.key}.json`), 'utf8')) as {sha256: string; environment: Fingerprint};
  assert.equal(metadata.sha256, hash(png)); assert.deepEqual(metadata.environment, environment);
  await assert.rejects(approveBaseline(root, row, 'Unit', 'No overwrite'), /EEXIST/);
  await writeFile(imagePath, image(2, 2, true));
  await assert.rejects(approveBaseline(root, row, 'Unit', 'Tamper proof'), /changed after capture/);
});
