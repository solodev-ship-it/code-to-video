# Existing Phase 3C baseline approval — human only

No approval is performed by this document. Do not run all commands blindly or invent a reviewer/review reason. Review each full-resolution image, motion state, typography/contrast findings and environment first; reject/revise a candidate if needed.

The existing unchanged 14-case capture is `phase3d1-final-all-visual`, indexed by `tests/visual/reports/phase3d1-final-all-visual-capture.json`; original PNGs are under `tests/visual/current/phase3d1-final-all-visual/`. The existing review package is `renders/review-packages/phase3d1-human-review/` (full-resolution copies, contact sheets, notes, `manifest.json`, `SHA256SUMS.txt`). No duplicate candidate/reference set is needed. New glass screenshots are separate, not part of these 14 commands.

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
