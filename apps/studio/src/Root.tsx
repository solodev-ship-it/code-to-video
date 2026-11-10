import {AdvancedEffectsShowcase} from './AdvancedEffectsShowcase.tsx';
import {Composition} from 'remotion';
import {CodeToVideoIntro} from './CodeToVideoIntro';
import {getDurationInFrames, introProject} from './project.ts';
import {ThemeShowcase} from './ThemeShowcase';
import {validateShowcaseProps} from './showcase-themes.ts';
import {ComponentShowcase} from './ComponentShowcase';
import {validateComponentProps} from './component-props.ts';
import {ReliabilityFixture, validateReliabilityProps} from './qa/ReliabilityFixture';
import {GlassmorphismShowcase} from './GlassmorphismShowcase';
import {validateGlassProps} from './glass-props.ts';
import {DynamicIslandShowcase} from './DynamicIslandShowcase';
import {validateIslandShowcaseProps} from './island-props.ts';
import {DataVisualizationShowcase} from './DataVisualizationShowcase';
import {validateComponentProps as validateDataVisualizationProps} from './component-props.ts';
import {ClaymorphismShowcase} from './ClaymorphismShowcase';
import {validateClayShowcaseProps} from './clay-props.ts';

export function RemotionRoot() {
  return (
    <>
      <Composition
        id={introProject.id}
        component={CodeToVideoIntro}
        width={introProject.width}
        height={introProject.height}
        fps={introProject.fps}
        durationInFrames={getDurationInFrames(introProject)}
      />
      {/* Literal IDs/defaults are required by Studio's source-editing extractor. */}
      <Composition id="ThemeShowcase" component={ThemeShowcase}
        width={1920} height={1080} fps={30} durationInFrames={180}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant'}}
        calculateMetadata={({props}) => ({props: validateShowcaseProps(props)})} />
      <Composition id="ThemeAuroraCinematic" component={ThemeShowcase}
        width={1920} height={1080} fps={30} durationInFrames={180}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant'}}
        calculateMetadata={({props}) => ({props: validateShowcaseProps(props)})} />
      <Composition id="ThemeAuroraMinimal" component={ThemeShowcase}
        width={1920} height={1080} fps={30} durationInFrames={180}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'minimal', motionId: 'energetic'}}
        calculateMetadata={({props}) => ({props: validateShowcaseProps(props)})} />
      <Composition id="ThemeEmberCinematic" component={ThemeShowcase}
        width={1920} height={1080} fps={30} durationInFrames={180}
        defaultProps={{schemaVersion: 1, brandId: 'ember-studio', styleId: 'cinematic', motionId: 'elegant'}}
        calculateMetadata={({props}) => ({props: validateShowcaseProps(props)})} />
      <Composition id="ThemeEmberMinimal" component={ThemeShowcase}
        width={1920} height={1080} fps={30} durationInFrames={180}
        defaultProps={{schemaVersion: 1, brandId: 'ember-studio', styleId: 'minimal', motionId: 'energetic'}}
        calculateMetadata={({props}) => ({props: validateShowcaseProps(props)})} />
      <Composition id="ComponentShowcase" component={ComponentShowcase}
        width={1920} height={1080} fps={30} durationInFrames={270}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false}}
        calculateMetadata={({props}) => ({props: validateComponentProps(props)})} />
      <Composition id="ComponentAuroraCinematic" component={ComponentShowcase}
        width={1920} height={1080} fps={30} durationInFrames={270}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false}}
        calculateMetadata={({props}) => ({props: validateComponentProps(props)})} />
      <Composition id="ComponentEmberMinimal" component={ComponentShowcase}
        width={1920} height={1080} fps={30} durationInFrames={270}
        defaultProps={{schemaVersion: 1, brandId: 'ember-studio', styleId: 'minimal', motionId: 'energetic', reducedMotion: false}}
        calculateMetadata={({props}) => ({props: validateComponentProps(props)})} />
      <Composition id="ReliabilityFixture" component={ReliabilityFixture}
        width={1920} height={1080} fps={30} durationInFrames={270}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false, fixture: 'normal'}}
        calculateMetadata={({props}) => ({props: validateReliabilityProps(props)})} />
      <Composition id="GlassmorphismShowcase" component={GlassmorphismShowcase}
        width={1920} height={1080} fps={30} durationInFrames={300}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false, fixture: 'showcase', background: 'dark', diagnostics: false, hideLabelInk: false}}
        calculateMetadata={({props}) => ({props: validateGlassProps(props)})} />
      <Composition id="DynamicIslandShowcase" component={DynamicIslandShowcase}
        width={1920} height={1080} fps={30} durationInFrames={330}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false, fixture: 'showcase', diagnostics: false}}
        calculateMetadata={({props}) => ({props: validateIslandShowcaseProps(props)})} />
      <Composition id="DataVisualizationShowcase" component={DataVisualizationShowcase}
        width={1920} height={1080} fps={30} durationInFrames={450}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false}}
        calculateMetadata={({props}) => ({props: validateDataVisualizationProps(props)})} />
      <Composition id="ClaymorphismShowcase" component={ClaymorphismShowcase}
        width={1920} height={1080} fps={30} durationInFrames={270}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false, fixture: 'showcase'}}
        calculateMetadata={({props}) => ({props: validateClayShowcaseProps(props)})} />
      <Composition id="AdvancedEffectsShowcase" component={AdvancedEffectsShowcase}
        width={1920} height={1080} fps={30} durationInFrames={90}
        defaultProps={{schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false}}
        calculateMetadata={({props}) => ({props: validateComponentProps(props)})} />
    </>
  );
}
