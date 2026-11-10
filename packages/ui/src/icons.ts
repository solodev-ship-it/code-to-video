import type {ComponentType} from 'react';
import type {ResolvedTheme} from '@code-to-video/themes';
import {evaluateMotion} from './motion.ts';
import type {MotionOptions} from './motion.ts';

export type IconLibrary = 'lucide' | 'phosphor' | 'custom';
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
export interface IconRenderProps {size: number; color: string; strokeWidth: number; weight: IconWeight; drawProgress: number}
export interface IconDefinition {
  readonly id: string;
  readonly library: IconLibrary;
  readonly render: ComponentType<IconRenderProps>;
  readonly supportsStroke: boolean;
  readonly supportsDraw: boolean;
}
export interface IconRegistry {
  register(definition: IconDefinition): void;
  resolve(library: IconLibrary, id: string): Readonly<IconDefinition>;
  seal(): void;
}
export function createIconRegistry(initial: readonly IconDefinition[] = []): IconRegistry {
  const entries = new Map<string, Readonly<IconDefinition>>(); let sealed = false;
  const registry: IconRegistry = {
    register(definition) {
      if (sealed) throw new Error('Icon registry is sealed.');
      if (!definition || !['lucide', 'phosphor', 'custom'].includes(definition.library) || !/^[a-z][a-z0-9-]{0,79}$/.test(definition.id) ||
        typeof definition.render !== 'function' || typeof definition.supportsStroke !== 'boolean' || typeof definition.supportsDraw !== 'boolean') throw new Error('Invalid icon definition.');
      const key = `${definition.library}:${definition.id}`;
      if (entries.has(key)) throw new Error(`Duplicate icon: ${key}`);
      entries.set(key, Object.freeze({...definition}));
    },
    resolve(library, id) {const entry = entries.get(`${library}:${id}`); if (!entry) throw new Error(`Unknown icon: ${library}:${id}`); return entry;},
    seal() {sealed = true;},
  };
  initial.forEach((definition) => registry.register(definition));
  return Object.freeze(registry);
}
export function boundedIconNumber(name: string, value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Icon ${name} must be in [${min}, ${max}].`);
  return value;
}
export type IconAnimationPreset = 'fade' | 'scale' | 'slide' | 'rotate' | 'draw' | 'reveal' | 'pulse';
export type IconAnimationOptions = Omit<MotionOptions, 'preset'> & {preset: IconAnimationPreset; turns?: number; pulseCycles?: number; pulseAmount?: number};
export function evaluateIconAnimation(frame: number, fps: number, motion: ResolvedTheme['motion'], options: IconAnimationOptions) {
  if (!['fade', 'scale', 'slide', 'rotate', 'draw', 'reveal', 'pulse'].includes(options.preset)) throw new Error('Unknown icon animation.');
  const turns = boundedIconNumber('turns', options.turns ?? 0.125, -2, 2);
  const cycles = boundedIconNumber('pulseCycles', options.pulseCycles ?? 2, 1, 8);
  if (!Number.isInteger(cycles)) throw new Error('Icon pulseCycles must be an integer.');
  const amount = boundedIconNumber('pulseAmount', options.pulseAmount ?? 0.04, 0, 0.12);
  const preset = options.preset === 'scale' || options.preset === 'slide' ? options.preset : 'fade';
  const state = evaluateMotion(frame, fps, motion, {...options, preset});
  const p = state.progress;
  return Object.freeze({...state, rotation: !options.reducedMotion && options.preset === 'rotate' ? (1 - p) * turns * 360 : 0,
    scale: state.scale * (!options.reducedMotion && options.preset === 'pulse' ? 1 + Math.sin(p * Math.PI * cycles * 2) * amount : 1),
    drawProgress: options.reducedMotion ? 1 : p});
}
