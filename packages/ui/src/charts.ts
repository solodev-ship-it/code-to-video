import type {ColorRole, ResolvedTheme} from '@code-to-video/themes';
import {evaluateMotion, secondsToFrames} from './motion.ts';
import type {MotionOptions} from './motion.ts';

export type Domain = readonly [number, number];
export type ChartAnimation = Pick<MotionOptions, 'startSeconds' | 'durationSeconds' | 'staggerSeconds' | 'easing' | 'reducedMotion'>;
export interface NumberFormat {style?: 'number' | 'currency' | 'percent'; decimals?: number; currency?: string; grouping?: boolean}
export interface ChartSource {label: string; url?: string; revision?: string; illustrative?: boolean}
export interface BarSeries {readonly id: string; readonly label: string; readonly values: readonly number[]; readonly color?: ColorRole}
export interface BarData {readonly categories: readonly string[]; readonly series: readonly BarSeries[]}
export interface XYPoint {readonly x: number; readonly y: number}
export interface XYSeries {readonly id: string; readonly label: string; readonly points: readonly XYPoint[]; readonly color?: ColorRole}
export interface DonutDatum {readonly id: string; readonly label: string; readonly value: number; readonly color?: ColorRole}
export interface TimelineEvent {readonly id: string; readonly at: number | string; readonly label: string; readonly title: string; readonly description?: string; readonly highlight?: boolean}
const colorRoles = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'mutedForeground'];
export function chartNumber(value: unknown, name = 'value'): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Chart ${name} must be a finite number; missing values are not interpolated.`);
  return value;
}
function object(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype || Object.getOwnPropertySymbols(value).length) throw new Error('Chart data must be plain objects.');
  const out: Record<string, unknown> = {};
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (!keys.includes(key) || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) throw new Error(`Invalid chart data property: ${key}`);
    out[key] = descriptor.value;
  }
  return out;
}
function array(value: unknown, max: number): readonly unknown[] {
  if (!Array.isArray(value) || value.length > max || Object.keys(value).length !== value.length) throw new Error(`Chart arrays must be dense and contain at most ${max} items; data is never truncated.`);
  for (let i = 0; i < value.length; i++) if (!Object.hasOwn(value, i) || !('value' in Object.getOwnPropertyDescriptor(value, i)!)) throw new Error('Chart arrays cannot contain holes/accessors.');
  return value;
}
function text(value: unknown, name: string, max = 160): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`Chart ${name} must be nonempty text (at most ${max} characters).`);
  return value;
}
function id(value: unknown) {const result = text(value, 'id', 80); if (!/^[a-z][a-z0-9-]*$/.test(result)) throw new Error('Chart IDs must be lowercase kebab-case.'); return result;}
function color(value: unknown): ColorRole | undefined {if (value === undefined) return undefined; if (!colorRoles.includes(value as string)) throw new Error('Unknown chart color role.'); return value as ColorRole;}
function unique(values: readonly string[], name: string) {if (new Set(values).size !== values.length) throw new Error(`Duplicate chart ${name}.`);}
export function validateBarData(input: unknown): BarData {
  const data = object(input, ['categories', 'series']);
  const categories = array(data.categories, 64).map((v) => text(v, 'category', 80)); unique(categories, 'category');
  const series = array(data.series, 8).map((entry) => {
    const s = object(entry, ['id', 'label', 'values', 'color']); const values = array(s.values, 64).map((v) => chartNumber(v));
    if (values.length !== categories.length) throw new Error('Every bar series must supply exactly one finite value per category.');
    return Object.freeze({id: id(s.id), label: text(s.label, 'series label', 80), values: Object.freeze(values), ...(s.color !== undefined ? {color: color(s.color)!} : {})});
  });
  unique(series.map((s) => s.id), 'series ID');
  return Object.freeze({categories: Object.freeze(categories), series: Object.freeze(series)});
}
export function normalizeXYSeries(input: unknown): readonly XYSeries[] {
  const series = array(input, 8).map((entry) => {
    const s = object(entry, ['id', 'label', 'points', 'color']);
    const points = array(s.points, 2000).map((entry) => {const p = object(entry, ['x', 'y']); return Object.freeze({x: chartNumber(p.x, 'x'), y: chartNumber(p.y, 'y')});});
    for (let i = 1; i < points.length; i++) if (points[i]!.x <= points[i - 1]!.x) throw new Error('Line X coordinates must be strictly increasing; duplicate/unsorted observations are not silently reordered.');
    return Object.freeze({id: id(s.id), label: text(s.label, 'series label', 80), points: Object.freeze(points), ...(s.color !== undefined ? {color: color(s.color)!} : {})});
  });
  unique(series.map((s) => s.id), 'series ID'); return Object.freeze(series);
}
export function numericDomain(values: readonly number[], includeZero = false, explicit?: Domain): Domain | null {
  values.forEach((v) => chartNumber(v));
  if (explicit) {
    validateDomain(explicit);
    if (values.some((v) => v < explicit[0] || v > explicit[1])) throw new Error('Explicit chart domain excludes supplied observations.');
    if (includeZero && (explicit[0] > 0 || explicit[1] < 0)) throw new Error('This chart requires a zero baseline.');
    return Object.freeze([explicit[0], explicit[1]]);
  }
  if (!values.length) return null;
  let lo = includeZero ? 0 : values[0]!; let hi = lo;
  for (const v of values) {lo = Math.min(lo, v); hi = Math.max(hi, v);}
  if (lo === hi) {
    if (lo === 0) return Object.freeze(includeZero ? [0, 1] : [-1, 1]);
    const padding = Math.abs(lo) * 0.1 || Number.MIN_VALUE;
    const lower = lo - padding; const upper = hi + padding;
    if (Number.isFinite(lower)) lo = lower;
    if (Number.isFinite(upper)) hi = upper;
    if (lo === hi) throw new Error('Constant domain cannot be represented at this numeric precision; rescale units.');
  }
  return Object.freeze([lo, hi]);
}
export function validateDomain(domain: Domain): void {
  if (!Array.isArray(domain) || domain.length !== 2 || !domain.every(Number.isFinite) || domain[0] >= domain[1]) throw new Error('Chart domain must contain two finite, strictly increasing endpoints.');
}
export function unitRatio(value: number, domain: Domain): number {
  chartNumber(value); validateDomain(domain);
  if (value < domain[0] || value > domain[1]) throw new Error('Chart value is outside its explicit range; no silent clamping.');
  if (value === domain[0]) return 0; if (value === domain[1]) return 1;
  const span = domain[1] - domain[0];
  if (Number.isFinite(span)) return (value - domain[0]) / span;
  const magnitude = Math.max(Math.abs(domain[0]), Math.abs(domain[1]));
  const ratio = (value / magnitude - domain[0] / magnitude) / (domain[1] / magnitude - domain[0] / magnitude);
  if (!Number.isFinite(ratio)) throw new Error('Scale precision is insufficient; rescale units.');
  return ratio;
}
export function interpolateValue(from: number, to: number, progress: number): number {
  chartNumber(from); chartNumber(to); chartNumber(progress, 'progress');
  if (progress < 0 || progress > 1) throw new Error('Chart interpolation progress must be in [0, 1].');
  if (progress === 0) return from; if (progress === 1) return to;
  return chartNumber(from * (1 - progress) + to * progress, 'interpolated value');
}
export function mapCoordinate(value: number, domain: Domain, range: Domain): number {
  range.forEach((v) => chartNumber(v, 'coordinate')); return interpolateValue(range[0], range[1], unitRatio(value, domain));
}
export function generateTicks(domain: Domain, count = 5): readonly number[] {
  validateDomain(domain); if (!Number.isInteger(count) || count < 2 || count > 12) throw new Error('Chart tick count must be an integer in [2, 12].');
  return Object.freeze([...new Set(Array.from({length: count}, (_, i) => interpolateValue(domain[0], domain[1], i / (count - 1))))]);
}
export function formatChartValue(value: number, options: NumberFormat = {}): string {
  chartNumber(value); const decimals = options.decimals ?? 2; const style = options.style ?? 'number';
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 12 || !['number', 'percent', 'currency'].includes(style)) throw new Error('Invalid deterministic number format.');
  if (options.grouping !== undefined && typeof options.grouping !== 'boolean') throw new Error('Number grouping must be a boolean.');
  if (style === 'currency' && (typeof options.currency !== 'string' || !/^[A-Z]{3}$/.test(options.currency))) throw new Error('Currency requires an explicit three-letter uppercase code.');
  const n = style === 'percent' ? chartNumber(value * 100, 'percentage') : value;
  const exponential = n !== 0 && (Math.abs(n) >= 1e9 || Math.abs(n) < 0.001 || Number(n.toFixed(decimals)) === 0);
  let result = exponential ? n.toExponential(decimals) : n.toFixed(decimals);
  if (!result.includes('e')) {
    result = result.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
    if (Number(result) === 0) result = result.replace(/^-/, '');
    if (options.grouping) {const [integer, fraction] = result.split('.'); result = integer!.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction ? `.${fraction}` : '');}
  }
  return style === 'percent' ? `${result}%` : style === 'currency' ? `${options.currency} ${result}` : result;
}
export function formatTickLabels(ticks: readonly number[], options?: NumberFormat): readonly string[] {
  const labels = ticks.map((v) => formatChartValue(v, options));
  return Object.freeze(new Set(labels).size === labels.length ? labels : ticks.map(String));
}
export function chartProgress(frame: number, fps: number, motion: ResolvedTheme['motion'], animation: ChartAnimation = {}, index = 0): number {
  const state = evaluateMotion(frame, fps, motion, {...animation, preset: 'fade', startSeconds: animation.startSeconds ?? 0,
    durationSeconds: animation.durationSeconds ?? 1.2, staggerSeconds: animation.staggerSeconds ?? 0, staggerIndex: index});
  return animation.reducedMotion ? frame >= secondsToFrames((animation.startSeconds ?? 0) + index * (animation.staggerSeconds ?? 0), fps) ? 1 : 0 : state.progress;
}
export function seriesRole(index: number, explicit?: ColorRole): ColorRole {
  if (explicit) return color(explicit)!;
  const role = (['primary', 'accent', 'mutedForeground', 'foreground'] as const)[index];
  if (!role) throw new Error('More than four chart series/segments require explicit semantic colors.');
  return role;
}
export function normalizeDonut(input: unknown) {
  const data = array(input, 32).map((entry) => {
    const d = object(entry, ['id', 'label', 'value', 'color']); const value = chartNumber(d.value);
    if (value < 0) throw new Error('Donut values must be nonnegative; use a signed bar chart for negative data.');
    return Object.freeze({id: id(d.id), label: text(d.label, 'segment label', 80), value, ...(d.color !== undefined ? {color: color(d.color)!} : {})});
  });
  unique(data.map((s) => s.id), 'segment ID');
  const max = data.reduce((max, d) => Math.max(max, d.value), 0);
  const scaledTotal = max === 0 ? 0 : data.reduce((sum, d) => sum + d.value / max, 0);
  const total = max * scaledTotal; let cumulative = 0;
  const segments = data.map((d) => {
    const fraction = scaledTotal === 0 ? 0 : (d.value / max) / scaledTotal;
    if (d.value > 0 && fraction === 0) throw new Error('A positive segment is below relative numeric precision; rescale or separate the dataset.');
    const start = cumulative; cumulative += fraction; return Object.freeze({...d, fraction, start});
  });
  return Object.freeze({segments: Object.freeze(segments), total: Number.isFinite(total) ? total : null, overflow: !Number.isFinite(total)});
}
export function timelineDate(value: number | string): number {
  if (typeof value === 'number') return chartNumber(value, 'event time');
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Timeline dates require an explicit YYYY-MM-DD UTC calendar date.');
  const [year, month, day] = value.split('-').map(Number); const date = new Date(0);
  date.setUTCFullYear(year!, month! - 1, day!); date.setUTCHours(0, 0, 0, 0);
  if (date.toISOString().slice(0, 10) !== value) throw new Error('Invalid timeline calendar date.');
  return date.getTime();
}
export function normalizeTimeline(input: unknown, spacing: 'chronological' | 'events' = 'chronological') {
  if (!['chronological', 'events'].includes(spacing)) throw new Error('Unknown timeline spacing policy.');
  const events = array(input, 32).map((entry) => {
    const e = object(entry, ['id', 'at', 'label', 'title', 'description', 'highlight']);
    if (e.highlight !== undefined && typeof e.highlight !== 'boolean') throw new Error('Timeline highlight must be a boolean.');
    return Object.freeze({id: id(e.id), at: e.at as number | string, time: timelineDate(e.at as number | string), label: text(e.label, 'event time label', 80),
      title: text(e.title, 'event title', 100), ...(e.description !== undefined ? {description: text(e.description, 'event description', 240)} : {}), highlight: e.highlight === true});
  });
  unique(events.map((e) => e.id), 'event ID');
  if (new Set(events.map((e) => typeof e.at)).size > 1) throw new Error('Do not mix numeric timeline units and calendar dates.');
  for (let i = 1; i < events.length; i++) if (events[i]!.time < events[i - 1]!.time) throw new Error('Timeline events must be chronological; input is never silently sorted.');
  const first = events[0]?.time ?? 0; const last = events.at(-1)?.time ?? 0;
  return Object.freeze(events.map((e, i) => Object.freeze({...e, position: spacing === 'events' ? events.length <= 1 ? 0.5 : i / (events.length - 1) : first === last ? 0.5 : unitRatio(e.time, [first, last])})));
}
export function numberAtFrame(frame: number, from: number, to: number, startFrame: number, endFrame: number, reducedMotion = false): number {
  [frame, from, to, startFrame, endFrame].forEach((v) => chartNumber(v));
  if (!Number.isSafeInteger(startFrame) || !Number.isSafeInteger(endFrame) || startFrame < 0 || endFrame < startFrame || typeof reducedMotion !== 'boolean') throw new Error('Number animation requires ordered nonnegative integer frame boundaries.');
  const p = frame < startFrame ? 0 : reducedMotion || endFrame === startFrame ? 1 : Math.min(1, (frame - startFrame) / (endFrame - startFrame));
  return interpolateValue(from, to, p);
}
