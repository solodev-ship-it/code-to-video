"""Build a review-only package; never approves, renders, or replaces a baseline.

Uses the QA host's already-installed Pillow for labeled thumbnails. Full-size
PNGs are copied byte-for-byte. Run from code-to-video with a new output folder.
"""
import hashlib
import html
import json
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
output = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "renders/review-packages/phase3d1-visual-finalization")
output.resolve().relative_to((ROOT / "renders/review-packages").resolve())
output.mkdir(parents=True, exist_ok=False)


def read_report(name):
    return json.loads((ROOT / "tests/visual/reports" / name).read_text())


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


original = read_report("phase3d1-final-all-visual-capture.json")
historical = read_report("phase3d1-surfaces-final-capture.json")
corrected = read_report("phase3d1-review-surfaces-b-capture.json")
contrast = read_report("phase3d1-review-surfaces-b-surfaces.json")
assert len(original["cases"]) == 14
assert corrected["status"] == "passed" and contrast["status"] == "passed"
inventory = []


def copy_case(row, group, run, note):
    source = ROOT / row["artifacts"]["image"]
    assert sha(source) == row["hashes"]["png"], f"Changed source: {source}"
    destination = output / group / (row["case"]["id"] + ".png")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("xb") as target, source.open("rb") as data:
        shutil.copyfileobj(data, target)
    assert sha(destination) == sha(source)
    with Image.open(destination) as image:
        assert image.size == (1920, 1080)
    inventory.append({"id": row["case"]["id"], "group": group, "sourceRun": run,
                      "source": row["artifacts"]["image"], "file": destination.relative_to(output).as_posix(),
                      "sha256": sha(destination), "width": 1920, "height": 1080,
                      "frame": row["case"]["frame"], "humanApproval": "pending", "inspectionNote": note})


for row in original["cases"]:
    frame = row["case"]["frame"]
    note = "No obvious clipping or unintended wrap in inspected pixels. "
    if row["case"]["compositionId"] == "ReliabilityFixture":
        note += {15: "Title is intentionally dim during entrance; do not judge settled readability here.",
                 90: "Settled title and two-card hierarchy fit the selected frame.",
                 260: "Intentional scene fade reduces text and border contrast; not a settled-text contrast sample."}[frame]
        if row["case"]["brandId"] == "ember-studio":
            note += " Legacy coral QUALITY labels remain unchanged and need explicit human contrast review; this glass-only fix does not certify old fixtures."
    else:
        note += "System-font compatibility; manual font portability review remains necessary."
    copy_case(row, "phase3c-originals", original["run"], note)

glass_ids = ["aurora-finance-cinematic-glass-f180", "ember-studio-minimal-glass-f180"]
for report, group in [(historical, "glass-before"), (corrected, "glass-corrected")]:
    for identifier in glass_ids:
        row = next(c for c in report["cases"] if c["case"]["id"] == identifier)
        note = "Historical only: informational kicker/card labels use accent; Ember contrast limitation is documented."
        if group == "glass-corrected":
            note = "Informational labels now use semantic foreground; decorative accent retained. No obvious clipping; minimum contrast tested on exact glyph-hidden backgrounds. Agent inspection is not approval."
        copy_case(row, group, report["run"], note)

# Preserve capture/environment/geometry and contrast evidence beside the images.
evidence = output / "evidence"
evidence.mkdir()
for name in ["phase3d1-final-all-visual-capture.json", "phase3d1-review-surfaces-b-capture.json",
             "phase3d1-review-surfaces-b-surfaces.json", "phase3d1-existing-candidate-equality.json"]:
    shutil.copyfile(ROOT / "tests/visual/reports" / name, evidence / name)

font = ImageFont.load_default(size=18)
small = ImageFont.load_default(size=14)


