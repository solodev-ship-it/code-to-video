/** JSON-safe causal evidence, additive to the existing report error envelope. */
export interface ErrorEvidence {
  message: string;
  name?: string;
  code?: string | number;
  stack?: string;
  cause?: ErrorEvidence;
  errors?: ErrorEvidence[];
  diagnosticCodes?: string[];
  context?: Record<string, string>;
  truncated?: boolean;
}
export interface ReportError {code: string; message: string; cause?: ErrorEvidence}

export class CriticalLayoutError extends Error {
  readonly code = 'CRITICAL_LAYOUT';
  readonly diagnosticCodes: string[];
  constructor(codes: readonly string[]) {
    super('Critical browser layout/font diagnostic.');
    this.diagnosticCodes = [...new Set(codes)].sort();
  }
}

export function errorEvidence(error: unknown, sourceRoot = '', seen = new Set<object>(), depth = 0): ErrorEvidence {
  const clean = (text: string) => sourceRoot ? text.replaceAll(sourceRoot, '.') : text;
  if (error === null || typeof error !== 'object') return {name: 'NonErrorThrow', message: clean(String(error))};
  if (depth >= 8 || seen.has(error)) return {message: 'Causal evidence truncated or cyclic.', truncated: true};
  seen.add(error);
  const e = error as Record<string, unknown>;
  const result: ErrorEvidence = {message: clean(typeof e.message === 'string' ? e.message : String(error))};
  for (const key of ['name', 'code', 'stack'] as const) if (typeof e[key] === 'string') result[key] = clean(e[key]);
  if (typeof e.code === 'number' && Number.isFinite(e.code)) result.code = e.code;
  if (e.cause !== undefined) result.cause = errorEvidence(e.cause, sourceRoot, seen, depth + 1);
  if (Array.isArray(e.errors)) {
    result.errors = e.errors.slice(0, 16).map((cause) => errorEvidence(cause, sourceRoot, seen, depth + 1));
    if (e.errors.length > 16) result.truncated = true;
  }
  if (Array.isArray(e.diagnosticCodes) && e.diagnosticCodes.every((c) => typeof c === 'string')) result.diagnosticCodes = [...e.diagnosticCodes];
  if (e.context && typeof e.context === 'object' && !Array.isArray(e.context)) {
    result.context = Object.fromEntries(Object.entries(e.context).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  }
  seen.delete(error);
  return result;
}

export function reportError(code: string, error: unknown, sourceRoot: string): ReportError {
  return {code, message: sourceRoot ? String(error).replaceAll(sourceRoot, '.') : String(error), cause: errorEvidence(error, sourceRoot)};
}
