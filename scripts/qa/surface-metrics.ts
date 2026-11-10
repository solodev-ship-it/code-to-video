import {PNG} from 'pngjs';
export interface PixelRegion {x: number; y: number; width: number; height: number}
export function regionEnergy(image: PNG, region: PixelRegion): number {
  if (![region.x, region.y, region.width, region.height].every(Number.isSafeInteger) || region.x < 0 || region.y < 0 || region.width < 2 || region.height < 2 || region.x + region.width > image.width || region.y + region.height > image.height) throw new Error('Invalid surface metric region.');
  let sum = 0; let count = 0;
  for (let y = region.y; y < region.y + region.height - 1; y++) for (let x = region.x; x < region.x + region.width - 1; x++) {
    const i = (y * image.width + x) * 4;
    for (let c = 0; c < 3; c++) {sum += Math.abs(image.data[i + c]! - image.data[i + 4 + c]!) + Math.abs(image.data[i + c]! - image.data[i + image.width * 4 + c]!); count += 2;}
  }
  return sum / count;
}
export function assertEffectiveBlur(filtered: PNG, unfiltered: PNG, region: PixelRegion) {
  if (filtered.width !== unfiltered.width || filtered.height !== unfiltered.height) throw new Error('Blur comparison dimensions differ.');
  const sharpEnergy = regionEnergy(unfiltered, region); const blurredEnergy = regionEnergy(filtered, region);
  const ratio = blurredEnergy / sharpEnergy;
  if (sharpEnergy < 2 || !Number.isFinite(ratio) || ratio >= 0.35) throw new Error(`BACKDROP_BLUR_INEFFECTIVE: sharp=${sharpEnergy}, blurred=${blurredEnergy}, ratio=${ratio}`);
  return {sharpEnergy, blurredEnergy, ratio, maximumRatio: 0.35};
}
export function regionDifference(a: PNG, b: PNG, region: PixelRegion): number {
  regionEnergy(a, region); regionEnergy(b, region);
  if (a.width !== b.width || a.height !== b.height) throw new Error('Surface comparison dimensions differ.');
  let sum = 0;
  for (let y = region.y; y < region.y + region.height; y++) for (let x = region.x; x < region.x + region.width; x++) for (let c = 0; c < 3; c++) {
    const i = (y * a.width + x) * 4 + c; sum += Math.abs(a.data[i]! - b.data[i]!);
  }
  return sum / (region.width * region.height * 3);
}
