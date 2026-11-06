import "server-only";
import { cache } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { COLLECTION_META, getCollection, itemHref, type Collection, type ResourceItem } from "@/lib/content";
import { definitionId } from "@/lib/definition-id";
import type { QuizQuestion } from "@/components/quiz/QuestionCard";

/** Where a definition or question comes from */
export type StudySource = {
  collection: Collection;
  slug: string;
  number: number;
  title: string;
  titleAr?: string;
  /** "Lecture 3" */
  label: string;
  href: string;
};

export type StudyDefinition = {
  id: string;
  term: string;
  termAr?: string;
  /** The definition's English text (no Arabic), for search */
  text: string;
  /** The whole `<Definition …>…</Definition>` element, to render with the page's components */
  mdx: string;
  href: string;
  source: StudySource;
};

export type StudyQuestion = QuizQuestion & { source: StudySource; href: string };

export type StudyData = { definitions: StudyDefinition[]; questions: StudyQuestion[] };

// Same parser stack as scripts/check-arabic.mjs.
const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).use(remarkMath);

/* eslint-disable @typescript-eslint/no-explicit-any -- mdast/estree nodes from remark-mdx */
type Node = any;

function attribute(node: Node, name: string): Node | undefined {
  return node.attributes?.find((a: Node) => a.type === "mdxJsxAttribute" && a.name === name);
}

function stringAttribute(node: Node, name: string): string | undefined {
  const value = attribute(node, name)?.value;
  return typeof value === "string" ? value : undefined;
}

/**
 * Evaluates a literal-only estree expression (quiz data) into a JS value.
 * A TypeScript copy of `evaluate` in scripts/check-arabic.mjs; keep the two in step.
 */
function evaluate(node: Node): unknown {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "TemplateLiteral":
      return node.quasis.map((q: Node) => q.value.cooked).join("");
    case "ArrayExpression":
      return node.elements.map(evaluate);
    case "ObjectExpression":
      return Object.fromEntries(node.properties.map((p: Node) => [p.key.name ?? p.key.value, evaluate(p.value)]));
    case "UnaryExpression":
      return node.operator === "-" ? -(evaluate(node.argument) as number) : evaluate(node.argument);
    default:
      throw new Error(`unsupported quiz expression: ${node.type}`);
  }
}

/** Plain text of a node, skipping <Ar> translations. */
function englishText(node: Node): string {
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    if (node.name === "Ar") return "";
  }
  if (typeof node.value === "string" && (node.type === "text" || node.type === "inlineCode" || node.type === "inlineMath")) {
    return node.value;
  }
  return (node.children ?? []).map(englishText).join(node.type === "root" ? "\n" : "");
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function walk(node: Node, visit: (node: Node) => void) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

function extract(item: ResourceItem): StudyData {
  const href = itemHref(item);
  const meta = COLLECTION_META[item.collection];
  const source: StudySource = {
    collection: item.collection,
    slug: item.slug,
    number: item.data.number,
    title: item.data.title,
    titleAr: item.data.titleAr,
    label: `${meta.singular} ${item.data.number}`,
    href,
  };
  const where = `${item.subject}/${item.collection}/${item.slug}`;
  const tree = parser.parse(item.body);
  const definitions: StudyDefinition[] = [];
  const questions: StudyQuestion[] = [];
  const ids = new Set<string>();

  walk(tree, (node) => {
    if (node.type !== "mdxJsxFlowElement") return;

    if (node.name === "Definition") {
      const term = stringAttribute(node, "term");
      if (!term) throw new Error(`${where}: <Definition> needs a plain string term`);
      const id = definitionId(term);
      if (ids.has(id)) throw new Error(`${where}: two definitions share the anchor #${id} ("${term}")`);
      ids.add(id);
      definitions.push({
        id,
        term,
        termAr: stringAttribute(node, "termAr"),
        text: node.children.map(englishText).join(" ").replace(/\s+/g, " ").trim(),
        mdx: item.body.slice(node.position.start.offset, node.position.end.offset),
        href: `${href}#${id}`,
        source,
      });
    }

    if (node.name === "Quiz") {
      const program = attribute(node, "questions")?.value?.data?.estree;
      if (!program) return;
      for (const question of evaluate(program.body[0].expression) as QuizQuestion[]) {
        questions.push({ ...question, source, href: `${href}#quiz` });
      }
    }
  });

  return { definitions, questions };
}

/** Every definition and quiz question of a subject, lectures first, in page order. */
export const getStudyData = cache((subject: string): StudyData => {
  const definitions: StudyDefinition[] = [];
  const questions: StudyQuestion[] = [];
  for (const collection of ["lectures", "sections"] as const) {
    for (const item of getCollection(subject, collection)) {
      const data = extract(item);
      definitions.push(...data.definitions);
      questions.push(...data.questions);
    }
  }
  return { definitions, questions };
});
