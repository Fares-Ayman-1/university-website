"use client";

import type { proximity } from "@/lib/walkthroughs/robotics/lecture-03";
import { RANGE_MM, SWITCH_V, capacitance } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import type { Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, Mark, Svg, Text, Token, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, ArcPath, Glide, Ground, Meter, Swatch, Turn, Wire, polar } from "./local";
import w from "../../../../Walkthrough.module.css";

const STEEL = "#8b96a3";
const ALU = "#d3d9df";
const PLASTIC = "#e3874f";
const WATER = "#5ea8e0";

type Target = { name: Bi; fill: string; ok: Record<string, boolean>; note?: Record<string, Bi> };
const TARGETS: Target[] = [
  { name: bi("steel", "فولاذ"), fill: STEEL, ok: { inductive: true, capacitive: true, magnetic: false } },
  { name: bi("aluminium", "ألومنيوم"), fill: ALU, ok: { inductive: true, capacitive: true, magnetic: false }, note: { inductive: bi("shorter", "أقصر") } },
  { name: bi("plastic", "بلاستيك"), fill: PLASTIC, ok: { inductive: false, capacitive: true, magnetic: false } },
  { name: bi("water", "ماء"), fill: WATER, ok: { inductive: false, capacitive: true, magnetic: false } },
];

const TYPE_LINE: Record<string, Bi> = {
  inductive: bi("Detects metal, best of all ferrous", "يكتشف المعادن، وأفضلها الحديدية"),
  capacitive: bi("Detects metal and non-metal", "يكتشف المعادن وغير المعادن"),
  magnetic: bi("Responds only to a magnet", "لا يستجيب إلا لمغناطيس"),
};

/** A proximity sensor barrel lying along x, its sensing face at `face`. */
function Barrel({ x, y, len = 100, face = "right", d = 0 }: { x: number; y: number; len?: number; face?: "right" | "left"; d?: number }) {
  const fx = face === "right" ? x + len : x - 8;
  return (
    <In d={d}>
      <rect x={x} y={y - 18} width={len} height={36} rx={5} className={w.under} />
      <rect x={x} y={y - 18} width={len} height={36} rx={5} className={`${w.shape} ${w.navy}`} />
      {[0.25, 0.4, 0.55, 0.7].map((f) => (
        <path key={f} d={`M${x + len * f},${y - 18} v36`} className={`${w.line} ${w.faint}`} />
      ))}
      <rect x={fx} y={y - 15} width={8} height={30} rx={2} className={`${w.shape} ${w.slate}`} />
    </In>
  );
}

