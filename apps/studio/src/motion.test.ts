import assert from 'node:assert/strict';
import test from 'node:test';
import {easeOutCubic, progress} from './motion.ts';

test('progress clamps and respects frame boundaries', () => {
  assert.equal(progress(0, 10, 20), 0);
  assert.equal(progress(10, 10, 20), 0);
  assert.equal(progress(20, 10, 20), 0.5);
  assert.equal(progress(30, 10, 20), 1);
  assert.equal(progress(149, 10, 20), 1);
});

test('easing endpoints and independent out-of-order evaluation', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  const value = easeOutCubic(progress(20, 10, 20));
  for (const frame of [149, 0, 90, 1]) easeOutCubic(progress(frame, 10, 20));
  assert.equal(easeOutCubic(progress(20, 10, 20)), value);
  assert.equal(value, 0.875);
});

test('invalid motion inputs fail clearly', () => {
  for (const duration of [0, -1, NaN, Infinity]) {
    assert.throws(() => progress(0, 0, duration), /positive duration/);
  }
  assert.throws(() => progress(NaN, 0, 10), /finite/);
});
