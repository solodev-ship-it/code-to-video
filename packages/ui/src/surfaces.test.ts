import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, minimal, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {resolveSurface, validateSurfaceOverrides, surfacePresets, surfaceVariants, evaluateSurfaceAnimation} from './surfaces.ts';
import {VideoGlassSurface, VideoCard, VideoSafeArea, VideoSurface} from './index.ts';
const registry = createThemeRegistry();
for (const b of [auroraFinance, emberStudio]) registry.registerBrand(b);
for (const s of [cinematic, minimal]) registry.registerVisualStyle(s);
registry.registerMotionPreset(elegant); registry.seal();
const theme = (brandId = 'aurora-finance', styleId = 'cinematic') => resolveTheme(registry, {schemaVersion: 1, brandId, styleId, motionId: 'elegant'});
const t = theme();
test('surface defaults inherit existing panel values without changing legacy markup', () => {
  const a = resolveSurface(t);
  assert.equal(a.opacity, t.surface.opacity); assert.equal(a.radius, t.radii.card); assert.equal(a.borderColor, t.border.color);
  const html = renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children: h(VideoSurface, {children: 'Original'})}));
  assert(!html.includes('data-surface')); assert(!html.includes('backdrop-filter'));
});
for (const preset of surfacePresets) test(`${preset} derives semantic roles across both brands and styles`, () => {
  for (const b of ['aurora-finance', 'ember-studio']) for (const s of ['cinematic', 'minimal']) {
    const current = theme(b, s); const a = resolveSurface(current, {preset});
    assert.equal(a.radius, current.radii.card); assert(current.colors[a.tint]); assert(current.colors[a.borderColor]);
    assert(Object.isFrozen(a)); assert.deepEqual(JSON.parse(JSON.stringify(a)), a);
  }
});
test('all supported variants validate; unknown variants and presets fail', () => {
  for (const variant of surfaceVariants) assert.equal(resolveSurface(t, {overrides: {variant}}).variant, variant);
  assert.throws(() => resolveSurface(t, {preset: 'bogus'}), /preset/);
  assert.throws(() => validateSurfaceOverrides({variant: 'clay'}), /variant/);
});
test('custom overrides win, remain immutable and do not mutate input or theme', () => {
  const input = {preset: 'cinematic-frost', overrides: {radius: 19, blur: 3, tint: 'accent'}};
  const a = resolveSurface(t, input); input.overrides.radius = 90;
  assert.equal(a.radius, 19); assert.equal(a.blur, 3); assert.equal(a.tint, 'accent');
  assert.throws(() => {Object.assign(a, {blur: 30});}, TypeError);
  assert.equal(t.radii.card, 28);
});
for (const [key, max] of Object.entries({opacity: 1, borderOpacity: 1, borderWidth: 12, blur: 24, saturation: 2, radius: 120, highlight: 1, glow: 1, noise: 0.15, elevation: 3, shadowOpacity: 1, fallbackOpacity: 1})) {
  test(`${key} rejects nonfinite/out-of-range values (never silently clamps)`, () => {
    for (const value of [NaN, Infinity, -0.1, max + 0.1, '1', null]) assert.throws(() => validateSurfaceOverrides({[key]: value}), new RegExp(key));
    assert.doesNotThrow(() => validateSurfaceOverrides({[key]: max}));
  });
}
test('configuration rejects unknown fields, accessors, undefined, nonplain and color injection', () => {
  for (const value of [{url: 'remote'}, {blur: undefined}, [], new Date(), {tint: 'red'}, {borderColor: '#fff'}, Object.defineProperty({}, 'blur', {get: () => {throw new Error('must not invoke');}})]) {
    assert.throws(() => validateSurfaceOverrides(value), /surface|Surface/);
  }
});
test('omitted options work; solid and outlined disable backdrop filtering', () => {
  assert.equal(resolveSurface(t, {overrides: {variant: 'solid', blur: 20}}).blur, 0);
  const a = resolveSurface(t, {preset: 'cinematic-frost', overrides: {variant: 'outlined'}});
  assert.equal(a.opacity, 0); assert.equal(a.blur, 0); assert.equal(a.shadowOpacity, 0);
});
test('surface animation reuses explicit deterministic timing and bounded reduced complexity', () => {
  const a = resolveSurface(t, {preset: 'aurora-glass'});
  const first = evaluateSurfaceAnimation(18, 30, t.motion, a);
  evaluateSurfaceAnimation(299, 30, t.motion, a); evaluateSurfaceAnimation(0, 30, t.motion, a);
  assert.deepEqual(evaluateSurfaceAnimation(18, 30, t.motion, a), first);
  for (const frame of [0, 1, 30, 299]) {const state = evaluateSurfaceAnimation(frame, 30, t.motion, a); assert(state.blur <= 24 && state.blur >= 0);}
  const reduced = evaluateSurfaceAnimation(18, 30, t.motion, a, {reducedMotion: true});
  assert.equal(reduced.blur, a.blur); assert.equal(reduced.highlightPosition, 50);
  assert.throws(() => evaluateSurfaceAnimation(1, 0, t.motion, a), /fps/i);
});
test('glass card/panel sizing composes with safe-area without viewport or clipped shadow', () => {
  const html = renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children: h(VideoSafeArea, {children:
    h(VideoCard, {appearance: {preset: 'cinematic-frost'}, title: 'Readable hierarchy', style: {width: 640, height: 400}})})}));
  assert.match(html, /width:640px/); assert.match(html, /height:400px/); assert.match(html, /backdrop-filter:blur/);
  assert(!html.includes('overflow:hidden')); assert(!html.includes('100vw'));
});
test('explicit simulated frost removes backdrop filter and keeps children and optional noise', () => {
  const html = renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children:
    h(VideoGlassSurface, {appearance: {preset: 'ember-glass', overrides: {noise: 0.03}}, filterMode: 'frosted', children: 'Fallback'})}));
  assert(!html.includes('backdrop-filter')); assert.match(html, /Fallback/); assert.match(html, /data:image\/svg/);
});
test('conflicting legacy variants and malformed animation state fail clearly', () => {
  const render = (children: ReturnType<typeof h>) => renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children}));
  assert.throws(() => render(h(VideoSurface, {variant: 'canvas', appearance: {}})), /panel/);
  assert.throws(() => render(h(VideoGlassSurface, {animationState: {blur: NaN, illumination: 1, highlightPosition: 50}})), /animation/);
});
