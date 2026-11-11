"use client";

import { chain, ik2 } from "@/lib/widgets/rob-lecture-02";
import type { components } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, Svg, Text, type PlotBox, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Bar, Chain, Claw, Dot, Floor, Pedestal, Pin, Poly, Tag, dir, screen, stage, useMotion } from "./local";
import w from "../../../../Walkthrough.module.css";

function Anatomy() {
  const S: Pt = [230, 176];
  const E: Pt = [300, 92];
  const W: Pt = [408, 118];
  const palm: Pt = [408, 134];
  return (
    <Svg>
      <Floor x={120} y={250} w={250} d={0} />
      <Pedestal x={230} top={200} floor={250} wTop={40} wBottom={72} d={0} />
      <Box x={203} y={186} w={54} h={16} r={4} tone="slate" d={0} />
      <In d={100}>
        <Bar a={S} b={E} t={18} />
        <Bar a={E} b={W} t={14} />
        <Bar a={W} b={palm} t={8} tone="navy" />
        <Claw at={palm} angle={-90} open={0.5} />
        <Pin at={S} r={8} />
        <Pin at={E} r={7} />
        <Pin at={W} r={5} />
      </In>
      <Tag at={[88, 228]} to={[206, 228]} text={bi("Pedestal · waist", "القاعدة الحاملة · الخصر")} tone="slate" d={400} />
      <Tag at={[110, 182]} to={[204, 193]} text={bi("Base", "القاعدة")} tone="slate" d={700} />
      <Tag at={[110, 132]} to={[223, 170]} text={bi("Shoulder", "الكتف")} tone="slate" d={1000} />
      <Tag at={[336, 40]} to={[352, 102]} text={bi("Arm", "الذراع")} tone="slate" d={1300} />
      <Tag at={[482, 84]} to={[413, 114]} text={bi("Wrist", "المعصم")} tone="slate" d={1600} />
      <Tag at={[482, 150]} to={[418, 148]} text={bi("Gripper · hand", "القابض · اليد")} tone="gold" d={1900} />
      <Box x={398} y={196} w={148} h={62} label={bi("Manipulator", "الذراع الآلية")} sub={bi("base + appendages", "القاعدة + الملحقات")} tone="navy" size={12} d={2300} />
    </Svg>
  );
}

/* ---------- Processor and controller ---------- */

/** A second-order step response with some overshoot, settling on 1. */
const response = (t: number) => 1 - Math.exp(-4.2 * t) * Math.cos(9 * t);

