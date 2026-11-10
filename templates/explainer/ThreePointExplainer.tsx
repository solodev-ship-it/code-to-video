import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useVideoTheme} from '@code-to-video/themes/react';
import {VideoCard, VideoGrid, VideoMotion, VideoSafeArea, VideoSurface, VideoText} from '@code-to-video/ui';

export type ExplainerProps = {label:string; title:string; points:{title:string;body:string}[]; footer:string; reducedMotion:boolean};
export default function ThreePointExplainer({label,title,points,footer,reducedMotion}: ExplainerProps) {
  const theme = useVideoTheme(); const frame = useCurrentFrame(); const {fps,durationInFrames} = useVideoConfig();
  if ([label,title,footer].some(v => typeof v !== 'string') || typeof reducedMotion !== 'boolean' || !Array.isArray(points) || points.length !== 3 || points.some(p => !p || typeof p.title !== 'string' || typeof p.body !== 'string')) throw new Error('ThreePointExplainer requires text fields, exactly three text points and an explicit reducedMotion boolean');
  const fade = Math.min(1,Math.max(0,(durationInFrames-1-frame)/Math.max(1,Math.round(fps*0.4))));
  return <AbsoluteFill style={{opacity:fade}}>
    <VideoSurface variant="canvas" style={{height:'100%'}}>
      <VideoSafeArea style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <VideoMotion frame={frame} fps={fps} reducedMotion={reducedMotion} preset="slide">
          <VideoText variant="caption" tone="mutedForeground">{label}</VideoText>
          <VideoText variant="title" as="h1" style={{marginTop:theme.spacing.gap,maxWidth:theme.layout.contentWidth}}>{title}</VideoText>
        </VideoMotion>
        <VideoGrid columns={3} style={{alignItems:'stretch'}}>
          {points.map((point,index) => <VideoMotion key={index} frame={frame} fps={fps} reducedMotion={reducedMotion} preset="slide" startSeconds={0.7} staggerIndex={index} staggerSeconds={0.3}>
            <VideoCard style={{minHeight:320,display:'flex',alignItems:'center'}}>
              <VideoText variant="caption" tone="accent">{String(index+1).padStart(2,'0')}</VideoText>
              <VideoText variant="heading" as="h2">{point.title}</VideoText>
              <VideoText variant="body" tone="mutedForeground">{point.body}</VideoText>
            </VideoCard>
          </VideoMotion>)}
        </VideoGrid>
        <VideoMotion frame={frame} fps={fps} reducedMotion={reducedMotion} preset="fade" startSeconds={1.6}>
          <div style={{borderTop:`${theme.border.width}px solid ${theme.colors.muted}`,paddingTop:theme.spacing.gap,display:'flex',justifyContent:'space-between'}}>
            <VideoText variant="caption">{footer}</VideoText>
            <VideoText variant="caption" tone="mutedForeground">{theme.brandName}</VideoText>
          </div>
        </VideoMotion>
      </VideoSafeArea>
    </VideoSurface>
  </AbsoluteFill>;
}
