"use client";

import type { infrared } from "@/lib/walkthroughs/robotics/lecture-04";
import { spotOffset } from "@/lib/widgets/rob-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, Svg, Text, plotAt, type PlotBox, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dot, Stroke } from "./local";

/* The sensor drawn in every IR scene: LED at E, lens at L a baseline below, detector array f behind the lens. */
const E: Pt = [80, 70];
const L: Pt = [80, 160];
const F = 40;
const B = L[1] - E[1];
const ARRAY_X = L[0] - F;
const spotY = (D: number) => L[1] + spotOffset(D, F, B);

function Housing({ d = 0 }: { d?: number }) {
  return (
    <In d={d}>
      <Text x={40} y={70} text="LED" mono size={11} tone="heading" />
      <Box x={66} y={56} w={28} h={28} r={5} tone="gold" />
      <ellipse cx={L[0]} cy={L[1]} rx={5} ry={18} style={{ fill: "var(--slate-soft)", stroke: "var(--slate)", strokeWidth: 1.5 }} />
      <Box x={ARRAY_X - 6} y={154} w={10} h={66} r={2} tone="outline" />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${ARRAY_X - 6},${165 + i * 11} h10`} style={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
      ))}
      <Stroke pts={[[ARRAY_X - 4, L[1]], [150, L[1]]]} tone="faint" width={1} dashed />
    </In>
  );
}

/** Beam out to an object D px away and the reflected ray through the lens onto the array. */
function Rays({ D, d = 0, faint, opacity = 1 }: { D: number; d?: number; faint?: boolean; opacity?: number }) {
  const S: Pt = [E[0] + D, E[1]];
  const hit: Pt = [ARRAY_X, spotY(D)];
  if (faint) {
    return (
      <Fade d={d}>
        <Stroke pts={[[E[0] + 14, E[1]], S, hit]} tone="faint" width={1.2} dashed />
        <rect x={S[0]} y={40} width={14} height={80} rx={2} style={{ fill: "none", stroke: "var(--border-strong)", strokeDasharray: "4 3" }} />
      </Fade>
    );
  }
  return (
    <g style={{ opacity }}>
      <Arrow pts={[[E[0] + 16, E[1]], [S[0] - 2, S[1]]]} tone="gold" d={d} dur={500} />
      <Arrow pts={[S, hit]} tone="gold" d={d + 600} dur={600} />
      <Dot at={[ARRAY_X - 1, hit[1]]} r={5} tone="gold" d={d + 1200} />
    </g>
  );
}

// ---------- Triangulation ----------
const NEAR = 80;
const FAR = 390;

function Triangulation({ control }: { control: string }) {
  const near = control !== "far";
  const D = near ? NEAR : FAR;
  const objX = E[0] + D;
  const y = spotY(D);
  return (
    <Svg>
      <Housing />
      <Rays D={near ? FAR : NEAR} faint d={100} />
      <Box x={objX} y={40} w={14} h={80} r={2} tone="slate" d={0} />
      <Text x={objX + 7} y={154} text={near ? bi("near object", "جسم قريب") : bi("far object", "جسم بعيد")} size={11} tone="heading" d={0} />
      <Rays D={D} d={300} />
      <Arrow pts={[[E[0], 24], [objX, 24]]} tone="muted" both d={1600} dur={300} label="d" labelAt={[(E[0] + objX) / 2, 12]} />
      <Arrow pts={[[58, 74], [58, 156]]} tone="muted" both d={200} dur={300} />
      <Text x={50} y={116} text="b" mono size={12} tone="heading" d={300} />
      <Fade d={1600}>
        <Stroke pts={[[26, L[1]], [26, y]]} tone="gold" width={2.4} />
      </Fade>
      <Text x={112} y={212} text={bi("detector array", "مصفوفة الكواشف")} anchor="start" size={10.5} tone="muted" d={200} />
      <Stroke pts={[[108, 212], [48, 212]]} tone="faint" width={1} d={200} />
      <Text x={380} y={204} text={bi("spot position → return angle → distance", "موضع البقعة ← زاوية العودة ← المسافة")} size={12} tone="gold" d={1800} />
      <Text
        x={380}
        y={236}
        text={near ? bi("near: a steep return, onto one end", "قريب: عودة حادة إلى أحد الطرفين") : bi("far: nearly parallel, onto the other end", "بعيد: عودة شبه موازية إلى الطرف الآخر")}
        size={11.5}
        tone="heading"
        d={2000}
      />
    </Svg>
  );
}

// ---------- Non-linear response ----------
const DIST = [1, 2, 3, 4] as const;

function Nonlinear() {
  const box: PlotBox = { x: 64, y: 46, w: 290, h: 176, domain: [0.6, 4.8], range: [0, 1.7] };
  const pts = DIST.map((d) => plotAt(box, d, 1 / d));
  const bar = { x: 452, top: 54, axis: 230, scale: 150 };
  return (
    <Svg>
      <Curve box={box} fn={(d) => 1 / d} axes xLabel={bi("distance", "المسافة")} yLabel={bi("spot offset", "إزاحة البقعة")} tone="gold" d={0} dur={1000} samples={120} />
      {pts.map((p, i) => (
        <g key={i}>
          <Fade d={1100 + i * 250}>
            <Stroke pts={[[box.x, p[1]], p, [p[0], box.y + box.h]]} tone="faint" width={1} dashed />
          </Fade>
          <Dot at={p} r={4.5} tone="gold" d={1100 + i * 250} />
          <Text x={p[0]} y={box.y + box.h + 13} text={String(DIST[i])} mono size={10.5} tone="heading" d={1100 + i * 250} />
        </g>
      ))}
      <Text x={bar.x + 6} y={30} text={bi("on the array", "على المصفوفة")} size={11} tone="heading" d={200} />
      <Box x={bar.x} y={bar.top} w={12} h={bar.axis - bar.top + 4} r={2} tone="outline" d={200} />
      <Stroke pts={[[bar.x - 8, bar.axis], [bar.x + 20, bar.axis]]} tone="faint" width={1.2} dashed d={200} />
      {DIST.map((d, i) => {
        const y = bar.axis - bar.scale / d;
        return (
          <g key={d}>
            <Dot at={[bar.x + 6, y]} r={4.5} tone="gold" d={1100 + i * 250} />
            <Text x={bar.x + 22} y={y} text={String(d)} anchor="start" mono size={10.5} tone="heading" d={1100 + i * 250} />
          </g>
        );
      })}
      <Chip x={262} y={78} text={bi("equal distance steps, shrinking spot steps", "خطوات مسافة متساوية، وخطوات بقعة تتقلص")} tone="slate" center d={2200} />
    </Svg>
  );
}

// ---------- Pulsed at 40 kHz ----------
function pulses(base: number, high: number, periods = 10): [number, number][] {
  const pts: [number, number][] = [];
  for (let k = 0; k < periods; k++) {
    pts.push([k, base], [k + 0.25, base], [k + 0.25, high], [k + 0.75, high], [k + 0.75, base]);
  }
  pts.push([periods, base]);
  return pts;
}

function Pulsed() {
  const top: PlotBox = { x: 70, y: 44, w: 360, h: 70, domain: [0, 10], range: [0, 2.1] };
  const bottom: PlotBox = { x: 70, y: 188, w: 360, h: 44, domain: [0, 10], range: [0, 1.1] };
  const ambient = plotAt(top, 0, 1)[1];
  return (
    <Svg>
      <Text x={70} y={26} text={bi("at the detector: room light + 40 kHz LED pulses", "عند الكاشف: ضوء الغرفة + نبضات LED بتردد 40 kHz")} anchor="start" size={11} tone="heading" d={0} />
      <Fade d={200}>
        <rect x={top.x} y={ambient} width={top.w} height={top.y + top.h - ambient} style={{ fill: "var(--slate-soft)" }} />
      </Fade>
      <Curve box={top} points={pulses(1, 1.9)} tone="navy" d={300} dur={900} />
      <Text x={436} y={(ambient + top.y + top.h) / 2} text={bi("room light", "ضوء الغرفة")} anchor="start" size={10.5} tone="slate" d={400} />
      <Arrow pts={[[250, 120], [250, 136]]} tone="muted" d={1200} dur={200} />
      <Box x={160} y={138} w={180} h={30} r={8} tone="navy" label={bi("responds only to 40 kHz", "يستجيب لتردد 40 kHz فقط")} size={10.5} d={1200} />
      <Arrow pts={[[250, 170], [250, 184]]} tone="muted" d={1400} dur={200} />
      <Curve box={bottom} points={pulses(0, 1)} tone="gold" d={1500} dur={900} />
      <Text x={250} y={252} text={bi("only the pulses are left", "لا يبقى إلا النبضات")} size={11} tone="success" d={2300} />
      <In d={600}>
        <Box x={478} y={124} w={64} h={110} r={10} tone="outline" />
        <Box x={485} y={136} w={50} h={78} r={3} tone="muted" />
        <circle cx={510} cy={175} r={15} style={{ fill: "var(--gold-soft)" }} />
        <circle cx={510} cy={175} r={6} style={{ fill: "var(--gold)" }} />
      </In>
      <Text x={510} y={252} text={bi("phone camera", "كاميرا الهاتف")} size={10.5} tone="muted" d={600} />
    </Svg>
  );
}

// ---------- Bright or dull target ----------
const MID = 200;

function Reflectivity({ control }: { control: string }) {
  const grey = control === "grey";
  const k = grey ? 0.35 : 1;
  const objX = E[0] + MID;
  const spot = (spotY(MID) - 154) / 88;
  return (
    <Svg>
      <Housing />
      <In d={0}>
        <rect x={objX} y={40} width={16} height={80} rx={2} style={{ fill: grey ? "#8c8c8c" : "#f6f6f6", stroke: "var(--border-strong)", strokeWidth: 1.5 }} />
      </In>
      <Text x={objX + 8} y={134} text={grey ? bi("grey target", "هدف رمادي") : bi("white target", "هدف أبيض")} size={11} tone="heading" d={0} />
      <Rays D={MID} d={300} opacity={k} />
      <Text x={436} y={30} text={bi("spot brightness", "سطوع البقعة")} size={11.5} tone="heading" d={300} />
      <Box x={366} y={58} w={140} h={16} r={8} tone="outline" d={300} />
      <Box x={366} y={58} w={140 * k} h={16} r={8} tone="gold" d={1500} />
      <Text x={436} y={102} text={bi("spot position on the array", "موضع البقعة على المصفوفة")} size={11.5} tone="heading" d={300} />
      <Box x={366} y={130} w={140} h={16} r={2} tone="outline" d={300} />
      <Dot at={[366 + 140 * spot, 138]} r={6} tone="gold" opacity={grey ? 0.55 : 1} d={1500} />
      <Text x={436} y={168} text={bi("the same place in both cases", "المكان نفسه في الحالتين")} size={10.5} tone="muted" d={1600} />
      <Chip x={436} y={216} text={bi("same position, same distance", "الموضع نفسه، والمسافة نفسها")} tone="success" center d={1800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof infrared>>({
  triangulation: Triangulation,
  nonlinear: Nonlinear,
  pulsed: Pulsed,
  reflectivity: Reflectivity,
});
