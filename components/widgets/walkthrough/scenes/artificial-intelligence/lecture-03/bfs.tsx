"use client";

import { BFS_TREE, bfsLevels, gbAfterHours, placeTree, thousands, traceOf, treeOf, ucsProblem, UCS_MAP } from "@/lib/widgets/ai-lecture-03";
import type { bfs } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import { runSearch } from "@/lib/widgets/search";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { DepthBars, FringeTable, MapView, Pow, TreeView } from "./local";

const run = runSearch(treeOf(BFS_TREE), "bfs", "G");
const trace = traceOf(run);
const tree = placeTree(BFS_TREE, { x: 46, y: 74, w: 232, h: 150 });
const STEP = 380;
const T0 = 400;

function Fifo() {
  const rows = trace.map((r) => [r.node ? (r.kind === "goal" ? `${r.node} ✓` : r.node) : "—", r.fringe.length ? r.fringe.map((f) => f.id).join(" ") : "—"]);
  const at = (i: number) => T0 + (i + 1) * STEP;
  return (
    <Svg>
      <Text x={162} y={22} text={bi("FIFO queue: children join the back", "طابور FIFO: ينضم الأبناء إلى النهاية")} tone="heading" size={12} d={0} />
      <TreeView
        tree={tree}
        base={() => "outline"}
        lights={trace.flatMap((r, i) => (r.node ? [{ id: r.node, d: at(i), tone: r.kind === "goal" ? ("success" as const) : ("navy" as const) }] : []))}
        badges={trace.flatMap((r, i) => (r.node ? [{ id: r.node, n: i, d: at(i) }] : []))}
        d={0}
      />
      <FringeTable x={340} y={40} rows={rows} cw={[62, 150]} rh={21} d={T0} stagger={STEP} tone={(r) => (trace[r].kind === "goal" ? "success" : undefined)} />
      <Text x={446} y={250} text={bi("fringe: front first", "الحافة: المقدمة أولًا")} tone="muted" size={10.5} d={T0} />
    </Svg>
  );
}

const unit = runSearch(ucsProblem(true), "bfs", UCS_MAP.goal);
const km = runSearch(ucsProblem(), "bfs", UCS_MAP.goal);
const cheapest = runSearch(ucsProblem(), "ucs", UCS_MAP.goal);

function Optimal({ control }: { control: string }) {
  const isKm = control === "km";
  const r = isKm ? km : unit;
  return (
    <Svg>
      <MapView
        costs={isKm ? "km" : "unit"}
        order={r.order}
        path={r.path!}
        alt={isKm ? cheapest.path! : undefined}
        d={0}
      />
      <Chip x={150} y={258} text={bi(`BFS: ${r.path!.length - 1} steps, cost ${r.cost}`, `BFS: عدد الخطوات ${r.path!.length - 1}، التكلفة ${r.cost}`)} tone="gold" center size={11} d={1600} />
      {isKm ? (
        <Chip x={410} y={258} text={bi(`cheapest: ${cheapest.cost} km`, `الأرخص: ${cheapest.cost} km`)} tone="success" center size={11} d={2000} />
      ) : (
        <Chip x={410} y={258} text={bi("shallowest = cheapest", "الأقل عمقًا = الأرخص")} tone="success" center size={11} d={2000} />
      )}
    </Svg>
  );
}

const B = 10;
const D = 5;

function Time({ control }: { control: string }) {
  const test = control === "expansion" ? "expansion" : "generation";
  const levels = bfsLevels(B, D, test, false);
  const values = Array.from({ length: D + 1 }, (_, i) => levels[i]?.nodes ?? 0);
  const total = levels.reduce((s, l) => s + l.nodes, 0);
  return (
    <Svg>
      <Text x={24} y={24} text={bi(`nodes BFS generates by depth (b = ${B}, d = ${D})`, `العقد التي يولّدها BFS حسب العمق (b = ${B}, d = ${D})`)} anchor="start" tone="heading" size={12} d={0} />
      <DepthBars values={values} max={B * (B ** D - 1)} tone={(i) => (test === "expansion" && i === D ? "danger" : undefined)} />
      <Text x={440} y={24} text={bi("total", "المجموع")} anchor="end" tone="muted" size={11} d={1300} />
      <Chip x={492} y={26} text={`${thousands(total)}`} tone={test === "expansion" ? "danger" : "success"} center size={12} d={1300} />
      <Pow x={120} y={262} base="O(b" exp={test === "expansion" ? "d+1" : "d"} after=")" size={13} tone="heading" anchor="middle" d={1400} />
    </Svg>
  );
}

const HOURS = [1, 6, 12, 18, 24];

function Memory() {
  const values = HOURS.map(gbAfterHours);
  const box = { x: 200, y: 66, w: 330, h: 150 };
  const max = Math.max(...values);
  const slot = box.w / values.length;
  return (
    <Svg>
      <Text x={24} y={24} text={bi("memory filled by BFS", "الذاكرة التي يملؤها BFS")} anchor="start" tone="heading" size={12} d={0} />
      <Box x={24} y={104} w={136} h={68} label="100 MB / s" sub={bi("of new nodes", "من العقد الجديدة")} tone="navy" d={100} />
      <Arrow pts={[[162, 138], [196, 138]]} tone="gold" d={300} dur={240} />
      <Bars x={box.x} y={box.y} w={box.w} h={box.h} values={values} labels={HOURS.map((h) => `${h} h`)} barTone={(i) => (i === values.length - 1 ? "danger" : "warn")} d={400} stagger={160} />
      {values.map((v, i) => (
        <Text key={i} x={box.x + i * slot + slot / 2} y={box.y + box.h - (v / max) * box.h - 10} text={`${thousands(v)} GB`} size={10.5} mono tone="heading" d={650 + i * 160} />
      ))}
      <Chip x={365} y={258} text={bi(`one day: ${thousands(gbAfterHours(24))} GB`, `يوم واحد: ${thousands(gbAfterHours(24))} GB`)} tone="danger" center size={11.5} d={1600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof bfs>>({ fifo: Fifo, optimal: Optimal, time: Time, memory: Memory });
