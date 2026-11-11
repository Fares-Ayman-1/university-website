"use client";

import type { sonar } from "@/lib/walkthroughs/robotics/lecture-04";
import { RING, SONAR_FACTS, SOUND, echoDistance, fixed, readingAt, ringCone, soundSpeed } from "@/lib/widgets/rob-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Mark, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import w from "../../../../Walkthrough.module.css";
import { Dot, Poly, Sensor, Stroke, Travel, Wall, Wedge, arc, polar } from "./local";

/** Three wavefront arcs around (0, 0), bulging right (outgoing) or left (an echo). */
function Wavefront({ back, tone = "gold" }: { back?: boolean; tone?: "gold" | "slate" }) {
  return (
    <>
      {[0, 1, 2].map((k) => (
        <Stroke key={k} pts={back ? arc(18 + 7 * k, 0, 18, 140, 220, 8) : arc(-18 - 7 * k, 0, 18, -40, 40, 8)} tone={tone} width={2.4 - k * 0.5} />
      ))}
    </>
  );
}

// ---------- Ping and echo ----------
function Ping({ control }: { control: string }) {
  const tText = control === "t6" ? "0.006" : "0.0117";
  const t = Number(tText);
  const d = echoDistance(t);
  const face = 60;
  const wallX = face + d * 200;
  const y = 130;
  const out = 500;
  const leg = 1100;
  const done = out + 2 * leg + 100;
  return (
    <Svg>
      <Sensor x={26} y={112} w={34} h={36} label={bi("sonar", "السونار")} d={0} />
      <Poly pts={[[face, 124], [wallX, 96], [wallX, 164], [face, 136]]} fill="var(--slate-soft)" opacity={0.7} d={200} />
      <Wall x={wallX} y={56} w={16} h={150} d={0} />
      <Text x={wallX + 8} y={30} text={bi("obstacle", "العائق")} size={11} tone="heading" d={0} />
      <Travel pts={[[face + 4, y], [wallX - 4, y]]} d={out} dur={leg} vanish linear>
        <Wavefront />
      </Travel>
      <Travel pts={[[wallX - 4, y], [face + 4, y]]} d={out + leg} dur={leg} vanish linear>
        <Wavefront back tone="slate" />
      </Travel>
      <Arrow pts={[[face + 4, 88], [wallX - 4, 88]]} tone="gold" d={out} dur={leg} />
      <Arrow pts={[[wallX - 4, 186], [face + 4, 186]]} tone="slate" d={out + leg} dur={leg} />
      <Text x={(face + wallX) / 2} y={62} text={bi("there and back: 2d", "ذهابًا وإيابًا: 2d")} size={11} tone="muted" d={out} />
      <Arrow pts={[[face, 222], [wallX, 222]]} tone="muted" both d={done} dur={400} />
      <Text x={(face + wallX) / 2} y={210} text="d" mono size={13} tone="heading" d={done} />
      <Chip x={(face + wallX) / 2} y={28} text={`t = ${fixed(t * 1000, t < 0.01 ? 0 : 1)} ms`} tone="navy" center d={done - 100} />
      <Text x={280} y={254} text={`d = ${SOUND} × ${tText} / 2 = ${fixed(d, 2)} m`} mono size={13} tone="gold" d={done + 200} />
    </Svg>
  );
}

