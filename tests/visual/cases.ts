import type {VisualCase} from '../../scripts/qa/cases.ts';
const matrix = [
  ['aurora-finance', 'cinematic', 'elegant'], ['aurora-finance', 'minimal', 'energetic'],
  ['ember-studio', 'cinematic', 'elegant'], ['ember-studio', 'minimal', 'energetic'],
] as const;
export const visualCases: VisualCase[] = matrix.flatMap(([brandId, styleId, motionId]) => [15, 90, 260].map((frame): VisualCase => ({
  schemaVersion: 1, id: `${brandId}-${styleId}-f${frame}`, compositionId: 'ReliabilityFixture', frame, width: 1920, height: 1080, fps: 30,
  brandId, styleId, fontPolicy: 'required-local', props: {schemaVersion: 1, brandId, styleId, motionId, reducedMotion: false, fixture: 'normal'},
})));
visualCases.push(
  {schemaVersion: 1, id: 'intro-settled', compositionId: 'CodeToVideoIntro', frame: 90, width: 1920, height: 1080, fps: 30,
    brandId: null, styleId: null, fontPolicy: 'system-compatible', props: {}},
  {schemaVersion: 1, id: 'component-settled', compositionId: 'ComponentShowcase', frame: 180, width: 1920, height: 1080, fps: 30,
    brandId: 'aurora-finance', styleId: 'cinematic', fontPolicy: 'system-compatible',
    props: {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false}},
);
