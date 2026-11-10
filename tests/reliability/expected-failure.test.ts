import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';
import {mkdir, mkdtemp, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {caseKey} from '../../scripts/qa/cases.ts';
import {CriticalLayoutError, errorEvidence, reportError} from '../../scripts/qa/errors.ts';
import {assertExpectedFailure, ExpectedFailureMismatch} from '../../scripts/qa/expected-failure.ts';
import {failureCheck, negativeCases} from '../../scripts/qa/failure-check.ts';
import type {QualityReport} from '../../scripts/qa/reports.ts';
import type {ErrorEvidence} from '../../scripts/qa/errors.ts';
import type {Diagnostic} from '../../packages/ui/src/diagnostics/types.ts';

const definitions = negativeCases();
// Minimal transcripts of the pinned renderer/validator errors. Do not generate
// their text from matcher patterns; real render integration verifies them too.
const originalErrors = [
  () => new Error('Error: Could not find composition with ID NotRegistered. Available compositions: CodeToVideoIntro, ReliabilityFixture'),
  () => new Error('Error: Unknown reliability fixture.'),
  () => new CriticalLayoutError(['TEXT_OVERFLOW', 'TEXT_CLIPPED']),
];
function findings(): Diagnostic[] {
  return ['TEXT_OVERFLOW', 'TEXT_CLIPPED'].map((code) => ({compositionId: 'ReliabilityFixture', frame: 90,
    elementId: 'qa-title', severity: 'error', code: code as Diagnostic['code'], message: 'Observed layout failure', suggestedAction: 'Review explicit sizing.'}));
}
function fixture(index: number, error: unknown = originalErrors[index]!()): QualityReport {
  const c = structuredClone(definitions[index]!.case);
  return {schemaVersion: 1, timestamp: '2026-11-10T00:00:00Z', run: 'unit-negative', status: 'failed',
    cases: [{key: caseKey(c), case: c, status: 'failed', sourceHash: 'unit-fixture', fontDiagnostics: [],
      layoutDiagnostics: index === 2 ? findings() : [], artifacts: {image: 'tests/visual/current/unit/not-a-real-capture.png'}, error: reportError('CAPTURE_FAILED', error, '')}],
    error: reportError('QA_CAPTURE_FAILED', error, '')};
}
function rejects(report: QualityReport, index: number, text?: RegExp) {
  assert.throws(() => assertExpectedFailure(report, definitions[index]!), (error: unknown) =>
    error instanceof ExpectedFailureMismatch && (!text || text.test(error.message)));
}

for (const [index, definition] of definitions.entries()) {
  test(`${definition.expectation.kind}: intended rejection and required evidence pass`, () => {
    assert.doesNotThrow(() => assertExpectedFailure(fixture(index), definition));
  });
  for (const [label, error] of [
    ['GPU_LOST', Object.assign(new Error('GPU_LOST: renderer device lost'), {code: 'GPU_LOST'})],
    ['browser crash', Object.assign(new Error('Browser process crashed'), {name: 'TargetClosedError'})],
    ['unrelated timeout', Object.assign(new Error('Navigation timed out after 30000 ms'), {code: 'ETIMEDOUT'})],
    ['filesystem failure', Object.assign(new Error('ENOENT: unrelated output file'), {code: 'ENOENT'})],
    ['arbitrary renderer failure', new Error('Unexpected shader/render failure')],
  ] as const) {
    test(`${definition.expectation.kind}: ${label} never satisfies the expected rejection`, () => rejects(fixture(index, error), index));
  }
  test(`${definition.expectation.kind}: successful capture is a missing expected rejection`, () => {
    const report = fixture(index); report.status = 'captured'; report.cases[0]!.status = 'captured';
    assert.throws(() => assertExpectedFailure(report, definition), (error: unknown) =>
      error instanceof ExpectedFailureMismatch && error.code === 'MISSING_EXPECTED_REJECTION');
  });
}
test('failed envelope cannot conceal a successful case or a different case/props/frame', () => {
  const report = fixture(0); report.cases[0]!.status = 'captured'; rejects(report, 0, /did not reject/);
  const wrong = fixture(0); wrong.cases[0]!.case.frame++; rejects(wrong, 0, /different case/);
});
test('failure report must provide exactly one case and both error envelopes', () => {
  const empty = fixture(0); empty.cases = []; rejects(empty, 0, /exactly one/);
  const multiple = fixture(0); multiple.cases.push(structuredClone(multiple.cases[0]!)); rejects(multiple, 0, /exactly one/);
  const missing = fixture(0); delete missing.cases[0]!.error; rejects(missing, 0, /per-case/);
});
test('missing layout diagnostic evidence cannot satisfy a generic critical failure', () => {
  const report = fixture(2); report.cases[0]!.layoutDiagnostics = []; rejects(report, 2, /Missing layout/);
});
test('incorrect font diagnostic category cannot count as intended overflow', () => {
  const report = fixture(2); report.cases[0]!.layoutDiagnostics = [{...findings()[0]!, code: 'FONT_NOT_READY'}];
  rejects(report, 2, /category/);
});
test('warnings, exemptions, other elements, compositions and frames do not count as critical evidence', () => {
  for (const change of [{severity: 'warning' as const}, {exemptionReason: 'intentional'}, {elementId: 'unrelated-text'}, {compositionId: 'OtherScene'}, {frame: 91}]) {
    const report = fixture(2); Object.assign(report.cases[0]!.layoutDiagnostics[0]!, change); rejects(report, 2, /category|scope|exemption/);
  }
});
test('required title code and actual code metadata must both be present', () => {
  const report = fixture(2); report.cases[0]!.layoutDiagnostics = [findings()[0]!]; rejects(report, 2, /TEXT_CLIPPED/);
  const metadata = fixture(2); metadata.cases[0]!.error!.cause!.diagnosticCodes = ['TEXT_OVERFLOW']; rejects(metadata, 2, /metadata/);
});
test('unrelated diagnostics or errors invalidate otherwise plausible expected evidence', () => {
  const report = fixture(2); report.cases[0]!.layoutDiagnostics.push({...findings()[0]!, code: 'FONT_NOT_READY'}); rejects(report, 2);
  const font = fixture(2); font.cases[0]!.fontDiagnostics.push({code: 'FONT_FAILED', severity: 'error', message: 'Unrelated failure'}); rejects(font, 2);
  const gpu = fixture(2, Object.assign(new Error('Critical browser layout/font diagnostic.'), {code: 'GPU_LOST'})); rejects(gpu, 2);
});
test('matching text with an unrelated coded or nonstandard-class error is rejected', () => {
  for (const code of ['GPU_LOST', 'ENOENT', -32000]) {
    rejects(fixture(0, Object.assign(originalErrors[0]!(), {code})), 0);
  }
  rejects(fixture(1, Object.assign(originalErrors[1]!(), {name: 'BrowserCrashError'})), 1);
  rejects(fixture(1, 'Unknown reliability fixture.'), 1);
});
test('library matching is anchored to the intended composition and exact validator, not substrings', () => {
  for (const text of [
    'Could not find composition with ID DifferentId. Available compositions: CodeToVideoIntro, ReliabilityFixture',
    'Could not find composition with ID NotRegistered. Available compositions: ReliabilityFixture\nGPU_LOST',
    'Could not find composition with ID NotRegistered. Available compositions: NotRegistered, ReliabilityFixture',
    'Could not find composition with ID NotRegistered. Available compositions: OtherScene',
  ]) rejects(fixture(0, new Error(text)), 0);
  rejects(fixture(1, new Error('Unknown reliability fixture. Browser crashed.')), 1);
});
test('transparent same-error wrappers and explicit QA transport wrappers preserve valid causes', () => {
  for (const index of [0, 1, 2]) {
    const error = originalErrors[index]!();
    const transparent = new Error(`Error: ${error.message}`, {cause: error});
    assertExpectedFailure(fixture(index, transparent), definitions[index]!);
    const report = fixture(index);
    const inner = report.cases[0]!.error!.cause!;
    const wrapped: ErrorEvidence = {code: 'CAPTURE_FAILED', message: 'Capture failed.', cause: inner};
    report.cases[0]!.error!.cause = wrapped;
    report.error!.cause = {code: 'QA_CAPTURE_FAILED', message: 'QA capture failed.', cause: wrapped};
    assertExpectedFailure(report, definitions[index]!);
  }
});
test('opaque/nested GPU wrappers cannot hide behind an expected inner error', () => {
  rejects(fixture(0, new Error('Opaque renderer wrapper', {cause: originalErrors[0]!()})), 0, /wrapper/);
  rejects(fixture(0, Object.assign(new Error('GPU_LOST', {cause: originalErrors[0]!()}), {code: 'GPU_LOST'})), 0, /wrapper/);
  const report = fixture(0); report.error!.message = 'GPU_LOST'; rejects(report, 0, /wrapper/);
});
test('aggregated, cyclic, truncated and missing causes fail closed', () => {
  rejects(fixture(0, new AggregateError([originalErrors[0]!(), new Error('GPU_LOST')], 'Multiple failures')), 0);
  const cycle = new Error('cycle'); Object.assign(cycle, {cause: cycle}); rejects(fixture(0, cycle), 0);
  const truncated = fixture(0); truncated.error!.cause!.truncated = true; rejects(truncated, 0);
  const legacy = fixture(0); delete legacy.error!.cause; rejects(legacy, 0, /causal evidence/);
});
test('serialization preserves causal code, stack and context while retaining old envelope fields', () => {
  const original = Object.assign(new Error('GPU_LOST at /example/root/file.ts'), {code: 'GPU_LOST'});
  const wrapper = new Error('Wrapper', {cause: original});
  const serialized = reportError('CAPTURE_FAILED', wrapper, '/example/root');
  assert.equal(serialized.code, 'CAPTURE_FAILED'); assert.equal(serialized.message, 'Error: Wrapper');
  assert.equal(serialized.cause?.cause?.code, 'GPU_LOST'); assert.match(serialized.cause?.cause?.message ?? '', /\.\/file.ts/);
  assert(serialized.cause?.cause?.stack); assert.deepEqual(JSON.parse(JSON.stringify(serialized)), serialized);
  const mismatch = new ExpectedFailureMismatch(definitions[0]!, 'unrelated failure', original);
  assert.equal(errorEvidence(mismatch).context?.caseId, 'missing-composition');
});
test('actual negative-test harness accepts the three intended failure reports', async () => {
  let calls = 0;
  await failureCheck('unit', async (inputs) => {
    const index = definitions.findIndex((d) => d.case.id === inputs[0]!.id); calls++; return fixture(index);
  });
  assert.equal(calls, 3);
});
test('actual negative-test harness rejects GPU_LOST and stops before subsequent cases', async () => {
  let calls = 0;
  await assert.rejects(failureCheck('unit', async () => {calls++; return fixture(0, Object.assign(new Error('GPU_LOST'), {code: 'GPU_LOST'}));}),
    (error: unknown) => error instanceof ExpectedFailureMismatch && error.code === 'UNEXPECTED_REJECTION');
  assert.equal(calls, 1);
});
test('a thrown capture exception is unexpected and retains the original cause', async () => {
  const original = Object.assign(new Error('Unrelated I/O'), {code: 'EACCES'});
  await assert.rejects(failureCheck('unit', async () => {throw original;}), (error: unknown) =>
    error instanceof ExpectedFailureMismatch && error.cause === original);
});

for (const outcome of ['gpu', 'success'] as const) test(`actual CLI exits nonzero for injected ${outcome} without browser/source changes`, async () => {
  const base = path.resolve('.cache/qa-unit'); await mkdir(base, {recursive: true});
  const output = await mkdtemp(path.join(base, 'negative-cli-'));
  const moduleUrl = (file: string) => pathToFileURL(path.resolve(file)).href;
  // Only rendering/I/O boundaries are replaced. CLI orchestration, expectations,
  // error serialization and exit behavior are the real production modules.
  const script = `
    import {registerHooks} from 'node:module';
    const data = (source) => 'data:text/javascript,' + encodeURIComponent(source);
    const capture = data('import {caseKey} from '+${JSON.stringify(JSON.stringify(moduleUrl('scripts/qa/cases.ts')))}+'; export async function captureCases(inputs){const c=inputs[0];const cause={name:"Error",code:"GPU_LOST",message:"GPU_LOST: injected boundary failure"};const failed='+${JSON.stringify(JSON.stringify(outcome))}+'==="gpu";return {schemaVersion:1,timestamp:new Date().toISOString(),run:"unit",status:failed?"failed":"captured",cases:[{key:caseKey(c),case:c,status:failed?"failed":"captured",sourceHash:"unit",fontDiagnostics:[],layoutDiagnostics:[],artifacts:{image:"unit.png"},...(failed?{error:{code:"CAPTURE_FAILED",message:cause.message,cause}}:{})}],...(failed?{error:{code:"QA_CAPTURE_FAILED",message:cause.message,cause}}:{})};}');
    const cliVisual = data('export const qaPaths={reports:'+${JSON.stringify(JSON.stringify(output))}+'}; export const validateRun=(v)=>v; export const approveCase=()=>{throw Error("must not approve")}; export const captureCases=()=>{}; export const compareRun=()=>{};');
    const hook=registerHooks({resolve(s,c,next){
      if(c.parentURL?.endsWith('/scripts/qa/cli.ts')&&s==='./smoke.ts') return {url:data('export async function renderSmoke(){}'),shortCircuit:true};
      if(c.parentURL?.endsWith('/scripts/qa/cli.ts')&&s==='./visual.ts') return {url:cliVisual,shortCircuit:true};
      if(c.parentURL?.endsWith('/scripts/qa/failure-check.ts')&&s==='./visual.ts') return {url:capture,shortCircuit:true};
      return next(s,c);
    }});
    process.argv=[process.execPath,'cli.ts','render','--run','unit-cli'];
    try {await import(${JSON.stringify(moduleUrl('scripts/qa/cli.ts'))});} finally {hook.deregister();}
  `;
  const processResult = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', script], {encoding: 'utf8', timeout: 30000});
  assert.ifError(processResult.error); assert.equal(processResult.status, 1, processResult.stderr);
  assert.match(processResult.stderr, outcome === 'gpu' ? /unexpected rejection/ : /missing expected rejection/);
  const reportFile = (await readdir(output)).find((file) => file.startsWith('operation-failed-'));
  assert(reportFile, processResult.stderr);
  const json = JSON.parse(await readFile(path.join(output, reportFile), 'utf8')) as {error: {cause: ErrorEvidence}};
  assert.equal(json.error.cause.code, outcome === 'gpu' ? 'UNEXPECTED_REJECTION' : 'MISSING_EXPECTED_REJECTION');
  if (outcome === 'gpu') assert.equal(json.error.cause.cause?.cause?.code, 'GPU_LOST');
});
