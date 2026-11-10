import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorWithOpacity, resolveTheme} from '@code-to-video/themes';
import {useVideoTheme, VideoThemeProvider} from '@code-to-video/themes/react';
import {AnimatedTitle, VideoText, VideoSurface, VideoIcon, VideoDynamicIsland, VideoMotion,
  IslandNotification, IslandStatistic, IslandProgress, IslandAnnouncement, IslandMedia} from '@code-to-video/ui';
import {evaluateMotion} from '@code-to-video/ui/motion';
import {LayoutProbe} from '@code-to-video/ui/diagnostics/react';
import {showcaseRegistry} from './showcase-themes.ts';
import {showcaseIcons} from './showcase-icons';
import {demoIslandGeometry, demoIslandTiming, validateIslandShowcaseProps} from './island-props.ts';
import type {IslandShowcaseProps} from './island-props.ts';
import {IslandProbe} from './qa/IslandProbe';

const glass = {preset: 'cinematic-frost', overrides: {opacity: 0.94, radius: 44, highlight: 0.06}} as const;
const iconExamples = [
  {library: 'lucide', id: 'bell', preset: 'fade'}, {library: 'lucide', id: 'check', preset: 'scale'},
  {library: 'phosphor', id: 'chart-line-up', preset: 'slide'}, {library: 'lucide', id: 'arrow-up-right', preset: 'rotate'},
  {library: 'custom', id: 'signal-mark', preset: 'draw'}, {library: 'phosphor', id: 'play-circle', preset: 'pulse'},
] as const;
function Scene({props}: {props: IslandShowcaseProps}) {
  const t = useVideoTheme(); const frame = useCurrentFrame(); const {width, height, fps} = useVideoConfig();
  const transition = evaluateMotion(frame, fps, t.motion, {preset: 'fade', startSeconds: 5.1, durationSeconds: 0.5}).progress;
  const heroIcon = <div style={{position: 'relative', width: 44, height: 44}}>
    <div style={{position: 'absolute', opacity: 1 - transition}}><VideoIcon registry={showcaseIcons} library="lucide" id="bell" size={44} /></div>
    <div style={{position: 'absolute', opacity: transition}}><VideoIcon registry={showcaseIcons} library="phosphor" id="chart-line-up" size={44} /></div>
  </div>;
  const iconsOnly = props.fixture === 'icons'; const full = props.fixture === 'showcase';
  return <AbsoluteFill data-island-stage style={{width, height, color: t.colors.foreground, backgroundColor: t.colors.background,
    backgroundImage: `linear-gradient(125deg, ${t.colors.background}, ${t.colors.muted})`}}>
    <div aria-hidden style={{position: 'absolute', left: width * 0.25, top: height * 0.3, width: width * 0.5, height: height * 0.4,
      backgroundImage: `repeating-linear-gradient(90deg, ${colorWithOpacity(t.colors.accent, 0.12)} 0 1px, transparent 1px 32px)`}} />
    {full && <div data-ctv-safe-area="island-safe" style={{position: 'absolute', left: 96, right: 96, top: 80, bottom: 80}}>
      <VideoText variant="caption" style={{fontSize: 20, letterSpacing: 3}}>SIGNAL / VIDEO-NATIVE SYSTEMS</VideoText>
      <AnimatedTitle frame={frame} fps={fps} animation={{startSeconds: 0.1, durationSeconds: 0.8, reducedMotion: props.reducedMotion}}
        diagnostics={{id: 'island-title', safeAreaId: 'island-safe', maxLines: 1}} style={{fontSize: 82, marginTop: 20}}>Information, in motion.</AnimatedTitle>
      <VideoText tone="mutedForeground" style={{fontSize: 27, marginTop: 16}}>A precise container. A clear point of focus.</VideoText>
    </div>}
    {!iconsOnly && <div style={{position: 'absolute', left: 0, right: 0, top: full ? 350 : 330, display: 'flex', justifyContent: 'center'}}>
      <VideoDynamicIsland frame={frame} fps={fps} timing={demoIslandTiming} geometry={demoIslandGeometry} reducedMotion={props.reducedMotion}
        appearance={props.fixture === 'solid' ? undefined : glass} icon={heroIcon} title="Production briefing"
        secondary="An authored example · no live data" status={<VideoIcon registry={showcaseIcons} library="lucide" id="check" size={24} label="Prepared" />}>
        <div style={{position: 'relative', height: 132}}>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - transition}}><IslandNotification description={'A new perspective is ready.\nThe context stays with the story.'} /></div>
          <div style={{position: 'absolute', inset: 0, opacity: transition}}><IslandStatistic label="ILLUSTRATIVE METRIC / NOT LIVE DATA" value="24.8%" comparison="+3.2 points"
            trend={<VideoIcon registry={showcaseIcons} library="phosphor" id="chart-line-up" size={52} />} /></div>
        </div>
      </VideoDynamicIsland>
    </div>}
    {(iconsOnly || full) && <div style={{position: 'absolute', left: 150, right: 150, top: iconsOnly ? 420 : 735, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      {iconExamples.map((icon, index) => <div key={icon.id} style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <VideoIcon registry={showcaseIcons} library={icon.library} id={icon.id} size={iconsOnly ? 90 : 34} label={`${icon.library} ${icon.id}`}
          frame={frame} fps={fps} animation={{preset: icon.preset, startSeconds: 0.35 + index * 0.1, durationSeconds: 1.5, reducedMotion: props.reducedMotion}} />
        <VideoText variant="caption" tone="mutedForeground" style={{fontSize: iconsOnly ? 22 : 18}}>{icon.preset.toUpperCase()}</VideoText>
      </div>)}
    </div>}
    {full && <>
      <div style={{position: 'absolute', left: 96, right: 96, top: 825, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28}}>
        <VideoSurface style={{padding: 26, height: 160, boxShadow: 'none'}}><IslandProgress title="Scene assembly" progress={0.76} /></VideoSurface>
        <VideoSurface style={{padding: 26, height: 160, boxShadow: 'none'}}><IslandAnnouncement headline="A new chapter" description="An expandable space for context." /></VideoSurface>
        <VideoSurface style={{padding: 26, height: 160, boxShadow: 'none'}}><IslandMedia title="Field notes" detail="Supplied content. No playback."
          artwork={<VideoIcon registry={showcaseIcons} library="phosphor" id="play-circle" size={56} />} /></VideoSurface>
      </div>
      <VideoMotion frame={frame} fps={fps} preset="fade" startSeconds={9.9} durationSeconds={0.6} reducedMotion={props.reducedMotion}
        style={{position: 'absolute', top: 480, width: '100%', textAlign: 'center'}}><VideoText style={{fontSize: 36}}>One system. Many signals.</VideoText></VideoMotion>
    </>}
    {props.diagnostics && <><IslandProbe frame={frame} />{full && <LayoutProbe compositionId="DynamicIslandShowcase" frame={frame} ready />}</>}
  </AbsoluteFill>;
}
export function DynamicIslandShowcase(input: IslandShowcaseProps) {
  const props = useMemo(() => validateIslandShowcaseProps(input), [input]);
  const theme = useMemo(() => {const {fixture: _fixture, diagnostics: _diagnostics, reducedMotion: _reduced, ...selection} = props; return resolveTheme(showcaseRegistry, selection);}, [props]);
  return <VideoThemeProvider theme={theme}><Scene props={props} /></VideoThemeProvider>;
}
