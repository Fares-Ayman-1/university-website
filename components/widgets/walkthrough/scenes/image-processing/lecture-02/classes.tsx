"use client";

import type { classes } from "@/lib/walkthroughs/image-processing/lecture-02";
import { complement, round } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const IMG = [
  [30, 50, 70, 90, 110, 130],
  [50, 80, 110, 140, 160, 170],
  [70, 110, 150, 190, 200, 190],
  [90, 140, 190, 230, 220, 180],
  [80, 120, 160, 190, 170, 140],
  [60, 90, 120, 140, 120, 100],
];
const N = IMG.length;
const T = [2, 3] as const;
const CELL = 28;
const IN_X = 36;
const OUT_X = 356;
const TOP = 56;

/** The 3 × 3 mean around (r, c), borders replicated: a smoothed image for the neighbourhood and transform cases. */
const mean3 = (r: number, c: number) => {
  let s = 0;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) s += IMG[Math.min(N - 1, Math.max(0, r + dr))][Math.min(N - 1, Math.max(0, c + dc))];
  return round(s / 9);
};
const SMOOTH = IMG.map((row, r) => row.map((_, c) => mean3(r, c)));

type Mode = "point" | "neighbourhood" | "transform";
const MID: Record<Mode, { label: ReturnType<typeof bi>; sum: string; chip: ReturnType<typeof bi> }> = {
  point: { label: bi("its own value", "قيمته وحدها"), sum: `255 − ${IMG[T[0]][T[1]]} = ${complement(IMG[T[0]][T[1]])}`, chip: bi("1 pixel read", "يُقرأ بكسل واحد") },
  neighbourhood: { label: bi("3 × 3 neighbourhood", "جوار 3 × 3"), sum: `Σ / 9 = ${mean3(T[0], T[1])}`, chip: bi("9 pixels read", "تُقرأ 9 بكسلات") },
  transform: { label: bi("the whole image", "الصورة كلها"), sum: "T  →  …  →  T⁻¹", chip: bi("all 36 pixels read", "تُقرأ البكسلات الـ 36 كلها") },
};

function Inputs({ control }: { control: string }) {
  const mode = control as Mode;
  const used = (r: number, c: number) => mode === "transform" || (mode === "point" ? r === T[0] && c === T[1] : Math.abs(r - T[0]) <= 1 && Math.abs(c - T[1]) <= 1);
  const m = MID[mode];
  return (
    <Svg>
      <Text x={IN_X + (N * CELL) / 2} y={26} text={bi("Input image", "الصورة المدخلة")} size={12} tone="heading" d={0} />
      <Pixels x={IN_X} y={TOP} values={IMG} cell={CELL} d={0} stagger={50} size={10} outline={(r, c) => (used(r, c) ? "gold" : undefined)} />
      <Text x={OUT_X + (N * CELL) / 2} y={26} text={bi("Output image", "الصورة الناتجة")} size={12} tone="heading" d={150} />
      <In d={150}>
        {IMG.map((row, r) => row.map((_, c) => <Box key={`${r}-${c}`} x={OUT_X + c * CELL} y={TOP + r * CELL} w={CELL} h={CELL} r={0} tone="muted" />))}
      </In>
      <Text x={280} y={104} text={m.label} size={11.5} tone="gold" d={700} />
      <Arrow pts={[[214, 140], [346, 140]]} tone="gold" d={800} />
      <Text x={280} y={160} text={m.sum} size={11} tone="muted" mono d={1000} />
      <Fade d={1300}>
        {mode === "transform" ? (
          <Pixels x={OUT_X} y={TOP} values={SMOOTH} cell={CELL} size={10} outline={() => "gold"} />
        ) : (
          <Pixels x={OUT_X + T[1] * CELL} y={TOP + T[0] * CELL} values={[[mode === "point" ? complement(IMG[T[0]][T[1]]) : mean3(T[0], T[1])]]} cell={CELL} size={10} outline={() => "gold"} />
        )}
      </Fade>
      <Chip x={280} y={252} text={m.chip} tone="gold" center d={1600} />
    </Svg>
  );
}

const NOISY = [
  [40, 200, 60, 180],
  [190, 50, 210, 70],
  [60, 180, 40, 200],
  [200, 70, 190, 50],
];
const CALM = NOISY.map((row, r) => row.map((_, c) => round((NOISY[r][c] + NOISY[r][(c + 1) % 4] + NOISY[(r + 1) % 4][c] + NOISY[(r + 1) % 4][(c + 1) % 4]) / 4)));

function Transform() {
  const boxes = [
    { x: 99, label: "T", sub: bi("transform", "التحويل"), tone: "navy" as const },
    { x: 226, label: bi("Process", "المعالجة"), sub: bi("in the new form", "في الصيغة الجديدة"), tone: "gold" as const },
    { x: 353, label: "T⁻¹", sub: bi("inverse transform", "التحويل العكسي"), tone: "navy" as const },
  ];
  return (
    <Svg>
      <Text x={280} y={46} text={bi("the transform domain", "المجال المحوَّل")} size={11.5} tone="muted" d={300} />
      <Box x={90} y={74} w={380} h={112} r={12} tone="ghost" dashed d={300} />
      <Pixels x={16} y={98} values={NOISY} cell={16} show="none" d={0} />
      <Text x={48} y={180} text={bi("image", "الصورة")} size={11.5} tone="heading" d={0} />
      {boxes.map((b, i) => (
        <g key={i}>
          <Arrow pts={[[b.x - 17, 130], [b.x - 2, 130]]} d={350 + i * 350} dur={200} />
          <Box x={b.x} y={94} w={108} h={72} label={b.label} sub={b.sub} tone={b.tone} size={i === 1 ? 12.5 : 15} d={450 + i * 350} />
        </g>
      ))}
      <Arrow pts={[[463, 130], [478, 130]]} d={1400} dur={200} />
      <Pixels x={480} y={98} values={CALM} cell={16} show="none" d={1500} />
      <Text x={512} y={180} text={bi("result", "النتيجة")} size={11.5} tone="heading" d={1500} />
      <Text x={280} y={224} text={bi("every value in the new form depends on the whole image", "كل قيمة في الصيغة الجديدة تعتمد على الصورة كلها")} size={12} tone="gold" d={1800} />
    </Svg>
  );
}

const USES = [
  { head: bi("Point", "النقطية"), items: [bi("Brightness and contrast", "السطوع والتباين"), bi("Thresholding", "التقطيع بالعتبة"), bi("Histogram equalization", "تسوية المدرج التكراري")] },
  { head: bi("Neighbourhood", "الجوار"), items: [bi("Smoothing", "التنعيم"), bi("Sharpening", "الإبراز"), bi("Edge detection", "كشف الحواف"), bi("Noise removal", "إزالة الضوضاء")] },
  { head: bi("Transform", "التحويل"), items: [bi("Frequency analysis", "تحليل الترددات"), bi("Compression", "الضغط"), bi("Restoration", "الاستعادة")] },
];

function Uses() {
  return (
    <Svg>
      {USES.map((u, i) => {
        const cx = 100 + i * 180;
        return (
          <g key={i}>
            <Box x={cx - 82} y={34} w={164} h={46} label={u.head} tone="navy" d={i * 300} />
            {u.items.map((it, k) => (
              <Chip key={k} x={cx} y={114 + k * 44} w={164} text={it} size={11} tone="outline" center d={i * 300 + 200 + k * 120} />
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof classes>>({
  inputs: Inputs,
  transform: Transform,
  uses: Uses,
});
