/**
 * Site search shared by the static index (app/search-index.json/route.ts) and the Ctrl+K
 * palette (components/search/CommandPalette.tsx). Client-safe: no Node APIs here.
 */

export type SearchKind = "subject" | "lecture" | "section" | "heading" | "definition" | "review" | "qa";

export type SearchDoc = {
  kind: SearchKind;
  title: string;
  titleAr?: string;
  /** Where it lives, e.g. "Image Processing · Lecture 3" */
  context: string;
  href: string;
  /** Summary or definition text (searched with a low weight) */
  text?: string;
  topics?: string[];
};

export type PreparedDoc = SearchDoc & {
  n: { title: string; titleAr: string; topics: string; text: string; context: string };
};

const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** Lowercases, strips Latin accents and Arabic diacritics/tatweel, and folds Arabic letter variants. */
export function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(ARABIC_MARKS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase();
}

export function tokenize(query: string): string[] {
  return normalize(query)
    .split(/[\s,.;:!?()[\]{}"'«»،؛؟/\\|-]+/)
    .filter(Boolean);
}

export function prepare(docs: SearchDoc[]): PreparedDoc[] {
  return docs.map((doc) => ({
    ...doc,
    n: {
      title: normalize(doc.title),
      titleAr: normalize(doc.titleAr ?? ""),
      topics: normalize((doc.topics ?? []).join(" · ")),
      text: normalize(doc.text ?? ""),
      context: normalize(doc.context),
    },
  }));
}

const FIELD_WEIGHTS = { title: 10, titleAr: 10, topics: 4, text: 2, context: 1 } as const;
const KIND_BONUS: Record<SearchKind, number> = {
  subject: 6,
  lecture: 4,
  section: 4,
  review: 3,
  qa: 3,
  definition: 2,
  heading: 0,
};

function fieldScore(field: string, token: string): number {
  const at = field.indexOf(token);
  if (at < 0) return 0;
  // A match at the start of a word counts more than one inside a word.
  const wordStart = at === 0 || /[\s·(\-/]/.test(field[at - 1]);
  return wordStart ? 1.5 : 1;
}

/** Every query token must match somewhere; results are ranked by weighted field matches. */
export function search(docs: PreparedDoc[], query: string, limit = 30): PreparedDoc[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const scored: { doc: PreparedDoc; score: number }[] = [];

  for (const doc of docs) {
    let total = 0;
    let matchedAll = true;
    for (const token of tokens) {
      let best = 0;
      for (const [field, weight] of Object.entries(FIELD_WEIGHTS) as [keyof typeof FIELD_WEIGHTS, number][]) {
        best = Math.max(best, fieldScore(doc.n[field], token) * weight);
      }
      if (best === 0) {
        matchedAll = false;
        break;
      }
      total += best;
    }
    if (!matchedAll) continue;
    if (doc.n.title === tokens.join(" ")) total += 8;
    scored.push({ doc, score: total + KIND_BONUS[doc.kind] });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
    .map((entry) => entry.doc);
}
