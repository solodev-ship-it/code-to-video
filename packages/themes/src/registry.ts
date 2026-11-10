import type {BrandIdentity, DeepReadonly, MotionPreset, RegisteredBrand, VisualStyle} from './types.ts';
import {validateBrand, validateMotionPreset, validateVisualStyle} from './validation.ts';
import {freezeData} from './immutable.ts';

export interface ThemeRegistry {
  registerBrand(config: BrandIdentity): void;
  registerVisualStyle(config: VisualStyle): void;
  registerMotionPreset(config: MotionPreset): void;
  getBrand(id: string): RegisteredBrand;
  getVisualStyle(id: string): DeepReadonly<VisualStyle>;
  getMotionPreset(id: string): DeepReadonly<MotionPreset>;
  seal(): void;
}

export function createThemeRegistry(): ThemeRegistry {
  const brands = new Map<string, RegisteredBrand>();
  const styles = new Map<string, DeepReadonly<VisualStyle>>();
  const motions = new Map<string, DeepReadonly<MotionPreset>>();
  let sealed = false;
  function add<T extends {readonly id: string}>(map: Map<string, T>, value: T, kind: string) {
    if (sealed) throw new Error('Theme registry is sealed; register configurations during initialization.');
    if (map.has(value.id)) throw new Error(`Duplicate ${kind} ID: ${value.id}`);
    map.set(value.id, freezeData(value));
  }
  function get<T>(map: Map<string, T>, id: string, kind: string): T {
    const value = map.get(id);
    if (!value) throw new Error(`Unknown ${kind} ID: ${id}`);
    return value;
  }
  return Object.freeze({
    registerBrand: (config: BrandIdentity) => add(brands, validateBrand(config), 'brand'),
    registerVisualStyle: (config: VisualStyle) => add(styles, validateVisualStyle(config), 'visual style'),
    registerMotionPreset: (config: MotionPreset) => add(motions, validateMotionPreset(config), 'motion preset'),
    getBrand: (id: string) => get(brands, id, 'brand'),
    getVisualStyle: (id: string) => get(styles, id, 'visual style'),
    getMotionPreset: (id: string) => get(motions, id, 'motion preset'),
    seal: () => {sealed = true;},
  });
}
