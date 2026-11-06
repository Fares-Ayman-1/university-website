/**
 * Search-tree diagrams: parse the tree DSL and lay it out. Pure (no React, no imports), so
 * components/mdx/Tree.tsx and the SearchStepper widget share one layout.
 *
 * Layout: leaves sit in evenly spaced slots from left to right, each parent is centred over
 * its first and last child, and every depth gets its own row.
 */

export type TreeNode = { id: string; label: string; children: TreeNode[]; x: number; y: number; depth: number };

/**
 * Parses "A(B(D,E),C(F,G))". A label may carry a "#n" suffix to keep ids unique
 * when the same state appears twice ("Arad#2" is displayed as "Arad").
 */
export function parseTree(source: string): TreeNode {
  let i = 0;
  const text = source.replace(/\s+/g, "");

  function readLabel(): string {
    const start = i;
    while (i < text.length && !"(),".includes(text[i])) i++;
    return text.slice(start, i);
  }

  function readNode(depth: number): TreeNode {
    const id = readLabel();
    const node: TreeNode = { id, label: id.split("#")[0], children: [], x: 0, y: 0, depth };
    if (text[i] === "(") {
      i++;
      node.children.push(readNode(depth + 1));
      while (text[i] === ",") {
        i++;
        node.children.push(readNode(depth + 1));
      }
      if (text[i] !== ")") throw new Error(`Tree: expected ")" at ${i} in "${source}"`);
      i++;
    }
    return node;
  }

  return readNode(0);
}

export const TREE_LEVEL_GAP = 78;
export const TREE_SLOT = 70;
export const TREE_PAD = 30;
/** Node pills are 32 units tall; edges start and end 16 units from a node's centre. */
export const TREE_NODE_HEIGHT = 32;

/** Width of a node's pill for its label. */
export function treeNodeWidth(label: string) {
  return Math.max(38, label.length * 8.6 + 20);
}

export type TreeLayout = {
  root: TreeNode;
  /** Every node in pre-order (root, then each subtree left to right) */
  nodes: TreeNode[];
  /** [parent, child] pairs, in the order the layout visits them */
  edges: [TreeNode, TreeNode][];
  width: number;
  height: number;
};

/** Parses and positions the tree (x, y on each node), in viewBox units. */
export function layoutTree(source: string): TreeLayout {
  const root = parseTree(source);
  const nodes: TreeNode[] = [];
  const edges: [TreeNode, TreeNode][] = [];
  let leaf = 0;
  let maxDepth = 0;

  (function layout(node: TreeNode) {
    nodes.push(node);
    maxDepth = Math.max(maxDepth, node.depth);
    node.y = TREE_PAD + 18 + node.depth * TREE_LEVEL_GAP;
    if (node.children.length === 0) {
      node.x = TREE_PAD + leaf * TREE_SLOT + TREE_SLOT / 2;
      leaf++;
      return;
    }
    node.children.forEach((child) => {
      edges.push([node, child]);
      layout(child);
    });
    node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
  })(root);

  const width = TREE_PAD * 2 + leaf * TREE_SLOT;
  const height = TREE_PAD * 2 + 36 + maxDepth * TREE_LEVEL_GAP;
  return { root, nodes, edges, width, height };
}
