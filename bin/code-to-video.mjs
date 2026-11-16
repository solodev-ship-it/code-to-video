#!/usr/bin/env node
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runtimeReport, npmFromUserAgent} from './runtime.mjs';
const runtime = runtimeReport({nodeVersion:process.version, npmVersion:npmFromUserAgent(process.env.npm_config_user_agent), platform:process.platform, arch:process.arch});
const diagnostic = process.argv.length === 3 && ['doctor','--help','-h','--version'].includes(process.argv[2]);
const entry = new URL('../dist/scripts/cli.js',import.meta.url);
if (!diagnostic && (!runtime.nodeSupported || runtime.npmSupported === false)) {
  console.error(`code-to-video: Unsupported runtime: Node ${runtime.node}, npm ${runtime.npm}. Required: ${runtime.supported}.\n${runtime.guidance}\nRun code-to-video doctor for details.`);
  process.exitCode = 1;
} else if (!existsSync(entry)) {
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
