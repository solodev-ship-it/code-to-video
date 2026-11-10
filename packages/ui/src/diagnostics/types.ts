import type {FontRequirement} from '../font-manifest.ts';
export type DiagnosticCode = 'TEXT_OVERFLOW' | 'TEXT_CLIPPED' | 'TEXT_UNEXPECTED_WRAP' | 'TEXT_OUTSIDE_SAFE_AREA' | 'FONT_NOT_READY' | 'FONT_FALLBACK_DETECTED';
export interface Rect {x: number; y: number; width: number; height: number}
export interface DiagnosticContext {compositionId: string; frame: number}
export interface Diagnostic extends DiagnosticContext {
  code: DiagnosticCode;
  severity: 'error' | 'warning' | 'info';
  elementId?: string;
  message: string;
  expectedBounds?: Rect;
  measuredBounds?: Rect;
  suggestedAction: string;
  exemptionReason?: string;
}
export interface TextDiagnosticOptions {
  id: string;
  maxLines?: number;
  expectedLines?: number;
  safeAreaId?: string;
  expectedFont?: FontRequirement;
  exemptions?: {codes: readonly DiagnosticCode[]; reason: string};
}
export interface TextMeasurement {
  policy: TextDiagnosticOptions;
  bounds: Rect;
  scrollWidth: number; clientWidth: number; scrollHeight: number; clientHeight: number;
  lineCount: number;
  clipsContent: boolean;
  ancestorClip?: Rect;
  fontReady?: boolean;
  declaredFamily?: string;
  typography?: {family: string; weight: string; style: string; lineHeight: string};
}
export interface LayoutReport extends DiagnosticContext {
  schemaVersion: 1;
  diagnostics: Diagnostic[];
  measurements: TextMeasurement[];
  safeAreas: Record<string, Rect>;
  environment: {userAgent: string; deviceScaleFactor: number; viewport: {width: number; height: number}};
}
