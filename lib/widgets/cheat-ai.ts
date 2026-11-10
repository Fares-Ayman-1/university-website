import { cityName, inversions, pathCost, road, solvable, type Board } from "./ai-lecture-02";
import {
  bestFirst,
  CITIES,
  fringeBefore,
  GOAL,
  H_SLD,
  manhattan,
  misplaced,
  PUZZLE_GOAL,
  PUZZLE_START,
  START,
  tileDistances,
  type FringeNode,
} from "./ai-lecture-04";

/*
 * Artificial Intelligence · Cheat sheet calculators: the numbers behind <SearchCostCalc>,
 * <AStarTable> and <PuzzleHeuristics>.
 *
 * 1. Worst-case node counts for the uninformed strategies, counted the way Lecture 3
 *    (03-uninformed-search.mdx) counts them: nodes generated, goal at the far right of depth d,
 *    the root left out unless `root` is set (the page leaves it out for b = 10, d = 5 and counts
 *    it in its b = 2 practice). Exact BigInts, so b = 20, d = 12 and b^m stay exact.
 * 2. The fringe table of greedy best-first search and A* on the Romania map, with the search of
 *    Lecture 4 (04-informed-search.mdx, via bestFirst in ai-lecture-04.ts): tree search, h_SLD,
 *    children alphabetically, goal tested when a node is removed, ties first in, first out.
 * 3. The 8-puzzle's h1 (misplaced tiles, blank excluded) and h2 (Manhattan distances), from
 *    ai-lecture-04.ts, with the working laid out tile by tile.
 *
 * Pure and client-safe: the server wrappers check `expect` with these functions and the
 * players recompute with them as the visitor edits the inputs.
 */

/* ============================================================
   1. Worst-case node counts (Lecture 3)
   ============================================================ */

/** Accepted input ranges (b and d as the calculator's spec; m and l generous). */
export const COST_RANGE = { b: { min: 1, max: 20 }, d: { min: 0, max: 12 }, m: { min: 0, max: 40 }, l: { min: 0, max: 40 } } as const;

/** Exponents above this are not written out digit by digit: b^(1+⌊C* ÷ ε⌋) can be astronomically large. */
export const MAX_EXPONENT = 400;

export type CostInputs = {
  /** Branching factor */
  b: number;
  /** Depth of the shallowest goal */
  d: number;
  /** Maximum depth of the tree (DFS) */
  m?: number | null;
  /** Depth limit (DLS) */
  l?: number | null;
  /** Cost of the optimal solution (UCS) */
  cstar?: number | null;
  /** Smallest step cost (UCS) */
  eps?: number | null;
  /** Count the root (depth 0) as a generated node. Lecture 3's b = 10 example leaves it out. */
  root?: boolean;
};

export type CostKey = "bfs-gen" | "bfs-exp" | "ids" | "dfs" | "dls" | "ucs" | "bidi";
export const COST_KEYS: readonly CostKey[] = ["bfs-gen", "bfs-exp", "ids", "dfs", "dls", "ucs", "bidi"];

/** One term of a count: its value, and how it is built when it is a product ("5·10"). */
export type CostTerm = { value: bigint; product?: string };

export type CostRow = {
  key: CostKey;
  /** The count in symbols, "^" for powers: "b + b^2 + … + b^d" */
  formula: string;
  /** The terms with the numbers plugged in, in the order they are added */
  terms: CostTerm[];
  /** Their sum; null when an input it needs is missing or the number is too large to write out */
  total: bigint | null;
  /** Inputs this row needs that are not set */
  missing: ("m" | "l" | "cstar" | "eps")[];
  /** Big-O bounds, "^" for powers */
  time: string;
  space: string;
  /** A linear space bound evaluated: b·d, b·m or b·l */
  spaceValue?: { product: string; value: bigint };
  /** UCS only: C* ÷ ε, its floor and ceiling, the exponent 1 + ⌊C* ÷ ε⌋, and the slides' b^⌈C* ÷ ε⌉ */
  ucs?: { quotient: number; floor: number; ceil: number; exponent: number; slides: bigint | null };
  /** When the total is too large to write out: its base-10 logarithm */
  log10?: number;
};

