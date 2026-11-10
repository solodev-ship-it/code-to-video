# CLI and production templates

The optional local `code-to-video` CLI creates an independent schema version 1 project, opens it in Remotion Studio and renders an MP4. Two authored templates are included. The original fifteen showcases and npm Studio/render workflows remain available. This is local working software; registry publishing waits for the release milestone.

The later [end-to-end gate](END_TO_END_QA.md) installs from the lockfile in a clean source copy and renders an edited external sample. Host commands now forward an explicit `REMOTION_BROWSER_EXECUTABLE` to Remotion CLI; upstream CLI does not read that variable itself. Configure it during setup to reuse a provisioned browser. Without it, normal CLI browser-cache/setup behavior is unchanged.

## Use the local checkout

Use the existing Node 24.7+/npm 11 installation and framework dependencies/browser. Build the Node entry once, and rebuild it after editing CLI/host code:

```sh
npm run build:cli
npm run cli -- --help
npm run cli -- create ../video-projects/my-explainer --template explainer --brand ember-studio --style minimal
npm run cli -- preview ../video-projects/my-explainer --port 3014
npm run cli -- render ../video-projects/my-explainer ThreePointExplainer --output ../video-projects/my-explainer/outputs/first-v1.mp4
```

The parent directory must already exist. Creation refuses an existing destination (including an empty directory), symlinks into the framework and invalid theme selections. It validates all data and reads the template before the first project write. It never installs packages, initializes Git or overwrites existing project files. If an I/O error interrupts creation, the error names the partial directory and leaves its contents for inspection; invalid themes/arguments produce no directory.

For a title card, use `--template title-card` (the default) and render composition `TitleCard`. `--id MyProject` selects the manifest id; otherwise the directory basename must be a valid id. `--title "Project title"` changes the project metadata title; edit scene copy in the manifest. Unknown or duplicate flags fail. Preview accepts only an optional integer `--port` in [1,65535]. All relative paths resolve from the caller's working directory.

The executable can also run from another directory:

```sh
node /absolute/path/to/code-to-video/bin/code-to-video.mjs preview .
node /absolute/path/to/code-to-video/bin/code-to-video.mjs render . TitleCard --output outputs/title-v1.mp4
```

`code-to-video` is the registered package binary name. **The package is still private and unpublished.** Do not use a registry `npx code-to-video` command as if this implementation had been released. The intended public spelling is `npx code-to-video create ...` after the package has passed its release/install gate; only local execution is claimed here.

## Templates

| Template | Composition | Defaults | Structure |
| --- | --- | --- | --- |
| `title-card` | `TitleCard` | 1920×1080, 30 FPS, 180 frames / 6 seconds | Opening label, accent rule, title/subtitle and footer |
| `explainer` | `ThreePointExplainer` | 1920×1080, 30 FPS, 240 frames / 8 seconds | Header, three numbered cards and footer |

The manifest contains explicitly labeled **SAMPLE COPY** with no factual production claims. Review and replace it before publishing. Both templates use existing semantic colors, typography, surfaces, layout and frame/FPS motion; they do not branch on brand/style ids. An explicit `reducedMotion` prop switches existing entrance motion to its reduced form. There are no media downloads, font files, music or optional AI packages. Existing system-font stacks are not a cross-machine guarantee. Different dimensions, extreme themes and longer copy require authored layout review; there is no automatic fitting.

Theme flags select the existing registry: `--brand aurora-finance|ember-studio`, `--style cinematic|minimal`, `--motion elegant|energetic`. Defaults are Aurora/Cinematic/Elegant. Custom typed theme registration remains the project loader's explicit startup API; the scaffold does not invent another theme language.

Creation writes the manifest, `compositions/<id>.tsx`, `assets/README.txt`, a local TypeScript configuration, README and ignore rules. The project needs no package installation for this local workflow. Its tsconfig resolves against the selected framework; update that tooling path if the project or framework moves. Asset files stay in the project and are listed by id in the manifest.

## Preview, render and trust boundaries

The CLI calls the same `scripts/project-host.ts` used by the existing project npm scripts. Root selection, theme validation, containment, asset staging and literal Studio registrations remain shared. The manifest schema version and fields are unchanged; no migration occurs. See [project infrastructure](PROJECT_INFRASTRUCTURE.md).

Preview adds project compositions to the existing showcases. Studio Save modifies a disposable generated entry; persist desired changes explicitly in the source manifest before restarting. The CLI does not implement a project editor. Studio still uses upstream network behavior described in the [README](../README.md).

Render requires an explicit manifest composition id and `--output <new-file.mp4>`. CLI output may be outside the framework; output inside the framework must resolve under ignored `renders/`. Existing files and dangling output symlinks fail; canonicalized ancestors cannot escape those framework restrictions. H.264/yuv420p, concurrency 1, parallel encoding off and overwrite off remain fixed. The older `npm run render:project` retains its framework `renders/` restriction.

