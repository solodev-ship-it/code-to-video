import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {randomBytes, createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createRenderSession, root, relative} from './render.ts';
import {comparePng, strictComparison} from './compare.ts';

const directory = path.join(root, 'renders/chart-checks', `charts-${Date.now()}-${randomBytes(3).toString('hex')}`);
await mkdir(directory, {recursive: true});
const cases = [
  {id: 'bar-start', frame: 76}, {id: 'bar-mid', frame: 102}, {id: 'bar-settled', frame: 125},
  {id: 'line-mid', frame: 161}, {id: 'line-settled', frame: 201}, {id: 'donut-mid', frame: 256},
  {id: 'timeline', frame: 329}, {id: 'ember', frame: 269, brandId: 'ember-studio', styleId: 'minimal'},
] as const;
const props = (c: typeof cases[number]) => ({schemaVersion: 1, brandId: 'brandId' in c ? c.brandId : 'aurora-finance',
  styleId: 'styleId' in c ? c.styleId : 'cinematic', motionId: 'elegant', reducedMotion: false});
const sha = (value: Buffer) => createHash('sha256').update(value).digest('hex');
const session = await createRenderSession(directory);
const report: Record<string, unknown> = {status: 'failed', composition: 'DataVisualizationShowcase', cases: [], browser: session.browserVersion};
try {
  const output = report.cases as Record<string, unknown>[];
  for (const c of cases) {
    const file = path.join(directory, `${c.id}.png`);
    await session.capture({compositionId: 'DataVisualizationShowcase', frame: c.frame, props: props(c), output: file});
    output.push({id: c.id, frame: c.frame, file: relative(file), sha256: sha(await readFile(file))});
  }
  for (const id of ['bar-mid', 'line-mid', 'donut-mid', 'timeline']) {
    const c = cases.find((value) => value.id === id)!; const original = path.join(directory, `${id}.png`);
    const repeated = path.join(directory, `${id}.repeat.png`);
    await session.capture({compositionId: 'DataVisualizationShowcase', frame: c.frame, props: props(c), output: repeated});
    const pixels = comparePng(await readFile(original), await readFile(repeated), strictComparison).metrics.differingPixels;
    assert.equal(pixels, 0, `${id} independent repeat differs`);
    output.find((row) => row.id === id)!.repeat = {file: relative(repeated), differingPixels: pixels, sha256: sha(await readFile(repeated))};
  }
  for (const [a, b] of [['bar-start', 'bar-settled'], ['bar-mid', 'bar-settled'], ['line-mid', 'line-settled']] as const) {
    const pixels = comparePng(await readFile(path.join(directory, `${a}.png`)), await readFile(path.join(directory, `${b}.png`)), strictComparison).metrics.differingPixels;
    assert(pixels !== null && pixels > 0, `${a} and ${b} should show animation progress`);
  }
  const composition = await selectComposition({serveUrl: session.serveUrl, id: 'DataVisualizationShowcase', inputProps: props(cases[0]!), puppeteerInstance: session.browser});
  const video = path.join(directory, 'DataVisualizationShowcase.mp4');
  await renderMedia({serveUrl: session.serveUrl, composition, inputProps: props(cases[0]!), codec: 'h264', pixelFormat: 'yuv420p',
    outputLocation: video, puppeteerInstance: session.browser, overwrite: false, concurrency: 1, disallowParallelEncoding: true,
    chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
  const probe = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
    'stream=codec_name,width,height,r_frame_rate,nb_read_frames', '-show_entries', 'format=duration,size', '-of', 'json', video], {encoding: 'utf8'});
  assert.equal(probe.status, 0, probe.stderr); const metadata = JSON.parse(probe.stdout);
  assert.deepEqual([metadata.streams[0].codec_name, metadata.streams[0].width, metadata.streams[0].height,
    metadata.streams[0].r_frame_rate, metadata.streams[0].nb_read_frames], ['h264', 1920, 1080, '30/1', '450']);
  assert.equal(Number(metadata.format.duration), 15);
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', video, '-f', 'null', '-'], {encoding: 'utf8', timeout: 120000});
  assert.equal(decode.status, 0, decode.stderr);
  report.video = {file: relative(video), metadata, fullDecode: true}; report.status = 'passed';
  console.log(`PASS charts: 8 frames, 4 exact independent repeats, progressing visuals, 450-frame decoded MP4. ${relative(directory)}`);
} catch (error) {report.error = error instanceof Error ? error.message : String(error); process.exitCode = 1; console.error(error);}
finally {await session.close(); await writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2), {flag: 'wx'});}
