"use client";

import { gaussian1d, PROFILE, smooth1d } from "@/lib/widgets/ip-lecture-03";
import type { frequency } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, Curve, Pixels, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

/** One sample every 8 px, so the plot and the pixel strip under it line up. */
const BOX: PlotBox = { x: 40, y: 56, w: 472, h: 150, domain: [0, 59], range: [0, 220] };
const pts = (ys: readonly number[]) => ys.map((v, i) => [i, v] as const);
const strip = (ys: readonly number[]) => [ys, ys, ys];
const MEAN5 = [1, 1, 1, 1, 1];
const GAUSS = gaussian1d(1.5, 4);

function Profile() {
  const [ex, ey] = plotAt(BOX, 29.5, 125);
  return (
    <Svg>
      <Curve box={BOX} axes points={pts(PROFILE)} tone="navy" yLabel={bi("grey level", "مستوى الرمادي")} d={0} dur={1200} />
      <Pixels x={BOX.x - 4} y={228} values={strip(PROFILE)} cell={8} max={220} show="none" d={900} />
      <Chip x={120} y={122} text={bi("slow ramp: low frequency", "منحدر بطيء: تردد منخفض")} tone="slate" center d={1300} />
      <Chip x={196} y={70} text={bi("sudden edge", "حافة مفاجئة")} tone="gold" center d={1600} />
      <Arrow pts={[[246, 74], [ex - 6, ey]]} tone="gold" d={1700} dur={300} />
      <Chip x={436} y={142} text={bi("fine texture: high frequency", "نسيج دقيق: تردد مرتفع")} tone="gold" center d={1900} />
    </Svg>
  );
}

function LowPass({ control }: { control: string }) {
  const gauss = control === "gaussian";
  const weights = gauss ? GAUSS : MEAN5;
  const smooth = smooth1d(PROFILE, weights);
  const top = Math.max(...weights);
  return (
    <Svg>
      <Curve box={BOX} axes points={pts(PROFILE)} tone="muted" dashed yLabel={bi("grey level", "مستوى الرمادي")} d={0} />
      <Curve box={BOX} points={pts(smooth)} tone="gold" d={500} dur={1200} />
      <Pixels x={BOX.x - 4} y={228} values={strip(smooth)} cell={8} max={220} show="none" d={1400} />
      <Bars x={78} y={74} w={gauss ? 108 : 70} h={34} values={weights.map((v) => v / top)} max={1} tone={gauss ? "gold" : "navy"} gap={0.2} d={200} stagger={50} />
      <Text x={130} y={124} text={gauss ? bi("Gaussian weights", "أوزان غاوس") : bi("5 equal weights", "5 أوزان متساوية")} tone="muted" size={11} d={500} />
      <Chip x={436} y={146} text={bi("texture wiped out", "انمحى النسيج الدقيق")} tone="gold" center d={1700} />
    </Svg>
  );
}

const TOP: PlotBox = { x: 40, y: 50, w: 472, h: 58, domain: [0, 59], range: [0, 220] };
const LOW: PlotBox = { x: 40, y: 134, w: 472, h: 92, domain: [0, 59], range: [-60, 60] };

function HighPass() {
  const smooth = smooth1d(PROFILE, MEAN5);
  const high = PROFILE.map((v, i) => v - smooth[i]);
  const zeroY = plotAt(LOW, 0, 0)[1];
  return (
    <Svg>
      <Curve box={TOP} points={pts(PROFILE)} tone="muted" d={0} />
      <Text x={TOP.x + 8} y={TOP.y + 4} text="f" anchor="start" size={12} mono tone="muted" d={0} />
      <Arrow pts={[[LOW.x, zeroY], [LOW.x + LOW.w + 6, zeroY]]} tone="faint" head={false} d={300} dur={300} />
      <Text x={LOW.x + 8} y={LOW.y + 4} text="f − f̄" anchor="start" size={12} tone="gold" d={300} />
      <Curve box={LOW} points={pts(high)} tone="gold" d={500} dur={1200} />
      <Chip x={130} y={252} text={bi("flat and ramp → 0", "المستوي والمنحدر ← 0")} tone="slate" center d={1500} />
      <Chip x={282} y={252} text={bi("edge survives", "الحافة تبقى")} tone="gold" center d={1700} />
      <Chip x={440} y={252} text={bi("texture survives", "النسيج يبقى")} tone="gold" center d={1900} />
    </Svg>
  );
}

const STEP = [...Array(15).fill(20), ...Array(16).fill(80)] as number[];
const EDGE_BOX: PlotBox = { x: 314, y: 74, w: 214, h: 126, domain: [0, 30], range: [0, 100] };
const X_LABELS = ["−6", "", "", "−3", "", "", "0", "", "", "3", "", "", "6"];

function Sigma({ control }: { control: string }) {
  const sigma = control === "s3" ? 3 : 1;
  const weights = gaussian1d(sigma, 6);
  const smooth = smooth1d(STEP, gaussian1d(sigma, 3 * sigma));
  return (
    <Svg>
      <Text x={147} y={30} text={bi("Gaussian weights", "أوزان غاوس")} tone="heading" size={12} d={0} />
      <Bars x={30} y={74} w={234} h={126} values={weights} max={1} labels={X_LABELS} tone="gold" gap={0.25} d={100} stagger={50} />
      <Text x={421} y={30} text={bi("The edge, smoothed", "الحافة بعد التنعيم")} tone="heading" size={12} d={600} />
      <Curve box={EDGE_BOX} axes points={[[0, 20], [14.5, 20], [14.5, 80], [30, 80]]} tone="muted" dashed d={600} />
      <Curve box={EDGE_BOX} points={pts(smooth)} tone="gold" d={1000} dur={1000} />
      <Chip
        x={280}
        y={248}
        text={sigma === 1 ? bi("σ = 1: narrow bell, slight smoothing", "σ = 1: جرس ضيق وتنعيم خفيف") : bi("σ = 3: wide bell, strong blur", "σ = 3: جرس عريض وتضبيب شديد")}
        tone={sigma === 1 ? "slate" : "gold"}
        center
        d={1600}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof frequency>>({
  profile: Profile,
  "low-pass": LowPass,
  "high-pass": HighPass,
  sigma: Sigma,
});
