import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// Diagnostic only: test the exact extractor shipped with the pinned CLI.
// This transitive internal API is intentionally not a rendering dependency.
const require = createRequire(import.meta.url);
const {CodemodsInternals, setCompositionDefaultProps, applyCodemodChanges} = require('@remotion/codemods');
const file = fileURLToPath(new URL('../apps/studio/src/Root.tsx', import.meta.url));
const rootDir = fileURLToPath(new URL('../apps/studio', import.meta.url));
const source = readFileSync(file, 'utf8');
const oldPattern = `const Root = () => ['ThemeEmberMinimal'].map((id) => <Composition id={id} defaultProps={selection} />);`;
const old = CodemodsInternals.computeCanUpdateDefaultPropsFromContent(oldPattern, 'ThemeEmberMinimal');
assert.equal(old.canUpdate, false);
assert.match(old.reason, /Could not find or extract defaultProps/);

for (const id of ['ThemeShowcase', 'ThemeAuroraCinematic', 'ThemeAuroraMinimal', 'ThemeEmberCinematic', 'ThemeEmberMinimal',
  'ComponentShowcase', 'ComponentAuroraCinematic', 'ComponentEmberMinimal', 'ReliabilityFixture', 'GlassmorphismShowcase', 'DynamicIslandShowcase', 'DataVisualizationShowcase', 'ClaymorphismShowcase', 'AdvancedEffectsShowcase']) {
  const result = CodemodsInternals.computeCanUpdateDefaultPropsFromContent(source, id);
  assert.equal(result.canUpdate, true, `${id}: ${result.reason ?? 'cannot edit defaults'}`);
  const project = {rootDir, files: {[file]: source}};
  const props = {...result.currentDefaultProps, motionId: result.currentDefaultProps.motionId === 'elegant' ? 'energetic' : 'elegant'};
  const edits = setCompositionDefaultProps({project, compositionFile: file, compositionId: id, defaultProps: props});
  const updated = applyCodemodChanges(project, edits.changes);
  assert.equal(edits.changes.length, 1, 'Saving changed props should edit exactly one source file in memory.');
  const after = CodemodsInternals.computeCanUpdateDefaultPropsFromContent(updated.files[file], id);
  assert.equal(after.canUpdate, true);
  assert.deepEqual(after.currentDefaultProps, props);
}
assert.equal(readFileSync(file, 'utf8'), source, 'Save-path checks must not modify real source.');
console.log('PASS: reproduced old dynamic-registration warning; all fourteen literal theme/component/QA/material/chart/clay registrations support extraction and in-memory default-props saving. No source files were written.');