/** b^k exactly. */
export const power = (b: number, k: number): bigint => BigInt(b) ** BigInt(k);

const sumOf = (terms: readonly CostTerm[]) => terms.reduce((s, t) => s + t.value, 0n);

/** The levels from depth `from` to depth `to` of a uniform tree: b^from, …, b^to. */
const levels = (b: number, from: number, to: number): CostTerm[] => {
  const out: CostTerm[] = [];
  for (let k = from; k <= to; k++) out.push({ value: power(b, k) });
  return out;
};

/**
 * 1234567n → "1,234,567". Up to 18 digits are written in full; longer numbers as
 * "≈ 1.074 × 10^39" ("^" marks the power for the player to typeset).
 */
export function formatCount(n: bigint): string {
  const negative = n < 0n;
  const digits = (negative ? -n : n).toString();
  if (digits.length <= 18) return (negative ? "−" : "") + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let exponent = digits.length - 1;
  let mantissa = Math.round(Number(digits.slice(0, 5)) / 10) / 1000; // 4 significant digits
  if (mantissa >= 10) {
    mantissa /= 10;
    exponent += 1;
  }
  return `${negative ? "−" : ""}≈ ${mantissa.toFixed(3)} × 10^${exponent}`;
}

/** C* ÷ ε, snapped to the nearest integer when floating point lands a hair off it (0.3 / 0.1). */
export function costQuotient(cstar: number, eps: number): number {
  const q = cstar / eps;
  const r = Math.round(q);
  return Math.abs(q - r) < 1e-12 * Math.max(1, Math.abs(q)) ? r : q;
}

/** Why the inputs are out of range, or null when they are fine. */
export function costInputError(input: CostInputs): string | null {
  const int = (name: "b" | "d" | "m" | "l", value: number | null | undefined, optional: boolean) => {
    if (value === null || value === undefined) return optional ? null : `${name} is required`;
    const { min, max } = COST_RANGE[name];
    return Number.isInteger(value) && value >= min && value <= max ? null : `${name}=${value} must be a whole number from ${min} to ${max}`;
  };
  const problems = [int("b", input.b, false), int("d", input.d, false), int("m", input.m, true), int("l", input.l, true)];
  if (input.cstar !== null && input.cstar !== undefined && !(Number.isFinite(input.cstar) && input.cstar >= 0)) problems.push(`cstar=${input.cstar} must be 0 or more`);
  if (input.eps !== null && input.eps !== undefined && !(Number.isFinite(input.eps) && input.eps > 0)) problems.push(`eps=${input.eps} must be more than 0`);
  return problems.filter(Boolean).join("; ") || null;
}

/**
 * Every strategy's worst-case count of nodes generated, with its working:
 * - BFS, goal tested on generation: b + b² + … + b^d (1 + … with the root)
 * - BFS, goal tested on expansion: the same + b(b^d − 1), i.e. + b^(d+1) − b
 * - IDS: d·b + (d−1)·b² + … + 1·b^d ((d+1)·1 + … with the root): level k is generated d + 1 − k times
 * - DFS to the maximum depth m, and DLS to the limit l: b + … + b^m (or b^l)
 * - UCS: b^(1+⌊C* ÷ ε⌋) (AIMA's bound; the slides write b^⌈C* ÷ ε⌉)
 * - Bidirectional: 2·b^(d/2) (b^⌈d/2⌉ + b^⌊d/2⌋ when d is odd)
 */
