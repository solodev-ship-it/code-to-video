import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, minimal, elegant} from '@code-to-video/themes/presets';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {VideoGlow, VideoLightSweep, VideoDepthLayer} from './index.ts';

const registry = createThemeRegistry();
for (const brand of [auroraFinance, emberStudio]) registry.registerBrand(brand);
for (const style of [cinematic, minimal]) registry.registerVisualStyle(style);
registry.registerMotionPreset(elegant);
const render = (child: ReturnType<typeof h>, brandId = 'aurora-finance', styleId = 'cinematic') => renderToStaticMarkup(
  h(VideoThemeProvider, {theme: resolveTheme(registry, {schemaVersion: 1, brandId, styleId, motionId: 'elegant'}), children: child}));

test('cinematic effects render across themes and seek order', () => {
  const scene = (frame: number) => h(VideoGlow, {children: h(VideoDepthLayer, {frame, startFrame: 0, durationInFrames: 30,
    children: h(VideoLightSweep, {frame, startFrame: 0, durationInFrames: 30})})});
  const a = render(scene(15)); render(scene(90)); assert.equal(render(scene(15)), a);
  assert.notEqual(a, render(scene(15), 'ember-studio', 'minimal'));
  assert.notEqual(a, render(scene(0)));
});
