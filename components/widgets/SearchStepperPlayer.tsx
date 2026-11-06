"use client";

import { AnimatePresence, m } from "framer-motion";
import { useId, useMemo, useRef, useState } from "react";
import { ArLine } from "@/components/mdx/Arabic";
import diagram from "@/components/mdx/diagrams.module.css";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { runSearch, type Algorithm, type FrontierPath, type SearchProblem, type SearchRun, type SearchStep } from "@/lib/widgets/search";
import { BiText } from "./BiText";
import { UI } from "./i18n";
import styles from "./SearchStepper.module.css";
import { StepperControls } from "./StepperControls";
import { bi, type Bi } from "./types";
import { stepperKeyDown, useStepper } from "./useStepper";
import widgets from "./widgets.module.css";

/* ---------- The drawing, laid out on the server by lib/diagrams ---------- */

export type SceneNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  /** circle: graph node; dot: map-style graph (name beside it); pill: tree node */
  shape: "circle" | "dot" | "pill";
  w: number;
  h: number;
  labelY: number;
};

export type SceneEdge = {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
  weight?: string;
  arrow: boolean;
  /** Undirected: the edge also counts for a path going to → from */
  twoWay: boolean;
};

export type Scene = { width: number; height: number; minWidth: number; nodes: SceneNode[]; edges: SceneEdge[] };

/* ---------- Text (every string in both languages) ---------- */

const NAMES: Record<Algorithm, Bi> = {
  dfs: bi("Depth-first search (DFS)", "البحث بالعمق أولًا (DFS)"),
  bfs: bi("Breadth-first search (BFS)", "البحث بالعرض أولًا (BFS)"),
  ucs: bi("Uniform-cost search (UCS)", "البحث بالتكلفة الموحدة (UCS)"),
};

const FRONTIER_TITLES: Record<Algorithm, Bi> = {
  dfs: bi("Frontier: stack (LIFO), top on the right", "الحافة (frontier): مكدس LIFO، والقمة على اليمين"),
  bfs: bi("Frontier: queue (FIFO), front on the left", "الحافة (frontier): طابور FIFO، والمقدمة على اليسار"),
  ucs: bi("Frontier: priority queue, cheapest first", "الحافة (frontier): طابور أولوية، والأرخص أولًا"),
};

const TEXT = {
  algorithm: bi("Algorithm", "الخوارزمية"),
  goal: bi("Goal", "الهدف"),
  clickToSetGoal: bi("Click a node to make it the goal.", "انقر على عقدة لتجعلها الهدف."),
  pageGoal: bi("Back to the page's goal", "العودة إلى هدف الصفحة"),
  explored: bi("Explored set, in order", "المجموعة المستكشفة بالترتيب"),
  empty: bi("empty", "فارغة"),
  current: bi("Current", "الحالية"),
  inFrontier: bi("In the frontier", "في الحافة"),
  exploredNode: bi("Explored", "مستكشفة"),
  path: bi("Solution path", "مسار الحل"),
  body: bi(
    "Uninformed search stepper. Use the left and right arrow keys to step.",
    "أداة تتبّع البحث غير المُوجَّه. استخدم مفتاحَي الأسهم لليمين واليسار للتنقل بين الخطوات.",
  ),
} as const;

const label = (text: Bi) => `${text.en} · ${text.ar}`;
const last = (path: string[]) => path[path.length - 1];

