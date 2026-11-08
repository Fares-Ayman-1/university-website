"use client";

import { clip, DIRECTIONAL, EDGE_IMAGE, EDGE_PATCHES, EDGE_ROW, edgeLaplacian, H1, H2, H3, negate, respond, smooth1d, type Direction } from "@/lib/widgets/ip-lecture-03";
import type { laplacian } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Mark, Pixels, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Matrix, Op, SignedBars, num, signTone } from "./local";

const ROW8 = [20, 20, 20, 20, 80, 80, 80, 80];

function SecondDifference() {
  const second = smooth1d(ROW8, [1, -2, 1]);
  const C = 44;
  const x0 = 150;
  const xs = ROW8.map((_, i) => x0 + C / 2 + i * C);
  const zeroY = 175;
  return (
    <Svg>
      <Text x={140} y={78} text={bi("row f", "الصف f")} anchor="end" tone="heading" size={12} d={0} />
      <Pixels x={x0} y={56} values={[ROW8]} cell={C} max={100} d={0} />
      <Text x={140} y={175} text={bi("second difference", "الفرق الثاني")} anchor="end" tone="heading" size={12} d={400} />
      <SignedBars xs={xs} zeroY={zeroY} values={second} scale={0.9} barW={24} d={500} stagger={90} />
      <Box x={x0 + 4 * C - 5} y={zeroY - 5} w={10} h={10} r={5} tone="navy" d={1500} />
      <Arrow pts={[[400, 144], [x0 + 4 * C + 8, zeroY - 4]]} tone="navy" d={1600} dur={300} />
      <Text x={446} y={136} text={bi("zero-crossing = the edge", "عبور الصفر = الحافة")} tone="slate" size={11.5} d={1700} />
      <Text x={280} y={264} text="f(x+1) + f(x−1) − 2f(x)" size={12} mono tone="gold" d={1900} />
    </Svg>
  );
}

const PARTS: Record<string, { a: number[][]; b: number[][]; out: number[][]; captions: [ReturnType<typeof bi>, ReturnType<typeof bi>, string]; note: ReturnType<typeof bi> }> = {
  h1: {
    a: [[0, 0, 0], [1, -2, 1], [0, 0, 0]],
    b: [[0, 1, 0], [0, -2, 0], [0, 1, 0]],
    out: H1,
    captions: [bi("across: ∂²f/∂x²", "الاتجاه الأفقي"), bi("down: ∂²f/∂y²", "الاتجاه الرأسي"), "h1"],
    note: bi("isotropic for 90° turns", "متماثل الاتجاهات لزوايا 90°"),
  },
  h2: {
    a: negate([[0, 0, 0], [1, -2, 1], [0, 0, 0]]),
    b: negate([[0, 1, 0], [0, -2, 0], [0, 1, 0]]),
    out: H2,
    captions: [bi("minus across", "سالب الأفقي"), bi("minus down", "سالب الرأسي"), "h2 = −h1"],
    note: bi("same edges, sign flipped", "الحواف نفسها بإشارة معكوسة"),
  },
  h3: {
    a: H1,
    b: [[1, 0, 1], [0, -4, 0], [1, 0, 1]],
    out: H3,
    captions: [bi("h1", "h1"), bi("the diagonals", "الأقطار"), "h3"],
    note: bi("isotropic for 45° steps", "متماثل الاتجاهات لخطوات 45°"),
  },
};

function Masks({ control }: { control: string }) {
  const p = PARTS[control] ?? PARTS.h1;
  const C = 34;
  return (
    <Svg>
      <Text x={81} y={40} text={p.captions[0]} tone="heading" size={12} d={0} />
      <Matrix x={30} y={82} values={p.a} cell={C} tone={signTone} d={0} />
      <Op x={180} y={133} sign="+" d={300} />
      <Text x={280} y={40} text={p.captions[1]} tone="heading" size={12} d={300} />
      <Matrix x={229} y={82} values={p.b} cell={C} tone={signTone} d={400} />
      <Op x={379} y={133} sign="=" d={700} />
      <Text x={479} y={40} text={p.captions[2]} tone="gold" size={13} mono d={800} />
      <Matrix x={428} y={82} values={p.out} cell={C} tone={signTone} d={900} />
      <Chip x={479} y={214} text={`sum = ${p.out.flat().reduce((s, v) => s + v, 0)}`} tone="success" center d={1300} />
      <Chip x={230} y={214} text={p.note} tone="navy" center d={1500} />
    </Svg>
  );
}

function Response() {
  const lap = edgeLaplacian();
  const out = EDGE_IMAGE.map(() => lap);
  const C = 32;
  const crossX = 316 + 3 * C;
  return (
    <Svg>
      <Text x={95} y={24} text={bi("Edge image", "صورة الحافة")} tone="heading" size={12} d={0} />
      <Pixels x={20} y={62} values={EDGE_IMAGE} cell={30} max={100} d={0} stagger={50} />
      <Arrow pts={[[174, 137], [196, 137]]} tone="muted" d={400} dur={200} />
      <Text x={236} y={88} text="h1" size={12} mono tone="gold" d={400} />
      <Matrix x={200} y={101} values={H1} cell={24} size={10.5} tone={signTone} d={500} />
      <Arrow pts={[[276, 137], [308, 137]]} tone="muted" d={700} dur={200} />
      <Text x={396} y={24} text={bi("h1 response", "استجابة h1")} tone="heading" size={12} d={800} />
      <Matrix x={316} y={58} values={out} cell={C} tone={signTone} d={900} stagger={80} />
      <Arrow pts={[[crossX, 50], [crossX, 226]]} tone="navy" dashed head={false} d={1500} />
      <Text x={crossX} y={242} text={bi("zero-crossing", "عبور الصفر")} tone="slate" size={11.5} d={1600} />
      <Text x={95} y={236} text={`20+20+20+80 − 4·20 = ${num(lap[2])}`} size={11} mono tone="gold" d={1800} />
      <Text x={95} y={258} text={`80+80+20+80 − 4·80 = ${num(lap[3])}`} size={11} mono tone="danger" d={2000} />
    </Svg>
  );
}

