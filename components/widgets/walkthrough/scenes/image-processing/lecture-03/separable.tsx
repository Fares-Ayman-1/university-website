"use client";

import { outer, SEPARABLE_IMAGE, separableCost, separableDemo } from "@/lib/widgets/ip-lecture-03";
import type { separable } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, Mark, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Matrix, Op, num, signTone } from "./local";

function Outer({ control }: { control: string }) {
  const lap = control === "laplacian";
  const vec = lap ? [1, -2, 1] : ["1/3", "1/3", "1/3"];
  const product = lap ? outer([1, -2, 1], [1, -2, 1]) : [0, 1, 2].map(() => ["1/9", "1/9", "1/9"]);
  const C = 40;
  // The highlighted entry: (1, 1) for the Laplacian, (1, 2) for the mean.
  const [hr, hc] = lap ? [1, 1] : [1, 2];
  return (
    <Svg>
      <Text x={140} y={74} text={bi("row", "الصف")} anchor="end" tone="heading" size={12} d={0} />
      <Matrix x={150} y={60} values={[vec]} cell={C} tone={lap ? signTone : (_r, c) => (c === hc ? "gold" : undefined)} d={0} />
      <Matrix x={90} y={116} values={vec.map((v) => [v])} cell={C} tone={lap ? signTone : (r) => (r === hr ? "gold" : undefined)} d={300} />
      <Text x={110} y={252} text={bi("column", "العمود")} tone="heading" size={12} d={300} />
      <Matrix x={150} y={116} values={product} cell={C} tone={lap ? signTone : (r, c) => (r === hr && c === hc ? "gold" : undefined)} d={700} stagger={200} />
      <Frame x={150 + hc * C} y={60} w={C} h={C} tone="navy" d={1500} width={2.2} />
      <Frame x={90} y={116 + hr * C} w={C} h={C} tone="navy" d={1500} width={2.2} />
      <Frame x={150 + hc * C} y={116 + hr * C} w={C} h={C} tone="navy" d={1700} width={2.2} />
      <Text x={420} y={96} text="(i, j) = column[i] × row[j]" size={11.5} mono tone="heading" d={1000} />
      <Text x={420} y={140} text={lap ? `${num(-2)} × ${num(-2)} = ${num(4)}` : "1/3 × 1/3 = 1/9"} size={13} mono tone="slate" d={1900} />
      <Chip x={420} y={200} text={lap ? bi("the separable Laplacian", "لابلاسيان القابل للفصل") : bi("the 3×3 mean filter", "مرشح المتوسط 3×3")} tone={lap ? "gold" : "navy"} center d={2200} />
    </Svg>
  );
}

function Passes() {
  const { rows, both } = separableDemo();
  const C = 26;
  return (
    <Svg>
      <Text x={79} y={28} text={bi("Input", "المدخلات")} tone="heading" size={12} d={0} />
      <Pixels x={14} y={72} values={SEPARABLE_IMAGE} cell={C} max={90} d={0} stagger={50} />
      <Frame x={14 + C} y={72 + 2 * C} w={3 * C} h={C} d={500} />
      <Arrow pts={[[150, 137], [190, 137]]} tone="gold" d={700} dur={300} />
      <Text x={235} y={28} text={bi("After the rows", "بعد الصفوف")} tone="heading" size={12} d={700} />
      <Text x={235} y={58} text="(1/3)[1 1 1]" size={10.5} mono tone="gold" d={700} />
      <Pixels x={196} y={72} values={rows} cell={C} max={90} d={800} stagger={70} outline={(r, c) => (r === 2 && c === 1 ? "gold" : undefined)} />
      <Frame x={196 + C} y={72 + C} w={C} h={3 * C} tone="navy" d={1400} />
      <Arrow pts={[[280, 137], [326, 137]]} tone="navy" d={1600} dur={300} />
      <Text x={371} y={28} text={bi("After the columns", "بعد الأعمدة")} tone="heading" size={12} d={1600} />
      <Text x={371} y={58} text="(1/3)[1 1 1]ᵀ" size={10.5} mono tone="slate" d={1600} />
      <Pixels x={332} y={98} values={both} cell={C} max={90} d={1700} stagger={70} outline={(r, c) => (r === 1 && c === 1 ? "navy" : undefined)} />
      <Op x={430} y={137} sign="=" d={2100} />
      <Text x={492} y={124} text={bi("one 3×3 mean", "متوسط 3×3 واحد")} tone="heading" size={12} d={2200} />
      <Mark x={492} y={168} ok d={2400} />
      <Text x={280} y={244} text={`(${rows[1][1]} + ${rows[2][1]} + ${rows[3][1]}) / 3 = ${both[1][1]}`} size={11.5} mono tone="slate" d={2000} />
    </Svg>
  );
}

const SIZES = [3, 5, 7, 11];

function Cost() {
  const values = SIZES.flatMap((n) => {
    const c = separableCost(n);
    return [c.direct, c.separable];
  });
  const x = 60;
  const w = 440;
  const slot = w / values.length;
  return (
    <Svg>
      <Chip x={60} y={36} text={bi("N×N mask: N²", "القناع N×N: N²")} tone="navy" d={0} />
      <Chip x={220} y={36} text={bi("two 1-D passes: 2N", "مروران أحاديا البعد: 2N")} tone="gold" d={150} />
      <Bars x={x} y={76} w={w} h={150} values={values} max={121} showValues barTone={(i) => (i % 2 ? "gold" : "navy")} gap={0.3} d={300} stagger={120} />
      {SIZES.map((n, g) => (
        <Text key={n} x={x + slot * (2 * g + 1)} y={244} text={`${n}×${n}`} size={11.5} mono tone="heading" d={400 + g * 240} />
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof separable>>({
  outer: Outer,
  passes: Passes,
  cost: Cost,
});
