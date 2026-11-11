"use client";

import { chain, linearVsRotary } from "@/lib/widgets/rob-lecture-02";
import type { joints } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Bar, Claw, Count, Dot, Floor, Line, Pin, Poly, Tag, arcPts, dir, ellipsePts, screen, track, useMotion } from "./local";
import w from "../../../../Walkthrough.module.css";

/* ---------- Joint types ---------- */

const TYPES: Record<string, { variable: string; dof: Bi; drive: Bi }> = {
  R: { variable: "θ", dof: bi("1 DOF", "درجة حرية واحدة"), drive: bi("servo or stepper motor", "محرك سيرفو أو محرك خطوي") },
  P: { variable: "d", dof: bi("1 DOF", "درجة حرية واحدة"), drive: bi("hydraulic or pneumatic cylinder", "أسطوانة هيدروليكية أو هوائية") },
  U: { variable: "θ₁, θ₂", dof: bi("2 DOF", "درجتا حرية"), drive: bi("usually passive", "غير مُدار عادةً") },
};

function Types({ control }: { control: string }) {
  const t = TYPES[control] ?? TYPES.R;
  const p = useMotion(600, 2400, false);
  const a = track([0, 42, -30, 28], p);
  const ext = track([30, 100, 50], p);
  const pin: Pt = [222, 150];
  return (
    <Svg>
      <Box x={20} y={18} w={118} h={46} label={bi("Variable", "المتغير")} sub={t.variable} tone="outline" size={11.5} d={0} />
      <Box x={150} y={18} w={118} h={46} label={t.dof} tone="navy" size={12} d={100} />
      {control === "R" ? (
        <>
          <Bar a={[40, 150]} b={pin} t={20} tone="slate" d={0} />
          <Line pts={[pin, [352, 150]]} tone="faint" dashed />
          <Bar a={pin} b={dir(pin, 122, a)} t={16} tone="gold" />
          <Pin at={pin} r={9} />
          <Text x={dir(pin, 58, a / 2)[0] + 4} y={dir(pin, 58, a / 2)[1] + (a >= 0 ? -10 : 10)} text="θ" size={14} mono tone="heading" />
        </>
      ) : null}
      {control === "P" ? (
        <>
          <Poly pts={[[40, 128], [232, 128], [232, 172], [40, 172]]} tone="slate" d={0} />
          <Bar a={[120, 150]} b={[232 + ext, 150]} t={16} tone="gold" />
          <Box x={232 + ext - 4} y={130} w={20} h={40} r={3} tone="gold" />
          <Line pts={[[232, 196], [232 + ext, 196]]} tone="gold" width={2.2} />
          <Line pts={[[232, 186], [232, 206]]} tone="faint" />
          <Line pts={[[232 + ext, 186], [232 + ext, 206]]} tone="faint" />
          <Text x={232 + ext / 2} y={218} text="d" size={14} mono tone="gold" />
        </>
      ) : null}
      {control === "U" ? (
        <>
          <Bar a={[40, 150]} b={[200, 150]} t={14} tone="slate" d={0} />
          <Bar a={[244, 150]} b={dir([244, 150], 112 * Math.cos(((track([0, 0, 50, 0], p) * Math.PI) / 180)), a)} t={14} tone="gold" />
          <In d={0}>
            <circle cx={222} cy={150} r={20} className={w.under} />
            <circle cx={222} cy={150} r={20} className={`${w.shape} ${w.outline}`} />
            <path d="M210,138 L234,162 M234,138 L210,162" className={`${w.line} ${w.navy}`} style={{ strokeWidth: 3 }} />
          </In>
          <Arrow pts={arcPts([222, 150], 34, 120, 60)} tone="navy" d={300} />
          <Arrow pts={ellipsePts([222, 150], 9, 34, 250, 470)} tone="navy" d={500} />
        </>
      ) : null}
      <Chip x={150} y={252} text={t.drive} tone="slate" center d={400} />
      <Box x={370} y={58} w={174} h={176} tone="outline" dashed d={200} />
      <Text x={457} y={78} text={bi("Symbol", "الرمز")} tone="muted" size={11} d={300} />
      <In d={500}>
        {control === "R" ? (
          <>
            <Line pts={[[384, 165], [446, 165]]} tone="navy" width={3} />
            <circle cx={456} cy={165} r={10} className={w.under} />
            <circle cx={456} cy={165} r={10} className={`${w.line} ${w.navy}`} style={{ strokeWidth: 3 }} />
            <Line pts={[[465, 160], [526, 128]]} tone="navy" width={3} />
            <Text x={457} y={214} text="R" size={18} mono tone="heading" />
          </>
        ) : null}
        {control === "P" ? (
          <>
            <Line pts={[[384, 165], [420, 165]]} tone="navy" width={3} />
            <rect x={420} y={152} width={56} height={26} className={`${w.shape} ${w.outline}`} />
            <Line pts={[[446, 165], [528, 165]]} tone="navy" width={3} />
            <Arrow pts={[[430, 136], [500, 136]]} tone="gold" both d={700} dur={300} />
            <Text x={457} y={214} text="P" size={18} mono tone="heading" />
          </>
        ) : null}
        {control === "U" ? (
          <>
            <Line pts={[[384, 165], [442, 165]]} tone="navy" width={3} />
            <circle cx={457} cy={165} r={15} className={`${w.line} ${w.navy}`} style={{ strokeWidth: 2.4 }} />
            <path d="M447,155 L467,175 M467,155 L447,175" className={`${w.line} ${w.navy}`} style={{ strokeWidth: 2.4 }} />
            <Line pts={[[472, 165], [528, 140]]} tone="navy" width={3} />
            <Text x={457} y={214} text="U" size={18} mono tone="heading" />
          </>
        ) : null}
      </In>
    </Svg>
  );
}

