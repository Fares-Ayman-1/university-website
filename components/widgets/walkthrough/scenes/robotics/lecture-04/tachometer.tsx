"use client";

import type { tachometer } from "@/lib/walkthroughs/robotics/lecture-04";
import { SPEED_DEMO, TACHO_FACTS, demoEdges, windowReadings } from "@/lib/widgets/rob-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Box, Chip, Curve, Fade, In, Svg, Text, Token, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import w from "../../../../Walkthrough.module.css";
import { Spin, Stroke, Wedge } from "./local";

// ---------- Speed from counts ----------
const PX_PER_MS = 48;
const RPM_PX = 1.1;
const ZERO = 232;

function FromPulses({ control }: { control: string }) {
  const win = control === "w10" ? 10 : 1;
  const { edges, perMs } = demoEdges();
  const readings = windowReadings(win);
  const tx = (t: number) => 40 + PX_PER_MS * t;
  const trueY = ZERO - SPEED_DEMO.rpm * RPM_PX;
  const shown = 700 + readings.length * 120;
  return (
    <Svg>
      <Text x={40} y={18} text={bi(`encoder counts: ${perMs} per ms at a steady ${SPEED_DEMO.rpm} rpm`, `عدّات المُرمِّز: ${perMs} في كل ms عند سرعة ثابتة ${SPEED_DEMO.rpm} rpm`)} anchor="start" size={11} tone="heading" d={0} />
      <Stroke pts={[[tx(0), 62], [tx(10), 62]]} tone="faint" width={1.2} d={0} />
      {edges.map((t, i) => (
        <Stroke key={i} pts={[[tx(t), 44], [tx(t), 62]]} tone="navy" width={2} d={100 + i * 22} />
      ))}
      {readings.map((r, i) => (
        <Box key={i} x={tx(r.from) + 1} y={72} w={PX_PER_MS * win - 2} h={24} r={3} tone="outline" label={String(r.counts)} mono size={11} d={700 + i * 120} />
      ))}
      {[0, 5, 10].map((t) => (
        <Text key={t} x={tx(t)} y={108} text={t === 10 ? "10 ms" : String(t)} mono size={10} tone="muted" d={600} />
      ))}
      <Stroke pts={[[36, ZERO], [524, ZERO]]} tone="faint" width={1.2} d={600} />
      <Text x={20} y={190} text="rpm" mono size={10} tone="muted" d={600} />
      {readings.map((r, i) => {
        const h = r.rpm * RPM_PX;
        const tone = r.rpm > SPEED_DEMO.rpm ? "gold" : r.rpm < SPEED_DEMO.rpm ? "slate" : "success";
        return (
          <In key={i} d={900 + i * 120}>
            <Box x={tx(r.from) + 8} y={ZERO - h} w={PX_PER_MS * win - 16} h={h} r={3} tone={tone} label={win === 10 ? `${r.rpm} rpm` : undefined} mono size={12} />
            {win === 1 ? <Text x={tx(r.from) + PX_PER_MS / 2} y={ZERO - h - 9} text={String(r.rpm)} mono size={10.5} tone="heading" /> : null}
          </In>
        );
      })}
      <Fade d={shown}>
        <Stroke pts={[[36, trueY], [524, trueY]]} tone="success" width={1.6} dashed />
      </Fade>
      <Text x={530} y={trueY} text={String(SPEED_DEMO.rpm)} anchor="start" mono size={10} tone="success" d={shown} />
      <Text
        x={280}
        y={254}
        text={
          win === 1
            ? bi(`one count in 1 ms = ${TACHO_FACTS.rpmPerCount} rpm`, `عدّة واحدة في 1 ms = ${TACHO_FACTS.rpmPerCount} rpm`)
            : bi(`${readings[0].counts} counts in 10 ms = ${readings[0].rpm} rpm, once every 10 ms`, `${readings[0].counts} عدّة في 10 ms = ${readings[0].rpm} rpm، مرة كل 10 ms`)
        }
        size={11.5}
        tone={win === 1 ? "danger" : "success"}
        d={shown + 200}
      />
    </Svg>
  );
}

