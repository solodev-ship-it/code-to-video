import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, minimal, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {VideoBarChart, VideoLineChart, VideoAreaChart, VideoDonutChart, VideoProgressChart, VideoNumber, VideoTimeline} from './index.ts';

const registry = createThemeRegistry();
for (const brand of [auroraFinance, emberStudio]) registry.registerBrand(brand);
for (const style of [cinematic, minimal]) registry.registerVisualStyle(style);
registry.registerMotionPreset(elegant);
const render = (child: ReturnType<typeof h>, brandId = 'aurora-finance', styleId = 'cinematic') => renderToStaticMarkup(
  h(VideoThemeProvider, {theme: resolveTheme(registry, {schemaVersion: 1, brandId, styleId, motionId: 'elegant'}), children: child}));
const base = {width: 600, height: 320, frame: 20, fps: 30};
test('all public chart components render from theme tokens across brands and styles', () => {
  const elements = [
    h(VideoBarChart, {...base, data: {categories: ['A', 'B'], series: [{id: 'one', label: 'One', values: [-2, 4]}]}}),
    h(VideoLineChart, {...base, series: [{id: 'line', label: 'Line', points: [{x: 0, y: 1}, {x: 7, y: 4}]}]}),
    h(VideoAreaChart, {...base, series: [{id: 'area', label: 'Area', points: [{x: 0, y: 1}, {x: 7, y: 4}]}]}),
    h(VideoDonutChart, {...base, data: [{id: 'part', label: 'Part', value: 2}]}),
    h(VideoProgressChart, {...base, value: 0.4}),
    h(VideoNumber, {from: 0, to: 42, frame: 12, startFrame: 0, endFrame: 30}),
    h(VideoTimeline, {...base, events: [{id: 'start', at: 2020, label: '2020', title: 'Start'}]}),
  ];
  for (const element of elements) {
    const aurora = render(element); const ember = render(element, 'ember-studio', 'minimal');
    assert(aurora.length > 20); assert.notEqual(aurora, ember);
  }
});
test('frame output is independent of evaluation order, and bar values use a zero axis', () => {
  const bar = (frame: number) => render(h(VideoBarChart, {...base, frame, data: {categories: ['Signed'], series: [{id: 'one', label: 'One', values: [-5]}]}}));
  const first = bar(20); bar(90); bar(0); assert.equal(bar(20), first);
  assert.match(first, /-5/);
  assert.notEqual(bar(0), bar(60));
});
test('invalid progress and chart geometry reject rather than silently crop', () => {
  assert.throws(() => render(h(VideoProgressChart, {...base, value: 1.2})), /outside/);
  assert.throws(() => render(h(VideoBarChart, {...base, width: 100, data: {categories: [], series: []}})), /size/);
});
