import {validateComponentProps} from './component-props.ts';
import type {ComponentShowcaseProps} from './component-props.ts';

export type ClayShowcaseProps = ComponentShowcaseProps & {fixture: 'showcase' | 'flat'};
export function validateClayShowcaseProps(input: unknown): ClayShowcaseProps {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Clay showcase props must be an object.');
  const descriptors = Object.getOwnPropertyDescriptors(input); const fixture = descriptors.fixture;
  if (fixture && (!('value' in fixture) || !fixture.enumerable || !['showcase', 'flat'].includes(fixture.value))) throw new Error('Unknown clay fixture.');
  delete descriptors.fixture;
  return {...validateComponentProps(Object.create(Object.getPrototypeOf(input), descriptors)), fixture: fixture?.value ?? 'showcase'};
}