export function costRows(input: CostInputs): CostRow[] {
  const { b, d } = input;
  const root = input.root ?? false;
  const r0 = root ? 0 : 1;
  const one = root ? "1 + " : "";
  const rows: CostRow[] = [];

  const gen = levels(b, r0, d);
  rows.push({ key: "bfs-gen", formula: `${one}b + b^2 + … + b^d`, terms: gen, total: sumOf(gen), missing: [], time: "O(b^d)", space: "O(b^d)" });

  const extra: CostTerm = { value: BigInt(b) * (power(b, d) - 1n), product: `${b}·(${formatCount(power(b, d))} − 1)` };
  const exp = [...gen, extra];
  rows.push({ key: "bfs-exp", formula: `${one}b + b^2 + … + b^d + b(b^d − 1)`, terms: exp, total: sumOf(exp), missing: [], time: "O(b^(d+1))", space: "O(b^(d+1))" });

  const ids: CostTerm[] = [];
  for (let k = r0; k <= d; k++) {
    const times = d + 1 - k;
    ids.push({ value: BigInt(times) * power(b, k), product: `${times}·${formatCount(power(b, k))}` });
  }
  rows.push({
    key: "ids",
    formula: `${root ? "(d+1)·1 + " : ""}d·b + (d−1)·b^2 + … + 1·b^d`,
    terms: ids,
    total: sumOf(ids),
    missing: [],
    time: "O(b^d)",
    space: "O(bd)",
    spaceValue: { product: `${b}·${d}`, value: BigInt(b * d) },
  });

  const deep = (key: "dfs" | "dls", name: "m" | "l", depth: number | null | undefined): CostRow => {
    const base = { key, formula: `${one}b + b^2 + … + b^${name}`, time: `O(b^${name})`, space: `O(b${name})` };
    if (depth === null || depth === undefined) return { ...base, terms: [], total: null, missing: [name] };
    const terms = levels(b, r0, depth);
    return { ...base, terms, total: sumOf(terms), missing: [], spaceValue: { product: `${b}·${depth}`, value: BigInt(b * depth) } };
  };
  rows.push(deep("dfs", "m", input.m));
  rows.push(deep("dls", "l", input.l));

  const ucsBase = { key: "ucs" as const, formula: "b^(1+⌊C*/ε⌋)", time: "O(b^(1+⌊C*/ε⌋))", space: "O(b^(1+⌊C*/ε⌋))" };
  const { cstar, eps } = input;
  if (cstar === null || cstar === undefined || eps === null || eps === undefined || !(eps > 0)) {
    const missing: CostRow["missing"] = [];
    if (cstar === null || cstar === undefined) missing.push("cstar");
    if (eps === null || eps === undefined || !(eps > 0)) missing.push("eps");
    rows.push({ ...ucsBase, terms: [], total: null, missing });
  } else {
    const quotient = costQuotient(cstar, eps);
    const floor = Math.floor(quotient);
    const ceil = Math.ceil(quotient);
    const exponent = 1 + floor;
    const ucs = { quotient, floor, ceil, exponent, slides: ceil <= MAX_EXPONENT ? power(b, ceil) : null };
    if (exponent > MAX_EXPONENT) rows.push({ ...ucsBase, terms: [], total: null, missing: [], ucs, log10: exponent * Math.log10(b) });
    else {
      const terms = [{ value: power(b, exponent), product: `${b}^${exponent}` }];
      rows.push({ ...ucsBase, terms, total: sumOf(terms), missing: [], ucs });
    }
  }

  const half = d / 2;
  const bidi: CostTerm[] =
    d % 2 === 0
      ? [{ value: 2n * power(b, half), product: `2·${formatCount(power(b, half))}` }]
      : [{ value: power(b, Math.ceil(half)) }, { value: power(b, Math.floor(half)) }];
  rows.push({
    key: "bidi",
    formula: d % 2 === 0 ? "2·b^(d/2)" : "b^⌈d/2⌉ + b^⌊d/2⌋",
    terms: bidi,
    total: sumOf(bidi),
    missing: [],
    time: "O(b^(d/2))",
    space: "O(b^(d/2))",
  });

  return rows;
}

