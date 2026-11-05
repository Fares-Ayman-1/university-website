/**
 * Lets authors write `<Ar>` everywhere:
 * - an `<Ar>` alone on its line is parsed as a paragraph wrapping a text element; it is turned
 *   into a block `Ar` (rendered as a div) so it gets the block styling under the English;
 * - an `<Ar>` inside a list item, table cell, sentence or one-line component
 *   (`<Card …>text<Ar>…</Ar></Card>`) stays inline and is renamed to `ArInline`, which renders
 *   a span, so the HTML stays valid (no div inside <p>).
 */
type Node = { type: string; name?: string | null; value?: string; children?: Node[] };

const isAr = (node: Node) =>
  (node.type === "mdxJsxTextElement" || node.type === "mdxJsxFlowElement") && node.name === "Ar";

const isBlank = (node: Node) => node.type === "text" && !node.value?.trim();

export function remarkArabic() {
  return (tree: Node) => {
    const walk = (node: Node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === "paragraph" && child.children) {
          const content = child.children.filter((c) => !isBlank(c));
          if (content.length === 1 && isAr(content[0])) {
            return {
              type: "mdxJsxFlowElement",
              name: "Ar",
              attributes: [],
              children: [{ type: "paragraph", children: content[0].children ?? [] }],
            };
          }
        }
        if (child.type === "mdxJsxTextElement" && child.name === "Ar") child.name = "ArInline";
        return child;
      });
      node.children.forEach(walk);
    };
    walk(tree);
  };
}
