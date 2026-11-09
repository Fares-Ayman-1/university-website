"use client";

import { costDepth, goalOnGeneration, traceOf, ucsProblem, UCS_MAP } from "@/lib/widgets/ai-lecture-03";
import { C_STAR, type ucs } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import { runSearch, type SearchRun } from "@/lib/widgets/search";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Cells, FringeTable, MapView, Pow } from "./local";

const run = runSearch(ucsProblem(), "ucs", UCS_MAP.goal);
const unitRun = runSearch(ucsProblem(true), "ucs", UCS_MAP.goal);
const trace = traceOf(run);
const early = goalOnGeneration(run)!;
const initial = (id: string) => id[0];
const STEP = 420;
const T0 = 300;

/** g of each town when UCS expands it. */
const gAtExpansion = (r: SearchRun) =>
  Object.fromEntries(r.steps.filter((s) => s.popped && s.kind !== "skip").map((s) => [s.popped!.path[s.popped!.path.length - 1], s.popped!.cost]));

function Priority() {
  const rows = trace.map((r) => [r.node ? (r.kind === "goal" ? `${r.node} ✓` : r.node) : "—", r.fringe.map((f) => `${initial(f.id)}:${f.cost}`).join(" ") || "—"]);
  return (
    <Svg>
      <MapView box={{ x: 52, y: 78, w: 226, h: 140 }} costs="km" order={run.order} path={run.path!} size={11} d={0} start={T0 + 2 * STEP} step={STEP} />
      <FringeTable x={332} y={50} rows={rows} cw={[88, 120]} rh={24} d={T0} stagger={STEP} tone={(r) => (trace[r].kind === "goal" ? "success" : undefined)} />
      <Text x={436} y={242} text={bi("fringe: cheapest g first", "الحافة: الأقل g أولًا")} tone="muted" size={10.5} d={T0} />
      <Text x={160} y={250} text={bi("road lengths in km", "أطوال الطرق بالكيلومتر")} tone="muted" size={10.5} d={200} />
    </Svg>
  );
}

function Equal({ control }: { control: string }) {
  const unit = control === "unit";
  const r = unit ? unitRun : run;
  return (
    <Svg>
      <MapView box={{ x: 70, y: 64, w: 410, h: 150 }} costs={unit ? "unit" : "km"} order={r.order} path={r.path!} g={gAtExpansion(r)} d={0} step={360} />
      <Chip
        x={280}
        y={262}
        text={unit ? bi("g = depth: the same order as BFS", "g = العمق: الترتيب نفسه الذي يتبعه BFS") : bi(`the cheapest route: ${r.cost} km`, `الطريق الأرخص: ${r.cost} km`)}
        tone={unit ? "slate" : "success"}
        center
        size={11}
        d={2200}
      />
    </Svg>
  );
}

function GoalTest({ control }: { control: string }) {
  const generated = control === "generated";
  const steps = trace.filter((t) => t.kind === "expand");
  const stopAt = steps.findIndex((t) => t.fringe.some((f) => f.id === UCS_MAP.goal));
  const shown = generated ? steps.slice(0, stopAt + 1) : steps;
  const y = (i: number) => 48 + i * 46;
  return (
    <Svg>
      {shown.map((t, i) => (
        <g key={i}>
          <Text x={24} y={y(i) + 20} text={bi(`expand ${t.node}`, `وسّع ${t.node}`)} anchor="start" tone="heading" size={11.5} d={i * 420} />
          <Arrow pts={[[150, y(i) + 20], [184, y(i) + 20]]} tone="faint" d={i * 420 + 100} dur={200} />
          <Cells
            x={190}
            y={y(i)}
            items={t.fringe.map((f) => ({ label: f.id, sub: `g = ${f.cost}` }))}
            cw={96}
            ch={40}
            size={11}
            tone={(k) => (t.fringe[k].id !== UCS_MAP.goal ? "outline" : t.fringe[k].cost === early.cost ? (generated ? "danger" : "warn") : "success")}
            d={i * 420 + 150}
          />
        </g>
      ))}
      {generated ? (
        <>
          <Chip x={460} y={y(stopAt) + 20} text={bi(`stop: ${early.cost} km`, `توقّف: ${early.cost} km`)} tone="danger" center size={11} d={stopAt * 420 + 600} />
          <Mark x={530} y={y(stopAt) + 20} ok={false} d={stopAt * 420 + 800} />
          <Text x={280} y={y(stopAt + 1) + 30} text={bi(`a generated goal is returned at once, though ${run.cost} km was still possible`, `يُعاد الهدف المولَّد فورًا، مع أن ${run.cost} km كان لا يزال ممكنًا`)} tone="danger" size={11} d={stopAt * 420 + 1000} />
        </>
      ) : (
        <>
          <Chip x={460} y={y(stopAt) + 20} text={bi("generated: it waits", "مولَّدة: تنتظر")} tone="warn" center size={10.5} d={stopAt * 420 + 600} />
          <Text x={24} y={y(steps.length) + 20} text={bi("remove the front", "أزِل المقدمة")} anchor="start" tone="heading" size={11.5} d={steps.length * 420} />
          <Arrow pts={[[150, y(steps.length) + 20], [184, y(steps.length) + 20]]} tone="faint" d={steps.length * 420 + 100} dur={200} />
          <Cells x={190} y={y(steps.length)} items={[{ label: UCS_MAP.goal, sub: `g = ${run.cost}` }]} cw={96} ch={40} size={11} tone={() => "success"} d={steps.length * 420 + 150} />
          <Chip x={420} y={y(steps.length) + 20} text={bi("goal test passes", "يجتاز اختبار الهدف")} tone="success" center size={10.5} d={steps.length * 420 + 400} />
          <Mark x={510} y={y(steps.length) + 20} ok d={steps.length * 420 + 600} />
        </>
      )}
    </Svg>
  );
}

