import assert from 'node:assert/strict';
import test from 'node:test';
import {PNG} from 'pngjs';
import {assertLabelContrast, assertVisibleLabel, labelContrast} from '../../scripts/qa/glass-contrast.ts';
const label = {id: 'ordinary-small-text', color: '#292724', computedColor: 'rgb(41, 39, 36)', x: 1, y: 1, width: 6, height: 6, opacity: 1};
function image(rgb: number[]) {const out = new PNG({width: 8, height: 8}); for (let i = 0; i < out.data.length; i += 4) {out.data.set([...rgb, 255], i);} return out;}
test('ordinary small text rejects the original Ember accent over representative composited glass', () => {
  const background = image([231, 226, 216]);
  assert.throws(() => assertLabelContrast(background, {...label, color: '#cf4a3c'}), /GLASS_LABEL_CONTRAST:/);
  assert(assertLabelContrast(background, label).minimumRatio > 11);
});
test('contrast uses worst backdrop pixel rather than an average or unrelated sample', () => {
  const background = image([246, 240, 231]); background.data.set([41, 39, 36, 255], (3 * 8 + 3) * 4);
  assert.equal(labelContrast(background, label).minimumRatio, 1);
  assert.throws(() => assertLabelContrast(background, label), /GLASS_LABEL_CONTRAST:/);
});
test('contrast rejects nonopaque backgrounds, invalid regions/colors and translucent labels', () => {
  const background = image([246, 240, 231]); background.data[(2 * 8 + 2) * 4 + 3] = 128;
  assert.throws(() => labelContrast(background, label), /opaque/);
  for (const extra of [{opacity: 0.5}, {x: -1}, {width: 0}, {y: NaN}, {color: '#29272480'}]) assert.throws(() => labelContrast(image([255, 255, 255]), {...label, ...extra}));
});
test('a passing nominal contrast is insufficient if text ink is absent', () => {
  const background = image([246, 240, 231]);
  assert.throws(() => assertVisibleLabel(background, background, label), /GLASS_LABEL_INK_MISSING/);
  assert(assertVisibleLabel(image([41, 39, 36]), background, label) >= 8);
});