function Brain({ control }: { control: string }) {
  const proc = control === "processor";
  const p = useMotion(900, 1800, proc);
  const target = 55;
  const a = proc ? target * p : target * response(p * 1.2);
  const J: Pt = [503, 135];
  const mini: Pt = [40, 266];
  const goal: Pt = [90, 20];
  const [t1, t2] = ik2(56, 46, goal);
  const arm = chain([0, 0], [56, 46], [t1, t2]).map((q) => screen(mini, q));
  const tip = screen(mini, goal);
  const plot: PlotBox = { x: 34, y: 214, w: 196, h: 46, domain: [0, 1], range: [0, 1.5] };
  return (
    <Svg>
      <Box x={10} y={102} w={86} h={66} label={bi("Tool target", "هدف الأداة")} sub="(x, y, z)" tone="outline" size={12} d={0} />
      <Arrow pts={[[96, 135], [116, 135]]} tone="navy" d={300} dur={250} />
      <Box x={118} y={96} w={108} h={78} label={bi("Processor", "المعالج")} sub={bi("where?", "أين؟")} tone={proc ? "gold" : "navy"} size={13} d={100} />
      <Arrow pts={[[226, 135], [260, 135]]} tone="navy" d={450} dur={250} />
      <Text x={244} y={76} text={bi("setpoints", "القيم المطلوبة")} tone="muted" size={10} d={500} />
      <Box x={262} y={96} w={108} h={78} label={bi("Controller", "المتحكِّم")} sub={bi("how, now?", "كيف، الآن؟")} tone={proc ? "navy" : "gold"} size={13} d={200} />
      <Arrow pts={[[370, 135], [402, 135]]} tone="navy" d={600} dur={250} />
      <Text x={387} y={76} text={bi("current", "التيار")} tone="muted" size={10} d={650} />
      <Box x={404} y={110} w={64} h={50} label={bi("Motor", "المحرك")} tone="slate" size={12} d={300} />
      <Bar a={[468, 135]} b={J} t={6} tone="muted" d={300} />
      <Bar a={J} b={dir(J, 44, a)} t={11} tone="slate" />
      <Pin at={J} r={7} />
      <Arrow pts={[[503, 150], [503, 202], [316, 202], [316, 174]]} tone="slate" dashed d={800} label={bi("sensor feedback", "تغذية راجعة من المستشعر")} labelAt={[410, 222]} labelTone="slate" />
      {proc ? (
        <>
          <Text x={140} y={196} text={bi("geometric: which joint angles?", "هندسي: أي زوايا للمفاصل؟")} tone="gold" size={10.5} d={1000} />
          <In d={1100}>
            <Chain pts={arm} t={[8, 6]} pinR={4} />
            <path d={`M${tip[0] - 5},${tip[1]} H${tip[0] + 5} M${tip[0]},${tip[1] - 5} V${tip[1] + 5}`} className={`${w.line} ${w.danger}`} style={{ strokeWidth: 2 }} />
          </In>
          <Text x={186} y={244} text={`θ₁ = ${Math.round(t1)}°`} tone="heading" size={10.5} mono d={1300} />
          <Text x={186} y={262} text={`θ₂ = ${Math.round(t2)}°`.replace("-", "−")} tone="heading" size={10.5} mono d={1400} />
        </>
      ) : (
        <>
          <Text x={140} y={196} text={bi("dynamic: what current, now?", "ديناميكي: أي تيار، الآن؟")} tone="gold" size={10.5} d={1000} />
          <Curve box={plot} axes points={[]} d={1000} />
          <Curve box={plot} points={[[0, 1], [1, 1]]} tone="faint" dashed d={1100} />
          <Curve box={plot} fn={(t) => response(t * 1.2)} tone="gold" d={1200} dur={1400} />
        </>
      )}
    </Svg>
  );
}

/* ---------- Power sources ---------- */

const POWER: readonly { id: string; label: Bi; sub: Bi }[] = [
  { id: "electric", label: bi("Electric", "كهربائية"), sub: bi("precise, easy to control", "دقيقة وسهلة التحكم") },
  { id: "pneumatic", label: bi("Pneumatic", "هوائية"), sub: bi("fast, open or closed", "سريعة: فتح أو غلق") },
  { id: "hydraulic", label: bi("Hydraulic", "هيدروليكية"), sub: bi("very high force", "قوة عالية جدًا") },
];

function Power({ control }: { control: string }) {
  const k = Math.max(0, POWER.findIndex((x) => x.id === control));
  const p = useMotion(800, 1600);
  return (
    <Svg>
      {POWER.map((x, i) => (
        <Box key={x.id} x={14} y={22 + i * 84} w={180} h={66} label={x.label} sub={x.sub} tone={i === k ? "gold" : "outline"} size={13} subSize={10.5} d={i * 120} />
      ))}
      <Arrow pts={[[194, 55 + k * 84], ([[246, 140], [230, 64], [234, 215]] as const)[k]]} tone="gold" d={500} dur={300} />
      {control === "electric" ? <Electric p={p} /> : control === "pneumatic" ? <Pneumatic p={p} /> : <Hydraulic p={p} />}
    </Svg>
  );
}

