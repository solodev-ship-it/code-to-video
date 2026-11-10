import assert from 'node:assert/strict';
import test from 'node:test';
import {assertProjectRejection, fullGateOutcome, projectFailureKinds} from '../../scripts/qa/e2e-check.ts';
import type {CommandEvidence, ProjectFailureEvidence} from '../../scripts/qa/e2e-check.ts';
import type {QualityReport} from '../../scripts/qa/reports.ts';
import {visualCases} from '../visual/cases.ts';
import {caseKey} from '../../scripts/qa/cases.ts';
import {strictComparison} from '../../scripts/qa/compare.ts';
const key=caseKey(visualCases[0]!);

const diagnostics = [
  'code-to-video: assets/missing.png: missing file',
  'code-to-video: schemaVersion: unsupported version; expected 1 (no migration)',
  'code-to-video: render requires a manifest composition id',
  'code-to-video: framework.version: must be compatible with 0.1.0 (0.1.x)',
];
for(const [i,kind] of projectFailureKinds.entries()) {
  const evidence:ProjectFailureEvidence = {kind,compositionId:kind==='unknown-composition'?'NotRegistered':'TitleCard',code:1,signal:null,
    stdout:'',stderr:diagnostics[i]!+'\n',timedOut:false,outputExists:false,newStagingDirectories:[],manifestSha256:'a'.repeat(64),sourceSha256:'b'.repeat(64)};
  test(`${kind}: exact CLI evidence is accepted`,()=>assert.doesNotThrow(()=>assertProjectRejection(evidence,kind,'0.1.0')));
  test(`${kind}: unrelated failures and incomplete evidence fail closed`,()=>{
    for(const change of [
      {code:0},{code:null,signal:'SIGKILL'},{timedOut:true},{stderr:'GPU_LOST'}, {stderr:'Browser process crashed'},
      {stderr:'ENOENT: unrelated output file'}, {stderr:'Navigation timed out'}, {stderr:'wrapper: '+diagnostics[i]},
      {stderr:diagnostics[i]+'\nGPU_LOST'}, {stdout:'Unexpected stderr wrapper'}, {outputExists:true},
      {newStagingDirectories:['session-unexpected']}, {manifestSha256:''}, {sourceSha256:''}, {compositionId:'Different'},
    ]) assert.throws(()=>assertProjectRejection({...evidence,...change},kind,'0.1.0'));
    const other=projectFailureKinds[(i+1)%projectFailureKinds.length]!;
    assert.throws(()=>assertProjectRejection({...evidence,kind:other},kind,'0.1.0'));
  });
}
const command:CommandEvidence = {code:1,signal:null,timedOut:false,stderr:'Full gate failed',
  stdout:'PASS — technical tests and expected-rejection checks completed. Visual baseline comparison is still required.\n'};
function comparison():QualityReport {
  // Minimal typed fixture; only fields relevant to this adapter are consumed.
  return {schemaVersion:1,run:'unit-visual',timestamp:'2026-11-10T00:00:00Z',status:'failed',comparisonOptions:strictComparison,cases:[{
    key,case:visualCases[0]!,status:'failed',sourceHash:'source',
    environment:{} as NonNullable<QualityReport['cases'][number]['environment']>,hashes:{png:'digest'},
    fontDiagnostics:[],layoutDiagnostics:[],artifacts:{image:'unit.png'},
    comparison:{status:'missing-baseline',differingPixels:null,differencePercent:null,totalPixels:null},
    error:{code:'MISSING_BASELINE',message:'Pending review'},
  }]};
}
test('full gate labels only evidenced missing references as blocked, never passed',()=>{
  assert.equal(fullGateOutcome(command,comparison(),'unit',[key]),'blocked');
  for(const change of [{code:0},{code:null,signal:'SIGTERM'},{timedOut:true},{stdout:''}]) {
    assert.throws(()=>fullGateOutcome({...command,...change},comparison(),'unit',[key]));
  }
});
test('full gate refuses unrelated errors, drift, differences and missing matrix evidence',()=>{
  for(const code of ['GPU_LOST','BASELINE_ERROR','ENVIRONMENT_DRIFT','CAPTURE_FAILED']) {
    const report=comparison();report.cases[0]!.error!.code=code;
    assert.throws(()=>fullGateOutcome(command,report,'unit',[key]));
  }
  for(const change of [{environmentDrift:true},{hashes:undefined},{sourceHash:''},
    {comparison:{status:'different' as const,differingPixels:1,differencePercent:1,totalPixels:100}},
    {fontDiagnostics:[{code:'FONT_FAILED',severity:'error',message:'Missing font'}]}]) {
    const report=comparison();Object.assign(report.cases[0]!,change);
    assert.throws(()=>fullGateOutcome(command,report,'unit',[key]));
  }
  assert.throws(()=>fullGateOutcome(command,comparison(),'another-run',[key]));
  assert.throws(()=>fullGateOutcome(command,comparison(),'unit',[key,'missing']));
  const nested=comparison();nested.cases[0]!.error!.cause={name:'Error',message:'GPU_LOST'};
  assert.throws(()=>fullGateOutcome(command,nested,'unit',[key]));
  const top=comparison();top.error={code:'UNEXPECTED',message:'Unexpected failure'};
  assert.throws(()=>fullGateOutcome(command,top,'unit',[key]));
  const threshold=comparison();threshold.comparisonOptions={mode:'exact',pixelThreshold:0,maxDiffPercent:10};
  assert.throws(()=>fullGateOutcome(command,threshold,'unit',[key]));
});
test('full gate passes only successful comparison plus zero exit',()=>{
  const report=comparison();report.status='passed';const row=report.cases[0]!;row.status='passed';delete row.error;
  row.comparison={status:'passed',differingPixels:0,differencePercent:0,totalPixels:100};
  assert.equal(fullGateOutcome({...command,code:0},report,'unit',[key]),'passed');
  assert.throws(()=>fullGateOutcome(command,report,'unit',[key]));
});
