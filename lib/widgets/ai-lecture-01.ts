/*
 * Artificial Intelligence · Lecture 1 (intelligent agents): the page's vacuum world, its two
 * agent programs, the three performance measures, the PEAS tables and the environment table,
 * as pure functions and data. The walkthrough text, its `facts` (checked against the MDX by
 * `expect`) and the scenes all compute from here, so a drawing can't drift from the page.
 */

/* ---------- The vacuum-cleaner world ---------- */

export type Square = "A" | "B";
export type Status = "Clean" | "Dirty";
export type Action = "Left" | "Right" | "Suck" | "NoOp";
export type Percept = readonly [Square, Status];

export const SQUARES = ["A", "B"] as const;
export const ACTIONS: readonly Action[] = ["Left", "Right", "Suck", "NoOp"];
export const PERCEPTS: readonly Percept[] = [
  ["A", "Clean"],
  ["A", "Dirty"],
  ["B", "Clean"],
  ["B", "Dirty"],
];

export const showPercept = (p: Percept) => `[${p[0]}, ${p[1]}]`;
export const isMove = (a: Action) => a === "Left" || a === "Right";

/** reflex_vacuum_agent from the page. */
export function reflexVacuumAgent([location, status]: Percept): Action {
  if (status === "Dirty") return "Suck";
  if (location === "A") return "Right";
  return "Left";
}

/** The reflex agent's condition–action rules, in the order the program tests them. */
export const REFLEX_RULES = [
  { when: "Dirty", action: "Suck" },
  { when: "A", action: "Right" },
  { when: "B", action: "Left" },
] as const;

/** Which rule fires for a percept: the first one whose condition holds. */
export const firedRule = ([location, status]: Percept) => REFLEX_RULES.findIndex((r) => r.when === status || r.when === location);

/** The agent function as a table: percept sequence → action. This agent only reads the last percept. */
export const agentFunction = (sequence: readonly Percept[]): Action => reflexVacuumAgent(sequence[sequence.length - 1]);

/** The six rows of the page's partial table. */
export const TABLE_ROWS: readonly (readonly Percept[])[] = [
  [["A", "Clean"]],
  [["A", "Dirty"]],
  [["B", "Clean"]],
  [["B", "Dirty"]],
  [
    ["A", "Clean"],
    ["A", "Clean"],
  ],
  [
    ["A", "Clean"],
    ["A", "Dirty"],
  ],
];

/** Rows a full table needs for every percept sequence up to length T: 4 + 4² + … + 4^T. */
export const tableSize = (T: number) => Array.from({ length: T }, (_, i) => PERCEPTS.length ** (i + 1)).reduce((s, v) => s + v, 0);

export type World = { at: Square; dirty: Readonly<Record<Square, boolean>> };

/** The page's starting point for the runs: the robot in A, both squares dirty. */
export const START: World = { at: "A", dirty: { A: true, B: true } };

export const perceive = (w: World): Percept => [w.at, w.dirty[w.at] ? "Dirty" : "Clean"];

/** What an action does (deterministic): Suck cleans the square, Left/Right move (a wall stops the robot). */
export function result(w: World, a: Action): World {
  if (a === "Suck") return { at: w.at, dirty: { ...w.dirty, [w.at]: false } };
  if (a === "Right") return { ...w, at: "B" };
  if (a === "Left") return { ...w, at: "A" };
  return w;
}

/** The world after a whole plan. */
export const resultOf = (w: World, plan: readonly Action[]) => plan.reduce(result, w);

export const dirtyCount = (w: World) => SQUARES.filter((s) => w.dirty[s]).length;
export const cleanCount = (w: World) => SQUARES.length - dirtyCount(w);

/* ---------- The agent with state (vacuum_agent_with_state.py) ---------- */

/** Time steps since each square was last cleaned. */
export type Memory = Readonly<Record<Square, number>>;
export const THRESHOLD = 3;
export const FRESH: Memory = { A: Infinity, B: Infinity };

/** One call of the page's `program(percept)`: returns the updated memory and the action. */
export function stateAgentStep(memory: Memory, [location, status]: Percept, threshold = THRESHOLD): { memory: Memory; action: Action } {
  const m = { A: memory.A + 1, B: memory.B + 1 };
  if (status === "Dirty") {
    m[location] = 0;
    return { memory: m, action: "Suck" };
  }
  const other: Square = location === "A" ? "B" : "A";
  if (m[other] > threshold) return { memory: m, action: location === "A" ? "Right" : "Left" };
  return { memory: m, action: "NoOp" };
}

export const showSteps = (n: number) => (n === Infinity ? "∞" : String(n));

/* ---------- Runs ---------- */

export type Step = { t: number; percept: Percept; action: Action; before: World; after: World; memory?: Memory };

export function runReflex(start: World, steps: number): Step[] {
  const out: Step[] = [];
  let w = start;
  for (let t = 1; t <= steps; t++) {
    const percept = perceive(w);
    const action = reflexVacuumAgent(percept);
    const after = result(w, action);
    out.push({ t, percept, action, before: w, after });
    w = after;
  }
  return out;
}

