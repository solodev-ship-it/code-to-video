import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import type {HeadlessBrowser} from '@remotion/renderer';
import {mkdir, readdir, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {verifyPngOutput} from './artifacts.ts';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const relative = (file: string): string => path.relative(root, file).split(path.sep).join('/');
async function cachedBrowser(): Promise<string> {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) return process.env.REMOTION_BROWSER_EXECUTABLE;
  async function search(directory: string, depth: number): Promise<string | undefined> {
    const entries = await readdir(directory, {withFileTypes: true}).catch(() => []);
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isFile() && ['chrome-headless-shell', 'chrome-headless-shell.exe'].includes(entry.name)) return file;
      if (entry.isDirectory() && depth > 0) {const found = await search(file, depth - 1); if (found) return found;}
    }
    return undefined;
  }
  for (const base of ['apps/studio/node_modules/.remotion', 'node_modules/.remotion']) {
    const found = await search(path.join(root, base), 5); if (found) return found;
  }
  throw new Error('No cached renderer browser. Run npm run browser:ensure during setup, or set REMOTION_BROWSER_EXECUTABLE. QA never downloads a browser.');
}
export async function createRenderSession(directory: string) {
  await mkdir(directory, {recursive: true});
  const serveUrl = await bundle({entryPoint: path.join(root, 'apps/studio/src/index.ts'),
    publicDir: path.join(root, 'apps/studio/public'), outDir: path.join(directory, 'bundle'), enableCaching: true});
  const browser: HeadlessBrowser = await openBrowser('chrome', {browserExecutable: await cachedBrowser(), forceDeviceScaleFactor: 1, chromiumOptions: {gl: 'swangle'}});
  // The pinned renderer types expose only its own CDP subset. Validate the actual
  // standard Browser.getVersion response rather than inferring a browser version.
  const sendVersion = browser.connection.send.bind(browser.connection) as unknown as (method: 'Browser.getVersion') => Promise<{value: unknown}>;
  const version = (await sendVersion('Browser.getVersion')).value as Record<string, unknown>;
  for (const key of ['product', 'revision', 'userAgent']) if (typeof version[key] !== 'string') throw new Error('Browser version fingerprint unavailable.');
  const browserVersion = version as {product: string; revision: string; userAgent: string};
  return {
    serveUrl, browser, browserVersion,
    async capture(options: {compositionId: string; frame: number; props: Record<string, unknown>; output: string; width?: number; height?: number; fps?: number}) {
      const composition = await selectComposition({serveUrl, id: options.compositionId, inputProps: options.props, puppeteerInstance: browser});
      const config = {...composition, width: options.width ?? composition.width, height: options.height ?? composition.height, fps: options.fps ?? composition.fps};
      const artifacts: {filename: string; content: string; frame: number}[] = [];
      await mkdir(path.dirname(options.output), {recursive: true});
      await renderStill({serveUrl, composition: config, frame: options.frame, inputProps: options.props, output: options.output,
        imageFormat: 'png', overwrite: false, puppeteerInstance: browser, scale: 1, chromiumOptions: {gl: 'swangle'},
        timeoutInMilliseconds: 20000,
        onArtifact: (artifact) => {artifacts.push({filename: artifact.filename, frame: artifact.frame,
          content: typeof artifact.content === 'string' ? artifact.content : Buffer.from(artifact.content).toString('utf8')});},
      });
      if ((await stat(options.output)).size === 0) throw new Error(`Missing render output: ${relative(options.output)}`);
      await verifyPngOutput(options.output, config.width, config.height);
      return {composition: config, artifacts};
    },
    close: () => browser.close({silent: true}),
  };
}
