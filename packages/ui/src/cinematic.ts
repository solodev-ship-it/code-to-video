export type PlaybackPolicy = 'once' | 'hold' | 'loop';
export type AssetSource =
  | {type: 'png'; src: string}
  | {type: 'sequence'; frames: readonly string[]; sourceFps: number; startFrame: number; policy: PlaybackPolicy}
  | {type: 'video'; src: string; startFrame: number; durationInFrames: number; alpha: 'opaque'};
export function bounded(value: number, name: string, min: number, max: number): number {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${name} must be in [${min}, ${max}].`);
  return value;
}
export function integer(value: number, name: string, min = 0): number {
  bounded(value, name, min, 1e7);
  if (!Number.isSafeInteger(value)) throw new Error(`${name} must be an integer.`);
  return value;
}
function sourcePath(value: unknown, extension: RegExp) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+$/.test(value) ||
      value.startsWith('/') || value.split('/').some(s => s === '..' || s === '' || s === '.') || !extension.test(value))
    throw new Error('Asset requires a relative public media path with a supported extension.');
}
export function validateAssetSource(input: unknown): AssetSource {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Asset source must be an object.');
  const a = input as Record<string, unknown>;
  const fields = a.type === 'png' ? ['type', 'src'] : a.type === 'sequence' ? ['type', 'frames', 'sourceFps', 'startFrame', 'policy'] : ['type', 'src', 'startFrame', 'durationInFrames', 'alpha'];
  if (Object.keys(a).some(k => !fields.includes(k))) throw new Error('Unknown asset source property.');
  if (a.type === 'png') sourcePath(a.src, /\.png$/i);
  else if (a.type === 'sequence') {
    if (!Array.isArray(a.frames) || a.frames.length === 0 || a.frames.length > 10000) throw new Error('Sequence requires 1–10000 explicit PNG frames.');
    a.frames.forEach(p => sourcePath(p, /\.png$/i));
    bounded(a.sourceFps as number, 'sourceFps', 0.001, 240);
    integer(a.startFrame as number, 'startFrame');
    if (!['once', 'hold', 'loop'].includes(a.policy as string)) throw new Error('Unknown sequence policy.');
  } else if (a.type === 'video') {
    sourcePath(a.src, /\.(mp4|webm)$/i);
    integer(a.startFrame as number, 'startFrame'); integer(a.durationInFrames as number, 'durationInFrames', 1);
    if (a.alpha !== 'opaque') throw new Error('Video alpha is unsupported; use PNG sequences.');
  } else throw new Error('Unknown asset source type.');
  return Object.freeze(a.type === 'sequence' ? {...a, frames: Object.freeze([...(a.frames as string[])])} : {...a}) as AssetSource;
}
export function sequenceIndex(source: Extract<AssetSource, {type: 'sequence'}>, frame: number, fps: number): number | null {
  bounded(frame, 'frame', -1e7, 1e7); bounded(fps, 'fps', 0.001, 240);
  const index = Math.floor((frame - source.startFrame) * source.sourceFps / fps);
  if (index < 0) return source.policy === 'hold' ? 0 : null;
  if (source.policy === 'loop') return index % source.frames.length;
  if (index >= source.frames.length) return source.policy === 'hold' ? source.frames.length - 1 : null;
  return index;
}
export function cinematicProgress(frame: number, startFrame: number, durationInFrames: number) {
  bounded(frame, 'frame', -1e7, 1e7); integer(startFrame, 'startFrame'); integer(durationInFrames, 'durationInFrames', 1);
  return Math.max(0, Math.min(1, (frame - startFrame) / durationInFrames));
}
export interface AssetEnvelope {startFrame: number; endFrame: number; fadeInFrames: number; fadeOutFrames: number}
export function assetOpacity(frame: number, a: AssetEnvelope): number {
  integer(a.startFrame, 'startFrame'); integer(a.endFrame, 'endFrame', a.startFrame + 1);
  integer(a.fadeInFrames, 'fadeInFrames'); integer(a.fadeOutFrames, 'fadeOutFrames');
  bounded(frame, 'frame', -1e7, 1e7);
  if (frame < a.startFrame || frame >= a.endFrame) return 0;
  return Math.min(a.fadeInFrames ? (frame - a.startFrame) / a.fadeInFrames : 1,
    a.fadeOutFrames ? (a.endFrame - frame) / a.fadeOutFrames : 1, 1);
}
