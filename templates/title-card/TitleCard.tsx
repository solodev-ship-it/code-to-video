import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useVideoTheme} from '@code-to-video/themes/react';
import {VideoMotion, VideoSafeArea, VideoSurface, VideoText} from '@code-to-video/ui';

export type TitleCardProps = {label:string; title:string; subtitle:string; footer:string; reducedMotion:boolean};
export default function TitleCard({label,title,subtitle,footer,reducedMotion}: TitleCardProps) {
  const theme = useVideoTheme();
  const frame = useCurrentFrame(); const {fps,durationInFrames} = useVideoConfig();
  if ([label,title,subtitle,footer].some(v => typeof v !== 'string') || typeof reducedMotion !== 'boolean') throw new Error('TitleCard requires text fields and an explicit reducedMotion boolean');
  const fade = Math.min(1,Math.max(0,(durationInFrames-1-frame)/Math.max(1,Math.round(fps*0.4))));
  return <AbsoluteFill style={{opacity:fade}}>
    <VideoSurface variant="canvas" style={{height:'100%'}}>
      <VideoSafeArea style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <VideoMotion frame={frame} fps={fps} reducedMotion={reducedMotion} preset="fade">
          <div style={{display:'flex',alignItems:'center',gap:theme.spacing.gap}}>
            <div aria-hidden style={{width:16,height:16,borderRadius:theme.radii.badge,background:theme.colors.accent}} />
            <VideoText variant="caption" tone="mutedForeground">{label}</VideoText>
          </div>
        </VideoMotion>
        <VideoMotion frame={frame} fps={fps} reducedMotion={reducedMotion} preset="slide" startSeconds={0.2}>
          <div style={{maxWidth:theme.layout.contentWidth}}>
            <div aria-hidden style={{width:96,height:6,background:theme.colors.accent,marginBottom:theme.spacing.gap}} />
            <VideoText variant="title" as="h1" style={{maxWidth:1400}}>{title}</VideoText>
            <VideoText variant="body" tone="mutedForeground" style={{marginTop:theme.spacing.gap,maxWidth:1200}}>{subtitle}</VideoText>
          </div>
        </VideoMotion>
        <VideoMotion frame={frame} fps={fps} reducedMotion={reducedMotion} preset="fade" startSeconds={0.5}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:`${theme.border.width}px solid ${theme.colors.muted}`,paddingTop:theme.spacing.gap}}>
            <VideoText variant="caption">{footer}</VideoText>
            <VideoText variant="caption" tone="mutedForeground">{theme.brandName}</VideoText>
          </div>
        </VideoMotion>
      </VideoSafeArea>
    </VideoSurface>
  </AbsoluteFill>;
}
