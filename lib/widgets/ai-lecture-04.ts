import { DIRS, OPTIMAL, PUZZLE_GOAL, PUZZLE_START, ROMANIA_EDGES, VIA_FAGARAS, VIA_RIMNICU, cityName, moveBlank, neighbours, pathCost, type Board } from "./ai-lecture-02";

/*
 * Artificial Intelligence · Lecture 4 (content/subjects/artificial-intelligence/lectures/04-informed-search.mdx):
 * the searches and numbers its walkthrough scenes draw. Best-first search on the Romania map
 * (uniform-cost, greedy best-first and A*, tree-like as in the book's figures, goal test on
 * removal), the straight-line-distance heuristic and the true road distances it estimates,
 * an overestimating heuristic, a small graph where an admissible but inconsistent heuristic
 * misleads graph search, and the 8-puzzle's h1 and h2. Pure and client-safe, so the scenes,
 * the page's `expect` facts and the worked examples in the text share one set of numbers.
 */

/* ---------- The Romania map (roads from Lecture 2) ---------- */

export const START = "Arad";
export const GOAL = "Bucharest";
/** The optimal route (418 km) and the one greedy best-first search returns (450 km), from Lecture 2. */
export const OPTIMAL_ROUTE: readonly string[] = [...VIA_RIMNICU];
export const GREEDY_ROUTE: readonly string[] = [...VIA_FAGARAS];

const ROADS = ROMANIA_EDGES.split(" ").map((token) => {
  const [pair, km] = token.split(":");
  const [from, to] = pair.split("-");
  return { from, to, km: Number(km) };
});

/** Every city id ("Rimnicu_Vilcea"), alphabetically. */
export const CITIES: readonly string[] = [...new Set(ROADS.flatMap((r) => [r.from, r.to]))].sort();

/** The roads, both ways counted once: from, to, km. */
export const roads = () => ROADS.map((r) => ({ ...r }));

/** "Rimnicu_Vilcea" → "R": the 20 cities have 20 different initials. */
export const initial = (city: string) => city[0];

if (new Set(CITIES.map(initial)).size !== CITIES.length) throw new Error("ai-lecture-04: two Romania cities share an initial");

/** A list of cities as the page prints it: "Arad,Sibiu,Rimnicu Vilcea". */
export const names = (list: readonly string[] | null) => (list ? list.map(cityName).join(",") : "none");

/* ---------- The straight-line-distance heuristic ---------- */

/**
 * h_SLD: straight-line distances to Bucharest in km (AIMA, Section 3.5.1). The course book
 * prints only the eight in BOOK_H (its Figure 3.17) and implies Pitesti's.
 */
export const H_SLD: Readonly<Record<string, number>> = {
  Arad: 366,
  Bucharest: 0,
  Craiova: 160,
  Dobreta: 242,
  Eforie: 161,
  Fagaras: 176,
  Giurgiu: 77,
  Hirsova: 151,
  Iasi: 226,
  Lugoj: 244,
  Mehadia: 241,
  Neamt: 234,
  Oradea: 380,
  Pitesti: 100,
  Rimnicu_Vilcea: 193,
  Sibiu: 253,
  Timisoara: 329,
  Urziceni: 80,
  Vaslui: 199,
  Zerind: 374,
};

/** The h-values printed in the book (Figure 3.17, and h_SLD(Arad) = 366 in the text). */
export const BOOK_H: readonly string[] = ["Arad", "Sibiu", "Timisoara", "Zerind", "Fagaras", "Oradea", "Rimnicu_Vilcea", "Bucharest"];
/** Pitesti's value follows from the book's "Pitesti (f = 417)": 417 − g(Pitesti). */
export const IMPLIED_H: readonly string[] = ["Pitesti"];

if (CITIES.some((c) => H_SLD[c] === undefined) || Object.keys(H_SLD).length !== CITIES.length) throw new Error("ai-lecture-04: H_SLD must give one value per city");

