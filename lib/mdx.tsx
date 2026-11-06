import "server-only";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { createMdxComponents } from "@/components/mdx";
import { quantroCodeTheme } from "./code-theme";
import { remarkArabic } from "./remark-arabic";
import type { Collection, ResourceItem } from "./content";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: quantroCodeTheme,
  keepBackground: false,
  defaultLang: { block: "plaintext", inline: "plaintext" },
};

type RenderContext = { subject: string; collection: Collection; slug: string };

async function compile(source: string, context: RenderContext, overrides: MDXComponents = {}) {
  const { content } = await compileMDX({
    source,
    components: { ...createMdxComponents(context), ...overrides },
    options: {
      // Content is authored in this repo, so JS expressions (e.g. quiz props) are allowed;
      // dangerous globals stay blocked.
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath, remarkArabic],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { behavior: "wrap", properties: { className: ["heading-anchor"] } },
          ],
          rehypeKatex,
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  });
  return content;
}

export async function renderResource(item: ResourceItem) {
  return compile(item.body, { subject: item.subject, collection: item.collection, slug: item.slug });
}

/**
 * Renders a piece of a page's MDX on its own (e.g. one <Definition> for a flashcard) with the
 * same plugins and components as the page; `overrides` replaces components for this render.
 */
export async function renderFragment(source: string, context: RenderContext, overrides?: MDXComponents) {
  return compile(source, context, overrides);
}
