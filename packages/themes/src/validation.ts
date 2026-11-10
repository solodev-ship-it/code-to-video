import type {BrandIdentity, Color, ColorRole, Colors, JsonValue, MotionOverrides, MotionPreset, SceneOverrides, SpringTokens, StyleOverrides, StyleTokens, ThemeSelection, Typography, VisualStyle} from './types.ts';

type Check<T> = (value: unknown, path: string) => T;
type Fields<T> = {[K in keyof T]-?: Check<T[K]>};
const fail = (path: string, message: string): never => {throw new Error(`${path}: ${message}`);};
const record = (value: unknown, path: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return fail(path, 'expected a plain object');
  return value as Record<string, unknown>;
};

// Reject values that JSON would silently drop/coerce, and never run toJSON hooks.
function checkJson(value: unknown, path: string, ancestors = new Set<object>(), depth = 0): void {
  if (depth > 32) fail(path, 'maximum configuration depth is 32');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (typeof value !== 'object' || value === null) fail(path, 'expected serializable JSON data');
  const object = value as object;
  if (ancestors.has(object)) fail(path, 'cyclic configuration is not supported');
  if (!Array.isArray(value)) record(value, path);
  else if (Object.getPrototypeOf(value) !== Array.prototype) fail(path, 'expected a plain JSON array');
  if (Object.getOwnPropertySymbols(object).length) fail(path, 'symbol keys are not JSON data');
  ancestors.add(object);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(object))) {
    if (Array.isArray(value) && key === 'length') continue;
    if (Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) {
      fail(`${path}.${key}`, 'expected a dense JSON array without extra properties');
    }
    if (!descriptor.enumerable || !('value' in descriptor)) fail(`${path}.${key}`, 'expected an enumerable data property');
    if (['__proto__', 'prototype', 'constructor'].includes(key)) fail(`${path}.${key}`, 'unsafe configuration key');
    checkJson(descriptor.value, `${path}.${key}`, ancestors, depth + 1);
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length) fail(path, 'expected a dense JSON array');
  ancestors.delete(object);
}

