/*
 * Artificial Intelligence · Lecture 4 (adversarial search, the course book's Chapter 4): the
 * game-tree numbers its walkthroughs draw. Pure and client-safe, so the scenes, the page's
 * `expect` facts and the worked example in the text all come from the same code.
 *
 * The worked example is the book's two-ply tree (its Figure "6.2", AIMA's Figure 5.2): MAX
 * moves a1, a2 or a3 to the MIN nodes B, C and D, and MIN replies with b1…d3.
 */

export type Player = "max" | "min";
export type Leaf = { id: string; utility: number };
export type Inner = { id: string; turn: Player; children: readonly GameTree[] };
/** A game-tree node: a terminal state with its utility for MAX, or a node where `turn` moves. */
export type GameTree = Leaf | Inner;

export const isLeaf = (n: GameTree): n is Leaf => "utility" in n;
const leaf = (id: string, utility: number): Leaf => ({ id, utility });
const inner = (id: string, turn: Player, children: readonly GameTree[]): Inner => ({ id, turn, children });

/** The worked example. Leaf ids are the moves that reach them (b1 = MIN's first reply to a1). */
export const WORKED: Inner = inner("A", "max", [
  inner("B", "min", [leaf("b1", 3), leaf("b2", 12), leaf("b3", 8)]),
  inner("C", "min", [leaf("c1", 2), leaf("c2", 4), leaf("c3", 6)]),
  inner("D", "min", [leaf("d1", 14), leaf("d2", 5), leaf("d3", 2)]),
]);

/** The move MAX plays to reach each MIN node of the worked example. */
export const ROOT_MOVES: Readonly<Record<string, string>> = { B: "a1", C: "a2", D: "a3" };

/** The Practice tree: three ply (MAX, MIN, MAX), two moves everywhere. */
export const EXERCISE: Inner = inner("A", "max", [
  inner("B", "min", [inner("D", "max", [leaf("d1", 3), leaf("d2", 5)]), inner("E", "max", [leaf("e1", 6), leaf("e2", 9)])]),
  inner("C", "min", [inner("F", "max", [leaf("f1", 1), leaf("f2", 2)]), inner("G", "max", [leaf("g1", 0), leaf("g2", -1)])]),
]);

/* ---------- Minimax ---------- */

/** MINIMAX(s): the utility for MAX, assuming both players play optimally from s. */
export function minimax(n: GameTree): number {
  if (isLeaf(n)) return n.utility;
  const values = n.children.map(minimax);
  return n.turn === "max" ? Math.max(...values) : Math.min(...values);
}

/** The minimax value of every node, by id. */
export function minimaxValues(tree: GameTree): Record<string, number> {
  const out: Record<string, number> = {};
  (function walk(n: GameTree) {
    out[n.id] = minimax(n);
    if (!isLeaf(n)) n.children.forEach(walk);
  })(tree);
  return out;
}

/** The child the player to move picks: the first with the best backed-up value. */
export function bestChild(n: Inner): GameTree {
  const values = n.children.map(minimax);
  const target = n.turn === "max" ? Math.max(...values) : Math.min(...values);
  return n.children[values.indexOf(target)];
}

/** Every node in the order a depth-first minimax visits it. */
export function dfsOrder(tree: GameTree): string[] {
  const out: string[] = [];
  (function walk(n: GameTree) {
    out.push(n.id);
    if (!isLeaf(n)) n.children.forEach(walk);
  })(tree);
  return out;
}

export function leafIds(tree: GameTree): string[] {
  return dfsOrder(tree).filter((id) => isLeaf(find(tree, id)));
}

export function find(tree: GameTree, id: string): GameTree {
  const hit = findOrNull(tree, id);
  if (!hit) throw new Error(`ai-lecture-04: no node "${id}"`);
  return hit;
}

function findOrNull(tree: GameTree, id: string): GameTree | null {
  if (tree.id === id) return tree;
  if (isLeaf(tree)) return null;
  for (const c of tree.children) {
    const hit = findOrNull(c, id);
    if (hit) return hit;
  }
  return null;
}

/* ---------- Alpha–beta ---------- */

/** What a node shows at one moment of the search. */
export type NodeView = {
  /** "open": on the current path; "done": returned its value; "cut": returned early (pruned the rest) */
  state: "open" | "done" | "cut";
  alpha: number;
  beta: number;
  /** The best value found so far (MAX: −∞ upwards, MIN: +∞ downwards); exact once done */
  v: number;
};

/** The search after one leaf has been read and everything it caused has been backed up. */
export type Stage = {
  /** The leaf just read */
  leaf: string;
  nodes: Readonly<Record<string, NodeView>>;
  /** Leaves read so far, in order */
  read: readonly string[];
  /** Leaves that will never be read, as far as is known at this point */
  pruned: readonly string[];
};

