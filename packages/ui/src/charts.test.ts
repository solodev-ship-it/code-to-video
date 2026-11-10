import assert from 'node:assert/strict';
import test from 'node:test';
import {frameworkDefaults} from '@code-to-video/themes';
import {validateBarData, normalizeXYSeries, numericDomain, unitRatio, mapCoordinate, generateTicks, formatChartValue, formatTickLabels,
  normalizeDonut, normalizeTimeline, timelineDate, numberAtFrame, chartProgress} from './charts.ts';
const bars = {categories: ['A', 'B'], series: [{id: 'sample', label: 'Sample', values: [3, -2]}]};
test('bar validation owns immutable data and preserves signed/zero values', () => {
  const parsed = validateBarData(bars); bars.series[0]!.values[0] = 4;
  assert.equal(parsed.series[0]!.values[0], 3); assert(Object.isFrozen(parsed.series[0]!.values));
  assert.deepEqual(numericDomain(parsed.series[0]!.values, true), [-2, 3]);
});
test('datasets reject missing, nonfinite, sparse, duplicate and mismatched data rather than dropping it', () => {
  for (const values of [[1], [1, null], [1, undefined], [1, NaN], [1, Infinity], Array(2)]) assert.throws(() => validateBarData({...bars, series: [{id: 'bad', label: 'Bad', values}]}));
  assert.throws(() => validateBarData({...bars, categories: ['A', 'A']}), /Duplicate/);
  assert.throws(() => validateBarData({...bars, source: 'unknown'}), /property/);
  assert.throws(() => validateBarData(Object.defineProperty({}, 'categories', {get() {throw new Error('not invoked');}})), /property/);
});
test('domains keep zero for categorical bars, handle zero/constant/empty and reject cropping', () => {
  assert.deepEqual(numericDomain([2, 4], true), [0, 4]); assert.deepEqual(numericDomain([-4, -2], true), [-4, 0]);
  assert.deepEqual(numericDomain([0, 0], true), [0, 1]); assert.equal(numericDomain([]), null);
  assert(numericDomain([7, 7])![0] < 7); assert(numericDomain([7, 7])![1] > 7);
  assert.throws(() => numericDomain([1, 4], true, [1, 5]), /zero baseline/);
  assert.throws(() => numericDomain([1, 4], false, [0, 3]), /excludes/);
});
test('extreme signed and subnormal domains map to finite accurate coordinates', () => {
  assert.equal(unitRatio(0, [-1e308, 1e308]), 0.5); assert.equal(mapCoordinate(0, [-1e308, 1e308], [500, 0]), 250);
  assert(Math.abs(unitRatio(2e-300, [1e-300, 3e-300]) - 0.5) < Number.EPSILON);
  assert.deepEqual(numericDomain([Number.MIN_VALUE], true), [0, Number.MIN_VALUE]);
  assert(numericDomain([Number.MAX_VALUE])!.every(Number.isFinite));
  assert.throws(() => unitRatio(12, [0, 10]), /outside/); assert.throws(() => unitRatio(1, [1, 1]), /increasing/);
});
test('ticks include endpoints and use finite stable interpolation across extreme signs', () => {
  assert.deepEqual(generateTicks([-10, 10], 5), [-10, -5, 0, 5, 10]);
  const extreme = generateTicks([-1e308, 1e308]); assert(extreme.every(Number.isFinite)); assert.equal(extreme[2], 0);
  assert.throws(() => generateTicks([0, 1], 1), /tick count/);
  const tight = generateTicks([1e12, 1e12 + 1]); assert.equal(new Set(formatTickLabels(tight)).size, tight.length);
});
test('formatting is locale-independent, explicit for currency/percentage, and never rounds tiny nonzero data to zero', () => {
  assert.equal(formatChartValue(1234.5, {grouping: true}), '1,234.5');
  assert.equal(formatChartValue(0.248, {style: 'percent', decimals: 1}), '24.8%');
  assert.equal(formatChartValue(12.5, {style: 'currency', currency: 'USD'}), 'USD 12.5');
  assert.match(formatChartValue(1e-300), /e-300/); assert.match(formatChartValue(1e308), /e\+308/);
  assert.equal(formatChartValue(-0), '0'); assert.notEqual(formatChartValue(0.004), '0');
  assert.throws(() => formatChartValue(2, {style: 'currency'}), /explicit/);
  assert.throws(() => formatChartValue(2, {decimals: 99}), /format/);
});
test('XY normalization preserves irregular numerical X and refuses missing/duplicate/unsorted observations', () => {
  const s = normalizeXYSeries([{id: 'line', label: 'Line', points: [{x: 0, y: -2}, {x: 1, y: 4}, {x: 10, y: 0}]}]);
  assert.equal(mapCoordinate(s[0]!.points[1]!.x, [0, 10], [0, 100]), 10); assert(Object.isFrozen(s[0]!.points[0]));
  for (const points of [[{x: 1, y: 0}, {x: 1, y: 1}], [{x: 2, y: 0}, {x: 1, y: 1}], [{x: 0, y: null}]]) assert.throws(() => normalizeXYSeries([{id: 'bad', label: 'Bad', points}]));
  assert.deepEqual(normalizeXYSeries([]), []);
});
test('donut normalization handles zero, negatives and huge totals without Infinity fractions', () => {
  const data = normalizeDonut([{id: 'a', label: 'A', value: 1e308}, {id: 'b', label: 'B', value: 1e308}]);
  assert.equal(data.total, null); assert.equal(data.overflow, true); assert.equal(data.segments[1]!.fraction, 0.5); assert.equal(data.segments[1]!.start, 0.5);
  assert.equal(normalizeDonut([{id: 'zero', label: 'Zero', value: 0}]).total, 0);
  assert.deepEqual(normalizeDonut([]).segments, []);
  assert.throws(() => normalizeDonut([{id: 'negative', label: 'Negative', value: -1}]), /nonnegative/);
  assert.throws(() => normalizeDonut([{id: 'tiny', label: 'Tiny', value: Number.MIN_VALUE}, {id: 'big', label: 'Big', value: 1e308}]), /precision/);
});
test('timeline uses actual intervals by default and makes equal-event layout explicit', () => {
  const data = [{id: 'a', at: 2000, label: '2000', title: 'A'}, {id: 'b', at: 2001, label: '2001', title: 'B'}, {id: 'c', at: 2010, label: '2010', title: 'C'}];
  assert.equal(normalizeTimeline(data)[1]!.position, 0.1); assert.equal(normalizeTimeline(data, 'events')[1]!.position, 0.5);
  assert.throws(() => normalizeTimeline([...data].reverse()), /chronological/);
  assert.throws(() => normalizeTimeline([data[0], {...data[1], at: '2001-01-01'}]), /mix/);
  assert.deepEqual(normalizeTimeline([]), []);
});
test('calendar dates are validated in UTC, without local timezone or current time', () => {
  assert.equal(timelineDate('2024-02-29'), Date.UTC(2024, 1, 29));
  assert.throws(() => timelineDate('2023-02-29'), /Invalid/); assert.throws(() => timelineDate('03/04/2020'), /YYYY/);
});
test('chart motion reuses explicit timing, stagger, boundaries and reduced-motion snapping', () => {
  const motion = frameworkDefaults.motion;
  assert.equal(chartProgress(-1, 30, motion), 0); assert.equal(chartProgress(100, 30, motion), 1);
  assert.equal(chartProgress(0, 30, motion, {reducedMotion: true}), 1);
  assert.equal(chartProgress(14, 30, motion, {startSeconds: 0.5, reducedMotion: true}), 0);
  assert.equal(chartProgress(15, 30, motion, {startSeconds: 0.5, reducedMotion: true}), 1);
  assert.equal(chartProgress(10, 30, motion, {staggerSeconds: 1}, 1), 0);
  assert.throws(() => chartProgress(0, 30, motion, {durationSeconds: 0}), /duration/);
  assert.throws(() => chartProgress(0, 0, motion), /FPS/);
});
test('number interpolation is independent, boundary-exact and avoids subtraction overflow/drift', () => {
  assert.equal(numberAtFrame(15, -1e308, 1e308, 0, 30), 0);
  assert.equal(numberAtFrame(0, 2, 7, 10, 20), 2); assert.equal(numberAtFrame(20, 2, 7, 10, 20), 7);
  const expected = numberAtFrame(17, 0, 10.5, 10, 30); numberAtFrame(99, 0, 10.5, 10, 30); assert.equal(numberAtFrame(17, 0, 10.5, 10, 30), expected);
  assert.equal(numberAtFrame(10, 0, 12, 10, 10), 12); assert.equal(numberAtFrame(10, 0, 12, 10, 30, true), 12);
  assert.throws(() => numberAtFrame(0, 1, 2, 20, 10), /ordered/);
});