// ---------- Repeat rate and the ring ----------
function Ring({ control }: { control: string }) {
  const ring = control === "ring";
  const [cx, cy, r] = [120, 146, 56];
  const cone = ringCone(RING.sensors);
  const tx = (t: number, span: number) => 272 + (t / span) * 256;
  return (
    <Svg>
      <In d={0}>
        <circle cx={cx} cy={cy} r={r} className={w.under} />
        <circle cx={cx} cy={cy} r={r} className={`${w.shape} ${w.outline}`} />
      </In>
      <Text x={cx} y={cy} text={bi("robot", "الروبوت")} size={11.5} tone="heading" d={0} />
      {Array.from({ length: RING.sensors }, (_, k) => {
        const a = -90 + k * cone;
        const lit = ring || k === 0;
        return (
          <g key={k}>
            {lit ? <Wedge cx={cx} cy={cy} r0={r + 8} r1={r + (k === 0 ? 62 : 44)} a0={a - cone / 2} a1={a + cone / 2} fill={k === 0 ? "var(--gold)" : "var(--slate)"} stroke="var(--surface)" opacity={k === 0 ? 0.55 : 0.35} d={ring ? 300 + k * 70 : 300} /> : null}
            <Dot at={polar(cx, cy, r + 4, a)} r={3.2} tone="navy" d={100} />
          </g>
        );
      })}
      <Text x={cx} y={polar(cx, cy, r + 74, -90)[1]} text={`${cone}°`} mono size={11} tone="gold" d={400} />
      {ring ? (
        <>
          <Text x={400} y={32} text={bi(`${RING.sensors} sensors, one after another`, `${RING.sensors} مستشعرًا، واحدًا تلو الآخر`)} size={12} tone="heading" d={0} />
          <Arrow pts={[[268, 124], [534, 124]]} tone="faint" d={100} dur={300} />
          {Array.from({ length: RING.sensors }, (_, k) => (
            <Stroke key={k} pts={[[tx(k * 0.05, 1.2), 124], [tx(k * 0.05, 1.2), 104]]} tone={k === 0 ? "gold" : "navy"} width={2} d={300 + k * 70} />
          ))}
          {[0, 0.6, 1.2].map((t) => (
            <Text key={t} x={tx(t, 1.2)} y={138} text={t === 1.2 ? "1.2 s" : String(t)} mono size={10} tone="muted" d={200} />
          ))}
          <Text x={400} y={178} text={`${RING.sensors} × 50 ms = ${SONAR_FACTS.scan} s`} mono size={13} tone="gold" d={300 + RING.sensors * 70} />
          <Chip x={400} y={222} text={bi("too slow: fire groups that don't overlap", "بطيء جدًا: أطلِق مجموعات لا تتداخل")} tone="danger" center d={500 + RING.sensors * 70} />
        </>
      ) : (
        <>
          <Text x={400} y={32} text={bi(`one sensor, ${RING.rate} pings a second`, `مستشعر واحد، ${RING.rate} نبضة في الثانية`)} size={12} tone="heading" d={0} />
          <Arrow pts={[[268, 124], [534, 124]]} tone="faint" d={100} dur={300} />
          {[0, 1, 2, 3].map((k) => (
            <Box key={k} x={tx(k * 50, 200) + 3} y={106} w={58} h={18} r={3} tone="slate" label={k === 0 ? "50 ms" : undefined} size={10} mono d={500 + k * 250} />
          ))}
          {[0, 50, 100, 150, 200].map((t, k) => (
            <g key={t}>
              <Stroke pts={[[tx(t, 200), 124], [tx(t, 200), 96]]} tone="navy" width={2.4} d={400 + k * 250} />
              <Text x={tx(t, 200)} y={138} text={t === 200 ? "200 ms" : String(t)} mono size={10} tone="muted" d={200} />
            </g>
          ))}
          <Text x={400} y={70} text={bi("ping", "نبضة")} size={10.5} tone="muted" d={400} />
          <Text x={400} y={178} text={`${SOUND} × 0.05 / 2 ≈ ${SONAR_FACTS.maxRange} m`} mono size={13} tone="gold" d={1600} />
          <Chip x={400} y={222} text={bi("the longest range it can read unambiguously", "أطول مدى يقرؤه دون التباس")} tone="slate" center d={1800} />
        </>
      )}
    </Svg>
  );
}