/** Every node of levels 0…d, the root included, and the shortcut (b^(d+1) − 1)/(b − 1) for it (no denominator when b = 1). */
export function closedForm(b: number, d: number): { all: bigint; numerator: bigint; denominator: bigint | null } {
  const all = sumOf(levels(b, 0, d));
  if (b === 1) return { all, numerator: all, denominator: null };
  const numerator = power(b, d + 1) - 1n;
  const denominator = BigInt(b - 1);
  if (numerator / denominator !== all || numerator % denominator !== 0n) throw new Error(`closedForm: the geometric series disagrees for b=${b} d=${d}`);
  return { all, numerator, denominator };
}

/** a ÷ b to six decimals (null when b = 0). */
export const ratio = (a: bigint, b: bigint): number | null => (b === 0n ? null : Number((a * 1_000_000n) / b) / 1_000_000);

/** The totals by key, plus `ratio` = IDS ÷ BFS (goal test on generation). */
export function costFacts(input: CostInputs): Record<CostKey, bigint | null> & { ratio: number | null } {
  const totals = Object.fromEntries(costRows(input).map((r) => [r.key, r.total])) as Record<CostKey, bigint | null>;
  return { ...totals, ratio: totals.ids !== null && totals["bfs-gen"] !== null ? ratio(totals.ids, totals["bfs-gen"]) : null };
}

const COST_INPUT = /^(b|d|m|l|cstar|eps)=(\d+(?:\.\d+)?)$/;

/** "b=2 d=3 root" applied over `base`. Throws on a token it cannot read. */
export function parseCostInputs(text: string, base: CostInputs): CostInputs {
  const input: CostInputs = { ...base };
  for (const token of text.trim().split(/\s+/).filter(Boolean)) {
    if (token === "root" || token === "no-root") {
      input.root = token === "root";
      continue;
    }
    const match = COST_INPUT.exec(token);
    if (!match) throw new Error(`cannot read "${token}" (use b=10, d=5, m=…, l=…, cstar=…, eps=…, root)`);
    input[match[1] as "b" | "d" | "m" | "l" | "cstar" | "eps"] = Number(match[2]);
  }
  return input;
}

const describe = (input: CostInputs) =>
  [`b=${input.b}`, `d=${input.d}`, ...(["m", "l", "cstar", "eps"] as const).filter((k) => input[k] !== null && input[k] !== undefined).map((k) => `${k}=${input[k]}`), ...(input.root ? ["root"] : [])].join(" ");

/**
 * Checks an `expect` like "b=10 d=5 => ids=123450; bfs-gen=111110; bfs-exp=1111100".
 * Clauses are separated by "|". Each is `[inputs] => outcomes`: the inputs (b=, d=, m=, l=,
 * cstar=, eps= and the flag `root`) override the widget's own props, and each outcome is
 * `<key>=<number>` with key bfs-gen, bfs-exp, ids, dfs, dls, ucs, bidi (whole numbers, commas
 * allowed) or ratio (IDS ÷ BFS on generation, compared to as many decimals as written).
 * Returns one message per failure (empty when everything holds).
 */