/** h*(n): the true cost of the cheapest road route from each city to `goal` (Dijkstra). */
export function trueCosts(goal = GOAL): Record<string, number> {
  const dist: Record<string, number> = { [goal]: 0 };
  const done = new Set<string>();
  while (done.size < CITIES.length) {
    const open = CITIES.filter((c) => !done.has(c) && dist[c] !== undefined);
    if (!open.length) break;
    const u = open.reduce((a, b) => (dist[b] < dist[a] ? b : a));
    done.add(u);
    for (const { to, km } of neighbours(u)) if (dist[to] === undefined || dist[u] + km < dist[to]) dist[to] = dist[u] + km;
  }
  return dist;
}

export const H_STAR: Readonly<Record<string, number>> = trueCosts();

/** Admissible: h(n) ≤ h*(n) for every city. */
export const isAdmissible = (h: Readonly<Record<string, number>>) => CITIES.every((c) => h[c] <= H_STAR[c]);
/** Consistent: h(n) ≤ c(n, n') + h(n') across every road, both ways, and h(goal) = 0. */
export const isConsistent = (h: Readonly<Record<string, number>>) => h[GOAL] === 0 && ROADS.every((r) => h[r.from] <= r.km + h[r.to] && h[r.to] <= r.km + h[r.from]);

/** The overestimating heuristic of the page: h_SLD with Pitesti's 100 raised to 200 (true cost 101). */
export const OVER_CITY = "Pitesti";
export const OVER_VALUE = 200;
export const H_OVER: Readonly<Record<string, number>> = { ...H_SLD, [OVER_CITY]: OVER_VALUE };

/* ---------- Best-first search (tree-like, goal test on removal) ---------- */

export type Strategy = "ucs" | "greedy" | "astar";

/** One node on the fringe: the path to it, g, h and the f the strategy orders by. */
export type FringeNode = { city: string; path: readonly string[]; g: number; h: number; f: number; seq: number };

export type BestFirstStep = {
  /** The node removed from the front of the fringe */
  removed: FringeNode;
  goal: boolean;
  /** Its children, in the order they were generated (neighbours alphabetically) */
  added: FringeNode[];
  /** The fringe after the step, lowest f first (ties: first in, first out) */
  fringe: FringeNode[];
};

export type BestFirstRun = {
  strategy: Strategy;
  /** The fringe before the first removal: just the start node */
  initial: FringeNode[];
  steps: BestFirstStep[];
  /** Every city removed, in order, ending with the goal */
  order: string[];
  path: string[] | null;
  cost: number | null;
  /** Nodes generated, the start node included */
  generated: number;
};

/** f(n) for each strategy: g for uniform-cost, h for greedy best-first, g + h for A*. */
export const evalF = (strategy: Strategy, g: number, h: number) => (strategy === "ucs" ? g : strategy === "greedy" ? h : g + h);

const byF = (a: FringeNode, b: FringeNode) => a.f - b.f || a.seq - b.seq;

/**
 * The page's best-first TREE-SEARCH: the fringe is a priority queue ordered by f; remove the
 * lowest-f node, return it if it holds the goal, else add all its children (repeated states
 * included, as in the book's figures). Children are generated alphabetically.
 */
export function bestFirst(strategy: Strategy, h: Readonly<Record<string, number>> = H_SLD, start = START, goal = GOAL, maxSteps = 1000): BestFirstRun {
  let seq = 0;
  const make = (city: string, path: readonly string[], g: number): FringeNode => ({ city, path, g, h: h[city], f: evalF(strategy, g, h[city]), seq: seq++ });
  let fringe: FringeNode[] = [make(start, [start], 0)];
  const initial = [...fringe];
  const steps: BestFirstStep[] = [];
  let generated = 1;
  while (fringe.length && steps.length < maxSteps) {
    const [removed, ...rest] = fringe;
    if (removed.city === goal) {
      steps.push({ removed, goal: true, added: [], fringe: rest });
      return { strategy, initial, steps, order: steps.map((s) => s.removed.city), path: [...removed.path], cost: removed.g, generated };
    }
    const added = neighbours(removed.city).map(({ to, km }) => make(to, [...removed.path, to], removed.g + km));
    generated += added.length;
    fringe = [...rest, ...added].sort(byF);
    steps.push({ removed, goal: false, added, fringe });
  }
  return { strategy, initial, steps, order: steps.map((s) => s.removed.city), path: null, cost: null, generated };
}