// ---------- When the echo misleads ----------
function Specular() {
  const hit: Pt = [341.4, 130];
  const away: Pt = [hit[0] - 0.507 * 132, hit[1] + 0.861 * 132];
  return (
    <>
      <Sensor x={26} y={112} w={34} h={36} d={0} />
      <Stroke pts={[[290, 40], [410, 250]]} tone="slate" width={8} cap="butt" d={0} />
      <Text x={362} y={30} text={bi("smooth wall", "جدار أملس")} size={11} tone="heading" d={0} />
      <Arrow pts={[[62, 130], hit]} tone="gold" d={300} dur={800} />
      <Arrow pts={[hit, away]} tone="gold" d={1100} dur={700} />
      <Text x={382} y={152} text={bi("oblique hit", "اصطدام مائل")} anchor="start" size={11} tone="muted" d={1000} />
      <Text x={196} y={256} text={bi("the echo bounces away", "يرتد الصدى بعيدًا")} size={11} tone="muted" d={1700} />
      <Mark x={43} y={92} ok={false} d={1900} />
      <Chip x={140} y={200} text={bi("no echo: wall not detected", "لا صدى: الجدار غير مكتشَف")} tone="danger" center d={2000} />
    </>
  );
}

function Virtual() {
  const hit: Pt = [300, 130];
  const objTop = 216;
  const path = hit[0] - 62 + (objTop - hit[1]);
  const ov: Pt = [62 + path + 14, 130];
  return (
    <>
      <Sensor x={26} y={112} w={34} h={36} d={0} />
      <Stroke pts={[[235, 65], [365, 195]]} tone="slate" width={8} cap="butt" d={0} />
      <Text x={372} y={204} text={bi("smooth wall", "جدار أملس")} anchor="start" size={11} tone="heading" d={0} />
      <Arrow pts={[[62, 130], hit]} tone="gold" d={300} dur={700} />
      <Arrow pts={[hit, [300, objTop - 2]]} tone="gold" d={1000} dur={400} />
      <In d={0}>
        <circle cx={300} cy={objTop + 14} r={14} className={`${w.shape} ${w.navy}`} />
      </In>
      <Text x={324} y={244} text={bi("O: real object", "O: الجسم الحقيقي")} anchor="start" size={11} tone="heading" d={0} />
      <Fade d={1600}>
        <Stroke pts={[hit, [ov[0] - 16, 130]]} tone="danger" width={1.8} dashed />
        <circle cx={ov[0]} cy={ov[1]} r={14} style={{ fill: "var(--danger-soft)", stroke: "var(--danger)", strokeWidth: 2, strokeDasharray: "4 3" }} />
      </Fade>
      <Text x={ov[0]} y={84} text={bi("Ov: virtual object", "Ov: جسم وهمي")} size={11} tone="danger" d={1700} />
      <Chip x={150} y={200} text={bi("reported further away than it is", "يُبلغ عنه أبعد مما هو")} tone="danger" center d={1900} />
    </>
  );
}

function Crosstalk() {
  const wallX = 470;
  const bounce: Pt = [wallX - 2, 140];
  return (
    <>
      <Box x={26} y={62} w={34} h={34} r={5} tone="navy" label="1" mono d={0} />
      <Box x={26} y={172} w={34} h={34} r={5} tone="navy" label="2" mono d={0} />
      <Wall x={wallX} y={40} w={16} h={200} d={0} />
      <Text x={wallX + 8} y={18} text={bi("wall", "الجدار")} size={11} tone="heading" d={0} />
      <Arrow pts={[[62, 79], bounce]} tone="gold" d={300} dur={900} />
      <Arrow pts={[bounce, [64, 189]]} tone="gold" d={1200} dur={900} />
      <Text x={300} y={196} text={bi("sensor 1's echo reaches sensor 2", "صدى المستشعر 1 يصل إلى المستشعر 2")} size={11} tone="gold" d={1500} />
      <Fade d={2100}>
        <rect x={150} y={170} width={34} height={38} rx={4} style={{ fill: "var(--danger-soft)", stroke: "var(--danger)", strokeWidth: 2, strokeDasharray: "4 3", fillOpacity: 0.6 }} />
      </Fade>
      <Text x={167} y={232} text={bi("sensor 2 reads an obstacle here", "المستشعر 2 يقرأ عائقًا هنا")} size={11} tone="danger" d={2200} />
    </>
  );
}

