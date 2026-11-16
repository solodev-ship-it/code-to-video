# Node compatibility

**Published0.1.1 supports Node24 only.** The0.1.2 candidate adds Node26 without
requiring a downgrade. It is not published yet. Development and release work
are paused at the owner's request on November 16, 2026.

Candidate requirements:

- Node **24.7+ within24.x** or **26.13+ within26.x**.
- npm **11.x**.
- Older Node26 minors, Node22/25/27 and prereleases remain rejected.

## Qualification

Local implementation and qualification pass:

| Runtime | Source check | Installed public CLI |
| --- | --- | --- |
| Node24.7.0 / npm11.18.0 | 327 tests, strict TypeScript,14 Studio checks | Pass |
| Node26.13.0 / npm11.20.0 | 327 tests with npm11.18.0 | Pass with npm11.20.0 |

The same0.1.2 archive passes offline dependency install, npm-exec doctor/version/
create, generated-project typecheck, HTTP Save, graceful flush, actual restart,
unchanged project sources and saved-props H2641280×720/30FPS/60-frame render/full
decode. This uses the public binary, not the earlier internal-main bypass.
Existing browser reused; esbuild install-script review warnings remain visible.

Evidence: `renders/runtime-probes/node26-compat-fji1e4/` and
`renders/release-checks/candidate-oarO0w/persistence-check-BzXQag/report.json`
(Node24), `persistence-check-QKdOEo/report.json` (Node26).
Hosted qualification at commit `7998466` passes standard CI and five installed
jobs on the same candidate: Linux x64 and Windows x64 on both Node versions,
and macOS ARM64 on Node 24.7.0 (npm 11.18.0).

The macOS ARM64 / Node 26.13.0 job could not acquire a runner in three attempts;
no test steps ran. GitHub annotations explicitly identify runner capacity.
The six-job release gate remains incomplete; local evidence does not replace it.
See [standard CI](https://github.com/solodev-ship-it/code-to-video/actions/runs/43862411724)
and [installed platform run](https://github.com/solodev-ship-it/code-to-video/actions/runs/43862432717).
No further retries or publication are scheduled while development is paused.

## For users

Do not reinstall or downgrade Node globally. Published0.1.1 still rejects Node26;
an updated source/local archive is required until0.1.2 is released.
The [published quickstart](ONBOARDING.md) remains on0.1.1.
