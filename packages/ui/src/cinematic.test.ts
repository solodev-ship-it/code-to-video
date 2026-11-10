import test from 'node:test';
import assert from 'node:assert/strict';
import {assetOpacity, cinematicProgress, sequenceIndex, validateAssetSource} from './cinematic.ts';
const seq = (policy: 'once' | 'hold' | 'loop') => ({type: 'sequence' as const, frames: ['a.png', 'b.png', 'c.png'], sourceFps: 15, startFrame: 10, policy});
test('sequence maps half-open boundaries independently of seek order', () => {
  for (const policy of ['once', 'hold', 'loop'] as const) {
    const s = seq(policy); validateAssetSource(s);
    assert.equal(sequenceIndex(s, 10, 30), 0); assert.equal(sequenceIndex(s, 13, 30), 1);
    assert.equal(sequenceIndex(s, 16, 30), policy === 'once' ? null : policy === 'hold' ? 2 : 0);
    assert.equal(sequenceIndex(s, -10, 30), policy === 'hold' ? 0 : null);
    const first = sequenceIndex(s, 14, 30); sequenceIndex(s, 500, 30);
    assert.equal(sequenceIndex(s, 14, 30), first);
  }
});
test('invalid asset contracts reject with useful errors', () => {
  for (const value of [null, {}, {type: 'png'}, {type: 'png', src: '../x.png'}, {type: 'png', src: 'https://x/a.png'},
    {...seq('once'), frames: []}, {...seq('once'), sourceFps: 0}, {...seq('once'), sourceFps: NaN},
    {...seq('once'), startFrame: -1}, {...seq('once'), policy: 'other'},
    {type: 'video', src: 'a.mp4', startFrame: 0, durationInFrames: 30, alpha: 'transparent'}]) {
    assert.throws(() => validateAssetSource(value));
  }
  assert.equal(validateAssetSource({type: 'video', src: 'a.mp4', startFrame: 0, durationInFrames: 30, alpha: 'opaque'}).type, 'video');
  assert.throws(() => sequenceIndex(seq('once'), 1, 0), /fps/);
});
test('motion is bounded, repeatable and exits explicitly', () => {
  assert.equal(cinematicProgress(-1, 0, 30), 0); assert.equal(cinematicProgress(60, 0, 30), 1);
  assert.equal(cinematicProgress(15, 0, 30), 0.5);
  const a = {startFrame: 10, endFrame: 60, fadeInFrames: 10, fadeOutFrames: 10};
  assert.deepEqual([-1, 10, 15, 30, 55, 60, 80].map(f => assetOpacity(f, a)), [0, 0, 0.5, 1, 0.5, 0, 0]);
  assert.throws(() => cinematicProgress(1, 0, 0));
});
