import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {visualCases} from '../../tests/visual/cases.ts';
import {captureCases, qaPaths} from './visual.ts';
import {createRenderSession, relative} from './render.ts';

function command(binary: string, args: string[]): string {
  const result = spawnSync(binary, args, {encoding: 'utf8', timeout: 120000});
  if (result.error) throw new Error(`${binary} is required for independent MP4 QA; install it on the QA host. ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${binary} verification failed: ${result.stderr}`);
  return result.stdout;
}
export async function renderSmoke(run: string) {
  const cases = visualCases.filter((c) => c.fontPolicy === 'system-compatible');
  const report = await captureCases(cases, run, true);
  if (report.status !== 'passed') throw new Error('Existing composition deterministic PNG smoke failed.');
  const directory = path.join(qaPaths.current, `${run}-mp4`); await mkdir(directory);
  const session = await createRenderSession(directory);
  try {
    const props = {};
    const composition = await selectComposition({serveUrl: session.serveUrl, id: 'CodeToVideoIntro', inputProps: props, puppeteerInstance: session.browser});
    const output = path.join(directory, 'CodeToVideoIntro-smoke.mp4');
    await renderMedia({serveUrl: session.serveUrl, composition, inputProps: props, codec: 'h264', outputLocation: output,
      puppeteerInstance: session.browser, overwrite: false, concurrency: 1, disallowParallelEncoding: true,
      chromiumOptions: {gl: 'swangle'}, pixelFormat: 'yuv420p', logLevel: 'error'});
    if ((await stat(output)).size === 0) throw new Error('MP4 output missing or empty.');
    const metadata = JSON.parse(command('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
      'stream=codec_name,width,height,r_frame_rate,nb_read_frames', '-show_entries', 'format=duration,size', '-of', 'json', output])) as {streams: {codec_name: string; width: number; height: number; r_frame_rate: string; nb_read_frames: string}[]; format: {duration: string}};
    const stream = metadata.streams[0];
    if (!stream || stream.codec_name !== 'h264' || stream.width !== 1920 || stream.height !== 1080 || stream.r_frame_rate !== '30/1' || stream.nb_read_frames !== '150' || Number(metadata.format.duration) !== 5) throw new Error('Unexpected MP4 metadata.');
    command('ffmpeg', ['-v', 'error', '-i', output, '-f', 'null', '-']);
    await readFile(output); // Existence/readability, not a byte-equality determinism assertion.
    await writeFile(path.join(directory, 'verification.json'), JSON.stringify({schemaVersion: 1, status: 'passed', artifact: relative(output), metadata, fullDecode: true}, null, 2));
    console.log(`PASS: existing 1080p/30 FPS/5-second H.264 intro MP4 metadata and full decode. ${relative(output)}`);
  } finally {await session.close();}
}
