import type {ThemeSelection} from '@code-to-video/themes';
import {validateShowcaseProps} from './showcase-themes.ts';

export type ComponentShowcaseProps = ThemeSelection & {reducedMotion: boolean};
export function validateComponentProps(input: unknown): ComponentShowcaseProps {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new Error('ComponentShowcase props must be an object.');
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const reduced = descriptors.reducedMotion;
  if (reduced && (!('value' in reduced) || !reduced.enumerable || typeof reduced.value !== 'boolean')) {
    throw new Error('ComponentShowcase reducedMotion must be a boolean data property.');
  }
  delete descriptors.reducedMotion;
  // Preserve descriptors/prototype for the existing JSON validator; do not invoke getters.
  const selection: unknown = Object.create(Object.getPrototypeOf(input), descriptors);
  return {...validateShowcaseProps(selection), reducedMotion: reduced?.value ?? false};
}
