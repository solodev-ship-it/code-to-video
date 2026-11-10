#!/usr/bin/env node
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const entry = new URL('../dist/scripts/cli.js',import.meta.url);
if (!existsSync(entry)) {
  console.error('code-to-video: CLI is not built. Run npm run build:cli in the framework directory.');
  process.exitCode = 1;
} else {
  try {
    const {main} = await import(entry.href);
    process.exitCode = await main(process.argv.slice(2),fileURLToPath(new URL('../',import.meta.url)));
  } catch (error) {
    console.error(`code-to-video: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
