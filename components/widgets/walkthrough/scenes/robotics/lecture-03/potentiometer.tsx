"use client";

import type { potentiometer } from "@/lib/walkthroughs/robotics/lecture-03";
import { ADC_MAX, POT_STEP, SUPPLY, THETA_MAX, adc, angleOf, potV, show } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Curve, In, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, ArcPath, Glide, Node, Resistor, Turn, polar } from "./local";
import w from "../../../../Walkthrough.module.css";

/** The track sweeps from −135° to +135° (clockwise from straight up): 270° of travel. */
const START = -THETA_MAX / 2;

/** A rotary pot seen from the front: the track, its two ends and a wiper turned to `theta`. */
function Dial({ cx, cy, r, theta, at = 400, labels = true, d = 0 }: { cx: number; cy: number; r: number; theta: number; at?: number; labels?: boolean; d?: number }) {
  const [lx, ly] = polar(cx, cy, r, START);
  const [rx, ry] = polar(cx, cy, r, -START);
  return (
    <>
      <ArcPath cx={cx} cy={cy} r={r} a0={START} a1={-START} tone="slate" width={8} d={d} dur={700} />
      <Node x={lx} y={ly} r={5} d={d + 300} />
      <Node x={rx} y={ry} r={5} d={d + 300} />
      {labels ? (
        <>
          <Text x={lx - 12} y={ly + 22} text={bi("left end · 0 V", "الطرف الأيسر · 0 V")} size={10.5} tone="muted" d={d + 300} />
          <Text x={rx + 12} y={ry + 22} text={bi(`right end · ${SUPPLY} V`, `الطرف الأيمن · ${SUPPLY} V`)} size={10.5} tone="muted" d={d + 300} />
        </>
      ) : null}
      <Turn cx={cx} cy={cy} from={START} to={START + theta} at={at} dur={900}>
        <In d={d + 200}>
          <path d={`M${cx},${cy} L${cx},${cy - r + 4}`} className={`${w.line} ${w.gold}`} style={{ strokeWidth: 4 }} />
          <circle cx={cx} cy={cy - r + 4} r={5} style={{ fill: "var(--gold)" }} />
        </In>
      </Turn>
      <In d={d + 200}>
        <circle cx={cx} cy={cy} r={13} className={w.under} />
        <circle cx={cx} cy={cy} r={13} className={`${w.shape} ${w.navy}`} />
      </In>
    </>
  );
}

/** The circuit symbol of slide 45: a resistor with a wiper arrow at fraction f of its length. */
function Symbol({ x, y, len, f, d = 0 }: { x: number; y: number; len: number; f: number; d?: number }) {
  return (
    <>
      <Text x={x + len / 2} y={y - 64} text={bi("circuit symbol (slide 45)", "رمز الدائرة (الشريحة 45)")} tone="heading" size={11.5} d={d} />
      <Resistor x={x} y={y} len={len} horizontal wiper={f} d={d + 100} />
      <Node x={x} y={y} d={d + 200} />
      <Node x={x + len} y={y} d={d + 200} />
      <Text x={x} y={y - 22} text="0 V" mono size={11} tone="muted" d={d + 300} />
      <Text x={x + len} y={y - 22} text={`${SUPPLY} V`} mono size={11} tone="muted" d={d + 300} />
      <Text x={x + len * f} y={y + 46} text={bi(`wiper ≈ ${show(SUPPLY * f)} V`, `الماسحة ≈ ${show(SUPPLY * f)} V`)} size={11} tone="gold" d={d + 600} />
    </>
  );
}