function Types({ control }: { control: string }) {
  const type = control in TYPE_LINE ? control : "inductive";
  const axis = { x0: 150, x1: 330, y: 200 };
  const mmX = (mm: number) => axis.x0 + (mm / 60) * (axis.x1 - axis.x0);
  const range = type === "inductive" ? RANGE_MM.inductive : type === "capacitive" ? RANGE_MM.capacitive : null;
  const rows = type === "magnetic" ? [...TARGETS, { name: bi("magnet", "مغناطيس"), fill: "#c8463c", ok: { magnetic: true } } as Target] : TARGETS;
  return (
    <Svg>
      <Text x={175} y={30} text={TYPE_LINE[type]} tone="heading" size={12} d={0} />
      <Barrel x={20} y={122} len={100} d={0} />
      {[18, 32, 46].map((r, i) => (
        <ArcPath key={r} cx={128} cy={122} r={r} a0={35} a1={145} tone="gold" dashed d={200 + i * 120} />
      ))}
      <Text x={70} y={160} text={bi("sensing face", "وجه الاستشعار")} size={10.5} tone="muted" d={150} />
      <Arrow pts={[[axis.x0, axis.y], [axis.x1 + 8, axis.y]]} tone="faint" d={400} dur={300} />
      {[0, 15, 30, 45, 60].map((mm) => (
        <g key={mm}>
          <Arrow pts={[[mmX(mm), axis.y - 3], [mmX(mm), axis.y + 3]]} tone="faint" head={false} d={400} dur={100} />
          <Text x={mmX(mm)} y={axis.y + 13} text={String(mm)} mono size={10} tone="muted" d={450} />
        </g>
      ))}
      <Text x={240} y={236} text={bi("sensing distance (mm)", "مسافة الاستشعار (مم)")} size={10.5} tone="muted" d={500} />
      {range ? (
        <>
          <Box x={mmX(range[0])} y={axis.y - 18} w={mmX(range[1]) - mmX(range[0])} h={12} r={3} tone="gold" d={700} />
          <Text x={(mmX(range[0]) + mmX(range[1])) / 2} y={axis.y - 30} text={`${range[0]}–${range[1]} mm`} mono size={11} tone="gold" d={800} />
        </>
      ) : (
        <Text x={240} y={axis.y - 32} text={bi("range: depends on the magnet", "المدى: يعتمد على المغناطيس")} size={11} tone="gold" d={700} />
      )}
      <Text x={450} y={30} text={bi("Target", "الهدف")} tone="heading" size={12} d={300} />
      {rows.map((t, i) => {
        const yc = 64 + i * 40;
        const ok = t.ok[type] ?? false;
        return (
          <g key={i}>
            <Swatch x={366} y={yc - 10} w={26} h={22} fill={t.fill} d={400 + i * 120} />
            <Text x={404} y={yc} text={t.name} anchor="start" size={11} d={400 + i * 120} />
            {t.note?.[type] ? <Text x={512} y={yc} text={t.note[type]} anchor="end" size={9.5} tone="muted" d={700 + i * 120} /> : null}
            <Mark x={530} y={yc + 4} ok={ok} r={9} d={700 + i * 120} />
          </g>
        );
      })}
    </Svg>
  );
}

function Inductive({ control }: { control: string }) {
  const near = control === "near";
  const amp = near ? 0.28 : 0.85;
  const th = 0.55;
  const plot: PlotBox = { x: 110, y: 150, w: 250, h: 92, domain: [0, 1], range: [-1, 1] };
  const blocks: { x: number; w: number; label: Bi }[] = [
    { x: 162, w: 104, label: bi("LC oscillator", "مذبذب LC") },
    { x: 278, w: 104, label: bi("Schmitt trigger", "قادح شميت") },
    { x: 394, w: 104, label: bi("Amplifier", "المضخِّم") },
  ];
  const plateX = 20;
  return (
    <Svg>
      <Box x={100} y={34} w={444} h={80} r={10} tone="ghost" dashed d={0} />
      <Box x={106} y={50} w={44} h={48} r={5} tone="slate" label="L" sub={bi("coil", "ملف")} mono size={13} subSize={10} d={100} />
      {blocks.map((b, i) => (
        <g key={i}>
          <Box x={b.x} y={50} w={b.w} h={48} r={6} tone="outline" label={b.label} size={11} d={200 + i * 150} />
          <Arrow pts={[[b.x - 11, 74], [b.x - 1, 74]]} tone="muted" d={300 + i * 150} dur={150} />
        </g>
      ))}
      <Wire pts={[[498, 74], [544, 74]]} tone="muted" d={700} dur={200} />
      {[14, 26, 38].map((r, i) => (
        <ArcPath key={r} cx={104} cy={74} r={r} a0={215} a1={325} tone="gold" dashed d={500 + i * 100} />
      ))}
      <Glide stops={near ? [[0, 0], [46, 0]] : [[0, 0]]} at={near ? [300] : []} move={700}>
        <Swatch x={plateX} y={40} w={16} h={68} fill={STEEL} d={0} />
        {near ? (
          <Fade d={1100}>
            <ArcPath cx={plateX + 8} cy={60} r={5} a0={20} a1={320} tone="danger" width={1.6} d={1100} />
            <ArcPath cx={plateX + 8} cy={88} r={5} a0={20} a1={320} tone="danger" width={1.6} d={1200} />
          </Fade>
        ) : null}
      </Glide>
      <Text x={near ? 74 : 28} y={124} text={bi("steel", "فولاذ")} size={10.5} tone="muted" d={200} />
      {near ? <Text x={30} y={20} text={bi("eddy currents", "تيارات دوّامية")} anchor="start" size={10.5} tone="danger" d={1300} /> : null}
      <Text x={110} y={130} text={bi("oscillation amplitude", "سعة التذبذب")} anchor="start" size={11} tone="heading" d={800} />
      <Curve box={plot} points={[[0, 0], [1, 0]]} tone="faint" d={900} dur={300} />
      <Curve box={plot} points={[[0, th], [1, th]]} tone="danger" dashed d={1000} />
      <Curve box={plot} points={[[0, -th], [1, -th]]} tone="danger" dashed d={1000} />
      <Text x={plot.x + plot.w + 6} y={plotAt(plot, 1, th)[1]} text={bi("threshold", "العتبة")} anchor="start" size={10.5} tone="danger" d={1100} />
      <Curve box={plot} fn={(t) => amp * Math.sin(2 * Math.PI * 7 * t)} samples={160} tone={near ? "slate" : "gold"} d={1100} dur={900} />
      <In d={1900}>
        <circle cx={480} cy={186} r={13} className={w.under} />
        <circle cx={480} cy={186} r={13} className={`${w.shape} ${near ? w.success : w.muted}`} />
      </In>
      <Chip x={480} y={228} text={near ? bi("output ON", "الخرج يعمل") : bi("output OFF", "الخرج مطفأ")} tone={near ? "success" : "muted"} center d={2000} />
    </Svg>
  );
}

