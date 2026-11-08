"use client";

import type { equalization } from "@/lib/walkthroughs/image-processing/lecture-02";
import { EQ, EQ_HIST, EQ_LEVELS, EQ_SMALL, F, F_HIST, F_LEVELS, F_USED, G, LINEAR_SMALL, fmt2, remapHist } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Curve, Pixels, Svg, Table, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Axes, Dot, Remap } from "./local";

const L16 = Array.from({ length: EQ_LEVELS }, (_, i) => String(i));
const EVERY5 = L16.map((s, i) => (i % 5 === 0 ? s : ""));
const L8 = Array.from({ length: F_LEVELS }, (_, i) => String(i));

function Idea() {
  const uniform = EQ_HIST.map(() => EQ.n / EQ_LEVELS);
  const max = Math.max(...EQ_HIST);
  return (
    <Svg>
      <Text x={140} y={40} text={bi("before", "قبل")} size={12} tone="heading" d={0} />
      <Bars x={30} y={70} w={220} h={120} values={EQ_HIST} labels={EVERY5} max={max} tone="slate" d={0} stagger={40} />
      <Arrow pts={[[258, 150], [302, 150]]} tone="gold" d={900} />
      <Text x={420} y={40} text={bi("the goal: uniform", "الهدف: مدرج منتظم")} size={12} tone="heading" d={900} />
      <Bars x={310} y={70} w={220} h={120} values={uniform} labels={EVERY5} max={max} tone="gold" d={1000} stagger={40} />
      <Chip x={140} y={244} text={bi("stretching: you choose a, b, γ", "المط: أنت تختار a و b و γ")} tone="slate" center d={1800} />
      <Chip x={420} y={244} text={bi("equalization: automatic", "التسوية: آلية")} tone="gold" center d={2100} />
    </Svg>
  );
}

function Cdf() {
  const box: PlotBox = { x: 60, y: 50, w: 416, h: 170, domain: [-0.5, EQ_LEVELS - 0.5], range: [0, EQ_LEVELS - 1] };
  const points = EQ.scaled.map((s, i) => [i, s] as const);
  const slot = box.w / EQ_LEVELS;
  return (
    <Svg>
      <Text x={box.x - 10} y={box.y + box.h / 2} text="n_i" size={12} mono anchor="end" tone="slate" d={0} />
      <Bars x={box.x} y={box.y} w={box.w} h={box.h} values={EQ_HIST} labels={L16} tone="slate" d={0} stagger={40} />
      <Axes box={box} ysRight={[5, 10, 15]} d={0} />
      <Curve box={box} points={points} d={900} dur={1200} />
      {points.map(([i, s]) => (
        <Dot key={i} at={plotAt(box, i, s)} r={3.2} d={1100 + i * 60} />
      ))}
      <Text x={box.x + 4 * slot} y={box.y + box.h - 24} text="15 · CDF(i)" size={12} mono tone="gold" d={1300} />
      <Text x={box.x - 10} y={26} text="j" size={12.5} mono anchor="end" tone="gold" d={2000} />
      {EQ.map.map((j, i) => (
        <Text key={i} x={box.x + (i + 0.5) * slot} y={26} text={String(j)} size={11} mono tone="gold" d={2000 + i * 40} />
      ))}
    </Svg>
  );
}

const ROWS: { label: string; i: number }[] = [
  { label: "0", i: 0 },
  { label: "1–8", i: 1 },
  { label: "9", i: 9 },
  { label: "10", i: 10 },
  { label: "11", i: 11 },
  { label: "12", i: 12 },
  { label: "13", i: 13 },
  { label: "14–15", i: 14 },
];

function TableScene() {
  const rows = ROWS.map(({ label, i }) => [label, String(EQ_HIST[i]), String(EQ.cum[i]), fmt2(EQ.scaled[i]), String(EQ.map[i])]);
  const nine = ROWS.findIndex((r) => r.i === 9);
  return (
    <Svg>
      <Table x={16} y={34} cols={["i", "n_i", "Σ n_i", "Σ / 24", "j"]} rows={rows} cw={[56, 44, 56, 60, 40]} d={0} stagger={140} cell={(r) => (r === nine ? "gold" : undefined)} />
      <Text x={420} y={50} text={`j = round(Σ n_i · 15/${EQ.n})`} size={12} mono tone="heading" d={600} />
      <Chip x={420} y={84} text={`15/${EQ.n} = 1/24`} tone="slate" center d={800} />
      <Box x={300} y={120} w={240} h={60} label={`${EQ.cum[9]} / 24 = ${fmt2(EQ.scaled[9])}`} sub={bi(`rounds to ${EQ.map[9]}`, `تقريبها ${EQ.map[9]}`)} mono tone="gold" d={1800} />
      <Text x={420} y={208} text={bi("the slide prints 3.65 here", "تطبع الشريحة هنا 3.65")} size={11.5} tone="danger" d={2300} />
    </Svg>
  );
}

