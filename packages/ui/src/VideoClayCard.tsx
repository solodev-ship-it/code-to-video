import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {VideoClaySurface} from './VideoClaySurface.tsx';
import {VideoStack} from './VideoStack.tsx';
import {VideoText} from './VideoText.tsx';
import type {VideoClaySurfaceProps} from './VideoClaySurface.tsx';

export interface VideoClayCardProps extends Pick<VideoClaySurfaceProps, 'appearance' | 'animation' | 'frame' | 'fps' | 'clipContent'> {
  eyebrow?: ReactNode; title?: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; style?: CSSProperties;
}
export function VideoClayCard({eyebrow, title, description, children, footer, style, clipContent = false, ...surfaceProps}: VideoClayCardProps) {
  const t = useVideoTheme();
  return <VideoClaySurface {...surfaceProps} clipContent={clipContent} style={{padding: t.spacing.cardPadding, ...style}}>
    <VideoStack gap={t.spacing.gap / 2}>
      {eyebrow != null && <VideoText variant="caption" tone="accent">{eyebrow}</VideoText>}
      {title != null && <VideoText variant="heading" as="h2">{title}</VideoText>}
      {description != null && <VideoText variant="caption" tone="mutedForeground">{description}</VideoText>}
      {children}{footer}
    </VideoStack>
  </VideoClaySurface>;
}