function Electric({ p }: { p: number }) {
  const G: Pt = [400, 140];
  const a = 50 * p;
  return (
    <>
      <Box x={250} y={112} w={78} h={56} label={bi("Motor", "محرك")} tone="slate" d={200} />
      <Bar a={[328, 140]} b={G} t={7} tone="muted" d={200} />
      <In d={300}>
        <circle cx={G[0]} cy={G[1]} r={24} className={w.under} />
        <circle cx={G[0]} cy={G[1]} r={24} className={`${w.shape} ${w.outline} ${w.dashed}`} />
      </In>
      <Bar a={G} b={dir(G, 92, a)} t={12} tone="slate" />
      <Pin at={G} r={7} />
      <Text x={470} y={210} text={`θ = ${(50 * p).toFixed(1)}°`} tone="heading" size={12} mono />
      <Chip x={420} y={250} text={bi("stops exactly where told", "يتوقف تمامًا حيث يُطلب")} tone="success" center d={2300} />
    </>
  );
}

function Pneumatic({ p }: { p: number }) {
  const shut = stage(p, 0.45, 0.6);
  const rod = 14 + 30 * shut;
  return (
    <>
      <Box x={232} y={42} w={112} h={44} label={bi("Compressed air", "هواء مضغوط")} tone="slate" size={11.5} d={200} />
      <Arrow pts={[[283, 86], [283, 140], [300, 140]]} tone="slate" dashed d={300} />
      <Poly pts={[[300, 124], [380, 124], [380, 156], [300, 156]]} tone="slate" d={200} />
      <Bar a={[380, 140]} b={[380 + rod, 140]} t={7} tone="muted" />
      <Poly pts={[[421, 129], [437, 129], [437, 151], [421, 151]]} tone="warn" d={300} />
      <Claw at={[380 + rod - 6, 140]} angle={0} open={1 - shut} grip={24} size={1.1} />
      <Chip x={420} y={232} text={bi("open or closed, no stop between", "مفتوح أو مغلق، لا توقف بينهما")} tone="gold" center d={2300} />
    </>
  );
}

function Hydraulic({ p }: { p: number }) {
  const lift = 60 * p;
  return (
    <>
      <Box x={236} y={190} w={130} h={50} label={bi("Pressurised fluid", "سائل مضغوط")} tone="slate" size={11.5} d={200} />
      <Arrow pts={[[366, 215], [384, 215]]} tone="slate" dashed d={300} />
      <Poly pts={[[386, 170], [424, 170], [424, 244], [386, 244]]} tone="slate" d={200} />
      <Bar a={[405, 172]} b={[405, 150 - lift]} t={12} tone="muted" />
      <Box x={358} y={110 - lift} w={94} h={40} r={4} label={bi("heavy load", "حمل ثقيل")} tone="warn" size={11.5} />
      <Chip x={495} y={150} text={bi("leaks, heat", "تسرّب، حرارة")} tone="danger" center d={2300} />
    </>
  );
}

/* ---------- End effectors ---------- */

const HANDS: Record<string, { name: Bi; holds: "part" | "tool"; note: Bi }> = {
  gripper: { name: bi("Mechanical gripper", "قابض ميكانيكي"), holds: "part", note: bi("fingers shaped for one part", "أصابع مُشكَّلة لقطعة بعينها") },
  vacuum: { name: bi("Vacuum head", "رأس شفط"), holds: "part", note: bi("needs a smooth, flat face", "يحتاج إلى وجه أملس ومستوٍ") },
  welding: { name: bi("Welding torch", "مشعل لحام"), holds: "tool", note: bi("presented along the seam", "يُمرَّر على خط اللحام") },
  spray: { name: bi("Spray-paint gun", "مسدس طلاء بالرش"), holds: "tool", note: bi("a smooth, continuous path", "مسار سلس ومتصل") },
};