/** Builds the status line for one step: what was removed, and what happens next. */
function describe(step: SearchStep, run: SearchRun, problem: SearchProblem, name: (id: string) => string): Bi {
  const tree = problem.kind === "tree";
  const algo = run.algorithm;
  const show = (item: FrontierPath) => (tree ? name(last(item.path)) : `[${item.path.map(name).join(",")}]`);
  const list = (ids: string[]) => ids.map(name).join(", ");

  if (step.kind === "start") {
    const first = show(step.frontier[0]);
    return tree
      ? bi(
          `Start: the frontier holds the root, ${first}; the explored set is empty.`,
          `البداية: تحتوي الحافة (frontier) على الجذر ${first}، والمجموعة المستكشفة فارغة.`,
        )
      : bi(
          `Start: the frontier holds one path, ${first}; the explored set is empty.`,
          `البداية: تحتوي الحافة (frontier) على مسار واحد هو ${first}، والمجموعة المستكشفة فارغة.`,
        );
  }
  if (step.kind === "fail" || !step.popped) {
    const goal = name(run.goal);
    const start = name(problem.start);
    return bi(
      `The frontier is empty: the search fails, so ${goal} cannot be reached from ${start}.`,
      `الحافة فارغة: يفشل البحث، فلا يمكن الوصول إلى ${goal} من ${start}.`,
    );
  }

  const popped = step.popped;
  const item = show(popped);
  const node = name(last(popped.path));
  const removed: Bi =
    algo === "dfs"
      ? bi(`Pop ${item} from the top of the stack.`, `اسحب ${item} من قمة المكدس.`)
      : algo === "bfs"
        ? bi(`Dequeue ${item} from the front of the queue.`, `أخرِج ${item} من مقدمة الطابور.`)
        : bi(
            `Remove ${item}, the cheapest path in the priority queue (cost ${popped.cost}).`,
            `أزِل ${item}، وهو أرخص مسار في طابور الأولوية بتكلفة ${popped.cost}.`,
          );

  let next: Bi;
  if (step.kind === "skip") {
    next = bi(`${node} is already explored, so this path is skipped.`, `سبقت زيارة ${node}، لذا يُتخطى هذا المسار.`);
  } else if (step.kind === "goal") {
    const route = popped.path.map(name).join(" → ");
    const count = step.explored.length;
    next = problem.weighted
      ? bi(
          `${node} is the goal: return the path ${route} with cost ${popped.cost}. Nodes explored: ${count}.`,
          `العقدة ${node} هي الهدف: أرجِع المسار ${route} بتكلفة ${popped.cost}. عدد العقد المستكشفة ${count}.`,
        )
      : bi(
          `${node} is the goal: return the path ${route}. Nodes explored: ${count}.`,
          `العقدة ${node} هي الهدف: أرجِع المسار ${route}. عدد العقد المستكشفة ${count}.`,
        );
  } else {
    const added = step.added.map((a) => last(a.path));
    const notGoal = bi(`${node} is not the goal: mark it explored`, `العقدة ${node} ليست الهدف: علّمها على أنها مستكشفة`);
    if (added.length === 0) {
      next = tree
        ? bi(`${notGoal.en}. It has no children, so nothing is added.`, `${notGoal.ar}. ليس لها أبناء، لذا لا يُضاف شيء.`)
        : bi(`${notGoal.en}. It has no neighbours, so nothing is added.`, `${notGoal.ar}. ليس لها جيران، لذا لا يُضاف شيء.`);
    } else if (algo === "ucs") {
      const costs = step.added.map((a) => `${name(last(a.path))} (${a.cost})`).join(", ");
      next = bi(
        `${notGoal.en}, add its neighbours with their cumulative costs ${costs}, and sort the list by cost.`,
        `${notGoal.ar}، وأضف جيرانها بتكاليفها التراكمية ${costs}، ثم رتّب القائمة حسب التكلفة.`,
      );
    } else if (algo === "dfs") {
      const top = name(added[added.length - 1]);
      next = tree
        ? added.length === 1
          ? bi(`${notGoal.en} and push its child ${top}.`, `${notGoal.ar} وادفع ابنها ${top} إلى المكدس.`)
          : bi(
              `${notGoal.en} and push its children right to left, ${list(added)}, so ${top} is on top.`,
              `${notGoal.ar} وادفع أبناءها إلى المكدس من اليمين إلى اليسار: ${list(added)}، فيصبح ${top} في القمة.`,
            )
        : added.length === 1
          ? bi(`${notGoal.en} and push the path to its neighbour ${top}.`, `${notGoal.ar} وادفع إلى المكدس المسار إلى جارتها ${top}.`)
          : bi(
              `${notGoal.en} and push the paths to its neighbours ${list(added)} in alphabetical order, so ${top} is on top.`,
              `${notGoal.ar} وادفع إلى المكدس مسارات جيرانها ${list(added)} بالترتيب الأبجدي، فيصبح المسار إلى ${top} في القمة.`,
            );
    } else {
      next = tree
        ? bi(
            `${notGoal.en} and add its ${added.length === 1 ? "child" : "children"} ${list(added)} to the back of the queue.`,
            `${notGoal.ar} وأضف ${added.length === 1 ? "ابنها" : "أبناءها"} ${list(added)} إلى مؤخرة الطابور.`,
          )
        : bi(
            `${notGoal.en} and add the ${added.length === 1 ? "path to its neighbour" : "paths to its neighbours"} ${list(added)} to the back of the queue${added.length === 1 ? "" : ", in alphabetical order"}.`,
            `${notGoal.ar} وأضف ${added.length === 1 ? "المسار إلى جارتها" : "مسارات جيرانها"} ${list(added)} إلى مؤخرة الطابور${added.length === 1 ? "" : " بالترتيب الأبجدي"}.`,
          );
    }
    // The lab's loop adds every neighbour; repeats are only caught when they come out.
    const seen = added.filter((id) => step.explored.includes(id));
    if (seen.length > 0) {
      next =
        seen.length === 1
          ? bi(
              `${next.en} ${name(seen[0])} is already explored; that path will be skipped when it comes out.`,
              `${next.ar} وقد سبقت زيارة ${name(seen[0])}، لذا سيُتخطى مسارها عند إخراجه.`,
            )
          : bi(
              `${next.en} ${list(seen)} are already explored; those paths will be skipped when they come out.`,
              `${next.ar} وقد سبقت زيارة ${list(seen)}، لذا ستُتخطى مساراتها عند إخراجها.`,
            );
    }
  }
  return bi(`${removed.en} ${next.en}`, `${removed.ar} ${next.ar}`);
}

