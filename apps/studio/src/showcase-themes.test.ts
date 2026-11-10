import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveTheme} from '@code-to-video/themes';
import {createShowcaseRegistry, showcaseDefaults, showcasePresets, validateShowcaseProps} from './showcase-themes.ts';

test('all showcase presets resolve with explicit registered IDs', () => {
  const registry = createShowcaseRegistry();
  for (const preset of showcasePresets) {
    assert.equal(resolveTheme(registry, preset.selection).brandId, preset.selection.brandId);
  }
});

test('showcase validates external props and rejects missing or unknown IDs', () => {
  assert.deepEqual(validateShowcaseProps(showcaseDefaults), showcaseDefaults);
  assert.throws(() => validateShowcaseProps({...showcaseDefaults, brandId: 'missing'}), /Unknown brand ID: missing/);
  assert.throws(() => validateShowcaseProps({brandId: 'aurora-finance'}), /schemaVersion/);
  assert.throws(() => validateShowcaseProps({...showcaseDefaults, overrides: {colors: {accent: 'red'}}}), /hex color/);
  assert.throws(() => validateShowcaseProps({...showcaseDefaults, theme: {}}), /unknown property/);
});
