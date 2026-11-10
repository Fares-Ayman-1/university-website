"use client";

import { alphaTrimmed, denoise, NOISY_EDGE, slide36, SLIDE36 } from "@/lib/widgets/ip-lecture-03";
import type { nonlinear } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Mark, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Matrix, num } from "./local";

const S = slide36();
const OUTLIER = SLIDE36[1][1];

function Sort() {
  const filtered = SLIDE36.map((row, r) => row.map((v, c) => (r === 1 && c === 1 ? S.median : v)));
  const C = 40;
  const x0 = 100;
  const mx = x0 + 4 * C + C / 2;
  return (
    <Svg>
      <Text x={78} y={28} text={bi("Window (slide 36)", "النافذة (الشريحة 36)")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={56} values={SLIDE36} cell={36} max={80} d={0} stagger={80} outline={(r, c) => (r === 1 && c === 1 ? "danger" : undefined)} />
      <Arrow pts={[[78, 168], [78, 222], [96, 222]]} tone="muted" d={500} dur={400} />
      <Text x={88} y={180} text={bi("in order", "بالترتيب")} anchor="start" tone="muted" size={11} d={600} />
      <Matrix x={x0} y={204} values={[S.sorted]} cell={C} ch={36} tone={(_r, c, v) => (c === 4 ? "gold" : v === OUTLIER ? "danger" : undefined)} d={700} />
      {S.sorted.map((_, i) => (
        <Text key={i} x={x0 + i * C + C / 2} y={252} text={String(i + 1)} size={9.5} mono tone="muted" d={900} />
      ))}
      <Arrow pts={[[mx, 200], [mx, 110], [424, 110]]} tone="gold" d={1300} dur={600} label={bi(`median = ${S.median}`, `الوسيط = ${S.median}`)} labelAt={[352, 84]} labelTone="gold" />
      <Text x={482} y={28} text={bi("Filtered", "بعد الترشيح")} tone="heading" size={12} d={1700} />
      <Pixels x={428} y={56} values={filtered} cell={36} max={80} d={1700} outline={(r, c) => (r === 1 && c === 1 ? "success" : undefined)} />
    </Svg>
  );
}

const RANKS = { min: 1, median: 5, max: 9 } as const;
const C = 44;
const X0 = 82;
const boxX = (i: number) => X0 + i * C;

function SortedRow({ tone, d = 0 }: { tone: (i: number) => "gold" | "muted" | "danger" | undefined; d?: number }) {
  return (
    <>
      <Text x={280} y={40} text={bi("The window, sorted", "النافذة بعد الترتيب")} tone="heading" size={12} d={d} />
      {S.sorted.map((_, i) => (
        <Text key={i} x={boxX(i) + C / 2} y={84} text={String(i + 1)} size={10} mono tone="muted" d={d + 100} />
      ))}
      <Matrix x={X0} y={96} values={[S.sorted]} cell={C} ch={38} tone={(_r, c) => tone(c)} d={d + 100} />
    </>
  );
}

function Rank({ control }: { control: string }) {
  const rank = RANKS[control as keyof typeof RANKS] ?? 5;
  const value = S.sorted[rank - 1];
  const x = boxX(rank - 1) + C / 2;
  const name = control === "min" ? bi("minimum", "الأدنى") : control === "max" ? bi("maximum", "الأقصى") : bi("median", "الوسيط");
  return (
    <Svg>
      <SortedRow tone={(i) => (i === rank - 1 ? "gold" : undefined)} />
      <Arrow pts={[[x, 184], [x, 140]]} tone="gold" d={600} dur={400} />
      <Chip x={x} y={204} text={bi(`${name.en} = ${value}`, `${name.ar} = ${value}`)} tone="gold" center d={900} />
      <Text x={280} y={258} text={bi(`rank ${rank} of ${S.sorted.length}`, `الرتبة ${rank} من ${S.sorted.length}`)} size={12} tone="slate" d={1200} />
    </Svg>
  );
}

function Trimmed({ control }: { control: string }) {
  const trim = Number(control.slice(1));
  const kept = S.sorted.slice(trim, S.sorted.length - trim);
  const value = Math.round(alphaTrimmed(S.sorted, trim) * 100) / 100;
  const formula = `(${kept.join(" + ")}) / ${kept.length} = ${num(value)}`;
  const which = trim === 0 ? 0 : trim === 4 ? 2 : 1;
  const results = [
    { label: bi(`mean ${S.mean}`, `المتوسط ${S.mean}`), x: 430 },
    { label: bi(`trimmed ${S.trimmed}`, `المُشذَّب ${S.trimmed}`), x: 280 },
    { label: bi(`median ${S.median}`, `الوسيط ${S.median}`), x: 130 },
  ];
  return (
    <Svg>
      <SortedRow tone={(i) => (i < trim || i >= S.sorted.length - trim ? "muted" : "gold")} />
      {trim > 0 ? <Frame x={boxX(trim)} y={92} w={C * kept.length} h={46} tone="navy" d={600} /> : null}
      <Text x={280} y={168} text={formula} size={12} mono tone="gold" d={900} />
      {results.map((r, i) => (
        <Chip key={i} x={r.x} y={226} text={r.label} tone={i === which ? "gold" : "outline"} center d={1200 + i * 120} />
      ))}
      <Arrow pts={[[178, 226], [232, 226]]} tone="faint" head={false} d={1500} dur={200} />
      <Arrow pts={[[328, 226], [382, 226]]} tone="faint" head={false} d={1500} dur={200} />
    </Svg>
  );
}

const isNoise = (v: number) => v === 0 || v === 255;
const clean = (c: number) => (c < 3 ? 40 : 200);

function SaltPepper({ control }: { control: string }) {
  const median = control === "median";
  const out = denoise(median ? "median" : "mean");
  return (
    <Svg>
      <Text x={114} y={26} text={bi("Noisy edge", "حافة بها ضوضاء")} tone="heading" size={12} d={0} />
      <Pixels x={16} y={52} values={NOISY_EDGE} cell={28} max={255} d={0} stagger={40} outline={(r, c) => (isNoise(NOISY_EDGE[r][c]) ? "danger" : undefined)} />
      <Arrow pts={[[220, 150], [336, 150]]} tone={median ? "success" : "muted"} d={600} label={median ? bi("3×3 median", "وسيط 3×3") : bi("3×3 mean", "متوسط 3×3")} labelAt={[278, 124]} />
      <Text x={442} y={26} text={median ? bi("After the median", "بعد الوسيط") : bi("After the mean", "بعد المتوسط")} tone="heading" size={12} d={800} />
      <Pixels x={344} y={52} values={out} cell={28} max={255} d={900} stagger={60} outline={(r, c) => (Math.abs(out[r][c] - clean(c)) > 8 ? "danger" : undefined)} />
      {median ? <Mark x={540} y={52} ok d={1700} /> : null}
      <Text x={278} y={196} text={median ? bi("clean, edge kept", "نظيفة والحافة باقية") : bi("blotches + blur", "بقع وتضبيب")} tone={median ? "success" : "danger"} size={11.5} d={1600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof nonlinear>>({
  sort: Sort,
  rank: Rank,
  trimmed: Trimmed,
  "salt-pepper": SaltPepper,
});
