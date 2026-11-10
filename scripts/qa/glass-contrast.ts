import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PNG} from 'pngjs';
import {createRenderSession, relative} from './render.ts';
import {comparePng, strictComparison} from './compare.ts';
import {emberStudio} from '@code-to-video/themes/presets';

export interface LabelMeasurement {id: string; color: string; computedColor: string; x: number; y: number; width: number; height: number; opacity: number}
function rgb(hex: string): number[] {
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new Error('Contrast requires an opaque nominal text color.');
  const full = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
function luminance(color: readonly number[]) {
  return color.reduce((sum, channel, i) => {const v = channel / 255; return sum + (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i]!;}, 0);
}
export function labelContrast(background: PNG, label: LabelMeasurement, color = label.color) {
  if (!label.id || label.opacity !== 1 || ![label.x, label.y, label.width, label.height].every(Number.isFinite) || label.width <= 0 || label.height <= 0) throw new Error('Invalid or translucent label measurement.');
  const left = Math.floor(label.x); const top = Math.floor(label.y);
  const right = Math.ceil(label.x + label.width); const bottom = Math.ceil(label.y + label.height);
  if (left < 0 || top < 0 || right > background.width || bottom > background.height) throw new Error('Label region is outside the rendered composition.');
  const foreground = luminance(rgb(color)); let minimum = Infinity;
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    const offset = (y * background.width + x) * 4;
    if (background.data[offset + 3] !== 255) throw new Error('Contrast background must be fully composited and opaque.');
    const b = luminance([...background.data.subarray(offset, offset + 3)]);
    minimum = Math.min(minimum, (Math.max(foreground, b) + 0.05) / (Math.min(foreground, b) + 0.05));
  }
  return {id: label.id, minimumRatio: minimum, threshold: 4.5, pixels: (right - left) * (bottom - top)};
}
export function assertLabelContrast(background: PNG, label: LabelMeasurement) {
  const result = labelContrast(background, label);
  if (result.minimumRatio < result.threshold) throw new Error(`GLASS_LABEL_CONTRAST: ${result.id} ${result.minimumRatio} < ${result.threshold}`);
  return result;
}
export function assertVisibleLabel(visible: PNG, background: PNG, label: LabelMeasurement) {
  if (visible.width !== background.width || visible.height !== background.height) throw new Error('Label images have different dimensions.');
  const expected = rgb(label.color); let inkPixels = 0;
  for (let y = Math.floor(label.y); y < Math.ceil(label.y + label.height); y++) for (let x = Math.floor(label.x); x < Math.ceil(label.x + label.width); x++) {
    const offset = (y * visible.width + x) * 4;
    const ink = expected.every((channel, i) => Math.abs(visible.data[offset + i]! - channel) <= 4);
    const differs = expected.some((_, i) => Math.abs(visible.data[offset + i]! - background.data[offset + i]!) > 20);
    if (ink && differs) inkPixels++;
  }
  if (inkPixels < 8) throw new Error(`GLASS_LABEL_INK_MISSING: ${label.id}`);
  return inkPixels;
}

export async function checkGlassContrast(session: Awaited<ReturnType<typeof createRenderSession>>, directory: string) {
  const results: Record<string, unknown>[] = [];
  for (const brandId of ['aurora-finance', 'ember-studio']) for (const styleId of ['cinematic', 'minimal']) {
    const tests = [{fixture: 'showcase', background: 'dark', frame: 90}, {fixture: 'showcase', background: 'dark', frame: 180}, {fixture: 'showcase', background: 'dark', frame: 299},
      ...['dark', 'light', 'grid', 'frequency'].flatMap((background) => ['label-contrast', 'label-contrast-fallback'].map((fixture) => ({fixture, background, frame: 180})))];
    for (const test of tests) {
      const props = {schemaVersion: 1, brandId, styleId, motionId: 'elegant', reducedMotion: false, diagnostics: true, fixture: test.fixture, background: test.background};
      const key = `${brandId}-${styleId}-${test.fixture}-${test.background}-f${test.frame}`;
      const output = path.join(directory, `contrast-${key}.png`); const hidden = path.join(directory, `contrast-${key}.background.png`);
      const capture = await session.capture({compositionId: 'GlassmorphismShowcase', frame: test.frame, props, output});
      const noInk = await session.capture({compositionId: 'GlassmorphismShowcase', frame: test.frame, props: {...props, hideLabelInk: true}, output: hidden});
      const probe = capture.artifacts.find((a) => a.filename === 'glass-labels.json');
      const hiddenProbe = noInk.artifacts.find((a) => a.filename === 'glass-labels.json');
      assert(probe && hiddenProbe, 'Rendered label geometry evidence missing.');
      const labels = (JSON.parse(probe.content) as {labels: LabelMeasurement[]}).labels;
      const hiddenLabels = (JSON.parse(hiddenProbe.content) as {labels: LabelMeasurement[]}).labels;
      assert.equal(labels.length, 4); assert.equal(new Set(labels.map((l) => l.id)).size, 4);
      assert.deepEqual(labels.map(({computedColor: _color, ...rest}) => rest), hiddenLabels.map(({computedColor: _color, ...rest}) => rest), 'Hiding ink changed label geometry or nominal treatment.');
      const image = PNG.sync.read(await readFile(output)); const background = PNG.sync.read(await readFile(hidden));
      const measured = labels.map((label) => ({...assertLabelContrast(background, label), inkPixels: assertVisibleLabel(image, background, label)}));
      // Regression must reject the original coral informational treatment causally.
      if (brandId === 'ember-studio' && test.fixture === 'showcase' && test.frame === 180) {
        const oldLabel = {...labels[1]!, color: emberStudio.colors.accent};
        assert.throws(() => assertLabelContrast(background, oldLabel), /GLASS_LABEL_CONTRAST:/);
      }
      if (test.fixture === 'showcase' && test.frame === 180) {
        const repeated = path.join(directory, `contrast-${key}.repeat.png`);
        await session.capture({compositionId: 'GlassmorphismShowcase', frame: test.frame, props, output: repeated});
        assert.equal(comparePng(await readFile(output), await readFile(repeated), strictComparison).metrics.differingPixels, 0);
      }
      results.push({brandId, styleId, ...test, image: relative(output), backgroundImage: relative(hidden), labels: measured});
      await writeFile(path.join(directory, `contrast-${key}.labels.json`), probe.content, {flag: 'wx'});
    }
  }
  return {status: 'passed', policy: 'Minimum WCAG sRGB nominal opaque text contrast against every pixel in its exact browser-measured line box from a matched glyph-hidden render. Antialiased edge coverage and fade entrances are not contrast certification.', combinations: results.length, results};
}