function Capacitive({ control }: { control: string }) {
  const metal = control !== "nonmetal";
  const sx = 152;
  const far = 178;
  const nearGap = far / 2;
  const c0 = capacitance(1, far);
  const c1 = capacitance(1, nearGap);
  const meterMax = (c1 / c0) * 1.2;
  return (
    <Svg>
      <Text x={400} y={24} text={bi("smaller gap → higher C", "فجوة أصغر ← سعة أكبر")} size={13} tone="heading" weight={700} d={0} />
      <Box x={140} y={60} w={12} h={124} r={2} tone="navy" d={100} />
      <Text x={146} y={202} text={bi("sensor plate", "لوح المستشعر")} size={10.5} tone="muted" d={150} />
      {metal ? (
        <>
          {[76, 100, 124, 148, 172].map((y, i) => (
            <Fade key={y} d={1500 + i * 40}>
              <path d={`M${sx},${y} H${sx + nearGap}`} className={`${w.line} ${w.gold} ${w.dashed}`} />
            </Fade>
          ))}
          <Glide stops={[[0, 0], [-(far - nearGap), 0]]} at={[400]} move={1000}>
            <Swatch x={sx + far} y={60} w={12} h={124} fill={STEEL} d={0} />
          </Glide>
          <Text x={sx + nearGap + 6} y={202} text={bi("metal target", "هدف معدني")} size={10.5} tone="muted" d={1500} />
          <Arrow pts={[[sx, 56], [sx + nearGap, 56]]} tone="slate" both d={1500} dur={300} />
          <Text x={sx + nearGap / 2} y={24} text={bi("gap shrinks", "الفجوة تصغر")} size={10.5} tone="slate" d={1600} />
          <Chip x={330} y={244} text={bi("closer target → smaller gap → larger C", "هدف أقرب ← فجوة أصغر ← C أكبر")} tone="outline" center d={2000} />
        </>
      ) : (
        <>
          {[76, 100, 124, 148, 172].map((y, i) => (
            <Fade key={y} d={300 + i * 40}>
              <path d={`M${sx},${y} H400`} className={`${w.line} ${w.gold} ${w.dashed}`} />
            </Fade>
          ))}
          <Box x={400} y={60} w={12} h={124} r={2} tone="slate" d={200} />
          <Ground x={406} y={184} d={250} />
          <Text x={424} y={196} text={bi("earth", "الأرض")} anchor="start" size={10.5} tone="muted" d={300} />
          <Glide stops={[[0, 0], [0, 70]]} at={[500]} move={900}>
            <Swatch x={228} y={14} w={96} h={76} fill={PLASTIC} d={400} />
          </Glide>
          <Text x={276} y={202} text={bi("plastic: the dielectric", "البلاستيك: العازل")} size={10.5} tone="muted" d={1500} />
          <Chip x={330} y={244} text={bi("object becomes the dielectric → C changes", "الجسم يصبح العازل ← تتغيّر C")} tone="outline" center d={2000} />
        </>
      )}
      <Meter x={496} y={60} h={140} w={24} value={metal ? c1 / c0 : 2.2} max={meterMax} d={300} />
      <Arrow pts={[[490, 60 + 140 - (1 / meterMax) * 140], [526, 60 + 140 - (1 / meterMax) * 140]]} tone="slate" dashed head={false} d={500} />
      <Text x={508} y={220} text="C" mono size={12} tone="heading" d={300} />
      <Text x={486} y={60 + 140 - (1 / meterMax) * 140} text={bi("before", "قبل")} anchor="end" size={10} tone="muted" d={600} />
    </Svg>
  );
}