export function checkCostExpect(expect: string, base: CostInputs): string[] {
  const failures: string[] = [];
  for (const clause of expect.split("|").map((c) => c.trim()).filter(Boolean)) {
    const arrow = clause.indexOf("=>");
    const left = arrow < 0 ? "" : clause.slice(0, arrow);
    const right = arrow < 0 ? clause : clause.slice(arrow + 2);
    let input: CostInputs;
    try {
      input = parseCostInputs(left, base);
    } catch (error) {
      failures.push((error as Error).message);
      continue;
    }
    const problem = costInputError(input);
    if (problem) {
      failures.push(`${describe(input)}: ${problem}`);
      continue;
    }
    const facts = costFacts(input);
    for (const item of right.split(";").map((s) => s.trim()).filter(Boolean)) {
      const match = /^([a-z-]+)\s*=\s*([\d,_.]+)$/.exec(item);
      if (!match) {
        failures.push(`cannot read "${item}" (use key=number)`);
        continue;
      }
      const [, key, raw] = match;
      const written = raw.replace(/[,_]/g, "");
      if (key === "ratio") {
        const places = written.includes(".") ? written.split(".")[1].length : 0;
        const actual = facts.ratio === null ? "none" : facts.ratio.toFixed(places);
        if (actual !== written) failures.push(`${describe(input)}: ratio is ${actual}, not ${written}`);
        continue;
      }
      if (!(COST_KEYS as readonly string[]).includes(key)) {
        failures.push(`unknown key "${key}" (known: ${COST_KEYS.join(", ")}, ratio)`);
        continue;
      }
      const actual = facts[key as CostKey];
      if (!/^\d+$/.test(written)) failures.push(`${key}=${raw}: write a whole number`);
      else if (actual === null) failures.push(`${describe(input)}: ${key} needs more inputs`);
      else if (actual !== BigInt(written)) failures.push(`${describe(input)}: ${key} is ${actual}, not ${written}`);
    }
  }
  return failures;
}

/* ============================================================
   2. The A* / greedy fringe table (Lecture 4)
   ============================================================ */

export type TableMode = "astar" | "greedy";
export const TABLE_MODES: readonly TableMode[] = ["astar", "greedy"];

export { CITIES as ROMANIA_CITIES, GOAL as ROMANIA_GOAL, START as ROMANIA_START, H_SLD, cityName };

/** "Rimnicu Vilcea", "rimnicu_vilcea" → "Rimnicu_Vilcea"; null when no city matches. */
export function cityId(name: string): string | null {
  const key = name.trim().replace(/[\s_]+/g, "_").toLowerCase();
  return CITIES.find((c) => c.toLowerCase() === key) ?? null;
}

/** A fringe entry as the table shows it: `via` is its parent, `chosen` the one removed this step, `fresh` added by the last expansion. */
export type FringeRow = FringeNode & { via: string | null; chosen: boolean; fresh: boolean };

export type TableStep = {
  /** The fringe before this removal, lowest f first (ties: first in, first out) */
  rows: FringeRow[];
  /** The node removed (always rows[0]) */
  removed: FringeNode;
  /** It holds the goal: the search stops */
  goal: boolean;
  /** The children its expansion puts on the fringe, alphabetically (none at the goal) */
  added: FringeNode[];
  /** Goal entries left waiting on the fringe while a lower f goes first */
  waiting: FringeNode[];
  /** Other entries with the same f as the removed one (it was added earlier) */
  ties: FringeNode[];
  /** Children whose city is already on the removed node's path: tree search adds them again */
  repeats: FringeNode[];
};

export type TableRun = {
  start: string;
  mode: TableMode;
  steps: TableStep[];
  path: string[] | null;
  cost: number | null;
  /** The road lengths that add up to the cost, along the path */
  legs: number[];
  /** Nodes removed from the fringe, the goal included */
  removed: number;
  /** Nodes expanded: removed and not the goal */
  expanded: number;
  /** Nodes generated, the start node included */
  generated: number;
  /** Cities in the order they were removed */
  order: string[];
};

