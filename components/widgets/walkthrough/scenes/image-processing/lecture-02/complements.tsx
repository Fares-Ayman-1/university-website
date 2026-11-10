"use client";

import type { complements } from "@/lib/walkthroughs/image-processing/lecture-02";
import { X, complement, mapImg, solarize } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Curve, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { MapMark, T_BOX, Transfer } from "./local";

function Negative() {
  const out = mapImg(X, (v) => complement(v));
  return (
    <Svg>
      <Transfer input={X} output={out} title="y = 255 − x" outLabel="255 − x">
        <Curve box={T_BOX} points={[[0, 255], [255, 0]]} d={500} />
        <MapMark box={T_BOX} x={20} y={complement(20)} d={1000} />
        <MapMark box={T_BOX} x={200} y={complement(200)} tone="navy" d={1300} />
      </Transfer>
      <Chip x={280} y={246} text={bi("no clipping needed; twice gives x back", "لا حاجة إلى القصّ؛ ومرتان تعيدان الأصل")} tone="success" center d={2300} />
    </Svg>
  );
}

const TYPES = [
  { kind: "8-bit", label: bi("8-bit", "8 بِتّات"), before: [[20, 60], [200, 250]], max: 255, formula: "255 − x" },
  { kind: "unit", label: bi("[0, 1] scale", "المقياس [0, 1]"), before: [[0.1, 0.4], [0.8, 1]], max: 1, formula: "1 − x" },
  { kind: "binary", label: bi("binary", "ثنائية"), before: [[0, 1], [1, 0]], max: 1, formula: "0 ↔ 1" },
];

function Types() {
  return (
    <Svg>
      <Text x={280} y={26} text="y = max − x" size={13} mono tone="gold" d={0} />
      {TYPES.map((t, i) => {
        const cx = 95 + i * 185;
        const after = t.before.map((row) => row.map((v) => complement(v, t.max)));
        const d = 200 + i * 450;
        return (
          <g key={t.kind}>
            <Text x={cx} y={60} text={t.label} size={12.5} tone="heading" d={d} />
            <Pixels x={cx - 76} y={88} values={t.before} cell={30} max={t.max} d={d} />
            <Arrow pts={[[cx - 12, 118], [cx + 12, 118]]} tone="gold" d={d + 200} dur={250} />
            <Pixels x={cx + 16} y={88} values={after} cell={30} max={t.max} d={d + 300} />
            <Text x={cx} y={172} text={t.formula} size={12} mono tone="gold" d={d + 300} />
          </g>
        );
      })}
      <Chip x={280} y={228} text={bi("apply it twice: the original is back", "طبّقها مرتين: تعود الصورة الأصلية")} tone="success" center d={1800} />
    </Svg>
  );
}

function Solarize({ control }: { control: string }) {
  const which = control === "light" ? "light" : "dark";
  const out = mapImg(X, (v) => solarize(v, which));
  const flipped = (v: number) => solarize(v, which) !== v;
  const n = X.flat().filter(flipped).length;
  const example = which === "dark" ? 60 : 200;
  return (
    <Svg>
      <Transfer input={X} output={out} title={which === "dark" ? "x ≤ 128 → 255 − x" : "x ≥ 128 → 255 − x"} outLabel="y" ring={(r, c) => (flipped(X[r][c]) ? "gold" : undefined)}>
        {which === "dark" ? (
          <>
            <Curve box={T_BOX} points={[[0, 255], [128, 127]]} d={500} dur={500} />
            <Curve box={T_BOX} points={[[128, 128], [255, 255]]} tone="navy" d={900} dur={500} />
          </>
        ) : (
          <>
            <Curve box={T_BOX} points={[[0, 0], [127, 127]]} tone="navy" d={500} dur={500} />
            <Curve box={T_BOX} points={[[128, 127], [255, 0]]} d={900} dur={500} />
          </>
        )}
        <MapMark box={T_BOX} x={example} y={solarize(example, which)} d={1300} />
      </Transfer>
      <Chip
        x={280}
        y={246}
        text={which === "dark" ? bi(`${n} dark pixels flipped, the rest kept`, `انقلبت ${n} بكسلات داكنة، وبقيت البقية`) : bi(`${n} bright pixels flipped, the rest kept`, `انقلبت ${n} بكسلات ساطعة، وبقيت البقية`)}
        tone="gold"
        center
        d={2300}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof complements>>({
  negative: Negative,
  types: Types,
  solarize: Solarize,
});