export function runWithState(start: World, steps: number, threshold = THRESHOLD): Step[] {
  const out: Step[] = [];
  let w = start;
  let memory = FRESH;
  for (let t = 1; t <= steps; t++) {
    const percept = perceive(w);
    const next = stateAgentStep(memory, percept, threshold);
    memory = next.memory;
    const after = result(w, next.action);
    out.push({ t, percept, action: next.action, before: w, after, memory });
    w = after;
  }
  return out;
}

/** The runs the scenes draw: six time steps from START. */
export const STEPS = 6;
export const REFLEX_RUN = runReflex(START, STEPS);
export const STATE_RUN = runWithState(START, STEPS);

/* ---------- Performance measures (the page's three) ---------- */

export type MeasureId = "cleaned" | "clean-moves" | "penalty";
/** "A penalty whenever more than k squares are dirty": k = 0 here, −1 per such step. */
export const K = 0;

/** The points each step of a run earns under a measure. */
export function stepPoints(run: readonly Step[], measure: MeasureId, k = K): number[] {
  return run.map((s) => {
    if (measure === "cleaned") return s.action === "Suck" && s.before.dirty[s.before.at] ? 1 : 0;
    if (measure === "clean-moves") return cleanCount(s.after) - (isMove(s.action) ? 1 : 0);
    return dirtyCount(s.after) > k ? -1 : 0;
  });
}

export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const score = (run: readonly Step[], measure: MeasureId, k = K) => sum(stepPoints(run, measure, k));

/* ---------- Goals and utility (vacuum version) ---------- */

/** Goal test: both squares clean. */
export const goalReached = (w: World) => dirtyCount(w) === 0;

/** A plan carried out step by step, then NoOp until the horizon. */
export function runPlan(start: World, plan: readonly Action[], horizon = HORIZON): Step[] {
  const out: Step[] = [];
  let w = start;
  for (let t = 1; t <= horizon; t++) {
    const action = plan[t - 1] ?? "NoOp";
    const after = result(w, action);
    out.push({ t, percept: perceive(w), action, before: w, after });
    w = after;
  }
  return out;
}

/** How far ahead the utility looks. */
export const HORIZON = 6;

/** Utility of a plan: the page's second measure (clean squares per step, minus one per move) over the horizon. */
export const utility = (w: World, plan: readonly Action[], horizon = HORIZON) => score(runPlan(w, plan, horizon), "clean-moves");

/** Where the goal and utility panels start: the robot in A (clean), B still dirty. */
export const HALF_DONE: World = { at: "A", dirty: { A: false, B: true } };
export const PLANS = {
  wait: ["NoOp"],
  direct: ["Right", "Suck"],
  wander: ["Right", "Left", "Right", "Suck"],
} as const satisfies Record<string, readonly Action[]>;
export type PlanId = keyof typeof PLANS;

/* ---------- PEAS ---------- */

export type PeasLetter = "P" | "E" | "A" | "S";
export const PEAS_LETTERS: readonly PeasLetter[] = ["P", "E", "A", "S"];

/** The page's PEAS table (item ids; the scenes hold their labels). */
export const PEAS = {
  taxi: {
    P: ["safety", "destination", "profit", "legality", "comfort"],
    E: ["streets", "highways", "traffic", "pedestrians", "weather"],
    A: ["steering", "accelerator", "brake", "horn", "speaker"],
    S: ["cameras", "accelerometers", "gauges", "engine", "gps", "keyboard"],
  },
  shopping: {
    P: ["price", "quality", "appropriateness", "efficiency"],
    E: ["websites", "vendors", "shippers"],
    A: ["display", "url", "forms"],
    S: ["html"],
  },
} as const;
export type PeasTask = keyof typeof PEAS;

/** Which PEAS component an item belongs to (the quiz: the taxi's steering wheel → Actuators). */
export function componentOf(task: PeasTask, item: string): PeasLetter | undefined {
  return PEAS_LETTERS.find((l) => (PEAS[task][l] as readonly string[]).includes(item));
}
export const PEAS_NAMES: Record<PeasLetter, string> = { P: "Performance", E: "Environment", A: "Actuators", S: "Sensors" };

/* ---------- Environment types ---------- */

export const DIMENSIONS = ["observable", "deterministic", "episodic", "static", "discrete", "single"] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export type Answer = "Yes" | "No" | "Partly" | "Semi";
export const TASKS = ["solitaire", "backgammon", "shopping", "taxi"] as const;
export type Task = (typeof TASKS)[number];

/** The page's four-task table, row by row. */
export const ENVIRONMENTS: Record<Task, Record<Dimension, Answer>> = {
  solitaire: { observable: "Yes", deterministic: "Yes", episodic: "No", static: "Yes", discrete: "Yes", single: "Yes" },
  backgammon: { observable: "Yes", deterministic: "No", episodic: "No", static: "Semi", discrete: "Yes", single: "No" },
  shopping: { observable: "No", deterministic: "Partly", episodic: "No", static: "Semi", discrete: "Yes", single: "Yes" },
  taxi: { observable: "No", deterministic: "No", episodic: "No", static: "No", discrete: "No", single: "No" },
};

/** Where an answer sits between the easy case (0) and the hard case (1). */
export const hardness = (a: Answer) => (a === "Yes" ? 0 : a === "No" ? 1 : 0.5);
/** On how many of the six dimensions a task is the hard case. */
export const hardCount = (task: Task) => DIMENSIONS.filter((d) => ENVIRONMENTS[task][d] === "No").length;
