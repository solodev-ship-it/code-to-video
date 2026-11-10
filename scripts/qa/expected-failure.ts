import {caseKey} from './cases.ts';
import type {VisualCase} from './cases.ts';
import type {QualityReport} from './reports.ts';
import type {DiagnosticCode} from '../../packages/ui/src/diagnostics/types.ts';
import type {ErrorEvidence} from './errors.ts';

export type FailureExpectation =
  | {kind: 'missing-composition'; missingId: string; availableId: string}
  | {kind: 'invalid-props'; validator: 'reliability-fixture'}
  | {kind: 'critical-layout'; elementId: string; allowedElementIds: readonly string[]; requiredCodes: readonly DiagnosticCode[]; allowedCodes: readonly DiagnosticCode[]};
export interface NegativeCase {case: VisualCase; expectation: FailureExpectation}

export class ExpectedFailureMismatch extends Error {
  readonly code: 'MISSING_EXPECTED_REJECTION' | 'UNEXPECTED_REJECTION';
  readonly context: Record<string, string>;
  constructor(definition: NegativeCase, reason: string, cause: unknown, missing = false) {
    super(`FAIL — ${missing ? 'missing expected rejection' : 'unexpected rejection'}: ${definition.case.id} (${definition.expectation.kind}): ${reason}`, {cause});
    this.name = 'ExpectedFailureMismatch';
    this.code = missing ? 'MISSING_EXPECTED_REJECTION' : 'UNEXPECTED_REJECTION';
    this.context = {caseId: definition.case.id, compositionId: definition.case.compositionId, expectation: definition.expectation.kind};
  }
}

// Only repeated standard Error prefixes are formatting, not evidence of a category.
function message(value: string): string {
  return value.replace(/^(?:(?:Error|SymbolicateableError):\s*)+/, '').trim();
}
function leafError(value: ErrorEvidence): ErrorEvidence {
  const seen = new Set<ErrorEvidence>(); const chain: ErrorEvidence[] = []; let current = value;
  for (let depth = 0; depth < 12; depth++) {
    if (seen.has(current) || current.truncated || current.errors || typeof current.message !== 'string') throw new Error('Ambiguous, aggregated, cyclic or truncated error evidence.');
    seen.add(current); chain.push(current);
    if (!current.cause) {
      if (current.code === 'CAPTURE_FAILED' || current.code === 'QA_CAPTURE_FAILED') throw new Error('Capture failure has no original causal evidence; rerun the negative test.');
      for (const wrapper of chain.slice(0, -1)) {
        const transport = wrapper.code === 'CAPTURE_FAILED' || wrapper.code === 'QA_CAPTURE_FAILED';
        const sameMessage = message(wrapper.message) === message(current.message);
        const contextOnly = (wrapper.code === 'CAPTURE_FAILED' && wrapper.message === 'Capture failed.') ||
          (wrapper.code === 'QA_CAPTURE_FAILED' && wrapper.message === 'QA capture failed.');
        const transparent = wrapper.code === undefined && ['Error', 'SymbolicateableError'].includes(wrapper.name ?? '') && sameMessage;
        if ((!transport || (!sameMessage && !contextOnly)) && !transparent) throw new Error('Unrecognized or contradictory error wrapper.');
      }
      return current;
    }
    current = current.cause;
  }
  throw new Error('Error evidence exceeds the supported causal depth.');
}
function libraryErrorMatches(error: ErrorEvidence, expected: Exclude<FailureExpectation, {kind: 'critical-layout'}>): boolean {
  // These pinned upstream errors expose no stable category code. Unknown codes or
  // exception classes must never be reclassified merely because text looks familiar.
  if (error.code !== undefined || !['Error', 'SymbolicateableError'].includes(error.name ?? '')) return false;
  const text = message(error.message);
  if (expected.kind === 'invalid-props') return expected.validator === 'reliability-fixture' && text === 'Unknown reliability fixture.';
  const prefix = `Could not find composition with ID ${expected.missingId}. Available compositions: `;
  if (!text.startsWith(prefix)) return false;
  const available = text.slice(prefix.length).split(', ');
  return available.every((id) => /^[A-Za-z][A-Za-z0-9-]*$/.test(id)) && available.includes(expected.availableId) && !available.includes(expected.missingId);
}

/** Shared by the actual CLI harness and fast regression tests; fail closed. */
export function assertExpectedFailure(report: QualityReport, definition: NegativeCase): void {
  const row = report.cases[0];
  const observed = row?.error ?? report.error;
  function mismatch(reason: string, missing = false): never {throw new ExpectedFailureMismatch(definition, reason, observed, missing);}
  if (report.status !== 'failed' || (row && row.status !== 'failed')) mismatch('The operation did not reject.', true);
  if (report.cases.length !== 1 || !row) mismatch('Expected exactly one failed case with case identity.');
  if (row.key !== caseKey(definition.case) || caseKey(row.case) !== caseKey(definition.case)) mismatch('Failure belongs to a different case/props/frame.');
  if (row.error?.code !== 'CAPTURE_FAILED' || report.error?.code !== 'QA_CAPTURE_FAILED') mismatch('Failure is not the expected per-case capture rejection.');
  let causes: ErrorEvidence[];
  try {causes = [leafError(row.error!), leafError(report.error!)];}
  catch (error) {mismatch(error instanceof Error ? error.message : String(error));}
  const expected = definition.expectation;
  if (expected.kind !== 'critical-layout') {
    if (!causes.every((cause) => libraryErrorMatches(cause, expected))) mismatch('Original error does not match the narrowly scoped expected library/validation failure.');
    if (row.layoutDiagnostics.length || row.fontDiagnostics.some((d) => d.severity === 'error')) mismatch('Unexpected layout/font diagnostic accompanies a selection failure.');
    return;
  }
  if (!causes.every((cause) => cause.code === 'CRITICAL_LAYOUT' && !cause.cause)) mismatch('Original error category is not CRITICAL_LAYOUT.');
  const diagnostics = row.layoutDiagnostics;
  if (!diagnostics.length || row.fontDiagnostics.some((d) => d.severity === 'error')) mismatch('Missing layout evidence or unrelated font failure.');
  if (diagnostics.some((d) => d.compositionId !== definition.case.compositionId || d.frame !== definition.case.frame ||
    !expected.allowedCodes.includes(d.code) || !d.elementId || !expected.allowedElementIds.includes(d.elementId) ||
    d.severity !== 'error' || d.exemptionReason)) mismatch('Layout evidence has an unexpected category, severity, scope or exemption.');
  for (const code of expected.requiredCodes) {
    if (!diagnostics.some((d) => d.code === code && d.elementId === expected.elementId)) mismatch(`Missing required ${code} evidence for ${expected.elementId}.`);
  }
  const actualCodes = [...new Set(diagnostics.map((d) => d.code))].sort();
  if (!causes.every((cause) => Array.isArray(cause.diagnosticCodes) &&
    JSON.stringify([...new Set(cause.diagnosticCodes)].sort()) === JSON.stringify(actualCodes))) mismatch('Error category metadata does not agree with structured layout findings.');
}
