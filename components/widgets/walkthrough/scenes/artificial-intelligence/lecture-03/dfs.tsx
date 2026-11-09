"use client";

import { DFS_GOAL, DFS_TREE, firstGoal, memoryAtEnd, placeTree, traceOf, treeOf, type PlacedTree } from "@/lib/widgets/ai-lecture-03";
import { TWO_GOALS, type dfs } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import { runSearch, type SearchRun } from "@/lib/widgets/search";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Text, Token, Svg, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Cells, FringeTable, TreeView, type TreeLight } from "./local";

const problem = treeOf(DFS_TREE);
const run = runSearch(problem, "dfs", DFS_GOAL);
const trace = traceOf(run);

/** Gold edges along a path, drawn on top of the tree. */
function PathEdges({ tree, path, d, nh = 22 }: { tree: PlacedTree; path: readonly string[]; d: number; nh?: number }) {
  return (
    <>
      {path.slice(1).map((id, i) => {
        const p = tree.byId[path[i]];
        const c = tree.byId[id];
        return <Arrow key={id} pts={[[p.x, p.y + nh / 2], [c.x, c.y - nh / 2]]} tone="gold" width={2.6} head={false} d={d + i * 200} dur={200} />;
      })}
    </>
  );
}

/** Lights and order badges for a run's expansions, `step` ms apart from `t0`. */
function visits(r: SearchRun, t0: number, step: number) {
  const lights: TreeLight[] = r.order.map((id, i) => ({ id, d: t0 + i * step, tone: id === r.goal ? "success" : "navy" }));
  const badges = r.order.map((id, i) => ({ id, n: i + 1, d: t0 + i * step }));
  return { lights, badges };
}

const lifoTree = placeTree(DFS_TREE, { x: 36, y: 40, w: 300, h: 186 });
const STEP = 280;
const T0 = 300;

function Lifo() {
  const rows = trace.map((r) => [r.node ? (r.kind === "goal" ? `${r.node} ✓` : r.node) : "—", r.fringe.map((f) => f.id).join(" ") || "—"]);
  const { lights, badges } = visits(run, T0 + 2 * STEP, STEP);
  return (
    <Svg>
      <TreeView tree={lifoTree} nw={26} nh={22} size={11} lights={lights} badges={badges} d={0} />
      <PathEdges tree={lifoTree} path={run.path!} d={T0 + (trace.length + 1) * STEP} />
      <FringeTable x={372} y={26} rows={rows} cw={[50, 120]} rh={17.5} size={10} d={T0} stagger={STEP} tone={(r) => (trace[r].kind === "goal" ? "success" : undefined)} />
      <Text x={186} y={254} text={bi("fringe: top of the stack first", "الحافة: قمة المكدس أولًا")} tone="muted" size={10.5} d={T0} />
    </Svg>
  );
}

