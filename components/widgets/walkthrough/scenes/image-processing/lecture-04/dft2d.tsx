"use client";

import type { dft2d } from "@/lib/walkthroughs/image-processing/lecture-04";
import { ASYM, ASYM_MAG, BLOCKS, h2, re, spectrumImage, STRIPES, STRIPES_F, STRIPES_FC, TEST_IMG, type BlockId } from "@/lib/widgets/ip-lecture-04";
import { pretty } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Circle, Dot, NumGrid, Raster } from "./local";

function Pair() {
  return (
    <Svg>
      <Box x={44} y={36} w={472} h={60} label="F(u,v) = (1/MN) Σx Σy f(x,y) · e^(−i2π(xu/M + yv/N))" sub={bi("forward transform (DFT)", "التحويل الأمامي (DFT)")} mono size={11.5} tone="gold" d={0} />
      <Arrow pts={[[236, 100], [236, 132]]} tone="gold" d={500} dur={250} label={bi("image → spectrum", "صورة ← طيف")} labelAt={[150, 110]} />
      <Arrow pts={[[324, 132], [324, 100]]} tone="slate" d={700} dur={250} label={bi("spectrum → image", "طيف ← صورة")} labelAt={[410, 110]} labelTone="slate" />
      <Box x={44} y={136} w={472} h={60} label="f(x,y) = Σu Σv F(u,v) · e^(+i2π(xu/M + yv/N))" sub={bi("inverse transform (IDFT)", "التحويل المعكوس (IDFT)")} mono size={11.5} tone="slate" d={600} />
      <Box x={44} y={212} w={228} h={58} label="|F| = √(R² + I²)" sub={bi("spectrum: how strong", "الطيف: مدى القوة")} mono size={12} d={1100} />
      <Box x={288} y={212} w={228} h={58} label="φ = tan⁻¹(I / R)" sub={bi("phase: where", "الطور: الموضع")} mono size={12} d={1300} />
    </Svg>
  );
}

const show = (s: string) => pretty(s);

function Worked({ control }: { control: string }) {
  const centred = control === "centred";
  const G = centred ? STRIPES_FC : STRIPES_F;
  const cells = G.map((row, u) => row.map((_, v) => show(re(G, u, v))));
  const dc: [number, number] = centred ? [2, 2] : [0, 0];
  const stripe: [number, number] = centred ? [2, 0] : [0, 2];
  const gx = 330;
  const gy = 64;
  const cw = 46;
  const ch = 34;
  return (
    <Svg>
      <Text x={92} y={30} text="f(x, y)" size={12} mono tone="heading" d={0} />
      <Pixels x={24} y={gy} values={STRIPES} cell={34} max={4} d={100} stagger={60} />
      {centred ? (
        <>
          <Text x={172} y={130} text="×" size={16} tone="heading" d={400} />
          <NumGrid x={184} y={98} cells={STRIPES.map((row, x) => row.map((_, y) => ((x + y) % 2 ? "−" : "+")))} cw={17} ch={17} size={11} tone={(x, y) => ((x + y) % 2 ? "muted" : undefined)} d={450} stagger={40} />
          <Text x={218} y={182} text="(−1)^(x+y)" size={10.5} mono tone="muted" d={500} />
        </>
      ) : null}
      <Arrow pts={[[centred ? 260 : 172, 132], [322, 132]]} tone="gold" d={700} dur={300} label="DFT" labelAt={[centred ? 291 : 247, 118]} />
      <Text x={gx + 2 * cw} y={30} text={centred ? "F(u − 2, v − 2)" : "F(u, v)"} size={12} mono tone="heading" d={800} />
      <Text x={gx + 2 * cw} y={50} text="v →" size={10} mono tone="muted" d={800} />
      <Text x={gx - 6} y={gy + 10} text="u ↓" anchor="end" size={10} mono tone="muted" d={800} />
      <NumGrid
        x={gx}
        y={gy}
        cells={cells}
        cw={cw}
        ch={ch}
        size={12}
        tone={(u, v) => (u === dc[0] && v === dc[1] ? "gold" : u === stripe[0] && v === stripe[1] ? "slate" : "muted")}
        d={900}
        stagger={120}
      />
      <Chip
        x={280}
        y={244}
        text={centred ? bi("DC at the centre (2, 2); the stripes on the border (2, 0)", "المركبة المستمرة في المركز (2,2)؛ والخطوط على الحافة (2,0)") : bi("DC = the mean, in the corner (0, 0); stripes at (0, 2)", "المركبة المستمرة = المتوسط، في الركن (0,0)؛ والخطوط عند (0,2)")}
        tone={centred ? "gold" : "slate"}
        center
        d={1600}
      />
    </Svg>
  );
}

/** Two pairs of points mirrored through the centre (4, 4) of the centred 8 × 8 spectrum. */
const PAIRS = [
  { a: [5, 6], b: [3, 2], tone: "gold" as const },
  { a: [2, 5], b: [6, 3], tone: "navy" as const },
];

