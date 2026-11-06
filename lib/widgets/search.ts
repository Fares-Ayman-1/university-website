/**
 * Uninformed search, step by step: depth-first (stack), breadth-first (queue) and uniform-cost
 * (priority queue by cumulative path cost), on a graph or a tree. Pure and client-safe (no
 * imports, so it also runs under `node --experimental-strip-types`); checked at build time.
 *
 * The rules follow the AI labs (sections/03-state-space-dfs-bfs.mdx and
 * 04-uniform-cost-search.mdx), so the steps reproduce their trace tables:
 * - The frontier holds whole paths; it starts with the one path [start].
 * - Each step removes one path. If its last node is already explored the path is skipped.
 *   Otherwise the node is marked explored; if it is the goal the path is returned (so the
 *   goal test happens on removal, not when a path is generated); otherwise the path is
 *   extended by every neighbour, explored or not (repeats are only caught when removed,
 *   like the lab's Graph class).
 * - Order in which new paths are added:
 *     graph: neighbours sorted alphabetically and added in that order, so DFS's stack has
 *            the alphabetically last neighbour on top (the lab's tie-breaking rule);
 *     tree:  children left to right; DFS pushes them right to left so the leftmost child
 *            is on top (pre-order).
 * - UCS keeps the list sorted by cumulative cost, ties broken alphabetically by the last
 *   node, then by the whole path ([S,A,C,D] before [S,B,D], as in the lab's UCS table).
 */

export type Algorithm = "dfs" | "bfs" | "ucs";
export const ALGORITHMS: readonly Algorithm[] = ["dfs", "bfs", "ucs"];

export type SearchProblem = {
  kind: "graph" | "tree";
  /** Every node id, in document order */
  nodes: string[];
  /** Successors with step costs: for a graph in edge order, for a tree its children left to right */
  adjacency: Record<string, { to: string; cost: number }[]>;
  /** Every edge carries a numeric weight, so costs mean something and UCS applies */
  weighted: boolean;
  start: string;
};

/** One entry of the frontier: a path from the start, and its cumulative cost. */
export type FrontierPath = { id: number; path: string[]; cost: number };

export type StepKind = "start" | "expand" | "skip" | "goal" | "fail";

export type SearchStep = {
  kind: StepKind;
  /** The path removed from the frontier in this step */
  popped?: FrontierPath;
  /** New paths added in this step, in the order they were added */
  added: FrontierPath[];
  /**
   * The frontier after the step, in display order: a stack bottom → top (top on the right),
   * a queue front → back, a priority queue cheapest first.
   */
  frontier: FrontierPath[];
  /** Explored nodes after the step, in the order they were explored */
  explored: string[];
};

export type SearchRun = {
  algorithm: Algorithm;
  goal: string;
  steps: SearchStep[];
  /** The solution path, or null when the frontier runs empty */
  path: string[] | null;
  cost: number | null;
  /** Expansion order: every node explored, ending with the goal when it is found */
  order: string[];
};

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function comparePaths(a: string[], b: string[]) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const c = compareText(a[i], b[i]);
    if (c) return c;
  }
  return a.length - b.length;
}

/** UCS order: cheapest first, then alphabetically by last node, then by the whole path. */
function byPriority(a: FrontierPath, b: FrontierPath) {
  return (
    a.cost - b.cost ||
    compareText(a.path[a.path.length - 1], b.path[b.path.length - 1]) ||
    comparePaths(a.path, b.path) ||
    a.id - b.id
  );
}

/** Successors in the order their paths are added to the frontier (see the rules above). */
function successors(problem: SearchProblem, node: string, algorithm: Algorithm) {
  const list = [...(problem.adjacency[node] ?? [])];
  if (problem.kind === "graph") return list.sort((a, b) => compareText(a.to, b.to));
  return algorithm === "dfs" ? list.reverse() : list;
}

const MAX_STEPS = 2000;

export function runSearch(problem: SearchProblem, algorithm: Algorithm, goal: string): SearchRun {
  if (algorithm === "ucs" && !problem.weighted) throw new Error("Uniform-cost search needs a weighted graph.");
  let serial = 0;
  let frontier: FrontierPath[] = [{ id: serial++, path: [problem.start], cost: 0 }];
  const explored: string[] = [];
  const steps: SearchStep[] = [{ kind: "start", added: [...frontier], frontier: [...frontier], explored: [] }];

  while (frontier.length > 0) {
    if (steps.length > MAX_STEPS) throw new Error(`Search did not finish within ${MAX_STEPS} steps.`);
    // Stack: newest (end) first. Queue and priority queue: the front.
    const popped = algorithm === "dfs" ? frontier[frontier.length - 1] : frontier[0];
    frontier = algorithm === "dfs" ? frontier.slice(0, -1) : frontier.slice(1);
    const node = popped.path[popped.path.length - 1];

    if (explored.includes(node)) {
      steps.push({ kind: "skip", popped, added: [], frontier: [...frontier], explored: [...explored] });
      continue;
    }
    explored.push(node);
    if (node === goal) {
      steps.push({ kind: "goal", popped, added: [], frontier: [...frontier], explored: [...explored] });
      return { algorithm, goal, steps, path: popped.path, cost: popped.cost, order: [...explored] };
    }

    const added = successors(problem, node, algorithm).map(({ to, cost }) => ({
      id: serial++,
      path: [...popped.path, to],
      cost: popped.cost + cost,
    }));
    frontier = [...frontier, ...added];
    if (algorithm === "ucs") frontier.sort(byPriority);
    steps.push({ kind: "expand", popped, added, frontier: [...frontier], explored: [...explored] });
  }

  steps.push({ kind: "fail", added: [], frontier: [], explored: [...explored] });
  return { algorithm, goal, steps, path: null, cost: null, order: [...explored] };
}

