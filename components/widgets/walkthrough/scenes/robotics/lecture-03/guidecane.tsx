"use client";

import type { guideCane } from "@/lib/walkthroughs/robotics/lecture-03";
import { CLEAR_M, MAX_M, SONAR_DEG, SONAR_READINGS, steer, type Scenario } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import type { Bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Fade, In, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, ArcPath, polar } from "./local";
import w from "../../../../Walkthrough.module.css";

/** A line with the stroke classes of a tone (for figures drawn from plain paths). */
const stroke = (tone: "navy" | "slate" | "gold" | "faint" | "success", width = 3) => ({ className: `${w.line} ${w[tone]}`, style: { strokeWidth: width } });

function Device() {
  const fan = [-60, -30, 0, 30, 60];
  const top = { cx: 440, cy: 200, r: 75 };
  return (
    <Svg>
      <Arrow pts={[[14, 232], [330, 232]]} tone="faint" head={false} d={0} dur={300} />
      <In d={0}>
        <circle cx={66} cy={64} r={12} className={w.under} />
        <circle cx={66} cy={64} r={12} className={`${w.shape} ${w.slate}`} />
        <path d="M66,76 V160 M66,160 L50,230 M66,160 L82,230 M66,98 L104,124" {...stroke("slate")} />
      </In>
      <In d={200}>
        <path d="M104,124 L248,196" {...stroke("navy")} />
        <circle cx={104} cy={117} r={5} style={{ fill: "var(--gold)" }} />
      </In>
      <Text x={116} y={104} text={bi("joystick", "عصا التحكم")} anchor="start" size={10.5} tone="gold" d={300} />
      <Text x={160} y={194} text={bi("cane", "العصا")} size={10.5} tone="muted" d={300} />
      <Box x={236} y={186} w={60} h={30} r={6} tone="slate" d={300} />
      {[250, 282].map((cx) => (
        <In key={cx} d={350}>
          <circle cx={cx} cy={222} r={9} className={w.under} />
          <circle cx={cx} cy={222} r={9} className={`${w.shape} ${w.navy}`} />
        </In>
      ))}
      {[60, 90, 120].map((a, i) => (
        <Arrow key={a} pts={[polar(296, 200, 4, a), polar(296, 200, 34, a)]} tone="gold" head={false} d={600 + i * 100} dur={200} width={2.2} />
      ))}
      <Text x={266} y={252} text={bi("sensor head", "رأس الاستشعار")} size={10.5} tone="heading" d={400} />
      <Text x={440} y={24} text={bi("Sensor head, from above", "رأس الاستشعار من أعلى")} tone="heading" size={12} d={500} />
      <In d={600}>
        <path d={`M${top.cx - top.r},${top.cy} A${top.r},${top.r} 0 0 1 ${top.cx + top.r},${top.cy} Z`} className={w.under} />
        <path d={`M${top.cx - top.r},${top.cy} A${top.r},${top.r} 0 0 1 ${top.cx + top.r},${top.cy} Z`} className={`${w.shape} ${w.slate}`} />
      </In>
      <Box x={352} y={150} w={12} h={82} r={3} tone="navy" d={700} />
      <Box x={516} y={150} w={12} h={82} r={3} tone="navy" d={700} />
      <Box x={410} y={164} w={60} h={30} r={5} tone="navy" label={bi("servo", "سيرفو")} size={10.5} d={800} />
      {fan.map((a, i) => {
        const [x, y] = polar(top.cx, top.cy, top.r - 2, a);
        return (
          <g key={a}>
            <In d={900 + i * 80}>
              <circle cx={x} cy={y} r={6} style={{ fill: "var(--gold)" }} />
            </In>
            <Arrow pts={[polar(top.cx, top.cy, top.r + 6, a), polar(top.cx, top.cy, top.r + 24, a)]} tone="gold" head={false} d={1000 + i * 80} dur={200} />
          </g>
        );
      })}
      <Text x={440} y={78} text={bi("ultrasonic sensors in a fan", "مستشعرات فوق صوتية في شكل مروحة")} size={10.5} tone="gold" d={1300} />
      <Text x={440} y={252} text={bi("guide wheels", "عجلات التوجيه")} size={10.5} tone="heading" d={1300} />
    </Svg>
  );
}

const PATH: Pt[] = [
  [150, 248],
  [150, 186],
  [162, 156],
  [206, 132],
  [212, 96],
  [178, 62],
  [150, 40],
];

