import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {VideoSurface} from './VideoSurface.tsx';
import {VideoStack} from './VideoStack.tsx';
import {VideoText} from './VideoText.tsx';
import type {VideoGlassSurfaceProps} from './VideoGlassSurface.tsx';

export interface VideoCardProps extends Pick<VideoGlassSurfaceProps, 'appearance' | 'filterMode' | 'animationState'> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
}
export function VideoCard({eyebrow, title, description, children, footer, style, appearance, filterMode, animationState}: VideoCardProps) {
  const t = useVideoTheme();
  return <VideoSurface appearance={appearance} filterMode={filterMode} animationState={animationState} style={{padding: t.spacing.cardPadding, height: '100%', ...style}}>
    <VideoStack gap={t.spacing.gap / 2}>
      {eyebrow != null && <VideoText variant="caption" tone="accent">{eyebrow}</VideoText>}
      {title != null && <VideoText variant="heading" as="h2">{title}</VideoText>}
      {description != null && <VideoText variant="caption" tone="mutedForeground">{description}</VideoText>}
      {children}
      {footer}
    </VideoStack>
  </VideoSurface>;
}
