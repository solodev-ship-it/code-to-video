import path from 'node:path';
import type {loadProject} from '../packages/projects/src/load.ts';
// Literal registrations preserve pinned Studio extraction. Never interpolate data as executable text.
export function projectEntry(project: Awaited<ReturnType<typeof loadProject>>, frameworkRoot: string, themeModule?: string): string {
  const q = JSON.stringify;
  const assets = Object.fromEntries(project.manifest.assets.map(a => [a.id, `project-assets/${a.path}`]));
  const imports = project.manifest.compositions.map((c,i) => `import Scene${i} from ${q(project.compositions[c.id])};`).join('\n');
  const wrappers = project.manifest.compositions.map((_,i) => `function ProjectScene${i}(props: ComponentProps<typeof Scene${i}> & ProjectInputs) {
    const theme = useMemo(() => resolveTheme(registry, {schemaVersion: 1, brandId: props.brandId, styleId: props.styleId, motionId: props.motionId}), [props.brandId, props.styleId, props.motionId]);
    return <VideoThemeProvider theme={theme}><Scene${i} {...props} /></VideoThemeProvider>;
  }`).join('\n');
  const registrations = project.manifest.compositions.map((c,i) => {
    const props = {...c.props, ...project.manifest.theme, assets};
    return `<Composition id=${q(c.id)} component={ProjectScene${i}} width={${project.manifest.width}} height={${project.manifest.height}} fps={${project.manifest.fps}} durationInFrames={${c.durationInFrames}} defaultProps={${q(props)}} calculateMetadata={({props}) => { resolveTheme(registry, {schemaVersion: 1, brandId: props.brandId, styleId: props.styleId, motionId: props.motionId}); return {props}; }} />`;
  }).join('\n');
  return `// Generated from validated project data. Studio saves edit this disposable file only.
import {useMemo} from 'react';
import type {ComponentProps} from 'react';
type ProjectInputs = {brandId: string; styleId: string; motionId: string; assets: Record<string,string>};
import {Composition, registerRoot} from 'remotion';
import {RemotionRoot} from ${q(path.join(frameworkRoot,'apps/studio/src/Root.tsx'))};
import {resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider} from '@code-to-video/themes/react';
import {createProjectRegistry} from ${q(path.join(frameworkRoot,'packages/projects/src/registry.ts'))};
${themeModule ? `import {registerThemes} from ${q(themeModule)};` : ''}
${imports}
const registry = createProjectRegistry(${themeModule ? 'registerThemes' : ''});
${wrappers}
function ProjectRoot() {return <><RemotionRoot />${registrations}</>;}
registerRoot(ProjectRoot);
`;
}
