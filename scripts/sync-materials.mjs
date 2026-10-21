// Copies course materials (lecture/section PDFs and notebooks) from ../materials into
// public/materials/<subject-slug>/, and logo files from ../brand into public/brand/.
//
// Reference books in a subject's root folder are deliberately NOT copied: they are cited
// on the site by chapter and page, never published.
//
// The copied files are committed, so a Vercel build (where ../materials may not exist)
// still serves them. Run `npm run sync` after adding new PDFs.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const materialsRoot = path.resolve(root, "..", "materials");
const brandRoot = path.resolve(root, "..", "brand");
const subjectsDir = path.join(root, "content", "subjects");
const COPY_EXTENSIONS = new Set([".pdf", ".ipynb"]);
const COURSE_FOLDERS = /^(lectures|sections)$/i;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function copyIfChanged(from, to) {
  const source = fs.statSync(from);
  if (fs.existsSync(to)) {
    const target = fs.statSync(to);
    if (target.size === source.size && target.mtimeMs >= source.mtimeMs) return false;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return true;
}

let copied = 0;

if (!fs.existsSync(materialsRoot)) {
  console.log("[sync] ../materials not found; using the committed copies in public/materials.");
} else {
  for (const slug of fs.readdirSync(subjectsDir)) {
    const subjectFile = path.join(subjectsDir, slug, "subject.json");
    if (!fs.existsSync(subjectFile)) continue;
    const { materialsDir } = JSON.parse(fs.readFileSync(subjectFile, "utf8"));
    const sourceDir = path.join(materialsRoot, materialsDir);
    if (!fs.existsSync(sourceDir)) {
      console.warn(`[sync] ${slug}: materials folder "${materialsDir}" not found`);
      continue;
    }

    for (const file of walk(sourceDir)) {
      const relative = path.relative(sourceDir, file);
      const [topFolder] = relative.split(path.sep);
      if (!COURSE_FOLDERS.test(topFolder) || !COPY_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
      if (copyIfChanged(file, path.join(root, "public", "materials", slug, relative))) copied++;
    }
  }
}

if (fs.existsSync(brandRoot)) {
  for (const name of fs.readdirSync(brandRoot)) {
    if (!/\.(svg|png|webp)$/i.test(name)) continue;
    if (copyIfChanged(path.join(brandRoot, name), path.join(root, "public", "brand", name))) copied++;
  }
}

console.log(`[sync] ${copied} file(s) updated.`);