Selecting an external project authorizes executing its trusted scene/theme source. JSON validation does not sandbox executable code or verify media rights. Projects do not import management files, AI providers or private workspace state. No uploads, publishing or network content fetches are added.

## Build and package boundaries

- `scripts/cli.ts` and `scripts/cli/` contain Node-only argument handling, scaffolding and template metadata. `scripts/project-host.ts` is shared host orchestration. None is imported by browser UI entry points.
- `bin/code-to-video.mjs` loads compiled JavaScript under ignored `dist/`. The existing TypeScript compiler rewrites relative `.ts` imports to `.js`; installed Node packages therefore need no native TypeScript stripping for this CLI graph. No dependency was added.
- Root `package.json` defines `bin`, a `files` allowlist and a build-only `prepack` script. `npm pack --dry-run --json --ignore-scripts` after building audits the source/compiled artifact without publishing it. The allowlist excludes productions, management files, secrets, caches and render outputs. `package-lock.json` adds matching binary metadata only; dependency names/versions remain unchanged.
- This package layout is preparatory. Published dependency installation, workspace flattening, independent consumer installs, licensing/versioning and release distribution are still RELEASE_V1 work. A clean install of a packed archive is not claimed. Local creation/preview/render uses this checkout's existing pinned dependency installation.

## Validation and review

`npm run check` remains browser-free: strict TypeScript (including template source), existing tests, 38 CLI tests and Studio extraction/save checks. CLI tests exercise both templates across Aurora/Ember × cinematic/minimal, manifest loading, generated default-prop extraction/save, unknown themes/flags, existing-file preservation and output symlink containment.

`npm run qa:templates` is a separate focused renderer gate. It builds the CLI, creates two projects in a temporary directory outside the framework, typechecks them, renders each through the compiled CLI, probes/counts frames, fully decodes each MP4, discovers its composition, captures entry/settled frames and independently repeats the settled frame with exact comparison. It preserves logs, source snapshots, PNGs, MP4s and a report under unique ignored `renders/template-checks/templates-*`; only its temporary fixture is removed. This suite neither approves baselines nor downloads a browser; install/cache the browser during setup first.

Executed results and the exact review artifacts are recorded below. Human template/sample review and earlier visual baseline approvals remain separate from technical checks. Full `qa:all` and unchanged material suites are not required for this scoped CLI/template gate; no aggregate pass is claimed.


## Executed evidence — November 10, 2026

Framework HEAD is `fad0909` plus preserved uncommitted infrastructure work and this CLI milestone. No dependency installation was performed.

- Final `npm run check` exited 0: strict TypeScript (including CLI/host/QA/template source), **290 tests** (252 existing plus 38 CLI) and fourteen existing Studio extraction/save checks.
- `npm run build:cli` exited 0. The first build had exited 2 on help/version discriminant narrowing; that issue was corrected before the passing build and checks. Manifest schema version 1 was not changed.
- `npm run compositions` exited 0 with the original fifteen compositions. `npm run qa:templates` exited 0; each temporary generated project additionally discovered its own composition and passed independent TypeScript checking.
- Title card: Aurora/Cinematic, H.264 **1920×1080, 30 FPS, 180 frames / 6 seconds**, 405,720 bytes. Explainer: Ember/Minimal, H.264 **1920×1080, 30 FPS, 240 frames / 8 seconds**, 423,071 bytes. Both passed full ffmpeg decode. Each entry differed from its settled frame; independently repeated settled frames had **zero differing pixels**.
- Compiled CLI help passed. Unknown-brand creation exited 1 with the specific unknown-brand error and no destination directory. An overwrite attempt exited 1 with `Output already exists`; the existing MP4 SHA-256 remained unchanged.
- Compiled CLI preview served HTTP 200 on port 3014; its owned process was stopped intentionally (wrapper exit 1 after SIGTERM). Browser-access host was unavailable, so interactive play/scrub/manual Save remain unverified. Both settled PNGs were inspected for layout; this does not grant human approval.
- Package dry run passed with bin, compiled host and both template sources present; management, productions, credentials, outputs and caches were absent. This verifies archive contents, not a clean installed-package walkthrough.

Named review artifacts: `renders/template-checks/templates-wI3tiC/TitleCard.mp4`, `ThreePointExplainer.mp4`, `title-card-settled.png`, `explainer-settled.png`, `report.json` and `cli-validation.json`. Adjacent logs record the commands, and source snapshots record the generated projects. These files are ignored and unapproved. The temporary original projects were removed by the scoped suite; the existing sibling production example was untouched. Unchanged material suites and `qa:all` were not rerun; pending visual baselines still prevent an aggregate pass claim.
