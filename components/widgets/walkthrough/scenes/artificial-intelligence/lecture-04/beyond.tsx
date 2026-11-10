"use client";

import {
  ASTAR_RUN,
  H_SLD,
  PUZZLE_GOAL,
  PUZZLE_START,
  TOY_CONSISTENT_RUN,
  TOY_EDGES,
  TOY_H_CONSISTENT,
  TOY_H_INCONSISTENT,
  TOY_H_STAR,
  TOY_INCONSISTENT_RUN,
  manhattan,
  misplaced,
  puzzleAstar,
  tileDistances,
} from "@/lib/widgets/ai-lecture-04";
import type { beyond } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Fade, Mark, Text, Svg, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Board, FringeList, Key, cellCentre, trim } from "./local";

function Consistent() {
  const S: Pt = [110, 112];
  const R: Pt = [250, 196];
  const B: Pt = [460, 136];
  const bound = 80 + H_SLD.Rimnicu_Vilcea;
  const pathF = ASTAR_RUN.steps.filter((s) => s.removed.path.join() === ASTAR_RUN.path!.slice(0, s.removed.path.length).join()).map((s) => s.removed.f);
  const [s1, r1] = trim(S, R, 30, 46);
  const [r2, b2] = trim(R, B, 46, 46);
  const [s3, b3] = trim(S, B, 30, 46);
  return (
    <Svg>
      <Arrow pts={[s1, r1]} tone="navy" width={2.4} d={300} dur={300} label="c = 80" labelAt={[152, 170]} labelTone="text" />
      <Arrow pts={[r2, b2]} tone="gold" dashed head={false} d={700} label={`h = ${H_SLD.Rimnicu_Vilcea}`} labelAt={[372, 186]} labelTone="gold" />
      <Arrow pts={[s3, b3]} tone="gold" dashed head={false} d={500} label={`h = ${H_SLD.Sibiu}`} labelAt={[300, 112]} labelTone="gold" />
      <Box x={S[0] - 30} y={S[1] - 14} w={60} h={28} label="Sibiu" tone="navy" size={11.5} d={0} />
      <Box x={R[0] - 46} y={R[1] - 14} w={92} h={28} label="Rimnicu V." tone="outline" size={11} d={100} />
      <Box x={B[0] - 46} y={B[1] - 14} w={92} h={28} label="Bucharest" tone="success" size={11} d={200} />
      <Box x={300} y={44} w={226} h={34} label={`${H_SLD.Sibiu} ≤ 80 + ${H_SLD.Rimnicu_Vilcea} = ${bound}`} tone="success" size={12} mono d={1100} />
      <Mark x={532} y={61} ok d={1300} />
      <Text x={20} y={222} text={bi("f on the optimal route:", "f على الطريق الأمثل:")} anchor="start" tone="muted" size={10.5} d={1500} />
      {pathF.map((f, i) => (
        <g key={i}>
          <Box x={176 + i * 74} y={210} w={52} h={24} r={6} label={String(f)} tone="outline" size={11} mono d={1600 + i * 150} />
          {i > 0 ? <Arrow pts={[[176 + i * 74 - 20, 222], [176 + i * 74 - 3, 222]]} tone="faint" d={1600 + i * 150} dur={150} /> : null}
        </g>
      ))}
      <Text x={176 + 2 * 74 + 26} y={250} text={bi("never decreases", "لا تتناقص أبدًا")} tone="success" size={10.5} d={2400} />
    </Svg>
  );
}

const TOY_AT: Record<string, Pt> = { S: [40, 150], A: [125, 82], B: [125, 218], C: [210, 150], G: [292, 150] };
const TOY_COST_AT: Record<string, Pt> = { "S-A": [70, 104], "S-B": [70, 196], "A-C": [180, 104], "B-C": [180, 196], "C-G": [251, 138] };
const TOY_H_AT: Record<string, Pt> = { S: [40, 126], A: [125, 58], B: [125, 248], C: [210, 176], G: [292, 176] };

