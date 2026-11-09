/*
 * Artificial Intelligence · Lecture 3 (content/subjects/artificial-intelligence/lectures/03-uninformed-search.mdx):
 * the searches and counts its walkthrough scenes draw. BFS, DFS and UCS runs come from
 * search.ts (runSearch); this file adds what it lacks: depth-limited and iterative-deepening
 * orders, the b/d node-count formulas, goal testing on generation, the repeated-state chain,
 * and the Python listing's own loops. Pure and client-safe, so the scenes and the page's
 * `expect` facts share one set of numbers.
 */

import { parseGraphEdges, parseGraphNodes } from "@/lib/diagrams/graph";
import { layoutTree, parseTree } from "@/lib/diagrams/tree";
import { graphProblem, runSearch, treeProblem, type Algorithm, type FrontierPath, type SearchProblem, type SearchRun } from "./search";

/* ---------- The page's trees ---------- */

/** The BFS tree on the page (and the Python listing's GRAPH). */
export const BFS_TREE = "A(B(D,E),C(F,G))";
/** The DFS / IDS tree on the page; its goal is M. */
export const DFS_TREE = "A(B(D(H,I),E(J,K)),C(F(L,M),G(N,O)))";
export const DFS_GOAL = "M";
/** The Romania tree after expanding Arad and Sibiu (the page's first diagram). */
export const ROMANIA_TREE = "Arad(Sibiu(Arad#2,Fagaras,Oradea,Rimnicu),Timisoara(Arad#3,Lugoj),Zerind(Arad#4,Oradea#2))";
/** A goal no tree contains: the search visits everything and fails. */
export const NO_GOAL = "";

export const join = (list: readonly string[] | null) => (list ? list.join(",") : "none");
/** "A, B, C" as the page prints a visit order. */
export const listed = (list: readonly string[]) => list.map(label).join(", ");
/** "Arad#2" is drawn as "Arad". */
export const label = (id: string) => id.split("#")[0];
/** 1111100 → "1,111,100" */
export const thousands = (n: number) => n.toLocaleString("en-US");

export const treeOf = (source: string) => treeProblem(parseTree(source));

/* ---------- Placing a tree inside a scene ---------- */

export type PlacedNode = { id: string; label: string; x: number; y: number; depth: number; parent: string | null; children: string[] };
export type PlacedTree = { nodes: PlacedNode[]; byId: Record<string, PlacedNode>; edges: [string, string][]; depth: number };

/**
 * The page's tree layout (lib/diagrams/tree), scaled so the leftmost and rightmost node
 * centres sit on the box's left and right edges and the root and deepest level on its top
 * and bottom.
 */
