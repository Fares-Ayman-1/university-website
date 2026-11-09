"use client";

import type { filters } from "@/lib/walkthroughs/image-processing/lecture-04";
import {
  crossSection,
  EX,
  EX_POINTS,
  EX_ROWS,
  exGrid,
  filterTest,
  h2,
  highPass,
  lowPass,
  RING_D0,
  RING_ROW,
  ripple,
  TEST_D0,
  TEST_IMG,
  TEST_N,
  toDisplay,
  type Family,
} from "@/lib/widgets/ip-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Curve, Pixels, plotAt, Svg, Table, Text, type LineTone, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dot, Raster } from "./local";

const familyOf = (control: string): Family => (control === "butterworth" || control === "gaussian" ? control : "ideal");

/** Tick labels under the D axis of a plot box. */
function XTicks({ box, ticks, d }: { box: PlotBox; ticks: readonly { at: number; label: string }[]; d: number }) {
  return (
    <>
      {ticks.map((t) => {
        const [x, y] = plotAt(box, t.at, 0);
        return <Text key={t.label} x={x} y={y + 13} text={t.label} size={10} mono tone="muted" d={d} />;
      })}
    </>
  );
}

function Ideal({ control }: { control: string }) {
  const D0 = control === "large" ? TEST_D0.large : TEST_D0.small;
  const { H } = filterTest("ideal", "low", D0);
  const box: PlotBox = { x: 236, y: 64, w: 280, h: 150, domain: [0, 16], range: [0, 1.15] };
  const [x0] = plotAt(box, D0, 0);
  const [, y1] = plotAt(box, 0, 1);
  return (
    <Svg>
      <Text x={94} y={28} text={bi("H(u, v) as an image", "H(u, v) بوصفها صورة")} tone="heading" size={12} d={0} />
      <Raster x={30} y={56} values={H} cell={4} max={1} d={100} />
      <Text x={94} y={204} text={bi(`a white disc, radius ${D0}`, `قرص أبيض نصف قطره ${D0}`)} size={11} tone="muted" d={400} />
      <Text x={376} y={28} text={bi("its cross-section", "مقطعه العرضي")} tone="heading" size={12} d={500} />
      <Curve box={box} axes points={[[0, 1], [D0, 1], [D0, 0], [16, 0]]} tone="gold" width={2.6} xLabel="D(u, v)" yLabel="H" d={600} />
      <Text x={box.x - 8} y={y1} text="1" anchor="end" size={10} mono tone="muted" d={700} />
      <XTicks box={box} ticks={[{ at: D0, label: `D0 = ${D0}` }]} d={900} />
      <Text x={(box.x + x0) / 2} y={y1 + 22} text={bi("kept", "يُبقى")} size={10.5} tone="success" d={1100} />
      <Text x={(x0 + box.x + box.w) / 2 + 8} y={box.y + box.h - 40} text={bi("removed", "يُزال")} size={10.5} tone="danger" d={1200} />
      <Chip x={376} y={258} text={bi("1 → 0 in one step: a cylinder", "من 1 إلى 0 في خطوة واحدة: أسطوانة")} tone="gold" center d={1400} />
    </Svg>
  );
}

const RING_TONE: Record<Family, LineTone> = { ideal: "danger", butterworth: "gold", gaussian: "success" };

function Ringing({ control }: { control: string }) {
  const family = familyOf(control);
  const { g } = filterTest(family, "low", RING_D0);
  const shown = toDisplay(g, "clip");
  const c = 4;
  const box: PlotBox = { x: 214, y: 56, w: 316, h: 160, domain: [0, TEST_N - 1], range: [0, 260] };
  const original = TEST_IMG[RING_ROW].map((v, i) => [i, v] as const);
  const r = ripple(g);
  const rowY = 56 + (RING_ROW + 0.5) * c;
  return (
    <Svg>
      <Text x={84} y={28} text={bi(`result, D0 = ${RING_D0}`, `الناتج، D0 = ${RING_D0}`)} tone="heading" size={12} d={0} />
      <Raster x={20} y={56} values={shown} cell={c} d={100} />
      <Arrow pts={[[16, rowY], [152, rowY]]} tone="gold" head={false} dashed d={500} />
      <Text x={372} y={28} text={bi("brightness along the dashed row", "السطوع على امتداد الصف المتقطع")} tone="heading" size={12} d={600} />
      <Curve box={box} axes points={original} tone="muted" dashed width={1.6} d={700} />
      <Curve box={box} points={crossSection(g)} tone={RING_TONE[family]} width={2.6} d={900} dur={1100} />
      <Text x={box.x - 6} y={plotAt(box, 0, 220)[1]} text="220" anchor="end" size={9.5} mono tone="muted" d={800} />
      <Text x={box.x - 6} y={plotAt(box, 0, 40)[1]} text="40" anchor="end" size={9.5} mono tone="muted" d={800} />
      <Chip
        x={100}
        y={236}
        text={r > 0 ? bi(`ripples: ${r} grey levels`, `تموجات: ${r} مستوى رمادي`) : bi("no ripples", "لا تموجات")}
        tone={family === "ideal" ? "danger" : family === "butterworth" ? "warn" : "success"}
        center
        d={1600}
      />
    </Svg>
  );
}

