"use client";

import { DFS_GOAL, DFS_TREE, bfsLevels, idsLevels, iterativeDeepening, placeTree, thousands, treeOf } from "@/lib/widgets/ai-lecture-03";
import { IDS_EXAMPLES, type idsWalk } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { DepthBars, Expr, FringeTable, Pow, TreeView, type TreeLight } from "./local";

const ids = iterativeDeepening(treeOf(DFS_TREE), DFS_GOAL);
const tree = placeTree(DFS_TREE, { x: 40, y: 56, w: 300, h: 174 });
const GAP = 58;

function Iterations({ control }: { control: string }) {
  const limit = Number(control);
  const r = ids.runs[limit];
  const step = 240;
  const lights: TreeLight[] = r.order.map((id, i) => ({ id, d: 400 + i * step, tone: id === DFS_GOAL ? "success" : "navy" }));
  const badges = r.order.map((id, i) => ({ id, n: i + 1, d: 400 + i * step }));
  const end = 400 + r.order.length * step;
  const rows = ids.runs.slice(0, limit + 1).map((x) => [String(x.limit), String(x.order.length), x.outcome === "found" ? `${DFS_GOAL} ✓` : x.outcome]);
  const done = r.outcome === "found";
  const lineY = 56 + limit * GAP + GAP / 2;
  return (
    <Svg>
      <TreeView tree={tree} nw={26} nh={22} size={11} ghost={(id) => tree.byId[id].depth > limit} base={(id) => (id === DFS_GOAL ? "success" : "outline")} lights={lights} badges={badges} d={0} />
      {limit < tree.depth ? <Arrow pts={[[24, lineY], [356, lineY]]} tone="gold" dashed head={false} d={200} /> : null}
      <Text x={24} y={26} text={`l = ${limit}`} anchor="start" tone="gold" size={14} d={100} />
      <FringeTable
        x={378}
        y={44}
        head={[bi("l", "l"), bi("nodes", "العقد"), bi("result", "النتيجة")]}
        headH={44}
        rows={done ? [...rows, ["Σ", String(ids.visited), ""]] : rows}
        cw={[34, 60, 68]}
        rh={26}
        d={200}
        stagger={160}
        size={11}
        tone={(row, c) => (row === limit && c === 2 ? (done ? "success" : "warn") : row > limit ? "gold" : undefined)}
      />
      <Chip x={459} y={244} text={done ? bi("goal found: stop", "وُجد الهدف: توقّف") : bi("cutoff: go one deeper", "قطع: انزل مستوى")} tone={done ? "success" : "warn"} center size={10.5} d={end} />
    </Svg>
  );
}

function Formula({ control }: { control: string }) {
  const ex = IDS_EXAMPLES[control as keyof typeof IDS_EXAMPLES];
  const levels = idsLevels(ex.b, ex.d, ex.root);
  const total = levels.reduce((s, l) => s + l.total, 0);
  const rows = levels.map((l) => [String(l.depth), thousands(l.nodes), `× ${l.times}`, thousands(l.total)]);
  return (
    <Svg>
      <Expr x={200} y={24} parts={[["(d + 1)·b", "0"], [" + d·b", "1"], [" + … + 1·b", "d"]]} size={13} anchor="middle" d={0} />
      <Text x={420} y={24} text={`b = ${ex.b}, d = ${ex.d}`} tone="gold" size={12} mono d={0} />
      <FringeTable
        x={100}
        y={46}
        head={[bi("depth k", "العمق k"), bi("nodes", "العقد"), bi("runs", "مرات التوليد"), bi("generated", "المولَّدة")]}
        headH={44}
        rows={[...rows, ["", "", "Σ", thousands(total)]]}
        cw={[80, 100, 90, 110]}
        rh={23}
        d={200}
        stagger={160}
        size={11}
        tone={(r, c) => (r === rows.length ? (c === 3 ? "gold" : "ghost") : c === 2 ? "slate" : undefined)}
      />
      <Chip
        x={280}
        y={256}
        text={ex.root ? bi("the root is counted in every iteration", "مع احتساب الجذر في كل تكرار") : bi("the root is not counted", "دون احتساب الجذر")}
        tone="slate"
        center
        size={11}
        d={1400}
      />
    </Svg>
  );
}

const B = 10;
const D = 5;
const MAX = B * (B ** D - 1);

function Overhead({ control }: { control: string }) {
  const values =
    control === "ids"
      ? [...idsLevels(B, D, false).map((l) => l.total), 0]
      : Array.from({ length: D + 1 }, (_, i) => bfsLevels(B, D, control === "bfs" ? "expansion" : "generation", false)[i]?.nodes ?? 0);
  const total = values.reduce((s, v) => s + v, 0);
  const title = {
    ids: bi("nodes IDS generates at each depth", "العقد التي يولّدها IDS عند كل عمق"),
    bfs: bi("BFS, goal test on expansion", "BFS مع اختبار الهدف عند التوسيع"),
    "bfs-gen": bi("BFS, goal test on generation", "BFS مع اختبار الهدف عند التوليد"),
  }[control as "ids" | "bfs" | "bfs-gen"];
  return (
    <Svg>
      <Text x={24} y={24} text={title} anchor="start" tone="heading" size={12} d={0} />
      <DepthBars values={values} max={MAX} tone={(i) => (control === "bfs" && i === D ? "danger" : control === "ids" ? "navy" : undefined)} />
      <Text x={440} y={24} text={bi("total", "المجموع")} anchor="end" tone="muted" size={11} d={1300} />
      <Chip x={492} y={26} text={thousands(total)} tone={control === "bfs" ? "danger" : control === "ids" ? "gold" : "success"} center size={12} d={1300} />
      <Pow x={120} y={262} base="O(b" exp={control === "bfs" ? "d+1" : "d"} after=")" size={13} anchor="middle" d={1400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof idsWalk>>({ iterations: Iterations, formula: Formula, overhead: Overhead });
