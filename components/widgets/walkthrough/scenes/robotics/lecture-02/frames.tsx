"use client";

import { ARM, TCP, chain, jog, jogDeltas, movingJoints, type JogMode } from "@/lib/widgets/rob-lecture-02";
import type { frames } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Box, Chip, In, Mark, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Axes, Bar, Dot, Floor, Line, Pedestal, Pin, Poly, Tag, arcPts, dir, screen, track, trackAll, useMotion } from "./local";
import w from "../../../../Walkthrough.module.css";

const S: Pt = [150, 190];
const FLOOR = 250;

/** The arm at joint angles `a`: pedestal, two links, the wrist and a pointed tool. */
function ArmAt({ a, hi }: { a: readonly number[]; hi?: number }) {
  const pts = chain([0, 0], ARM.lengths, a).map((q) => screen(S, q));
  const [, elbow, wrist, tip] = pts;
  return (
    <>
      <Bar a={S} b={elbow} t={15} tone={hi === 0 ? "gold" : "slate"} />
      <Bar a={elbow} b={wrist} t={12} tone={hi === 1 ? "gold" : "slate"} />
      <Bar a={wrist} b={dir(tip, -8, a[0] + a[1] + a[2])} t={7} tone="navy" />
      <Bar a={dir(tip, -9, a[0] + a[1] + a[2])} b={tip} t={4} tone="gold" />
      <Pin at={S} r={8} tone={hi === 0 ? "gold" : "outline"} />
      <Pin at={elbow} r={7} tone={hi === 1 ? "gold" : "outline"} />
      <Pin at={wrist} r={5} tone={hi === 2 ? "gold" : "outline"} />
    </>
  );
}

const pointsOf = (a: readonly number[]) => chain([0, 0], ARM.lengths, a).map((q) => screen(S, q));

function Base() {
  return (
    <>
      <Floor x={14} y={FLOOR} w={300} d={0} />
      <Pedestal x={S[0]} top={S[1] + 8} floor={FLOOR} wTop={36} wBottom={64} d={0} />
    </>
  );
}

function Frames() {
  const a = jog("world")[0];
  const [, elbow, wrist, tip] = pointsOf(a);
  const tool = a[0] + a[1] + a[2];
  return (
    <Svg>
      <Base />
      <In d={0}>
        <ArmAt a={a} />
      </In>
      <Axes at={[44, 226]} len={36} labels={["x", "z"]} out="y" tone="navy" d={400} />
      {[S, elbow, wrist].map((j, i) => (
        <In key={i} d={1000 + i * 250}>
          <path
            d={arcPts(j, 15 - i * 2, 200, 330, 10)
              .map((q, k) => `${k ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`)
              .join(" ")}
            className={`${w.line} ${w.slate}`}
            style={{ strokeWidth: 2 }}
          />
        </In>
      ))}
      <Text x={S[0] - 30} y={S[1] + 2} text="θ₁" size={12} mono tone="slate" d={1000} />
      <Text x={elbow[0] - 28} y={elbow[1] - 6} text="θ₂" size={12} mono tone="slate" d={1250} />
      <Text x={wrist[0] + 26} y={wrist[1] - 8} text="θ₃" size={12} mono tone="slate" d={1500} />
      <Axes at={tip} angle={tool} len={30} labels={["z′", "x′"]} tone="gold" d={1900} />
      <Box x={330} y={22} w={214} h={62} label={bi("World frame", "إطار العالم")} sub={bi("fixed to the base: x, y, z", "مثبّت على القاعدة: x, y, z")} tone="navy" size={12.5} d={600} />
      <Box x={330} y={98} w={214} h={62} label={bi("Joint frame", "إطار المفاصل")} sub={bi("each joint's own axis", "محور كل مفصل بعينه")} tone="slate" size={12.5} d={1100} />
      <Box x={330} y={174} w={214} h={62} label={bi("Tool frame", "إطار الأداة")} sub={bi("moves with the hand: x′, y′, z′", "يتحرك مع اليد: x′, y′, z′")} tone="gold" size={12.5} d={1900} />
    </Svg>
  );
}

