import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {layoutGap} from './styles.ts';

export interface VideoStackProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  style?: CSSProperties;
}
export function VideoStack({children, direction = 'column', gap, align = 'stretch', justify = 'flex-start', style}: VideoStackProps) {
  const t = useVideoTheme();
  return <div style={{display: 'flex', flexDirection: direction, gap: layoutGap(gap ?? t.spacing.gap), alignItems: align,
    justifyContent: justify, minWidth: 0, ...style}}>{children}</div>;
}
