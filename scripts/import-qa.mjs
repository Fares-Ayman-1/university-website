#!/usr/bin/env node
// Imports a standalone "drill" HTML file (the MCQ / classification drill format) into the Q&A tab.
//
//   npm run import:qa -- <drill.html> <subject-slug> <drill-slug> [--order N]
//
// Writes content/subjects/<subject>/qa/<drill-slug>.json and, for questions with embedded
// images, public/qa/<subject>/<drill-slug>/*. Questions, answers and explanations are copied
// exactly as the file has them; only the page chrome (theme, fonts) changes on the site.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const args = process.argv.slice(2);
const orderAt = args.indexOf("--order");
const order = orderAt >= 0 ? Number(args.splice(orderAt, 2)[1]) : 0;
const [file, subject, slug] = args;
if (!file || !subject || !slug || !Number.isFinite(order)) {
  console.error("Usage: npm run import:qa -- <drill.html> <subject-slug> <drill-slug> [--order N]");
  process.exit(1);
}

const root = process.cwd();
const subjectDir = path.join(root, "content", "subjects", subject);
if (!fs.existsSync(path.join(subjectDir, "subject.json"))) {
  console.error(`Unknown subject "${subject}" (no content/subjects/${subject}/subject.json).`);
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Drill slug "${slug}" must be lowercase words joined by dashes.`);
  process.exit(1);
}

const html = fs.readFileSync(file, "utf8");

// ---------- Page text ----------
function decode(s) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
function pick(re, label) {
  const m = html.match(re);
  if (!m) throw new Error(`Could not find the ${label} in ${file}`);
  return decode(m[1]);
}
const title = pick(/<title>([\s\S]*?)<\/title>/, "<title>");
const kicker = pick(/<p class="kicker">([\s\S]*?)<\/p>/, "kicker");
const heading = pick(/<h1>([\s\S]*?)<\/h1>/, "<h1>");
const lede = pick(/<p class="lede">([\s\S]*?)<\/p>/, "lede");
const foot = pick(/<p class="foot">([\s\S]*?)<\/p>/, "footnote");
const banksLabel = pick(/id="banks"[^>]*aria-label="([^"]+)"/, "tab list label");
const unitMatch = html.match(/questions in (?:'\+BANKS\.length\+'|\d+) ([a-z]+)/);
const unit = unitMatch ? unitMatch[1] : "banks";

// ---------- Question data ----------
// The data sits between 'use strict'; and the State block of the drill's script. It is plain
// literals (plus small group-label functions), so it is evaluated on its own, without the UI.
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const script = scripts.find((s) => s.includes("var BANKS"));
if (!script) throw new Error(`No drill script (var BANKS) in ${file}`);
const start = script.indexOf("'use strict';");
const end = script.indexOf("/* ---------- State ---------- */");
if (start < 0 || end < 0) throw new Error("The drill script does not have the expected layout.");
const dataCode = script.slice(start + "'use strict';".length, end);
// A fresh context has no require, process, document or network APIs.
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(`${dataCode}\n;globalThis.__banks = BANKS;`, sandbox, { timeout: 2000 });
const rawBanks = sandbox.__banks;

const imageDir = path.join(root, "public", "qa", subject, slug);
fs.rmSync(imageDir, { recursive: true, force: true });
let imageCount = 0;
function saveImage(dataUri, name) {
  const m = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,(.+)$/.exec(dataUri);
  if (!m) return dataUri; // already a URL
  const ext = m[1] === "jpeg" ? "jpg" : m[1] === "svg+xml" ? "svg" : m[1];
  fs.mkdirSync(imageDir, { recursive: true });
  fs.writeFileSync(path.join(imageDir, `${name}.${ext}`), Buffer.from(m[2], "base64"));
  imageCount++;
  return `/qa/${subject}/${slug}/${name}.${ext}`;
}

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "" && v !== false));
const isInt = (n) => Number.isInteger(n);

const banks = rawBanks.map((b) => {
  const questions = b.qs.map((q, i) => {
    const where = `${b.id} question ${i + 1}`;
    const group = typeof b.group === "function" ? b.group(i) : b.glabel ?? b.name;
    if (q.k === "c") {
      const items = q.items.map((it) => ({ text: it.t, category: it.c }));
      if (!items.every((it) => isInt(it.category) && it.category >= 0 && it.category < q.cats.length)) {
        throw new Error(`Bad category key in ${where}`);
      }
      return clean({ kind: "sort", group, text: q.t, categories: q.cats, items, why: q.why, ref: q.ref });
    }
    if (!isInt(q.a) || q.a < 0 || q.a >= q.o.length) throw new Error(`Bad answer key in ${where}`);
    const image = q.img ? saveImage(q.img, `${b.id}-q${i + 1}`) : undefined;
    return clean({
      kind: "mcq",
      group,
      text: q.t,
      image,
      alt: q.img ? q.alt || "Figure for the question" : undefined,
      options: q.o,
      answer: q.a,
      why: q.why,
      ref: q.ref,
      check: q.chk ? true : undefined,
    });
  });
  return { id: b.id, tag: b.tag, name: b.name, scope: b.scope, questions };
});

const drill = { title, kicker, heading, lede, foot, banksLabel, unit, order, source: path.basename(file), banks };
const outDir = path.join(subjectDir, "qa");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${slug}.json`), `${JSON.stringify(drill, null, 2)}\n`);

const total = banks.reduce((n, b) => n + b.questions.length, 0);
console.log(
  `[import:qa] ${subject}/${slug}: ${banks.length} ${unit}, ${total} questions` +
    (imageCount ? `, ${imageCount} images in public/qa/${subject}/${slug}/` : ""),
);
