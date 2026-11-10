import {validateComponentProps} from './component-props.ts';
import type {ComponentShowcaseProps} from './component-props.ts';
export const glassFixtures = ['showcase', 'glass', 'no-blur', 'fallback', 'solid', 'layered', 'alpha', 'border-off', 'shadow-off', 'label-contrast', 'label-contrast-fallback'] as const;
export const glassBackgrounds = ['dark', 'light', 'grid', 'frequency'] as const;
export type GlassProps = ComponentShowcaseProps & {fixture: typeof glassFixtures[number]; background: typeof glassBackgrounds[number]; diagnostics: boolean; hideLabelInk: boolean};
export function validateGlassProps(input: unknown): GlassProps {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Glass props must be an object.');
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const fixture = descriptors.fixture; const background = descriptors.background;
  const diagnostics = descriptors.diagnostics;
  if (diagnostics && (!('value' in diagnostics) || !diagnostics.enumerable || typeof diagnostics.value !== 'boolean')) throw new Error('Glass diagnostics must be a boolean.');
  const hideLabelInk = descriptors.hideLabelInk;
  if (hideLabelInk && (!('value' in hideLabelInk) || !hideLabelInk.enumerable || typeof hideLabelInk.value !== 'boolean')) throw new Error('Glass hideLabelInk must be a boolean.');
  for (const [name, d, allowed] of [['fixture', fixture, glassFixtures], ['background', background, glassBackgrounds]] as const) {
    if (d && (!('value' in d) || !d.enumerable || !(allowed as readonly unknown[]).includes(d.value))) throw new Error(`Unknown glass ${name}.`);
  }
  delete descriptors.fixture; delete descriptors.background; delete descriptors.diagnostics; delete descriptors.hideLabelInk;
  return {...validateComponentProps(Object.create(Object.getPrototypeOf(input), descriptors)), fixture: fixture?.value ?? 'showcase', background: background?.value ?? 'dark', diagnostics: diagnostics?.value ?? false, hideLabelInk: hideLabelInk?.value ?? false};
}
