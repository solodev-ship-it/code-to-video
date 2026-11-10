// Minimal in-app contract, not an external project loader or public schema API.
export type SceneConfig = {
  id: string;
  startFrame: number;
  durationInFrames: number;
};

export type ProjectConfig = {
  schemaVersion: 1;
  id: string;
  width: number;
  height: number;
  fps: number;
  scenes: SceneConfig[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z][A-Za-z0-9-]*$/.test(value);

export function validateProject(value: unknown): ProjectConfig {
  if (!isRecord(value)) throw new Error('Project must be an object.');
  if (value.schemaVersion !== 1) throw new Error('Unsupported schemaVersion; expected 1.');
  if (!isId(value.id)) throw new Error('Project id must start with a letter and contain only letters, digits, or hyphens.');
  for (const key of ['width', 'height', 'fps'] as const) {
    if (!isPositiveInteger(value[key])) throw new Error(`${key} must be a positive safe integer.`);
  }
  if ((value.width as number) % 2 || (value.height as number) % 2) {
    throw new Error('width and height must be even for the starter H.264 delivery profile.');
  }
  if (!Array.isArray(value.scenes) || value.scenes.length === 0) {
    throw new Error('Project must contain at least one scene.');
  }
  const ids = new Set<string>();
  let previousEnd = 0;
  const scenes = value.scenes.map((scene: unknown, index: number): SceneConfig => {
    if (!isRecord(scene) || !isId(scene.id)) throw new Error(`Scene ${index} requires a valid id.`);
    if (ids.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}.`);
    ids.add(scene.id);
    if (typeof scene.startFrame !== 'number' || !Number.isSafeInteger(scene.startFrame) || scene.startFrame < 0) {
      throw new Error(`Scene ${scene.id}: startFrame must be a nonnegative safe integer.`);
    }
    if (!isPositiveInteger(scene.durationInFrames)) {
      throw new Error(`Scene ${scene.id}: durationInFrames must be a positive safe integer.`);
    }
    const end = scene.startFrame + scene.durationInFrames;
    if (!Number.isSafeInteger(end)) throw new Error(`Scene ${scene.id}: end frame exceeds the safe integer range.`);
    // Starter policy: contiguous ordered scenes, no implicit gaps or transitions.
    if (scene.startFrame !== previousEnd) throw new Error(`Scene ${scene.id}: scenes must be contiguous and ordered without overlaps.`);
    previousEnd = end;
    return {id: scene.id, startFrame: scene.startFrame, durationInFrames: scene.durationInFrames};
  });
  return {
    schemaVersion: 1,
    id: value.id,
    width: value.width as number,
    height: value.height as number,
    fps: value.fps as number,
    scenes,
  };
}

export const getDurationInFrames = (project: ProjectConfig): number =>
  project.scenes.reduce((end, scene) => Math.max(end, scene.startFrame + scene.durationInFrames), 0);

export const introProject = validateProject({
  schemaVersion: 1,
  id: 'CodeToVideoIntro',
  width: 1920,
  height: 1080,
  fps: 30,
  scenes: [{id: 'intro', startFrame: 0, durationInFrames: 150}],
});
