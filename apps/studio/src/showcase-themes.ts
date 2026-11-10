import {createThemeRegistry, resolveTheme, validateThemeSelection} from '@code-to-video/themes';
import type {ThemeSelection} from '@code-to-video/themes';
import {auroraFinance, emberStudio, cinematic, minimal, elegant, energetic} from '@code-to-video/themes/presets';

export function createShowcaseRegistry() {
  const registry = createThemeRegistry();
  registry.registerBrand(auroraFinance);
  registry.registerBrand(emberStudio);
  registry.registerVisualStyle(cinematic);
  registry.registerVisualStyle(minimal);
  registry.registerMotionPreset(elegant);
  registry.registerMotionPreset(energetic);
  // Register additional app/project configurations here before sealing.
  registry.seal();
  return registry;
}

// App-owned initialization, not an automatically populated package singleton.
export const showcaseRegistry = createShowcaseRegistry();
// Compatible example selections/test fixtures. Studio-editable defaults are now
// literal objects in Root.tsx; do not compute JSX IDs/defaultProps from this list.
export const showcaseDefaults: ThemeSelection = {
  schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant',
};
export const showcasePresets: {id: string; selection: ThemeSelection}[] = [
  {id: 'ThemeAuroraCinematic', selection: {...showcaseDefaults}},
  {id: 'ThemeAuroraMinimal', selection: {...showcaseDefaults, styleId: 'minimal', motionId: 'energetic'}},
  {id: 'ThemeEmberCinematic', selection: {...showcaseDefaults, brandId: 'ember-studio'}},
  {id: 'ThemeEmberMinimal', selection: {...showcaseDefaults, brandId: 'ember-studio', styleId: 'minimal', motionId: 'energetic'}},
];

export function validateShowcaseProps(input: unknown): ThemeSelection {
  const selection = validateThemeSelection(input);
  // Resolve at metadata validation too, so unknown IDs fail before rendering.
  resolveTheme(showcaseRegistry, selection);
  return selection;
}
