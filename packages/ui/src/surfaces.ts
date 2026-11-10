import type {ColorRole, ResolvedTheme} from '@code-to-video/themes';
import {evaluateMotion} from './motion.ts';
import type {MotionOptions} from './motion.ts';

export const surfaceVariants = ['solid', 'translucent', 'frosted-glass', 'elevated-glass', 'outlined', 'luminous', 'custom'] as const;
export type AdvancedSurfaceVariant = typeof surfaceVariants[number];
export const surfacePresets = ['cinematic-frost', 'minimal-clear', 'aurora-glass', 'ember-glass'] as const;
export type SurfacePreset = typeof surfacePresets[number];
export interface SurfaceAppearance {
  readonly variant: AdvancedSurfaceVariant;
  readonly tint: ColorRole;
  readonly opacity: number;
  readonly borderColor: ColorRole;
  readonly borderOpacity: number;
  readonly borderWidth: number;
  readonly blur: number;
  readonly saturation: number;
  readonly radius: number;
  readonly highlight: number;
  readonly glow: number;
  readonly noise: number;
  readonly elevation: number;
  readonly shadowOpacity: number;
  readonly shadowColor: ColorRole;
  readonly fallbackOpacity: number;
}
export type SurfaceOverrides = Partial<SurfaceAppearance>;
export type SurfaceSelection = {preset?: SurfacePreset; overrides?: SurfaceOverrides};
const roles: readonly string[] = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'mutedForeground'];
const bounds: Record<string, readonly [number, number]> = {
  opacity: [0, 1], borderOpacity: [0, 1], borderWidth: [0, 12], blur: [0, 24], saturation: [0, 2],
  radius: [0, 120], highlight: [0, 1], glow: [0, 1], noise: [0, 0.15], elevation: [0, 3],
  shadowOpacity: [0, 1], fallbackOpacity: [0, 1],
};
function record(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Object.getPrototypeOf(input) !== Object.prototype || Object.getOwnPropertySymbols(input).length) throw new Error('Surface configuration must be a plain data object.');
  const result: Record<string, unknown> = {};
  for (const [key, d] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (!keys.includes(key) || !('value' in d) || !d.enumerable || d.value === undefined) throw new Error(`Invalid surface property: ${key}`);
    result[key] = d.value;
  }
  return result;
}
export function validateSurfaceOverrides(input: unknown): SurfaceOverrides {
  const out = record(input, ['variant', 'tint', 'borderColor', 'shadowColor', ...Object.keys(bounds)]);
  for (const [key, value] of Object.entries(out)) {
    if (key === 'variant') {if (!surfaceVariants.includes(value as AdvancedSurfaceVariant)) throw new Error('Unknown surface variant.');}
    else if (key === 'tint' || key === 'borderColor' || key === 'shadowColor') {if (!roles.includes(value as string)) throw new Error(`Unknown surface color role: ${key}`);}
    else {
      const [min, max] = bounds[key]!;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`Surface ${key} must be in [${min}, ${max}].`);
    }
  }
  return Object.freeze(out) as SurfaceOverrides;
}
export function resolveSurface(theme: ResolvedTheme, input: unknown = {}): SurfaceAppearance {
  const selection = record(input, ['preset', 'overrides']);
  if (selection.preset !== undefined && !surfacePresets.includes(selection.preset as SurfacePreset)) throw new Error('Unknown surface preset.');
  const base: SurfaceAppearance = {
    variant: 'solid', tint: theme.surface.color, opacity: theme.surface.opacity,
    borderColor: theme.border.color, borderOpacity: theme.border.opacity, borderWidth: theme.border.width,
    radius: theme.radii.card, blur: 0, saturation: 1, highlight: 0, glow: 0, noise: 0,
    elevation: 0, shadowOpacity: theme.shadow.opacity, shadowColor: theme.shadow.color, fallbackOpacity: 0.94,
  };
  // Appearance data only. Accent labels are not brand selectors: every preset works with every theme.
  const presets: Record<SurfacePreset, SurfaceOverrides> = {
    'cinematic-frost': {variant: 'frosted-glass', tint: 'background', opacity: 0.76, blur: 14, saturation: 1.1, borderColor: 'foreground', borderOpacity: 0.18, borderWidth: 1, highlight: 0.12, elevation: 1.5, shadowOpacity: 0.28},
    'minimal-clear': {variant: 'translucent', tint: 'background', opacity: 0.84, blur: 5, borderColor: 'foreground', borderOpacity: 0.18, borderWidth: 1, highlight: 0.04, elevation: 0.3, shadowOpacity: 0.1},
    'aurora-glass': {variant: 'elevated-glass', tint: 'background', opacity: 0.8, blur: 16, borderColor: 'accent', borderOpacity: 0.45, borderWidth: 1.5, highlight: 0.12, glow: 0.12, elevation: 2, shadowOpacity: 0.3},
    'ember-glass': {variant: 'luminous', tint: 'background', opacity: 0.88, blur: 10, borderColor: 'accent', borderOpacity: 0.38, borderWidth: 1, highlight: 0.08, glow: 0.06, elevation: 1, shadowOpacity: 0.2},
  };
  const overrides = selection.overrides === undefined ? {} : validateSurfaceOverrides(selection.overrides);
  const brightness = (hex: string) => {
    const full = hex.length <= 5 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1);
    return [0, 2, 4].reduce((sum, offset, index) => sum + parseInt(full.slice(offset, offset + 2), 16) * [0.2126, 0.7152, 0.0722][index]!, 0);
  };
  const shadowColor: ColorRole = brightness(theme.colors.background) < brightness(theme.colors.foreground) ? 'background' : 'foreground';
  const variantDefaults: Record<AdvancedSurfaceVariant, SurfaceOverrides> = {
    solid: {blur: 0, saturation: 1}, translucent: {opacity: 0.78, blur: 0},
    'frosted-glass': {opacity: 0.76, blur: 14, highlight: 0.1},
    'elevated-glass': {opacity: 0.8, blur: 16, elevation: 2, shadowOpacity: 0.28},
    outlined: {opacity: 0, blur: 0, shadowOpacity: 0}, luminous: {opacity: 0.82, blur: 10, glow: 0.1}, custom: {},
  };
  const result = {...base, ...(selection.preset ? {...presets[selection.preset as SurfacePreset], shadowColor} : {}),
    ...(overrides.variant ? variantDefaults[overrides.variant] : {}), ...overrides};
  // Variants set structural material behavior, numeric overrides remain bounded.
  if (result.variant === 'solid') {result.blur = 0; result.saturation = 1;}
  if (result.variant === 'outlined') {result.opacity = 0; result.blur = 0; result.shadowOpacity = 0;}
  return Object.freeze(result);
}

export interface SurfaceAnimationState {readonly highlightPosition: number; readonly illumination: number; readonly blur: number}
// Reuse existing timing/easing/reduced-motion semantics; no second timeline engine.
export function evaluateSurfaceAnimation(frame: number, fps: number, motion: ResolvedTheme['motion'], appearance: SurfaceAppearance,
  options: MotionOptions = {}): SurfaceAnimationState {
  const {progress} = evaluateMotion(frame, fps, motion, options);
  return Object.freeze({highlightPosition: options.reducedMotion ? 50 : -20 + progress * 140,
    illumination: options.reducedMotion ? 1 : 0.65 + progress * 0.35,
    blur: options.reducedMotion ? appearance.blur : Math.min(24, appearance.blur + (1 - progress) * 4)});
}