const JOG_LABEL: Record<JogMode, { key: Bi; path: Bi }> = {
  world: { key: bi("jog +x in the world frame", "تحريك +x في إطار العالم"), path: bi("a straight line along x", "خط مستقيم على امتداد x") },
  joint: { key: bi("jog J2 + in the joint frame", "تحريك J2 + في إطار المفاصل"), path: bi("an arc about J2", "قوس حول J2") },
  tool: { key: bi("jog +z′ in the tool frame", "تحريك +z′ في إطار الأداة"), path: bi("straight along the tool's axis", "مستقيم على امتداد محور الأداة") },
};

function Jog({ control }: { control: string }) {
  const mode = (["world", "joint", "tool"].includes(control) ? control : "world") as JogMode;
  const f = jog(mode);
  const deltas = jogDeltas(mode);
  const p = useMotion(900, 1900);
  const a = trackAll(f, p);
  const tips = f.map((q) => pointsOf(q)[3]);
  const done = Math.round(p * (tips.length - 1));
  const tip = pointsOf(a)[3];
  const tool = a[0] + a[1] + a[2];
  const sign = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
  const n = movingJoints(mode);
  return (
    <Svg>
      <Base />
      <Chip x={160} y={28} text={JOG_LABEL[mode].key} tone="navy" center d={0} />
      <Line pts={tips} tone="faint" dashed width={1.8} />
      <Line pts={[...tips.slice(0, done + 1), tip]} tone="gold" width={2.6} />
      <ArmAt a={a} hi={mode === "joint" ? 1 : undefined} />
      {mode === "world" ? <Axes at={[44, 226]} len={34} labels={["x", "z"]} tone="navy" d={300} /> : null}
      {mode === "tool" ? <Axes at={tip} angle={tool} len={30} labels={["z′", "x′"]} tone="gold" /> : null}
      <Dot at={tips[0]} r={3.5} tone="muted" />
      {deltas.map((v, i) => (
        <Box key={i} x={330} y={56 + i * 48} w={214} h={40} label={`Δθ${["₁", "₂", "₃"][i]} = ${sign(Math.round(v * p))}°`} tone={v !== 0 ? "gold" : "muted"} mono size={13} d={200 + i * 100} />
      ))}
      <Text x={437} y={214} text={bi(`joints moving: ${n}`, `المفاصل المتحركة: ${n}`)} tone="heading" size={12} d={700} />
      <Text x={437} y={250} text={JOG_LABEL[mode].path} tone="gold" size={11} d={900} />
    </Svg>
  );
}

/* ---------- Which frame when? ---------- */

function Uses() {
  const p = useMotion(900, 1600);
  const card = (k: number, title: Bi, lines: readonly Bi[], art: React.ReactNode) => {
    const x = 14 + k * 180;
    return (
      <>
        <Box x={x} y={12} w={170} h={256} tone="outline" d={k * 200} />
        <Box x={x + 12} y={22} w={146} h={40} label={title} tone="navy" size={12} d={k * 200 + 100} />
        <In d={k * 200 + 300}>{art}</In>
        {lines.map((l, i) => (
          <Text key={i} x={x + 85} y={198 + i * 38} text={l} size={10.5} tone="text" d={k * 200 + 500 + i * 150} />
        ))}
      </>
    );
  };
  const J: Pt = [99, 132];
  const T: Pt = [462, 126];
  const toolAng = -50;
  const peg = dir(T, -30 + 26 * p, toolAng);
  return (
    <Svg>
      {card(
        0,
        bi("Joint frame", "إطار المفاصل"),
        [bi("first jog of a new robot", "أول تحريك لروبوت جديد"), bi("recovery and homing", "الاستعادة والعودة للمرجع")],
        <>
          <Bar a={[44, 160]} b={J} t={12} />
          <Bar a={J} b={dir(J, 56, 20 + 40 * p)} t={10} tone="gold" />
          <Pin at={J} r={7} tone="gold" />
          <Text x={99} y={170} text="J2" size={11} mono tone="heading" />
        </>,
      )}
      {card(
        1,
        bi("World frame", "إطار العالم"),
        [bi("fixtures and pallets", "المثبّتات والمنصات"), bi("conveyors in the cell", "السيور الناقلة في الخلية")],
        <>
          <Poly pts={[[214, 150], [334, 150], [334, 160], [214, 160]]} tone="muted" />
          <Box x={262} y={114} w={44} h={36} r={3} tone="warn" />
          <Dot at={[262, 150]} r={4} tone="danger" />
          <Axes at={[222, 140]} len={24} labels={["x", "z"]} tone="navy" size={10.5} />
        </>,
      )}
      {card(
        2,
        bi("Tool frame", "إطار الأداة"),
        [bi("approach and retract", "الاقتراب والتراجع"), bi("drill, weld, insert", "الثقب واللحام والإدخال")],
        <>
          <Poly pts={[dir(T, 30, 40), dir(T, 30, -140), dir(dir(T, 30, -140), 36, -50), dir(dir(T, 30, 40), 36, -50)]} tone="muted" />
          <Line pts={[T, dir(T, 20, toolAng)]} tone="danger" width={7} />
          <Bar a={dir(peg, -46, toolAng)} b={peg} t={8} tone="gold" />
          <Line pts={[dir(T, -70, toolAng), dir(T, 18, toolAng)]} tone="gold" dashed />
          <Text x={dir(T, -56, toolAng)[0] + 16} y={dir(T, -56, toolAng)[1]} text="z′" size={11} mono tone="gold" anchor="start" />
        </>,
      )}
    </Svg>
  );
}

