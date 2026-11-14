# Existing Phase 3C baseline approval — human only

## Current checkpoint — November 14, 2026

The owner reviewed the fourteen PNGs from `e2e-resume-1794318265833-visual`, accepted them and explicitly authorized installing them as official references. Fourteen PNG/JSON pairs are now in `tests/visual/baselines/`, with reviewer, reason, source hash and original capture environment. No existing baseline was replaced. Original reviewed files/reports remain in the retained end-to-end snapshot; byte-identical copies are under `tests/visual/current/e2e-resume-1794318265833-visual/`.

Exact comparison of that stored capture passed all fourteen cases, zero differing pixels and no capture-to-baseline environment drift. This is not a fresh render or `qa:all` run. File-only installation/comparison used active Node26; original capture evidence remains Node24.7/Chromium158/macOS arm64. Supported Node24 is required before fresh release validation.

Follow-up: isolated Node24.7/npm11.18 has since been provisioned for this checkout, and scoped-consumer render validation passed under that supported runtime. The baseline installation/comparison above remains stored-capture evidence, not a new full aggregate run.

```sh
npm run qa:visual:compare -- --run e2e-resume-1794318265833-visual
```

Do not rerun approval or use `--replace` merely because references now exist. Revisions need renewed human review.

## Historical first-approval instructions (not the current reviewed run)

No approval is performed by this document. Do not run all commands blindly or invent a reviewer/review reason. Review each full-resolution image, motion state, typography/contrast findings and environment first; reject/revise a candidate if needed.

The earlier 14-case capture was `phase3d1-final-all-visual`, indexed by `tests/visual/reports/phase3d1-final-all-visual-capture.json`; original PNGs are under `tests/visual/current/phase3d1-final-all-visual/`. Its review package is `renders/review-packages/phase3d1-human-review/` (full-resolution copies, contact sheets, notes, `manifest.json`, `SHA256SUMS.txt`). These historical instructions do not authorize replacing the current approved references. New glass screenshots are separate, not part of these 14 commands.

The CLI requires `--run`, `--case`, nonempty `--reviewer` and `--reason`. It verifies case identity, captured PNG hash/dimensions, environment evidence, nonfailed status, no critical layout findings, a 2 MiB/image limit and a 20 MiB reference budget. Existing destinations are refused without explicit `--replace`; do not use replacement for first approval. PNG/metadata writes are sequential, not transactional: inspect both after any human-authorized operation. See [the reliability guide](RENDERING_RELIABILITY.md#explicit-human-approval).

Run from `code-to-video` **only after human acceptance of the named image**. Before each accepted case, set `REVIEWER` to the actual human identity and `REASON` to that human's truthful, case-specific review reason. The guards below refuse empty/unset values; they are not a substitute for human review. No values are supplied here.

```sh
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case aurora-finance-cinematic-f15 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case aurora-finance-cinematic-f90 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case aurora-finance-cinematic-f260 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case aurora-finance-minimal-f15 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case aurora-finance-minimal-f90 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case aurora-finance-minimal-f260 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-cinematic-f15 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-cinematic-f90 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-cinematic-f260 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-minimal-f15 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-minimal-f90 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-minimal-f260 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case intro-settled --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case component-settled --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
```

Comparison of the existing capture needs no rerender:

```sh
npm run qa:visual:compare -- --run phase3d1-final-all-visual
```

Before approval this intentionally exits nonzero for missing references. After human approval, comparison must still reject pixel differences, metadata/hash errors and environment drift. Do not rerun the full rendering pipeline merely because approval is pending.
