"use client";

import { ASTAR_RUN, GREEDY_RUN, GOAL, UCS_RUN, firstVisits, type BestFirstRun } from "@/lib/widgets/ai-lecture-04";
import type { informed } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, RomaniaMap, SIDE_MAP, shortName, type MapLine } from "./local";

/** The search-tree edge that first reached each city of a run (the parent of its first removal). */
const firstEdges = (run: BestFirstRun): MapLine[] =>
  firstVisits(run)
    .slice(1)
    .map((c, i) => {
      const step = run.steps.find((s) => s.removed.city === c)!;
      const p = step.removed.path;
      return { path: [p[p.length - 2], c], tone: "navy" as const, d: 500 + i * 220, width: 1.8 };
    });

function BlindInformed({ control }: { control: string }) {
  const run = control === "greedy" ? GREEDY_RUN : UCS_RUN;
  const cities = firstVisits(run);
  const STEP = 220;
  const T0 = 400;
  const order = new Map(cities.map((c, i) => [c, i]));
  const end = T0 + cities.length * STEP;
  const col = (i: number) => (i < 7 ? 0 : 1);
  const row = (i: number) => (i < 7 ? i : i - 7);
  return (
    <Svg>
      <RomaniaMap
        box={SIDE_MAP}
        look={(c) => (c === GOAL && order.has(c) ? "success" : order.has(c) ? "navy" : "muted")}
        lines={[...firstEdges(run), { path: run.path!, tone: "gold", d: end + 200 }]}
        badges={cities.map((c, i) => ({ city: c, n: i + 1, d: T0 + i * STEP }))}
      />
      <Text x={330} y={50} text={bi("removed from the fringe, in order", "المُزالة من الحافة بالترتيب")} anchor="start" tone="muted" size={10.5} d={T0} />
      {cities.map((c, i) => (
        <Box
          key={c}
          x={330 + col(i) * 108}
          y={72 + row(i) * 23}
          w={102}
          h={20}
          r={4}
          label={`${i + 1}  ${shortName(c)}`}
          tone={c === GOAL ? "success" : "outline"}
          size={10}
          mono
          d={T0 + i * STEP}
        />
      ))}
      <Chip
        x={438}
        y={252}
        text={bi(`${cities.length} cities · ${run.cost} km`, `${cities.length} مدينة · ${run.cost} km`)}
        tone={control === "greedy" ? "warn" : "slate"}
        center
        size={11}
        d={end + 300}
      />
    </Svg>
  );
}

function Knowledge() {
  const items = [
    bi("initial state", "الحالة الابتدائية"),
    bi("actions", "الأفعال"),
    bi("transition model", "نموذج الانتقال"),
    bi("goal test", "اختبار الهدف"),
    bi("path cost", "تكلفة المسار"),
  ];
  return (
    <Svg>
      <Box x={20} y={44} w={246} h={44} label={bi("Problem definition", "تعريف المسألة")} tone="navy" size={12} d={0} />
      {items.map((it, i) => (
        <Chip key={i} x={81 + (i % 2) * 124} y={116 + Math.floor(i / 2) * 42} text={it} tone="outline" size={10} w={116} center d={200 + i * 120} />
      ))}
      <Box x={20} y={226} w={246} h={46} label={bi("Hint: h(n) from map coordinates", "تلميح: h(n) من إحداثيات الخريطة")} tone="gold" size={11.5} d={1200} />
      <Box x={340} y={96} w={190} h={60} label={bi("Search algorithm", "خوارزمية البحث")} tone="slate" size={12.5} d={700} />
      <Arrow pts={[[268, 66], [300, 66], [300, 116], [338, 116]]} tone="navy" d={900} dur={420} />
      <Arrow pts={[[268, 249], [314, 249], [314, 140], [338, 140]]} tone="gold" d={1500} dur={420} />
      <Chip x={435} y={198} text={bi("uninformed: the definition only", "غير مُوجَّه: التعريف وحده")} tone="slate" center size={10.5} d={1100} />
      <Chip x={435} y={246} text={bi("informed: the definition + h(n)", "مُوجَّه: التعريف + h(n)")} tone="gold" center size={10.5} d={1800} />
    </Svg>
  );
}

const RUNS: Record<string, BestFirstRun> = { ucs: UCS_RUN, greedy: GREEDY_RUN, astar: ASTAR_RUN };

function BestFirst({ control }: { control: string }) {
  const run = RUNS[control];
  const fringe = run.steps[0].fringe;
  const children = run.steps[0].added;
  const cx = [110, 280, 450];
  const rank = new Map(fringe.map((n, i) => [n.city, i]));
  const f = (n: (typeof fringe)[number]) => (control === "ucs" ? `f = g = ${n.f}` : control === "greedy" ? `f = h = ${n.f}` : `f = ${n.g} + ${n.h} = ${n.f}`);
  return (
    <Svg>
      <Box x={235} y={44} w={90} h={28} label="Arad" tone="navy" size={12} d={0} />
      {children.map((n, i) => (
        <Arrow key={n.city} pts={[[280, 74], [cx[i], 106]]} tone="faint" head={false} d={150 + i * 80} dur={260} label={`${n.g} km`} labelAt={[(280 + cx[i]) / 2 + (i === 1 ? 32 : i === 0 ? -30 : 30), 80]} />
      ))}
      {children.map((n, i) => (
        <Box key={n.city} x={cx[i] - 70} y={108} w={140} h={44} label={n.city} sub={f(n)} tone={rank.get(n.city) === 0 ? "gold" : "outline"} size={12} subSize={10.5} d={300 + i * 80} />
      ))}
      <Text x={20} y={196} text={bi("fringe, lowest f first", "الحافة، الأقل f أولًا")} anchor="start" tone="muted" size={10.5} d={700} />
      {fringe.map((n, i) => (
        <Box key={n.city} x={20 + i * 132} y={216} w={124} h={36} r={6} label={`${n.city}  ${n.f}`} tone={i === 0 ? "gold" : "outline"} size={11} mono d={800 + i * 160} />
      ))}
      <Text x={480} y={234} text={bi("next out: front", "التالية: المقدمة")} tone="gold" size={10.5} d={1400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof informed>>({ "blind-informed": BlindInformed, knowledge: Knowledge, "best-first": BestFirst });
