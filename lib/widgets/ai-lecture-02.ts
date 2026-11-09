import { graphProblem, runSearch } from "./search";

/*
 * Artificial Intelligence · Lecture 2 (problem solving): the numbers its walkthrough scenes
 * draw, computed here so the page's `expect` can check them against the text: route costs on
 * the Romania map, the vacuum world's states and belief states, and the 8-puzzle's moves and
 * state count. Pure and client-safe.
 */

/** 181440 → "181,440", the way the page prints it. */
export const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* ---------- Romania ---------- */

/** The page's <WeightedGraph> edges, as written there (km). */
export const ROMANIA_EDGES =
  "Arad-Zerind:75 Arad-Sibiu:140 Arad-Timisoara:118 Zerind-Oradea:71 Oradea-Sibiu:151 Timisoara-Lugoj:111 Lugoj-Mehadia:70 Mehadia-Dobreta:75 Dobreta-Craiova:120 Craiova-Rimnicu_Vilcea:146 Craiova-Pitesti:138 Sibiu-Fagaras:99 Sibiu-Rimnicu_Vilcea:80 Rimnicu_Vilcea-Pitesti:97 Fagaras-Bucharest:211 Pitesti-Bucharest:101 Bucharest-Giurgiu:90 Bucharest-Urziceni:85 Urziceni-Hirsova:98 Hirsova-Eforie:86 Urziceni-Vaslui:142 Vaslui-Iasi:92 Iasi-Neamt:87";

const ROADS = ROMANIA_EDGES.split(" ").map((token) => {
  const [pair, km] = token.split(":");
  const [from, to] = pair.split("-");
  return { from, to, km: Number(km) };
});

const CITIES = [...new Set(ROADS.flatMap((r) => [r.from, r.to]))];

/** A city as printed: "Rimnicu_Vilcea" → "Rimnicu Vilcea". */
export const cityName = (id: string) => id.replace(/_/g, " ");

/** The road length between two neighbouring cities (throws for cities that aren't neighbours). */
export function road(a: string, b: string): number {
  const r = ROADS.find((x) => (x.from === a && x.to === b) || (x.from === b && x.to === a));
  if (!r) throw new Error(`No road ${a}–${b}`);
  return r.km;
}

/** Neighbours of a city with their road lengths, alphabetically. */
export const neighbours = (city: string) =>
  ROADS.filter((r) => r.from === city || r.to === city)
    .map((r) => ({ to: r.from === city ? r.to : r.from, km: r.km }))
    .sort((a, b) => (a.to < b.to ? -1 : 1));

/** The path cost so far after each city of a path: [0, 140, 239, …]. */
export const runningCost = (path: readonly string[]) => path.reduce<number[]>((acc, city, i) => [...acc, i === 0 ? 0 : acc[i - 1] + road(path[i - 1], city)], []);

/** g(path): the sum of the step costs. */
export const pathCost = (path: readonly string[]) => runningCost(path)[path.length - 1];

/** The slide's example solution, and the shortest route. */
export const VIA_FAGARAS = ["Arad", "Sibiu", "Fagaras", "Bucharest"] as const;
export const VIA_RIMNICU = ["Arad", "Sibiu", "Rimnicu_Vilcea", "Pitesti", "Bucharest"] as const;
/** A path that never reaches the goal: not a solution. */
export const DEAD_END = ["Arad", "Zerind", "Oradea"] as const;

const romania = graphProblem(
  CITIES.map((id) => ({ id })),
  ROADS.map((r) => ({ from: r.from, to: r.to, weight: String(r.km), arrow: false })),
  false,
  "Arad",
);
/** Uniform-cost search from Arad: the optimal route and its cost. */
export const OPTIMAL = runSearch(romania, "ucs", "Bucharest");

if (OPTIMAL.path?.join() !== VIA_RIMNICU.join() || OPTIMAL.cost !== pathCost(VIA_RIMNICU)) {
  throw new Error(`ai-lecture-02: the shortest Arad–Bucharest route is ${OPTIMAL.path?.join(" → ")} (${OPTIMAL.cost} km), not via Rimnicu Vilcea`);
}

/* ---------- The vacuum world ---------- */

export type Square = "A" | "B";
export type VacuumState = { robot: Square; dirtA: boolean; dirtB: boolean };
export type VacuumAction = "Left" | "Right" | "Suck" | "NoOp";

/**
 * The slides' numbering (slide 10): odd states have the robot in A, even ones in B;
 * 1–2 both squares dirty, 3–4 only A dirty, 5–6 only B dirty, 7–8 both clean.
 */
export function vacuumState(n: number): VacuumState {
  const i = n - 1;
  const dirt = Math.floor(i / 2);
  return { robot: i % 2 === 0 ? "A" : "B", dirtA: dirt === 0 || dirt === 1, dirtB: dirt === 0 || dirt === 2 };
}

export function vacuumNumber(s: VacuumState): number {
  const dirt = s.dirtA && s.dirtB ? 0 : s.dirtA ? 1 : s.dirtB ? 2 : 3;
  return dirt * 2 + (s.robot === "A" ? 1 : 2);
}