function Track({ control }: { control: string }) {
  const linear = control === "linear";
  const theta = 180;
  const f = theta / THETA_MAX;
  return (
    <Svg>
      {linear ? (
        <>
          <Text x={160} y={30} text={bi("Linear pot: a slider on a straight track", "مقياس جهد خطي: منزلق على مسار مستقيم")} tone="heading" size={11.5} d={0} />
          <Box x={50} y={132} w={220} h={14} r={4} tone="slate" d={100} />
          <Node x={50} y={139} r={5} d={200} />
          <Node x={270} y={139} r={5} d={200} />
          <Text x={50} y={168} text={bi("end · 0 V", "طرف · 0 V")} size={10.5} tone="muted" d={300} />
          <Text x={270} y={168} text={bi(`end · ${SUPPLY} V`, `طرف · ${SUPPLY} V`)} size={10.5} tone="muted" d={300} />
          <Glide stops={[[0, 0], [220 * f, 0]]} at={[500]} move={900}>
            <Box x={40} y={116} w={20} h={46} r={4} tone="gold" d={200} />
          </Glide>
          <Text x={50 + 220 * f} y={90} text={bi("wiper", "الماسحة")} size={10.5} tone="gold" d={1400} />
        </>
      ) : (
        <>
          <Text x={150} y={30} text={bi("Rotary pot: a wiper on a 270° arc", "مقياس جهد دوّار: ماسحة على قوس 270°")} tone="heading" size={11.5} d={0} />
          <Dial cx={150} cy={140} r={70} theta={theta} />
          <Text x={222} y={70} text={bi("wiper", "الماسحة")} anchor="start" size={10.5} tone="gold" d={1300} />
        </>
      )}
      <Symbol x={330} y={150} len={180} f={f} d={300} />
      <Chip x={420} y={250} text={`V = ${SUPPLY} V × ${theta}/${THETA_MAX} ≈ ${show(potV(theta))} V`} tone="gold" center d={1500} />
    </Svg>
  );
}

function Angle({ control }: { control: string }) {
  const theta = Number(control.replace(/^a/, "")) || 0;
  const v = potV(theta);
  const plot: PlotBox = { x: 276, y: 54, w: 236, h: 146, domain: [0, THETA_MAX], range: [0, SUPPLY] };
  const [px, py] = plotAt(plot, theta, v);
  const [, y0] = plotAt(plot, 0, 0);
  return (
    <Svg>
      <Dial cx={112} cy={128} r={60} theta={theta} labels={false} />
      <Text x={112} y={206} text={`θ = ${theta}°`} mono size={13} tone="heading" weight={700} d={300} />
      <Chip x={112} y={242} text={`analogRead ≈ ${adc(v)}`} tone="outline" center d={1500} />
      <Curve box={plot} axes points={[[0, 0], [THETA_MAX, SUPPLY]]} tone="gold" yLabel="V_wiper (V)" d={200} dur={700} />
      {[0, 90, 180, 270].map((t) => (
        <Text key={t} x={plotAt(plot, t, 0)[0]} y={y0 + 13} text={String(t)} mono size={10} tone="muted" d={300} />
      ))}
      {[0, SUPPLY / 2, SUPPLY].map((t) => (
        <Text key={t} x={plot.x - 8} y={plotAt(plot, 0, t)[1]} text={String(t)} anchor="end" mono size={10} tone="muted" d={300} />
      ))}
      <Text x={394} y={236} text={bi("shaft angle θ (degrees)", "زاوية العمود θ (بالدرجات)")} size={10.5} tone="muted" d={300} />
      <Arrow pts={[[px, y0], [px, py]]} tone="slate" dashed head={false} d={1100} />
      <Arrow pts={[[plot.x, py], [px, py]]} tone="slate" dashed head={false} d={1100} />
      <Box x={px - 6} y={py - 6} w={12} h={12} r={6} tone="gold" d={1300} />
      {theta > 0 ? <Text x={px - 10} y={py - 16} text={`${show(v)} V`} anchor="end" mono size={12} tone="gold" weight={700} d={1400} /> : null}
    </Svg>
  );
}

function Resolution() {
  const theta = 180;
  const v = potV(theta);
  const count = adc(v);
  const steps: { label: ReturnType<typeof bi> | string; sub: string }[] = [
    { label: bi("shaft", "العمود"), sub: `${theta}°` },
    { label: bi("wiper", "الماسحة"), sub: `${show(v)} V` },
    { label: "analogRead", sub: String(count) },
    { label: bi("software", "البرنامج"), sub: `× ${THETA_MAX} / ${ADC_MAX}` },
    { label: bi("angle", "الزاوية"), sub: `${show(angleOf(count), 1)}°` },
  ];
  const plot: PlotBox = { x: 66, y: 146, w: 290, h: 92, domain: [0, 6], range: [0, 6] };
  const stair: [number, number][] = [];
  for (let n = 0; n < 6; n++) stair.push([n, n], [n + 1, n]);
  stair.push([6, 6]);
  return (
    <Svg>
      {steps.map((s, i) => {
        const x = 10 + i * 112;
        return (
          <g key={i}>
            <Box x={x} y={34} w={94} h={58} r={8} tone={i === 4 ? "gold" : i === 2 ? "navy" : "outline"} label={s.label} sub={s.sub} size={11.5} subSize={11} mono={typeof s.label === "string"} d={i * 250} />
            {i < 4 ? <Arrow pts={[[x + 95, 63], [x + 111, 63]]} tone="gold" d={i * 250 + 150} dur={150} /> : null}
          </g>
        );
      })}
      <Curve box={plot} axes points={[[0, 0], [6, 6]]} tone="faint" dashed d={1400} xLabel={bi("true angle, in counts", "الزاوية الفعلية بالعدّات")} yLabel={bi("angle from the count", "الزاوية من العدد")} />
      <Curve box={plot} points={stair} tone="gold" d={1600} dur={900} />
      <Chip x={470} y={168} text={bi(`1 count ≈ ${show(POT_STEP)}°`, `العدد الواحد ≈ ${show(POT_STEP)}°`)} tone="gold" center d={2600} />
      <Chip x={470} y={226} text={bi("wiper wears → noisy", "تآكل الماسحة ← ضوضاء")} tone="muted" center d={2800} />
    </Svg>
  );
}

