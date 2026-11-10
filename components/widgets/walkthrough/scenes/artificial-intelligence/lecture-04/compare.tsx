"use client";

import { ASTAR_RUN, GREEDY_RUN, UCS_RUN } from "@/lib/widgets/ai-lecture-04";
import type { compare } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import type { Bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Mark, Text, Svg, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Expr } from "./local";

const ALGOS = ["UCS", "Greedy", "A*"] as const;
const X0 = 150;
const CW = 128;
const cx = (i: number) => X0 + i * CW + CW / 2;

type Cell = { ok?: boolean; formula?: readonly (readonly [string, string?])[]; words?: string | Bi; note?: string | Bi };
type Row = { label: Bi; cells: Cell[]; tone: (i: number, c: Cell) => Tone };

const ROWS: Row[] = [
  {
    label: bi("Complete?", "مكتمل؟"),
    cells: [{ ok: true, note: "ε > 0" }, { ok: false, note: bi("tree search loops", "يدور في حلقة شجريًا") }, { ok: true, note: bi("ε > 0, b finite", "ε > 0، و b منتهٍ") }],
    tone: (_, c) => (c.ok ? "outline" : "muted"),
  },
  {
    label: bi("Optimal?", "أمثل؟"),
    cells: [{ ok: true }, { ok: false }, { ok: true, note: bi("h admissible", "h مقبولة") }],
    tone: (_, c) => (c.ok ? "outline" : "muted"),
  },
  {
    label: bi("Time", "الزمن"),
    cells: [{ formula: [["b", "⌈C*/ε⌉"]] }, { formula: [["b", "m"]], note: bi("worst case", "أسوأ حالة") }, { words: "f(n) < C*", note: bi("exponential", "أُسّي") }],
    tone: () => "warn",
  },
  {
    label: bi("Space", "المساحة"),
    cells: [{ formula: [["b", "⌈C*/ε⌉"]] }, { formula: [["b", "m"]] }, { words: bi("every node", "كل العقد") }],
    tone: () => "danger",
  },
];

function TableScene() {
  const RH = 52;
  return (
    <Svg>
      {ALGOS.map((a, i) => (
        <Box key={a} x={X0 + i * CW} y={40} w={CW} h={26} r={0} label={a} tone="navy" size={12} d={i * 60} />
      ))}
      {ROWS.map((row, r) => {
        const y = 66 + r * RH;
        return (
          <g key={r}>
            <Box x={30} y={y} w={120} h={RH} r={0} label={row.label} tone="slate" size={11.5} d={300 + r * 400} />
            {row.cells.map((c, i) => (
              <g key={i}>
                <Box x={X0 + i * CW} y={y} w={CW} h={RH} r={0} tone={row.tone(i, c)} d={350 + r * 400 + i * 80} />
                {c.ok !== undefined ? <Mark x={cx(i)} y={y + (c.note ? 13 : 26)} ok={c.ok} r={9} d={450 + r * 400 + i * 80} /> : null}
                {c.formula ? <Expr x={cx(i)} y={y + (c.note ? 14 : 26)} parts={c.formula} size={15} anchor="middle" d={450 + r * 400 + i * 80} /> : null}
                {c.words ? <Text x={cx(i)} y={y + (c.note ? 14 : 18)} text={c.words} mono={typeof c.words === "string"} size={11.5} tone="heading" d={450 + r * 400 + i * 80} /> : null}
                {c.note ? <Text x={cx(i)} y={y + 29} text={c.note} size={9.5} tone="muted" d={500 + r * 400 + i * 80} /> : null}
              </g>
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

function Work() {
  const runs = [UCS_RUN, GREEDY_RUN, ASTAR_RUN];
  const x = 120;
  const w = 330;
  const slot = w / 3;
  const optimal = ASTAR_RUN.cost!;
  return (
    <Svg>
      <Text x={x - 6} y={48} text={bi("nodes removed from the fringe", "العقد المُزالة من الحافة")} anchor="start" tone="muted" size={10.5} d={0} />
      <Bars x={x} y={84} w={w} h={124} values={runs.map((r) => r.order.length)} labels={["UCS", "Greedy", "A*"]} max={UCS_RUN.order.length} showValues barTone={(i) => (i === 0 ? "slate" : i === 1 ? "warn" : "gold")} d={200} stagger={200} />
      {runs.map((r, i) => (
        <g key={i}>
          <Chip x={x + slot * i + slot / 2 - 10} y={252} text={`${r.cost} km`} tone={r.cost === optimal ? "success" : "danger"} center size={11} d={1000 + i * 200} />
          <Mark x={x + slot * i + slot / 2 + 34} y={252} ok={r.cost === optimal} r={9} d={1100 + i * 200} />
        </g>
      ))}
      <Text x={500} y={252} text={bi("route cost", "تكلفة الطريق")} tone="muted" size={10} d={1000} />
    </Svg>
  );
}

const PICKS: Record<string, { algo: (typeof ALGOS)[number]; reasons: Bi[] }> = {
  nohint: { algo: "UCS", reasons: [bi("needs only step costs", "يحتاج إلى تكاليف الخطوات فقط"), bi("returns the cheapest route", "يُرجع الطريق الأرخص"), bi("but explores in every direction", "لكنه يستكشف في كل اتجاه")] },
  fast: { algo: "Greedy", reasons: [bi("heads straight for the goal", "يتجه مباشرة نحو الهدف"), bi("often expands very few nodes", "كثيرًا ما يوسّع عقدًا قليلة جدًا"), bi("but its route may be longer", "لكن طريقه قد يكون أطول")] },
  best: { algo: "A*", reasons: [bi("cheapest route, if h is admissible", "الطريق الأرخص إن كانت h مقبولة"), bi("far fewer nodes than UCS", "عقد أقل بكثير من UCS"), bi("but keeps every node in memory", "لكنه يحتفظ بكل العقد في الذاكرة")] },
};

function Pick({ control }: { control: string }) {
  const pick = PICKS[control];
  const at = ALGOS.indexOf(pick.algo);
  const cardX = (i: number) => 70 + i * 150;
  return (
    <Svg>
      {ALGOS.map((a, i) => (
        <Box key={a} x={cardX(i)} y={44} w={120} h={40} label={a} tone={i === at ? "gold" : "outline"} size={13} d={i * 80} />
      ))}
      <Arrow pts={[[cardX(at) + 60, 86], [280, 118]]} tone="gold" d={600} dur={300} />
      {pick.reasons.map((r, i) => (
        <Chip key={`${control}-${i}`} x={280} y={144 + i * 42} text={r} tone={i === 2 ? "warn" : "success"} center size={11} d={900 + i * 250} />
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof compare>>({ table: TableScene, work: Work, pick: Pick });