/* ---------- Tool centre point ---------- */

function Tcp({ control }: { control: string }) {
  const wrong = control === "wrong";
  const p = useMotion(800, 2400, false);
  const a = track([0, 28, -28, 18], p);
  const tipRest: Pt = [200, 212];
  const len = 118;
  const flangeRest: Pt = [tipRest[0], tipRest[1] - len];
  const pivot: Pt = wrong ? [tipRest[0], tipRest[1] - TCP.shortBy] : tipRest;
  const rot = (q: Pt, deg: number): Pt => {
    const r = (-deg * Math.PI) / 180;
    const dx = q[0] - pivot[0];
    const dy = q[1] - pivot[1];
    return [pivot[0] + dx * Math.cos(r) - dy * Math.sin(r), pivot[1] + dx * Math.sin(r) + dy * Math.cos(r)];
  };
  const flange = rot(flangeRest, a);
  const tip = rot(tipRest, a);
  const elbow = rot([flangeRest[0] - 90, flangeRest[1] - 40], a);
  const swingPath = Array.from({ length: 13 }, (_, i) => rot(tipRest, -28 + (56 * i) / 12));
  return (
    <Svg>
      <Floor x={60} y={236} w={280} d={0} />
      <Poly pts={[[190, 236], [210, 236], [200, 214]]} tone="slate" d={0} />
      {wrong ? <Line pts={swingPath} tone="danger" dashed width={2} /> : null}
      <Bar a={elbow} b={flange} t={14} tone="slate" />
      <Pin at={flange} r={6} />
      <Bar a={flange} b={tip} t={5} tone="navy" />
      <Dot at={tip} r={4} tone="gold" />
      <In d={200}>
        <path d={`M${pivot[0] - 8},${pivot[1]} H${pivot[0] + 8} M${pivot[0]},${pivot[1] - 8} V${pivot[1] + 8}`} className={`${w.line} ${w.gold}`} style={{ strokeWidth: 2.6 }} />
      </In>
      <Tag at={[300, wrong ? 150 : 170]} to={[pivot[0] + 8, pivot[1]]} text={bi("TCP the controller uses", "نقطة TCP التي يستخدمها المتحكِّم")} tone="gold" d={400} />
      <Tag at={[92, 254]} to={[196, 226]} text={bi("the stud", "المسمار المرجعي")} tone="slate" d={300} />
      <Box x={370} y={36} w={176} h={62} label={bi("TCP setting", "ضبط TCP")} sub={wrong ? bi(`${TCP.shortBy} mm short of the tip`, `أقصر من الطرف بـ ${TCP.shortBy} مم`) : bi("at the real tip", "عند الطرف الحقيقي")} tone={wrong ? "danger" : "success"} size={12} d={100} />
      <Mark x={458} y={136} ok={!wrong} r={14} d={2600} />
      <Text x={458} y={178} text={wrong ? bi("the tip swings off the stud", "يتأرجح الطرف بعيدًا عن المسمار") : bi("the tip stays on the stud", "يبقى الطرف على المسمار")} tone={wrong ? "danger" : "success"} size={11} d={2700} />
      <Text x={458} y={232} text={wrong ? bi("taught points still repeat", "النقاط المُعلَّمة ما زالت تتكرر") : bi("wrist turns about the tip", "يدور المعصم حول الطرف")} tone="muted" size={10.5} d={2900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof frames>>({
  frames: Frames,
  jog: Jog,
  uses: Uses,
  tcp: Tcp,
});
