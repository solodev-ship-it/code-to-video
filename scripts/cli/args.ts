export type CreateOptions = {directory: string; template: string; id?: string; title?: string; brandId: string; styleId: string; motionId: string};
export type CliCommand =
  | {command:'help'} | {command:'version'}
  | ({command:'create'} & CreateOptions)
  | {command:'preview'; directory:string; port?:number}
  | {command:'render'; directory:string; compositionId:string; output:string};
const createFlags = ['template','id','title','brand','style','motion'];
export function parseArgs(argv: readonly string[]): CliCommand {
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) return {command:'help'};
  if (argv.length === 1 && argv[0] === '--version') return {command:'version'};
  const command = argv[0];
  if (!['create','preview','render'].includes(command ?? '')) throw new Error(`Unknown command ${JSON.stringify(command)}; use --help`);
  const allowed = command === 'create' ? createFlags : command === 'preview' ? ['port'] : ['output'];
  const flags = new Map<string,string>(); const positional: string[] = [];
  for (let i=1;i<argv.length;i++) {
    const arg = argv[i]!;
    if (arg === '--') {positional.push(...argv.slice(i+1));break;}
    if (!arg.startsWith('-')) {positional.push(arg);continue;}
    const equals = arg.indexOf('=');
    const key = arg.slice(2,equals < 0 ? undefined : equals);
    if (!arg.startsWith('--') || !allowed.includes(key)) throw new Error(`Unknown option ${arg} for ${command}`);
    if (flags.has(key)) throw new Error(`Duplicate option --${key}`);
    const value = equals < 0 ? argv[++i] : arg.slice(equals+1);
    if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value`);
    flags.set(key,value);
  }
  const expected = command === 'render' ? 2 : 1;
  if (positional.length !== expected || positional.some(p => !p.trim())) throw new Error(`${command} requires ${command === 'render' ? '<project-directory> <composition-id>' : '<directory>'}`);
  const directory = positional[0]!;
  if (command === 'create') return {command, directory,template:flags.get('template') ?? 'title-card',id:flags.get('id'),title:flags.get('title'),brandId:flags.get('brand') ?? 'aurora-finance',styleId:flags.get('style') ?? 'cinematic',motionId:flags.get('motion') ?? 'elegant'};
  if (command === 'preview') {
    const value = flags.get('port');
    if (value && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535)) throw new Error('--port must be an integer in [1,65535]');
    return {command,directory,port:value ? Number(value) : undefined};
  }
  const output = flags.get('output');
  if (!output) throw new Error('render requires --output <new-file.mp4>');
  return {command:'render',directory,compositionId:positional[1]!,output};
}
export const help = `code-to-video — local project tools

  create <directory> [--template title-card|explainer]
    [--id MyProject] [--title "Project title"]
    [--brand aurora-finance|ember-studio]
    [--style cinematic|minimal] [--motion elegant|energetic]
  preview <project-directory> [--port 3000]
  render <project-directory> <composition-id> --output <new-file.mp4>
  --help | --version

Templates: title-card (TitleCard, 6 seconds), explainer (ThreePointExplainer, 8 seconds).
Copy is labeled SAMPLE COPY. Create never overwrites an existing directory or installs packages.
Selected project source is trusted code. Studio Save edits a disposable generated entry.
`;
