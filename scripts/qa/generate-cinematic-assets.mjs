// Original analytic shaded ring study. Reproduce with Node; no external media.
import {PNG} from 'pngjs';
import {writeFileSync} from 'node:fs';
for (let f = 0; f < 8; f++) {
  const png = new PNG({width: 256, height: 256});
  const angle = f * Math.PI / 4;
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = (x - 127.5) / 100, v = (y - 127.5) / 100;
    const r = Math.hypot(u, v), distance = Math.abs(r - 0.72);
    const alpha = Math.max(0, Math.min(1, (0.25 - distance) * 100));
    const z = Math.sqrt(Math.max(0, 1 - (distance / 0.24) ** 2));
    const light = 0.35 + 0.45 * z + 0.2 * Math.cos(Math.atan2(v, u) - angle);
    const i = (y * 256 + x) * 4;
    png.data[i] = Math.round(100 + light * 110);
    png.data[i + 1] = Math.round(65 + light * 130);
    png.data[i + 2] = Math.round(140 + light * 100);
    png.data[i + 3] = Math.round(alpha * 255);
  }
  writeFileSync(new URL(`../../apps/studio/public/advanced-effects/ring-${String(f).padStart(3, '0')}.png`, import.meta.url), PNG.sync.write(png), {flag: 'wx'});
}
