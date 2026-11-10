import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, minimal, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {clayPresets, evaluateClayMotion, resolveClay, validateClayOverrides} from './clay.ts';
import {VideoClaySurface, VideoClayCard, VideoClayShape} from './index.ts';

const registry = createThemeRegistry();
for (const brand of [auroraFinance, emberStudio]) registry.registerBrand(brand);
for (const style of [cinematic, minimal]) registry.registerVisualStyle(style);
registry.registerMotionPreset(elegant);
const theme = (brandId = 'aurora-finance', styleId = 'cinematic') => resolveTheme(registry, {schemaVersion: 1, brandId, styleId, motionId: 'elegant'});
const render = (child: ReturnType<typeof h>, brandId = 'aurora-finance', styleId = 'cinematic') => renderToStaticMarkup(
  h(VideoThemeProvider, {theme: theme(brandId, styleId), children: child}));

test('presets resolve immutably with semantic theme colors in both light and dark systems', () => {
  for (const brand of ['aurora-finance', 'ember-studio']) for (const style of ['cinematic', 'minimal']) for (const preset of clayPresets) {
    const t = theme(brand, style); const a = resolveClay(t, {preset});
    assert(Object.isFrozen(a)); assert.equal(a.fill, 'muted'); assert.notEqual(a.lightRole, a.darkRole);
    assert(t.colors[a.lightRole] && t.colors[a.darkRole]); assert(a.radius >= 0);
  }
  assert.notEqual(resolveClay(theme()).lightRole, resolveClay(theme('ember-studio')).lightRole);
  const selection = {preset: 'soft-panel', overrides: {depth: 2}} as const;
  const first = resolveClay(theme(), selection); assert.equal(first.depth, 2); assert.equal(selection.overrides.depth, 2);
  assert.notEqual(first, resolveClay(theme(), selection));
});
test('clay configuration rejects unknown, unsafe, accessor, undefined and out-of-range data', () => {
  assert.throws(() => resolveClay(theme(), {preset: 'mystery'}), /preset/);
  assert.throws(() => resolveClay(theme(), {extra: 1}), /property/);
  assert.throws(() => validateClayOverrides({fill: '#ffffff'}), /fill role/);
  assert.throws(() => validateClayOverrides({depth: -1}), /depth/);
  assert.throws(() => validateClayOverrides({softness: NaN}), /softness/);
  assert.throws(() => validateClayOverrides({highlight: 0.6}), /highlight/);
  assert.throws(() => validateClayOverrides({lightDirection: 'bottom'}), /direction/);
  assert.throws(() => validateClayOverrides({radius: undefined}), /property/);
  assert.throws(() => validateClayOverrides(Object.defineProperty({}, 'radius', {enumerable: true, get() {throw Error('executed');}})), /property/);
  assert.throws(() => validateClayOverrides(Object.create(null)), /plain/);
});
test('motion is frame-deterministic, bounded, timed and respects reduced motion', () => {
  const motion = theme().motion;
  for (const preset of ['reveal', 'float', 'press', 'depth'] as const) {
    const first = evaluateClayMotion(24, 30, motion, {preset, startSeconds: 0.2});
    evaluateClayMotion(80, 30, motion, {preset}); evaluateClayMotion(0, 30, motion, {preset});
    assert.deepEqual(evaluateClayMotion(24, 30, motion, {preset, startSeconds: 0.2}), first);
    assert(Object.isFrozen(first)); assert(first.opacity >= 0 && first.opacity <= 1);
  }
  const reduced = evaluateClayMotion(30, 30, motion, {preset: 'float', reducedMotion: true});
  assert.equal(reduced.y, 0); assert.equal(reduced.scale, 1); assert.equal(reduced.depthFactor, 1);
  assert.equal(evaluateClayMotion(0, 30, motion, {startSeconds: 1}).opacity, 0);
  assert.throws(() => evaluateClayMotion(0, 0, motion), /FPS/);
  assert.throws(() => evaluateClayMotion(0, 30, motion, {durationSeconds: 0}), /duration/);
  assert.throws(() => evaluateClayMotion(0, 30, motion, {amplitude: 25}), /bounded/);
  assert.throws(() => evaluateClayMotion(0, 30, motion, {periodSeconds: 0}), /bounded/);
});
test('surface, card and shapes use tokens and static frame output across themes', () => {
  const scene = (frame: number) => h('div', {children: [
    h(VideoClaySurface, {key: 'surface', appearance: {preset: 'soft-panel'}, animation: {preset: 'float'}, frame, fps: 30, children: 'Clay surface'}),
    h(VideoClayCard, {key: 'card', appearance: {preset: 'pressed'}, eyebrow: 'MATERIAL', title: 'Clay card', description: 'Readable copy', children: 'Body'}),
    h(VideoClayShape, {key: 'shape', variant: 'orb', width: 80, height: 80, label: 'Decorative orb'}),
  ]});
  const first = render(scene(24)); render(scene(90)); render(scene(0)); assert.equal(render(scene(24)), first);
  assert.match(first, /data-clay-surface="true"/); assert.match(first, /Clay card/); assert.match(first, /Decorative orb/);
  assert.notEqual(first, render(scene(24), 'ember-studio', 'minimal'));
  assert.notEqual(render(scene(0)), render(scene(90)));
  assert.throws(() => render(h(VideoClaySurface, {animation: {preset: 'float'}, children: 'bad'})), /frame and FPS/);
  assert.throws(() => render(h(VideoClayShape, {variant: 'orb', width: 80, height: 60})), /geometry/);
  assert.throws(() => render(h(VideoClayShape, {variant: 'capsule', width: 40, height: 80})), /geometry/);
});
