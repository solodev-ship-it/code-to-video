import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRenderSession, root} from './render.ts';
import {qaFontManifest} from '../../apps/studio/src/qa/fonts.ts';
import {verifyFontManifestAssets} from './artifacts.ts';

export async function checkFontAssets(): Promise<void> {
  const base = path.join(root, 'apps/studio/public/fonts/atkinson');
  const provenance = JSON.parse(await readFile(path.join(base, 'PROVENANCE.json'), 'utf8')) as {files: {file: string; sha256: string}[]};
  for (const file of provenance.files) {
    const bytes = await readFile(path.join(base, file.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Font/license hash mismatch: ${file.file}`);
  }
  await verifyFontManifestAssets(qaFontManifest, path.join(root, 'apps/studio/public'));
}

export async function fontCheck() {
  await checkFontAssets();
  const base = path.join(root, 'tests/visual/current'); await mkdir(base, {recursive: true});
  const directory = await mkdtemp(path.join(base, 'fonts-'));
  const session = await createRenderSession(directory);
  const props = {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false, fixture: 'normal'};
  try {
    const result = await session.capture({compositionId: 'ReliabilityFixture', frame: 90, props, output: path.join(directory, 'font-success.png')});
    const proof = JSON.parse(result.artifacts.find((a) => a.filename === 'font-readiness.json')?.content ?? 'null') as {ready: boolean; faces: {family: string; weight: string; style: string; status: string}[]};
    assert(proof?.ready, 'Font readiness artifact missing');
    for (const weight of ['400', '700']) assert(proof.faces.some((face) => face.family.replace(/["']/g, '') === 'Atkinson Hyperlegible' && face.weight === weight && face.style === 'normal' && face.status === 'loaded'));
    await assert.rejects(session.capture({compositionId: 'ReliabilityFixture', frame: 90, props: {...props, fixture: 'font-failure'}, output: path.join(directory, 'must-not-render.png')}), /Required font failed/);
    await writeFile(path.join(directory, 'report.json'), JSON.stringify({schemaVersion: 1, timestamp: new Date().toISOString(), status: 'passed',
      compositionId: 'ReliabilityFixture', frame: 90, brandId: props.brandId, styleId: props.styleId,
      fontDiagnostics: proof, expectedMissingAssetFailureVerified: true, artifact: path.relative(root, directory)}, null, 2));
    console.log('PASS: pinned local font assets, both exact loaded weights, real Remotion font rendering, and missing-font render rejection.');
  } finally {await session.close();}
}