const ORDERS = [1, 2, 4, 10] as const;

function Butterworth({ control }: { control: string }) {
  const n = Number(control) || 2;
  const box: PlotBox = { x: 52, y: 52, w: 420, h: 170, domain: [0, 3], range: [0, 1.1] };
  const [hx, hy] = plotAt(box, 1, 0.5);
  const labelAt = plotAt(box, 1.55, lowPass("butterworth", 1.55, 1, n));
  return (
    <Svg>
      <Curve box={box} axes points={[[0, 1], [1, 1], [1, 0], [3, 0]]} tone="muted" dashed width={1.4} xLabel="D" yLabel="H" d={0} />
      {ORDERS.filter((o) => o !== n).map((o, i) => (
        <Curve key={o} box={box} fn={(D) => lowPass("butterworth", D, 1, o)} samples={120} tone="faint" width={1.4} d={200 + i * 100} />
      ))}
      <Curve box={box} fn={(D) => lowPass("butterworth", D, 1, n)} samples={160} tone="gold" width={2.8} d={600} dur={1000} />
      <Dot x={hx} y={hy} r={4.5} tone="danger" d={1300} />
      <Text x={hx + 12} y={hy - 12} text={bi("0.5 at D = D0, for every n", "0.5 عند D = D0 لكل n")} anchor="start" size={11} tone="danger" d={1400} />
      <Text x={labelAt[0] + 10} y={labelAt[1] - 10} text={`n = ${n}`} anchor="start" size={12} mono tone="gold" d={1500} />
      <Text x={box.x - 8} y={plotAt(box, 0, 1)[1]} text="1" anchor="end" size={10} mono tone="muted" d={100} />
      <XTicks box={box} ticks={[{ at: 1, label: "D0" }, { at: 2, label: "2·D0" }]} d={200} />
      <Text x={506} y={plotAt(box, 0, 1)[1] + 4} text={bi("dashed: ideal", "المتقطع: المثالي")} size={10} tone="muted" d={300} />
    </Svg>
  );
}

const GAUSS_D0 = [10, 20, 40, 100] as const;

function Gaussian({ control }: { control: string }) {
  const D0 = Number(control) || 20;
  const box: PlotBox = { x: 52, y: 52, w: 440, h: 170, domain: [0, 200], range: [0, 1.1] };
  const v = lowPass("gaussian", D0, D0);
  const [px, py] = plotAt(box, D0, v);
  const others = GAUSS_D0.filter((d) => d !== D0);
  return (
    <Svg>
      {others.map((d, i) => (
        <Curve key={d} box={box} axes={i === 0} fn={(D) => lowPass("gaussian", D, d)} samples={160} tone="faint" width={1.4} xLabel={i === 0 ? "D" : undefined} yLabel={i === 0 ? "H" : undefined} d={i * 100} />
      ))}
      <Curve box={box} fn={(D) => lowPass("gaussian", D, D0)} samples={200} tone="gold" width={2.8} d={600} dur={1000} />
      <Curve box={box} points={[[0, v], [D0, v], [D0, 0]]} tone="danger" dashed width={1.3} d={1200} />
      <Dot x={px} y={py} r={4.5} tone="danger" d={1300} />
      <Text x={px + 12} y={py - 12} text={`${h2(v)} at D = D0 = ${D0}`} anchor="start" size={11} mono tone="danger" d={1400} />
      <Text x={box.x - 8} y={py} text={h2(v)} anchor="end" size={10} mono tone="danger" d={1400} />
      <Text x={box.x - 8} y={plotAt(box, 0, 1)[1]} text="1" anchor="end" size={10} mono tone="muted" d={100} />
      <XTicks box={box} ticks={[50, 100, 150].filter((t) => t !== D0).map((t) => ({ at: t, label: String(t) }))} d={200} />
      <Chip x={420} y={62} text={bi("no sharp edge, no rings", "لا حافة حادة ولا حلقات")} tone="success" center d={1700} />
    </Svg>
  );
}

const HP_LABEL: Record<Family, string> = { ideal: "IHPF", butterworth: "BHPF, n = 2", gaussian: "GHPF" };