function Wiring({ control }: { control: string }) {
  const three = control === "three";
  const top = 50;
  const bottom = 232;
  return (
    <Svg>
      <Wire pts={[[60, top], [520, top]]} tone="navy" d={0} dur={400} width={2.2} />
      <Wire pts={[[60, bottom], [520, bottom]]} tone="slate" d={0} dur={400} width={2.2} />
      <Text x={52} y={top} text={`+${SWITCH_V.industrial} V`} anchor="end" mono size={11} tone="heading" d={100} />
      <Text x={52} y={bottom} text="0 V" anchor="end" mono size={11} tone="heading" d={100} />
      {three ? (
        <>
          <Wire pts={[[150, top], [150, 96]]} tone="navy" d={300} dur={200} />
          <Wire pts={[[176, 146], [176, bottom]]} tone="slate" d={300} dur={300} />
          <Box x={120} y={96} w={100} h={50} r={6} tone="navy" label={bi("sensor", "المستشعر")} size={12} d={200} />
          <Text x={142} y={76} text={bi("supply", "التغذية")} anchor="end" size={10.5} tone="muted" d={500} />
          <Text x={184} y={190} text={bi("ground", "الأرضي")} anchor="start" size={10.5} tone="muted" d={500} />
          <Wire pts={[[220, 121], [380, 121], [380, 160]]} tone="gold" d={600} dur={400} width={2.2} />
          <Text x={300} y={136} text={bi("output", "الخرج")} size={10.5} tone="gold" d={800} />
          <Box x={340} y={160} w={80} h={40} r={6} tone="outline" label={bi("load", "الحِمل")} size={12} d={700} />
          <Wire pts={[[380, 200], [380, bottom]]} tone="slate" d={800} dur={200} />
          <Text x={428} y={180} text={bi("relay or PLC input", "مرحِّل أو دخل PLC")} anchor="start" size={10.5} tone="muted" d={900} />
          <Token pts={[[150, top], [150, 96]]} d={1000} dur={400} />
          <Token pts={[[220, 121], [380, 121], [380, 160]]} d={1500} dur={700} />
          <Chip x={300} y={258} text={bi("own supply: no leakage through the load", "تغذية مستقلة: لا تسرّب عبر الحِمل")} tone="success" center d={1800} />
        </>
      ) : (
        <>
          <Wire pts={[[200, top], [200, 84]]} tone="navy" d={300} dur={200} />
          <Box x={150} y={84} w={100} h={50} r={6} tone="navy" label={bi("sensor", "المستشعر")} size={12} d={200} />
          <Wire pts={[[200, 134], [200, 162]]} tone="gold" d={500} dur={200} />
          <Box x={160} y={162} w={80} h={40} r={6} tone="outline" label={bi("load", "الحِمل")} size={12} d={600} />
          <Wire pts={[[200, 202], [200, bottom]]} tone="slate" d={700} dur={200} />
          <Text x={262} y={182} text={bi("relay or PLC input", "مرحِّل أو دخل PLC")} anchor="start" size={10.5} tone="muted" d={800} />
          <Text x={262} y={110} text={bi("in series, like a mechanical switch", "على التوالي مثل المفتاح الميكانيكي")} anchor="start" size={10.5} tone="muted" d={800} />
          <Token pts={[[200, top], [200, bottom]]} d={1000} dur={1200} />
          <Arrow pts={[[136, 100], [136, 196]]} tone="danger" dashed d={1400} />
          <Text x={262} y={146} text={bi("small leakage when off", "تسرّب صغير عند الإطفاء")} anchor="start" size={10.5} tone="danger" d={1500} />
          <Chip x={300} y={258} text={bi("two wires: easy to fit, but it leaks", "سلكان: سهل التركيب، لكنه يسرّب")} tone="warn" center d={1800} />
        </>
      )}
    </Svg>
  );
}

