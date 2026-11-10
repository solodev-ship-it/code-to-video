import {evaluateText} from './evaluate.ts';
import type {DiagnosticContext, LayoutReport, Rect, TextDiagnosticOptions, TextMeasurement} from './types.ts';

const rect = (value: DOMRect): Rect => ({x: value.x, y: value.y, width: value.width, height: value.height});
export function collectLayoutDiagnostics(root: ParentNode, context: DiagnosticContext): LayoutReport {
  const safeAreas: Record<string, Rect> = {};
  for (const element of root.querySelectorAll<HTMLElement>('[data-ctv-safe-area]')) {
    const box = element.getBoundingClientRect(); const css = getComputedStyle(element);
    const sx = element.offsetWidth ? box.width / element.offsetWidth : 1;
    const sy = element.offsetHeight ? box.height / element.offsetHeight : 1;
    const left = (parseFloat(css.paddingLeft) + parseFloat(css.borderLeftWidth)) * sx;
    const top = (parseFloat(css.paddingTop) + parseFloat(css.borderTopWidth)) * sy;
    const right = (parseFloat(css.paddingRight) + parseFloat(css.borderRightWidth)) * sx;
    const bottom = (parseFloat(css.paddingBottom) + parseFloat(css.borderBottomWidth)) * sy;
    const id = element.dataset.ctvSafeArea!;
    if (safeAreas[id]) throw new Error(`Duplicate diagnostic safe area: ${id}`);
    safeAreas[id] = {x: box.x + left, y: box.y + top, width: box.width - left - right, height: box.height - top - bottom};
  }
  const measurements: TextMeasurement[] = []; const ids = new Set<string>();
  for (const element of root.querySelectorAll<HTMLElement>('[data-ctv-text]')) {
    const policy = JSON.parse(element.dataset.ctvText!) as TextDiagnosticOptions;
    if (!policy.id || ids.has(policy.id)) throw new Error(`Missing/duplicate text diagnostic ID: ${policy.id}`);
    ids.add(policy.id);
    const css = getComputedStyle(element); const range = document.createRange(); range.selectNodeContents(element);
    // Range rects approximate line boxes, not actual glyph ink or complex script shaping.
    const tops = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0).map((r) => r.top);
    const uniqueTops: number[] = [];
    for (const top of tops) if (!uniqueTops.some((t) => Math.abs(t - top) < 2)) uniqueTops.push(top);
    let ancestor: HTMLElement | null = element.parentElement; let ancestorClip: Rect | undefined;
    while (ancestor) {
      const parentCss = getComputedStyle(ancestor);
      if (/(hidden|clip|scroll|auto)/.test(parentCss.overflowX + parentCss.overflowY)) {
        const box = rect(ancestor.getBoundingClientRect());
        if (!ancestorClip) ancestorClip = box;
        else {const x = Math.max(box.x, ancestorClip.x); const y = Math.max(box.y, ancestorClip.y);
          ancestorClip = {x, y, width: Math.max(0, Math.min(box.x + box.width, ancestorClip.x + ancestorClip.width) - x), height: Math.max(0, Math.min(box.y + box.height, ancestorClip.y + ancestorClip.height) - y)};}
      }
      ancestor = ancestor.parentElement;
    }
    const expected = policy.expectedFont;
    const fontReady = expected ? [...document.fonts].some((face) => face.family.replace(/["']/g, '').toLowerCase() === expected.family.toLowerCase() &&
      face.weight === String(expected.weight) && face.style === expected.style && face.status === 'loaded') &&
      document.fonts.check(`${expected.style} ${expected.weight} 16px ${JSON.stringify(expected.family)}`, element.textContent || 'Test') : undefined;
    measurements.push({policy, bounds: rect(element.getBoundingClientRect()), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, lineCount: uniqueTops.length,
      clipsContent: /(hidden|clip|scroll|auto)/.test(css.overflowX + css.overflowY), ...(ancestorClip ? {ancestorClip} : {}),
      ...(fontReady !== undefined ? {fontReady} : {}), declaredFamily: css.fontFamily.split(',')[0]?.trim() ?? '',
      typography: {family: css.fontFamily, weight: css.fontWeight, style: css.fontStyle, lineHeight: css.lineHeight}});
  }
  return {...context, schemaVersion: 1, measurements, safeAreas,
    diagnostics: measurements.flatMap((m) => evaluateText(m, context, safeAreas)),
    environment: {userAgent: navigator.userAgent, deviceScaleFactor: devicePixelRatio, viewport: {width: innerWidth, height: innerHeight}}};
}