type NodeState = "path" | "current" | "explored" | "frontier" | "idle";

/* ---------- The player ---------- */

export function SearchStepperPlayer({
  scene,
  problem,
  goal: initialGoal,
  algorithm: initialAlgorithm,
}: {
  scene: Scene;
  problem: SearchProblem;
  goal: string;
  algorithm: Algorithm;
}) {
  const [algorithm, setAlgorithm] = useState(initialAlgorithm);
  const [goal, setGoal] = useState(initialGoal);
  const bodyRef = useRef<HTMLDivElement>(null);
  const markerBase = `search-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const run = useMemo(() => runSearch(problem, algorithm, goal), [problem, algorithm, goal]);
  const stepper = useStepper(run.steps.length, { frameRef: bodyRef });
  const step = run.steps[stepper.index];

  const labels = useMemo(() => new Map(scene.nodes.map((n) => [n.id, n.label])), [scene]);
  const name = (id: string) => labels.get(id) ?? id;
  const status = describe(step, run, problem, name);

  const solved = step.kind === "goal" && run.path !== null;
  const current = step.popped ? last(step.popped.path) : undefined;
  const explored = new Set(step.explored);
  const inFrontier = new Set(step.frontier.map((f) => last(f.path)));
  const added = new Set(step.added.map((f) => f.id));
  const nodeState = (id: string): NodeState =>
    solved && run.path!.includes(id)
      ? "path"
      : id === current
        ? "current"
        : explored.has(id)
          ? "explored"
          : inFrontier.has(id)
            ? "frontier"
            : "idle";

  // Highlighted route: the solution (gold) at the end, else the path being removed.
  const route = solved ? run.path! : step.popped?.path ?? [];
  const onRoute = (edge: SceneEdge) =>
    route.some(
      (id, i) =>
        i > 0 && ((route[i - 1] === edge.from && id === edge.to) || (edge.twoWay && route[i - 1] === edge.to && id === edge.from)),
    );

  const choose = (next: Algorithm) => {
    setAlgorithm(next);
    stepper.reset();
  };
  const chooseGoal = (id: string) => {
    setGoal(id);
    stepper.reset();
  };

  const tree = problem.kind === "tree";
  const showItem = (item: FrontierPath) => (tree ? name(last(item.path)) : `[${item.path.map(name).join(",")}]`);
  const nextOut = algorithm === "dfs" ? step.frontier.length - 1 : 0;
  // Keyed by path (not the run's serial id), so an entry keeps its identity across steps and
  // when switching algorithm or goal; a repeat (parallel edges) gets an occurrence suffix.
  const seenKeys = new Map<string, number>();
  const frontierKey = (item: FrontierPath) => {
    const path = item.path.join(">");
    const n = seenKeys.get(path) ?? 0;
    seenKeys.set(path, n + 1);
    return n === 0 ? path : `${path}#${n}`;
  };
  const algorithms: Algorithm[] = problem.weighted ? ["dfs", "bfs", "ucs"] : ["dfs", "bfs"];
  const pct = (value: number, total: number) => `${(value / total) * 100}%`;

  return (
    <div
      ref={bodyRef}
      className={widgets.body}
      tabIndex={0}
      onKeyDown={stepperKeyDown(stepper)}
      aria-label={label(TEXT.body)}
    >
      <div className={widgets.options}>
        <div className={widgets.field}>
          <span>
            {TEXT.algorithm.en} <ArLine inline>{TEXT.algorithm.ar}</ArLine>
          </span>
          <div className={widgets.segmented} role="group" aria-label={label(TEXT.algorithm)}>
            {algorithms.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={algorithm === key}
                aria-label={label(NAMES[key])}
                title={label(NAMES[key])}
                onClick={() => choose(key)}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className={widgets.field}>
          <span>
            {TEXT.goal.en} <ArLine inline>{TEXT.goal.ar}</ArLine>
          </span>
          <div className={styles.goalRow}>
            <span className={styles.goalChip}>{name(goal)}</span>
            {goal !== initialGoal ? (
              <button type="button" className={styles.textButton} onClick={() => chooseGoal(initialGoal)}>
                <BiText text={TEXT.pageGoal} inline />
              </button>
            ) : (
              <span className={styles.goalHint}>
                <BiText text={TEXT.clickToSetGoal} inline />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.canvas}>
        <div className={diagram.scroll}>
          <div className={styles.stage} style={{ minWidth: scene.minWidth }}>
            <svg
              viewBox={`0 0 ${scene.width} ${scene.height}`}
              role="img"
              aria-label={label(
                tree
                  ? bi(`Search tree, goal ${name(goal)}`, `شجرة البحث، والهدف ${name(goal)}`)
                  : bi(`Search graph from ${name(problem.start)} to ${name(goal)}`, `رسم البحث من ${name(problem.start)} إلى ${name(goal)}`),
              )}
            >
              <defs>
                {(["idle", "current", "path"] as const).map((kind) => (
                  <marker
                    key={kind}
                    id={`${markerBase}-${kind}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M0,0 L10,5 L0,10 z"
                      className={kind === "path" ? diagram.arrowHeadGold : kind === "current" ? styles.arrowCurrent : diagram.arrowHead}
                    />
                  </marker>
                ))}
              </defs>
              {scene.edges.map((edge, i) => {
                const kind = onRoute(edge) ? (solved ? "path" : "current") : "idle";
                return (
                  <g key={`${edge.from}-${edge.to}-${i}`}>
                    <line
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                      className={`${kind === "path" ? diagram.edgeActive : diagram.edge} ${styles.edge}`}
                      data-state={kind}
                      markerEnd={edge.arrow ? `url(#${markerBase}-${kind})` : undefined}
                    />
                    {edge.weight ? (
                      <g>
                        <rect
                          x={edge.mx - 15}
                          y={edge.my - 11}
                          width={30}
                          height={22}
                          rx={6}
                          className={kind === "path" ? diagram.weightBgActive : diagram.weightBg}
                        />
                        <text x={edge.mx} y={edge.my + 4.5} className={diagram.weight}>
                          {edge.weight}
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}
              {scene.nodes.map((node) => (
                <g key={node.id} className={styles.node} data-state={nodeState(node.id)}>
                  {node.id === goal ? (
                    node.shape === "pill" ? (
                      <rect
                        x={node.x - node.w / 2 - 5}
                        y={node.y - node.h / 2 - 5}
                        width={node.w + 10}
                        height={node.h + 10}
                        rx={(node.h + 10) / 2}
                        className={styles.goalRing}
                      />
                    ) : (
                      <circle cx={node.x} cy={node.y} r={node.w / 2 + 5} className={styles.goalRing} />
                    )
                  ) : null}
                  {node.shape === "pill" ? (
                    <rect x={node.x - node.w / 2} y={node.y - node.h / 2} width={node.w} height={node.h} rx={node.h / 2} className={styles.shape} />
                  ) : (
                    <circle cx={node.x} cy={node.y} r={node.w / 2} className={styles.shape} />
                  )}
                  <text x={node.x} y={node.labelY} className={node.shape === "dot" ? diagram.mapLabel : styles.label}>
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
            {scene.nodes.map((node) => {
              const w = Math.max(node.w, 30);
              const h = Math.max(node.h, 30);
              return (
                <button
                  key={node.id}
                  type="button"
                  className={styles.hit}
                  style={{ left: pct(node.x, scene.width), top: pct(node.y, scene.height), width: pct(w, scene.width), height: pct(h, scene.height) }}
                  aria-pressed={node.id === goal}
                  aria-label={label(bi(`Make ${node.label} the goal`, `اجعل ${node.label} الهدف`))}
                  title={label(bi(`Make ${node.label} the goal`, `اجعل ${node.label} الهدف`))}
                  onClick={() => chooseGoal(node.id)}
                />
              );
            })}
          </div>
        </div>
        <ul className={styles.legend} aria-hidden="true">
          {(
            [
              ["current", TEXT.current],
              ["frontier", TEXT.inFrontier],
              ["explored", TEXT.exploredNode],
              ["goal", TEXT.goal],
              ["path", TEXT.path],
            ] as const
          ).map(([key, text]) => (
            <li key={key} data-key={key}>
              <span className={styles.swatch} />
              <BiText text={text} inline />
            </li>
          ))}
        </ul>
      </div>

      <MotionRoot>
        <div className={styles.panels}>
          <div className={`${styles.panel} ${styles.panelWide}`}>
            <p className={widgets.panelLabel} id={`${markerBase}-frontier`}>
              {FRONTIER_TITLES[algorithm].en} <ArLine inline>{FRONTIER_TITLES[algorithm].ar}</ArLine>
            </p>
            <ol className={styles.list} aria-labelledby={`${markerBase}-frontier`}>
              <AnimatePresence initial={false} mode="popLayout">
                {step.frontier.map((item, i) => (
                  <m.li
                    key={frontierKey(item)}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={styles.item}
                    data-new={added.has(item.id) || undefined}
                    data-next={i === nextOut || undefined}
                  >
                    {showItem(item)}
                    {algorithm === "ucs" ? <span className={styles.cost}>{item.cost}</span> : null}
                  </m.li>
                ))}
              </AnimatePresence>
              {step.frontier.length === 0 ? (
                <li className={styles.empty}>
                  <BiText text={TEXT.empty} inline />
                </li>
              ) : null}
            </ol>
          </div>
          <div className={styles.panel}>
            <p className={widgets.panelLabel} id={`${markerBase}-explored`}>
              {TEXT.explored.en} <ArLine inline>{TEXT.explored.ar}</ArLine>
            </p>
            <ol className={`${styles.list} ${styles.exploredList}`} aria-labelledby={`${markerBase}-explored`}>
              <AnimatePresence initial={false} mode="popLayout">
                {step.explored.map((id) => (
                  <m.li
                    key={id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={styles.item}
                    data-goal={(solved && id === goal) || undefined}
                  >
                    {name(id)}
                  </m.li>
                ))}
              </AnimatePresence>
              {step.explored.length === 0 ? (
                <li className={styles.empty}>
                  <BiText text={TEXT.empty} inline />
                </li>
              ) : null}
            </ol>
          </div>
        </div>
      </MotionRoot>

      <StepperControls stepper={stepper} />

      <div className={widgets.status} aria-live="polite">
        <BiText text={status} />
      </div>
      <p className={widgets.hint}>
        <BiText text={UI.keys} />
      </p>
    </div>
  );
}
