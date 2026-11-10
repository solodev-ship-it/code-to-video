import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {evaluateIsland, islandGeometry} from './island.ts';
import {VideoDynamicIsland, IslandNotification, IslandStatistic, IslandProgress, IslandAnnouncement, IslandMedia, VideoSafeArea} from './index.ts';
const r = createThemeRegistry(); [auroraFinance, emberStudio].forEach((b) => r.registerBrand(b)); r.registerVisualStyle(cinematic); r.registerMotionPreset(elegant);
const theme = (brandId = auroraFinance.id) => resolveTheme(r, {schemaVersion: 1, brandId, styleId: 'cinematic', motionId: 'elegant'});
const t = theme();
const timing = {startSeconds: 1, enterSeconds: 1, compactSeconds: 1, expandSeconds: 1, holdSeconds: 2, collapseSeconds: 1, compactAfterSeconds: 1, exitSeconds: 1};
const state = (frame: number) => evaluateIsland(frame, 30, t.motion, timing);
test('island boundary frames follow nonoverlapping sequential stages', () => {
  for (const [frame, phase] of [[29, 'hidden'], [30, 'entering'], [60, 'compact'], [90, 'expanding'], [120, 'expanded'], [180, 'collapsing'], [210, 'compact-after'], [240, 'exiting'], [270, 'hidden']] as const) assert.equal(state(frame).phase, phase);
  assert.equal(state(60).width, 440); assert.equal(state(120).width, 880); assert.equal(state(210).width, 440);
});
test('island morph is bounded, expands/collapses symmetrically and is order independent', () => {
  const first = state(105); state(269); state(0); assert.deepEqual(state(105), first);
  assert(first.width > 440 && first.width < 880); assert.equal(first.width, state(195).width);
  assert.equal(first.expandedOpacity, 0); assert.equal(state(150).expandedOpacity, 1);
  assert.equal(state(180).expandedOpacity, 0); assert(Object.isFrozen(first));
});
test('zero-duration stages snap/skip, zero lifetime is hidden, reduced motion preserves schedule', () => {
  const instant = {...timing, enterSeconds: 0, compactSeconds: 0, expandSeconds: 0, collapseSeconds: 0};
  assert.equal(evaluateIsland(30, 30, t.motion, instant).phase, 'expanded');
  const zero = Object.fromEntries(Object.keys(timing).map((key) => [key, 0]));
  assert.equal(evaluateIsland(0, 30, t.motion, zero).state, 'hidden');
  const reduced = evaluateIsland(95, 30, t.motion, timing, {}, true);
  assert.equal(reduced.width, 880); assert.equal(reduced.iconScale, 1); assert.equal(reduced.expandedOpacity, 0);
});
test('island timing rejects nonfinite, negative, too-long and unknown overlapping interval inputs', () => {
  for (const value of [-1, Infinity, NaN, 11]) assert.throws(() => evaluateIsland(1, 30, t.motion, {expandSeconds: value}), /expandSeconds/);
  assert.throws(() => evaluateIsland(1, 0, t.motion), /FPS/);
  assert.throws(() => evaluateIsland(NaN, 30, t.motion), /frame/);
  assert.throws(() => evaluateIsland(1, 30, t.motion, {expandStart: 2} as never), /sequential/);
});
test('island geometry validates sizes/padding/radius and expanded containment', () => {
  for (const input of [{compactWidth: NaN}, {compactHeight: 12}, {expandedWidth: 300}, {expandedHeight: 65}, {padding: 121}, {expandedRadius: 500}, {width: 300}]) assert.throws(() => islandGeometry(input));
});
test('island supports optional content, custom children, status, safe-area and both themes without viewport dimensions', () => {
  const render = (brandId: string, frame = 150) => renderToStaticMarkup(h(VideoThemeProvider, {theme: theme(brandId), children:
    h(VideoSafeArea, {children: h(VideoDynamicIsland, {frame, fps: 30, timing, title: 'Briefing', secondary: 'Local and deterministic',
      icon: h('svg'), status: 'READY', appearance: {preset: 'cinematic-frost'}, children: h('strong', null, 'Custom authored content')})})}));
  const html = render('aurora-finance'); assert.match(html, /Custom authored content/); assert.match(html, /READY/); assert.match(html, /backdrop-filter/);
  assert(!html.includes('100vw')); assert.match(render('ember-studio'), /#292724/);
  const hidden = render('aurora-finance', 0); assert(!hidden.includes('Briefing'));
  assert.doesNotThrow(() => renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children: h(VideoDynamicIsland, {frame: 60, fps: 30, timing})})));
});
test('five information presentations render supplied data and reject invalid progress', () => {
  const children = [h(IslandNotification, {key: 1, description: 'An update'}), h(IslandStatistic, {key: 2, label: 'Reach', value: '24.8', comparison: '+2', trend: 'up'}),
    h(IslandProgress, {key: 3, title: 'Render', progress: 0.75}), h(IslandAnnouncement, {key: 4, headline: 'New chapter', description: 'The context'}), h(IslandMedia, {key: 5, title: 'Field notes', artwork: h('svg')})];
  const html = renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children}));
  for (const text of ['An update', '24.8', '75%', 'New chapter', 'Field notes']) assert(html.includes(text));
  for (const progress of [-1, 1.1, NaN]) assert.throws(() => renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children: h(IslandProgress, {title: 'Bad', progress})})), /progress/);
});
