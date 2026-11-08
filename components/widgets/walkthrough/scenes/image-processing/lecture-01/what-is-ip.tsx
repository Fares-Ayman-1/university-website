"use client";

import type { whatIsIp } from "@/lib/walkthroughs/image-processing/lecture-01";
import { BLOCK, BLOCK_EDGES, DENOISED_PATCH, FACE, NOISY_PATCH, SHARP_EDGE, SOFT_EDGE, TEXTURE, TEXTURE_BLURRED } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Person, Pixels, Svg, Text, Token, type L } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function TwoGoals() {
  return (
    <Svg>
      <Pixels x={40} y={70} values={FACE} cell={8} show="none" d={0} stagger={30} />
      <Text x={88} y={208} text={bi("an image", "صورة")} tone="heading" size={12} d={400} />
      <Arrow pts={[[142, 110], [276, 72]]} tone="gold" d={600} />
      <Arrow pts={[[142, 160], [276, 200]]} tone="slate" d={800} />
      <Token pts={[[142, 110], [276, 72]]} d={700} dur={600} />
      <Token pts={[[142, 160], [276, 200]]} d={900} dur={600} tone="navy" />
      <Person x={300} y={42} tone="gold" d={900} />
      <Text x={334} y={56} text={bi("(1) for a human viewer", "(1) من أجل المشاهد البشري")} anchor="start" tone="heading" size={12} d={1000} />
      <Chip x={334} y={100} text={bi("sharper, cleaner", "أحدّ وأنظف")} tone="gold" d={1200} />
      <Box x={280} y={178} w={46} h={44} label="</>" mono tone="slate" d={1100} />
      <Text x={334} y={186} text={bi("(2) for a machine", "(2) من أجل الآلة")} anchor="start" tone="heading" size={12} d={1200} />
      <Chip x={334} y={230} text={bi("edges only, simpler", "الحواف فقط، أبسط")} tone="slate" d={1400} />
    </Svg>
  );
}

/** A before → after pair of grids, with captions. */
function Pair({
  before,
  after,
  cell,
  max = 255,
  maxAfter,
  verb,
  captions,
  ring,
  ringAfter,
  y = 44,
}: {
  before: readonly (readonly number[])[];
  after: readonly (readonly number[])[];
  cell: number;
  max?: number;
  maxAfter?: number;
  verb: L;
  captions: [L, L];
  ring?: (r: number, c: number) => "danger" | "gold" | undefined;
  ringAfter?: (r: number, c: number) => "success" | "gold" | undefined;
  y?: number;
}) {
  const w = before[0].length * cell;
  const h = before.length * cell;
  const x1 = 24;
  const x2 = 536 - after[0].length * cell;
  return (
    <>
      <Pixels x={x1} y={y} values={before} cell={cell} max={max} outline={ring} d={0} stagger={50} />
      <Text x={x1 + w / 2} y={y + h + 16} text={captions[0]} tone="heading" size={12} d={300} />
      <Arrow pts={[[x1 + w + 10, y + h / 2], [x2 - 10, y + h / 2]]} tone="gold" d={600} label={verb} labelAt={[(x1 + w + x2) / 2, y + h / 2 - 22]} labelTone="gold" />
      <Token pts={[[x1 + w + 10, y + h / 2], [x2 - 10, y + h / 2]]} d={700} dur={500} />
      <Pixels x={x2} y={y} values={after} cell={cell} max={maxAfter ?? max} outline={ringAfter} d={1000} stagger={50} />
      <Text x={x2 + (after[0].length * cell) / 2} y={y + h + 16} text={captions[1]} tone="heading" size={12} d={1300} />
    </>
  );
}

const profile = (row: readonly number[]) => row.map((v, i) => [i, v] as const);

function ForHumans({ control }: { control: string }) {
  if (control === "denoise") {
    const spike = (r: number, c: number) => NOISY_PATCH[r][c] === 0 || NOISY_PATCH[r][c] === 255;
    return (
      <Svg>
        <Pair
          before={NOISY_PATCH}
          after={DENOISED_PATCH}
          cell={32}
          y={40}
          verb={bi("3 × 3 median", "وسيط 3 × 3")}
          captions={[bi("noisy: spikes of 0 and 255", "مشوَّشة: نبضات 0 و255"), bi("noise removed", "أُزيلت الضوضاء")]}
          ring={(r, c) => (spike(r, c) ? "danger" : undefined)}
          ringAfter={(r, c) => (spike(r, c) ? "success" : undefined)}
        />
      </Svg>
    );
  }
  const changed = (r: number, c: number) => (SOFT_EDGE[r][c] !== SHARP_EDGE[r][c] ? "gold" : undefined);
  const box = (x: number) => ({ x, y: 214, w: 168, h: 46, domain: [0, 6] as const, range: [0, 255] as const });
  return (
    <Svg>
      <Pair
        before={SOFT_EDGE}
        after={SHARP_EDGE}
        cell={28}
        y={36}
        verb={bi("sharpen", "إبراز")}
        captions={[bi("soft edge", "حافة ناعمة"), bi("crisper edge", "حافة أحدّ")]}
        ringAfter={changed}
      />
      <Curve box={box(38)} points={profile(SOFT_EDGE[0])} tone="slate" d={500} />
      <Curve box={box(354)} points={profile(SHARP_EDGE[0])} tone="gold" d={1500} />
      <Text x={280} y={232} text={bi("one row, drawn as a curve", "صف واحد مرسومًا منحنًى")} tone="muted" size={10.5} d={1500} />
    </Svg>
  );
}

function ForMachines({ control }: { control: string }) {
  if (control === "blur") {
    return (
      <Svg>
        <Pair
          before={TEXTURE}
          after={TEXTURE_BLURRED}
          cell={30}
          y={36}
          verb={bi("3 × 3 mean", "متوسط 3 × 3")}
          captions={[bi("fine texture", "نسيج دقيق"), bi("detail removed", "أُزيلت التفاصيل")]}
        />
      </Svg>
    );
  }
  return (
    <Svg>
      <Pair
        before={BLOCK}
        after={BLOCK_EDGES}
        cell={30}
        y={36}
        maxAfter={1}
        verb={bi("find edges", "إيجاد الحواف")}
        captions={[bi("a bright block", "مكعب ساطع"), bi("edge image: 1 = edge", "صورة الحواف: 1 = حافة")]}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof whatIsIp>>({
  "two-goals": TwoGoals,
  "for-humans": ForHumans,
  "for-machines": ForMachines,
});