/** The fringe before step i (i = 0: the start node only). */
export const fringeBefore = (run: BestFirstRun, i: number) => (i === 0 ? run.initial : run.steps[i - 1].fringe);

/** Cities in the order they are first removed (repeats dropped). */
export const firstVisits = (run: BestFirstRun) => [...new Set(run.order)];

export const UCS_RUN = bestFirst("ucs");
export const GREEDY_RUN = bestFirst("greedy");
export const ASTAR_RUN = bestFirst("astar");
/** A* with the overestimating heuristic H_OVER. */
export const OVER_RUN = bestFirst("astar", H_OVER);

/** Every node A* generated, with what became of it: expanded, the goal, or still waiting. */
export function generatedNodes(run: BestFirstRun): { node: FringeNode; fate: "expanded" | "goal" | "waiting" }[] {
  const removed = new Set(run.steps.map((s) => s.removed.seq));
  const goalSeq = run.steps.find((s) => s.goal)?.removed.seq;
  const all = [...run.initial, ...run.steps.flatMap((s) => s.added)];
  return all.map((node) => ({ node, fate: node.seq === goalSeq ? "goal" : removed.has(node.seq) ? "expanded" : "waiting" }));
}

/** The first step after which the goal is on the fringe, and the f it has there. */
export function goalFirstSeen(run: BestFirstRun): { step: number; f: number } | null {
  for (let i = 0; i < run.steps.length; i++) {
    const hit = run.steps[i].added.find((n) => n.city === GOAL);
    if (hit) return { step: i, f: hit.f };
  }
  return null;
}

/* The worked examples the page prints. */
if (names(GREEDY_RUN.path) !== names(VIA_FAGARAS) || GREEDY_RUN.cost !== pathCost(VIA_FAGARAS)) throw new Error(`ai-lecture-04: greedy returns ${names(GREEDY_RUN.path)} (${GREEDY_RUN.cost})`);
if (names(ASTAR_RUN.path) !== names(VIA_RIMNICU) || ASTAR_RUN.cost !== pathCost(VIA_RIMNICU)) throw new Error(`ai-lecture-04: A* returns ${names(ASTAR_RUN.path)} (${ASTAR_RUN.cost})`);
if (UCS_RUN.cost !== OPTIMAL.cost || names(firstVisits(UCS_RUN)) !== names(OPTIMAL.order)) throw new Error("ai-lecture-04: tree-like UCS disagrees with Lecture 2's uniform-cost run");
if (!isAdmissible(H_SLD) || !isConsistent(H_SLD)) throw new Error("ai-lecture-04: h_SLD should be admissible and consistent");
if (isAdmissible(H_OVER)) throw new Error("ai-lecture-04: H_OVER should overestimate");

/** Nodes A* removes with f below the optimal cost C*: it must expand all of them. */
export const belowCStar = (run: BestFirstRun, cStar: number) => generatedNodes(run).filter((n) => n.node.f < cStar);

/* ---------- Greedy best-first looping (AIMA's Iasi → Fagaras) ---------- */

/**
 * Only the order of the estimates matters: by straight line, Neamt looks closest to Fagaras,
 * then Iasi, then Vaslui (AIMA, Section 3.5.1). The ranks stand for that order, not for km.
 */
export const LOOP_RANK: Readonly<Record<string, number>> = { Neamt: 1, Iasi: 2, Vaslui: 3 };

