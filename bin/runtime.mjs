// Plain JavaScript: diagnose unsupported Node before importing compiled tooling.
export function runtimeReport({nodeVersion, npmVersion, platform, arch}) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(nodeVersion);
  const nodeSupported = Boolean(match && (
    (Number(match[1]) === 24 && Number(match[2]) >= 7) ||
    (Number(match[1]) === 26 && Number(match[2]) >= 13)
  ));
  const npmSupported = npmVersion === undefined ? null : /^11\.\d+\.\d+$/.test(npmVersion);
  return {
    node:nodeVersion, npm:npmVersion ?? 'not detected (direct Node invocation)',
    platform, arch, nodeSupported, npmSupported,
    supported:'Node >=24.7.0 <25 || >=26.13.0 <27; npm >=11 <12',
    tested:'Node 24.7.0 and 26.13.0 + npm 11; see docs/NODE_COMPATIBILITY.md for installed render evidence and platform limits',
    experimental:'Node 22 and unlisted majors are not supported; Node 26 other-platform rendering requires separate qualification',
    guidance:'Use Node 24.7+ within 24.x or Node 26.13+ within 26.x, with npm 11. No downgrade is needed on supported Node 26. See docs/ONBOARDING.md.',
  };
}
export function npmFromUserAgent(agent) {
  return /(?:^|\s)npm\/(\d+\.\d+\.\d+)(?:\s|$)/.exec(agent ?? '')?.[1];
}
