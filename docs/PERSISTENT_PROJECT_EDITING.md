# Persistent project props and runtime readiness

**November16 preparation:** the next scoped preview artifact is **0.1.1**, staged with
`npm run release:pack:preview -- --preview-version 0.1.1`. It is not published.
The existing0.1.0 package/tag is unchanged. Owner confirmed title/label persistence
after refresh; all nine hosted source/build probes pass at ba9435b. Installed
platform rendering qualification is in progress; see [preview testing](PREVIEW_TESTING.md).

## November 15, 2026 — source and local candidate, not published

The current source adds durable **content-prop** editing for selected projects.
Published `@krungtech/code-to-video@0.1.0` is unchanged: it still has the
[historical Save containment bug](STUDIO_SAVE_FIX.md) and no project persistence.
The earlier local containment-only fix was session-only; this delivery extends it.

### What saves

Run the CLI's `preview <project>` (or the root selected-project Studio runner).
In Studio's Schema editor, text edits commit when the field loses focus.
The host watches the generated entry, parses literal defaultProps using pinned
Remotion codemods **without executing the source**, validates them against the
existing project data contract and writes `studio-props.json` in the selected
project. This file contains composition content props and a manifest SHA256.

Preview, composition discovery and render load those saved props. Keep
`studio-props.json` with the project; it is not a cache. The original
`code-to-video.project.json` and `compositions/*.tsx` are not rewritten.
Persisted props replace each saved composition's content-prop object; they are
not an arbitrary recursive merge or a new theme language.

### Commit timing and limits

- Wait for **`Project props saved: .../studio-props.json`** in the host terminal
  before launching a separate render. The watcher interval is100ms; Studio's own
  autosave response precedes the project-side write.
- Graceful host stop flushes the latest entry before releasing the writer lock.
  Force-kill, crash or power loss can interrupt a pending save. The generated
  entry and recovery copies may help recovery; they do not guarantee crash-proof
  persistence or successful disk writes.
- Theme and asset inputs belong to the manifest; changing them in Studio fails
  persistence visibly. Metadata changes (dimensions/FPS/duration) are
  **session-only**, not saved to this props file. No general project editor,
  scene-source editing or arbitrary JSON-to-code round trip is implemented.
- Generic schema validation cannot prove a custom scene's content requirements,
  layout, factual accuracy or rights. Custom scene validators/render QA still
  apply. Changed copy/assets require renewed creative/factual approval.

### Conflict and recovery rules

One cooperating preview writer per project is enforced through
`.code-to-video/preview.lock`. A second preview fails with instructions rather
than silently racing. A stale lock after force termination is not automatically
removed: verify its PID and that the owner process has stopped first.

Each replacement saves the prior sidecar to
`.code-to-video/props-backup-<id>.json`, writes a unique temporary file, fsyncs it,
rechecks the manifest/sidecar and atomically renames it over the sidecar.
This is not an OS transaction spanning Studio and the sidecar. External editors
do not honor the preview lock; a last-instant uncooperative external-write race
cannot be ruled out. Do not edit project data concurrently with preview.
Symlink state paths are rejected; this is not an executable-code sandbox.

If the source manifest changes, saved overrides are stale—even for formatting
changes because the binding uses exact source bytes. Stop preview, review/merge
the intended content, and explicitly move `studio-props.json` aside before
restarting. No automatic deletion/rebase or silent discard occurs.

Invalid data, changed sidecars/manifests and write failures stop preview with a
nonzero outcome and a terminal error. A best-effort copy of the last generated
entry is retained under `.code-to-video/unsaved-<id>.tsx`. Read the error and
inspect recoverable files; never assume Studio's autosave badge means durable
project persistence succeeded.

New scaffolds ignore `.code-to-video/` and temporary props files, **not**
`studio-props.json`. For existing projects, decide the same ignore rules
explicitly; the framework does not overwrite their `.gitignore`.
Backups accumulate; no automatic cleanup/delete feature is added.

## Runtime diagnostics and compatibility

```sh
# Built source checkout, using the supported Node24/npm11 shell:
npm run cli -- doctor
# Installed local candidate:
code-to-video doctor
```

The plain-JavaScript binary checks runtime versions before importing compiled
tooling. Unsupported Node versions or detected unsupported npm versions fail
operational CLI commands with setup guidance. Doctor/help/version remain
diagnostic paths. Direct `node` invocation may have no npm user-agent; doctor
reports npm **unknown**, not tested or implicitly installed.
Calling internal source APIs is not the guarded user-facing binary.

