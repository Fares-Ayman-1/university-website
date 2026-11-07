// Checks the Arabic translations in lecture/section MDX files and subject.json files.
//
//   npm run check:arabic                      all subjects
//   npm run check:arabic -- <file> [<file>…]  only these (.mdx or subject.json)
//   … --base <git-ref>                        English baseline for the integrity check (default HEAD)
//
// 1. Coverage: every English paragraph, heading, list item and table cell has an Arabic
//    translation; every title/term/caption prop has its …Ar twin; every quiz question has
//    qAr, optionsAr (same length as options) and explainAr (when it has explain); the
//    frontmatter has titleAr and summaryAr.
// 2. Arabic: every translation actually contains Arabic text.
// 3. Integrity: with every <Ar>, …Ar prop, quiz …Ar key and …Ar frontmatter field removed,
//    the file is identical to the baseline, i.e. the English was not changed.
//
// Exits with status 1 when any problem is found.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const ROOT = process.cwd();
const SUBJECTS = path.join(ROOT, "content", "subjects");
const ARABIC = /[\u0600-\u06FF]{2,}/;
const ENGLISH_WORD = /[A-Za-z]{2,}/;
// Interactive widgets (components/widgets). Their UI text lives in code, typed so both
// languages are required; in the MDX they carry only data plus title/caption props. Adding
// or editing a widget is not an English text change, so the integrity check skips them.
const WIDGETS = new Set(["ConvolutionStepper", "StateMachine", "SearchStepper", "RelationalAlgebra", "EncoderSim", "Walkthrough"]);
const PROP_TWINS = {
  Callout: [["title", "titleAr"]],
  Definition: [["term", "termAr"]],
  Card: [["title", "titleAr"]],
  Exercise: [["title", "titleAr"]],
  SlideFigure: [["caption", "captionAr"]],
  ...Object.fromEntries(
    [...WIDGETS].map((name) => [
      name,
      [
        ["title", "titleAr"],
        ["caption", "captionAr"],
      ],
    ]),
  ),
};
const AR_PROPS = new Set(["titleAr", "termAr", "captionAr"]);
const QUIZ_AR_KEYS = new Set(["qAr", "optionsAr", "explainAr"]);
const FRONTMATTER_AR_KEYS = new Set(["titleAr", "summaryAr"]);

const args = process.argv.slice(2);
let base = "HEAD";
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base") base = args[++i];
  else files.push(path.resolve(args[i]));
}
if (files.length === 0) {
  for (const subject of fs.readdirSync(SUBJECTS)) {
    const dir = path.join(SUBJECTS, subject);
    if (!fs.statSync(dir).isDirectory()) continue;
    files.push(path.join(dir, "subject.json"));
    for (const collection of ["lectures", "sections"]) {
      const cdir = path.join(dir, collection);
      if (!fs.existsSync(cdir)) continue;
      for (const f of fs.readdirSync(cdir).sort()) if (f.endsWith(".mdx")) files.push(path.join(cdir, f));
    }
  }
}

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).use(remarkMath);
const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

function baseline(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  try {
    return execFileSync("git", ["show", `${base}:${rel}`], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).replace(/\r\n/g, "\n");
  } catch {
    return null; // new file: nothing to compare against
  }
}

// ---------- helpers ----------

const isAr = (n) => (n.type === "mdxJsxTextElement" || n.type === "mdxJsxFlowElement") && n.name === "Ar";
const isBlankText = (n) => n.type === "text" && !n.value.trim();
const arOnlyParagraph = (n) =>
  n?.type === "paragraph" && n.children.filter((c) => !isBlankText(c)).length === 1 && n.children.some(isAr);
const isArBlock = (n) => (n?.type === "mdxJsxFlowElement" && n.name === "Ar") || arOnlyParagraph(n);

/** Visible text of a node, optionally skipping <Ar> elements, code and math. */
function textOf(node, { skipAr = true } = {}) {
  if (!node) return "";
  if (skipAr && isAr(node)) return "";
  if (["inlineCode", "code", "inlineMath", "math", "mdxTextExpression", "mdxFlowExpression"].includes(node.type)) return "";
  if (node.type === "text") return node.value;
  return (node.children ?? []).map((c) => textOf(c, { skipAr })).join(" ");
}

