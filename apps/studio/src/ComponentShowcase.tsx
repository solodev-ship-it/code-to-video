import {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {AnimatedTitle, VideoCard, VideoGrid, VideoMotion, VideoSafeArea, VideoStack, VideoSurface, VideoText} from '@code-to-video/ui';
import type {MotionPreset} from '@code-to-video/ui/motion';
import type {ComponentShowcaseProps} from './component-props.ts';
import {validateComponentProps} from './component-props.ts';
import {showcaseRegistry} from './showcase-themes.ts';

export function ComponentShowcase(props: ComponentShowcaseProps) {
  const prepared = useMemo(() => {
    const {reducedMotion, ...selection} = validateComponentProps(props);
    return {theme: resolveTheme(showcaseRegistry, selection), reducedMotion};
  }, [props]);
  return <VideoThemeProvider theme={prepared.theme}><ComponentScene reducedMotion={prepared.reducedMotion} /></VideoThemeProvider>;
}

function ComponentScene({reducedMotion}: {reducedMotion: boolean}) {
  const theme = useVideoTheme();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const timing = {frame, fps, reducedMotion};
  const outro = Math.min(1, (durationInFrames - 1 - frame) / (fps * 0.5));
  return <VideoSurface variant="canvas" style={{width: '100%', height: '100%'}}>
    <VideoSafeArea>
      <VideoStack justify="center" gap={theme.spacing.gap * 0.75}
        style={{height: '100%', width: '100%', maxWidth: theme.layout.contentWidth, margin: '0 auto', opacity: outro}}>
        <VideoMotion {...timing} preset="fade" startSeconds={0.1}>
          <VideoStack direction="row" justify="space-between">
            <VideoText variant="caption" tone="accent">{theme.brandName.toUpperCase()}</VideoText>
            <VideoText variant="caption" tone="mutedForeground">COMPONENT STUDY / {theme.styleName.toUpperCase()}</VideoText>
          </VideoStack>
        </VideoMotion>
        <AnimatedTitle frame={frame} fps={fps} animation={{preset: 'slide', startSeconds: 0.35, durationSeconds: 1.1, reducedMotion}}>
          Built for the moving frame.
        </AnimatedTitle>
        <VideoMotion {...timing} preset="fade" startSeconds={0.9}>
          <VideoText tone="mutedForeground">Reusable foundations. Distinct identities. Precise timing.</VideoText>
        </VideoMotion>
        <VideoGrid columns={3} style={{marginTop: theme.spacing.gap / 2}}>
          {[
            {eyebrow: '01 / TYPOGRAPHY', title: 'Words with presence', description: 'A clear hierarchy, driven by your brand.'},
            {eyebrow: '02 / SURFACES', title: 'A considered canvas', description: 'Tokens shape every border, fill and shadow.'},
            {eyebrow: '03 / LAYOUT', title: 'Room to tell a story', description: 'Stacks, grids and explicit safe areas.'},
          ].map((card, index) => <VideoMotion key={card.eyebrow} {...timing} preset="slide"
            startSeconds={1.65} durationSeconds={0.9} staggerIndex={index} staggerSeconds={0.22}>
            <VideoCard {...card} />
          </VideoMotion>)}
        </VideoGrid>
        <VideoSurface style={{padding: theme.spacing.cardPadding * 0.65, marginTop: theme.spacing.gap / 2}}>
          <VideoStack gap={theme.spacing.gap / 2}>
            <VideoText variant="caption" tone="mutedForeground">MOTION / FRAME-DRIVEN ENTRANCES</VideoText>
            <VideoGrid columns={4}>
              {(['fade', 'slide', 'scale', 'reveal'] as const).map((preset: MotionPreset, index) => (
                <VideoMotion key={preset} {...timing} preset={preset} startSeconds={3.5}
                  durationSeconds={1} staggerIndex={index} staggerSeconds={0.2}>
                  <VideoStack direction="row" align="center" gap={theme.spacing.gap / 3}>
                    <VideoSurface variant="plain" style={{width: 22, height: 22, flexShrink: 0,
                      backgroundColor: theme.colors.accent, borderRadius: theme.radii.badge}} />
                    <VideoText>{preset.charAt(0).toUpperCase() + preset.slice(1)}</VideoText>
                  </VideoStack>
                </VideoMotion>
              ))}
            </VideoGrid>
          </VideoStack>
        </VideoSurface>
        <VideoMotion {...timing} preset="fade" startSeconds={5} durationSeconds={0.6}>
          <VideoStack direction="row" justify="space-between">
            <VideoText variant="caption" tone="mutedForeground">CODE TO VIDEO / VIDEO-NATIVE FOUNDATIONS</VideoText>
            <VideoText variant="caption" tone="mutedForeground">{reducedMotion ? 'REDUCED MOTION' : theme.motionName.toUpperCase()} / 09 SECONDS</VideoText>
          </VideoStack>
        </VideoMotion>
      </VideoStack>
    </VideoSafeArea>
  </VideoSurface>;
}
