import assert from 'node:assert/strict';
import test from 'node:test';
import {validateComponentProps} from './component-props.ts';
import {showcaseDefaults} from './showcase-themes.ts';

test('component props reuse theme validation and default to explicit normal motion', () => {
  assert.equal(validateComponentProps(showcaseDefaults).reducedMotion, false);
  assert.equal(validateComponentProps({...showcaseDefaults, reducedMotion: true}).reducedMotion, true);
  assert.throws(() => validateComponentProps({...showcaseDefaults, reducedMotion: 'auto'}), /boolean/);
  assert.throws(() => validateComponentProps({...showcaseDefaults, brandId: 'missing'}), /Unknown brand ID/);
  assert.throws(() => validateComponentProps({...showcaseDefaults, surprise: 1}), /unknown property/);
});
