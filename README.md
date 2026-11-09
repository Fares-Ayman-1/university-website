# Quantro AI · University

A study platform where every subject has two **independent** tracks:

- **Lectures**: complete lessons, numbered in the order they were given.
- **Sections**: labs and practical material on specific topics.

```
Subject → Lectures
Subject → Sections
```

Lectures and sections belong to the same subject, but neither is a parent or child of the other. They live in separate folders, use separate schemas, and have their own list pages, detail pages and previous/next navigation.

Built with Next.js 15 (App Router) + MDX, themed in the Quantro AI palette (navy `#112251`, gold `#D3AE6C`, cream `#F5F1EA`, slate `#3C507E`), with light and dark themes and a circular theme-switch animation.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000 (copies materials first)
npm run build        # production build
npm run lint
```

## Content layout

```
content/subjects/
  artificial-intelligence/
    subject.json          # title, code, description, objectives, topics, grading, books
    lectures/NN-slug.mdx  # one file per lecture
    sections/NN-slug.mdx  # one file per section
  robotics/
    ...
```

The URL slug is the file name without its number prefix: `03-uninformed-search.mdx` is served at `/subjects/artificial-intelligence/lectures/uninformed-search/`.

### Add a lecture or a section

Create **one** `.mdx` file in the right folder. Nothing else needs to change, and the other collection is untouched.

```mdx
---
number: 5
title: Informed Search
summary: One or two sentences shown on cards and at the top of the page.
topics: [Greedy best-first, A*, Heuristics]
duration: 45 min study                # optional
kind: lab                             # sections only: lab | practical | concept
sources:                              # files from ../materials/<subject folder>/
  - file: Lectures/AI Lec 4 Informed Search.pdf
    label: AI Lecture 4 (slides)
    pages: "1-40"
bookRefs:                             # book ids from subject.json
  - book: ai-book
    chapter: Ch 3.5 · Informed search
    pages: "74–82"
---

<Objectives>

- What the student will be able to do.

</Objectives>

## First heading

Regular markdown, $\LaTeX$ math, tables, code blocks…
```

The frontmatter is validated when the site builds. A typo, an unknown book id, a missing source PDF, or a field that links a lecture to a section all fail the build with a clear message.

Quote a source path that contains `#` (for example `file: "sections/sec1/session #1.pdf"`): in YAML an unquoted ` #` starts a comment and silently cuts the path short.

### Add a subject

Create `content/subjects/<slug>/subject.json` (copy an existing one), and set `materialsDir` to the subject's folder name inside `../materials`.

## Components available in MDX