/** The deterministic transition model RESULT(s, a). */
export function vacuumResult(n: number, action: VacuumAction): number {
  const s = vacuumState(n);
  if (action === "Left") return vacuumNumber({ ...s, robot: "A" });
  if (action === "Right") return vacuumNumber({ ...s, robot: "B" });
  if (action === "Suck") return vacuumNumber(s.robot === "A" ? { ...s, dirtA: false } : { ...s, dirtB: false });
  return n;
}

/** States in a world of n squares: n robot positions × 2^n dirt patterns. */
export const vacuumCount = (squares: number) => squares * 2 ** squares;

export const VACUUM_STATES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
if (VACUUM_STATES.length !== vacuumCount(2)) throw new Error("ai-lecture-02: the vacuum world should have 8 states");

/** The implicit goal test NoDirt(x). */
export const noDirt = (n: number) => !vacuumState(n).dirtA && !vacuumState(n).dirtB;
export const VACUUM_GOALS = VACUUM_STATES.filter(noDirt);

/** Every action that changes the state: the arrows of the state-space graph (slide 13). */
export const VACUUM_EDGES = VACUUM_STATES.flatMap((n) =>
  (["Left", "Right", "Suck"] as const).map((a) => ({ from: n, action: a, to: vacuumResult(n, a) })).filter((e) => e.to !== e.from),
);

/** A belief state (a set of states) after each action of a plan, starting with `start`. */
export function beliefTrace(start: readonly number[], plan: readonly VacuumAction[]): number[][] {
  const sets = [[...start].sort((a, b) => a - b)];
  for (const action of plan) {
    const next = [...new Set(sets[sets.length - 1].map((n) => vacuumResult(n, action)))].sort((a, b) => a - b);
    sets.push(next);
  }
  return sets;
}

/** Single-state: start in #5. */
export const SINGLE_PLAN: readonly VacuumAction[] = ["Right", "Suck"];
export const SINGLE_TRACE = beliefTrace([5], SINGLE_PLAN);
/** Conformant: start anywhere. */
export const CONFORMANT_PLAN: readonly VacuumAction[] = ["Right", "Suck", "Left", "Suck"];
export const CONFORMANT_TRACE = beliefTrace(VACUUM_STATES, CONFORMANT_PLAN);

if (!SINGLE_TRACE[SINGLE_TRACE.length - 1].every(noDirt) || !CONFORMANT_TRACE[CONFORMANT_TRACE.length - 1].every(noDirt)) {
  throw new Error("ai-lecture-02: a vacuum plan does not end in a clean world");
}

/* ---------- The 8-puzzle ---------- */

/** Tiles row by row; 0 is the blank. */
export type Board = readonly number[];
export type Dir = "up" | "down" | "left" | "right";
export const DIRS: readonly Dir[] = ["up", "down", "left", "right"];

/** The slides' start and goal states (slide 18). */
export const PUZZLE_START: Board = [7, 2, 4, 5, 0, 6, 8, 3, 1];
export const PUZZLE_GOAL: Board = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const STEP: Record<Dir, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

/** Where the blank goes when it moves `dir`, or null when it would leave the board. */
export function blankTarget(board: Board, dir: Dir, size = 3): number | null {
  const at = board.indexOf(0);
  const r = Math.floor(at / size) + STEP[dir][0];
  const c = (at % size) + STEP[dir][1];
  return r < 0 || r >= size || c < 0 || c >= size ? null : r * size + c;
}

/** RESULT(s, dir): the blank swaps with the tile it moves onto. */
export function moveBlank(board: Board, dir: Dir, size = 3): Board | null {
  const to = blankTarget(board, dir, size);
  if (to === null) return null;
  const next = [...board];
  const from = board.indexOf(0);
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** The legal actions in a state. */
export const legalMoves = (board: Board, size = 3) => DIRS.filter((d) => blankTarget(board, d, size) !== null);

export const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

/** Arrangements of the tiles and the blank on a size × size board, and the half reachable from any one of them. */
export const arrangements = (size: number) => factorial(size * size);
export const reachable = (size: number) => arrangements(size) / 2;

/** Pairs of tiles out of order (the blank ignored). On a 3 × 3 board a slide never changes its parity. */
export function inversions(board: Board): number {
  const tiles = board.filter((t) => t !== 0);
  let count = 0;
  for (let i = 0; i < tiles.length; i++) for (let j = i + 1; j < tiles.length; j++) if (tiles[i] > tiles[j]) count++;
  return count;
}

/** Same parity on a 3 × 3 board: the goal can be reached from the start. */
export const solvable = (start: Board, goal: Board) => inversions(start) % 2 === inversions(goal) % 2;

if (!solvable(PUZZLE_START, PUZZLE_GOAL)) throw new Error("ai-lecture-02: the slides' 8-puzzle start cannot reach its goal");

/** Actions counted as "move tile t in direction d": 8 tiles × 4 directions. */
export const TILE_ACTIONS = 8 * DIRS.length;