/** The first `count` nodes greedy tree-like search removes from Iasi: it never leaves the Iasi–Neamt loop. */
export function greedyLoop(count: number): string[] {
  let seq = 0;
  let fringe = [{ city: "Iasi", rank: LOOP_RANK.Iasi, seq: seq++ }];
  const order: string[] = [];
  while (order.length < count && fringe.length) {
    const [top, ...rest] = fringe;
    order.push(top.city);
    const kids = neighbours(top.city).map(({ to }) => {
      if (LOOP_RANK[to] === undefined) throw new Error(`greedyLoop: no rank for ${to}`);
      return { city: to, rank: LOOP_RANK[to], seq: seq++ };
    });
    fringe = [...rest, ...kids].sort((a, b) => a.rank - b.rank || a.seq - b.seq);
  }
  return order;
}

/* ---------- Graph search needs a consistent heuristic ---------- */

/** A one-way toy graph: S → A → C → G is the cheapest route (5); S → B → C → G costs 6. */
export const TOY_EDGES: readonly (readonly [string, string, number])[] = [
  ["S", "A", 1],
  ["S", "B", 1],
  ["A", "C", 1],
  ["B", "C", 2],
  ["C", "G", 3],
];
export const TOY_NODES = ["S", "A", "B", "C", "G"] as const;
/** Admissible but inconsistent: h(A) = 4 is the true cost from A, yet 4 > c(A, C) + h(C) = 2. */
export const TOY_H_INCONSISTENT: Readonly<Record<string, number>> = { S: 2, A: 4, B: 1, C: 1, G: 0 };
/** The same with h(A) = 2: consistent. */
export const TOY_H_CONSISTENT: Readonly<Record<string, number>> = { S: 2, A: 2, B: 1, C: 1, G: 0 };

const toyOut = (n: string) => TOY_EDGES.filter((e) => e[0] === n).map(([, to, cost]) => ({ to, cost }));

/** True cost from each toy node to G. */
export const TOY_H_STAR: Readonly<Record<string, number>> = (() => {
  const best: Record<string, number> = { G: 0 };
  for (const n of ["C", "A", "B", "S"]) best[n] = Math.min(...toyOut(n).map((e) => e.cost + best[e.to]));
  return best;
})();

export const toyAdmissible = (h: Readonly<Record<string, number>>) => TOY_NODES.every((n) => h[n] <= TOY_H_STAR[n]);
export const toyConsistent = (h: Readonly<Record<string, number>>) => TOY_EDGES.every(([a, b, c]) => h[a] <= c + h[b]);

export type ToyStep = { node: string; g: number; f: number; path: string[]; kind: "expand" | "skip" | "goal" };

/** Lecture 3's GRAPH-SEARCH with A*'s f = g + h: a state already in the closed set is skipped when removed. */
export function toyGraphAstar(h: Readonly<Record<string, number>>): { steps: ToyStep[]; path: string[]; cost: number } {
  let seq = 0;
  let fringe = [{ node: "S", g: 0, f: h.S, path: ["S"], seq: seq++ }];
  const closed = new Set<string>();
  const steps: ToyStep[] = [];
  while (fringe.length) {
    const [top, ...rest] = fringe;
    fringe = rest;
    if (top.node === "G") {
      steps.push({ node: top.node, g: top.g, f: top.f, path: top.path, kind: "goal" });
      return { steps, path: top.path, cost: top.g };
    }
    if (closed.has(top.node)) {
      steps.push({ node: top.node, g: top.g, f: top.f, path: top.path, kind: "skip" });
      continue;
    }
    closed.add(top.node);
    steps.push({ node: top.node, g: top.g, f: top.f, path: top.path, kind: "expand" });
    const kids = toyOut(top.node).map(({ to, cost }) => ({ node: to, g: top.g + cost, f: top.g + cost + h[to], path: [...top.path, to], seq: seq++ }));
    fringe = [...fringe, ...kids].sort((a, b) => a.f - b.f || a.seq - b.seq);
  }
  throw new Error("toyGraphAstar: G unreachable");
}

export const TOY_INCONSISTENT_RUN = toyGraphAstar(TOY_H_INCONSISTENT);
export const TOY_CONSISTENT_RUN = toyGraphAstar(TOY_H_CONSISTENT);

