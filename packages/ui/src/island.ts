import type {ResolvedTheme} from '@code-to-video/themes';
import {secondsToFrames, evaluateMotion} from './motion.ts';

export interface IslandTiming {
  startSeconds?: number; enterSeconds?: number; compactSeconds?: number; expandSeconds?: number;
  holdSeconds?: number; collapseSeconds?: number; compactAfterSeconds?: number; exitSeconds?: number;
}
export interface IslandGeometry {
  compactWidth?: number; compactHeight?: number; expandedWidth?: number; expandedHeight?: number;
  padding?: number; expandedRadius?: number;
}
export type IslandState = 'hidden' | 'compact' | 'expanded' | 'collapsing';
export type IslandPhase = 'hidden' | 'entering' | 'compact' | 'expanding' | 'expanded' | 'collapsing' | 'compact-after' | 'exiting';
export function islandGeometry(input: IslandGeometry = {}) {
  const defaults = {compactWidth: 440, compactHeight: 88, expandedWidth: 880, expandedHeight: 340, padding: 28, expandedRadius: 36};
  for (const key of Object.keys(input)) if (!Object.hasOwn(defaults, key)) throw new Error(`Unknown island geometry: ${key}`);
  const g = {...defaults, ...input};
  for (const key of ['compactWidth', 'expandedWidth'] as const) if (!Number.isFinite(g[key]) || g[key] < 160 || g[key] > 1800) throw new Error(`Invalid island ${key}.`);
  for (const key of ['compactHeight', 'expandedHeight'] as const) if (!Number.isFinite(g[key]) || g[key] < 64 || g[key] > 1000) throw new Error(`Invalid island ${key}.`);
  if (g.expandedWidth < g.compactWidth || g.expandedHeight < g.compactHeight) throw new Error('Island expanded geometry must contain compact geometry.');
  if (!Number.isFinite(g.padding) || g.padding < 8 || g.padding > 120 || g.padding * 2 + 48 > g.compactWidth || g.padding * 2 >= g.expandedHeight) throw new Error('Invalid island padding.');
  if (!Number.isFinite(g.expandedRadius) || g.expandedRadius < 0 || g.expandedRadius > Math.min(120, g.expandedHeight / 2)) throw new Error('Invalid island expanded radius.');
  return Object.freeze(g);
}
export function evaluateIsland(frame: number, fps: number, motion: ResolvedTheme['motion'], timing: IslandTiming = {}, geometry: IslandGeometry = {}, reducedMotion = false) {
  if (!Number.isFinite(frame) || !Number.isFinite(fps) || fps <= 0 || fps > 120 || typeof reducedMotion !== 'boolean') throw new Error('Island requires finite frame, positive FPS <=120 and explicit boolean reducedMotion.');
  const defaults = {startSeconds: 0, enterSeconds: 0.45, compactSeconds: 1.1, expandSeconds: 0.8, holdSeconds: 4,
    collapseSeconds: 0.8, compactAfterSeconds: 0.5, exitSeconds: 0.45};
  for (const key of Object.keys(timing)) if (!Object.hasOwn(defaults, key)) throw new Error(`Unknown island timing: ${key}; stages are sequential, not overlapping intervals.`);
  const times = {...defaults, ...timing};
  for (const [key, value] of Object.entries(times)) {
    const max = ['enterSeconds', 'expandSeconds', 'collapseSeconds', 'exitSeconds'].includes(key) ? 10 : 120;
    if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`Island ${key} must be in [0, ${max}].`);
  }
  const g = islandGeometry(geometry);
  const stages = ['enterSeconds', 'compactSeconds', 'expandSeconds', 'holdSeconds', 'collapseSeconds', 'compactAfterSeconds', 'exitSeconds'] as const;
  const phases: readonly IslandPhase[] = ['entering', 'compact', 'expanding', 'expanded', 'collapsing', 'compact-after', 'exiting'];
  let start = secondsToFrames(times.startSeconds, fps); let phase: IslandPhase = 'hidden'; let local = 0; let length = 0; let seconds = 0;
  for (let i = 0; i < stages.length; i++) {
    const duration = times[stages[i]!]; const count = secondsToFrames(duration, fps);
    if (frame >= start && frame < start + count) {phase = phases[i]!; local = frame - start; length = count; seconds = duration; break;}
    start += count;
  }
  const p = seconds > 0 ? evaluateMotion(local, fps, motion, {preset: 'fade', startSeconds: 0, durationSeconds: Math.min(seconds, 10)}).progress : 0;
  const expansion = phase === 'expanding' ? reducedMotion ? 1 : p : phase === 'expanded' ? 1 : phase === 'collapsing' ? reducedMotion ? 0 : 1 - p : 0;
  const fadeFrames = Math.max(1, Math.min(Math.round(fps * 0.25), length / 2));
  const expandedOpacity = phase === 'expanded' ? Math.min(1, local / fadeFrames, (length - local) / fadeFrames) : 0;
  const opacity = phase === 'hidden' ? 0 : phase === 'entering' ? p : phase === 'exiting' ? 1 - p : 1;
  const compactOpacity = ['entering', 'compact', 'compact-after', 'exiting'].includes(phase) ? 1 :
    phase === 'expanding' ? Math.max(0, 1 - expansion * 4) : phase === 'collapsing' ? Math.max(0, 1 - expansion * 4) : 0;
  const state: IslandState = phase === 'hidden' ? 'hidden' : phase === 'collapsing' ? 'collapsing' : ['expanding', 'expanded'].includes(phase) ? 'expanded' : 'compact';
  return Object.freeze({state, phase, expansion, opacity, compactOpacity, expandedOpacity,
    width: g.compactWidth + (g.expandedWidth - g.compactWidth) * expansion,
    height: g.compactHeight + (g.expandedHeight - g.compactHeight) * expansion,
    radius: g.compactHeight / 2 + (g.expandedRadius - g.compactHeight / 2) * expansion,
    iconScale: reducedMotion ? 1 : 1 - expansion * 0.06,
    geometry: g});
}
