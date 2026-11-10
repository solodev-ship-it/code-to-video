import assert from 'node:assert/strict';
import {mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRenderSession, relative, root} from './render.ts';
import type {LayoutReport} from '../../packages/ui/src/diagnostics/types.ts';

export async function layoutCheck() {
  const base = path.join(root, 'tests/visual/current'); await mkdir(base, {recursive: true});
  const directory = await mkdtemp(path.join(base, 'layout-')); const session = await createRenderSession(directory);
  const rows: {fixture: string; report: LayoutReport}[] = [];
  const props = {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false};
  const expected: Record<string, string[]> = {normal: [], overflow: ['TEXT_OVERFLOW', 'TEXT_CLIPPED'], small: ['TEXT_OVERFLOW'], wrap: ['TEXT_UNEXPECTED_WRAP'],
    'safe-violation': ['TEXT_OUTSIDE_SAFE_AREA'], 'animation-exempt': ['TEXT_OUTSIDE_SAFE_AREA'], 'not-ready': ['FONT_NOT_READY'], fallback: ['FONT_FALLBACK_DETECTED'], optional: [], 'non-ascii': []};
  try {
    for (const [fixture, codes] of Object.entries(expected)) {
      const captured = await session.capture({compositionId: 'ReliabilityFixture', frame: 90, props: {...props, fixture}, output: path.join(directory, `${fixture}.png`)});
      const artifact = captured.artifacts.find((a) => a.filename === 'layout.json'); assert(artifact, 'Missing browser layout artifact');
      const report = JSON.parse(artifact.content) as LayoutReport;
      for (const code of codes) assert(report.diagnostics.some((finding) => finding.code === code), `${fixture}: expected ${code}`);
      if (!codes.length) assert.equal(report.diagnostics.filter((f) => f.severity === 'error').length, 0, `${fixture}: ${JSON.stringify(report.diagnostics)}`);
      if (fixture === 'animation-exempt') assert(report.diagnostics.filter((f) => f.code === 'TEXT_OUTSIDE_SAFE_AREA').every((f) => f.severity === 'info'));
      rows.push({fixture, report});
    }
    const smaller = await session.capture({compositionId: 'ReliabilityFixture', frame: 90, props: {...props, fixture: 'normal'}, width: 1280, height: 720, output: path.join(directory, 'normal-720p.png')});
    const smallReport = JSON.parse(smaller.artifacts.find((a) => a.filename === 'layout.json')!.content) as LayoutReport;
    assert.equal(smallReport.diagnostics.filter((f) => f.severity === 'error').length, 0);
    await writeFile(path.join(directory, 'report.json'), JSON.stringify({schemaVersion: 1, status: 'passed', rows, smaller: smallReport}, null, 2));
    console.log(`PASS: real browser passing/failing layout fixtures, expected font findings, exemptions, 1080p/720p geometry. ${relative(directory)}`);
  } finally {await session.close();}
}
