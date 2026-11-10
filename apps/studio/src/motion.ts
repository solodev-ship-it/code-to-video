// Pure frame math: safe to evaluate independently and out of order.
export function progress(frame: number, startFrame: number, durationInFrames: number): number {
  if (![frame, startFrame, durationInFrames].every(Number.isFinite) || durationInFrames <= 0) {
    throw new Error('Motion requires finite frame values and a positive duration.');
  }
  return Math.min(1, Math.max(0, (frame - startFrame) / durationInFrames));
}

export const easeOutCubic = (value: number): number => 1 - (1 - value) ** 3;
