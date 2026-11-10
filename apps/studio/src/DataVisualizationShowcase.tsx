import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {VideoAreaChart, VideoBarChart, VideoDonutChart, VideoGlassSurface, VideoLineChart, VideoNumber, VideoProgressChart,
  VideoSurface, VideoText, VideoTimeline} from '@code-to-video/ui';
import {showcaseRegistry} from './showcase-themes.ts';
import {validateComponentProps} from './component-props.ts';
import type {ComponentShowcaseProps} from './component-props.ts';

const bars = {categories: ['Opening', 'Middle', 'Closing'], series: [
  {id: 'draft', label: 'Draft', values: [42, 57, 36], color: 'primary'},
  {id: 'revision', label: 'Revision', values: [60, 73, 68], color: 'accent'},
]} as const;
const lines = [{id: 'arc', label: 'Story arc', color: 'accent', points: [
  {x: 0, y: 18}, {x: 1, y: 37}, {x: 3.5, y: 32}, {x: 7, y: 72}, {x: 10, y: 61},
]}] as const;
const segments = [{id: 'research', label: 'Research', value: 38, color: 'primary'},
  {id: 'production', label: 'Production', value: 42, color: 'accent'},
  {id: 'review', label: 'Review', value: 20, color: 'foreground'}] as const;
const events = [{id: 'brief', at: 0, label: 'DAY 0', title: 'Brief', description: 'Define the question.', highlight: true},
  {id: 'outline', at: 2, label: 'DAY 2', title: 'Outline', description: 'Shape the evidence.'},
  {id: 'cut', at: 8, label: 'DAY 8', title: 'First cut', description: 'Build the sequence.'},
  {id: 'review', at: 10, label: 'DAY 10', title: 'Review', description: 'Refine the message.', highlight: true}] as const;

function Scene({reducedMotion}: {reducedMotion: boolean}) {
  const t = useVideoTheme(); const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const scene = Math.min(5, Math.floor(frame / 75)); const local = frame - scene * 75;
  const enter = reducedMotion ? 1 : Math.min(1, local / 14);
  const leave = reducedMotion ? 1 : Math.min(1, (74 - local) / 14);
  const opacity = Math.max(0, Math.min(enter, leave));
  const heading = ['DATA, WITH CONTEXT', 'COMPARISON', 'CHANGE OVER TIME', 'A COMPLETE WHOLE', 'MILESTONES', 'THE STORY IN THE NUMBERS'][scene]!;
  const subtitle = ['Illustrative figures for a visual system', 'Illustrative editorial scores · units out of 100',
    'Illustrative story intensity · observations at actual X positions', 'Illustrative effort allocation · total 100 units',
    'Illustrative production schedule · chronological spacing', 'Clear scales. Measured motion. Verified sources belong to the author.'][scene]!;
  return <AbsoluteFill style={{backgroundColor: t.colors.background, color: t.colors.foreground,
    backgroundImage: `radial-gradient(circle at 88% 12%, ${t.colors.muted} 0, transparent 38%)`}}>
    <div style={{position: 'absolute', left: 96, right: 96, top: 68, bottom: 70, opacity}}>
      <VideoText variant="caption" tone="accent" style={{fontSize: 18, letterSpacing: 4}}>CODE TO VIDEO / DATA STUDY</VideoText>
      <VideoText variant="title" style={{fontSize: scene === 0 || scene === 5 ? 78 : 58, marginTop: 24}}>{heading}</VideoText>
      <VideoText tone="mutedForeground" style={{fontSize: 24, marginTop: 10}}>{subtitle}</VideoText>
      {scene === 0 && <VideoGlassSurface appearance={{preset: 'cinematic-frost'}} style={{position: 'absolute', left: 0, right: 0, top: 350, height: 330, padding: 52}}>
        <VideoText variant="heading" style={{fontSize: 48}}>A signal becomes a story.</VideoText>
        <VideoText tone="mutedForeground" style={{fontSize: 29, marginTop: 26}}>One consistent visual language for comparison, change, proportion and sequence.</VideoText>
      </VideoGlassSurface>}
      {scene === 1 && <VideoSurface style={{position: 'absolute', left: 0, right: 0, top: 245, height: 590, padding: 25}}>
        <VideoBarChart width={1650} height={480} frame={local} fps={fps} data={bars} animation={{durationSeconds: 1.2, staggerSeconds: 0.09, reducedMotion}} title="Illustrative editorial scores"/>
        <VideoText variant="caption" tone="mutedForeground" style={{fontSize: 17, marginLeft: 75}}>Draft / Revision · illustrated values only</VideoText>
      </VideoSurface>}
      {scene === 2 && <VideoSurface style={{position: 'absolute', left: 0, right: 0, top: 245, height: 590, padding: 25}}>
        <VideoAreaChart width={1650} height={480} frame={local} fps={fps} series={lines} showValues animation={{durationSeconds: 1.5, reducedMotion}} title="Illustrative story arc"/>
        <VideoText variant="caption" tone="mutedForeground" style={{fontSize: 17, marginLeft: 75}}>Observed points only · line segments connect the observations</VideoText>
      </VideoSurface>}
      {scene === 3 && <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', gap: 60, alignItems: 'center'}}>
        <VideoDonutChart width={670} height={560} frame={local} fps={fps} data={segments} centerLabel={<VideoText variant="heading" style={{fontSize: 54}}>100</VideoText>}
          animation={{durationSeconds: 1, staggerSeconds: 0.15, reducedMotion}} title="Illustrative allocation"/>
        <div style={{flex: 1}}><VideoText variant="caption" tone="accent" style={{fontSize: 18}}>ILLUSTRATIVE ALLOCATION</VideoText>
          <VideoText variant="title" style={{fontSize: 100, marginTop: 15}}><VideoNumber from={0} to={100} frame={local} startFrame={0} endFrame={45} reducedMotion={reducedMotion} format={{decimals: 0}}/> units</VideoText>
          <VideoProgressChart width={850} height={135} frame={local} fps={fps} value={0.8} label="Research + production" format={{style: 'percent', decimals: 0}}
            animation={{durationSeconds: 1.2, reducedMotion}}/>
          <VideoText tone="mutedForeground" style={{fontSize: 20, marginTop: 26}}>Research 38 · Production 42 · Review 20</VideoText>
        </div></div>}
      {scene === 4 && <VideoSurface style={{position: 'absolute', left: 0, right: 0, top: 255, height: 560, padding: 32}}>
        <VideoTimeline events={events} frame={local} fps={fps} width={1600} height={440} animation={{durationSeconds: 0.55, staggerSeconds: 0.22, reducedMotion}}/>
      </VideoSurface>}
      {scene === 5 && <VideoGlassSurface appearance={{preset: 'minimal-clear'}} style={{position: 'absolute', left: 0, right: 0, top: 350, height: 310, padding: 48}}>
        <VideoText variant="heading" style={{fontSize: 45}}>Built for authored evidence.</VideoText>
        <VideoText tone="mutedForeground" style={{fontSize: 27, marginTop: 24}}>Deterministic frames. Explicit data. A human decides what the numbers mean.</VideoText>
      </VideoGlassSurface>}
    </div>
  </AbsoluteFill>;
}
export function DataVisualizationShowcase(input: ComponentShowcaseProps) {
  const props = useMemo(() => validateComponentProps(input), [input]);
  const theme = useMemo(() => {const {reducedMotion: _reduced, ...selection} = props; return resolveTheme(showcaseRegistry, selection);}, [props]);
  return <VideoThemeProvider theme={theme}><Scene reducedMotion={props.reducedMotion}/></VideoThemeProvider>;
}