export type AlphaBetaRun = {
  value: number;
  /** MAX's chosen child at the root */
  best: string;
  read: readonly string[];
  pruned: readonly string[];
  /** Nodes that returned early because v ≤ α (MIN) or v ≥ β (MAX) */
  cutAt: readonly string[];
  stages: readonly Stage[];
};

/**
 * ALPHA-BETA-SEARCH exactly as the book's pseudocode (AIMA Figure 5.7): v and the move are
 * updated when a child improves v, then α (MAX) or β (MIN), then the cutoff test.
 */
export function alphaBeta(tree: Inner): AlphaBetaRun {
  const views: Record<string, NodeView> = {};
  const read: string[] = [];
  const pruned: string[] = [];
  const cutAt: string[] = [];
  const stages: Stage[] = [];
  let pending: string | null = null;

  const flush = () => {
    if (pending === null) return;
    stages.push({ leaf: pending, nodes: structuredClone(views), read: [...read], pruned: [...pruned] });
    pending = null;
  };

  function search(n: GameTree, alpha: number, beta: number): number {
    if (isLeaf(n)) {
      flush();
      read.push(n.id);
      pending = n.id;
      return n.utility;
    }
    flush();
    const isMax = n.turn === "max";
    let v = isMax ? -Infinity : Infinity;
    views[n.id] = { state: "open", alpha, beta, v };
    for (let i = 0; i < n.children.length; i++) {
      const v2 = search(n.children[i], alpha, beta);
      if (isMax ? v2 > v : v2 < v) {
        v = v2;
        if (isMax) alpha = Math.max(alpha, v);
        else beta = Math.min(beta, v);
      }
      views[n.id] = { state: "open", alpha, beta, v };
      if (isMax ? v >= beta : v <= alpha) {
        const rest = n.children.slice(i + 1);
        if (rest.length) {
          cutAt.push(n.id);
          rest.forEach((c) => pruned.push(...leafIds(c)));
          views[n.id] = { state: "cut", alpha, beta, v };
        } else views[n.id] = { state: "done", alpha, beta, v };
        return v;
      }
    }
    views[n.id] = { state: "done", alpha, beta, v };
    return v;
  }

  const value = search(tree, -Infinity, Infinity);
  flush();
  const best = tree.children.find((c) => minimax(c) === value && !pruned.includes(c.id))?.id ?? tree.children[0].id;
  return { value, best, read, pruned, cutAt, stages };
}

/* ---------- Move ordering ---------- */

export type Ordering = "worst" | "book" | "best";

/**
 * The same tree with every node's moves reordered. "best": each player's best move first
 * (MAX: highest minimax value, MIN: lowest), the order perfect pruning needs; "worst": the
 * reverse; "book": as given. The sort is stable, so ties keep the book's order.
 */
export function orderTree(n: GameTree, order: Ordering): GameTree {
  if (isLeaf(n) || order === "book") return n;
  const best = order === "best";
  const children = n.children
    .map((c) => orderTree(c, order))
    .map((c, i) => ({ c, i, v: minimax(c) }))
    .sort((a, b) => {
      const d = n.turn === "max" ? b.v - a.v : a.v - b.v;
      return (best ? d : -d) || a.i - b.i;
    })
    .map((x) => x.c);
  return { id: n.id, turn: n.turn, children };
}

/** Leaves read by alpha–beta under each ordering of the worked example: 9, 7, 5. */
export const ORDERING_READ: Readonly<Record<Ordering, number>> = {
  worst: alphaBeta(orderTree(WORKED, "worst") as Inner).read.length,
  book: alphaBeta(WORKED).read.length,
  best: alphaBeta(orderTree(WORKED, "best") as Inner).read.length,
};

/**
 * Leaves examined by alpha–beta with perfect ordering in a uniform tree of branching factor
 * b and depth m (Knuth and Moore, 1975): b^⌈m/2⌉ + b^⌊m/2⌋ − 1, which is O(b^(m/2)).
 */
export const bestCaseLeaves = (b: number, m: number) => b ** Math.ceil(m / 2) + b ** Math.floor(m / 2) - 1;

/* ---------- Growth: b^m against b^(m/2) ---------- */

export const GROWTH_B = 3;
export const GROWTH = [2, 4, 6, 8].map((m) => ({ m, minimax: GROWTH_B ** m, alphaBeta: GROWTH_B ** (m / 2) }));

/* ---------- Chess (book §4.5.3, AIMA §5.2–5.3) ---------- */

