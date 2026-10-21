import "server-only";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { createMdxComponents } from "@/components/mdx";
import { quantroCodeTheme } from "./code-theme";
import type { ResourceItem } from "./content";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: quantroCodeTheme,
  keepBackground: false,
  defaultLang: { block: "plaintext", inline: "plaintext" },
};

export async function renderResource(item: ResourceItem) {
  const { content } = await compileMDX({
    source: item.body,
    components: createMdxComponents({
      subject: item.subject,
      collection: item.collection,
      slug: item.slug,
    }),
    options: {
      // Content is authored in this repo, so JS expressions (e.g. quiz props) are allowed;
      // dangerous globals stay blocked.
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
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