const STEPS: { label: Bi; sub: Bi }[] = [
  { label: bi("1 · Sonar sees an obstacle", "1 · السونار يرى عائقًا"), sub: bi("sense", "استشعار") },
  { label: bi("2 · Servo steers the wheels", "2 · السيرفو يوجّه العجلات"), sub: bi("decide and act", "قرار وفعل") },
  { label: bi("3 · User feels it, follows", "3 · المستخدم يشعر ويتبع"), sub: bi("the human closes the loop", "الإنسان يُغلق الحلقة") },
];

function Loop() {
  return (
    <Svg>
      <Text x={40} y={20} text={bi("top view", "منظر علوي")} anchor="start" size={10.5} tone="muted" d={0} />
      <Box x={112} y={92} w={70} h={36} r={14} tone="danger" label={bi("obstacle", "عائق")} size={10.5} d={0} />
      <Arrow pts={PATH} tone="faint" dashed head={false} d={200} />
      <Fade d={700}>
        {[-20, 0, 20].map((a) => (
          <path key={a} d={`M150,186 L${polar(150, 186, 56, a).join(",")}`} className={`${w.line} ${w.gold} ${w.dashed}`} />
        ))}
      </Fade>
      <Token pts={PATH.slice(1)} d={800} dur={2400} r={7} />
      <Token pts={PATH.slice(0, -1)} d={1300} dur={2400} r={6} tone="navy" />
      <Text x={162} y={252} text={bi("user", "المستخدم")} anchor="start" size={10.5} tone="heading" d={300} />
      <Text x={162} y={210} text={bi("sensor head", "رأس الاستشعار")} anchor="start" size={10.5} tone="gold" d={300} />
      {STEPS.map((s, i) => {
        const y = 26 + i * 80;
        return (
          <g key={i}>
            <Box x={318} y={y} w={214} h={64} r={8} tone={i === 2 ? "gold" : "outline"} label={s.label} sub={s.sub} size={11} subSize={10} d={700 + i * 800} />
            {i < 2 ? <Arrow pts={[[425, y + 65], [425, y + 79]]} tone="gold" d={1100 + i * 800} dur={150} /> : null}
          </g>
        );
      })}
      <Arrow pts={[[533, 218], [550, 218], [550, 58], [535, 58]]} tone="gold" d={3000} dur={600} />
    </Svg>
  );
}

const SCENARIO_LINE: Record<Scenario, Bi> = {
  clear: bi("keep straight on", "تابع مستقيمًا"),
  left: bi("steer right 30°", "انعطف يمينًا 30°"),
  right: bi("steer left 30°", "انعطف يسارًا 30°"),
};

function Fan({ control }: { control: string }) {
  const sc: Scenario = control === "left" || control === "right" ? control : "clear";
  const readings = SONAR_READINGS[sc];
  const dir = steer(readings);
  const o: Pt = [250, 232];
  const px = 56;
  const chosen = SONAR_DEG.indexOf(dir as (typeof SONAR_DEG)[number]);
  return (
    <Svg>
      {sc !== "clear" ? (
        <>
          <Box x={sc === "left" ? 195 : 235} y={158} w={70} h={32} r={12} tone="danger" d={0} />
          <Text x={sc === "left" ? 222 : 278} y={130} text={bi("obstacle", "عائق")} size={10.5} tone="danger" d={0} />
        </>
      ) : null}
      <ArcPath cx={o[0]} cy={o[1]} r={CLEAR_M * px} a0={-78} a1={78} tone="faint" dashed d={100} />
      <Text x={o[0] - CLEAR_M * px - 6} y={o[1] - 18} text={bi("too close", "قريب جدًا")} anchor="end" size={10} tone="muted" d={200} />
      {SONAR_DEG.map((a, i) => {
        const end = polar(o[0], o[1], readings[i] * px, a);
        const blocked = readings[i] < CLEAR_M;
        return (
          <g key={a}>
            <Arrow pts={[polar(o[0], o[1], 16, a), end]} tone={blocked ? "danger" : "slate"} head={false} d={300 + i * 120} dur={400} />
            <Fade d={700 + i * 120}>
              <circle cx={end[0]} cy={end[1]} r={4} style={{ fill: blocked ? "var(--danger)" : "var(--slate)" }} />
            </Fade>
          </g>
        );
      })}
      <In d={0}>
        <path d={`M${o[0] - 22},${o[1] + 4} A22,22 0 0 1 ${o[0] + 22},${o[1] + 4} Z`} className={w.under} />
        <path d={`M${o[0] - 22},${o[1] + 4} A22,22 0 0 1 ${o[0] + 22},${o[1] + 4} Z`} className={`${w.shape} ${w.navy}`} />
      </In>
      <Arrow pts={[polar(o[0], o[1], 24, dir), polar(o[0], o[1], 118, dir)]} tone="gold" d={1500} dur={400} width={4} />
      <Text x={460} y={26} text={bi("echo distance per beam", "مسافة الصدى لكل شعاع")} tone="heading" size={11.5} d={300} />
      <Bars
        x={384}
        y={64}
        w={156}
        h={140}
        values={readings}
        max={MAX_M}
        labels={SONAR_DEG.map((a) => `${a > 0 ? "+" : a < 0 ? "−" : ""}${Math.abs(a)}°`)}
        barTone={(i) => (readings[i] < CLEAR_M ? "danger" : i === chosen ? "gold" : "slate")}
        d={400}
      />
      <Arrow pts={[[378, 64 + 140 - (CLEAR_M / MAX_M) * 140], [546, 64 + 140 - (CLEAR_M / MAX_M) * 140]]} tone="danger" dashed head={false} d={900} />
      <Chip x={460} y={252} text={SCENARIO_LINE[sc]} tone="gold" center d={1700} />
    </Svg>
  );
}