export const CHESS = { b: 35, m: 80, nodesPerSecond: 1_000_000, seconds: 60 } as const;
/** Nodes searched in one minute at a million nodes per second: 60 million. */
export const CHESS_BUDGET = CHESS.nodesPerSecond * CHESS.seconds;
/** The full chess tree, 35^80, as a power of ten: about 10^123. */
export const CHESS_TREE_EXP = Math.floor(CHESS.m * Math.log10(CHESS.b));

/**
 * The deepest search (in ply) the budget allows when a search to depth m costs b^(factor·m)
 * nodes: factor 1 for minimax, 3/4 for alpha–beta with random ordering, 1/2 with perfect ordering.
 */
export const plyFor = (budget: number, b: number, factor: number) => Math.floor(Math.log(budget) / Math.log(b) / factor + 1e-9);

export const CHESS_PLY = {
  minimax: plyFor(CHESS_BUDGET, CHESS.b, 1),
  random: plyFor(CHESS_BUDGET, CHESS.b, 3 / 4),
  alphaBeta: plyFor(CHESS_BUDGET, CHESS.b, 1 / 2),
  /** The book's figures for a full program and for Stockfish */
  enhanced: 14,
  stockfish: 30,
} as const;

/** 35^5 = 52,521,875: five ply of full minimax fits in the 60-million-node budget. */
export const CHESS_5PLY = CHESS.b ** CHESS_PLY.minimax;
/** √35 ≈ 5.92: alpha–beta's effective branching factor with perfect ordering. */
export const CHESS_EBF = Math.round(Math.sqrt(CHESS.b) * 100) / 100;

/* ---------- Small examples the scenes draw ---------- */

/** Tic-tac-toe has fewer than 9! terminal nodes. */
export const TTT_LEAVES = Array.from({ length: 9 }, (_, i) => i + 1).reduce((p, k) => p * k, 1);

/** Rain or rival: MAX's two moves and the two outcomes each can lead to. */
export const INTENTION = { L: [8, 0], R: [3, 4] } as const;
const mean = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
export const INTENTION_VALUES = {
  random: { L: mean(INTENTION.L), R: mean(INTENTION.R) },
  adversary: { L: Math.min(...INTENTION.L), R: Math.min(...INTENTION.R) },
} as const;
export const intentionChoice = (mode: "random" | "adversary") => (INTENTION_VALUES[mode].L >= INTENTION_VALUES[mode].R ? "L" : "R");

/** Ten fast random playouts from one position: 1 = MAX won. */
export const PLAYOUTS = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0] as const;
export const PLAYOUT_WINS = PLAYOUTS.reduce<number>((s, x) => s + x, 0);

/** A weighted linear evaluation function, EVAL(s) = Σ wᵢ fᵢ(s). */
export const FEATURES = [
  { id: "material", value: 2, weight: 1 },
  { id: "mobility", value: 6, weight: 0.1 },
  { id: "king", value: -2, weight: 0.5 },
] as const;
const round2 = (x: number) => Math.round(x * 100) / 100;
export const FEATURE_TERMS = FEATURES.map((f) => round2(f.value * f.weight));
export const EVAL_VALUE = round2(FEATURE_TERMS.reduce((s, x) => s + x, 0));

/** The horizon effect: at the cutoff MAX has just taken a knight (+3); next move MIN takes the queen (−9). */
export const HORIZON = { atCutoff: 3, afterRecapture: 3 - 9 } as const;

/** Forward pruning: MAX's five moves at the root, in the order a shallow search scores them. */
export const FORWARD_MOVES = [
  { id: "m1", shallow: 6 },
  { id: "m2", shallow: 5 },
  { id: "m3", shallow: 3 },
  { id: "m4", shallow: 1 },
  { id: "m5", shallow: -2 },
] as const;
export const BEAM_WIDTH = 2;

/* ---------- The worked example, as the page states it ---------- */

const WORKED_VALUES = minimaxValues(WORKED);
const WORKED_RUN = alphaBeta(WORKED);

export const WORKED_FACTS = {
  root: WORKED_VALUES.A,
  B: WORKED_VALUES.B,
  C: WORKED_VALUES.C,
  D: WORKED_VALUES.D,
  move: ROOT_MOVES[bestChild(WORKED).id],
  reply: bestChild(bestChild(WORKED) as Inner).id,
  leaves: leafIds(WORKED).length,
  nodes: dfsOrder(WORKED).length,
  read: WORKED_RUN.read.length,
  pruned: WORKED_RUN.pruned.join(", "),
  readWorst: ORDERING_READ.worst,
  readBook: ORDERING_READ.book,
  readBest: ORDERING_READ.best,
  bestCase: bestCaseLeaves(3, 2),
} as const;

/** The value a leaf or node shows in a scene: −∞ and +∞ as symbols. */
export const show = (x: number) => (x === Infinity ? "+∞" : x === -Infinity ? "−∞" : x < 0 ? `−${-x}` : String(x));