function GraphSearch({ control }: { control: string }) {
  const consistent = control === "consistent";
  const h = consistent ? TOY_H_CONSISTENT : TOY_H_INCONSISTENT;
  const run = consistent ? TOY_CONSISTENT_RUN : TOY_INCONSISTENT_RUN;
  const optimal = TOY_H_STAR.S;
  const r = 14;
  return (
    <Svg>
      {TOY_EDGES.map(([a, b, c], i) => {
        const [p, q] = trim(TOY_AT[a], TOY_AT[b], r + 1, r + 3);
        return <Arrow key={i} pts={[p, q]} tone="faint" d={100 + i * 80} dur={220} label={String(c)} labelAt={TOY_COST_AT[`${a}-${b}`]} />;
      })}
      {Object.entries(TOY_AT).map(([n, [x, y]]) => (
        <Box key={n} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} label={n} tone={n === "G" ? "success" : n === "A" ? (consistent ? "gold" : "warn") : "outline"} size={12} d={0} />
      ))}
      {Object.entries(TOY_H_AT).map(([n, [x, y]]) => (
        <Text key={n} x={x} y={y} text={`h=${h[n]}`} mono size={10} tone={n === "A" ? (consistent ? "gold" : "danger") : "muted"} d={500} />
      ))}
      <FringeList
        x={322}
        y={52}
        head={["n", "g", "f"]}
        headH={20}
        rows={run.steps.map((s) => [s.node, String(s.g), String(s.f)])}
        cw={[44, 40, 40]}
        rh={22}
        size={11}
        frontTone="outline"
        mark={(i) => (run.steps[i].kind === "skip" ? "muted" : run.steps[i].kind === "goal" ? (run.cost === optimal ? "success" : "danger") : undefined)}
        d={800}
        stagger={220}
      />
      {run.steps.map((s, i) =>
        s.kind === "skip" ? (
          <Text key={i} x={454} y={72 + i * 22 + 11} text={bi("closed: skipped", "مغلقة: تُتخطّى")} anchor="start" tone="danger" size={10} d={800 + (i + 1) * 220} />
        ) : null,
      )}
      <Text x={384} y={226} text={`returns ${run.cost}`} mono size={12} tone={run.cost === optimal ? "success" : "danger"} d={2400} />
      <Mark x={448} y={226} ok={run.cost === optimal} d={2500} />
      <Text
        x={330}
        y={258}
        text={consistent ? `h(A) = ${h.A} ≤ 1 + h(C) = ${1 + h.C}` : `h(A) = ${h.A} > 1 + h(C) = ${1 + h.C}`}
        anchor="start"
        mono
        size={10.5}
        tone={consistent ? "success" : "danger"}
        d={600}
      />
    </Svg>
  );
}

const CELL = 52;
const BX = 70;
const BY = 74;

