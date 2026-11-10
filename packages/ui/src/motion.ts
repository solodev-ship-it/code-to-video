import {motionProgress, secondsToFrames} from '@code-to-video/themes';
import type {EasingProfile, ResolvedTheme} from '@code-to-video/themes';
import type {CSSProperties} from 'react';

export type MotionPreset = 'fade' | 'slide' | 'scale' | 'reveal';
export type MotionOptions = {
  preset?: MotionPreset;
  startSeconds?: number;
  durationSeconds?: number;
  easing?: EasingProfile;
  staggerIndex?: number;
  staggerSeconds?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  fromScale?: number;
  reducedMotion?: boolean;
};
export interface MotionState {
  progress: number;
  opacity: number;
  x: number;
  y: number;
  scale: number;
  revealPercent: number;
}

export function stagger(index: number, spacingSeconds: number, startSeconds = 0): number {
  if (!Number.isSafeInteger(index) || index < 0 || !Number.isFinite(spacingSeconds) || spacingSeconds < 0 ||
    !Number.isFinite(startSeconds) || startSeconds < 0) throw new Error('stagger requires a nonnegative integer index and nonnegative finite seconds.');
  const value = startSeconds + index * spacingSeconds;
  if (!Number.isFinite(value)) throw new Error('stagger timing exceeds the finite range.');
  return value;
}

export function evaluateMotion(frame: number, fps: number, motion: ResolvedTheme['motion'], options: MotionOptions = {}): MotionState {
  const duration = options.durationSeconds ?? motion.durationSeconds;
  const distance = options.distance ?? motion.distance;
  const fromScale = options.fromScale ?? 0.94;
  const preset = options.preset ?? 'fade';
  const direction = options.direction ?? 'up';
  if (!Number.isFinite(duration) || duration <= 0 || duration > 10) throw new Error('Motion durationSeconds must be in (0, 10].');
  if (!Number.isFinite(distance) || distance < 0 || distance > 200) throw new Error('Motion distance must be in [0, 200].');
  if (!Number.isFinite(fromScale) || fromScale < 0.5 || fromScale > 1) throw new Error('Motion fromScale must be in [0.5, 1].');
  if (!['fade', 'slide', 'scale', 'reveal'].includes(preset)) throw new Error('Unknown UI motion preset.');
  if (!['up', 'down', 'left', 'right'].includes(direction)) throw new Error('Unknown slide direction.');
  const start = stagger(options.staggerIndex ?? 0, options.staggerSeconds ?? motion.staggerSeconds, options.startSeconds ?? motion.delaySeconds);
  const progress = motionProgress(frame, fps, {...motion, delaySeconds: start,
    durationSeconds: options.reducedMotion ? Math.min(duration, 0.15) : duration,
    easing: options.easing ?? motion.easing}, 0);
  const state: MotionState = {progress, opacity: progress, x: 0, y: 0, scale: 1, revealPercent: 100};
  if (options.reducedMotion) return state; // Same timeline, brief opacity fade; no displacement or clipping.
  if (preset === 'slide') {
    const offset = (1 - progress) * distance * motion.intensity;
    if (direction === 'up') state.y = offset;
    if (direction === 'down') state.y = -offset;
    if (direction === 'left') state.x = offset;
    if (direction === 'right') state.x = -offset;
  }
  if (preset === 'scale') state.scale = 1 - (1 - fromScale) * (1 - progress) * Math.min(motion.intensity, 1);
  if (preset === 'reveal') state.revealPercent = progress * 100;
  return state;
}

export function motionStyle(state: MotionState): CSSProperties {
  return {
    opacity: state.opacity,
    transform: `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`,
    clipPath: state.revealPercent === 100 ? 'none' : `inset(0 ${100 - state.revealPercent}% 0 0)`,
    transformOrigin: 'center',
  };
}

// Shared nearest-integer conversion, not a competing FPS convention.
export {secondsToFrames};
