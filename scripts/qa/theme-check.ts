import assert from 'node:assert/strict';
import {visualCases} from '../../tests/visual/cases.ts';
import {captureCases} from './visual.ts';
import type {VisualCase} from './cases.ts';

export async function themeCheck(run: string) {
  const normal = visualCases.filter((c) => c.compositionId === 'ReliabilityFixture');
  const settled = normal.filter((c) => c.frame === 90);
  const edgeCases: VisualCase[] = settled.flatMap((c) => ['optional', 'non-ascii'].map((fixture) => ({...c, id: `${c.id}-${fixture}`, props: {...c.props, fixture}})));
  const report = await captureCases([...normal, ...edgeCases], run, true);
  if (report.status !== 'passed') throw new Error('Cross-theme capture/layout/font/determinism gate failed.');
  const hashes = report.cases.filter((c) => c.case.props.fixture === 'normal' && c.case.frame === 90).map((c) => c.hashes?.png);
  assert.equal(hashes.length, 4); assert.equal(new Set(hashes).size, 4, 'Four theme combinations must produce distinct surfaces/colors.');
  console.log('PASS: four brand/style combinations, entering/settled/exiting frames, optional/non-ASCII copy, loaded local faces, measured layout, and exact repeat pixels.');
  return report;
}