function Complete({ control }: { control: string }) {
  if (control === "infinite") {
    const chain: Pt[] = [
      [200, 112],
      [150, 164],
      [100, 216],
    ];
    return (
      <Svg>
        <Box x={250} y={44} w={60} h={30} r={15} label="S" tone="navy" d={0} />
        <Arrow pts={[[268, 74], [216, 98]]} tone="navy" head={false} d={200} dur={200} />
        <Arrow pts={[[292, 74], [344, 98]]} tone="faint" head={false} d={200} dur={200} />
        <Box x={330} y={98} w={60} h={30} r={15} label="G" tone="success" d={300} />
        {chain.map(([x, y], i) => (
          <g key={i}>
            <Box x={x - 30} y={y - 14} w={60} h={28} r={14} label={`X${i + 1}`} tone="navy" d={500 + i * 400} />
            <Arrow pts={[[x - 16, y + 14], [x - 34, y + 38]]} tone="navy" dashed={i === chain.length - 1} head={i === chain.length - 1} d={700 + i * 400} dur={200} />
          </g>
        ))}
        <Text x={92} y={250} text={bi("…forever", "…إلى الأبد")} anchor="start" tone="danger" size={11.5} d={1900} />
        <Token pts={[[280, 59], [200, 112], [150, 164], [100, 216], [62, 252]]} tone="danger" d={500} dur={1800} />
        <Chip x={360} y={160} text={bi("never tried", "لا يُجرَّب أبدًا")} tone="danger" center size={10.5} d={2200} />
        <Arrow pts={[[360, 146], [360, 130]]} tone="danger" d={2200} dur={150} />
      </Svg>
    );
  }
  const check = control === "check";
  const strip = check
    ? [
        { label: "A", tone: "navy" as const },
        { label: "B", tone: "navy" as const },
        { label: "A", tone: "danger" as const },
        { label: "G", tone: "success" as const },
      ]
    : ["A", "B", "A", "B", "A", "B"].map((label) => ({ label, tone: "navy" as const }));
  return (
    <Svg>
      <Text x={24} y={22} text={bi("DFS's current path", "المسار الحالي لـ DFS")} anchor="start" tone="heading" size={12} d={0} />
      <Cells x={24} y={54} items={strip.map((s) => ({ label: s.label }))} cw={52} ch={34} gap={22} tone={(i) => strip[i].tone} d={200} stagger={300} />
      {strip.slice(1).map((_, i) => (
        <Text key={i} x={24 + (i + 1) * 74 - 11} y={71} text="→" size={12} tone="muted" d={350 + i * 300} />
      ))}
      {check ? (
        <>
          <Mark x={24 + 2 * 74 + 26} y={54} ok={false} r={9} d={900} />
          <Text x={24 + 2 * 74 + 50} y={106} text={bi("on the path: skip", "على المسار: تخطَّ")} anchor="end" tone="danger" size={10.5} d={900} />
          <Text x={24 + 3 * 74} y={106} text={bi("back at A: try G", "عودة إلى A: جرّب G")} anchor="start" tone="success" size={10.5} d={1300} />
        </>
      ) : (
        <Text x={24 + 6 * 74 + 4} y={71} text="…" size={14} tone="danger" anchor="start" d={2000} />
      )}
      <Box x={120} y={156} w={70} h={36} r={18} label="A" tone="navy" d={0} />
      <Box x={330} y={156} w={70} h={36} r={18} label="B" tone="navy" d={100} />
      <Box x={120} y={226} w={70} h={36} r={18} label="G" tone={check ? "success" : "outline"} d={200} />
      <Arrow pts={[[190, 166], [328, 166]]} tone="navy" d={300} dur={300} />
      <Arrow pts={[[330, 182], [192, 182]]} tone="navy" d={400} dur={300} />
      <Arrow pts={[[155, 192], [155, 224]]} tone={check ? "success" : "faint"} d={500} dur={200} />
      <Text x={260} y={210} text={bi("reversible actions", "أفعال قابلة للعكس")} tone="muted" size={10.5} d={500} />
      {check ? null : <Chip x={430} y={244} text={bi("G is never tried", "لا تُجرَّب G أبدًا")} tone="danger" center size={10.5} d={2100} />}
    </Svg>
  );
}

const timeTree = placeTree(DFS_TREE, { x: 40, y: 52, w: 330, h: 180 });
const timeRuns = { C: { dfs: runSearch(problem, "dfs", "C"), bfs: runSearch(problem, "bfs", "C") }, H: { dfs: runSearch(problem, "dfs", "H"), bfs: runSearch(problem, "bfs", "H") } };

