# Version and manifest compatibility — preparation policy

- Current framework/package/workspaces remain **0.1.0** and private. A public v1 version/tag/name has not been selected or authorized.
- Project manifest **schemaVersion: 1** is distinct from npm package version. It has explicit fields and rejects unknown fields/versions; no implicit migration exists.
- Current implemented framework requirement accepts **exact `0.1.x` strings**, not semver ranges such as `^0.1.0`, and the running engine must also be `0.1.x`. Unknown major/minor cohorts fail before staging/rendering. See `packages/projects/src/manifest.ts` and project/CLI tests.
- Existing manifests are not edited during install, preview or render. Creation records the selected engine version; generated tooling paths may need updating if project/framework locations move.
- Proposed v1 promise: preserve schema 1 data or supply an explicit reviewed migration; do not silently reinterpret motion/timing/theme IDs or remove composition IDs. Breaking package APIs require a documented major-version decision. This promise is a **proposal until the final v1 version/compatibility decision is approved and tested**.
- Before a future `1.0.0` bump, explicitly decide and implement whether schema-1 `0.1.x` manifests remain accepted. The current validator does not accept a `1.0.x` running engine. Merely changing package.json would break creation/loading; preparation intentionally refuses such a candidate bump.
- Candidate source, lockfile, browser/runtime, props/assets and outputs are revision/hash-bound. Passing one environment is not cross-machine pixel equality. A changed artifact needs renewed review; prior approval is not a global release flag.
