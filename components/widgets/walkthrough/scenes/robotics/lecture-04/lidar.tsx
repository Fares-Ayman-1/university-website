"use client";

import { useContext } from "react";
import type { lidar } from "@/lib/walkthroughs/robotics/lecture-04";
import { BOX, LIDAR_FACTS, ROOM, SCANNER, scan, shadowOf, type P } from "@/lib/widgets/rob-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, StageContext, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dot, Hatch, Poly, Sensor, Spin, Stroke, Travel, Until, Wall, arc } from "./local";

// ---------- Time of flight ----------
function Tof({ control }: { control: string }) {
  const light = control !== "sound";
  return (
    <Svg>
      <Text
        x={280}
        y={28}
        text={light ? bi("light covers about 0.3 m per nanosecond", "يقطع الضوء نحو 0.3 m في النانوثانية") : bi("sound covers about 0.34 m per millisecond", "يقطع الصوت نحو 0.34 m في الملّي ثانية")}
        size={12}
        tone="heading"
        d={0}
      />
      <Sensor x={24} y={92} w={40} h={36} label={bi("sensor", "المستشعر")} d={0} />
      <Wall x={496} y={64} w={16} h={92} d={0} />
      <Travel pts={[[70, 110], [490, 110], [70, 110]]} d={400} dur={1800} vanish linear>
        {light ? <circle r={6} style={{ fill: "var(--gold)", stroke: "var(--surface)", strokeWidth: 2 }} /> : <Stroke pts={arc(-14, 0, 14, -45, 45, 8)} tone="slate" width={2.6} />}
      </Travel>
      <Stroke pts={[[66, 110], [494, 110]]} tone={light ? "gold" : "slate"} width={1.2} dashed d={200} />
      <Arrow pts={[[64, 178], [496, 178]]} tone="muted" both d={100} dur={400} label="10 m" labelAt={[280, 166]} />
      <Box x={190} y={200} w={180} h={42} r={10} tone="gold" label={light ? `t = ${LIDAR_FACTS.ns10} ns` : `t = ${LIDAR_FACTS.ms10} ms`} mono size={17} d={2300} />
      <Text x={100} y={221} text={light ? "c = 3 × 10⁸ m/s" : "v = 343 m/s"} mono size={11.5} tone="muted" d={2300} />
      <Text
        x={462}
        y={221}
        text={light ? bi(`1 mm needs ${LIDAR_FACTS.ps1mm} ps`, `1 mm يحتاج إلى ${LIDAR_FACTS.ps1mm} ps`) : bi("easy to time", "زمن سهل القياس")}
        size={11.5}
        tone={light ? "danger" : "success"}
        d={2500}
      />
      <Text x={280} y={262} text="d = v · t / 2" mono size={12} tone="muted" d={2600} />
    </Svg>
  );
}

// ---------- Phase shift and interferometry ----------
const SHIFT = 1.3;

function Phase() {
  const ref: PlotBox = { x: 120, y: 50, w: 410, h: 56, domain: [0, 4 * Math.PI], range: [-1.15, 1.15] };
  const ret: PlotBox = { ...ref, y: 140 };
  const peakRef = plotAt(ref, Math.PI / 2, 1)[0];
  const peakRet = plotAt(ret, Math.PI / 2 + SHIFT, 1)[0];
  return (
    <Svg>
      <Text x={60} y={78} text={bi("reference", "المرجع")} size={11} tone="slate" d={0} />
      <Text x={60} y={168} text={bi("returning light", "الضوء العائد")} size={11} tone="gold" d={300} />
      <Stroke pts={[[120, 78], [530, 78]]} tone="faint" width={1} dashed d={0} />
      <Stroke pts={[[120, 168], [530, 168]]} tone="faint" width={1} dashed d={300} />
      <Curve box={ref} fn={Math.sin} tone="slate" d={0} dur={900} samples={120} />
      <Curve box={ret} fn={(x) => Math.sin(x - SHIFT)} tone="gold" d={300} dur={900} samples={120} />
      <Fade d={1300}>
        <Stroke pts={[[peakRef, 44], [peakRef, 214]]} tone="slate" width={1.2} dashed />
        <Stroke pts={[[peakRet, 132], [peakRet, 214]]} tone="gold" width={1.2} dashed />
      </Fade>
      <Arrow pts={[[peakRef, 222], [peakRet, 222]]} tone="danger" both d={1500} dur={300} />
      <Text x={(peakRef + peakRet) / 2} y={238} text="Δφ" mono size={13} tone="danger" d={1600} />
      <Chip x={400} y={250} text={bi("Δφ gives the distance", "تعطي Δφ المسافة")} tone="slate" center d={1800} />
    </Svg>
  );
}

