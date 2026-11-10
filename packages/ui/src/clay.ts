import type {ColorRole, ResolvedTheme} from '@code-to-video/themes';
import {evaluateMotion, stagger} from './motion.ts';
import type {MotionOptions} from './motion.ts';

export const clayPresets = ['soft-panel', 'sculpted', 'pressed'] as const;
export type ClayPreset = typeof clayPresets[number];
export interface ClayAppearance {
  readonly fill: ColorRole;
  readonly radius: number;
  readonly depth: number;
  readonly softness: number;
  readonly highlight: number;
  readonly shadowOpacity: number;
  readonly inset: number;
  readonly borderOpacity: number;
  readonly lightDirection: 'top-left' | 'top-right';
  readonly lightRole: ColorRole;
  readonly darkRole: ColorRole;
}
export type ClayOverrides = Partial<Omit<ClayAppearance, 'lightRole' | 'darkRole'>>;
export type ClaySelection = {preset?: ClayPreset; overrides?: ClayOverrides};
const roles: readonly string[] = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'mutedForeground'];
const bounds: Record<string, readonly [number, number]> = {radius: [0, 120], depth: [0, 3], softness: [0, 1],
  highlight: [0, 0.5], shadowOpacity: [0, 0.7], inset: [0, 0.7], borderOpacity: [0, 0.5]};
function record(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Object.getPrototypeOf(input) !== Object.prototype || Object.getOwnPropertySymbols(input).length) {
    throw new Error('Clay configuration must be a plain data object.');
  }
  const out: Record<string, unknown> = {};
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (!keys.includes(key) || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) throw new Error(`Invalid clay property: ${key}`);
    out[key] = descriptor.value;
  }
  return out;
}
export function validateClayOverrides(input: unknown): ClayOverrides {
  const out = record(input, ['fill', 'lightDirection', ...Object.keys(bounds)]);
  for (const [key, value] of Object.entries(out)) {
    if (key === 'fill') {if (!roles.includes(value as string)) throw new Error('Unknown clay fill role.');}
    else if (key === 'lightDirection') {if (value !== 'top-left' && value !== 'top-right') throw new Error('Unknown clay light direction.');}
    else {const [min, max] = bounds[key]!;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`Clay ${key} must be in [${min}, ${max}].`);}
  }
  return Object.freeze(out) as ClayOverrides;
}
function brightness(hex: string): number {
  const full = hex.length <= 5 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1, 7);
  return [0, 2, 4].reduce((sum, offset, index) => sum + parseInt(full.slice(offset, offset + 2), 16) * [0.2126, 0.7152, 0.0722][index]!, 0);
}
export function resolveClay(theme: ResolvedTheme, input: unknown = {}): ClayAppearance {
  const selection = record(input, ['preset', 'overrides']);
  if (selection.preset !== undefined && !clayPresets.includes(selection.preset as ClayPreset)) throw new Error('Unknown clay preset.');
  const overrides = selection.overrides === undefined ? {} : validateClayOverrides(selection.overrides);
  const presets: Record<ClayPreset, ClayOverrides> = {
    'soft-panel': {fill: 'muted', radius: 38, depth: 1.2, softness: 0.8, highlight: 0.18, shadowOpacity: 0.22, inset: 0.14, borderOpacity: 0.12},
    sculpted: {fill: 'muted', radius: 58, depth: 2.2, softness: 0.65, highlight: 0.27, shadowOpacity: 0.3, inset: 0.2, borderOpacity: 0.16},
    pressed: {fill: 'muted', radius: 30, depth: 0.35, softness: 0.9, highlight: 0.12, shadowOpacity: 0.11, inset: 0.48, borderOpacity: 0.08},
  };
  const lightRole: ColorRole = brightness(theme.colors.foreground) >= brightness(theme.colors.background) ? 'foreground' : 'background';
  const darkRole: ColorRole = lightRole === 'foreground' ? 'background' : 'foreground';
  const base: ClayAppearance = {fill: theme.surface.color, radius: theme.radii.card, depth: 1, softness: 0.7,
    highlight: 0.16, shadowOpacity: Math.max(0.16, theme.shadow.opacity), inset: 0.14, borderOpacity: 0.1,
    lightDirection: 'top-left', lightRole, darkRole};
  return Object.freeze({...base, ...(selection.preset ? presets[selection.preset as ClayPreset] : {}), ...overrides});
}

export type ClayMotionPreset = 'reveal' | 'float' | 'press' | 'depth';
export type ClayMotionOptions = Pick<MotionOptions, 'startSeconds' | 'durationSeconds' | 'staggerIndex' | 'staggerSeconds' | 'easing' | 'reducedMotion'> &
  {preset?: ClayMotionPreset; amplitude?: number; periodSeconds?: number};
export interface ClayMotionState {readonly opacity: number; readonly y: number; readonly scale: number; readonly depthFactor: number; readonly progress: number}
export function evaluateClayMotion(frame: number, fps: number, motion: ResolvedTheme['motion'], options: ClayMotionOptions = {}): ClayMotionState {
  const preset = options.preset ?? 'reveal';
  if (!['reveal', 'float', 'press', 'depth'].includes(preset)) throw new Error('Unknown clay motion preset.');
  const amplitude = options.amplitude ?? 8, periodSeconds = options.periodSeconds ?? 3;
  if (!Number.isFinite(amplitude) || amplitude < 0 || amplitude > 24 || !Number.isFinite(periodSeconds) || periodSeconds < 0.5 || periodSeconds > 10) {
    throw new Error('Clay float amplitude/period must be bounded.');
  }
  const start = stagger(options.staggerIndex ?? 0, options.staggerSeconds ?? 0, options.startSeconds ?? 0);
  const state = evaluateMotion(frame, fps, motion, {preset: 'fade', startSeconds: start,
    durationSeconds: options.durationSeconds ?? 0.8, easing: options.easing, reducedMotion: options.reducedMotion});
  const p = state.progress;
  if (options.reducedMotion) return Object.freeze({opacity: p, y: 0, scale: 1, depthFactor: 1, progress: p});
  const elapsedSeconds = Math.max(0, frame / fps - start);
  const wave = Math.sin(2 * Math.PI * elapsedSeconds / periodSeconds);
  const y = preset === 'float' ? wave * amplitude * p : preset === 'reveal' ? (1 - p) * 18 : preset === 'depth' ? (1 - p) * 10 : p * 3;
  const scale = preset === 'press' ? 1 - 0.025 * p : preset === 'depth' ? 0.96 + 0.04 * p : 1;
  const depthFactor = preset === 'press' ? 1 - 0.65 * p : preset === 'depth' ? 0.4 + 0.6 * p : 1;
  return Object.freeze({opacity: p, y, scale, depthFactor, progress: p});
}
