import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluateText, safeAreaGeometry} from './diagnostics/index.ts';
import type {TextMeasurement} from './diagnostics/index.ts';
const context = {compositionId: 'Fixture', frame: 90};
const fitting: TextMeasurement = {policy: {id: 'title', maxLines: 1, safeAreaId: 'safe'}, bounds: {x: 100, y: 100, width: 400, height: 80},
  scrollWidth: 400, clientWidth: 400, scrollHeight: 80, clientHeight: 80, lineCount: 1, clipsContent: false};
const areas = {safe: {x: 80, y: 80, width: 1760, height: 920}};
test('fitting title produces no layout failure', () => assert.deepEqual(evaluateText(fitting, context, areas), []));
test('long title, multiline paragraph and small clipped container produce actionable findings', () => {
  const findings = evaluateText({...fitting, scrollWidth: 700, scrollHeight: 240, lineCount: 3, clipsContent: true}, context, areas);
  assert.deepEqual(findings.map((f) => f.code), ['TEXT_OVERFLOW', 'TEXT_CLIPPED', 'TEXT_UNEXPECTED_WRAP']);
  for (const finding of findings) {assert.equal(finding.frame, 90); assert(finding.suggestedAction); assert.equal(finding.elementId, 'title');}
});
test('safe-area violation and intentional animation exemption are distinct and serializable', () => {
  const measured = {...fitting, bounds: {...fitting.bounds, x: -20}};
  assert.equal(evaluateText(measured, context, areas)[0]?.code, 'TEXT_OUTSIDE_SAFE_AREA');
  const exempt = evaluateText({...measured, policy: {...fitting.policy, exemptions: {codes: ['TEXT_OUTSIDE_SAFE_AREA'], reason: 'Intentional entrance at selected frame'}}}, context, areas);
  assert.equal(exempt[0]?.severity, 'info'); assert(exempt[0]?.exemptionReason);
  assert.deepEqual(JSON.parse(JSON.stringify(exempt)), exempt);
});
test('missing expected font and declared-family fallback risk are explicit', () => {
  const findings = evaluateText({...fitting, fontReady: false, declaredFamily: 'serif', policy: {...fitting.policy, expectedFont: {family: 'Required Sans', weight: 700, style: 'normal'}}}, context, areas);
  assert.deepEqual(findings.map((f) => f.code), ['FONT_NOT_READY', 'FONT_FALLBACK_DETECTED']);
});
test('safe geometry is frame-size aware, supports ratios/custom pixels and rejects empty regions', () => {
  assert.deepEqual(safeAreaGeometry(1920, 1080, {unit: 'ratio', top: 0.1, right: 0.1, bottom: 0.1, left: 0.1}), {x: 192, y: 108, width: 1536, height: 864});
  assert.deepEqual(safeAreaGeometry(1080, 1920, {unit: 'px', top: 100, right: 50, bottom: 100, left: 50}), {x: 50, y: 100, width: 980, height: 1720});
  assert.throws(() => safeAreaGeometry(1280, 720, {unit: 'ratio', top: 0.5, right: 0, bottom: 0.5, left: 0}), /no content/);
});
