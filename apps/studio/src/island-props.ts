import {validateComponentProps} from './component-props.ts';
import type {ComponentShowcaseProps} from './component-props.ts';
export type IslandShowcaseProps = ComponentShowcaseProps & {fixture: 'showcase' | 'icons' | 'island' | 'solid'; diagnostics: boolean};
export const demoIslandTiming = Object.freeze({startSeconds: 0.6, enterSeconds: 0.5, compactSeconds: 1, expandSeconds: 0.8,
  holdSeconds: 5, collapseSeconds: 0.8, compactAfterSeconds: 0.6, exitSeconds: 0.5});
export const demoIslandGeometry = Object.freeze({compactWidth: 440, compactHeight: 88, expandedWidth: 880, expandedHeight: 340, padding: 28, expandedRadius: 36});
export function validateIslandShowcaseProps(input: unknown): IslandShowcaseProps {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Island showcase props must be an object.');
  const descriptors = Object.getOwnPropertyDescriptors(input); const fixture = descriptors.fixture; const diagnostics = descriptors.diagnostics;
  if (fixture && (!('value' in fixture) || !fixture.enumerable || !['showcase', 'icons', 'island', 'solid'].includes(fixture.value))) throw new Error('Unknown island showcase fixture.');
  if (diagnostics && (!('value' in diagnostics) || !diagnostics.enumerable || typeof diagnostics.value !== 'boolean')) throw new Error('Island diagnostics must be a boolean.');
  delete descriptors.fixture; delete descriptors.diagnostics;
  return {...validateComponentProps(Object.create(Object.getPrototypeOf(input), descriptors)), fixture: fixture?.value ?? 'showcase', diagnostics: diagnostics?.value ?? false};
}
