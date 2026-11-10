import assert from 'node:assert/strict';
import test from 'node:test';
import {PNG} from 'pngjs';
import {assertEffectiveBlur, regionEnergy, regionDifference} from '../../scripts/qa/surface-metrics.ts';
const region = {x: 0, y: 0, width: 16, height: 16};
function image(pattern: boolean) {const png = new PNG({width: 16, height: 16}); for (let i = 0; i < png.data.length; i += 4) {png.data.fill(pattern ? (i / 4 % 2) * 255 : 128, i, i + 3); png.data[i + 3] = 255;} return png;}
test('blur metric rejects unchanged sharp image and low-information negative control', () => {
  assert.throws(() => assertEffectiveBlur(image(true), image(true), region), /BACKDROP_BLUR_INEFFECTIVE/);
  assert.throws(() => assertEffectiveBlur(image(false), image(false), region), /BACKDROP_BLUR_INEFFECTIVE/);
});
test('blur metric measures high-frequency attenuation, bounded regions and actual RGB changes', () => {
  assert.equal(assertEffectiveBlur(image(false), image(true), region).ratio, 0);
  assert.equal(regionDifference(image(true), image(true), region), 0);
  assert(regionDifference(image(false), image(true), region) > 100);
  assert.throws(() => regionEnergy(image(true), {...region, x: -1}), /region/);
});