/* ---------- Numbering a chain ---------- */

function ChainScene() {
  const J1: Pt = [80, 204];
  const pts = chain([0, 0], [96, 104, 74], [70, -60, -45]).map((q) => screen(J1, q));
  const [, J2, J3, flange] = pts;
  const tool = -35;
  const step = 420;
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return (
    <Svg>
      <Floor x={14} y={250} w={330} d={0} />
      <Box x={24} y={216} w={112} h={34} r={4} label={bi("link 0 · base", "الوصلة 0 · القاعدة")} tone="slate" size={10.5} d={0} />
      <Bar a={J1} b={J2} t={15} d={step} />
      <Bar a={J2} b={J3} t={13} d={2 * step} />
      <In d={3 * step}>
        <Bar a={J3} b={flange} t={11} />
        <Claw at={flange} angle={tool} open={0.5} size={0.95} />
      </In>
      <Count at={J1} n="J1" r={12} d={step} />
      <Count at={J2} n="J2" r={12} d={2 * step} />
      <Count at={J3} n="J3" r={12} d={3 * step} />
      <Tag at={[40, 160]} to={mid(J1, J2)} text={bi("link 1", "الوصلة 1")} d={step + 150} />
      <Tag at={[168, 72]} to={mid(J2, J3)} text={bi("link 2", "الوصلة 2")} d={2 * step + 150} />
      <Tag at={[300, 104]} to={mid(J3, flange)} text={bi("link 3", "الوصلة 3")} d={3 * step + 150} />
      <Tag at={[270, 222]} to={dir(flange, 14, tool)} text={bi("end effector: no joint", "المؤثِّر النهائي: لا مفصل")} tone="danger" d={4 * step} />
      <Box x={372} y={26} w={74} h={40} r={0} label={bi("joint", "المفصل")} tone="navy" size={11.5} d={200} />
      <Box x={446} y={26} w={98} h={40} r={0} label={bi("connects links", "يربط الوصلتين")} tone="navy" size={11} d={200} />
      {(["J1", "J2", "J3"] as const).map((j, i) => (
        <In key={j} d={(i + 1) * step}>
          <Box x={372} y={66 + i * 28} w={74} h={28} r={0} label={j} tone="outline" size={12} mono />
          <Box x={446} y={66 + i * 28} w={98} h={28} r={0} label={`${i} – ${i + 1}`} tone="gold" size={12} mono />
        </In>
      ))}
      <Box x={372} y={176} w={172} h={66} label={bi("3 joints → 3 DOF", "3 مفاصل ← 3 درجات حرية")} sub={bi("one per joint–link pair", "واحدة لكل زوج مفصل ووصلة")} tone="outline" size={12} subSize={10.5} d={4 * step + 300} />
    </Svg>
  );
}