function Servo() {
  const dial = { cx: 446, cy: 186, r: 34 };
  return (
    <Svg>
      <Box x={14} y={40} w={110} h={64} r={8} tone="gold" label={bi("command", "الأمر")} sub="90°" size={12} subSize={11.5} d={0} />
      <Box x={150} y={40} w={120} h={64} r={8} tone="navy" label={bi("control circuit", "دائرة التحكم")} sub={bi("compares", "تقارن")} size={11.5} subSize={10} d={200} />
      <Box x={296} y={40} w={80} h={64} r={8} tone="outline" label={bi("motor", "المحرك")} size={12} d={400} />
      <Box x={406} y={40} w={80} h={64} r={8} tone="outline" label={bi("gears", "التروس")} size={12} d={600} />
      <Arrow pts={[[125, 72], [148, 72]]} tone="gold" d={300} dur={150} />
      <Arrow pts={[[271, 72], [294, 72]]} tone="gold" d={500} dur={150} />
      <Arrow pts={[[377, 72], [404, 72]]} tone="gold" d={700} dur={150} />
      <Arrow pts={[[446, 105], [446, 150]]} tone="gold" d={800} dur={250} />
      <In d={900}>
        <circle cx={dial.cx} cy={dial.cy} r={dial.r} className={w.under} />
        <circle cx={dial.cx} cy={dial.cy} r={dial.r} className={`${w.shape} ${w.outline}`} />
      </In>
      <Arrow pts={[[dial.cx, dial.cy], polar(dial.cx, dial.cy, dial.r + 8, 90)]} tone="danger" dashed head={false} d={1000} />
      <Text x={dial.cx + dial.r + 12} y={dial.cy - 12} text="90°" anchor="start" mono size={10.5} tone="danger" d={1000} />
      <Turn cx={dial.cx} cy={dial.cy} from={20} to={90} at={1400} dur={1600}>
        <In d={950}>
          <path d={`M${dial.cx},${dial.cy} L${dial.cx},${dial.cy - dial.r + 5}`} className={`${w.line} ${w.navy}`} style={{ strokeWidth: 4 }} />
        </In>
      </Turn>
      <Text x={dial.cx} y={236} text={bi("output shaft", "عمود الخرج")} size={10.5} tone="muted" d={900} />
      <Box x={230} y={158} w={120} h={64} r={8} tone="slate" label={bi("potentiometer", "مقياس الجهد")} sub={bi("actual angle", "الزاوية الفعلية")} size={11} subSize={10} d={1000} />
      <Arrow pts={[[dial.cx - dial.r - 2, dial.cy], [352, dial.cy]]} tone="slate" d={1100} dur={250} />
      <Arrow pts={[[290, 156], [290, 130], [210, 130], [210, 106]]} tone="gold" d={1300} dur={500} />
      <Text x={300} y={130} text={bi("feedback", "التغذية الراجعة")} anchor="start" size={10.5} tone="gold" d={1500} />
      <Chip x={112} y={170} text={bi("error = command − actual", "الخطأ = المطلوب − الفعلي")} tone="outline" center d={1700} />
      <Chip x={112} y={232} text={bi("turns until the error is 0", "يدور حتى يصبح الخطأ 0")} tone="success" center d={3000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof potentiometer>>({
  track: Track,
  angle: Angle,
  resolution: Resolution,
  servo: Servo,
});
