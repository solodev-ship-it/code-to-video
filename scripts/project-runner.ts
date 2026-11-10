// Existing npm entry; the optional CLI shares this host without changing showcases.
import {fileURLToPath} from 'node:url';
import {runProjectCommand} from './project-host.ts';
import type {ProjectMode} from './project-host.ts';
process.exitCode = await runProjectCommand({
  frameworkRoot:fileURLToPath(new URL('../',import.meta.url)),
  mode:process.argv[2] as ProjectMode,
  projectRoot:process.env.CODE_TO_VIDEO_PROJECT,
  args:process.argv.slice(3),
});