const FRINGES = 6;
const FRINGE_MS = 380;

function Interferometry() {
  const { reduced } = useContext(StageContext);
  const t0 = 700;
  return (
    <Svg>
      <Sensor x={24} y={100} w={52} h={36} label={bi("laser", "الليزر")} d={0} />
      <Arrow pts={[[76, 118], [398, 118]]} tone="gold" head={false} d={200} dur={500} />
      <Arrow pts={[[398, 118], [446, 118]]} tone="gold" head={false} d={t0} dur={FRINGES * FRINGE_MS} />
      <Travel pts={[[0, 0], [44, 0]]} d={t0} dur={FRINGES * FRINGE_MS} linear>
        <Box x={400} y={72} w={12} h={92} r={2} tone="slate" />
      </Travel>
      <Text x={430} y={40} text={bi("target moves", "الهدف يتحرك")} size={11} tone="heading" d={400} />
      <Arrow pts={[[404, 176], [452, 176]]} tone="muted" d={t0} dur={600} />
      <Text x={232} y={170} text={bi("interference fringes", "هُدُب التداخل")} size={11} tone="heading" d={300} />
      {Array.from({ length: FRINGES }, (_, k) => (
        <g key={k}>
          <Box x={106 + k * 44} y={196} w={36} h={26} r={3} tone="outline" d={300} />
          <Box x={106 + k * 44} y={196} w={36} h={26} r={3} tone="gold" label={String(k + 1)} mono size={11} d={t0 + (k + 1) * FRINGE_MS} />
        </g>
      ))}
      <Text x={484} y={238} text={bi("fringes counted", "الهُدُب المعدودة")} size={11} tone="heading" d={t0} />
      {Array.from({ length: FRINGES + 1 }, (_, k) => k).filter((k) => !reduced || k === FRINGES).map((k) => {
        const label = <Box x={452} y={198} w={64} h={24} r={6} tone="navy" label={String(k)} mono size={13} />;
        return (
          <Fade key={k} d={t0 + k * FRINGE_MS}>
            {k < FRINGES ? <Until at={t0 + (k + 1) * FRINGE_MS}>{label}</Until> : label}
          </Fade>
        );
      })}
      <Text x={234} y={258} text={bi("it measures the change; its zero is arbitrary", "يقيس التغيّر، أما صفره فاختياري")} size={11.5} tone="muted" d={t0 + FRINGES * FRINGE_MS} />
    </Svg>
  );
}

function PhaseOrFringes({ control }: { control: string }) {
  return control === "interferometry" ? <Interferometry /> : <Phase />;
}

// ---------- 1-D, 2-D, 3-D ----------
function Room({ d = 0 }: { d?: number }) {
  return (
    <>
      <Box x={ROOM.x} y={ROOM.y} w={ROOM.w} h={ROOM.h} r={4} tone="ghost" d={d} />
      <Box x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} r={3} tone="slate" label={bi("box", "صندوق")} size={10.5} d={d} />
    </>
  );
}

function Scanner({ at, d = 0, faint }: { at: P; d?: number; faint?: boolean }) {
  return (
    <In d={d}>
      <circle cx={at[0]} cy={at[1]} r={9} style={{ fill: faint ? "var(--surface)" : "var(--heading)", stroke: "var(--heading)", strokeWidth: 1.6, strokeDasharray: faint ? "3 3" : undefined }} />
    </In>
  );
}

