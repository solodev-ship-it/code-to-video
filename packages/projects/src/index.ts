// Browser-safe data contracts; Node hosts import load.ts separately.
export {validateProjectManifest, validateProjectPath} from './manifest.ts';
export type {ProjectManifest, Json} from './manifest.ts';
export {createProjectRegistry} from './registry.ts';