const hasWords = (node) => ENGLISH_WORD.test(textOf(node));
const containsAr = (node) => isAr(node) || (node.children ?? []).some(containsAr);
let lineOffset = 0; // frontmatter lines before the MDX body of the file being checked
const line = (node) => (node.position ? node.position.start.line + lineOffset : "?");

function attr(node, name) {
  return node.attributes?.find((a) => a.type === "mdxJsxAttribute" && a.name === name);
}

/** Evaluates a literal-only estree expression (quiz data) into a JS value. */
function evaluate(node) {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "TemplateLiteral":
      return node.quasis.map((q) => q.value.cooked).join("");
    case "ArrayExpression":
      return node.elements.map(evaluate);
    case "ObjectExpression":
      return Object.fromEntries(node.properties.map((p) => [p.key.name ?? p.key.value, evaluate(p.value)]));
    case "UnaryExpression":
      return node.operator === "-" ? -evaluate(node.argument) : evaluate(node.argument);
    default:
      throw new Error(`unsupported quiz expression: ${node.type}`);
  }
}

function quizQuestions(node) {
  const q = attr(node, "questions");
  const program = q?.value?.data?.estree;
  if (!program) return [];
  return evaluate(program.body[0].expression);
}

// ---------- 1 + 2: coverage and Arabic text ----------

function checkCoverage(tree, problems) {
  const visit = (parent, inListItem) => {
    const kids = parent.children ?? [];
    kids.forEach((node, i) => {
      const next = kids[i + 1];

      if (isAr(node) || arOnlyParagraph(node)) {
        if (!ARABIC.test(textOf(node, { skipAr: false }))) problems.push(`line ${line(node)}: <Ar> has no Arabic text`);
        checkBidi(node, problems);
        return;
      }

      switch (node.type) {
        case "heading":
          if (containsAr(node)) problems.push(`line ${line(node)}: put the Arabic heading on the next line, not inside the heading`);
          else if (hasWords(node) && !isArBlock(next)) problems.push(`line ${line(node)}: heading "${textOf(node).trim().slice(0, 50)}" has no <Ar> line after it`);
          return;
        case "paragraph": {
          if (!hasWords(node)) return checkInlineAr(node, problems);
          const content = node.children.filter((c) => !isBlankText(c));
          if (content.every((c) => c.type === "mdxJsxTextElement" && c.name !== "Ar")) {
            // A paragraph of nothing but JSX elements, which MDX unwraps into separate blocks:
            // one-line components (`<Card title="…">text</Card>`) or raw `<li>…</li>` lines.
            // The Arabic goes inside each one, after its English (`text<Ar>…</Ar></Card>`).
            for (const element of content) {
              checkElement(element, problems);
              if (hasWords(element) && !containsAr(element))
                problems.push(`line ${line(element)}: one-line <${element.name}> "${textOf(element).trim().slice(0, 40)}" needs <Ar>…</Ar> inside it, right before </${element.name}>`);
              checkInlineAr(element, problems);
            }
            return;
          }
          if (inListItem) {
            if (!containsAr(node) && !isArBlock(next)) problems.push(`line ${line(node)}: list item "${textOf(node).trim().slice(0, 50)}" has no <Ar>`);
          } else if (containsAr(node)) {
            problems.push(`line ${line(node)}: put <Ar> on its own line after a blank line, not inside the English paragraph`);
          } else if (!isArBlock(next)) {
            problems.push(`line ${line(node)}: paragraph "${textOf(node).trim().slice(0, 60)}" has no <Ar> block after it`);
          }
          return checkInlineAr(node, problems);
        }
        case "list":
          node.children.forEach((item) => visit(item, true));
          return;
        case "table": {
          // `{/* data-table */}` right before a table marks its body rows as data (query output,
          // sample relations): names, codes and dates stay as they are; only the header needs Arabic.
          const isData = i > 0 && kids[i - 1].type === "mdxFlowExpression" && /data-table/.test(kids[i - 1].value);
          node.children.forEach((row, r) =>
            row.children.forEach((cell) => {
              if (hasWords(cell) && !containsAr(cell) && !(isData && r > 0))
                problems.push(`line ${line(cell)}: table cell "${textOf(cell).trim().slice(0, 40)}" has no <Ar>`);
              checkInlineAr(cell, problems);
            }),
          );
          return;
        }
        case "mdxJsxFlowElement":
          checkElement(node, problems);
          visit(node, false);
          return;
        case "blockquote":
          // A quoted problem statement: Arabic inside the quote, or as a block right after it.
          if (hasWords(node) && !containsAr(node) && !isArBlock(next))
            problems.push(`line ${line(node)}: quote "${textOf(node).trim().slice(0, 50)}" has no <Ar> inside or after it`);
          checkInlineAr(node, problems);
          return;
        default:
          if (node.children) visit(node, inListItem);
      }
    });
  };
  visit(tree, false);
}