/* ---------- Building a problem from the diagram syntax ---------- */

/**
 * From parsed WeightedGraph props (lib/diagrams/graph). An edge is one-way when the graph is
 * `directed` or the edge is written "from->to"; otherwise it is stored both ways.
 */
export function graphProblem(
  nodes: { id: string }[],
  edges: { from: string; to: string; weight?: string; arrow: boolean }[],
  directed: boolean,
  start: string,
): SearchProblem {
  const ids = nodes.map((n) => n.id);
  const adjacency: SearchProblem["adjacency"] = Object.fromEntries(ids.map((id) => [id, []]));
  const weights = edges.map((e) => (e.weight === undefined || e.weight === "" ? NaN : Number(e.weight)));
  const weighted = edges.length > 0 && weights.every((w) => Number.isFinite(w) && w >= 0);
  edges.forEach((edge, i) => {
    if (!(edge.from in adjacency) || !(edge.to in adjacency)) {
      throw new Error(`Unknown node in edge ${edge.from}-${edge.to}`);
    }
    const cost = weighted ? weights[i] : 1;
    adjacency[edge.from].push({ to: edge.to, cost });
    if (!directed && !edge.arrow) adjacency[edge.to].push({ to: edge.from, cost });
  });
  if (!(start in adjacency)) throw new Error(`Unknown start node "${start}"`);
  return { kind: "graph", nodes: ids, adjacency, weighted, start };
}

type TreeLike = { id: string; children: TreeLike[] };

/** From a parsed tree (lib/diagrams/tree): every edge costs 1 and the root is the start. */
export function treeProblem(root: TreeLike): SearchProblem {
  const nodes: string[] = [];
  const adjacency: SearchProblem["adjacency"] = {};
  (function walk(node: TreeLike) {
    if (node.id in adjacency) throw new Error(`Tree: duplicate node id "${node.id}" (use a #n suffix)`);
    nodes.push(node.id);
    adjacency[node.id] = node.children.map((child) => ({ to: child.id, cost: 1 }));
    node.children.forEach(walk);
  })(root);
  return { kind: "tree", nodes, adjacency, weighted: false, start: root.id };
}

/* ---------- expect: the page's own answers, checked at build time ---------- */

/**
 * `expect` lists what the page states, as space-separated `<algorithm>[.<field>]:<value>`:
 *
 *   dfs:S,D,G         the expansion order: every node explored, in order, ending with the
 *                     goal (the page's "Visited […]" / "Nodes visited")
 *   dfs.path:S,D,G    the solution path returned ("none" when the search fails)
 *   ucs.cost:8        the solution's total cost
 *
 * e.g. expect="dfs:S,D,G dfs.path:S,D,G bfs:S,A,B,D,C,G bfs.path:S,D,G ucs.path:S,A,C,G ucs.cost:8"
 */
export type Expectation = { algorithm: Algorithm; field: "order" | "path" | "cost"; value: string };

export function parseExpect(source: string): Expectation[] {
  return source
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const match = /^(dfs|bfs|ucs)(?:\.(order|path|cost))?:(\S+)$/.exec(token);
      if (!match) throw new Error(`expect: cannot read "${token}" (use e.g. "bfs:S,A,B" or "ucs.path:S,A,G")`);
      return { algorithm: match[1] as Algorithm, field: (match[2] ?? "order") as Expectation["field"], value: match[3] };
    });
}

const ids = (list: string[] | null) => (list ? list.join(",") : "none");

/** Throws (failing the build) when the engine disagrees with the page's own answer. */
export function assertExpect(problem: SearchProblem, goal: string, expect: string, where: string) {
  const runs = new Map<Algorithm, SearchRun>();
  for (const { algorithm, field, value } of parseExpect(expect)) {
    const run = runs.get(algorithm) ?? runSearch(problem, algorithm, goal);
    runs.set(algorithm, run);
    const actual = field === "order" ? ids(run.order) : field === "path" ? ids(run.path) : String(run.cost);
    const wanted = field === "cost" ? String(Number(value)) : value;
    if (actual !== wanted) {
      throw new Error(`${where}: ${algorithm}${field === "order" ? "" : `.${field}`} is ${actual}, but expect says ${value}`);
    }
  }
}
