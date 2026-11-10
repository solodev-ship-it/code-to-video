import {contains} from './geometry.ts';
import type {Diagnostic, DiagnosticCode, DiagnosticContext, Rect, TextMeasurement} from './types.ts';

export function evaluateText(measurement: TextMeasurement, context: DiagnosticContext, safeAreas: Record<string, Rect>): Diagnostic[] {
  const {policy, bounds} = measurement;
  const findings: Diagnostic[] = [];
  function add(code: DiagnosticCode, message: string, suggestedAction: string, expectedBounds?: Rect) {
    const reason = policy.exemptions?.codes.includes(code) ? policy.exemptions.reason.trim() : undefined;
    if (policy.exemptions && !policy.exemptions.reason.trim()) throw new Error('Diagnostic exemptions require a nonempty reason.');
    findings.push({...context, code, severity: reason ? 'info' : code === 'FONT_FALLBACK_DETECTED' ? 'warning' : 'error',
      elementId: policy.id, message, suggestedAction, measuredBounds: bounds,
      ...(expectedBounds ? {expectedBounds} : {}), ...(reason ? {exemptionReason: reason} : {})});
  }
  const overflow = measurement.scrollWidth > measurement.clientWidth + 1 || measurement.scrollHeight > measurement.clientHeight + 1;
  if (overflow) add('TEXT_OVERFLOW', 'Text content exceeds its layout container.', 'Review copy, explicit container dimensions and typography; do not auto-shrink blindly.');
  if ((overflow && measurement.clipsContent) || (measurement.ancestorClip && !contains(measurement.ancestorClip, bounds))) {
    add('TEXT_CLIPPED', 'Text layout exceeds a clipping region; exact visible ink is not measured.', 'Inspect clipping ancestors, line height and intended cropping.', measurement.ancestorClip);
  }
  if ((policy.maxLines !== undefined && measurement.lineCount > policy.maxLines) ||
    (policy.expectedLines !== undefined && measurement.lineCount !== policy.expectedLines)) {
    add('TEXT_UNEXPECTED_WRAP', `Measured ${measurement.lineCount} lines; expected ${policy.expectedLines ?? `at most ${policy.maxLines}`}.`, 'Review explicit width, line breaks and loaded font.');
  }
  if (policy.safeAreaId) {
    const safe = safeAreas[policy.safeAreaId];
    if (!safe) throw new Error(`Missing diagnostic safe area: ${policy.safeAreaId}`);
    if (!contains(safe, bounds)) add('TEXT_OUTSIDE_SAFE_AREA', 'Text layout rectangle extends outside its selected safe area.', 'Reposition the element or explicitly exempt intentional entrance/exit frames.', safe);
  }
  if (policy.expectedFont) {
    if (!measurement.fontReady) add('FONT_NOT_READY', 'The exact required family/weight/style is not loaded.', 'Register and await the required local face before capture.');
    if (measurement.declaredFamily?.replace(/["']/g, '').trim().toLowerCase() !== policy.expectedFont.family.toLowerCase()) {
      add('FONT_FALLBACK_DETECTED', 'The first declared CSS font differs from the expected family (fallback risk, not a glyph-coverage proof).', 'Inspect computed typography and approved font mapping.');
    }
  }
  return findings;
}
