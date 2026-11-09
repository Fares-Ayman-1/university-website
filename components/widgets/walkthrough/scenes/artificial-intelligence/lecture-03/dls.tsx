"use client";

import { DFS_GOAL, DFS_TREE, NO_GOAL, depthLimited, placeTree, treeOf, type DlsRun, type PlacedTree } from "@/lib/widgets/ai-lecture-03";
import { NO_SOLUTION_TREE, ROMANIA_CITIES, type dlsWalk } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { TreeView, type TreeLight } from "./local";

/** The run's visits as lights (goal green, nodes cut at the limit amber) and order badges. */
function dlsLights(r: DlsRun, goal: string, t0: number, step: number) {
  const cut = new Set(r.cut);
  const lights: TreeLight[] = r.order.map((id, i) => ({ id, d: t0 + i * step, tone: id === goal ? "success" : cut.has(id) ? "warn" : "navy" }));
  const badges = r.order.map((id, i) => ({ id, n: i + 1, d: t0 + i * step }));
  return { lights, badges };
}

/** A dashed line under depth `limit`, labelled with it at the right end. */
function LimitLine({ tree, limit, x0, x1, gap, d }: { tree: PlacedTree; limit: number; x0: number; x1: number; gap: number; d: number }) {
  const level = tree.nodes.find((n) => n.depth === limit)?.y ?? tree.nodes[0].y + limit * gap;
  const y = level + gap / 2;
  return (
    <>
      <Arrow pts={[[x0, y], [x1, y]]} tone="gold" dashed head={false} d={d} />
      <Chip x={x1 + 30} y={y} text={`l = ${limit}`} tone="gold" center size={11} d={d} />
    </>
  );
}

const big = treeOf(DFS_TREE);
const bigTree = placeTree(DFS_TREE, { x: 44, y: 48, w: 430, h: 174 });
const GAP = 58;

function Limit({ control }: { control: string }) {
  const limit = Number(control);
  const r = depthLimited(big, DFS_GOAL, limit);
  const { lights, badges } = dlsLights(r, DFS_GOAL, 500, 220);
  const end = 500 + r.order.length * 220;
  return (
    <Svg>
      <TreeView tree={bigTree} nw={28} nh={22} size={11} ghost={(id) => bigTree.byId[id].depth > limit} base={(id) => (id === DFS_GOAL ? "success" : "outline")} lights={lights} badges={badges} d={0} />
      <LimitLine tree={bigTree} limit={limit} x0={20} x1={492} gap={GAP} d={200} />
      <Chip
        x={466}
        y={24}
        text={r.outcome === "found" ? (r.path ?? []).join(" → ") : r.outcome}
        tone={r.outcome === "found" ? "success" : "warn"}
        center
        size={11.5}
        d={end}
      />
      <Text x={400} y={24} text={bi("returns", "تُرجع")} anchor="end" tone="muted" size={10.5} d={end} />
    </Svg>
  );
}

const small = treeOf(NO_SOLUTION_TREE);
const smallTree = placeTree(NO_SOLUTION_TREE, { x: 150, y: 74, w: 260, h: 112 });

function Outcomes({ control }: { control: string }) {
  const limit = Number(control);
  const r = depthLimited(small, NO_GOAL, limit);
  const { lights, badges } = dlsLights(r, NO_GOAL, 400, 260);
  const end = 400 + r.order.length * 260;
  const leaves = smallTree.nodes.filter((n) => n.depth === limit || (n.children.length === 0 && n.depth < limit));
  const root = smallTree.byId[smallTree.nodes[0].id];
  return (
    <Svg>
      <Text x={280} y={24} text={bi("goal: not in this tree", "الهدف: غير موجود في هذه الشجرة")} tone="heading" size={12} d={0} />
      <TreeView tree={smallTree} nw={30} nh={24} ghost={(id) => smallTree.byId[id].depth > limit} lights={lights} badges={badges} d={0} />
      {limit < smallTree.depth ? <LimitLine tree={smallTree} limit={limit} x0={110} x1={450} gap={56} d={200} /> : <Chip x={480} y={130} text={`l = ${limit}`} tone="gold" center size={11} d={200} />}
      {leaves.map((n, i) => (
        <Chip
          key={n.id}
          x={r.outcome === "cutoff" ? n.x + 48 : n.x}
          y={r.outcome === "cutoff" ? n.y : n.y + 28}
          text={r.outcome}
          tone={r.outcome === "cutoff" ? "warn" : "danger"}
          center
          size={9.5}
          d={end + i * 120}
        />
      ))}
      {r.outcome === "cutoff" ? (
        <Chip x={root.x + 120} y={root.y} text="cutoff-occurred? = true" tone="warn" center size={10} d={end + 500} />
      ) : (
        <Text x={root.x + 120} y={root.y} text={bi("no branch was cut", "لم يُقطع أي فرع")} tone="muted" size={10.5} d={end + 500} />
      )}
      <Chip
        x={280}
        y={252}
        text={r.outcome === "cutoff" ? bi("DLS returns cutoff: maybe deeper", "يُرجع DLS القطع (cutoff): ربما أعمق") : bi("DLS returns failure: no solution", "يُرجع DLS الإخفاق (failure): لا حل")}
        tone={r.outcome === "cutoff" ? "warn" : "danger"}
        center
        size={11.5}
        d={end + 800}
      />
    </Svg>
  );
}

function Choose() {
  const n = ROMANIA_CITIES;
  const x = (i: number) => 44 + (i * 472) / (n - 1);
  return (
    <Svg>
      <Text x={280} y={24} text={bi(`Romania: ${n} cities`, `رومانيا: ${n} مدينة`)} tone="heading" size={12} d={0} />
      {Array.from({ length: n - 1 }, (_, i) => (
        <Arrow key={`e${i}`} pts={[[x(i) + 7, 68], [x(i + 1) - 7, 68]]} tone="navy" head={false} d={200 + i * 50} dur={120} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} x={x(i) - 7} y={61} w={14} h={14} r={7} tone={i === 0 ? "navy" : i === n - 1 ? "success" : "outline"} d={150 + i * 50} />
      ))}
      <Text x={280} y={100} text={bi(`a path that never repeats a city has at most ${n - 1} steps`, `المسار الذي لا يكرر أي مدينة لا يزيد على ${n - 1} خطوة`)} tone="gold" size={11.5} d={1300} />
      <Box x={40} y={142} w={230} h={68} label="l ≥ d" sub={bi("the solution is within reach", "الحل في المتناول")} tone="success" size={14} d={1600} />
      <Mark x={270} y={142} ok d={1900} />
      <Box x={290} y={142} w={230} h={68} label="l < d" sub={bi("returns cutoff", "يُرجع القطع (cutoff)")} tone="warn" size={14} d={1800} />
      <Mark x={520} y={142} ok={false} d={2100} />
      <Text x={280} y={244} text={bi(`l = ${n - 1} is safe, and like DFS the answer may not be optimal`, `الحد l = ${n - 1} آمن، والإجابة مثل DFS قد لا تكون الأمثل`)} tone="heading" size={11.5} d={2300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof dlsWalk>>({ limit: Limit, outcomes: Outcomes, choose: Choose });
