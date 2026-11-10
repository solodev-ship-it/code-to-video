import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {layoutGap} from './styles.ts';
import {safeAreaGeometry} from './diagnostics/geometry.ts';
import type {FrameMargins} from './diagnostics/geometry.ts';

export type SafeInsets = {top: number; right: number; bottom: number; left: number};
export interface VideoSafeAreaProps {
  children: ReactNode; inset?: number | SafeInsets; style?: CSSProperties;
  margins?: FrameMargins; frameSize?: {width: number; height: number};
  diagnostics?: {id: string; debug?: boolean};
}
export function VideoSafeArea({children, inset, style, margins, frameSize, diagnostics}: VideoSafeAreaProps) {
  const t = useVideoTheme();
  const value = inset ?? t.spacing.page;
  let edges = typeof value === 'number' ? {top: value, right: value, bottom: value, left: value} : value;
  if (margins) {
    if (!frameSize) throw new Error('Frame-relative margins require frameSize.');
    const box = safeAreaGeometry(frameSize.width, frameSize.height, margins);
    edges = {left: box.x, top: box.y, right: frameSize.width - box.x - box.width, bottom: frameSize.height - box.y - box.height};
  }
  return <div data-ctv-safe-area={diagnostics?.id} style={{position: 'absolute', inset: 0, boxSizing: 'border-box',
    padding: `${layoutGap(edges.top)}px ${layoutGap(edges.right)}px ${layoutGap(edges.bottom)}px ${layoutGap(edges.left)}px`, ...style}}>
    {children}
    {diagnostics?.debug && <div aria-hidden style={{position: 'absolute', top: edges.top, right: edges.right, bottom: edges.bottom, left: edges.left, outline: '2px dashed currentColor', pointerEvents: 'none'}} />}
  </div>;
}
