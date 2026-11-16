# Node compatibility

**Published0.1.1 supports Node24 only.** The0.1.2 candidate adds Node26 without
requiring a downgrade. It is not published yet.

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
Workflow is prepared for six installed OS/runtime jobs and parses locally;
it has not been run on a hosted runner for this change.

Existing0.1.1 Node24 installed checks passed on Linux x64, Windows x64 and macOS
arm64. New Node26 render qualification is scoped to this macOS arm64 environment;
other platforms require their own run. Hosted matrix execution is separate.

## For users

Do not reinstall or downgrade Node globally. Published0.1.1 still rejects Node26;
an updated source/local archive is required until0.1.2 is released.
The [published quickstart](ONBOARDING.md) remains on0.1.1.