function Hand({ control }: { control: string }) {
  const h = HANDS[control] ?? HANDS.gripper;
  const p = useMotion(700, 2200);
  const holdsPart = h.holds === "part";
  // Gripper and vacuum head: down, grab, lift. Torch and spray gun: along the work.
  const down = stage(p, 0, 0.4);
  const grab = stage(p, 0.4, 0.55);
  const up = stage(p, 0.6, 1);
  const reach = control === "vacuum" ? 110 : control === "gripper" ? 104 : control === "welding" ? 102 : 66;
  const lift = 50 * up;
  const fy = holdsPart ? 60 + reach * down - lift : 60 + reach;
  const fx = holdsPart ? 200 : 150 + 120 * p;
  const flange: Pt = [fx, fy];
  const tipY = fy + 44;
  return (
    <Svg>
      <Floor x={60} y={250} w={260} d={0} />
      <Poly pts={[[96, 222], [330, 222], [330, 232], [96, 232]]} tone="muted" d={0} />
      {control === "gripper" ? <Box x={185} y={192 - lift} w={30} h={30} r={2} tone="warn" /> : null}
      {control === "vacuum" ? <Poly pts={[[130, 216 - lift], [270, 216 - lift], [270, 222 - lift], [130, 222 - lift]]} tone="warn" /> : null}
      {control === "welding" ? (
        <>
          <Poly pts={[[110, 210], [200, 210], [200, 222], [110, 222]]} tone="outline" d={0} />
          <Poly pts={[[200, 210], [310, 210], [310, 222], [200, 222]]} tone="outline" d={0} />
          <Bar a={[150, 208]} b={[Math.max(151, fx), 208]} t={4} tone="gold" />
        </>
      ) : null}
      {control === "spray" ? (
        <>
          <Poly pts={[[110, 212], [320, 212], [320, 222], [110, 222]]} tone="outline" d={0} />
          <Poly pts={[[132, 208], [Math.max(133, fx + 18), 208], [Math.max(133, fx + 18), 212], [132, 212]]} tone="gold" />
          <Poly pts={[[fx, tipY + 4], [fx - 18, 208], [fx + 18, 208]]} tone="gold" opacity={0.28} />
        </>
      ) : null}
      <Bar a={[fx - 150, fy - 44]} b={flange} t={14} tone="slate" />
      <Pin at={flange} r={6} />
      <Bar a={flange} b={[fx, fy + 20]} t={9} tone="navy" />
      {control === "gripper" ? <Claw at={[fx, fy + 24]} angle={-90} open={1 - grab} grip={30} size={1.1} /> : null}
      {control === "vacuum" ? (
        <>
          <Bar a={[fx, fy + 20]} b={[fx, fy + 38]} t={5} tone="navy" />
          <Poly pts={[[fx - 6, fy + 36], [fx + 6, fy + 36], [fx + 18, fy + 46], [fx - 18, fy + 46]]} tone="slate" />
        </>
      ) : null}
      {control === "welding" ? (
        <>
          <Bar a={[fx, fy + 20]} b={[fx, tipY - 4]} t={8} tone="navy" />
          <Bar a={[fx, tipY - 8]} b={[fx, tipY + 2]} t={5} tone="gold" />
          {p > 0.02 && p < 0.999 ? (
            <>
              <Dot at={[fx + 7, tipY]} r={2} tone="gold" />
              <Dot at={[fx - 8, tipY - 2]} r={1.8} tone="gold" />
            </>
          ) : null}
        </>
      ) : null}
      {control === "spray" ? (
        <>
          <Bar a={[fx, fy + 20]} b={[fx, tipY - 2]} t={10} tone="navy" />
          <Bar a={[fx, tipY - 4]} b={[fx, tipY + 4]} t={5} tone="gold" />
        </>
      ) : null}
      <Box x={340} y={40} w={204} h={66} label={h.name} sub={bi("on the last joint", "على آخر مفصل")} tone="navy" d={200} />
      <Chip x={442} y={150} text={holdsPart ? bi("holds the part", "يمسك القطعة") : bi("holds the tool", "يمسك الأداة")} tone={holdsPart ? "success" : "gold"} center d={600} />
      <Fade d={900}>
        <Text x={442} y={212} text={h.note} tone="muted" size={11} />
      </Fade>
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof components>>({
  anatomy: Anatomy,
  brain: Brain,
  power: Power,
  hand: Hand,
});