| Combination | Evidence / status |
| --- | --- |
| Node24.7.0 + npm11.18.0, macOS arm64 | Supported setup; source check and isolated installed persistence/restart/render/decode pass |
| Node22.23.5 + npm11.18.0, macOS arm64 | Experimental source check and isolated installed internal-CLI persistence/restart/render/decode probe pass; public binary remains guarded |
| Node26.13.0 + npm11.18.0, macOS arm64 | Experimental source check and isolated installed internal-CLI persistence/restart/render/decode probe pass; public binary remains guarded |
| Windows/Linux and other architectures | Hosted experimental matrix prepared, not executed for this revision; no rendering certification |

Declared engines stay **Node >=24.7.0 <25**, **npm >=11 <12**.
Node20/21/23 are end-of-life as of November2026 and are not new support targets.
The local Node22 probe was obtained from official HTTPS distribution, SHA256
verified, and installed only under ignored `.cache/toolchains`; no global
Node/npm, shell profile or system account configuration was changed.

`.github/workflows/compatibility.yml` is a manual read-only source-check matrix
for maintained Node22/24/26 on Ubuntu/macOS/Windows, npm11.18.0. It does not install
browsers, render, publish, or change approvals. Passing fast checks would still
not establish installed-user/render support. The normal release workflow remains
pinned to Node24.7.0/npm11.18.0.

## Executed checks

**Final recovery hardening:** recovery copies also recheck the control-directory
containment, with a swapped-symlink rejection test. Final324-test source checks
pass on24/22/26. The resulting local candidate `candidate-Wtnfw2`
(SHAc0517058784c5555efeb8e2b6d4891b23de9b3faa172c5c1ec9864bb040a8ebe)
passes separate installed gates again: `persistence-check-3nhzZQ` (24 public
binary), `persistence-check-Ba9OQu` (22 experimental internal driver),
`persistence-check-KwZQ7B` (26 experimental internal driver).
Earlier candidate/probe records below are retained history; they do not silently
validate changed recovery code. No global/runtime-support/publication change.

- Node24.7.0/npm11.18.0: `npm run check` passes strict TypeScript,
  **324 tests**, fourteen existing Studio extraction/in-memory Save checks.
- Same source checks pass experimentally under Node22.23.5 and Node26.13.0
  with npm11.18.0 on this Mac; warning logs are retained.
- Persistence tests cover watcher autosave, graceful flush, reload/render
  preparation, backups, writer conflicts, manifest/sidecar changes, reserved
  inputs, invalid schema/unsafe/computed data and symlink rejection.
- Local scoped candidate `candidate-0pNNlQ` installs outside the workspace.
  `npm run qa:persistence -- <candidate-report>` passes actual HTTP Save, stop
  flush, real Studio restart with saved title, unchanged manifest/scene, render
  entry props, H2641280×720/30FPS/60-frame MP4 and full ffmpeg decode.
  Initial QA harness failed a macOS `/var`/`/private/var` relative-path mismatch;
  canonicalized its consumer root and preserved the failed report.
- Experimental `qa:persistence -- <report> --probe-runtime` also passes separate
  offline installs, HTTP persistence/restart and real MP4/decode under Node22 and
  Node26 on this Mac. It uses an external QA-only driver calling installed
  internal `main`, **not** the guarded public binary. The gate first verifies
  the public binary still rejects the unsupported runtime. No bypass/override
  is added to user-facing commands or shipped runtime policy.
- Existing pinned codemods4.0.541 is now declared directly for host parsing;
  all lockfile package versions/integrities remain identical. No dependency
  upgrade/new transitive package was installed.
- Doctor reports the supported setup. An injected npm10 user-agent is rejected
  before project creation with an explicit runtime error; no destination created.
- Workflow YAML parses locally. Hosted matrix/manual persistent-editor review
  remain pending. No full/material/baseline suite or new registry release claimed.

Focused evidence: `renders/release-checks/candidate-0pNNlQ/persistence-check-M21w44/report.json`;
runtime logs and official Node22 hash record under `renders/runtime-probes/`.
Experimental installed probe reports are sibling
`persistence-check-dWvJHb/report.json` (Node22) and
`persistence-check-HJZUKy/report.json` (Node26).

## Next gate

Human persistent-edit review on the new local candidate, then actual hosted OS
matrix evidence and a decision on promoting the experimental22/26 Mac evidence
into public binary support.
Broaden declared engines only after that evidence, not by editing a version range
alone. A release/commit/push remains a separate owner decision.
