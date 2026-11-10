import type {ReactNode} from 'react';
import type {ColorRole} from '@code-to-video/themes';
import {colorWithOpacity} from '@code-to-video/themes';
import {useVideoTheme} from '@code-to-video/themes/react';
import {bounded, cinematicProgress} from './cinematic.ts';
export interface VideoDepthLayerProps {
  children: ReactNode; frame: number; startFrame: number; durationInFrames: number;
  depth?: number; travelX?: number; travelY?: number; reducedMotion?: boolean;
}
export function VideoDepthLayer({children, frame, startFrame, durationInFrames, depth = 1, travelX = 30, travelY = 0, reducedMotion = false}: VideoDepthLayerProps) {
  bounded(depth, 'depth', -4, 4); bounded(travelX, 'travelX', -200, 200); bounded(travelY, 'travelY', -200, 200);
  const p = reducedMotion ? 0 : cinematicProgress(frame, startFrame, durationInFrames);
  return <div style={{position: 'relative', transform: `translate3d(${Math.round(p * depth * travelX)}px, ${Math.round(p * depth * travelY)}px, 0)`}}>{children}</div>;
}
export interface VideoLightSweepProps {
  frame: number; startFrame: number; durationInFrames: number; colorRole?: ColorRole; intensity?: number; reducedMotion?: boolean;
}
function roleColor(colors: ReturnType<typeof useVideoTheme>['colors'], role: ColorRole) {
  if (!Object.hasOwn(colors, role)) throw new Error('Unknown cinematic color role.');
  return colors[role];
}
export function VideoLightSweep({frame, startFrame, durationInFrames, colorRole = 'foreground', intensity = 0.3, reducedMotion = false}: VideoLightSweepProps) {
  const t = useVideoTheme(); bounded(intensity, 'intensity', 0, 1);
  const p = cinematicProgress(frame, startFrame, durationInFrames);
  const color = roleColor(t.colors, colorRole);
  return <div aria-hidden style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: 0, opacity: reducedMotion || p <= 0 || p >= 1 ? 0 : intensity,
      transform: `translateX(${-150 + p * 300}%)`,
      background: `linear-gradient(110deg, transparent 25%, ${colorWithOpacity(color, 0.8)} 50%, transparent 75%)`}}/>
  </div>;
}
export interface VideoGlowProps {children: ReactNode; colorRole?: ColorRole; intensity?: number; spread?: number; clip?: boolean}
export function VideoGlow({children, colorRole = 'accent', intensity = 0.25, spread = 32, clip = false}: VideoGlowProps) {
  const t = useVideoTheme(); bounded(intensity, 'intensity', 0, 1); bounded(spread, 'spread', 0, 80);
  return <div style={{position: 'relative', isolation: 'isolate', borderRadius: t.radii.card, overflow: clip ? 'hidden' : 'visible'}}>
    <div aria-hidden style={{position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none', borderRadius: 'inherit',
      boxShadow: `0 0 ${spread}px ${spread / 4}px ${colorWithOpacity(roleColor(t.colors, colorRole), intensity)}`}}/>{children}
  </div>;
}
