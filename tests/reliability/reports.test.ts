import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PNG} from 'pngjs';
import {verifyFontManifestAssets, verifyPngOutput} from '../../scripts/qa/artifacts.ts';
import {serializeReport, environmentDrift} from '../../scripts/qa/reports.ts';
import type {Fingerprint, QualityReport} from '../../scripts/qa/reports.ts';
import {validateFontManifest} from '../../packages/ui/src/fonts.ts';
import {visualCases} from '../visual/cases.ts';
import {caseKey} from '../../scripts/qa/cases.ts';

test('quality reports preserve case identity, status, structured errors and relative artifacts', () => {
  const c = visualCases[0]!;
  const report: QualityReport = {schemaVersion: 1, timestamp: '2026-11-09T00:00:00Z', run: 'unit', status: 'failed',
    cases: [{key: caseKey(c), case: c, status: 'failed', sourceHash: 'unit-source', fontDiagnostics: [], layoutDiagnostics: [],
      artifacts: {image: 'tests/visual/current/unit/image.png'}, error: {code: 'MISSING_OUTPUT', message: 'Synthetic negative unit fixture'}}]};
  assert.deepEqual(JSON.parse(serializeReport(report)), report);
  assert.throws(() => serializeReport({...report, cases: [{...report.cases[0]!, status: 'passed'}]}), /evidence/);
});
test('environment drift remains distinct from source/case changes', () => {
  const env: Fingerprint = {os: {platform: 'unit', release: '1'}, arch: 'arm64', node: 'v24.7.0', remotion: '4.0.541', browser: {product: 'unit', revision: '1', userAgent: 'unit'},
    viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1, render: {gl: 'swangle', scale: 1, imageFormat: 'png', fps: 30}};
  assert.equal(environmentDrift(env, structuredClone(env)), false);
  assert.equal(environmentDrift(env, {...env, arch: 'x64'}), true);
  assert.equal(environmentDrift(env, {...env, browser: {...env.browser, revision: '2'}}), true);
});
test('missing/invalid output and missing/invalid local font assets fail before a fabricated pass', async () => {
  const base = path.resolve('.cache/qa-unit'); await mkdir(base, {recursive: true}); const directory = await mkdtemp(path.join(base, 'artifacts-'));
  await assert.rejects(verifyPngOutput(path.join(directory, 'missing.png'), 2, 2), /Missing\/invalid render output/);
  const file = path.join(directory, 'bad.png'); await writeFile(file, 'bad'); await assert.rejects(verifyPngOutput(file, 2, 2), /invalid render output/);
  const png = new PNG({width: 2, height: 2}); await writeFile(file, PNG.sync.write(png)); await verifyPngOutput(file, 2, 2);
  const manifest = validateFontManifest({schemaVersion: 1, faces: [{id: 'test', family: 'Test', src: '/font.ttf', weight: 400, style: 'normal',
    license: {name: 'Unit metadata only', source: 'fixture', redistributionApproved: true}}]});
  await assert.rejects(verifyFontManifestAssets(manifest, directory), /Missing\/invalid required font asset test/);
  await writeFile(path.join(directory, 'font.ttf'), 'not a font');
  await assert.rejects(verifyFontManifestAssets(manifest, directory), /font file header/);
});
