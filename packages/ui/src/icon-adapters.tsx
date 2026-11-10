import type {ComponentType} from 'react';
import type {IconDefinition, IconWeight} from './icons.ts';

// Optional package protocols only. Neither icon catalog is imported by UI.
export function lucideIcon(id: string, Component: ComponentType<{size?: number; color?: string; strokeWidth?: number} & {'aria-hidden'?: boolean}>): IconDefinition {
  return {id, library: 'lucide', supportsStroke: true, supportsDraw: false,
    render: ({size, color, strokeWidth}) => <Component size={size} color={color} strokeWidth={strokeWidth} aria-hidden />};
}
export function phosphorIcon(id: string, Component: ComponentType<{size?: number; color?: string; weight?: IconWeight} & {'aria-hidden'?: boolean}>): IconDefinition {
  return {id, library: 'phosphor', supportsStroke: false, supportsDraw: false,
    render: ({size, color, weight}) => <Component size={size} color={color} weight={weight} aria-hidden />};
}
// Trusted authored path data only, not arbitrary SVG/HTML imported from JSON.
// Normalized pathLength makes independent open-path drawing deterministic.
export function pathIcon(id: string, paths: readonly string[], viewBox = '0 0 24 24'): IconDefinition {
  if (!paths.length || paths.length > 32 || paths.some((d) => typeof d !== 'string' || d.length > 16000 || !/^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/.test(d)) ||
    !/^0 0 (?:[1-9]\d{0,3}) (?:[1-9]\d{0,3})$/.test(viewBox)) throw new Error('Invalid authored icon paths/viewBox.');
  const owned = [...paths];
  return {id, library: 'custom', supportsStroke: true, supportsDraw: true,
    render: ({size, color, strokeWidth, drawProgress}) => <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {owned.map((d, index) => <path key={index} d={d} pathLength={1} strokeDasharray={drawProgress < 1 ? 1 : undefined} strokeDashoffset={drawProgress < 1 ? 1 - drawProgress : undefined} />)}
    </svg>};
}
