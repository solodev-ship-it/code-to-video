import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {gridColumns, layoutGap} from './styles.ts';

export interface VideoGridProps {children: ReactNode; columns?: number; gap?: number; style?: CSSProperties}
export function VideoGrid({children, columns = 2, gap, style}: VideoGridProps) {
  const t = useVideoTheme();
  return <div style={{display: 'grid', gridTemplateColumns: gridColumns(columns), gap: layoutGap(gap ?? t.spacing.gap), minWidth: 0, ...style}}>{children}</div>;
}
