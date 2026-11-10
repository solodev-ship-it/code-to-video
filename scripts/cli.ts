import path from 'node:path';
import {readFile} from 'node:fs/promises';
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
  if (command.command === 'create') {
    const project = await createProject(command,frameworkRoot);
    console.log(`Created ${project.manifest.id} at ${project.root}\nComposition: ${project.manifest.compositions[0]!.id}\nSample copy is ready to edit. No packages were installed.`);
    return 0;
  }
  return runProjectCommand(projectCommand(command,frameworkRoot));
}
