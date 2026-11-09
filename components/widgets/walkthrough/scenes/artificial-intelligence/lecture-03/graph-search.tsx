"use client";

import { NO_GOAL, ROMANIA_TREE, chainProblem, label, placeTree, repeatsIn, traceOf, treeOf } from "@/lib/widgets/ai-lecture-03";
import { CHAIN, CHAIN_TREE, type graphSearch } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import { runSearch } from "@/lib/widgets/search";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { FringeTable, TreeView, type TreeLight } from "./local";

const LEVEL_Y = (k: number) => 64 + k * 60;

/** The slide's chain: each state has two actions leading to the next one. */
function Chain({ x, lit = [] }: { x: number; lit?: readonly { id: string; d: number }[] }) {
  return (
    <>
      {CHAIN.map((s, k) => (
        <Box key={s} x={x - 22} y={LEVEL_Y(k) - 14} w={44} h={28} r={14} label={s} tone="outline" d={k * 120} />
      ))}
      {CHAIN.slice(1).map((_, k) =>
        [-7, 7].map((dx) => <Arrow key={`${k}${dx}`} pts={[[x + dx, LEVEL_Y(k) + 14], [x + dx, LEVEL_Y(k + 1) - 16]]} tone="navy" d={60 + k * 120} dur={200} />),
      )}
      {lit.map((l) => (
        <Fade key={l.id} d={l.d}>
          <Box x={x - 22} y={LEVEL_Y(CHAIN.indexOf(l.id as (typeof CHAIN)[number])) - 14} w={44} h={28} r={14} label={l.id} tone="navy" />
        </Fade>
      ))}
    </>
  );
}

const unfolded = placeTree(CHAIN_TREE, { x: 196, y: LEVEL_Y(0), w: 330, h: LEVEL_Y(CHAIN.length - 1) - LEVEL_Y(0) });

function Unfold() {
  const lights: TreeLight[] = unfolded.nodes.map((n) => ({ id: n.id, d: 600 + n.depth * 400 + (n.id.includes("#") ? 120 : 0), tone: n.id.includes("#") ? "warn" : "navy" }));
  return (
    <Svg>
      <Text x={62} y={28} text={bi("states", "الحالات")} tone="heading" size={12} d={0} />
      <Text x={142} y={28} text={bi("nodes", "العقد")} tone="heading" size={12} d={400} />
      <Text x={361} y={28} text={bi("tree search", "البحث الشجري")} tone="heading" size={12} d={400} />
      <Chain x={62} />
      {CHAIN.map((_, k) => (
        <Text key={k} x={142} y={LEVEL_Y(k)} text={String(2 ** k)} size={14} mono tone="gold" d={600 + k * 400} />
      ))}
      <TreeView tree={unfolded} nw={26} nh={22} size={11} lights={lights} d={400} />
    </Svg>
  );
}

const chainRun = runSearch(chainProblem(CHAIN), "bfs", CHAIN[CHAIN.length - 1]);
const chainTrace = traceOf(chainRun);
const STEP = 420;
const T0 = 400;

function Closed() {
  const rows = chainTrace.map((t, i) => {
    const s = chainRun.steps[i];
    const node = t.node ? (t.kind === "skip" ? `${t.node} ✗` : t.kind === "goal" ? `${t.node} ✓` : t.node) : "—";
    return [node, s.explored.join(" ") || "—", t.fringe.map((f) => f.id).join(" ") || "—"];
  });
  const lit = chainRun.steps.flatMap((s, i) => (s.popped && s.kind !== "skip" ? [{ id: s.popped.path[s.popped.path.length - 1], d: T0 + (i + 1) * STEP }] : []));
  return (
    <Svg>
      <Chain x={62} lit={lit} />
      <FringeTable
        x={140}
        y={44}
        rows={rows}
        head={["node", "closed", "fringe"]}
        cw={[80, 150, 150]}
        rh={25}
        size={11}
        d={T0}
        stagger={STEP}
        tone={(r) => (chainTrace[r].kind === "skip" ? "danger" : chainTrace[r].kind === "goal" ? "success" : undefined)}
      />
      <Text x={330} y={256} text={bi("✗ already in closed: skipped, not expanded", "✗ موجودة في closed: تُتخطّى ولا تُوسَّع")} tone="danger" size={11} d={T0 + 4 * STEP} />
    </Svg>
  );
}

const romania = placeTree(ROMANIA_TREE, { x: 46, y: 64, w: 468, h: 150 });
const order = runSearch(treeOf(ROMANIA_TREE), "bfs", NO_GOAL).order;
const repeats = new Set(repeatsIn(order));

function Romania({ control }: { control: string }) {
  const graph = control === "graph";
  const step = 220;
  let n = 0;
  const marks = order.map((id, i) => {
    const skipped = graph && repeats.has(id);
    if (!skipped) n++;
    return { id, d: 400 + i * step, skipped, n };
  });
  const lights: TreeLight[] = marks.map((m) => ({ id: m.id, d: m.d, tone: m.skipped ? "danger" : label(m.id) === "Arad" && m.id !== "Arad" ? "warn" : "navy", dashed: m.skipped }));
  const badges = marks.map((m) => ({ id: m.id, n: m.skipped ? "✗" : m.n, d: m.d, tone: m.skipped ? ("danger" as const) : undefined }));
  const expanded = marks.filter((m) => !m.skipped).length;
  return (
    <Svg>
      <TreeView tree={romania} nh={24} size={10.5} lights={lights} badges={badges} d={0} />
      <Chip
        x={280}
        y={256}
        text={
          graph
            ? bi(`closed set: ${expanded} states expanded, ${repeats.size} copies skipped`, `المجموعة المغلقة: توسيع ${expanded} حالات وتخطّي ${repeats.size} نسخ`)
            : bi(`${order.length} nodes expanded, and the Arad copies would grow again`, `توسيع ${order.length} عقدة، ونسخ Arad ستنمو من جديد`)
        }
        tone={graph ? "success" : "warn"}
        center
        size={11}
        d={400 + order.length * step}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof graphSearch>>({ unfold: Unfold, closed: Closed, romania: Romania });
