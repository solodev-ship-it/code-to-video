import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, minimal, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {AnimatedTitle, VideoCard, VideoGrid, VideoMotion, VideoSafeArea, VideoStack, VideoSurface, VideoText} from './index.ts';
import {gridColumns, textStyle} from './styles.ts';

function theme(brandId = 'aurora-finance', styleId = 'cinematic') {
  const r = createThemeRegistry();
  for (const b of [auroraFinance, emberStudio]) r.registerBrand(b);
  for (const s of [cinematic, minimal]) r.registerVisualStyle(s);
  r.registerMotionPreset(elegant);
  return resolveTheme(r, {schemaVersion: 1, brandId, styleId, motionId: 'elegant'});
}
test('typography and surfaces consume resolved tokens for both brands and styles', () => {
  const html = (brand: string, style: string) => renderToStaticMarkup(h(VideoThemeProvider, {theme: theme(brand, style),
    children: h(VideoSurface, {variant: 'canvas', children: h(VideoSafeArea, {children: h(VideoStack, {children: [
      h(VideoText, {key: 'title', variant: 'title', children: 'Brand story'}),
      h(VideoGrid, {key: 'grid', columns: 2, children: h(VideoCard, {eyebrow: 'FOUNDATION', title: 'A considered surface', description: 'Token-driven layout'})}),
    ]})})})}));
  const aurora = html('aurora-finance', 'cinematic');
  const ember = html('ember-studio', 'minimal');
  assert.match(aurora, /Helvetica Neue/);
  assert.match(ember, /Georgia/);
  assert.match(aurora, /border-radius:28px/);
  assert.match(ember, /border-radius:2px/);
  assert.match(aurora, /repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(aurora, /Brand story/);
  assert.notEqual(aurora, ember);
});
test('missing theme context fails rather than selecting an unrelated brand', () => {
  assert.throws(() => renderToStaticMarkup(h(VideoText, {children: 'Missing'})), /VideoThemeProvider/);
});
test('text variants and authored styling preserve brand defaults without mutation', () => {
  const t = theme();
  assert.equal(textStyle(t, 'title').fontFamily, t.typography.headingFontFamily);
  assert.equal(textStyle(t, 'body').fontSize, t.typography.bodySize);
  assert.equal(textStyle(t, 'caption', 'accent').color, t.colors.accent);
  assert(Object.isFrozen(t));
});
test('animated title and motion wrapper accept explicit frames outside browser playback', () => {
  const render = (frame: number) => renderToStaticMarkup(h(VideoThemeProvider, {theme: theme(), children:
    h(VideoMotion, {frame, fps: 30, preset: 'reveal', children:
      h(AnimatedTitle, {frame, fps: 30, children: 'Independent frames'})})}));
  const first = render(20);
  render(100); render(0);
  assert.equal(render(20), first);
  assert.notEqual(render(100), render(0));
  assert.match(first, /<h1/);
});
test('grid and safe-area numeric controls reject invalid layouts', () => {
  assert.throws(() => gridColumns(0), /integer/);
  assert.throws(() => gridColumns(2.5), /integer/);
  assert.throws(() => renderToStaticMarkup(h(VideoThemeProvider, {theme: theme(), children:
    h(VideoSafeArea, {inset: -1, children: 'Bad inset'})})), /gap\/inset/);
});
test('card slots enable custom structure without a brand-specific component branch', () => {
  const html = renderToStaticMarkup(h(VideoThemeProvider, {theme: theme(), children:
    h(VideoCard, {title: 'Custom content', children: h(VideoStack, {direction: 'row', children: 'Custom row'}), footer: h(VideoText, {variant: 'caption', children: 'Source note'})})}));
  assert.match(html, /Custom row/);
  assert.match(html, /Source note/);
});
