import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {parseArgs, help} from './cli/args.ts';
import {createProject} from './cli/create.ts';
import {runProjectCommand} from './project-host.ts';
import type {ProjectCommand} from './project-host.ts';
import type {CliCommand} from './cli/args.ts';
export function projectCommand(command: Extract<CliCommand,{command:'preview' | 'render'}>, frameworkRoot: string): ProjectCommand {
  const projectRoot = path.resolve(command.directory);
  if (command.command === 'preview') return {frameworkRoot,projectRoot,mode:'studio',args:command.port ? [`--port=${command.port}`] : []};
  return {frameworkRoot,projectRoot,mode:'render',args:[command.compositionId,path.resolve(command.output)],allowExternalOutput:true};
}
export async function main(argv: readonly string[], frameworkRoot: string): Promise<number> {
  const command = parseArgs(argv);
  if (command.command === 'help') {console.log(help);return 0;}
  if (command.command === 'version') {console.log(JSON.parse(await readFile(path.join(frameworkRoot,'package.json'),'utf8')).version);return 0;}
  if (command.command === 'doctor') {
    const {runtimeReport, npmFromUserAgent} = await import(pathToFileURL(path.join(frameworkRoot,'bin/runtime.mjs')).href);
    const report = runtimeReport({nodeVersion:process.version, npmVersion:npmFromUserAgent(process.env.npm_config_user_agent), platform:process.platform, arch:process.arch});
    console.log(JSON.stringify(report, null, 2));
    return report.nodeSupported && report.npmSupported !== false ? 0 : 1;
  }
  if (command.command === 'create') {
    const project = await createProject(command,frameworkRoot);
    console.log(`Created ${project.manifest.id} at ${project.root}\nComposition: ${project.manifest.compositions[0]!.id}\nSample copy is ready to edit. No packages were installed.`);
    return 0;
  }
  return runProjectCommand(projectCommand(command,frameworkRoot));
}