def sheet(name, rows, columns):
    cell_width, cell_height = 640, 410
    canvas = Image.new("RGB", (columns * cell_width, 64 + ((len(rows) + columns - 1) // columns) * cell_height), "#151a24")
    draw = ImageDraw.Draw(canvas)
    draw.text((20, 16), name + " - UNAPPROVED / REVIEW THUMBNAILS", font=font, fill="white")
    for i, row in enumerate(rows):
        x, y = (i % columns) * cell_width, 64 + (i // columns) * cell_height
        with Image.open(output / row["file"]) as image:
            thumbnail = image.convert("RGB").resize((624, 351), Image.Resampling.LANCZOS)
            canvas.paste(thumbnail, (x + 8, y))
        draw.text((x + 10, y + 356), row["id"], font=small, fill="white")
        draw.text((x + 10, y + 378), row["group"] + " / frame " + str(row["frame"]), font=small, fill="#bbc8db")
    canvas.save(output / name)


for brand in ["aurora-finance", "ember-studio"]:
    sheet("contact-" + brand + ".png", [r for r in inventory if r["group"] == "phase3c-originals" and r["id"].startswith(brand)], 3)
sheet("contact-original-smokes.png", [r for r in inventory if r["group"] == "phase3c-originals" and not r["id"].startswith(("aurora", "ember"))], 2)
sheet("contact-glass-before-after.png", [r for r in inventory if r["group"].startswith("glass")], 2)

review = ["# Phase 3D.1 visual review package", "", "**All images are UNAPPROVED. No approval was performed.**", "",
          "Full-size images are original PNG bytes; contact sheets are resized navigation aids, not references or pixel-comparison inputs.", "",
          "## Inspection inventory", "", "| Candidate | Group | Inspection notes |", "| --- | --- | --- |"]
for row in inventory:
    review.append(f"| [{row['id']}]({row['file']}) | {row['group']} | {row['inspectionNote']} |")
review += ["", "## Contrast correction", "",
           "The kicker and card eyebrow labels carry ordinary information. Only their local semantic treatment changed from accent to foreground; no global theme, shared card API or original Phase 3C scene was modified.",
           "44 rendered combinations / 176 label measurements cover both brands/styles, all four presets, dark/light/grid/checker backgrounds, true blur and fallback, and showcase frames 90/180/299.",
           "The test takes the minimum nominal opaque text-color contrast against every composited pixel in each exact browser-measured label line box, using a matching glyph-hidden render. Visible-ink checks reject missing labels. Antialiased edge coverage, fade entrances and arbitrary new footage are not certified.",
           "Minimum across the stress matrix: Aurora 6.468:1; Ember 6.858:1. The old Ember accent is explicitly rejected by the same 4.5:1 gate.", "",
           "## Review decisions still required", "",
           "- Judge typography, restraint, shadow quality and identity on full-resolution stills, not only thumbnails.",
           "- Review original entrance/fade samples as motion states, not settled-frame contrast promises.",
           "- Legacy Phase 3C Ember coral labels remain historical, unchanged candidates: review or reject explicitly, do not assume the glass correction fixed them.",
           "- System fonts, glyph shaping, other aspect ratios and other renderer backends remain limitations.",
           "- Glass candidates are separate from the original Phase 3C registry; no silent baseline enrollment occurred.", "",
           "See HUMAN_APPROVAL_COMMANDS.md for commands to run only after real human review. Reject/revise a candidate rather than approving an issue to make qa:all green."]
(output / "REVIEW_NOTES.md").write_text("\n".join(review) + "\n")

commands = ["# Human approval commands — NOT EXECUTED", "", "Only after you have individually reviewed and accepted a named original image, run its command from code-to-video. Do not run all commands blindly.", "",
            "Set REVIEWER to the actual human identity and REASON to that human's truthful, case-specific review reason before EACH accepted case. No identity/reason has been supplied or fabricated here. No --replace is used.", "", "```sh"]
for row in original["cases"]:
    commands.append(f'npm run qa:visual:approve -- --run {original["run"]} --case {row["case"]["id"]} --reviewer "${{REVIEWER:?Set actual human reviewer}}" --reason "${{REASON:?Set truthful case-specific reason}}"')
commands += [f'npm run qa:visual:compare -- --run {original["run"]}', "```", "",
             "The CLI validates identity/hash/dimensions, rejects failed/error-layout candidates, requires explicit reviewer/reason, and refuses replacement without --replace. Writes are sequential rather than transactional; retain backups and inspect both PNG and metadata after a human operation. Glass screenshots are not included in these commands."]
(output / "HUMAN_APPROVAL_COMMANDS.md").write_text("\n".join(commands) + "\n")

cards = "".join(f'<figure><a href="{html.escape(r["file"])}"><img src="{html.escape(r["file"])}" alt="{html.escape(r["id"])}"></a><figcaption>{html.escape(r["group"] + " / " + r["id"])}</figcaption></figure>' for r in inventory)
(output / "index.html").write_text('<!doctype html><meta charset="utf-8"><title>Phase 3D.1 — Unapproved review</title><style>body{font:16px sans-serif;background:#151a24;color:white;margin:32px}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0}img{width:100%}a{color:#a8d9ff}</style><h1>Phase 3D.1 — UNAPPROVED</h1><p>Open full-resolution PNGs for review. See REVIEW_NOTES.md and HUMAN_APPROVAL_COMMANDS.md. No automated approval.</p><main>' + cards + '</main>')
files = [{"path": p.relative_to(output).as_posix(), "sha256": sha(p)} for p in sorted(output.rglob("*")) if p.is_file()]
manifest = {"schemaVersion": 1, "humanApproval": "pending", "originalCount": 14, "correctedGlassCount": 2,
            "historicalGlassCount": 2, "originalsByteIdentical": True, "inventory": inventory, "files": files}
(output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
(output / "SHA256SUMS.txt").write_text("".join(f'{sha(p)}  {p.relative_to(output).as_posix()}\n' for p in sorted(output.rglob("*")) if p.is_file() and p.name != "SHA256SUMS.txt"))
print(json.dumps({"package": output.relative_to(ROOT).as_posix(), "originals": 14, "correctedGlass": 2, "historicalGlass": 2, "approvalExecuted": False}, indent=2))
