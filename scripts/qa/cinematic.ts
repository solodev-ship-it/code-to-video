import {verifyCinematicAssets} from './cinematic-assets.ts';
import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {randomBytes, createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createRenderSession, root, relative} from './render.ts';
import {comparePng, strictComparison} from './compare.ts';

const directory = path.join(root, 'renders/cinematic-checks', `cinematic-${Date.now()}-${randomBytes(3).toString('hex')}`);
await mkdir(directory, {recursive: true});
const cases = [{id: 'entrance', frame: 0}, {id: 'sweep', frame: 35}, {id: 'settled', frame: 75}] as const;
const props = (_c: typeof cases[number]) => ({schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false});
const sha = (value: Buffer) => createHash('sha256').update(value).digest('hex');
let session: Awaited<ReturnType<typeof createRenderSession>> | undefined;
const report: Record<string, unknown> = {status: 'failed', composition: 'AdvancedEffectsShowcase', cases: []};
try {
  await verifyCinematicAssets(path.join(root, 'apps/studio/public'), {type: 'sequence',
    frames: Array.from({length: 8}, (_, i) => `advanced-effects/ring-${String(i).padStart(3, '0')}.png`),
    sourceFps: 8, startFrame: 10, policy: 'loop'});
  session = await createRenderSession(directory); report.browser = session.browserVersion;
  const output = report.cases as Record<string, unknown>[];
  for (const c of cases) {
    const file = path.join(directory, `${c.id}.png`);
    await session.capture({compositionId: 'AdvancedEffectsShowcase', frame: c.frame, props: props(c), output: file});
    output.push({id: c.id, frame: c.frame, file: relative(file), sha256: sha(await readFile(file))});
  }
  for (const id of ['sweep', 'settled']) {
    const c = cases.find((value) => value.id === id)!; const original = path.join(directory, `${id}.png`);
    const repeated = path.join(directory, `${id}.repeat.png`);
    await session.capture({compositionId: 'AdvancedEffectsShowcase', frame: c.frame, props: props(c), output: repeated});
    const pixels = comparePng(await readFile(original), await readFile(repeated), strictComparison).metrics.differingPixels;
    assert.equal(pixels, 0, `${id} independent repeat differs`);
    output.find((row) => row.id === id)!.repeat = {file: relative(repeated), differingPixels: pixels, sha256: sha(await readFile(repeated))};
  }
  for (const [a, b] of [['entrance', 'sweep'], ['sweep', 'settled']] as const) {
    const pixels = comparePng(await readFile(path.join(directory, `${a}.png`)), await readFile(path.join(directory, `${b}.png`)), strictComparison).metrics.differingPixels;
    assert(pixels !== null && pixels > 0, `${a} and ${b} must differ`);
  }
  const composition = await selectComposition({serveUrl: session.serveUrl, id: 'AdvancedEffectsShowcase', inputProps: props(cases[0]!), puppeteerInstance: session.browser});
  const video = path.join(directory, 'AdvancedEffectsShowcase.mp4');
  await renderMedia({serveUrl: session.serveUrl, composition, inputProps: props(cases[0]!), codec: 'h264', pixelFormat: 'yuv420p',
    outputLocation: video, puppeteerInstance: session.browser, overwrite: false, concurrency: 1, disallowParallelEncoding: true,
    chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
  const probe = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
    'stream=codec_name,width,height,r_frame_rate,nb_read_frames', '-show_entries', 'format=duration,size', '-of', 'json', video], {encoding: 'utf8'});
  assert.equal(probe.status, 0, probe.stderr); const metadata = JSON.parse(probe.stdout);
  assert.deepEqual([metadata.streams[0].codec_name, metadata.streams[0].width, metadata.streams[0].height,
    metadata.streams[0].r_frame_rate, metadata.streams[0].nb_read_frames], ['h264', 1920, 1080, '30/1', '90']);
  assert.equal(Number(metadata.format.duration), 3);
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', video, '-f', 'null', '-'], {encoding: 'utf8', timeout: 120000});
  assert.equal(decode.status, 0, decode.stderr);
  report.video = {file: relative(video), metadata, fullDecode: true}; report.status = 'passed';
  console.log(`PASS cinematic: 3 frames, 2 exact independent repeats, 90-frame decoded MP4. ${relative(directory)}`);
} catch (error) {report.error = error instanceof Error ? error.message : String(error); process.exitCode = 1; console.error(error);}
finally {if (session) await session.close(); await writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2), {flag: 'wx'});}