function Failures({ control }: { control: string }) {
  return <Svg>{control === "virtual" ? <Virtual /> : control === "crosstalk" ? <Crosstalk /> : <Specular />}</Svg>;
}

// ---------- Temperature ----------
function Temperature({ control }: { control: string }) {
  const hot = control === "c40";
  const celsius = hot ? 40 : 20;
  const v = soundSpeed(celsius);
  const reads = readingAt(2, celsius);
  const scale = 170;
  const face = 100;
  const wallX = face + 2 * scale;
  const readX = face + reads * scale;
  const level = hot ? 96 : 160;
  return (
    <Svg>
      <In d={0}>
        <rect x={28} y={58} width={12} height={168} rx={6} className={`${w.shape} ${w.outline}`} />
        <circle cx={34} cy={232} r={13} className={`${w.shape} ${hot ? w.danger : w.slate}`} />
      </In>
      <Fade d={300}>
        <rect x={31} y={level} width={6} height={232 - level} style={{ fill: hot ? "var(--danger)" : "var(--slate)" }} />
      </Fade>
      <Text x={34} y={42} text={`${celsius} °C`} mono size={12} tone={hot ? "danger" : "heading"} d={300} />
      <Sensor x={66} y={112} w={34} h={36} d={0} />
      <Wall x={wallX} y={60} w={16} h={140} d={0} />
      <Text x={wallX + 8} y={32} text={bi("wall at 2.00 m", "جدار على بُعد 2.00 m")} size={11} tone="heading" d={0} />
      <Travel pts={[[face + 4, 130], [wallX - 4, 130]]} d={500} dur={hot ? 960 : 1000} vanish linear>
        <Wavefront />
      </Travel>
      <Travel pts={[[wallX - 4, 130], [face + 4, 130]]} d={hot ? 1460 : 1500} dur={hot ? 960 : 1000} vanish linear>
        <Wavefront back tone="slate" />
      </Travel>
      <Text x={270} y={86} text={bi(`sound travels at ${v} m/s`, `ينتقل الصوت بسرعة ${v} m/s`)} size={11.5} tone={hot ? "danger" : "gold"} d={400} />
      <Text x={270} y={176} text={bi(`the sensor assumes ${SOUND} m/s`, `يفترض المستشعر ${SOUND} m/s`)} size={11} tone="muted" d={600} />
      <Fade d={2700}>
        <Stroke pts={[[wallX, 206], [wallX, 226]]} tone="navy" width={2} />
        <Stroke pts={[[readX, 206], [readX, 226]]} tone={hot ? "danger" : "success"} width={2.4} />
        <Dot at={[readX, 216]} r={4} tone={hot ? "danger" : "success"} />
      </Fade>
      {hot ? (
        <>
          <Text x={readX - 8} y={244} text={bi(`reads ${fixed(reads, 2)} m`, `يقرأ ${fixed(reads, 2)} m`)} anchor="end" size={11} tone="danger" d={2800} />
          <Text x={wallX + 6} y={244} text={bi("true 2.00 m", "الحقيقي 2.00 m")} anchor="start" size={11} tone="heading" d={2800} />
        </>
      ) : (
        <Text x={wallX} y={244} text={bi("reads 2.00 m", "يقرأ 2.00 m")} size={11} tone="success" d={2800} />
      )}
      <Text x={220} y={262} text={`${SOUND} / ${v} × 2.00 = ${fixed(reads, 2)} m`} mono size={12} tone={hot ? "danger" : "gold"} d={3000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof sonar>>({
  ping: Ping,
  ring: Ring,
  failures: Failures,
  temperature: Temperature,
});
