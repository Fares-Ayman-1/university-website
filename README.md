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
| `<Quiz questions={[{ q, options, answer, explain }]} />` | Interactive quiz with scoring |

Code blocks support titles and line highlights: ` ```python title="bfs.py" {3,5} `.

Leave a blank line before and after block components (`<Solution>`, `<Steps>`, …) so MDX doesn't wrap them in a paragraph. Write currency as `\$40`, because a bare `$` starts math.

## Asset scripts

- `npm run sync` copies lecture and section PDFs and notebooks from `../materials/<subject>/{Lectures,Sections}` into `public/materials/`, and logo files from `../brand/` into `public/brand/`. It runs automatically before `npm run dev`. **Reference books are never copied**: pages cite them by chapter and page only.
- `npm run slides` renders every slide used by `<SlideFigure>` to `public/slides/` (WebP plus `manifest.json`). It needs Python with `PyMuPDF`, `Pillow` and `PyYAML`, and re-renders only new slides (`-- --force` re-renders all).

Both outputs are **committed**, so a Vercel build never needs Python or the `../materials` folder.

## Logo

Put the logo files in `D:\University\brand\` and run `npm run sync`:

- `logo-navy.svg` (or `.png` / `.webp`): shown on the **light** theme
- `logo-cream.svg` (or `.png` / `.webp`): shown on the **dark** theme

If only one file exists it is used for both themes. With no files, the header shows the "Quantro AI" wordmark.

## Theme

Colour tokens live in `app/globals.css` under `:root[data-theme="light"]` and `:root[data-theme="dark"]`. An inline script in `app/layout.tsx` applies the saved theme (or the OS preference) before the first paint, so the page never flashes the wrong theme. `components/ThemeToggle.tsx` uses the View Transitions API to reveal the new theme as a circle growing from the toggle button. When the browser has no View Transitions support, or the user prefers reduced motion, the theme switches instantly.

## Deploy on Vercel

1. Push the repository to GitHub, including `public/materials` and `public/slides`.
2. Import it in Vercel. If the repository root is `D:\University`, set **Root Directory** to `quantro-learn`. The framework preset is Next.js and the default build command works.
3. Every page is pre-rendered at build time.

Note that the lecture and section PDFs in `public/materials` and the slide images are publicly downloadable from a public deployment. If the course material shouldn't be public, enable Vercel **Deployment Protection** or remove `public/materials` before deploying.
"# university-website" 
