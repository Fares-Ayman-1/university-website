"use client";

import type { summary } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Text, Svg, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Expr } from "./local";

const ALGOS = ["BFS", "UCS", "DFS", "DLS", "IDS"] as const;
const X0 = 140;
const CW = 80;
const cx = (i: number) => X0 + i * CW + CW / 2;

function Head({ d = 0 }: { d?: number }) {
  return (
    <>
      {ALGOS.map((a, i) => (
        <Box key={a} x={X0 + i * CW} y={48} w={CW} h={36} r={0} label={a} tone="navy" size={12} d={d + i * 60} />
      ))}
    </>
  );
}

type Cell = { ok: boolean; note?: string | Bi };
const COMPLETE: Cell[] = [{ ok: true, note: bi("b finite", "b منتهٍ") }, { ok: true, note: "ε > 0" }, { ok: false }, { ok: true, note: "l ≥ d" }, { ok: true }];
const OPTIMAL: Cell[] = [{ ok: true, note: bi("equal costs", "تكاليف متساوية") }, { ok: true }, { ok: false }, { ok: false }, { ok: true, note: bi("equal costs", "تكاليف متساوية") }];

function Guarantees() {
  const rows = [
    { label: bi("Complete?", "مكتمل؟"), cells: COMPLETE, y: 84 },
    { label: bi("Optimal?", "أمثل؟"), cells: OPTIMAL, y: 156 },
  ];
  return (
    <Svg>
      <Head />
      {rows.map((row, r) => (
        <g key={r}>
          <Box x={20} y={row.y} w={120} h={72} r={0} label={row.label} tone="slate" d={300 + r * 600} />
          {row.cells.map((c, i) => (
            <g key={i}>
              <Box x={X0 + i * CW} y={row.y} w={CW} h={72} r={0} tone={c.ok ? "outline" : "muted"} d={350 + r * 600 + i * 80} />
              <Mark x={cx(i)} y={row.y + (c.note ? 22 : 36)} ok={c.ok} d={500 + r * 600 + i * 80} />
              {c.note ? <Text x={cx(i)} y={row.y + 46} text={c.note} size={10} tone="muted" d={550 + r * 600 + i * 80} /> : null}
            </g>
          ))}
        </g>
      ))}
      <Text x={280} y={256} text={bi("small print: the condition the mark needs", "الخط الصغير: الشرط الذي تحتاجه العلامة")} tone="muted" size={10.5} d={1800} />
    </Svg>
  );
}

type Formula = readonly (readonly [string, string?])[];
const TIME: Formula[] = [[["b", "d+1"]], [["b", "⌈C*/ε⌉"]], [["b", "m"]], [["b", "l"]], [["b", "d"]]];
const SPACE: Formula[] = [[["b", "d+1"]], [["b", "⌈C*/ε⌉"]], [["bm"]], [["bl"]], [["bd"]]];

function Costs() {
  const rows: { label: Bi; cells: Formula[]; y: number; tone: (i: number) => Tone }[] = [
    { label: bi("Time", "الزمن"), cells: TIME, y: 84, tone: () => "warn" },
    { label: bi("Space", "المساحة"), cells: SPACE, y: 150, tone: (i) => (i < 2 ? "danger" : "success") },
  ];
  return (
    <Svg>
      <Head />
      {rows.map((row, r) => (
        <g key={r}>
          <Box x={20} y={row.y} w={120} h={66} r={0} label={row.label} tone="slate" d={300 + r * 700} />
          {row.cells.map((f, i) => (
            <g key={i}>
              <Box x={X0 + i * CW} y={row.y} w={CW} h={66} r={0} tone={row.tone(i)} d={350 + r * 700 + i * 90} />
              <Expr x={cx(i)} y={row.y + 36} parts={f} size={15} anchor="middle" d={400 + r * 700 + i * 90} />
            </g>
          ))}
        </g>
      ))}
      <Chip x={140} y={252} text={bi("exponential time", "زمن أُسّي")} tone="warn" center size={11} d={1900} />
      <Chip x={290} y={252} text={bi("exponential space", "مساحة أُسّية")} tone="danger" center size={11} d={2000} />
      <Chip x={430} y={252} text={bi("linear space", "مساحة خطية")} tone="success" center size={11} d={2100} />
    </Svg>
  );
}

const PICKS: Record<string, { algo: (typeof ALGOS)[number]; reasons: Bi[] }> = {
  unit: {
    algo: "BFS",
    reasons: [bi("shallowest goal first", "أقرب هدف أولًا"), bi("optimal when costs are equal", "أمثل عند تساوي التكاليف"), bi("but memory grows as b^(d+1)", "لكن ذاكرته تنمو مثل b^(d+1)")],
  },
  costs: {
    algo: "UCS",
    reasons: [bi("lowest g(n) first", "الأقل g(n) أولًا"), bi("returns the cheapest solution", "يعيد الحل الأرخص"), bi("needs every step cost ≥ ε > 0", "يحتاج إلى تكاليف خطوات موجبة")],
  },
  memory: {
    algo: "IDS",
    reasons: [bi("linear space: bd", "مساحة خطية: bd"), bi("complete, optimal for equal costs", "مكتمل، وأمثل عند تساوي التكاليف"), bi("re-generates little", "يعيد توليد القليل")],
  },
};

function Pick({ control }: { control: string }) {
  const pick = PICKS[control];
  const at = ALGOS.indexOf(pick.algo);
  const cardX = (i: number) => 22 + i * 106;
  return (
    <Svg>
      {ALGOS.map((a, i) => (
        <Box key={a} x={cardX(i)} y={44} w={96} h={44} label={a} tone={i === at ? "gold" : "outline"} size={13} d={i * 80} />
      ))}
      <Arrow pts={[[cardX(at) + 48, 90], [280, 122]]} tone="gold" d={600} dur={300} />
      {pick.reasons.map((r, i) => (
        <Chip key={`${control}-${i}`} x={280} y={146 + i * 42} text={r} tone={i === 2 && control !== "memory" ? "warn" : "success"} center size={11} d={900 + i * 250} />
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof summary>>({ guarantees: Guarantees, costs: Costs, pick: Pick });
