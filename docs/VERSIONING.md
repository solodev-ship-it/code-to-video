# Version and manifest compatibility — preparation policy

**November16 publication checkpoint:** scoped **0.1.1** is published and registry `latest`.
Exact downloaded archive, installed Save/restart/render and full decode pass.
See [release evidence](RELEASE_V1.md). Immutable archives and source-root version are unchanged.
Owner confirmed title/label persistence after refresh. All nine source/build probes
pass at ba9435b. The same0.1.1 archive passes installed create/typecheck, HTTP Save,
graceful stop/restart, saved-input720p30 render and full decode on Linux x64,
Windows x64 and macOS arm64 at5823e32 ([hosted run](https://github.com/solodev-ship-it/code-to-video/actions/runs/43806163663)).
Node24/npm11 remains the supported setup. See [tester instructions](PREVIEW_TESTING.md).

November 14 decision: the first public target is **@krungtech/code-to-video@0.1.0 preview**, preserving the existing 0.1.x compatibility cohort, not a 1.0 metadata bump. Source root stays private/unscoped; a separate `release:pack:preview` staging mode provides the scoped public artifact and refuses an unselected preview version. Earlier “not selected” statements below describe the initial preparation checkpoint. The npm distribution name is separate from the manifest's logical `framework.name: "code-to-video"` contract, which remains unchanged. Existing schema-1 0.1.x projects continue under the same validator; no migration or stable-1.0 promise is introduced.

- Current framework/package/workspaces remain **0.1.0** and private. A public v1 version/tag/name has not been selected or authorized.
- Project manifest **schemaVersion: 1** is distinct from npm package version. It has explicit fields and rejects unknown fields/versions; no implicit migration exists.
- Current implemented framework requirement accepts **exact `0.1.x` strings**, not semver ranges such as `^0.1.0`, and the running engine must also be `0.1.x`. Unknown major/minor cohorts fail before staging/rendering. See `packages/projects/src/manifest.ts` and project/CLI tests.
- Existing manifests are not edited during install, preview or render. Creation records the selected engine version; generated tooling paths may need updating if project/framework locations move.
- Proposed v1 promise: preserve schema 1 data or supply an explicit reviewed migration; do not silently reinterpret motion/timing/theme IDs or remove composition IDs. Breaking package APIs require a documented major-version decision. This promise is a **proposal until the final v1 version/compatibility decision is approved and tested**.
- Before a future `1.0.0` bump, explicitly decide and implement whether schema-1 `0.1.x` manifests remain accepted. The current validator does not accept a `1.0.x` running engine. Merely changing package.json would break creation/loading; preparation intentionally refuses such a candidate bump.
- Candidate source, lockfile, browser/runtime, props/assets and outputs are revision/hash-bound. Passing one environment is not cross-machine pixel equality. A changed artifact needs renewed review; prior approval is not a global release flag.