const TEETH = 8;

function Advantages() {
  const cx = 120;
  const cy = 122;
  const pulse: [number, number][] = [];
  for (let i = 0; i < TEETH; i++) pulse.push([i, 0], [i + 0.35, 0], [i + 0.35, 1], [i + 0.65, 1], [i + 0.65, 0]);
  pulse.push([TEETH, 0]);
  const plot: PlotBox = { x: 320, y: 64, w: 210, h: 54, domain: [0, TEETH], range: [0, 1] };
  return (
    <Svg>
      <Turn cx={cx} cy={cy} from={0} to={360} at={300} dur={4000}>
        <In d={0}>
          <circle cx={cx} cy={cy} r={62} className={w.under} />
          <circle cx={cx} cy={cy} r={62} className={`${w.shape} ${w.slate}`} />
          {Array.from({ length: TEETH }, (_, i) => {
            const [x1, y1] = polar(cx, cy, 60, (360 / TEETH) * i);
            const [x2, y2] = polar(cx, cy, 78, (360 / TEETH) * i);
            return <path key={i} d={`M${x1},${y1} L${x2},${y2}`} className={`${w.line} ${w.navy}`} style={{ strokeWidth: 9 }} />;
          })}
          <circle cx={cx} cy={cy} r={8} style={{ fill: "var(--heading)" }} />
        </In>
      </Turn>
      <Text x={cx} y={212} text={bi(`rotating shaft with ${TEETH} flags`, `عمود دوّار عليه ${TEETH} نتوءات`)} size={10.5} tone="muted" d={200} />
      <Barrel x={214} y={cy} len={70} face="left" d={100} />
      <Text x={250} y={160} text={bi("inductive", "حثّي")} size={10.5} tone="muted" d={200} />
      <Text x={425} y={36} text={bi("sensor output", "خرج المستشعر")} tone="heading" size={11.5} d={300} />
      <Curve box={plot} axes points={pulse} tone="gold" d={300} dur={4000} />
      <Chip x={425} y={162} text={bi(`${TEETH} pulses per turn: count them`, `${TEETH} نبضات في كل دورة: عُدَّها`)} tone="gold" center d={4400} />
      {[
        { x: 92, t: bi("no contact", "لا تلامس") },
        { x: 228, t: bi("no moving parts", "لا أجزاء متحركة") },
        { x: 372, t: bi("fast switching", "تبديل سريع") },
        { x: 494, t: bi("long life", "عمر طويل") },
      ].map((c, i) => (
        <Chip key={i} x={c.x} y={256} text={c.t} tone="success" center d={600 + i * 150} />
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof proximity>>({
  types: Types,
  inductive: Inductive,
  capacitive: Capacitive,
  wiring: Wiring,
  advantages: Advantages,
});

