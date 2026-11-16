// Plain JavaScript: diagnose unsupported Node before importing compiled tooling.
export function runtimeReport({nodeVersion, npmVersion, platform, arch}) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(nodeVersion);
  const nodeSupported = Boolean(match && Number(match[1]) === 24 && Number(match[2]) >= 7);
  const npmSupported = npmVersion === undefined ? null : /^11\.\d+\.\d+$/.test(npmVersion);
  return {
    node:nodeVersion, npm:npmVersion ?? 'not detected (direct Node invocation)',
    platform, arch, nodeSupported, npmSupported,
    supported:'Node >=24.7.0 <25; npm >=11 <12',
    tested:'Node 24.7.0 + npm 11.18.0; rendering macOS Apple Silicon',
    experimental:'Node 22/26 and other operating systems require their own checks; not declared supported',
    guidance:'Use a project-local/version-managed Node 24 and npm 11. Do not change global installations automatically. See docs/ONBOARDING.md.',
  };
}
export function npmFromUserAgent(agent) {
  return /(?:^|\s)npm\/(\d+\.\d+\.\d+)(?:\s|$)/.exec(agent ?? '')?.[1];
}