/* ---------- Linear against rotary resolution ---------- */

function Resolution({ control }: { control: string }) {
  const p = useMotion(500, 1600);
  if (control === "P") {
    const ticks = Array.from({ length: 12 }, (_, i) => 60 + i * 40);
    const cx = 80 + 380 * p;
    return (
      <Svg>
        <Text x={280} y={40} text={bi("steps drawn larger than life", "الخطوات مرسومة أكبر من حقيقتها")} tone="muted" size={10.5} d={0} />
        <Bar a={[40, 140]} b={[520, 140]} t={10} tone="muted" d={0} />
        <Fade d={200}>
          {ticks.map((x) => (
            <path key={x} d={`M${x},${118} V${130}`} className={`${w.line} ${w.gold}`} style={{ strokeWidth: 2 }} />
          ))}
        </Fade>
        <Box x={cx - 20} y={126} w={40} h={28} r={4} tone="gold" />
        <Arrow pts={[[60, 104], [100, 104]]} tone="gold" both d={600} dur={300} />
        <Text x={80} y={88} text={`${linearVsRotary.linear} mm`} size={11} mono tone="gold" d={700} />
        <Arrow pts={[[420, 104], [460, 104]]} tone="gold" both d={900} dur={300} />
        <Text x={440} y={88} text={`${linearVsRotary.linear} mm`} size={11} mono tone="gold" d={1000} />
        <Text x={40} y={170} text="0" size={10.5} mono tone="muted" d={100} />
        <Text x={520} y={170} text="1000 mm" size={10.5} mono tone="muted" anchor="end" d={100} />
        <Chip x={280} y={226} text={bi("the same step everywhere on the axis", "الخطوة نفسها في كل مكان على المحور")} tone="success" center d={1200} />
      </Svg>
    );
  }
  const far = control === "R-far";
  const P0: Pt = [60, 222];
  const near = 180;
  const farR = 432;
  const r = far ? farR : near;
  const a0 = 12;
  const a1 = 20;
  const swing = a0 + (a1 - a0) * p;
  return (
    <Svg>
      <Text x={330} y={24} text={bi("one angle step, drawn larger than life", "خطوة زاوية واحدة، مرسومة أكبر من حقيقتها")} tone="muted" size={10.5} d={0} />
      <Line pts={[P0, dir(P0, 470, a0)]} tone="faint" dashed />
      <Line pts={[P0, dir(P0, 470, a1)]} tone="faint" dashed />
      <Line pts={arcPts(P0, far ? near : farR, a0, a1)} tone="faint" width={2} />
      <Bar a={P0} b={dir(P0, r, swing)} t={12} tone="slate" />
      <Dot at={dir(P0, r, swing)} r={5} tone="gold" />
      <Pin at={P0} r={9} />
      <Arrow pts={arcPts(P0, r, a0, a1, 10)} tone="gold" d={1800} dur={300} width={3.2} head={false} />
      <Text x={dir(P0, 74, 42)[0]} y={dir(P0, 74, 42)[1]} text={`${linearVsRotary.angle}°`} size={11} mono tone="heading" d={300} />
      <Text x={dir(P0, r + 40, 16)[0]} y={dir(P0, r + 40, 16)[1]} text={`${far ? linearVsRotary.far : linearVsRotary.near} mm`} size={12} mono tone="gold" d={2000} />
      <Text x={dir(P0, r / 2, 6)[0]} y={dir(P0, r / 2, 6)[1] + 6} text={far ? "r = 1.2 m" : "r = 0.5 m"} size={11} mono tone="muted" d={400} />
      <Chip x={440} y={250} text="s = r × θ" tone="navy" center d={600} />
    </Svg>
  );
}