const ENH_BOX: PlotBox = { x: 46, y: 64, w: 196, h: 148, domain: [0, 4], range: [0, 150] };

function Enhance({ control }: { control: string }) {
  const lap = edgeLaplacian();
  const f = [...EDGE_ROW];
  const mid = control === "h2" ? lap.map((v) => (v === 0 ? 0 : -v)) : lap;
  const raw = f.map((v, i) => v - lap[i]);
  const clipped = raw.map((v) => clip(v));
  const labels = control === "h1" ? ["h1 ∗ f", "f − h1 ∗ f"] : control === "h2" ? ["h2 ∗ f", "f + h2 ∗ f"] : ["mask", "(δ − h1) ∗ f"];
  const C = 34;
  const rx = 362;
  const [dipX, dipY] = plotAt(ENH_BOX, 2, 0);
  const [peakX, peakY] = plotAt(ENH_BOX, 3, 140);
  return (
    <Svg>
      <Curve box={ENH_BOX} axes points={[[0, 20], [2.5, 20], [2.5, 80], [4, 80]]} tone="muted" dashed yLabel={bi("grey level", "مستوى الرمادي")} d={0} />
      <Curve box={ENH_BOX} points={clipped.map((v, i) => [i, v] as const)} tone="gold" d={1400} dur={900} />
      <Text x={dipX + 14} y={dipY - 10} text="0" size={10.5} mono tone="danger" d={2200} />
      <Text x={peakX + 22} y={peakY + 4} text="140" size={10.5} mono tone="gold" d={2200} />
      <Text x={rx - 10} y={68} text="f" anchor="end" size={11.5} mono tone="heading" d={100} />
      <Matrix x={rx} y={52} values={[f]} cell={C} ch={32} d={100} />
      <Text x={rx - 10} y={116} text={labels[0]} anchor="end" size={11.5} mono tone="heading" d={400} />
      {control === "one" ? (
        <Text x={rx + 85} y={116} text="[0 −1 0; −1 5 −1; 0 −1 0]" size={11.5} mono tone="gold" d={500} />
      ) : (
        <Matrix x={rx} y={100} values={[mid]} cell={C} ch={32} tone={signTone} d={500} />
      )}
      <Text x={rx - 10} y={164} text={labels[1]} anchor="end" size={11.5} mono tone="heading" d={800} />
      <Matrix x={rx} y={148} values={[raw]} cell={C} ch={32} tone={(_r, c) => (raw[c] < 0 ? "danger" : undefined)} d={900} />
      <Text x={rx - 10} y={212} text="clip" anchor="end" size={11.5} mono tone="heading" d={1100} />
      <Matrix x={rx} y={196} values={[clipped]} cell={C} ch={32} tone={(_r, c) => (clipped[c] !== f[c] ? "gold" : undefined)} d={1200} />
      <Chip x={420} y={252} text={bi("darker before, brighter after", "أدكن قبلها وأسطع بعدها")} tone="gold" center d={2000} />
    </Svg>
  );
}

const DIRS: { id: Direction; label: ReturnType<typeof bi> }[] = [
  { id: "horizontal", label: bi("horizontal edge", "حافة أفقية") },
  { id: "vertical", label: bi("vertical edge", "حافة رأسية") },
  { id: "diagonal", label: bi("diagonal edge", "حافة قُطرية") },
];

function Directional({ control }: { control: string }) {
  const mask = DIRECTIONAL[control as Direction] ?? DIRECTIONAL.horizontal;
  const responses = DIRS.map((p) => respond(mask, EDGE_PATCHES[p.id]));
  const best = Math.max(...responses);
  const name = control === "horizontal" ? "h2" : control === "vertical" ? "h3" : "h1";
  return (
    <Svg>
      <Text x={78} y={40} text={bi(`Mask ${name}`, `القناع ${name}`)} tone="heading" size={12} d={0} />
      <Matrix x={30} y={96} values={mask} cell={32} tone={signTone} d={100} />
      {DIRS.map((p, i) => {
        const x = 190 + i * 120;
        const v = responses[i];
        return (
          <g key={p.id}>
            <Text x={x + 42} y={40} text={p.label} tone="heading" size={12} d={300 + i * 200} />
            <Pixels x={x} y={80} values={EDGE_PATCHES[p.id]} cell={28} max={9} show="none" d={300 + i * 200} />
            <Chip x={x + 42} y={196} text={`${v}`} size={13} tone={v === best ? "gold" : v === 0 ? "muted" : "slate"} center d={1000 + i * 250} />
            {v === best ? <Mark x={x + 84} y={80} ok d={1900} /> : null}
          </g>
        );
      })}
      <Chip x={310} y={248} text={bi("strongest on its own direction", "أقوى استجابة في اتجاهه")} tone="gold" center d={2100} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof laplacian>>({
  "second-difference": SecondDifference,
  masks: Masks,
  response: Response,
  enhance: Enhance,
  directional: Directional,
});