/** Greedy best-first search (f = h) or A* (f = g + h) from `start` to Bucharest, one row set per removal. */
export function fringeTable(start: string, mode: TableMode): TableRun {
  const run = bestFirst(mode, H_SLD, start, GOAL);
  const steps = run.steps.map((step, i): TableStep => {
    const before = fringeBefore(run, i);
    const fresh = new Set((i === 0 ? run.initial : run.steps[i - 1].added).map((n) => n.seq));
    const removed = step.removed;
    return {
      rows: before.map((n) => ({ ...n, via: n.path.length > 1 ? n.path[n.path.length - 2] : null, chosen: n.seq === removed.seq, fresh: fresh.has(n.seq) })),
      removed,
      goal: step.goal,
      added: step.added,
      waiting: before.filter((n) => n.city === GOAL && n.seq !== removed.seq),
      ties: before.filter((n) => n.seq !== removed.seq && n.f === removed.f),
      repeats: step.added.filter((n) => removed.path.includes(n.city)),
    };
  });
  const path = run.path ? [...run.path] : null;
  const legs = path ? path.slice(1).map((city, i) => road(path[i], city)) : [];
  if (path && pathCost(path) !== run.cost) throw new Error(`fringeTable: the path cost from ${start} disagrees with its roads`);
  return {
    start,
    mode,
    steps,
    path,
    cost: run.cost,
    legs,
    removed: run.steps.length,
    expanded: run.steps.filter((s) => !s.goal).length,
    generated: run.generated,
    order: run.order,
  };
}

const listOf = (text: string) => text.split(",").map((s) => cityId(s) ?? `?${s.trim()}`);
const printed = (list: readonly string[] | null) => (list ? list.map(cityName).join(",") : "none");

/**
 * Checks an `expect` like "Arad => astar=418; greedy=450". Clauses are separated by "|".
 * Each is `<start city> => outcomes`, each outcome `<mode>[-<field>]=<value>` with mode astar or
 * greedy and field omitted (the path cost in km), removed, expanded or generated (counts),
 * order (cities removed, comma-separated) or path. Returns one message per failure.
 */
export function checkTableExpect(expect: string): string[] {
  const failures: string[] = [];
  for (const clause of expect.split("|").map((c) => c.trim()).filter(Boolean)) {
    const arrow = clause.indexOf("=>");
    if (arrow < 0) {
      failures.push(`"${clause}": write <start city> => astar=…`);
      continue;
    }
    const start = cityId(clause.slice(0, arrow));
    if (!start) {
      failures.push(`unknown start city "${clause.slice(0, arrow).trim()}"`);
      continue;
    }
    for (const item of clause.slice(arrow + 2).split(";").map((s) => s.trim()).filter(Boolean)) {
      const match = /^(astar|greedy)(?:-(removed|expanded|generated|order|path))?\s*=\s*(.+)$/.exec(item);
      if (!match) {
        failures.push(`cannot read "${item}" (use astar=…, greedy-removed=…, astar-order=…)`);
        continue;
      }
      const [, mode, field, value] = match;
      const run = fringeTable(start, mode as TableMode);
      const label = `${cityName(start)} ${mode}${field ? `-${field}` : ""}`;
      if (field === "order" || field === "path") {
        const actual = printed(field === "order" ? run.order : run.path);
        const written = printed(listOf(value));
        if (actual !== written) failures.push(`${label} is ${actual}, not ${value.trim()}`);
      } else {
        const actual = String(field ? run[field as "removed" | "expanded" | "generated"] : (run.cost ?? "none"));
        if (actual !== value.trim()) failures.push(`${label} is ${actual}, not ${value.trim()}`);
      }
    }
  }
  return failures;
}

/* ============================================================
   3. The 8-puzzle's h1 and h2 (Lecture 4)
   ============================================================ */

/** Lecture 2's start and goal, which Lecture 4 uses for h1 = 6 and h2 = 14. */
export const LECTURE_BOARD: Board = PUZZLE_START;
export const LECTURE_GOAL: Board = PUZZLE_GOAL;

export { inversions, type Board };

export type BoardParse = { board: Board; error?: undefined } | { board?: undefined; error: "symbol" | "count" | "repeat" };

/**
 * "7 2 4 / 5 _ 6 / 8 3 1", "724506831" or "7,2,4,5,0,6,8,3,1" → [7, 2, 4, 5, 0, 6, 8, 3, 1].
 * The blank is 0, "_" or "."; spaces, commas, slashes and bars separate. The board must hold
 * 0–8 once each.
 */
