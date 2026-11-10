import {createThemeRegistry} from '../../themes/src/index.ts';
import type {ThemeRegistry} from '../../themes/src/index.ts';
import {auroraFinance, emberStudio, cinematic, minimal, elegant, energetic} from '../../themes/src/presets.ts';
// Explicit host initialization. No package-owned singleton.
export function createProjectRegistry(register?: (registry: ThemeRegistry) => void): ThemeRegistry {
  const registry = createThemeRegistry();
  registry.registerBrand(auroraFinance); registry.registerBrand(emberStudio);
  registry.registerVisualStyle(cinematic); registry.registerVisualStyle(minimal);
  registry.registerMotionPreset(elegant); registry.registerMotionPreset(energetic);
  register?.(registry); registry.seal(); return registry;
}