function shape<T extends object>(fields: Fields<T>): Check<T> {
  return (value, path) => {
    const input = record(value, path);
    for (const key of Object.keys(input)) if (!Object.hasOwn(fields, key)) fail(`${path}.${key}`, 'unknown property');
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(fields) as (keyof T & string)[]) {
      const parsed = fields[key](input[key], `${path}.${key}`);
      if (parsed !== undefined) output[key] = parsed;
    }
    return output as T;
  };
}
const optional = <T>(check: Check<T>): Check<T | undefined> => (v, p) => v === undefined ? undefined : check(v, p);
const partial = <T extends object>(fields: Fields<T>): Check<Partial<T>> => {
  const checks = Object.fromEntries(Object.entries(fields).map(([key, check]) => [key, optional(check as Check<unknown>)]));
  return shape(checks as Fields<Partial<T>>);
};
const text: Check<string> = (v, p) => typeof v === 'string' && v.trim().length > 0 && v.length <= 256 ? v : fail(p, 'expected a nonempty string (max 256 characters)');
const identifier: Check<string> = (v, p) => typeof v === 'string' && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(v) && v.length <= 80 ? v : fail(p, 'expected a stable lowercase kebab-case ID (max 80 characters)');
const color: Check<Color> = (v, p) => typeof v === 'string' && /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(v) ? v as Color : fail(p, 'expected a hex color (#RGB, #RGBA, #RRGGBB, or #RRGGBBAA)');
const number = (min: number, max: number): Check<number> => (v, p) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fail(p, `expected a finite number in [${min}, ${max}]`);
const unit = number(0, 1);
const boolean: Check<boolean> = (v, p) => typeof v === 'boolean' ? v : fail(p, 'expected a boolean');
const enumeration = <T extends string>(values: readonly T[]): Check<T> => (v, p) => values.includes(v as T) ? v as T : fail(p, `expected one of: ${values.join(', ')}`);
const version: Check<1> = (v, p) => v === 1 ? 1 : fail(p, 'unsupported schemaVersion; expected 1');
const role = enumeration<ColorRole>(['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'mutedForeground']);

const colors: Fields<Colors> = {primary: color, secondary: color, accent: color, background: color, foreground: color, muted: color, mutedForeground: color};
const typography: Fields<Typography> = {
  fontFamily: text, headingFontFamily: text, headingWeight: number(100, 900), bodyWeight: number(100, 900),
  titleSize: number(12, 240), bodySize: number(10, 100), captionSize: number(8, 72), lineHeight: number(0.8, 2.5), letterSpacing: number(-5, 30),
};
const spring: Fields<SpringTokens> = {damping: number(1, 100), stiffness: number(1, 500), mass: number(0.1, 10)};
const motion: Fields<MotionOverrides> = {
  durationSeconds: optional(number(0.05, 10)), delaySeconds: optional(number(0, 10)), staggerSeconds: optional(number(0, 2)),
  easing: optional(enumeration(['linear', 'ease-out-cubic', 'ease-in-out-cubic'] as const)),
  intensity: optional(number(0, 2)), distance: optional(number(0, 200)), spring: optional(partial(spring)),
};
const style: Fields<StyleOverrides> = {
  surface: optional(partial<StyleTokens['surface']>({color: role, opacity: unit})),
  radii: optional(partial<StyleTokens['radii']>({card: number(0, 120), badge: number(0, 120)})),
  border: optional(partial<StyleTokens['border']>({color: role, width: number(0, 12), opacity: unit})),
  shadow: optional(partial<StyleTokens['shadow']>({color: role, offsetY: number(-100, 100), blur: number(0, 160), opacity: unit})),
  gradient: optional(partial<StyleTokens['gradient']>({enabled: boolean, from: role, to: role, angle: number(0, 360), opacity: unit})),
  spacing: optional(partial<StyleTokens['spacing']>({page: number(16, 240), gap: number(0, 120), cardPadding: number(8, 120)})),
  layout: optional(partial<StyleTokens['layout']>({contentWidth: number(600, 1800)})),
  effects: optional(partial<StyleTokens['effects']>({gridOpacity: unit, glowOpacity: unit})),
};
const overrides = shape<SceneOverrides>({...style, colors: optional(partial(colors)), typography: optional(partial(typography)), motion: optional(shape(motion))});
const brand = shape<BrandIdentity>({
  schemaVersion: version, id: identifier, displayName: text, colors: shape(colors), typography: optional(partial(typography)),
  logoAssetId: optional(identifier), metadata: optional((v, p) => JSON.parse(JSON.stringify(record(v, p))) as {[key: string]: JsonValue}),
});
const visualStyle = shape<VisualStyle>({schemaVersion: version, id: identifier, displayName: text, defaultColors: optional(partial(colors)), tokens: optional(shape(style))});
const preset = shape<MotionPreset>({schemaVersion: version, id: identifier, displayName: text, tokens: optional(shape(motion))});
const selection = shape<ThemeSelection>({schemaVersion: version, brandId: identifier, styleId: identifier, motionId: identifier, overrides: optional(overrides)});
const validate = <T>(check: Check<T>, value: unknown, path: string): T => {checkJson(value, path); return check(value, path);};

export const validateBrand = (value: unknown): BrandIdentity => validate(brand, value, 'brand');
export const validateVisualStyle = (value: unknown): VisualStyle => validate(visualStyle, value, 'style');
export const validateMotionPreset = (value: unknown): MotionPreset => validate(preset, value, 'motion');
export const validateSceneOverrides = (value: unknown): SceneOverrides => validate(overrides, value, 'overrides');
export const validateThemeSelection = (value: unknown): ThemeSelection => validate(selection, value, 'selection');
