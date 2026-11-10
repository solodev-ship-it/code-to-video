import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {verifyCinematicAssets} from '../../scripts/qa/cinematic-assets.ts';
test('cinematic host preflight rejects missing files and symlink escapes', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'cinematic-assets-'));
  const root = path.join(parent, 'public'); await mkdir(root);
  await writeFile(path.join(root, 'ok.png'), 'fixture');
  await writeFile(path.join(parent, 'outside.png'), 'fixture');
  await symlink(path.join(parent, 'outside.png'), path.join(root, 'escape.png'));
  await verifyCinematicAssets(root, {type: 'png', src: 'ok.png'});
  await assert.rejects(verifyCinematicAssets(root, {type: 'png', src: 'missing.png'}), /Missing cinematic asset/);
  await assert.rejects(verifyCinematicAssets(root, {type: 'png', src: 'escape.png'}), /escapes public root/);
});
