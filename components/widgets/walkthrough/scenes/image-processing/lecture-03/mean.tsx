"use client";

import { EDGE_IMAGE, edgeMean, flatMean, SALT_IMAGE, saltMean, smooth1d } from "@/lib/widgets/ip-lecture-03";
import type { meanFilter } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Curve, Pixels, Svg, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Matrix, Op } from "./local";

function Window() {
  const ramp = edgeMean();
  const out = [ramp, ramp, ramp];
  return (
    <Svg>
      <Text x={90} y={24} text={bi("Edge image", "صورة الحافة")} tone="heading" size={12} d={0} />
      <Pixels x={20} y={62} values={EDGE_IMAGE} cell={28} max={100} d={0} stagger={50} />
      <Frame x={48} y={90} w={84} h={84} d={500} />
      <Op x={180} y={132} sign="∗" d={600} />
      <Text x={244} y={24} text={bi("Mask", "القناع")} tone="heading" size={12} d={600} />
      <Matrix x={199} y={87} values={[["1/9", "1/9", "1/9"], ["1/9", "1/9", "1/9"], ["1/9", "1/9", "1/9"]]} cell={30} size={11} tone={() => "navy"} d={700} />
      <Op x={316} y={132} sign="=" d={900} />
      <Text x={395} y={24} text={bi("Output (3×3)", "المخرجات (3×3)")} tone="heading" size={12} d={1000} />
      <Pixels x={344} y={81} values={out} cell={34} max={100} d={1000} stagger={90} outline={(r, c) => (r === 1 && c === 1 ? "gold" : undefined)} />
      <Text x={280} y={222} text={`(20 + 20 + 80) × 3 / 9 = ${ramp[1]}`} size={11.5} mono tone="gold" d={1500} />
      <Chip x={280} y={252} text={bi(`the jump becomes a ramp: ${ramp.join(", ")}`, `تتحول القفزة إلى منحدر: ${ramp.join("، ")}`)} tone="slate" center d={1800} />
    </Svg>
  );
}

const STEP = [...Array(8).fill(20), ...Array(8).fill(80)] as number[];

function Size({ control }: { control: string }) {
  const n = Number(control.slice(1));
  const smooth = smooth1d(STEP, Array(n).fill(1));
  const box: PlotBox = { x: 50, y: 58, w: 300, h: 150, domain: [0, 15], range: [0, 100] };
  const cell = Math.floor(112 / n);
  return (
    <Svg>
      <Curve box={box} axes points={[[0, 20], [7.5, 20], [7.5, 80], [15, 80]]} tone="muted" dashed yLabel={bi("grey level", "مستوى الرمادي")} d={0} />
      <Curve box={box} points={smooth.map((v, i) => [i, v] as const)} tone="gold" d={500} dur={1000} />
      <Pixels x={40} y={232} values={[smooth]} cell={20} max={100} show="none" d={1200} />
      <Text x={466} y={36} text={bi(`${n}×${n} mask`, `القناع ${n}×${n}`)} tone="heading" size={12} d={200} />
      <Matrix x={466 - (cell * n) / 2} y={66} values={Array.from({ length: n }, () => Array(n).fill(""))} cell={cell} tone={() => "outline"} d={300} />
      <Chip x={466} y={204} text={bi(`each 1/${n * n}`, `كل معامل 1/${n * n}`)} tone="gold" center d={900} />
      <Text x={466} y={240} text={bi(`${n - 1} in-between values`, `${n - 1} قيم وسيطة`)} tone="muted" size={11.5} d={1400} />
    </Svg>
  );
}

function Noise() {
  const out = saltMean();
  const bg = SALT_IMAGE[0][0];
  const salt = SALT_IMAGE[2][2];
  return (
    <Svg>
      <Text x={115} y={24} text={bi(`Salt on a flat ${bg} image`, `ملح على صورة مستوية قيمتها ${bg}`)} tone="heading" size={12} d={0} />
      <Pixels x={24} y={56} values={SALT_IMAGE} cell={26} max={180} d={0} stagger={40} outline={(r, c) => (SALT_IMAGE[r][c] === salt ? "danger" : undefined)} />
      <Arrow pts={[[214, 147], [310, 147]]} tone="muted" d={700} label={bi("3×3 mean", "متوسط 3×3")} labelAt={[262, 122]} />
      <Text x={411} y={24} text={bi("After the mean", "بعد المتوسط")} tone="heading" size={12} d={900} />
      <Pixels x={320} y={56} values={out} cell={26} max={180} d={1000} stagger={60} outline={(r, c) => (out[r][c] !== bg ? "gold" : undefined)} />
      <Text x={280} y={262} text={`(8·${bg} + ${salt}) / 9 = ${out[2][2]}`} size={12} mono tone="gold" d={1800} />
    </Svg>
  );
}

function ZeroBorder({ control }: { control: string }) {
  const zero = control === "zero";
  const res = flatMean(zero ? "zero" : "replicate");
  const values = res.padded.map((row) => row.map((p) => p.value));
  const flat = res.output[2][2];
  return (
    <Svg>
      <Text x={112} y={24} text={bi("Padded input", "المدخلات بعد الحشو")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={56} values={values} cell={22} max={100} d={0} stagger={40} outline={(r, c) => (res.padded[r][c].pad ? "faint" : undefined)} />
      <Frame x={46} y={78} w={132} h={132} tone="navy" dashed width={2} d={500} />
      <Arrow pts={[[208, 144], [302, 144]]} tone="muted" d={800} label={zero ? "imfilter(f, h)" : "'replicate'"} labelAt={[255, 124]} />
      <Text x={400} y={24} text={bi("Output (same size)", "المخرجات (بالحجم نفسه)")} tone="heading" size={12} d={1000} />
      <Pixels x={316} y={56} values={res.output} cell={28} max={100} d={1100} stagger={60} outline={(r, c) => (res.output[r][c] < flat ? "danger" : undefined)} />
      <Chip
        x={400}
        y={252}
        text={
          zero
            ? bi(`dark frame: ${res.output[0][2]} at edges, ${res.output[0][0]} at corners`, `إطار داكن: ${res.output[0][2]} على الحواف و ${res.output[0][0]} في الأركان`)
            : bi(`still flat at ${flat}`, `تبقى مستوية عند ${flat}`)
        }
        tone={zero ? "danger" : "success"}
        center
        d={1800}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof meanFilter>>({
  window: Window,
  size: Size,
  noise: Noise,
  "zero-border": ZeroBorder,
});
