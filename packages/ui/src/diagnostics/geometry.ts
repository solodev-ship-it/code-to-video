import type {Rect} from './types.ts';
export interface FrameMargins {unit: 'px' | 'ratio'; top: number; right: number; bottom: number; left: number}
export function safeAreaGeometry(width: number, height: number, margins: FrameMargins): Rect {
  if (![width, height].every((n) => Number.isFinite(n) && n > 0)) throw new Error('Safe area requires positive finite frame dimensions.');
  if (!['px', 'ratio'].includes(margins.unit)) throw new Error('Unknown safe-area margin unit.');
  for (const key of ['top', 'right', 'bottom', 'left'] as const) {
    if (!Number.isFinite(margins[key]) || margins[key] < 0 || (margins.unit === 'ratio' && margins[key] >= 1)) throw new Error(`Invalid safe-area ${key} margin.`);
  }
  const x = margins.left * (margins.unit === 'ratio' ? width : 1);
  const y = margins.top * (margins.unit === 'ratio' ? height : 1);
  const w = width - x - margins.right * (margins.unit === 'ratio' ? width : 1);
  const h = height - y - margins.bottom * (margins.unit === 'ratio' ? height : 1);
  if (w <= 0 || h <= 0) throw new Error('Safe-area margins leave no content region.');
  return {x, y, width: w, height: h};
}
export const contains = (outer: Rect, inner: Rect, tolerance = 1): boolean => inner.x >= outer.x - tolerance && inner.y >= outer.y - tolerance &&
  inner.x + inner.width <= outer.x + outer.width + tolerance && inner.y + inner.height <= outer.y + outer.height + tolerance;