const SHOWS: Record<string, { text: Bi; ok: boolean }> = {
  wall: { text: bi("echo returns: the reading is right", "يعود الصدى: القراءة صحيحة"), ok: true },
  angled: { text: bi("no echo: the sonar reports open space", "لا صدى: يُبلغ السونار عن فضاء خالٍ"), ok: false },
  branch: { text: bi("forward sonars: clear · the branch is missed", "السونارات الأمامية: خالٍ · الغصن لا يُرى"), ok: false },
};

function Inference({ control }: { control: string }) {
  const kind = control in SHOWS ? control : "wall";
  const y = 191;
  return (
    <Svg>
      <Arrow pts={[[16, 236], [544, 236]]} tone="faint" head={false} d={0} dur={300} />
      <Box x={30} y={176} w={46} h={30} r={5} tone="navy" label="sonar" mono size={10.5} d={0} />
      {kind === "wall" ? (
        <>
          <Box x={420} y={70} w={20} h={166} r={2} tone="slate" d={100} />
          <Text x={430} y={40} text={bi("wall", "جدار")} size={11} tone="heading" d={100} />
          <Arrow pts={[[78, y], [418, y]]} tone="faint" dashed head={false} d={200} />
          <Token pts={[[78, y], [418, y]]} d={300} dur={900} />
          <Token pts={[[418, y], [78, y]]} d={1300} dur={900} tone="navy" />
        </>
      ) : kind === "angled" ? (
        <>
          <path d="M340,236 L470,106" {...stroke("slate", 6)} />
          <Text x={452} y={196} text={bi("smooth, slanted", "أملس ومائل")} anchor="start" size={11} tone="heading" d={100} />
          <Arrow pts={[[78, y], [385, y], [385, 24]]} tone="faint" dashed head={false} d={200} />
          <Token pts={[[78, y], [385, y], [385, 24]]} d={300} dur={1400} />
          <Text x={396} y={40} text={bi("sound leaves", "يرحل الصوت")} anchor="start" size={10.5} tone="muted" d={1300} />
        </>
      ) : (
        <>
          <path d="M300,84 L548,68" {...stroke("navy", 4)} />
          {[330, 380, 430, 480, 530].map((x, i) => (
            <In key={x} d={150 + i * 60}>
              <circle cx={x} cy={84 - (x - 300) * 0.065 - 8} r={7} style={{ fill: "var(--success)", opacity: 0.8 }} />
            </In>
          ))}
          <Text x={420} y={30} text={bi("low branch", "غصن منخفض")} size={11} tone="heading" d={100} />
          <Arrow pts={[[78, y], [540, y]]} tone="faint" dashed head={false} d={200} />
          <Token pts={[[78, y], [540, y]]} d={300} dur={1200} />
          <Text x={300} y={150} text={bi("no echo at beam height", "لا صدى عند ارتفاع الشعاع")} size={10.5} tone="muted" d={1300} />
        </>
      )}
      <Chip x={280} y={258} text={SHOWS[kind].text} tone={SHOWS[kind].ok ? "success" : "danger"} center d={2200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof guideCane>>({
  device: Device,
  loop: Loop,
  fan: Fan,
  inference: Inference,
});