function Bound({ control }: { control: string }) {
  const eps = Number(control);
  const n = costDepth(C_STAR, eps);
  const x0 = 70;
  const unit = 66;
  const axisY = 226;
  const finite = Number.isFinite(n);
  const nodes = finite ? Array.from({ length: n + 1 }, (_, k) => ({ x: x0 + k * eps * unit, y: 70 + (k * 130) / n, k })) : [0, 1, 2, 3].map((k) => ({ x: x0, y: 70 + k * 40, k }));
  return (
    <Svg>
      <Arrow pts={[[x0 - 10, axisY], [x0 + C_STAR * unit + 30, axisY]]} tone="faint" d={0} dur={300} />
      {Array.from({ length: C_STAR + 1 }, (_, c) => (
        <Text key={c} x={x0 + c * unit} y={axisY + 14} text={String(c)} size={10.5} mono tone="muted" d={100 + c * 40} />
      ))}
      <Text x={x0 + (C_STAR * unit) / 2} y={axisY + 34} text={bi("path cost g", "تكلفة المسار g")} tone="muted" size={10.5} d={200} />
      <Arrow pts={[[x0 + C_STAR * unit, 56], [x0 + C_STAR * unit, axisY]]} tone="gold" dashed head={false} d={300} />
      <Text x={x0 + C_STAR * unit} y={44} text={`C* = ${C_STAR}`} tone="gold" size={12} mono d={300} />
      {nodes.slice(1).map((p, i) => (
        <Arrow key={i} pts={[[nodes[i].x + (finite ? 8 : 0), nodes[i].y + 11], [p.x - (finite ? 8 : 0), p.y - 11]]} tone={finite ? "navy" : "danger"} d={500 + i * 220} dur={200} />
      ))}
      {nodes.map((p, i) => (
        <Box key={i} x={p.x - 14} y={p.y - 11} w={28} h={22} r={11} label={String(p.k)} tone={finite ? (i === nodes.length - 1 ? "gold" : "navy") : "danger"} size={10.5} d={400 + i * 220} />
      ))}
      {finite ? null : (
        <>
          <Text x={x0} y={212} text="⋮" size={14} tone="danger" d={1400} />
          <Chip x={250} y={150} text={bi("zero-cost steps: g stays 0", "خطوات تكلفتها صفر: تبقى g = 0")} tone="danger" center size={11} d={1500} />
        </>
      )}
      <Text x={x0 - 46} y={40} text={bi("depth", "العمق")} anchor="start" tone="muted" size={10.5} d={0} />
      <Fade d={1600}>
        <Box x={380} y={70} w={160} h={64} r={8} tone="muted" />
      </Fade>
      <Text x={460} y={88} text={`⌈C*/ε⌉ = ${finite ? n : "∞"}`} size={12.5} mono tone="heading" d={1700} />
      <Pow x={460} y={116} base="O(b" exp={finite ? String(n) : "∞"} after=")" size={14} tone={finite ? "gold" : "danger"} anchor="middle" d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof ucs>>({ priority: Priority, equal: Equal, "goal-test": GoalTest, bound: Bound });
