/**
 * Graph diagrams: parse the WeightedGraph syntax and place nodes and edges. Pure (no React,
 * no imports), so components/mdx/WeightedGraph.tsx and the SearchStepper widget share it.
 *
 *   nodes="S:10,50 A:35,20"      id:x,y on a 0–100 grid
 *   edges="S-A:1 S->B:5 A-G"     from-to or from->to, with an optional :weight
 */

export type GraphNode = { id: string; x: number; y: number };
/** `arrow`: the edge was written "from->to" (rather than "from-to") */
export type GraphEdge = { from: string; to: string; weight?: string; arrow: boolean };

/** "S:10,50 A:35,20" → nodes on a 0–100 grid */
export function parseGraphNodes(source: string): GraphNode[] {
  return source
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [id, coords] = token.split(":");
      const [x, y] = coords.split(",").map(Number);
      return { id, x, y };
    });
}

/** "S-A:1 S-B:5 A-G" → edges with optional weights */
export function parseGraphEdges(source: string): GraphEdge[] {
  return source
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [pair, weight] = token.split(":");
      const [from, to] = pair.split(/->|-/);
      return { from, to, weight, arrow: pair.includes("->") };
    });
}

/** viewBox width; the height is a prop (default GRAPH_HEIGHT) */
export const GRAPH_WIDTH = 640;
export const GRAPH_HEIGHT = 340;
/** Node circle radius */
export const GRAPH_NODE_R = 20;
/** Map-style graphs (long city names) draw small dots with the name beside them. */
export const GRAPH_DOT = 7;

/** Any id longer than two characters switches the drawing to map style (dots and names). */
export const isMapStyle = (nodes: GraphNode[]) => nodes.some((n) => n.id.length > 2);

/** "Rimnicu_Vilcea" → "Rimnicu Vilcea" */
export const displayNodeId = (id: string) => id.replace(/_/g, " ");

/** A node's centre in viewBox units. */
export function graphPosition(node: GraphNode, height: number = GRAPH_HEIGHT) {
  return { x: 40 + (node.x / 100) * (GRAPH_WIDTH - 80), y: 36 + (node.y / 100) * (height - 72) };
}

/**
 * The visible part of an edge between two node centres: trimmed by the node radius at both
 * ends (plus room for the arrowhead when `arrow`), and its midpoint for the weight label.
 */
export function edgeSegment(p: { x: number; y: number }, q: { x: number; y: number }, r: number, arrow: boolean) {
  const len = Math.hypot(q.x - p.x, q.y - p.y);
  const ux = (q.x - p.x) / len;
  const uy = (q.y - p.y) / len;
  return {
    x1: p.x + ux * r,
    y1: p.y + uy * r,
    x2: q.x - ux * (r + (arrow ? 4 : 0)),
    y2: q.y - uy * (r + (arrow ? 4 : 0)),
    mx: (p.x + q.x) / 2,
    my: (p.y + q.y) / 2,
  };
}