const ResultScene = () => (
  <Svg>
    <Remap x={60} w={480} top={30} h={66} gap={74} before={EQ_HIST} map={EQ.map} labels={L16} names={[bi("before", "قبل"), bi("after", "بعد")]} />
  </Svg>
);

const PICK = 3;

function Small({ control }: { control: string }) {
  const hist = control === "hist";
  const formula = <Text x={280} y={248} text={`s = round(7/16 · Σ n_k)`} size={12} mono tone="gold" d={1800} />;
  if (hist) {
    return (
      <Svg>
        <Text x={140} y={36} text="f" size={13} mono tone="heading" d={0} />
        <Bars x={30} y={60} w={220} h={130} values={F_HIST} labels={L8} showValues max={6} tone="slate" barTone={(i) => (i === PICK ? "gold" : undefined)} d={0} stagger={60} />
        <Arrow pts={[[258, 125], [302, 125]]} tone="gold" d={800} />
        <Text x={420} y={36} text="g" size={13} mono tone="heading" d={900} />
        <Bars x={310} y={60} w={220} h={130} values={EQ_SMALL.out} labels={L8} showValues max={6} tone="slate" barTone={(i) => (i === EQ_SMALL.map[PICK] ? "gold" : undefined)} d={900} stagger={60} />
        {formula}
      </Svg>
    );
  }
  return (
    <Svg>
      <Text x={92} y={44} text="f" size={13} mono tone="heading" d={0} />
      <Pixels x={24} y={60} values={F} cell={34} max={F_LEVELS - 1} d={0} stagger={80} outline={(r, c) => (F[r][c] === PICK ? "gold" : undefined)} />
      {F_USED.map((r, k) => (
        <Chip key={r} x={280} y={86 + k * 36} text={`${r} → ${EQ_SMALL.map[r]}`} tone={r === PICK ? "gold" : "outline"} size={12} center d={600 + k * 200} />
      ))}
      <Text x={468} y={44} text="g" size={13} mono tone="heading" d={1400} />
      <Pixels x={400} y={60} values={G} cell={34} max={F_LEVELS - 1} d={1400} stagger={80} outline={(r, c) => (F[r][c] === PICK ? "gold" : undefined)} />
      {formula}
    </Svg>
  );
}

function Compare({ control }: { control: string }) {
  const eq = control === "equalize";
  const map = eq ? EQ_SMALL.map : LINEAR_SMALL;
  const box: PlotBox = { x: 56, y: 40, w: 180, h: 180, domain: [0, F_LEVELS - 1], range: [0, F_LEVELS - 1] };
  const out = remapHist(F_HIST, map, F_LEVELS);
  const used = F_USED.map((r) => map[r]);
  const steps = used.slice(1).map((v, i) => v - used[i]);
  const busy = new Set([map[3], map[4]]);
  return (
    <Svg>
      <Axes box={box} xs={F_USED} ys={used} xName="r" yName="s" d={0} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={0} />
      <Curve box={box} points={map.map((s, r) => [r, s] as const)} tone={eq ? "gold" : "slate"} d={300} />
      {F_USED.map((r, k) => (
        <Dot key={r} at={plotAt(box, r, map[r])} tone={eq ? "gold" : "slate"} d={1000 + k * 150} />
      ))}
      <Text x={420} y={26} text={eq ? bi("equalization", "التسوية") : bi("linear stretching", "المط الخطي")} size={12} tone="heading" d={600} />
      <Bars x={300} y={72} w={240} h={120} values={out} labels={L8} showValues max={6} tone="slate" barTone={(i) => (busy.has(i) ? "gold" : undefined)} d={800} stagger={60} />
      <Text x={420} y={226} text={bi(`steps ${steps.join(", ")}`, `الخطوات ${steps.join(" و")}`)} size={12.5} tone={eq ? "gold" : "slate"} d={1800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof equalization>>({
  idea: Idea,
  cdf: Cdf,
  table: TableScene,
  result: ResultScene,
  small: Small,
  compare: Compare,
});

