import type {DeepReadonly, MotionTokens} from './types.ts';

export function secondsToFrames(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds) || seconds < 0 || !Number.isFinite(fps) || fps <= 0) {
    throw new Error('Motion timing requires nonnegative finite seconds and positive finite FPS.');
  }
  const frames = Math.round(seconds * fps);
  if (!Number.isSafeInteger(frames)) throw new Error('Motion timing exceeds the safe integer frame range.');
  return frames;
}

// Pure evaluator: no Remotion runtime dependency in the data package.
export function motionProgress(frame: number, fps: number, motion: DeepReadonly<MotionTokens>, index = 0): number {
  if (!Number.isFinite(frame) || !Number.isSafeInteger(index) || index < 0) throw new Error('Motion requires a finite frame and nonnegative integer stagger index.');
  const start = secondsToFrames(motion.delaySeconds + index * motion.staggerSeconds, fps);
  const duration = Math.max(1, secondsToFrames(motion.durationSeconds, fps));
  const p = Math.min(1, Math.max(0, (frame - start) / duration));
  switch (motion.easing) {
    case 'linear': return p;
    case 'ease-out-cubic': return 1 - (1 - p) ** 3;
    case 'ease-in-out-cubic': return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
    default: throw new Error('Unsupported motion easing profile.');
  }
}