function HighPass({ control }: { control: string }) {
  const family = familyOf(control);
  const D0 = RING_D0;
  const { g } = filterTest(family, "high", D0);
  const box: PlotBox = { x: 44, y: 64, w: 240, h: 150, domain: [0, 16], range: [0, 1.1] };
  const lp = (D: number) => lowPass(family, D, D0);
  const hp = (D: number) => highPass(family, D, D0);
  const step = family === "ideal";
  return (
    <Svg>
      <Text x={164} y={28} text={bi(`profiles, D0 = ${D0}`, `المقاطع، D0 = ${D0}`)} tone="heading" size={12} d={0} />
      {step ? (
        <>
          <Curve box={box} axes points={[[0, 1], [D0, 1], [D0, 0], [16, 0]]} tone="muted" dashed width={1.5} xLabel="D" yLabel="H" d={100} />
          <Curve box={box} points={[[0, 0], [D0, 0], [D0, 1], [16, 1]]} tone="gold" width={2.8} d={500} />
        </>
      ) : (
        <>
          <Curve box={box} axes fn={lp} samples={120} tone="muted" dashed width={1.5} xLabel="D" yLabel="H" d={100} />
          <Curve box={box} fn={hp} samples={120} tone="gold" width={2.8} d={500} dur={1000} />
        </>
      )}
      <Text x={plotAt(box, 1.2, 1)[0]} y={plotAt(box, 0, 1)[1] - 10} text="LP" anchor="start" size={11} mono tone="muted" d={700} />
      <Text x={plotAt(box, 12, 1)[0]} y={plotAt(box, 0, 1)[1] - 10} text="HP = 1 − LP" anchor="middle" size={11} mono tone="gold" d={900} />
      <XTicks box={box} ticks={[{ at: D0, label: "D0" }]} d={300} />
      <Text x={414} y={28} text={bi(`${HP_LABEL[family]} result`, `ناتج ${HP_LABEL[family]}`)} tone="heading" size={12} d={1000} />
      <Raster x={350} y={56} values={toDisplay(g, "abs")} cell={4} d={1100} />
      <Chip
        x={414}
        y={226}
        text={family === "ideal" ? bi("edges, with ripples", "حواف مع تموجات") : family === "butterworth" ? bi("cleaner edges", "حواف أنظف") : bi("cleanest edges", "أنظف الحواف")}
        tone={family === "ideal" ? "danger" : family === "butterworth" ? "warn" : "success"}
        center
        d={1500}
      />
      <Chip x={164} y={258} text={bi("H = 0 at D = 0: the mean is removed", "H = 0 عند D = 0: يُحذف المتوسط")} tone="slate" center d={1700} />
    </Svg>
  );
}

const EX_TONE: Record<Family, "slate" | "gold" | "success"> = { ideal: "slate", butterworth: "gold", gaussian: "success" };
const FORMULA: Record<Family, string> = {
  ideal: "H = 1 if D ≤ 2, else 0",
  butterworth: "H = 1 / (1 + (D/2)^4)",
  gaussian: "H = e^(−D²/8)",
};

function Worked({ control }: { control: string }) {
  const family = familyOf(control);
  const grid = exGrid(family);
  const c = 27;
  const gx = 22;
  const gy = 44;
  const isPoint = (u: number, v: number) => EX_POINTS.some(([pu, pv]) => pu === u && pv === v);
  return (
    <Svg>
      <Text x={gx} y={34} text="v →" anchor="start" size={10} mono tone="muted" d={0} />
      <Text x={gx - 6} y={gy + 12} text="u" anchor="end" size={10} mono tone="muted" d={0} />
      <Pixels x={gx} y={gy} values={grid} cell={c} max={1} size={9} d={100} stagger={40} outline={(u, v) => (isPoint(u, v) ? "gold" : undefined)} />
      <Text x={378} y={30} text={`${FORMULA[family]},  D0 = ${EX.D0}`} size={11.5} mono tone="heading" d={600} />
      <Table
        x={268}
        y={50}
        cols={["(u, v)", "D", "H"]}
        rows={EX_ROWS.map((r) => [`(${r.u}, ${r.v})`, h2(r.D), h2(r[family])])}
        cw={[86, 70, 64]}
        rh={26}
        d={700}
        stagger={120}
        cell={(_, col) => (col === 2 ? EX_TONE[family] : undefined)}
      />
      <Text x={378} y={222} text={bi("D = √((u − 4)² + (v − 4)²), then H", "D = √((u − 4)² + (v − 4)²)، ثم H")} size={11} tone="muted" d={1500} />
      <Text x={378} y={252} text={bi("high-pass: HP = 1 − H", "التمرير المرتفع: HP = 1 − H")} size={11} tone="muted" d={1700} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof filters>>({
  ideal: Ideal,
  ringing: Ringing,
  butterworth: Butterworth,
  gaussian: Gaussian,
  highpass: HighPass,
  worked: Worked,
});
