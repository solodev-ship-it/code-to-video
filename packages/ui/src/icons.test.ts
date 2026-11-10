import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, cinematic, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {createIconRegistry, evaluateIconAnimation} from './icons.ts';
import {pathIcon, lucideIcon, phosphorIcon} from './icon-adapters.tsx';
import {VideoIcon} from './VideoIcon.tsx';
const r = createThemeRegistry(); r.registerBrand(auroraFinance); r.registerVisualStyle(cinematic); r.registerMotionPreset(elegant);
const t = resolveTheme(r, {schemaVersion: 1, brandId: auroraFinance.id, styleId: cinematic.id, motionId: elegant.id});
const registry = createIconRegistry([pathIcon('signal', ['M4 12 L10 18 L20 6'])]);
const render = (props: Partial<Parameters<typeof VideoIcon>[0]> = {}) => renderToStaticMarkup(h(VideoThemeProvider, {theme: t, children: h(VideoIcon, {registry, library: 'custom', id: 'signal', ...props})}));
test('owned custom registry resolves copied definitions, rejects duplicates/unknown libraries and seals', () => {
  const d = pathIcon('mark', ['M0 0 L24 24']); const r = createIconRegistry([d]);
  assert(Object.isFrozen(r.resolve('custom', 'mark'))); assert.notEqual(r.resolve('custom', 'mark'), d);
  assert.throws(() => r.register(d), /Duplicate/); assert.throws(() => r.resolve('lucide', 'mark'), /Unknown/);
  assert.throws(() => r.resolve('custom', 'missing'), /Unknown/); r.seal(); assert.throws(() => r.register(pathIcon('other', ['M1 1 L2 2'])), /sealed/);
});
test('adapters keep library selection explicit and unsupported drawing honest', () => {
  const Glyph = () => h('svg', null, h('path', {d: 'M0 0L1 1'}));
  const r = createIconRegistry([lucideIcon('bell', Glyph), phosphorIcon('trend', Glyph)]);
  assert(r.resolve('lucide', 'bell').supportsStroke); assert(!r.resolve('phosphor', 'trend').supportsStroke);
  assert(!r.resolve('lucide', 'bell').supportsDraw); assert.throws(() => r.resolve('phosphor', 'bell'), /Unknown/);
  const html = render({registry: r, library: 'lucide', id: 'bell', frame: 10, fps: 30, animation: {preset: 'draw'}});
  assert.match(html, /reveal-fallback/);
});
test('icon inherits semantic theme color, descriptive metadata and deterministic SVG path drawing', () => {
  assert.match(render(), /#f2f6ff/); assert.match(render({label: 'Verified signal'}), /aria-label="Verified signal"/);
  assert.match(render({color: 'accent'}), /#66e5f2/); assert.match(render({color: '#abc'}), /#abc/);
  assert.match(render({frame: 12, fps: 30, animation: {preset: 'draw'}}), /stroke-dashoffset/);
});
for (const key of ['size', 'opacity', 'strokeWidth', 'rotation'] as const) test(`icon validates ${key}`, () => {
  for (const value of [NaN, Infinity, -9999, 9999]) assert.throws(() => render({[key]: value}));
});
test('icon rejects unsafe colors, empty labels, missing explicit animation timing and invalid paths', () => {
  assert.throws(() => render({color: 'url(remote)' as '#bad'}), /color/); assert.throws(() => render({label: ''}), /label/);
  assert.throws(() => render({animation: {preset: 'fade'}}), /frame/); assert.throws(() => pathIcon('bad', ['<script>']), /paths/);
  assert.throws(() => pathIcon('bad', [], 'bad'), /paths/);
});
test('all icon animations reuse bounded frame math and are order independent/reduced-motion aware', () => {
  for (const preset of ['fade', 'scale', 'slide', 'rotate', 'draw', 'reveal', 'pulse'] as const) {
    const options = {preset, startSeconds: 0, durationSeconds: 1}; const expected = evaluateIconAnimation(12, 30, t.motion, options);
    evaluateIconAnimation(300, 30, t.motion, options); evaluateIconAnimation(0, 30, t.motion, options);
    assert.deepEqual(evaluateIconAnimation(12, 30, t.motion, options), expected);
    const reduced = evaluateIconAnimation(12, 30, t.motion, {...options, reducedMotion: true});
    assert.equal(reduced.rotation, 0); assert.equal(reduced.scale, 1); assert.equal(reduced.drawProgress, 1);
  }
  assert.throws(() => evaluateIconAnimation(0, 0, t.motion, {preset: 'fade'}), /FPS/);
  assert.throws(() => evaluateIconAnimation(0, 30, t.motion, {preset: 'pulse', pulseCycles: 1.2}), /integer/);
});