function checkInlineAr(node, problems) {
  const walk = (n) => {
    if (isAr(n)) {
      if (!ARABIC.test(textOf(n, { skipAr: false }))) problems.push(`line ${line(n)}: <Ar> has no Arabic text`);
      checkBidi(n, problems);
    }
    (n.children ?? []).forEach(walk);
  };
  walk(node);
}

/**
 * Inside right-to-left text, a leading dash or slash is bidi-neutral and jumps to the wrong
 * end ("--help" shows as "help--"). Commands, options and paths must be in backticks there
 * (code is isolated left-to-right by CSS).
 */
function checkBidi(arNode, problems) {
  const walk = (n) => {
    if (n.type === "text") {
      if (/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/.test(n.value))
        problems.push(`line ${line(n)}: remove invisible direction marks (U+200E etc.) inside <Ar>; use backticks instead`);
      const bad = /(^|[\s(«])((?:--?|\/)[A-Za-z][\w\-./]*)/.exec(n.value);
      if (bad) problems.push(`line ${line(n)}: wrap "${bad[2]}" in backticks inside <Ar> (it would display reversed)`);
    }
    const isCode = n.type === "inlineCode" || ((n.type === "mdxJsxTextElement" || n.type === "mdxJsxFlowElement") && ["code", "kbd", "bdi"].includes(n.name));
    if (!isCode) (n.children ?? []).forEach(walk);
  };
  walk(arNode);
}

function checkElement(node, problems) {
  for (const [prop, twin] of PROP_TWINS[node.name] ?? []) {
    const english = attr(node, prop);
    if (!english) continue;
    const arabic = attr(node, twin);
    if (!arabic) problems.push(`line ${line(node)}: <${node.name} ${prop}="…"> needs ${twin}`);
    else if (typeof arabic.value !== "string" || !ARABIC.test(arabic.value)) problems.push(`line ${line(node)}: ${twin} has no Arabic text`);
  }
  if (node.name === "Quiz") {
    let questions;
    try {
      questions = quizQuestions(node);
    } catch (error) {
      problems.push(`line ${line(node)}: ${error.message}`);
      return;
    }
    questions.forEach((q, i) => {
      const where = `line ${line(node)}: quiz question ${i + 1}`;
      if (!q.qAr || !ARABIC.test(q.qAr)) problems.push(`${where} needs qAr with Arabic text`);
      if (!Array.isArray(q.optionsAr) || q.optionsAr.length !== q.options.length)
        problems.push(`${where} needs optionsAr with ${q.options.length} entries`);
      else
        q.optionsAr.forEach((o, j) => {
          // Options that are pure code/numbers (e.g. "ls -a", "42") may stay as they are.
          if (!ARABIC.test(o) && o !== q.options[j]) problems.push(`${where}, option ${j + 1}: optionsAr entry is neither Arabic nor identical to the English`);
        });
      if (q.explain && (!q.explainAr || !ARABIC.test(q.explainAr))) problems.push(`${where} needs explainAr with Arabic text`);
    });
  }
}

// ---------- 3: integrity ----------

/** Removes every Arabic addition from an MDX body, using the parse tree's positions. */
function stripArabic(body, tree) {
  const ranges = [];
  const walk = (n) => {
    if (isAr(n) || arOnlyParagraph(n) || (n.type === "mdxFlowExpression" && /data-table/.test(n.value))) {
      ranges.push([n.position.start.offset, n.position.end.offset]);
      return;
    }
    if (n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement") {
      if (n.name === "Quiz") {
        ranges.push([n.position.start.offset, n.position.end.offset]); // compared separately
        return;
      }
      if (WIDGETS.has(n.name)) {
        ranges.push([n.position.start.offset, n.position.end.offset]); // data only, see WIDGETS
        return;
      }
      for (const a of n.attributes ?? []) if (AR_PROPS.has(a.name) && a.position) ranges.push([a.position.start.offset, a.position.end.offset]);
    }
    (n.children ?? []).forEach(walk);
  };
  walk(tree);
  ranges.sort((a, b) => b[0] - a[0]);
  let out = body;
  for (const [start, end] of ranges) out = out.slice(0, start) + out.slice(end);
  return out;
}

/** A copy of `obj` without the given keys (gray-matter caches its results, so never mutate). */
const without = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.has(k)));