if (!toyAdmissible(TOY_H_INCONSISTENT) || toyConsistent(TOY_H_INCONSISTENT) || !toyConsistent(TOY_H_CONSISTENT) || !toyAdmissible(TOY_H_CONSISTENT)) {
  throw new Error("ai-lecture-04: the toy heuristics are not what the page says");
}
if (TOY_INCONSISTENT_RUN.cost <= TOY_H_STAR.S || TOY_CONSISTENT_RUN.cost !== TOY_H_STAR.S) throw new Error("ai-lecture-04: the toy graph does not show the consistency trap");

/* ---------- The 8-puzzle's h1 and h2 (Lecture 2's start and goal) ---------- */

export { PUZZLE_GOAL, PUZZLE_START };

/** h1: tiles not on their goal square (the blank is not a tile). */
export const misplaced = (board: Board, goal: Board = PUZZLE_GOAL) => board.filter((t, i) => t !== 0 && goal[i] !== t).length;

/** Each tile's Manhattan distance to its goal square, by board position (0 for the blank). */
export const tileDistances = (board: Board, goal: Board = PUZZLE_GOAL, size = 3) =>
  board.map((t, i) => {
    if (t === 0) return 0;
    const j = goal.indexOf(t);
    return Math.abs(Math.floor(i / size) - Math.floor(j / size)) + Math.abs((i % size) - (j % size));
  });

/** h2: the sum of the tiles' Manhattan distances. */
export const manhattan = (board: Board, goal: Board = PUZZLE_GOAL) => tileDistances(board, goal).reduce((s, v) => s + v, 0);

export type PuzzleH = "h1" | "h2";
const PUZZLE_HS: Record<PuzzleH, (b: Board) => number> = { h1: (b) => misplaced(b), h2: (b) => manhattan(b) };

/** A binary min-heap on (f, seq). */
class Heap<T extends { f: number; seq: number }> {
  private a: T[] = [];
  get size() {
    return this.a.length;
  }
  private less = (i: number, j: number) => this.a[i].f < this.a[j].f || (this.a[i].f === this.a[j].f && this.a[i].seq < this.a[j].seq);
  push(x: T) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(i, p)) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop(): T | undefined {
    const a = this.a;
    if (!a.length) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.less(l, m)) m = l;
        if (r < a.length && this.less(r, m)) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

const puzzleCache: Partial<Record<PuzzleH, { cost: number; expanded: number }>> = {};

/**
 * A* graph search on the 8-puzzle from Lecture 2's start to its goal: the solution cost and the
 * number of states expanded (the goal not counted). The blank moves up, down, left, right;
 * ties on f go first in, first out. Computed on first use and cached.
 */
export function puzzleAstar(which: PuzzleH): { cost: number; expanded: number } {
  const cached = puzzleCache[which];
  if (cached) return cached;
  const h = PUZZLE_HS[which];
  const key = (b: Board) => b.join("");
  const goalKey = key(PUZZLE_GOAL);
  const heap = new Heap<{ f: number; seq: number; g: number; board: Board }>();
  const best = new Map<string, number>([[key(PUZZLE_START), 0]]);
  const closed = new Set<string>();
  let seq = 0;
  let expanded = 0;
  heap.push({ f: h(PUZZLE_START), seq: seq++, g: 0, board: PUZZLE_START });
  for (let top = heap.pop(); top; top = heap.pop()) {
    const k = key(top.board);
    if (closed.has(k)) continue;
    if (k === goalKey) return (puzzleCache[which] = { cost: top.g, expanded });
    closed.add(k);
    expanded++;
    for (const dir of DIRS) {
      const next = moveBlank(top.board, dir);
      if (!next) continue;
      const nk = key(next);
      if (closed.has(nk) || top.g + 1 >= (best.get(nk) ?? Infinity)) continue;
      best.set(nk, top.g + 1);
      heap.push({ f: top.g + 1 + h(next), seq: seq++, g: top.g + 1, board: next });
    }
  }
  throw new Error("puzzleAstar: the goal is unreachable");
}