function Symmetry() {
  const c = 22;
  const sx = 300;
  const sy = 50;
  const mag = spectrumImage(ASYM);
  const centre = (p: readonly number[]) => [sx + (p[1] + 0.5) * c, sy + (p[0] + 0.5) * c] as const;
  const mid = centre([4, 4]);
  return (
    <Svg>
      <Text x={112} y={30} text={bi("a real 8 × 8 image", "صورة حقيقية القيم 8 × 8")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={56} values={ASYM} cell={22} max={9} show="none" d={100} stagger={40} />
      <Arrow pts={[[214, 144], [290, 144]]} tone="gold" d={500} dur={300} label="|F|, centred" labelAt={[252, 130]} />
      <Pixels
        x={sx}
        y={sy}
        values={mag}
        cell={c}
        show="none"
        d={600}
        stagger={40}
        outline={(r, cc) => {
          const hit = PAIRS.find((p) => (p.a[0] === r && p.a[1] === cc) || (p.b[0] === r && p.b[1] === cc));
          return hit ? (hit.tone === "gold" ? "gold" : "navy") : undefined;
        }}
      />
      {PAIRS.map((p, i) => (
        <Arrow key={i} pts={[centre(p.a), centre(p.b)]} tone={p.tone} head={false} dashed d={1200 + i * 200} />
      ))}
      <Dot x={mid[0]} y={mid[1]} r={3.5} tone="danger" d={1100} />
      {PAIRS.map((p, i) => (
        <Text
          key={i}
          x={sx + 4 * c}
          y={sy + 8 * c + 18 + i * 20}
          text={`|F(${p.a[0] - 4}, ${p.a[1] - 4})| = |F(${p.b[0] - 4}, ${p.b[1] - 4})| = ${h2(ASYM_MAG[p.a[0]][p.a[1]])}`.replace(/-/g, "−")}
          size={11}
          mono
          tone={p.tone === "gold" ? "gold" : "slate"}
          d={1500 + i * 200}
        />
      ))}
      <Text x={112} y={250} text={bi("red dot: the centre (0, 0)", "النقطة الحمراء: المركز (0,0)")} size={10.5} tone="muted" d={1400} />
    </Svg>
  );
}

function Block({ control }: { control: string }) {
  const id: BlockId = control === "tall" ? "tall" : "wide";
  const c = 4;
  const s = 32 * c;
  return (
    <Svg>
      <Text x={60 + s / 2} y={28} text={bi("a rectangular block", "كتلة مستطيلة")} tone="heading" size={12} d={0} />
      <Raster x={60} y={56} values={BLOCKS[id]} cell={c} d={100} />
      <Arrow pts={[[200, 120], [262, 120]]} tone="gold" d={500} dur={300} label="DFT" labelAt={[231, 106]} />
      <Text x={276 + s / 2} y={28} text={bi("its spectrum, centred", "طيفها بعد التوسيط")} tone="heading" size={12} d={600} />
      <Raster x={276} y={56} values={spectrumImage(BLOCKS[id])} cell={c} d={700} />
      <Text x={60 + s / 2} y={206} text={id === "wide" ? bi("20 pixels across, 4 down", "20 بكسلًا أفقيًا و 4 رأسيًا") : bi("4 pixels across, 20 down", "4 بكسلات أفقيًا و 20 رأسيًا")} size={11} tone="muted" d={400} />
      <Text x={276 + s / 2} y={206} text={id === "wide" ? bi("narrow across, long up and down", "ضيق أفقيًا وممتد رأسيًا") : bi("long across, narrow up and down", "ممتد أفقيًا وضيق رأسيًا")} size={11} tone="gold" d={1100} />
      <Chip x={280} y={252} text={bi("wide in space = narrow in frequency", "العريض في المكان = الضيق في التردد")} tone="gold" center d={1400} />
      <Box x={456} y={84} w={92} h={72} label={bi("Figure 4.2", "الشكل 4.2")} sub={bi("the same idea", "الفكرة نفسها")} tone="ghost" size={11} d={1600} />
    </Svg>
  );
}

function Meaning() {
  const c = 5;
  const sx = 210;
  const sy = 56;
  const cx = sx + 16 * c;
  const cy = sy + 16 * c;
  return (
    <Svg>
      <Text x={78} y={30} text={bi("image", "الصورة")} tone="heading" size={12} d={0} />
      <Raster x={30} y={64} values={TEST_IMG} cell={3} d={100} />
      <Arrow pts={[[136, 112], [200, 112]]} tone="gold" d={400} dur={300} label="DFT" labelAt={[168, 98]} />
      <Text x={cx} y={30} text={bi("log(1 + |F|), centred", "log(1 + |F|) بعد التوسيط")} tone="heading" size={12} d={500} />
      <Raster x={sx} y={sy} values={spectrumImage(TEST_IMG)} cell={c} d={600} />
      <Circle cx={cx} cy={cy} r={22} tone="gold" dashed d={1100} />
      <Circle cx={cx} cy={cy} r={68} tone="slate" dashed d={1300} />
      <Chip x={468} y={96} w={150} text={bi("low: smooth areas", "منخفضة: مناطق ملساء")} tone="gold" center d={1500} />
      <Arrow pts={[[393, 104], [cx + 14, cy - 6]]} tone="gold" d={1600} dur={300} />
      <Chip x={468} y={196} w={150} text={bi("high: edges, detail", "مرتفعة: حواف وتفاصيل")} tone="slate" center d={1800} />
      <Arrow pts={[[393, 200], [cx + 60, cy + 52]]} tone="slate" d={1900} dur={300} />
      <Text x={78} y={190} text={bi("brighter = stronger", "الأسطع = الأقوى")} size={11} tone="muted" d={2000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof dft2d>>({
  pair: Pair,
  worked: Worked,
  symmetry: Symmetry,
  block: Block,
  meaning: Meaning,
});
