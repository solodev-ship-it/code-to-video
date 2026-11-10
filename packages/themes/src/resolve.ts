import {frameworkDefaults as defaults} from './defaults.ts';
import {freezeData} from './immutable.ts';
import type {ThemeRegistry} from './registry.ts';
import type {JsonValue, ResolvedTheme} from './types.ts';
import {validateThemeSelection} from './validation.ts';

export function resolveTheme(registry: ThemeRegistry, input: unknown): ResolvedTheme {
  const selection = validateThemeSelection(input);
  const brand = registry.getBrand(selection.brandId);
  const style = registry.getVisualStyle(selection.styleId);
  const motion = registry.getMotionPreset(selection.motionId);
  const s = style.tokens ?? {};
  const m = motion.tokens ?? {};
  const o = selection.overrides ?? {};
  const metadata: {[key: string]: JsonValue} | undefined = brand.metadata
    ? JSON.parse(JSON.stringify(brand.metadata)) : undefined;
  // Explicit ownership and bounded, one-level merges only; no recursive merge.
  return freezeData({
    schemaVersion: 1,
    brandId: brand.id, brandName: brand.displayName,
    styleId: style.id, styleName: style.displayName,
    motionId: motion.id, motionName: motion.displayName,
    colors: {...defaults.colors, ...style.defaultColors, ...brand.colors, ...o.colors},
    typography: {...defaults.typography, ...brand.typography, ...o.typography},
    surface: {...defaults.style.surface, ...s.surface, ...o.surface},
    radii: {...defaults.style.radii, ...s.radii, ...o.radii},
    border: {...defaults.style.border, ...s.border, ...o.border},
    shadow: {...defaults.style.shadow, ...s.shadow, ...o.shadow},
    gradient: {...defaults.style.gradient, ...s.gradient, ...o.gradient},
    spacing: {...defaults.style.spacing, ...s.spacing, ...o.spacing},
    layout: {...defaults.style.layout, ...s.layout, ...o.layout},
    effects: {...defaults.style.effects, ...s.effects, ...o.effects},
    motion: {...defaults.motion, ...m, ...o.motion, spring: {...defaults.motion.spring, ...m.spring, ...o.motion?.spring}},
    ...(brand.logoAssetId ? {logoAssetId: brand.logoAssetId} : {}),
    ...(metadata ? {metadata} : {}),
  });
}
