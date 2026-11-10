import assert from 'node:assert/strict';
import test from 'node:test';
import {getDurationInFrames, introProject, validateProject} from './project.ts';

test('intro metadata is 1920×1080, 30 FPS, 150 frames (5 seconds)', () => {
  assert.equal(introProject.id, 'CodeToVideoIntro');
  assert.equal(introProject.width, 1920);
  assert.equal(introProject.height, 1080);
  assert.equal(introProject.fps, 30);
  assert.equal(getDurationInFrames(introProject), 150);
});

test('duration is derived from contiguous half-open scene intervals', () => {
  const project = validateProject({...introProject, scenes: [
    {id: 'first', startFrame: 0, durationInFrames: 30},
    {id: 'second', startFrame: 30, durationInFrames: 60},
  ]});
  assert.equal(getDurationInFrames(project), 90);
});

for (const [name, value, message] of [
  ['non-object', null, /object/],
  ['version', {...introProject, schemaVersion: 2}, /schemaVersion/],
  ['id', {...introProject, id: '../scene'}, /Project id/],
  ['zero width', {...introProject, width: 0}, /width/],
  ['odd width', {...introProject, width: 1919}, /even/],
  ['height', {...introProject, height: NaN}, /height/],
  ['fractional FPS', {...introProject, fps: 29.97}, /fps/],
  ['no scenes', {...introProject, scenes: []}, /at least one/],
  ['scene id', {...introProject, scenes: [{id: '', startFrame: 0, durationInFrames: 30}]}, /valid id/],
  ['negative start', {...introProject, scenes: [{id: 'intro', startFrame: -1, durationInFrames: 30}]}, /startFrame/],
  ['zero duration', {...introProject, scenes: [{id: 'intro', startFrame: 0, durationInFrames: 0}]}, /durationInFrames/],
  ['fractional duration', {...introProject, scenes: [{id: 'intro', startFrame: 0, durationInFrames: 1.5}]}, /durationInFrames/],
  ['duplicate IDs', {...introProject, scenes: [introProject.scenes[0], introProject.scenes[0]]}, /Duplicate/],
  ['gap', {...introProject, scenes: [{id: 'intro', startFrame: 1, durationInFrames: 30}]}, /contiguous/],
  ['overlap', {...introProject, scenes: [introProject.scenes[0], {id: 'next', startFrame: 149, durationInFrames: 30}]}, /contiguous/],
  ['overflow', {...introProject, scenes: [{id: 'intro', startFrame: 1, durationInFrames: Number.MAX_SAFE_INTEGER}]}, /safe integer range/],
] as const) {
  test(`rejects invalid project: ${name}`, () => assert.throws(() => validateProject(value), message));
}
