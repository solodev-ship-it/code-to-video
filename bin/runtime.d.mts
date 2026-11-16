export function runtimeReport(input: {nodeVersion:string; npmVersion?:string; platform:string; arch:string}): {
  node:string; npm:string; platform:string; arch:string; nodeSupported:boolean; npmSupported:boolean|null;
  supported:string; tested:string; experimental:string; guidance:string;
};
export function npmFromUserAgent(agent: string | undefined): string | undefined;