function Time({ control }: { control: string }) {
  const r = timeRuns[control as "C" | "H"];
  const { lights, badges } = visits(r.dfs, 300, 220);
  const bar = (label: string, n: number, y: number, tone: "navy" | "slate", d: number) => (
    <g>
      <Text x={400} y={y + 15} text={label} anchor="start" tone="heading" size={12} d={d} />
      <Box x={442} y={y} w={Math.max(18, n * 10)} h={30} r={4} label={String(n)} tone={tone} size={11.5} d={d} />
    </g>
  );
  return (
    <Svg>
      <TreeView tree={timeTree} nw={26} nh={22} size={11} base={(id) => (id === control ? "success" : "outline")} lights={lights} badges={badges} d={0} />
      <Text x={470} y={70} text={bi("nodes expanded", "العقد الموسَّعة")} tone="muted" size={10.5} d={300} />
      {bar("DFS", r.dfs.order.length, 96, "navy", 300 + r.dfs.order.length * 220)}
      {bar("BFS", r.bfs.order.length, 140, "slate", 500 + r.dfs.order.length * 220)}
      <Chip
        x={470}
        y={214}
        text={control === "C" ? bi("m ≫ d: DFS loses", "m ≫ d: يخسر DFS") : bi("dense goals: DFS wins", "أهداف كثيفة: يفوز DFS")}
        tone={control === "C" ? "danger" : "success"}
        center
        size={10.5}
        d={900 + r.dfs.order.length * 220}
      />
    </Svg>
  );
}

const spaceTree = placeTree(DFS_TREE, { x: 50, y: 50, w: 460, h: 160 });
const bfsRun = runSearch(problem, "bfs", DFS_GOAL);

function Space({ control }: { control: string }) {
  const r = control === "bfs" ? bfsRun : run;
  const held = new Set(memoryAtEnd(r));
  const generated = new Set([...r.order, ...r.steps[r.steps.length - 1].frontier.map((p) => p.path[p.path.length - 1])]);
  const fringe = new Set(r.steps[r.steps.length - 1].frontier.map((p) => p.path[p.path.length - 1]));
  const tone = (id: string) => (id === DFS_GOAL ? "success" : fringe.has(id) ? "gold" : "navy");
  return (
    <Svg>
      <TreeView
        tree={spaceTree}
        nw={28}
        nh={24}
        hide={(id) => !generated.has(id)}
        ghost={(id) => !held.has(id)}
        lights={[...held].map((id, i) => ({ id, d: 600 + i * 70, tone: tone(id) }))}
        d={0}
      />
      <Chip x={110} y={256} text={bi("kept in memory", "في الذاكرة")} tone="navy" center size={10.5} d={300} />
      <Chip x={250} y={256} text={bi("fringe", "الحافة")} tone="gold" center size={10.5} d={400} />
      {control === "dfs" ? <Chip x={370} y={256} text={bi("dropped", "حُذفت")} tone="muted" center size={10.5} d={500} /> : null}
      <Chip x={492} y={256} text={bi(`${held.size} nodes`, `${held.size} عقد`)} tone={control === "bfs" ? "danger" : "success"} center size={11} d={1500} />
    </Svg>
  );
}

const optTree = placeTree(DFS_TREE, { x: 50, y: 50, w: 460, h: 160 });
const two = firstGoal(problem, "dfs", TWO_GOALS);
const twoBfs = firstGoal(problem, "bfs", TWO_GOALS);

function Optimal() {
  const { lights, badges } = visits(two, 300, 260);
  const end = 300 + two.order.length * 260;
  const other = TWO_GOALS.find((g) => g !== two.goal)!;
  return (
    <Svg>
      <TreeView tree={optTree} nw={28} nh={24} base={(id) => ((TWO_GOALS as readonly string[]).includes(id) ? "success" : "outline")} lights={lights} badges={badges} d={0} />
      <PathEdges tree={optTree} path={two.path!} d={end} nh={24} />
      <Chip x={optTree.byId[other].x + 60} y={optTree.byId[other].y - 32} text={bi("shallower goal", "هدف أقل عمقًا")} tone="warn" center size={10.5} d={end + 400} />
      <Chip x={160} y={258} text={bi(`DFS: ${two.path!.join(" → ")}`, `DFS: ${two.path!.join(" → ")}`)} tone="gold" center size={11} d={end + 200} />
      <Chip x={400} y={258} text={bi(`BFS: ${twoBfs.path!.join(" → ")}`, `BFS: ${twoBfs.path!.join(" → ")}`)} tone="success" center size={11} d={end + 600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof dfs>>({ lifo: Lifo, complete: Complete, time: Time, space: Space, optimal: Optimal });
