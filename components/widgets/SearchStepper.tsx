import {
  displayNodeId,
  edgeSegment,
  GRAPH_DOT,
  GRAPH_HEIGHT,
  GRAPH_NODE_R,
  GRAPH_WIDTH,
  graphPosition,
  isMapStyle,
  parseGraphEdges,
  parseGraphNodes,
} from "@/lib/diagrams/graph";
import { layoutTree, TREE_NODE_HEIGHT, treeNodeWidth, type TreeLayout } from "@/lib/diagrams/tree";
import { ALGORITHMS, assertExpect, graphProblem, treeProblem, type Algorithm, type SearchProblem } from "@/lib/widgets/search";
import type { Scene } from "./SearchStepperPlayer";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { SearchStepperPlayer } from "./players";


/** The drawing, laid out by the same code as <WeightedGraph> (lib/diagrams/graph). */
function graphScene(nodes: string, edges: string, directed: boolean, height: number): Scene {
  const nodeList = parseGraphNodes(nodes);
  const mapStyle = isMapStyle(nodeList);
  const r = mapStyle ? GRAPH_DOT : GRAPH_NODE_R;
  const byId = new Map(nodeList.map((n) => [n.id, n]));
  return {
    width: GRAPH_WIDTH,
    height,
    minWidth: 460,
    nodes: nodeList.map((node) => {
      const { x, y } = graphPosition(node, height);
      // Map style: name above the dot, unless that would clip the top edge (as in WeightedGraph).
      const labelY = mapStyle ? (y - 13 < 16 ? y + 22 : y - 13) : y + 5;
      return { id: node.id, label: displayNodeId(node.id), x, y, shape: mapStyle ? "dot" : "circle", w: 2 * r, h: 2 * r, labelY };
    }),
    edges: parseGraphEdges(edges).map((edge) => {
      const a = byId.get(edge.from);
      const b = byId.get(edge.to);
      if (!a || !b) throw new Error(`<SearchStepper>: unknown node in edge ${edge.from}-${edge.to}`);
      const arrow = directed || edge.arrow;
      const segment = edgeSegment(graphPosition(a, height), graphPosition(b, height), r, arrow);
      return { from: edge.from, to: edge.to, ...segment, weight: edge.weight, arrow, twoWay: !arrow };
    }),
  };
}

/** The drawing, laid out by the same code as <Tree> (lib/diagrams/tree). */
function treeScene({ nodes, edges, width, height }: TreeLayout): Scene {
  const half = TREE_NODE_HEIGHT / 2;
  return {
    width,
    height,
    minWidth: Math.min(width, 520),
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
      shape: "pill",
      w: treeNodeWidth(node.label),
      h: TREE_NODE_HEIGHT,
      labelY: node.y + 5,
    })),
    edges: edges.map(([from, to]) => ({
      from: from.id,
      to: to.id,
      x1: from.x,
      y1: from.y + half,
      x2: to.x,
      y2: to.y - half,
      mx: (from.x + to.x) / 2,
      my: (from.y + to.y) / 2,
      arrow: false,
      twoWay: false,
    })),
  };
}

/**
 * Steps through DFS, BFS and (on weighted graphs) UCS, showing the frontier and explored set.
 *
 *   <SearchStepper directed nodes="S:0,50 A:33,8 …" edges="S->A:2 …" start="S" goal="G"
 *     expect="dfs:S,D,G bfs:S,A,B,D,C,G" />
 *   <SearchStepper tree="1(2(4,5),3(6,7))" goal="6" algorithm="bfs" />
 *
 * Graph props are those of <WeightedGraph>; tree props those of <Tree>. `expect`, copied from
 * the page, makes the build fail if the widget would show a different answer; its format is
 * documented at `parseExpect` in lib/widgets/search.ts. Clicking a node in the widget makes it
 * the goal; `expect` only checks the initial props.
 */
export function SearchStepper({
  nodes,
  edges,
  directed = false,
  height = GRAPH_HEIGHT,
  tree,
  start,
  goal,
  algorithm = "dfs",
  expect,
  title = "Watch the frontier: DFS, BFS and UCS",
  titleAr = "راقب الحافة (frontier) في DFS و BFS و UCS",
  caption,
  captionAr,
}: {
  nodes?: string;
  edges?: string;
  directed?: boolean;
  height?: number;
  /** A tree in <Tree> syntax, instead of nodes/edges */
  tree?: string;
  /** Default: the first node (graph) or the root (tree) */
  start?: string;
  goal: string;
  /** The algorithm shown first */
  algorithm?: Algorithm;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  const where = "<SearchStepper>";
  let scene: Scene;
  let problem: SearchProblem;
  if (tree) {
    const layout = layoutTree(tree);
    scene = treeScene(layout);
    problem = treeProblem(layout.root);
    if (start && start !== problem.start) throw new Error(`${where}: on a tree the search starts at the root, ${problem.start}`);
  } else if (nodes && edges) {
    scene = graphScene(nodes, edges, directed, height);
    problem = graphProblem(parseGraphNodes(nodes), parseGraphEdges(edges), directed, start ?? scene.nodes[0].id);
  } else {
    throw new Error(`${where}: give either tree="…" or nodes="…" and edges="…"`);
  }
  if (!problem.nodes.includes(goal)) throw new Error(`${where}: unknown goal "${goal}"`);
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`${where}: unknown algorithm "${algorithm}"`);
  if (algorithm === "ucs" && !problem.weighted) throw new Error(`${where}: UCS needs a weight on every edge`);
  if (expect) assertExpect(problem, goal, expect, where);

  return (
    <WidgetShell
      name="search"
      kicker={bi("Uninformed search", "البحث غير المُوجَّه")}
      title={title}
      titleAr={titleAr}
      caption={caption}
      captionAr={captionAr}
    >
      <SearchStepperPlayer scene={scene} problem={problem} goal={goal} algorithm={algorithm} />
    </WidgetShell>
  );
}
