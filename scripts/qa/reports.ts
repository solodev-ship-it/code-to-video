import type {VisualCase} from './cases.ts';
import type {ComparisonMetrics, ComparisonOptions} from './compare.ts';
import {canonical, caseKey, validateCase} from './cases.ts';
import type {Diagnostic} from '../../packages/ui/src/diagnostics/types.ts';
import type {ReportError} from './errors.ts';

export interface Fingerprint {
  os: {platform: string; release: string}; arch: string; node: string; remotion: string;
  browser: {product: string; revision: string; userAgent: string};
  viewport: {width: number; height: number}; deviceScaleFactor: number;
  render: {gl: string; scale: number; imageFormat: string; fps: number};
}
export interface CaseResult {
  key: string;
  case: VisualCase;
  status: 'captured' | 'passed' | 'failed';
  environment?: Fingerprint;
  sourceHash: string;
  fontDiagnostics: {code: string; severity: string; message: string}[];
  layoutDiagnostics: Diagnostic[];
  comparison?: ComparisonMetrics;
  environmentDrift?: boolean;
  hashes?: {png: string; repeatPng?: string};
  artifacts: {image: string; repeat?: string; diff?: string; layout?: string};
  error?: ReportError;
}
export interface QualityReport {
  schemaVersion: 1; timestamp: string; run: string; status: 'captured' | 'passed' | 'failed';
  cases: CaseResult[]; error?: ReportError;
  comparisonOptions?: ComparisonOptions;
}

export function serializeReport(report: QualityReport): string {
  if (report.schemaVersion !== 1 || !['captured', 'passed', 'failed'].includes(report.status) || !Number.isFinite(Date.parse(report.timestamp))) throw new Error('Invalid quality report envelope.');
  for (const row of report.cases) {
    if (row.key !== caseKey(validateCase(row.case))) throw new Error('Quality report case identity changed.');
    if (row.status === 'passed' && (!row.environment || !row.hashes)) throw new Error('Passed case requires environment and image hash evidence.');
  }
  canonical(report); // No non-JSON metadata or nonfinite metrics.
  return JSON.stringify(report, null, 2) + '\n';
}
export const environmentDrift = (expected: Fingerprint, current: Fingerprint): boolean => canonical(expected) !== canonical(current);