export function parseBoard(text: string): BoardParse {
  const cells = text.replace(/[\s,/|;]+/g, "").split("").filter(Boolean);
  if (cells.some((c) => !/^[0-8_.]$/.test(c))) return { error: "symbol" };
  if (cells.length !== 9) return { error: "count" };
  const board = cells.map((c) => (c === "_" || c === "." ? 0 : Number(c)));
  if (new Set(board).size !== 9) return { error: "repeat" };
  return { board };
}

/** [7, 2, 4, 5, 0, 6, 8, 3, 1] → "7 2 4 / 5 _ 6 / 8 3 1", the way the page writes a board. */
export const boardText = (board: Board) =>
  [0, 3, 6].map((i) => board.slice(i, i + 3).map((t) => (t === 0 ? "_" : String(t))).join(" ")).join(" / ");

/** The board with the contents of squares i and j exchanged. */
export function swapTiles(board: Board, i: number, j: number): Board {
  const next = [...board];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Square index → [row, column], both from 1. */
export const squareOf = (index: number): [number, number] => [Math.floor(index / 3) + 1, (index % 3) + 1];

/** One tile's share of h1 and h2: where it is, where it belongs, and the rows + columns between. */
export type TileWork = { tile: number; at: number; to: number; rows: number; cols: number; distance: number; misplaced: boolean };

export type PuzzleWork = {
  /** The tiles in the board's reading order, the blank left out (the order Lecture 4 writes h2's sum in) */
  tiles: TileWork[];
  /** The misplaced tiles, in reading order */
  misplaced: number[];
  h1: number;
  h2: number;
  /** Same inversion parity as the goal: the goal can be reached */
  solvable: boolean;
  inversions: { board: number; goal: number };
};

/** h1 and h2 of `board` against `goal`, with the working. */
export function puzzleWork(board: Board, goal: Board): PuzzleWork {
  const distances = tileDistances(board, goal);
  const tiles = board.flatMap((tile, at): TileWork[] => {
    if (tile === 0) return [];
    const to = goal.indexOf(tile);
    const rows = Math.abs(Math.floor(at / 3) - Math.floor(to / 3));
    const cols = Math.abs((at % 3) - (to % 3));
    if (rows + cols !== distances[at]) throw new Error(`puzzleWork: tile ${tile}'s distance disagrees with tileDistances`);
    return [{ tile, at, to, rows, cols, distance: distances[at], misplaced: to !== at }];
  });
  const h1 = misplaced(board, goal);
  const h2 = manhattan(board, goal);
  if (h1 !== tiles.filter((t) => t.misplaced).length || h2 !== tiles.reduce((s, t) => s + t.distance, 0)) throw new Error("puzzleWork: h1 or h2 disagrees with ai-lecture-04");
  return {
    tiles,
    misplaced: tiles.filter((t) => t.misplaced).map((t) => t.tile),
    h1,
    h2,
    solvable: solvable(board, goal),
    inversions: { board: inversions(board), goal: inversions(goal) },
  };
}

/** Checks an `expect` like "h1=6; h2=14" against `board` and `goal`. Returns one message per failure. */
export function checkPuzzleExpect(expect: string, board: Board, goal: Board): string[] {
  const work = puzzleWork(board, goal);
  const failures: string[] = [];
  for (const item of expect.split(";").map((s) => s.trim()).filter(Boolean)) {
    const match = /^(h1|h2)\s*=\s*(\d+)$/.exec(item);
    if (!match) failures.push(`cannot read "${item}" (use h1=… or h2=…)`);
    else if (String(work[match[1] as "h1" | "h2"]) !== match[2]) failures.push(`${match[1]} is ${work[match[1] as "h1" | "h2"]}, not ${match[2]} (board ${boardText(board)}, goal ${boardText(goal)})`);
  }
  return failures;
}
