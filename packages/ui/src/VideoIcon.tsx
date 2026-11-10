import {useVideoTheme} from '@code-to-video/themes/react';
import type {ColorRole} from '@code-to-video/themes';
import type {IconRegistry, IconLibrary, IconWeight, IconAnimationOptions} from './icons.ts';
import {boundedIconNumber, evaluateIconAnimation} from './icons.ts';

export interface VideoIconProps {
  registry: IconRegistry; library: IconLibrary; id: string;
  size?: number; color?: ColorRole | `#${string}`; strokeWidth?: number; weight?: IconWeight;
  opacity?: number; rotation?: number; label?: string;
  frame?: number; fps?: number; animation?: IconAnimationOptions;
}
export function VideoIcon({registry, library, id, size = 40, color = 'foreground', strokeWidth, weight,
  opacity = 1, rotation = 0, label, frame, fps, animation}: VideoIconProps) {
  const t = useVideoTheme(); const definition = registry.resolve(library, id);
  boundedIconNumber('size', size, 4, 512); boundedIconNumber('opacity', opacity, 0, 1); boundedIconNumber('rotation', rotation, -3600, 3600);
  const stroke = boundedIconNumber('strokeWidth', strokeWidth ?? 2, 0.25, 8);
  if (strokeWidth !== undefined && !definition.supportsStroke) throw new Error('This icon adapter does not support strokeWidth; use Phosphor weight.');
  if (weight !== undefined && (library !== 'phosphor' || !['thin', 'light', 'regular', 'bold', 'fill', 'duotone'].includes(weight))) throw new Error('Invalid or unsupported icon weight.');
  const resolvedColor = Object.hasOwn(t.colors, color) ? t.colors[color as ColorRole] : color;
  if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(resolvedColor)) throw new Error('Icon color must be a semantic role or hex color.');
  if (label !== undefined && (typeof label !== 'string' || !label.trim() || label.length > 256)) throw new Error('Icon label must be descriptive nonempty text.');
  if (animation && (frame === undefined || fps === undefined)) throw new Error('Animated icons require explicit frame and fps.');
  const state = animation ? evaluateIconAnimation(frame!, fps!, t.motion, animation) : {opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, drawProgress: 1};
  const draw = animation?.preset === 'draw'; const reveal = animation?.preset === 'reveal' || (draw && !definition.supportsDraw);
  const Glyph = definition.render;
  return <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} title={label}
    data-video-icon={`${library}:${id}`} data-icon-draw={draw ? definition.supportsDraw ? 'path' : 'reveal-fallback' : undefined}
    style={{display: 'inline-flex', width: size, height: size, flexShrink: 0, verticalAlign: 'middle', lineHeight: 0,
      opacity: opacity * state.opacity, transform: `translate(${state.x}px, ${state.y}px) rotate(${rotation + state.rotation}deg) scale(${state.scale})`,
      clipPath: reveal && state.drawProgress < 1 ? `inset(0 ${(1 - state.drawProgress) * 100}% 0 0)` : undefined}}>
    <Glyph size={size} color={resolvedColor} strokeWidth={stroke} weight={weight ?? 'regular'} drawProgress={draw ? state.drawProgress : 1} />
  </span>;
}