| Component | Use |
|---|---|
| `<Objectives>`, `<Takeaways>` | Opening and closing summary panels |
| `<Definition term="…">` | Navy definition band |
| `<Callout type="note \| tip \| warning \| example" title="…">` | Highlighted notes |
| `<Grid cols={2 \| 3}>` + `<Card title="…" tag="…">` | Comparison cards |
| `<Steps>` around a numbered list | Numbered step cards |
| `<SlideFigure page={12} source={0} caption="…" />` | A slide rendered from the item's `sources[source]` PDF |
| `<Tree tree="A(B(D,E),C)" order="A,B,C" path="A,C" goal="C" />` | Search-tree diagram with visit order |
| `<WeightedGraph nodes="S:0,50 A:40,10" edges="S->A:2" directed path="S,A" />` | Weighted graph / map diagram |
| `<AgentLoop />` | Agent–environment diagram |
| `<Exercise title="…" level="easy">` … `<Solution>` … | Exercise with a collapsible solution |
| `<Quiz questions={[{ q, options, answer, explain }]} />` | Interactive quiz with scoring (also feeds the subject's exam mode) |
| `<ConvolutionStepper image="…" kernel="…" expect="…" />` | Slide a mask over an image step by step (correlation/convolution, border methods) |
| `<StateMachine preset="process-states" />` | Fire events on a state diagram (presets in `components/widgets/state-machine/presets.ts`) |
| `<SearchStepper nodes="…" edges="…" start="S" goal="G" />` | Step through DFS / BFS / UCS with the frontier and explored set |
| `<RelationalAlgebra dataset="company-employee" />` | Build σ / π queries on the EMPLOYEE table and see rows and columns drop out |
| `<EncoderSim />` | Turn an incremental (quadrature) or absolute (Gray code) encoder disc |
| `<Walkthrough id="db-transactions" expect="acid, crash, …" />` | A heading's ideas as panels: step pills, an animated drawing per panel, its points, Back/Next and sometimes a toggle |

**Interactive widgets** live in `components/widgets/`. Each has a server wrapper that computes every step with pure code in `lib/widgets/` and loads its client player only on pages that use it. Give a widget an `expect` prop copied from the page's own worked answer: if the widget would show something else, the build fails. Its UI text is written in both languages in code (typed `Bi`), so the MDX only needs `caption`/`captionAr`.

**Walkthroughs** are the step-through visuals placed under a page's headings. Each lecture keeps its own files, so lectures can be written in parallel without touching shared code:

1. **Text:** `lib/walkthroughs/<subject>/lecture-NN.ts` defines each walkthrough with `defineWalkthrough`: panel ids, pills, headings, points, and an optional toggle whose options can add points (`pointsFor`). All of it is typed `Bi`. The file ends with `export const all = [...] as const`, and `lib/walkthroughs/index.ts` spreads that list in once per lecture.
2. **Drawings:** `components/widgets/walkthrough/scenes/<subject>/lecture-NN/<name>.tsx` holds one scene per panel. Scenes are built from the SVG pieces in `walkthrough/primitives.tsx` (`Box`, `Cylinder`, `Doc`, `Person`, `Arrow`, `Token`, `Table`, `Chip`, `Mark`, and for images `Pixels`, `Bars` and `Curve`), each with a `d` delay so the drawing builds up in order.
3. **Loaders:** `scenes/<subject>/lecture-NN.tsx` exports `loaders`, one lazy `dynamic()` import per walkthrough, and `walkthrough/scenes.tsx` spreads it in once per lecture.

TypeScript enforces two things: every walkthrough has scenes, and every panel has exactly one drawing. In the MDX, `expect` lists the panel ids in order and can name numbers the scenes compute (`; drop=500`). The build fails when either disagrees with the page.

Every subject also gets a **Review** tab (flashcards from each page's `<Definition>`s, and an exam mode drawing on every `<Quiz>`), and the header has a **Ctrl+K search** over all pages, headings and definitions, in English and Arabic.

The **Q&A** tab holds question drills (multiple choice and classification, with instant answers and explanations). Each drill is one JSON file in `content/subjects/<subject>/qa/`, imported from a standalone drill HTML file:

```bash
npm run import:qa -- "<drill>.html" <subject-slug> <drill-slug> --order 1
```

The import copies the questions, answer keys and explanations exactly; the site supplies the theme. Embedded images are saved to `public/qa/<subject>/<drill-slug>/`. Re-running it with the same slug replaces that drill. Progress in a drill is saved in the browser only.

Code blocks support titles and line highlights: ` ```python title="bfs.py" {3,5} `.

Leave a blank line before and after block components (`<Solution>`, `<Steps>`, …) so MDX doesn't wrap them in a paragraph. Write currency as `\$40`, because a bare `$` starts math.

## Arabic translations

Every page is bilingual: each English block keeps its place and its Arabic translation sits right under it. The «ع» button in the header hides or shows all Arabic (remembered per device in `localStorage` key `quantro-arabic`); the Arabic is always in the HTML.

- **`content/glossary-ar.md`** is the translation guide: style rules, the exact syntax for every kind of block, and the Arabic glossary that keeps terms consistent. `content/subjects/operating-systems/sections/02-getting-help.mdx` is the worked example.
- In MDX, write `<Ar>…</Ar>` on its own line after a paragraph or heading, on the next line after a list item, or inside a table cell. Props get twins (`titleAr`, `termAr`, `captionAr`), quiz questions get `qAr`, `optionsAr` and `explainAr`, frontmatter gets `titleAr` and `summaryAr`, and `subject.json` gets `titleAr`, `taglineAr`, `descriptionAr`, `objectivesAr` and grading `labelAr`.
- Inside `<Ar>`, put commands, options and paths in backticks: right-to-left text would move a leading `-` or `/` to the wrong end. Plain strings (props, quiz, frontmatter) are isolated automatically.
- **`npm run check:arabic [files]`** checks that every paragraph, heading, list item, table cell, prop and quiz field has Arabic, that commands inside Arabic are in backticks, and that the English is unchanged compared with git (`--base <ref>` to compare with another commit).

Arabic uses IBM Plex Sans Arabic (Arabic subset only); English terms inside Arabic keep using Inter.

## Asset scripts

- `npm run sync` copies lecture and section PDFs and notebooks from `../materials/<subject>/{Lectures,Chapters,Sections}` into `public/materials/`, and logo files from `../brand/` into `public/brand/`. It runs automatically before `npm run dev`. **Reference books are never copied**: pages cite them by chapter and page only.
- `npm run convert` (Windows, needs Microsoft PowerPoint) converts `.pptx`/`.ppt` slides in those folders into PDFs at the same path under `public/materials/`. In a source, refer to the converted file by its `.pdf` name. Office's Trust Center "File Block" setting may refuse old `.ppt` files; open them in PowerPoint, save as `.pptx`, and run it again.
- `npm run slides` renders every slide used by `<SlideFigure>` to `public/slides/` (WebP plus `manifest.json`). It needs Python with `PyMuPDF`, `Pillow` and `PyYAML`, and re-renders only new slides (`-- --force` re-renders all).

Both outputs are **committed**, so a Vercel build never needs Python or the `../materials` folder.

## Logo

Logo files live in `D:\University\brand\` and are copied to `public/brand/` by `npm run sync`. Navy files are shown on the **light** theme and cream files on the **dark** theme:

| File | Used for |
|---|---|
| `logo-navy.webp` / `logo-cream.webp` | Header: the mark without the tagline, next to the "Quantro AI" wordmark |
| `logo-navy-full.webp` / `logo-cream-full.webp` | Home page: the full logo with "Control Your Future Intelligently", beside the headline (wide screens only) |

`.svg`, `.webp` and `.png` all work. If only one colour exists it is used for both themes, and with no files the header falls back to a drawn monogram.

The favicon and touch icon are `app/icon.png` and `app/apple-icon.png`: the cream mark on a navy rounded square.

## Theme

Colour tokens live in `app/globals.css` under `:root[data-theme="light"]` and `:root[data-theme="dark"]`. An inline script in `app/layout.tsx` applies the saved theme (or the OS preference) before the first paint, so the page never flashes the wrong theme. `components/ThemeToggle.tsx` uses the View Transitions API to reveal the new theme as a circle growing from the toggle button. When the browser has no View Transitions support, or the user prefers reduced motion, the theme switches instantly.

## Deploy on Vercel

1. Push the repository to GitHub, including `public/materials` and `public/slides`.
2. Import it in Vercel. The repository root **is** the app, so leave **Root Directory** empty (`./`). `vercel.json` pins the framework to Next.js, so the deployment works even if the project was created before `package.json` existed.
3. Every page is pre-rendered at build time.

Note that the lecture and section PDFs in `public/materials` and the slide images are publicly downloadable from a public deployment. If the course material shouldn't be public, enable Vercel **Deployment Protection** or remove `public/materials` before deploying.
"# university-website" 