// ---------- DC tachometer ----------
function DcTacho({ control }: { control: string }) {
  const fast = control === "fast";
  const [cx, cy] = [112, 140];
  const box: PlotBox = { x: 290, y: 50, w: 210, h: 160, domain: [0, 2.4], range: [0, 2.4] };
  const p1 = plotAt(box, 1, 1);
  const p2 = plotAt(box, 2, 2);
  const at = fast ? p2 : p1;
  const origin = plotAt(box, 0, 0);
  return (
    <Svg>
      <Text x={112} y={30} text={bi("permanent magnets: a constant field", "مغناطيسات دائمة: مجال ثابت")} size={11} tone="heading" d={0} />
      <Fade d={100}>
        {[106, 140, 174].map((y) => (
          <Stroke key={y} pts={[[56, y], [168, y]]} tone="faint" width={1} dashed />
        ))}
      </Fade>
      <Box x={24} y={84} w={30} h={112} r={4} tone="danger" label="N" mono size={14} d={0} />
      <Box x={170} y={84} w={30} h={112} r={4} tone="slate" label="S" mono size={14} d={0} />
      <In d={100}>
        <circle cx={cx} cy={cy} r={38} className={w.under} />
        <circle cx={cx} cy={cy} r={38} className={`${w.shape} ${w.outline}`} />
      </In>
      <Spin cx={cx} cy={cy} deg={fast ? 1080 : 540} d={300} dur={2400} linear>
        <Fade d={150}>
          <rect x={cx - 12} y={cy - 32} width={24} height={64} rx={3} style={{ fill: "none", stroke: "var(--gold)", strokeWidth: 2.6 }} />
        </Fade>
      </Spin>
      <circle cx={cx} cy={cy} r={5} style={{ fill: "var(--heading)" }} />
      <Stroke pts={[[cx - 8, cy + 38], [cx - 8, 214]]} tone="navy" width={1.6} d={200} />
      <Stroke pts={[[cx + 8, cy + 38], [cx + 8, 214]]} tone="navy" width={1.6} d={200} />
      <Box x={cx - 54} y={214} w={108} h={32} r={8} tone="gold" label={fast ? "V = 2 K_t·ω" : "V = K_t·ω"} mono size={12} d={2700} />
      <Curve box={box} fn={(x) => x} axes xLabel="ω" yLabel="V" tone="navy" d={300} dur={700} />
      {[p1, p2].map((p, i) => (
        <Fade key={i} d={1000}>
          <Stroke pts={[[box.x, p[1]], p, [p[0], box.y + box.h]]} tone={(i === 1) === fast ? "gold" : "faint"} width={1.2} dashed />
        </Fade>
      ))}
      <Text x={p1[0]} y={224} text="ω" mono size={11} tone="heading" d={1000} />
      <Text x={p2[0]} y={224} text="2ω" mono size={11} tone="heading" d={1000} />
      <Text x={box.x - 6} y={p1[1]} text="K_t·ω" anchor="end" mono size={10} tone="heading" d={1000} />
      <Text x={box.x - 6} y={p2[1]} text="2 K_t·ω" anchor="end" mono size={10} tone="heading" d={1000} />
      <Text x={432} y={190} text={bi("slope K_t", "الميل K_t")} size={11} tone="muted" d={1100} />
      <Token pts={[origin, at]} d={1200} dur={1400} />
      <Chip x={400} y={262} text={fast ? bi("double the speed, double the voltage", "ضاعِف السرعة يتضاعف الجهد") : bi("voltage proportional to speed", "الجهد يتناسب مع السرعة")} tone="gold" center d={2700} />
    </Svg>
  );
}

// ---------- DC or AC ----------
function Ripple({ control }: { control: string }) {
  const ac = control === "ac";
  const [cx, cy] = [80, 126];
  const box: PlotBox = ac ? { x: 190, y: 46, w: 330, h: 164, domain: [0, 10], range: [-1.3, 1.3] } : { x: 190, y: 46, w: 330, h: 164, domain: [0, 10], range: [0, 1.3] };
  const level = plotAt(box, 0, 1)[1];
  return (
    <Svg>
      <Spin cx={cx} cy={cy} deg={360} d={200} dur={3200} linear>
        <Fade d={0}>
          {ac ? (
            <>
              <circle cx={cx} cy={cy} r={36} style={{ fill: "var(--slate-soft)", stroke: "var(--slate)", strokeWidth: 1.5 }} />
              <path d={`M${cx - 36},${cy} H${cx + 36}`} style={{ stroke: "var(--slate)", strokeWidth: 1.5 }} />
            </>
          ) : (
            Array.from({ length: 8 }, (_, k) => <Wedge key={k} cx={cx} cy={cy} r0={18} r1={36} a0={k * 45 + 3} a1={k * 45 + 42} fill={k % 2 ? "var(--gold-soft)" : "var(--gold)"} stroke="var(--gold-text)" />)
          )}
        </Fade>
      </Spin>
      <Text x={cx} y={186} text={ac ? bi("AC tachometer", "مقياس سرعة متردد") : bi("commutator", "المبدِّل")} size={11} tone="heading" d={200} />
      {ac ? (
        <>
          <Fade d={300}>
            <Stroke pts={[[box.x, plotAt(box, 0, 0)[1]], [box.x + box.w, plotAt(box, 0, 0)[1]]]} tone="faint" width={1} dashed />
          </Fade>
          <Curve box={box} fn={(t) => Math.sin(2.6 * t)} axes xLabel="t" yLabel="V" tone="navy" d={300} dur={1400} samples={200} />
          <Text x={box.x + box.w} y={level - 32} text={bi("an alternating output", "خرج متردد")} anchor="end" size={11} tone="muted" d={1600} />
        </>
      ) : (
        <>
          <Fade d={300}>
            <Stroke pts={[[box.x, level], [box.x + box.w, level]]} tone="gold" width={1.2} dashed />
          </Fade>
          <Text x={box.x + box.w} y={level - 22} text="K_t·ω" anchor="end" mono size={11} tone="gold" d={400} />
          <Curve box={box} fn={(t) => 0.93 + 0.07 * Math.abs(Math.sin(3 * t))} axes xLabel="t" yLabel="V" tone="navy" d={300} dur={1400} samples={300} />
          <Text x={355} y={128} text={bi("a slight ripple, never fully filtered out", "تموّج طفيف لا يُرشَّح بالكامل")} size={11} tone="muted" d={1600} />
        </>
      )}
      <Chip
        x={355}
        y={256}
        text={ac ? bi("avoids the commutator ripple", "يتجنب تموّج المبدِّل") : bi("simpler, so robots usually use DC", "أبسط، لذا تستخدم الروبوتات النوع المستمر عادةً")}
        tone={ac ? "success" : "slate"}
        center
        d={1800}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof tachometer>>({
  "from-pulses": FromPulses,
  "dc-tacho": DcTacho,
  ripple: Ripple,
});
