// Node-only end-to-end evidence checks. Never accept exit status alone.
import assert from 'node:assert/strict';
import type {QualityReport} from './reports.ts';
import {caseKey} from './cases.ts';
import {strictComparison} from './compare.ts';

export type CommandEvidence = {code:number|null; signal:string|null; stdout:string; stderr:string; timedOut:boolean};
export const projectFailureKinds = ['missing-asset','invalid-manifest','unknown-composition','incompatible-framework'] as const;
export type ProjectFailureKind = typeof projectFailureKinds[number];
export type ProjectFailureEvidence = CommandEvidence & {
  kind:ProjectFailureKind; compositionId:string; outputExists:boolean; newStagingDirectories:string[];
  // Hashes of the actual case-bound manifest and source saved beside the command log.
  manifestSha256:string; sourceSha256:string;
};
const stripAnsi = (value:string) => value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g,'');
export function assertProjectRejection(evidence:ProjectFailureEvidence, kind:ProjectFailureKind, version:string): void {
  assert(projectFailureKinds.includes(kind),'Unknown expected failure category');
  assert.match(version,/^0\.1\.\d+$/,'Unsupported installed framework version');
  const messages:Record<ProjectFailureKind,string> = {
    'missing-asset':'code-to-video: assets/missing.png: missing file',
    'invalid-manifest':'code-to-video: schemaVersion: unsupported version; expected 1 (no migration)',
    'unknown-composition':'code-to-video: render requires a manifest composition id',
    'incompatible-framework':`code-to-video: framework.version: must be compatible with ${version} (0.1.x)`,
  };
  assert.equal(evidence.kind,kind,'Rejection belongs to another case');
  assert.equal(evidence.compositionId,kind==='unknown-composition'?'NotRegistered':'TitleCard','Wrong composition request');
  for(const digest of [evidence.manifestSha256,evidence.sourceSha256]) assert.match(digest,/^[a-f0-9]{64}$/,'Missing case source hash');
  assert.equal(evidence.code,1,'Expected CLI exit 1');
  assert.equal(evidence.signal,null,'Signalled process is not an expected rejection');
  assert.equal(evidence.timedOut,false,'Timeout is not an expected rejection');
  assert.equal(stripAnsi(evidence.stdout).trim(),'','Unexpected CLI stdout');
  assert.equal(stripAnsi(evidence.stderr).trim(),messages[kind],'Unexpected rejection diagnostic');
  assert.equal(evidence.outputExists,false,'Rejected case created output');
  assert.deepEqual(evidence.newStagingDirectories,[],'Rejected case staged assets');
}

export function fullGateOutcome(command:CommandEvidence, comparison:QualityReport, run:string, expectedKeys:readonly string[]): 'passed'|'blocked' {
  assert.equal(command.signal,null,'Full QA was signalled');
  assert.equal(command.timedOut,false,'Full QA timed out');
  assert.equal(comparison.schemaVersion,1,'Unknown comparison schema');
  assert.equal(comparison.run,`${run}-visual`,'Comparison belongs to another run');
  assert.equal(comparison.error,undefined,'Unexpected report-level failure');
  assert.deepEqual(comparison.comparisonOptions,strictComparison,'Full gate thresholds changed');
  assert(expectedKeys.length>0 && new Set(expectedKeys).size===expectedKeys.length,'Invalid expected matrix');
  assert.deepEqual(comparison.cases.map(c=>c.key).sort(),[...expectedKeys].sort(),'Incomplete/changed comparison matrix');
  assert(stripAnsi(command.stdout).split(/\r?\n/).includes('PASS — technical tests and expected-rejection checks completed. Visual baseline comparison is still required.'),'Technical stages did not complete');
  let missing=0;
  for(const row of comparison.cases) {
    assert.equal(row.key,caseKey(row.case),'Case identity changed');
    assert(row.environment && row.hashes?.png && row.sourceHash,'Missing capture provenance');
    assert(!row.environmentDrift,'Environment drift is not pending approval');
    assert(!row.layoutDiagnostics.some(d=>d.severity==='error') && !row.fontDiagnostics.some(d=>d.severity==='error'),'Critical capture diagnostics');
    if(row.error?.code==='MISSING_BASELINE') {
      assert.equal(row.error.cause,undefined,'Unexpected nested baseline failure');
      assert.equal(row.status,'failed');assert.equal(row.comparison?.status,'missing-baseline');missing++;
    } else {
      assert.equal(row.error,undefined,'Unexpected comparison error');
      assert.equal(row.status,'passed','Unexpected failed comparison');
      assert.equal(row.comparison?.status,'passed','Unexpected pixel result');
    }
  }
  if(missing) {assert.equal(command.code,1);assert.equal(comparison.status,'failed');return 'blocked';}
  assert.equal(command.code,0);assert.equal(comparison.status,'passed');return 'passed';
}