function Puzzle({ control }: { control: string }) {
  const h2Mode = control === "h2";
  const dist = tileDistances(PUZZLE_START);
  const wrong = (i: number) => PUZZLE_START[i] !== 0 && PUZZLE_GOAL[i] !== PUZZLE_START[i];
  const sum = h2Mode ? `h2 = ${dist.filter((_, i) => PUZZLE_START[i] !== 0).join("+")} = ${manhattan(PUZZLE_START)}` : `h1 = ${misplaced(PUZZLE_START)}`;
  return (
    <Svg>
      <Text x={BX + (3 * CELL) / 2} y={46} text={bi("start", "البداية")} tone="muted" size={10.5} d={0} />
      <Board x={BX} y={BY} tiles={PUZZLE_START} cell={CELL} tone={(i) => (h2Mode ? (dist[i] ? "warn" : "success") : wrong(i) ? "warn" : "success")} d={0} />
      {h2Mode
        ? PUZZLE_START.map((t, i) => {
            if (!t) return null;
            const [x, y] = cellCentre(BX, BY, i, 3, CELL);
            return (
              <Fade key={i} d={400 + i * 90}>
                <Box x={x + CELL / 2 - 17} y={y - CELL / 2 + 3} w={14} h={14} r={7} label={String(dist[i])} tone="navy" size={8.5} />
              </Fade>
            );
          })
        : null}
      <Text x={440} y={46} text={bi("goal", "الهدف")} tone="muted" size={10.5} d={0} />
      <Board x={395} y={74} tiles={PUZZLE_GOAL} cell={30} d={100} />
      <Box x={290} y={180} w={250} h={40} label={sum} tone="gold" size={12} mono d={1300} />
      <Text x={415} y={250} text={bi(`true cost: ${puzzleAstar("h2").cost} moves`, `التكلفة الحقيقية: ${puzzleAstar("h2").cost} نقلة`)} tone="muted" size={10.5} d={1500} />
      {h2Mode ? (
        <Text x={BX + (3 * CELL) / 2} y={250} text={bi("badge: squares to go", "الشارة: المربعات المتبقية")} tone="muted" size={10.5} d={1000} />
      ) : (
        <>
          <Key x={BX - 6} y={250} tone="warn" text={bi("misplaced", "في غير موضعها")} d={1000} />
          <Key x={BX + 92} y={250} tone="success" text={bi("in place", "في موضعها")} d={1000} />
        </>
      )}
    </Svg>
  );
}

function Dominance() {
  const h1 = misplaced(PUZZLE_START);
  const h2 = manhattan(PUZZLE_START);
  const r1 = puzzleAstar("h1");
  const r2 = puzzleAstar("h2");
  const x0 = 70;
  const span = 420;
  const at = (v: number) => x0 + (v / r2.cost) * span;
  const marks = [
    { v: h1, label: "h1", tone: "warn" as const },
    { v: h2, label: "h2", tone: "gold" as const },
    { v: r2.cost, label: "h*", tone: "success" as const },
  ];
  const barW = (n: number) => (n / r1.expanded) * 340;
  return (
    <Svg>
      <Arrow pts={[[x0, 92], [x0 + span + 16, 92]]} tone="faint" head={false} d={0} dur={300} />
      {[0, 5, 10, 15, 20].map((v) => (
        <Text key={v} x={at(v)} y={110} text={String(v)} mono size={9.5} tone="muted" d={100} />
      ))}
      {marks.map((m, i) => (
        <g key={m.label}>
          <Box x={at(m.v) - 7} y={85} w={14} h={14} r={7} tone={m.tone} d={300 + i * 250} />
          <Text x={at(m.v)} y={66} text={`${m.label} = ${m.v}`} mono size={11} tone="heading" d={350 + i * 250} />
        </g>
      ))}
      <Text x={x0} y={136} text={bi("A* graph search: states expanded", "البحث A* في الرسم البياني: الحالات الموسَّعة")} anchor="start" tone="muted" size={10.5} d={1100} />
      <Text x={x0 + 50} y={180} text="h1" anchor="end" mono size={11.5} tone="heading" d={1200} />
      <Box x={x0 + 60} y={168} w={barW(r1.expanded)} h={24} r={3} tone="warn" d={1200} />
      <Text x={x0 + 66 + barW(r1.expanded)} y={180} text={r1.expanded.toLocaleString("en-US")} anchor="start" mono size={11} tone="heading" d={1400} />
      <Text x={x0 + 50} y={222} text="h2" anchor="end" mono size={11.5} tone="heading" d={1500} />
      <Box x={x0 + 60} y={210} w={barW(r2.expanded)} h={24} r={3} tone="gold" d={1500} />
      <Text x={x0 + 66 + barW(r2.expanded)} y={222} text={r2.expanded.toLocaleString("en-US")} anchor="start" mono size={11} tone="heading" d={1700} />
      <Text x={280} y={250} text={bi("h1 ≤ h2 ≤ h* in every state: h2 dominates", "h1 ≤ h2 ≤ h* في كل حالة: h2 يهيمن")} tone="success" size={10.5} d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof beyond>>({ consistent: Consistent, "graph-search": GraphSearch, puzzle: Puzzle, dominance: Dominance });
