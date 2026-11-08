"use client";

import type { images } from "@/lib/walkthroughs/image-processing/lecture-01";
import { FACE, crop, noiseGrid } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame } from "./local";

const KINDS = [
  { x: 108, y: 84, text: bi("people or animals", "أشخاص أو حيوانات") },
  { x: 108, y: 186, text: bi("an outdoor scene", "مشهد خارجي") },
  { x: 452, y: 84, text: bi("a microphotograph", "صورة مجهرية") },
  { x: 452, y: 186, text: bi("a medical scan", "صورة طبية") },
];

function Subjects() {
  const cell = 9;
  const fx = 280 - (12 * cell) / 2;
  const fy = 62;
  return (
    <Svg>
      <Text x={280} y={22} text={bi("One picture that represents something", "لقطة واحدة تمثّل شيئًا ما")} tone="heading" size={12.5} d={0} />
      <Pixels x={fx} y={fy} values={FACE} cell={cell} show="none" d={150} stagger={40} />
      <Text x={280} y={fy + 15 * cell + 16} text={bi("a person", "شخص")} tone="heading" size={12} d={800} />
      {KINDS.map((k, i) => {
        const left = k.x < 280;
        const from: [number, number] = [left ? k.x + 72 : k.x - 72, k.y];
        const to: [number, number] = [left ? fx - 6 : fx + 12 * cell + 6, k.y < 140 ? fy + 30 : fy + 105];
        return (
          <g key={i}>
            <Arrow pts={[from, to]} tone="faint" head={false} d={900 + i * 150} dur={300} />
            <Chip x={k.x} y={k.y} text={k.text} tone="outline" center d={900 + i * 150} />
          </g>
        );
      })}
    </Svg>
  );
}

const PATCH = { r0: 1, c0: 2, n: 8 };

function Structure({ control }: { control: string }) {
  const cell = 26;
  if (control === "picture") {
    const s = 8;
    const fx = 362;
    const fy = 56;
    return (
      <Svg>
        <Pixels x={30} y={50} values={crop(FACE, PATCH.r0, PATCH.c0, PATCH.n, PATCH.n)} cell={cell} d={0} stagger={60} />
        <Pixels x={fx} y={fy} values={FACE} cell={s} show="none" d={500} />
        <Frame x={fx + PATCH.c0 * s} y={fy + PATCH.r0 * s} w={PATCH.n * s} h={PATCH.n * s} d={900} />
        <Arrow pts={[[fx - 8, fy + 30], [252, 90]]} tone="gold" d={1100} dur={400} />
        <Text x={fx + 48} y={fy + 15 * s + 18} text={bi("the eyes of a face", "عينا وجه")} tone="heading" size={12} d={1200} />
        <Chip x={fx + 48} y={248} text={bi("structure: shapes", "بنية: أشكال")} tone="success" center d={1400} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Pixels x={30} y={50} values={noiseGrid(8, 8)} cell={cell} d={0} stagger={60} />
      <Text x={410} y={84} text={bi("Random values", "قيم عشوائية")} tone="heading" size={13} d={600} />
      <Chip x={410} y={150} text={bi("no structure", "لا بنية")} tone="danger" center d={900} />
      <Chip x={410} y={210} text={bi("nothing to improve", "لا شيء يُحسَّن")} tone="muted" center d={1100} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof images>>({
  subjects: Subjects,
  structure: Structure,
});