/** The English quiz data of a tree: every quiz question with its …Ar keys removed. */
function quizzesOf(tree) {
  const found = [];
  const walk = (n) => {
    if (n.type === "mdxJsxFlowElement" && n.name === "Quiz") found.push(quizQuestions(n).map((q) => without(q, QUIZ_AR_KEYS)));
    (n.children ?? []).forEach(walk);
  };
  walk(tree);
  return JSON.stringify(found);
}

/** Line-level normalization: whitespace differences left by removals don't count. */
const normalize = (text) =>
  text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").replace(/ (\/?>)/g, "$1").trim())
    .filter(Boolean);

function checkIntegrity(file, current, problems) {
  const original = baseline(file);
  if (original === null) {
    problems.push(`(warning) not in ${base}, so the English could not be compared`);
    return;
  }
  // Arabic is stripped from both sides, so the baseline may or may not already have it.
  const cur = matter(current);
  const orig = matter(original);
  if (JSON.stringify(without(cur.data, FRONTMATTER_AR_KEYS)) !== JSON.stringify(without(orig.data, FRONTMATTER_AR_KEYS)))
    problems.push("frontmatter: English fields differ from the original");

  const curTree = parser.parse(cur.content);
  const origTree = parser.parse(orig.content);
  if (quizzesOf(curTree) !== quizzesOf(origTree)) problems.push("quiz: English questions/options/answers differ from the original");

  const a = normalize(stripArabic(cur.content, curTree));
  const b = normalize(stripArabic(orig.content, origTree));
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      problems.push(`English text changed near:\n      original: ${JSON.stringify((b[i] ?? "<end>").slice(0, 110))}\n      now:      ${JSON.stringify((a[i] ?? "<end>").slice(0, 110))}`);
      break;
    }
  }
}

// ---------- subject.json ----------

function checkSubject(file, problems) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const key of ["titleAr", "taglineAr", "descriptionAr"])
    if (!data[key] || !ARABIC.test(data[key])) problems.push(`${key} is missing or has no Arabic text`);
  const objectives = data.objectives ?? [];
  if (objectives.length && (data.objectivesAr ?? []).length !== objectives.length)
    problems.push(`objectivesAr needs ${objectives.length} entries`);
  (data.grading ?? []).forEach((g) => {
    if (!g.labelAr || !ARABIC.test(g.labelAr)) problems.push(`grading "${g.label}" needs labelAr`);
  });
  const original = baseline(file);
  if (original) {
    const strip = (d) => {
      const copy = JSON.parse(JSON.stringify(d));
      for (const k of ["titleAr", "taglineAr", "descriptionAr", "objectivesAr"]) delete copy[k];
      (copy.grading ?? []).forEach((g) => delete g.labelAr);
      return JSON.stringify(copy);
    };
    if (strip(data) !== strip(JSON.parse(original))) problems.push("English fields differ from the original");
  }
}

// ---------- run ----------

let failed = 0;
let checked = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file);
  const problems = [];
  try {
    if (file.endsWith(".json")) {
      checkSubject(file, problems);
    } else {
      const text = read(file);
      const { data, content } = matter(text);
      lineOffset = text.slice(0, text.length - content.length).split("\n").length - 1;
      for (const key of ["titleAr", "summaryAr"])
        if (!data[key] || !ARABIC.test(String(data[key]))) problems.push(`frontmatter ${key} is missing or has no Arabic text`);
      const tree = parser.parse(content);
      checkCoverage(tree, problems);
      checkIntegrity(file, text, problems);
    }
  } catch (error) {
    problems.push(`could not be checked: ${error.message}`);
  }
  checked++;
  const errors = problems.filter((p) => !p.startsWith("(warning)"));
  if (errors.length) failed++;
  if (problems.length) {
    console.log(`${errors.length ? "✗" : "!"} ${rel}`);
    for (const p of problems.slice(0, 40)) console.log(`    ${p}`);
    if (problems.length > 40) console.log(`    … and ${problems.length - 40} more`);
  } else {
    console.log(`✓ ${rel}`);
  }
}
console.log(`\n[check:arabic] ${checked - failed}/${checked} file(s) OK`);
process.exit(failed ? 1 : 0);