/* ---------- Coupling ---------- */

function Coupling({ control }: { control: string }) {
  const p = useMotion(600, 1600);
  if (control === "P") {
    const cx = 110 + 120 * p;
    return (
      <Svg>
        <Bar a={[40, 60]} b={[320, 60]} t={14} tone="slate" d={0} />
        <Box x={30} y={60} w={16} h={190} r={3} tone="slate" d={0} />
        <Box x={314} y={60} w={16} h={190} r={3} tone="slate" d={0} />
        <Floor x={14} y={250} w={330} d={0} />
        <Line pts={[[110, 176], [cx, 176]]} tone="gold" dashed width={2} />
        <Box x={cx - 22} y={48} w={44} h={24} r={4} tone="gold" />
        <Bar a={[cx, 72]} b={[cx, 166]} t={10} tone="muted" />
        <Dot at={[cx, 176]} r={5.5} tone="gold" />
        <Arrow pts={[[60, 30], [120, 30]]} tone="navy" d={200} dur={300} />
        <Text x={128} y={30} text="x" size={13} mono tone="heading" anchor="start" d={300} />
        <Box x={372} y={30} w={170} h={44} label={`Δx = +${Math.round(120 * p)}`} tone="gold" mono size={13} />
        <Box x={372} y={86} w={170} h={44} label="Δy = 0" tone="outline" mono size={13} d={200} />
        <Chip x={457} y={168} text={bi("one joint → one coordinate", "مفصل واحد ← إحداثي واحد")} tone="success" center d={2300} />
        <Text x={457} y={226} text={bi("errors simply add", "الأخطاء تُجمَع ببساطة")} tone="muted" size={11} d={2500} />
      </Svg>
    );
  }
  const B: Pt = [110, 218];
  const L = [110, 92] as const;
  const t2 = -70;
  const t1 = 40 + 30 * p;
  const at = (a: number) => chain([0, 0], L, [a, t2]).map((q) => screen(B, q));
  const pts = at(t1);
  const start = at(40)[2];
  const path = Array.from({ length: 13 }, (_, i) => at(40 + (30 * p * i) / 12)[2]);
  const dx = Math.round(pts[2][0] - start[0]);
  const dy = Math.round(start[1] - pts[2][1]);
  const sign = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
  return (
    <Svg>
      <Floor x={14} y={250} w={330} d={0} />
      <Box x={86} y={218} w={48} h={32} r={4} tone="slate" d={0} />
      <Line pts={path} tone="gold" dashed width={2} />
      <Bar a={pts[0]} b={pts[1]} t={15} tone="gold" />
      <Bar a={pts[1]} b={pts[2]} t={12} />
      <Pin at={pts[0]} r={8} tone="gold" />
      <Pin at={pts[1]} r={6} />
      <Dot at={pts[2]} r={5.5} tone="gold" />
      <Box x={372} y={30} w={170} h={44} label={`Δx = ${sign(dx)}`} tone="gold" mono size={13} />
      <Box x={372} y={86} w={170} h={44} label={`Δy = ${sign(dy)}`} tone="gold" mono size={13} />
      <Chip x={457} y={168} text={bi("one joint → x and y at once", "مفصل واحد ← x و y معًا")} tone="danger" center d={2300} />
      <Text x={457} y={226} text={bi("an angle error grows with the arm", "خطأ الزاوية يكبر بطول الذراع")} tone="muted" size={11} d={2500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof joints>>({
  types: Types,
  chain: ChainScene,
  resolution: Resolution,
  coupling: Coupling,
});