function ScanScene({ control }: { control: string }) {
  const o = SCANNER.first;
  const one = control === "d1";
  const three = control === "d3";
  const rays = one ? scan(o, 1, -30, 330) : scan(o, 36);
  const sx: P = [388, 200];
  const elevations = three ? [-40, -30, -20, -10, 0, 10, 20, 30, 40] : [0];
  const sideHits = elevations.map((e) => {
    const t = Math.tan((e * Math.PI) / 180);
    const y = sx[1] + 144 * t;
    return y > 236 ? ([sx[0] + (236 - sx[1]) / t, 236] as P) : ([532, y] as P);
  });
  return (
    <Svg>
      <Room />
      <Text x={30} y={34} text={bi("top view", "منظر علوي")} anchor="start" size={10.5} tone="muted" d={0} />
      <Fade d={200}>
        {rays.map((r, i) => (
          <Stroke key={i} pts={[o, r.at]} tone={one ? "gold" : "faint"} width={one ? 2 : 1} opacity={one ? 1 : 0.8} />
        ))}
      </Fade>
      {rays.map((r, i) => (
        <Dot key={i} at={r.at} r={one ? 5 : 3.6} tone="gold" d={400 + i * 45} />
      ))}
      {one ? null : (
        <Spin cx={o[0]} cy={o[1]} deg={360} d={350} dur={36 * 45} linear>
          <Stroke pts={[o, [o[0] + 22, o[1]]]} tone="gold" width={2.4} />
        </Spin>
      )}
      <Scanner at={o} d={0} />
      <Text x={448} y={30} text={bi("side view", "منظر جانبي")} size={10.5} tone="muted" d={0} />
      <Stroke pts={[[350, 236], [540, 236]]} tone="faint" width={1.6} d={0} />
      <Wall x={532} y={52} w={10} h={184} d={0} />
      <Box x={368} y={206} w={40} h={30} r={4} tone="navy" d={0} />
      {sideHits.map((h, i) => (
        <g key={i}>
          <Stroke pts={[sx, h]} tone="gold" width={1.4} opacity={0.8} d={500 + i * 120} />
          <Dot at={h} r={3.6} tone="gold" d={600 + i * 120} />
        </g>
      ))}
      <Dot at={sx} r={5} tone="navy" ring d={0} />
      <Text
        x={440}
        y={66}
        text={one ? bi("one beam, one point", "شعاع واحد، نقطة واحدة") : three ? bi("a fan in elevation too", "مروحة في الارتفاع أيضًا") : bi("one plane, seen edge-on", "مستوى واحد يُرى من حافته")}
        size={11}
        tone="heading"
        d={700}
      />
      <Chip x={448} y={262} text={one ? bi("1-D", "1-D") : three ? bi("3-D point cloud", "سحابة نقاط 3-D") : bi("2-D scan", "مسح 2-D")} tone="gold" center d={900} />
    </Svg>
  );
}

// ---------- Occlusion ----------
function Occlusion({ control }: { control: string }) {
  const moved = control === "moved";
  const o = moved ? SCANNER.moved : SCANNER.first;
  const rays = scan(o, 72);
  return (
    <Svg>
      {moved ? <Poly pts={shadowOf(SCANNER.first)} fill="none" stroke="var(--muted)" width={1.4} dashed d={0} /> : null}
      <Fade d={moved ? 900 : 300}>
        <Hatch pts={shadowOf(o)} />
      </Fade>
      <Fade d={200}>
        {rays.map((r, i) => (
          <Stroke key={i} pts={[o, r.at]} tone="faint" width={0.9} opacity={0.7} />
        ))}
      </Fade>
      <Room />
      {rays.map((r, i) => (
        <Dot key={i} at={r.at} r={3.2} tone="gold" d={300 + i * 12} />
      ))}
      {moved ? (
        <>
          <Scanner at={SCANNER.first} faint d={0} />
          <Arrow pts={[[SCANNER.first[0] + 12, SCANNER.first[1] + 6], [o[0] - 14, o[1] - 3]]} tone="muted" dashed d={100} />
        </>
      ) : null}
      <Scanner at={o} d={0} />
      <Dot at={[358, 54]} r={4} tone="gold" d={200} />
      <Text x={370} y={54} text={bi("measured surface", "سطح مَقيس")} anchor="start" size={11} tone="heading" d={200} />
      <In d={400}>
        <Hatch pts={[[350, 88], [366, 88], [366, 104], [350, 104]]} />
      </In>
      <Text x={374} y={96} text={bi("unknown, not empty", "مجهول وليس فارغًا")} anchor="start" size={11} tone="heading" d={400} />
      {moved ? (
        <>
          <Poly pts={[[350, 132], [366, 132], [366, 148], [350, 148]]} fill="none" stroke="var(--muted)" width={1.4} dashed d={1000} />
          <Text x={374} y={140} text={bi("old shadow, now partly seen", "الظل القديم، وقد صار مرئيًا جزئيًا")} anchor="start" size={11} tone="heading" d={1000} />
        </>
      ) : null}
      <Chip x={445} y={226} text={moved ? bi("moving reveals more", "الحركة تكشف المزيد") : bi("behind the box: hidden", "خلف الصندوق: مخفي")} tone={moved ? "success" : "slate"} center d={1200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof lidar>>({
  tof: Tof,
  phase: PhaseOrFringes,
  scan: ScanScene,
  occlusion: Occlusion,
});
