import assert from 'node:assert/strict';
import test from 'node:test';
import {frameworkDefaults} from '@code-to-video/themes';
import {evaluateMotion, motionStyle, stagger} from './motion.ts';
import type {MotionPreset} from './motion.ts';

const motion = frameworkDefaults.motion;
for (const preset of ['fade', 'slide', 'scale', 'reveal'] as MotionPreset[]) {
  test(`${preset}: clamped endpoints, independent frame order, no history dependence`, () => {
    const options = {preset, startSeconds: 1, durationSeconds: 1};
    assert.equal(evaluateMotion(0, 30, motion, options).progress, 0);
    assert.equal(evaluateMotion(60, 30, motion, options).progress, 1);
    const middle = evaluateMotion(45, 30, motion, options);
    for (const frame of [269, 0, 90, -1]) evaluateMotion(frame, 30, motion, options);
    assert.deepEqual(evaluateMotion(45, 30, motion, options), middle);
    assert.equal(middle.progress, evaluateMotion(90, 60, motion, options).progress);
    assert(!Object.values(middle).some((value) => !Number.isFinite(value)));
  });
}
test('slide directions and scale/reveal preserve geometry at completion', () => {
  assert(evaluateMotion(0, 30, motion, {preset: 'slide', direction: 'up'}).y > 0);
  assert(evaluateMotion(0, 30, motion, {preset: 'slide', direction: 'down'}).y < 0);
  assert(evaluateMotion(0, 30, motion, {preset: 'slide', direction: 'left'}).x > 0);
  assert(evaluateMotion(0, 30, motion, {preset: 'slide', direction: 'right'}).x < 0);
  assert(evaluateMotion(0, 30, motion, {preset: 'scale'}).scale < 1);
  assert.equal(evaluateMotion(200, 30, motion, {preset: 'scale'}).scale, 1);
  assert.equal(evaluateMotion(0, 30, motion, {preset: 'reveal'}).revealPercent, 0);
  assert.equal(motionStyle(evaluateMotion(200, 30, motion, {preset: 'reveal'})).clipPath, 'none');
});
test('stagger composes time offsets and delays the same preset predictably', () => {
  assert.equal(stagger(3, 0.2, 1), 1.6);
  const first = evaluateMotion(35, 30, motion, {startSeconds: 1, staggerIndex: 0, staggerSeconds: 0.5});
  const second = evaluateMotion(35, 30, motion, {startSeconds: 1, staggerIndex: 1, staggerSeconds: 0.5});
  assert(first.opacity > second.opacity);
  assert.equal(second.opacity, 0);
  assert.throws(() => stagger(-1, 0.1), /nonnegative/);
  assert.throws(() => stagger(1, NaN), /nonnegative/);
});
test('reduced motion uses a short fade, removes transforms/clipping, retains start time', () => {
  for (const preset of ['slide', 'scale', 'reveal'] as const) {
    const options = {preset, reducedMotion: true, startSeconds: 1};
    assert.equal(evaluateMotion(0, 30, motion, options).opacity, 0);
    const state = evaluateMotion(40, 30, motion, options);
    assert.equal(state.opacity, 1);
    assert.equal(state.x, 0); assert.equal(state.y, 0);
    assert.equal(state.scale, 1); assert.equal(state.revealPercent, 100);
  }
});
test('timing overrides, easing, and intensity are explicit inputs', () => {
  const linear = evaluateMotion(15, 30, motion, {startSeconds: 0, durationSeconds: 1, easing: 'linear'});
  assert.equal(linear.progress, 0.5);
  assert.notEqual(linear.progress, evaluateMotion(15, 30, motion, {startSeconds: 0, durationSeconds: 1, easing: 'ease-out-cubic'}).progress);
  assert.equal(evaluateMotion(0, 30, {...motion, intensity: 0}, {preset: 'slide'}).y, 0);
});
test('invalid motion settings fail clearly', () => {
  for (const durationSeconds of [0, -1, NaN, Infinity, 11]) assert.throws(() => evaluateMotion(0, 30, motion, {durationSeconds}), /durationSeconds/);
  assert.throws(() => evaluateMotion(0, 0, motion), /positive finite FPS/);
  assert.throws(() => evaluateMotion(NaN, 30, motion), /finite frame/);
  assert.throws(() => evaluateMotion(0, 30, motion, {distance: -1}), /distance/);
  assert.throws(() => evaluateMotion(0, 30, motion, {fromScale: 0}), /fromScale/);
});
