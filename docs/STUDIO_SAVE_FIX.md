# Selected-project Studio Save containment

**Later follow-up:** [persistent project editing](PERSISTENT_PROJECT_EDITING.md)
extends the source/local candidate with project-owned saved content props.
The session-only behavior below describes the earlier containment-only candidate;
published0.1.0 remains unchanged.

## November 15, 2026 — source fix, not a published update

The published `@krungtech/code-to-video@0.1.0` preview can display
“Cannot update default props in a file outside the project” for a selected
external project's composition. The scene can preview even when Save is blocked.
HTTP readiness and in-memory codemod tests did not cover this failure.

The host runs Remotion from `apps/studio`, its nearest package root, but formerly
generated the editable entry in the package-level `.cache/projects`. That entry
was outside Studio's permitted write root.

The source fix stages selected-project **Studio** sessions in
`apps/studio/.cache/projects/session-*`. Composition discovery/render staging,
the original showcase entry, public-asset selection and CLI working directory
are unchanged. Remotion's containment check is not disabled or patched.

**Save remains session-only.** It changes a disposable generated registration,
not the external manifest or scene. Starting another preview regenerates defaults
from `code-to-video.project.json`. Persist intended props explicitly in that
manifest. This fix does not implement a project editor or round-trip persistence.

## Executed checks

- The new host/server regression first reproduced the exact outside-project
  rejection, then passed with the fix.
- `npm run check`: strict TypeScript, **311 tests** and fourteen original
  Studio extraction/in-memory Save checks pass.
- Regression uses actual pinned Remotion root discovery, can-update and Save
  handlers with a real file-watcher registry, not just an in-memory codemod.
  It verifies changed generated-file props, unchanged manifest/scene,
  outside-root rejection and fresh-session default regeneration.
- A local scoped archive was packed and offline-installed outside the framework.
  Its Studio returns HTTP200. Actual HTTP Save writes a changed title;
  outside-root HTTP Save returns the expected causal rejection. Manifest and
  scene remain unchanged, original session props are restored, and a fresh
  installed host session regenerates the manifest defaults.
- Initial unscoped candidate offline install failed `ENOTCACHED` for Babel
  helper-module-transforms7.29.14. The scoped candidate uses the existing
  source-lock-bound7.29.13 constraint and installs successfully. No dependency
  versions or constraints were changed for this fix.
- Initial standalone-handler test lacked Studio's file-watcher registry; after
  proper initialization, disk writes are verified. Initial HTTP verifier checked
  the transport success envelope rather than nested handler result; corrected
  to validate both and assert disk contents and causal negative evidence.

Ignored local evidence: `renders/studio-save-fix/installed-report.json`,
`renders/studio-save-fix/*install.log`,
`renders/release-checks/candidate-4jqZfz/report.json`.

**Manual browser recheck is pending.** No visual/full/material suite, baseline
replacement, publication, tag, dependency patch or automatic persistence claim.
The local candidate is not a new registry release: immutable published0.1.0
remains unchanged and retains this known Save bug.
