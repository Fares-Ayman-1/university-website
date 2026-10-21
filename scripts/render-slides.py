"""Render the slide pages used by <SlideFigure> into WebP images.

Scans content/subjects/*/{lectures,sections}/*.mdx for <SlideFigure page={N} source={i} />,
resolves the PDF from the item's frontmatter `sources[i].file` (relative to the subject's
folder in ../materials), and writes:

    public/slides/<subject>/<collection>/<slug>/s<i>-p<N>.webp
    public/slides/manifest.json   (image sizes, read by SlideFigure for width/height)

Existing images are kept, so re-running only renders new slides. The output is committed,
so Vercel builds never need Python. Usage: npm run slides  (add --force to re-render all)
"""

import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SUBJECTS = ROOT / "content" / "subjects"
MATERIALS = ROOT.parent / "materials"
OUT = ROOT / "public" / "slides"
TARGET_WIDTH = 1400
FORCE = "--force" in sys.argv

TAG = re.compile(r"<SlideFigure\b(.*?)/>", re.S)
PAGE = re.compile(r"\bpage=\{(\d+)\}")
SOURCE = re.compile(r"\bsource=\{(\d+)\}")


def frontmatter(text: str) -> dict:
    match = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    return yaml.safe_load(match.group(1)) if match else {}


def main() -> None:
    manifest: dict[str, dict[str, int]] = {}
    rendered = 0
    docs: dict[Path, fitz.Document] = {}

    for subject_dir in sorted(p for p in SUBJECTS.iterdir() if p.is_dir()):
        subject = json.loads((subject_dir / "subject.json").read_text(encoding="utf-8"))
        materials_dir = MATERIALS / subject["materialsDir"]

        for collection in ("lectures", "sections"):
            for mdx in sorted((subject_dir / collection).glob("*.mdx")):
                text = mdx.read_text(encoding="utf-8")
                sources = frontmatter(text).get("sources") or []
                slug = re.sub(r"^\d+[-_]", "", mdx.stem)

                for tag in TAG.finditer(text):
                    attrs = tag.group(1)
                    page_match = PAGE.search(attrs)
                    if not page_match:
                        raise SystemExit(f"{mdx}: <SlideFigure> without page={{N}}")
                    page = int(page_match.group(1))
                    source_index = int(SOURCE.search(attrs).group(1)) if SOURCE.search(attrs) else 0
                    if source_index >= len(sources):
                        raise SystemExit(f"{mdx}: SlideFigure source={source_index} but only {len(sources)} sources")

                    key = f"{subject_dir.name}/{collection}/{slug}/s{source_index}-p{page}.webp"
                    target = OUT / key

                    if FORCE or not target.exists():
                        # Prefer the published copy: PDFs converted from PowerPoint/Word
                        # (npm run convert) exist only there, not in ../materials.
                        published = ROOT / "public" / "materials" / subject_dir.name / sources[source_index]["file"]
                        pdf_path = published if published.exists() else materials_dir / sources[source_index]["file"]
                        if not pdf_path.exists():
                            if target.exists():
                                continue
                            raise SystemExit(f"{mdx}: source PDF not found: {pdf_path}")
                        doc = docs.setdefault(pdf_path, fitz.open(pdf_path))
                        if page < 1 or page > doc.page_count:
                            raise SystemExit(f"{mdx}: page {page} out of range (1-{doc.page_count})")
                        pdf_page = doc[page - 1]
                        zoom = TARGET_WIDTH / pdf_page.rect.width
                        pix = pdf_page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
                        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                        target.parent.mkdir(parents=True, exist_ok=True)
                        image.save(target, "WEBP", quality=80, method=6)
                        rendered += 1

                    with Image.open(target) as image:
                        manifest[key] = {"width": image.width, "height": image.height}

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"[slides] {rendered} rendered, {len(manifest)} total in manifest")


if __name__ == "__main__":
    main()