export function placeTree(source: string, box: { x: number; y: number; w: number; h: number }): PlacedTree {
  const { nodes, edges } = layoutTree(source);
  const xs = nodes.map((n) => n.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const depth = Math.max(...nodes.map((n) => n.depth));
  const parent: Record<string, string> = {};
  for (const [from, to] of edges) parent[to.id] = from.id;
  const placed = nodes.map((n) => ({
    id: n.id,
    label: n.label,
    x: maxX === minX ? box.x + box.w / 2 : box.x + ((n.x - minX) / (maxX - minX)) * box.w,
    y: depth === 0 ? box.y : box.y + (n.depth / depth) * box.h,
    depth: n.depth,
    parent: parent[n.id] ?? null,
    children: n.children.map((c) => c.id),
  }));
  return { nodes: placed, byId: Object.fromEntries(placed.map((n) => [n.id, n])), edges: edges.map(([a, b]) => [a.id, b.id]), depth };
}

/** b, d and m of a tree: the most children of any node, the goal's depth, the deepest node. */
export function treeMeasures(source: string, goal: string) {
  const { nodes } = layoutTree(source);
  const goalNode = nodes.find((n) => n.id === goal);
  if (!goalNode) throw new Error(`treeMeasures: no node "${goal}" in ${source}`);
  return { b: Math.max(...nodes.map((n) => n.children.length)), d: goalNode.depth, m: Math.max(...nodes.map((n) => n.depth)) };
}

/* ---------- Traces of runSearch, for the fringe tables ---------- */

export type TraceRow = { node: string | null; kind: SearchRun["steps"][number]["kind"]; fringe: { id: string; cost: number }[] };

/**
 * One row per step: the node removed and the fringe after the step, front first (the node
 * REMOVE-FRONT takes next is on the left). search.ts lists a stack bottom → top, so DFS's is
 * reversed here.
 */
export function traceOf(run: SearchRun): TraceRow[] {
  return run.steps.map((s) => {
    const list = run.algorithm === "dfs" ? [...s.frontier].reverse() : s.frontier;
    return {
      node: s.popped ? s.popped.path[s.popped.path.length - 1] : null,
      kind: s.kind,
      fringe: list.map((p) => ({ id: p.path[p.path.length - 1], cost: p.cost })),
    };
  });
}

/** The largest the fringe gets during a run. */
export const maxFringe = (run: SearchRun) => Math.max(...run.steps.map((s) => s.frontier.length));

/**
 * The nodes held in memory when the run stops. DFS keeps only the solution path and the
 * paths still on its stack (fully explored subtrees are dropped); BFS keeps every node it
 * has generated.
 */
export function memoryAtEnd(run: SearchRun): string[] {
  const last = run.steps[run.steps.length - 1];
  const held = new Set<string>();
  if (run.algorithm === "dfs") {
    for (const id of run.path ?? []) held.add(id);
    for (const p of last.frontier) for (const id of p.path) held.add(id);
  } else {
    for (const id of last.explored) held.add(id);
    for (const p of last.frontier) held.add(p.path[p.path.length - 1]);
  }
  return [...held];
}

/** With several goal states, tree search stops at whichever its order reaches first. */
export function firstGoal(problem: SearchProblem, algorithm: Algorithm, goals: readonly string[]): SearchRun {
  const runs = goals.map((g) => runSearch(problem, algorithm, g)).filter((r) => r.path);
  if (!runs.length) throw new Error("firstGoal: no goal is reachable");
  return runs.reduce((best, r) => (r.order.length < best.order.length ? r : best));
}

/* ---------- Depth-limited and iterative-deepening search (RECURSIVE-DLS on a tree) ---------- */

export type DlsOutcome = "found" | "cutoff" | "failure";
export type DlsRun = {
  limit: number;
  /** Every node goal-tested, in order (the page's "Nodes expanded, in order") */
  order: string[];
  outcome: DlsOutcome;
  path: string[] | null;
  /** Nodes at the limit that have children: their subtrees are cut off */
  cut: string[];
};

/** The page's RECURSIVE-DLS: test the node, return cutoff at the limit, else recurse left to right. */
export function depthLimited(problem: SearchProblem, goal: string, limit: number): DlsRun {
  const order: string[] = [];
  const cut: string[] = [];
  function recurse(node: string, depth: number, path: string[]): string[] | "cutoff" | "failure" {
    order.push(node);
    if (node === goal) return path;
    const children = problem.adjacency[node] ?? [];
    if (depth === limit) {
      if (children.length) cut.push(node);
      return "cutoff";
    }
    let cutoffOccurred = false;
    for (const { to } of children) {
      const result = recurse(to, depth + 1, [...path, to]);
      if (result === "cutoff") cutoffOccurred = true;
      else if (result !== "failure") return result;
    }
    return cutoffOccurred ? "cutoff" : "failure";
  }
  const result = recurse(problem.start, 0, [problem.start]);
  return Array.isArray(result)
    ? { limit, order, outcome: "found", path: result, cut }
    : { limit, order, outcome: result, path: null, cut };
}

/** ITERATIVE-DEEPENING-SEARCH: DLS with limits 0, 1, 2, … until the result is not cutoff. */
export function iterativeDeepening(problem: SearchProblem, goal: string, maxDepth = 50) {
  const runs: DlsRun[] = [];
  for (let limit = 0; limit <= maxDepth; limit++) {
    const run = depthLimited(problem, goal, limit);
    runs.push(run);
    if (run.outcome !== "cutoff") break;
  }
  return { runs, result: runs[runs.length - 1], visited: runs.reduce((s, r) => s + r.order.length, 0) };
}

/* ---------- Counting nodes with b and d ---------- */

export type LevelCount = { depth: number; nodes: number; times: number; total: number };

/**
 * IDS in the worst case (goal at the far right of depth d): level k is generated by every
 * iteration with limit ≥ k, i.e. d + 1 − k times. The page counts the root for b = 2
 * (Practice) and leaves it out for b = 10.
 */
export function idsLevels(b: number, d: number, countRoot: boolean): LevelCount[] {
  const levels: LevelCount[] = [];
  for (let k = countRoot ? 0 : 1; k <= d; k++) levels.push({ depth: k, nodes: b ** k, times: d + 1 - k, total: (d + 1 - k) * b ** k });
  return levels;
}
export const idsGenerated = (b: number, d: number, countRoot: boolean) => idsLevels(b, d, countRoot).reduce((s, l) => s + l.total, 0);

/**
 * BFS in the same worst case: every level down to d, and, when the goal is tested on
 * expansion, the b(b^d − 1) children of every depth-d node except the goal.
 */
export function bfsLevels(b: number, d: number, test: "expansion" | "generation", countRoot: boolean): { depth: number; nodes: number }[] {
  const levels = [];
  for (let k = countRoot ? 0 : 1; k <= d; k++) levels.push({ depth: k, nodes: b ** k });
  if (test === "expansion") levels.push({ depth: d + 1, nodes: b * (b ** d - 1) });
  return levels;
}
export const bfsGenerated = (b: number, d: number, test: "expansion" | "generation", countRoot: boolean) =>
  bfsLevels(b, d, test, countRoot).reduce((s, l) => s + l.nodes, 0);

/** Nodes on level k of a uniform tree, and the share of the whole tree (levels 0…d) on level d. */
export const levelSizes = (b: number, d: number) => Array.from({ length: d + 1 }, (_, k) => b ** k);
export const lastLevelShare = (b: number, d: number) => {
  const sizes = levelSizes(b, d);
  return sizes[d] / sizes.reduce((s, v) => s + v, 0);
};

/** The page's memory figure: 100 MB of new nodes per second (1 GB = 1,000 MB, as the slide counts). */
export const BFS_MB_PER_SECOND = 100;
export const gbAfterHours = (hours: number) => (BFS_MB_PER_SECOND * 3600 * hours) / 1000;

/* ---------- Uniform-cost search: Sibiu to Bucharest on the Romania map ---------- */

/** Part of the Romania map, one way from Sibiu, with road lengths in km. */
export const UCS_MAP = {
  nodes: "Sibiu:0,50 Fagaras:45,10 Rimnicu:30,90 Pitesti:70,90 Bucharest:100,50",
  edges: "Sibiu->Fagaras:99 Sibiu->Rimnicu:80 Rimnicu->Pitesti:97 Fagaras->Bucharest:211 Pitesti->Bucharest:101",
  start: "Sibiu",
  goal: "Bucharest",
} as const;

/** The map as a search problem; `unit` gives every road cost 1. */
export function ucsProblem(unit = false): SearchProblem {
  const edges = parseGraphEdges(UCS_MAP.edges).map((e) => (unit ? { ...e, weight: "1" } : e));
  return graphProblem(parseGraphNodes(UCS_MAP.nodes), edges, true, UCS_MAP.start);
}

/** The roads of UCS_MAP: from, to, km. */
export const ucsRoads = () => parseGraphEdges(UCS_MAP.edges).map((e) => ({ from: e.from, to: e.to, km: Number(e.weight) }));

/** UCS_MAP's towns placed in a box (their 0–100 grid scaled to it). */
export function placeMap(box: { x: number; y: number; w: number; h: number }): Record<string, { x: number; y: number }> {
  return Object.fromEntries(parseGraphNodes(UCS_MAP.nodes).map((n) => [n.id, { x: box.x + (n.x / 100) * box.w, y: box.y + (n.y / 100) * box.h }]));
}

/**
 * What a search that tested for the goal when a path is generated would return: the first
 * goal path added to the fringe, in the same run.
 */
export function goalOnGeneration(run: SearchRun): FrontierPath | null {
  for (const step of run.steps.slice(1)) {
    const hit = step.added.find((p) => p.path[p.path.length - 1] === run.goal);
    if (hit) return hit;
  }
  return null;
}

/** ⌈C* ÷ ε⌉: how many steps of cost ε fit under the optimal cost C* (Infinity when ε = 0). */
export const costDepth = (cStar: number, epsilon: number) => (epsilon > 0 ? Math.ceil(cStar / epsilon) : Infinity);

/* ---------- Choosing a step's place in the fringe ---------- */

export type FringeItem = { id: string; g: number };
export type FringeKind = "fifo" | "lifo" | "priority";

/** INSERT-ALL: new nodes at the back (FIFO), at the front (LIFO), or by path cost g (priority queue). */
export function insertAll(fringe: readonly FringeItem[], children: readonly FringeItem[], kind: FringeKind): FringeItem[] {
  if (kind === "fifo") return [...fringe, ...children];
  if (kind === "lifo") return [...children, ...fringe];
  return [...fringe, ...children].sort((a, b) => a.g - b.g);
}

/** Road lengths (km) on the Romania map for the edges of ROMANIA_TREE. */
export const ROMANIA_KM: Readonly<Record<string, number>> = {
  "Arad-Sibiu": 140,
  "Arad-Timisoara": 118,
  "Arad-Zerind": 75,
  "Fagaras-Sibiu": 99,
  "Oradea-Sibiu": 151,
  "Rimnicu-Sibiu": 80,
  "Lugoj-Timisoara": 111,
  "Oradea-Zerind": 71,
};
export const km = (a: string, b: string) => {
  const key = [label(a), label(b)].sort().join("-");
  const v = ROMANIA_KM[key];
  if (v === undefined) throw new Error(`km: no road ${key}`);
  return v;
};

/** g(n) of every node of a placed tree, from the road lengths. */
export function pathCosts(tree: PlacedTree): Record<string, number> {
  const g: Record<string, number> = {};
  for (const n of tree.nodes) g[n.id] = n.parent ? g[n.parent] + km(n.parent, n.id) : 0;
  return g;
}

/* ---------- Repeated states ---------- */

/**
 * The slide's chain A → B → C → D with `copies` actions from each state to the next,
 * unfolded by tree search into "A(B(C(D,D#2),C#2(D#3,D#4)),B#2(…))".
 */
export function chainTree(states: readonly string[], copies = 2): string {
  const seen: Record<string, number> = {};
  const id = (s: string) => {
    const n = (seen[s] = (seen[s] ?? 0) + 1);
    return n === 1 ? s : `${s}#${n}`;
  };
  const build = (i: number): string => {
    const me = id(states[i]);
    if (i === states.length - 1) return me;
    return `${me}(${Array.from({ length: copies }, () => build(i + 1)).join(",")})`;
  };
  return build(0);
}

/** The same chain as a graph (each action is its own edge), for graph search. */
export function chainProblem(states: readonly string[], copies = 2): SearchProblem {
  const edges = states.slice(1).flatMap((to, i) => Array.from({ length: copies }, () => ({ from: states[i], to, weight: "1", arrow: true })));
  return graphProblem(states.map((id) => ({ id })), edges, true, states[0]);
}

/** In a visit order, the nodes whose state was already visited earlier: graph search skips them. */
export function repeatsIn(order: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeats: string[] = [];
  for (const id of order) {
    if (seen.has(label(id))) repeats.push(id);
    seen.add(label(id));
  }
  return repeats;
}

/* ---------- The page's Python listing, step for step ---------- */

export type PyGraph = Readonly<Record<string, Readonly<Record<string, number>>>>;

/** GRAPH in uninformed_search.py */
export const PY_GRAPH: PyGraph = { A: { B: 1, C: 1 }, B: { D: 1, E: 1 }, C: { F: 1, G: 1 }, D: {}, E: {}, F: {}, G: {} };

export type PyStep = { node: string; fringe: string[] };
export type PyRun = { steps: PyStep[]; parents: Record<string, string | null>; path: string[] | null; cost?: number };

function pathTo(parents: Record<string, string | null>, node: string) {
  const path = [node];
  while (parents[path[path.length - 1]] !== null) path.push(parents[path[path.length - 1]]!);
  return path.reverse();
}

/** bfs() and dfs() from the listing: the fringe after each removal, and the parents dict. */
export function pyBfsDfs(kind: "bfs" | "dfs", graph: PyGraph, start: string, goal: string): PyRun {
  const fringe = [start];
  const parents: Record<string, string | null> = { [start]: null };
  const steps: PyStep[] = [];
  while (fringe.length) {
    const node = kind === "bfs" ? fringe.shift()! : fringe.pop()!;
    if (node === goal) {
      steps.push({ node, fringe: [...fringe] });
      return { steps, parents: { ...parents }, path: pathTo(parents, node) };
    }
    const children = Object.keys(graph[node]);
    for (const child of kind === "bfs" ? children : [...children].reverse()) {
      if (!(child in parents)) {
        parents[child] = node;
        fringe.push(child);
      }
    }
    steps.push({ node, fringe: [...fringe] });
  }
  return { steps, parents, path: null };
}

/** ucs() from the listing: heapq orders (cost, node, path) tuples. */
export function pyUcs(graph: PyGraph, start: string, goal: string): PyRun {
  type Entry = { cost: number; node: string; path: string[] };
  const cmp = (a: Entry, b: Entry) => a.cost - b.cost || (a.node < b.node ? -1 : a.node > b.node ? 1 : 0) || a.path.join().localeCompare(b.path.join());
  const heap: Entry[] = [{ cost: 0, node: start, path: [start] }];
  const best: Record<string, number> = { [start]: 0 };
  const steps: PyStep[] = [];
  while (heap.length) {
    heap.sort(cmp);
    const { cost, node, path } = heap.shift()!;
    if (node === goal) {
      steps.push({ node, fringe: heap.map((e) => e.node) });
      return { steps, parents: {}, path, cost };
    }
    for (const [child, step] of Object.entries(graph[node])) {
      const newCost = cost + step;
      if (newCost < (best[child] ?? Infinity)) {
        best[child] = newCost;
        heap.push({ cost: newCost, node: child, path: [...path, child] });
      }
    }
    steps.push({ node, fringe: [...heap].sort(cmp).map((e) => e.node) });
  }
  return { steps, parents: {}, path: null };
}

export type PyCall = { node: string; limit: number; depth: number; result?: string[] | "cutoff" | null };

/** dls() from the listing: a path, "cutoff", or None (null); `calls` records every call and what it returned. */
export function pyDls(graph: PyGraph, node: string, goal: string, limit: number, path: string[] = [], calls: PyCall[] = []): string[] | "cutoff" | null {
  const call: PyCall = { node, limit, depth: path.length };
  calls.push(call);
  const here = [...path, node];
  const done = (result: string[] | "cutoff" | null) => ((call.result = result), result);
  if (node === goal) return done(here);
  if (limit === 0) return done("cutoff");
  let cutoff = false;
  for (const child of Object.keys(graph[node])) {
    const result = pyDls(graph, child, goal, limit - 1, here, calls);
    if (result === "cutoff") cutoff = true;
    else if (result !== null) return done(result);
  }
  return done(cutoff ? "cutoff" : null);
}

/** ids() from the listing: one dls() call per depth until the result is not "cutoff". */
export function pyIds(graph: PyGraph, start: string, goal: string, maxDepth = 50) {
  const runs: { depth: number; calls: PyCall[]; tested: string[]; result: string[] | "cutoff" | null }[] = [];
  for (let depth = 0; depth <= maxDepth; depth++) {
    const calls: PyCall[] = [];
    const result = pyDls(graph, start, goal, depth, [], calls);
    runs.push({ depth, calls, tested: calls.map((c) => c.node), result });
    if (result !== "cutoff") break;
  }
  return runs;
}

/** Python's repr of a list of strings: ['A', 'C', 'G'] */
export const pyList = (list: readonly string[] | null) => (list ? `[${list.map((s) => `'${s}'`).join(", ")}]` : "None");
