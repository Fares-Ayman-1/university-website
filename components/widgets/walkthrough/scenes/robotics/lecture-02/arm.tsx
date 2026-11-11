"use client";

import { chain, ik3 } from "@/lib/widgets/rob-lecture-02";
import type { arm } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Bar, Chain, Claw, Dot, Floor, Pedestal, Pin, Poly, dir, screen, trackAll, useMotion } from "./local";

function BlackBox() {
  return (
    <Svg>
      <Text x={280} y={30} text={bi("Seen from outside", "من الخارج")} tone="heading" size={13} d={0} />
      <Box x={14} y={92} w={132} h={64} label={bi("Human directions", "توجيهات البشر")} tone="slate" d={100} />
      <Arrow pts={[[146, 124], [203, 124]]} tone="navy" d={500} />
      <Box x={205} y={78} w={140} h={92} label={bi("Robot system", "النظام الروبوتي")} tone="navy" size={14} d={300} />
      <Arrow pts={[[345, 124], [394, 124]]} tone="gold" d={900} />
      <Box x={396} y={92} w={150} h={64} label={bi("Work done automatically", "عمل يُنجَز آليًا")} tone="gold" size={11.5} d={1000} />
      <Token pts={[[146, 124], [203, 124]]} d={1300} dur={500} tone="navy" />
      <Token pts={[[345, 124], [394, 124]]} d={1900} dur={500} />
      <Box x={120} y={200} w={136} h={66} label={bi("Environment state", "حالة البيئة")} sub={bi("from the sensors", "من المستشعرات")} tone="outline" dashed size={11.5} subSize={10.5} d={2300} />
      <Box x={294} y={200} w={136} h={66} label={bi("Energy", "الطاقة")} sub={bi("from the power supply", "من مصدر الطاقة")} tone="outline" dashed size={11.5} subSize={10.5} d={2500} />
      <Arrow pts={[[214, 200], [250, 172]]} tone="slate" dashed d={2700} />
      <Arrow pts={[[336, 200], [300, 172]]} tone="slate" dashed d={2800} />
      <Text x={494} y={233} text={bi("the book adds", "يضيفها الكتاب")} tone="muted" size={10.5} d={2900} />
    </Svg>
  );
}

function System() {
  return (
    <Svg>
      <Box x={200} y={16} w={130} h={46} label={bi("Sensors", "المستشعرات")} tone="slate" d={0} />
      <Box x={390} y={16} w={150} h={46} label={bi("Power supply", "مصدر الطاقة")} tone="slate" d={100} />
      <Box x={15} y={108} w={140} h={56} label={bi("Teach pendant", "لوحة التعليم")} tone="outline" d={200} />
      <Box x={200} y={104} w={130} h={64} label={bi("Controller", "المتحكِّم")} tone="navy" size={14} d={300} />
      <Box x={390} y={104} w={150} h={64} label={bi("Mechanical arm", "الذراع الميكانيكية")} tone="gold" d={400} />
      <Box x={190} y={214} w={150} h={50} label={bi("Storage or network", "التخزين أو الشبكة")} tone="outline" d={500} />
      <Box x={390} y={214} w={150} h={50} label={bi("End-of-arm tooling", "أدوات نهاية الذراع")} tone="outline" d={600} />
      <Arrow pts={[[155, 136], [200, 136]]} tone="navy" both d={800} dur={300} />
      <Arrow pts={[[265, 62], [265, 104]]} tone="slate" d={900} dur={300} />
      <Arrow pts={[[330, 136], [390, 136]]} tone="navy" d={1000} dur={300} />
      <Arrow pts={[[465, 62], [465, 104]]} tone="slate" d={1100} dur={300} />
      <Arrow pts={[[265, 214], [265, 168]]} tone="navy" both d={1200} dur={300} />
      <Arrow pts={[[465, 168], [465, 214]]} tone="gold" d={1300} dur={300} />
      <Token pts={[[155, 136], [200, 136]]} d={1700} dur={450} tone="navy" />
      <Token pts={[[330, 136], [390, 136]]} d={2150} dur={450} tone="navy" />
      <Token pts={[[465, 168], [465, 214]]} d={2600} dur={450} />
      <Token pts={[[265, 62], [265, 104]]} d={3050} dur={450} tone="success" />
    </Svg>
  );
}

/* ---------- One arm, many jobs ---------- */

const S: Pt = [110, 150];
const LEN = [110, 100, 36] as const;
const FLOOR = 250;

type Job = { path: readonly Pt[]; phi: number; name: ReturnType<typeof bi>; tool: ReturnType<typeof bi> };

const JOBS: Record<string, Job> = {
  weld: { path: [[120, -72], [190, -72]], phi: -90, name: bi("Arc welding", "اللحام"), tool: bi("welding torch", "مشعل لحام") },
  paint: { path: [[190, 50], [190, -50]], phi: 0, name: bi("Painting", "الطلاء"), tool: bi("spray gun", "مسدس رش") },
  assemble: { path: [[160, -12], [160, -40]], phi: -90, name: bi("Assembly", "التجميع"), tool: bi("gripper with a peg", "قابض يحمل وتدًا") },
  palletise: { path: [[125, -15], [125, 22], [195, 22], [195, -55]], phi: -90, name: bi("Palletising", "رصّ المنصات"), tool: bi("gripper with a box", "قابض يحمل صندوقًا") },
};

/** Joint angles along a tool path made of straight segments (fixed tool direction). */
function framesAlong(path: readonly Pt[], phi: number, per = 8): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let s = 0; s < path.length - 1; s++) {
    for (let i = s === 0 ? 0 : 1; i <= per; i++) {
      const t = i / per;
      const p: Pt = [path[s][0] + (path[s + 1][0] - path[s][0]) * t, path[s][1] + (path[s + 1][1] - path[s][1]) * t];
      out.push(ik3(LEN, p, phi));
    }
  }
  return out;
}

function Jobs({ control }: { control: string }) {
  const job = JOBS[control] ?? JOBS.weld;
  const p = useMotion(700, 2400);
  const angles = trackAll(framesAlong(job.path, job.phi), p);
  const pts = chain([0, 0], LEN, angles).map((q) => screen(S, q));
  const [, elbow, wrist, tip] = pts;
  const start = screen(S, job.path[0]);
  const palm = dir(tip, -16, job.phi);
  return (
    <Svg>
      <Floor x={14} y={FLOOR} w={360} d={0} />
      {control === "weld" ? (
        <>
          <Poly pts={[[214, 224], [262, 224], [262, 240], [214, 240]]} tone="muted" d={100} />
          <Poly pts={[[262, 224], [318, 224], [318, 240], [262, 240]]} tone="muted" d={100} />
          <Bar a={start} b={[Math.max(start[0] + 0.5, tip[0]), start[1] + 2]} t={4} tone="gold" />
        </>
      ) : null}
      {control === "paint" ? (
        <>
          <Poly pts={[[345, 80], [360, 80], [360, 230], [345, 230]]} tone="muted" d={100} />
          <Poly pts={[[341, start[1]], [345, start[1]], [345, Math.max(start[1] + 1, tip[1])], [341, Math.max(start[1] + 1, tip[1])]]} tone="gold" />
          <Poly pts={[tip, [341, tip[1] - 16], [341, tip[1] + 16]]} tone="gold" opacity={0.28} />
        </>
      ) : null}
      {control === "assemble" ? (
        <>
          <Poly pts={[[236, 205], [262, 205], [262, 231], [278, 231], [278, 205], [304, 205], [304, 246], [236, 246]]} tone="muted" d={100} />
        </>
      ) : null}
      {control === "palletise" ? (
        <>
          <Poly pts={[[196, 176], [262, 176], [262, 184], [196, 184]]} tone="slate" d={100} />
          {[206, 222, 238, 254].map((x) => (
            <circle key={x} cx={x} cy={188} r={4} style={{ fill: "var(--border-strong)" }} />
          ))}
          <Poly pts={[[272, 238], [340, 238], [340, 246], [272, 246]]} tone="slate" d={100} />
          <Box x={276} y={216} w={30} h={22} r={2} tone="warn" d={150} />
          <Box x={308} y={216} w={30} h={22} r={2} tone="warn" d={150} />
        </>
      ) : null}
      <Pedestal x={S[0]} top={S[1] + 14} floor={FLOOR} wTop={42} wBottom={74} d={0} />
      <Box x={S[0] - 24} y={S[1] - 2} w={48} h={18} r={4} tone="slate" d={0} />
      <Chain pts={[S, elbow, wrist]} t={[18, 14]} tone="slate" />
      {control === "weld" || control === "paint" ? (
        <>
          <Bar a={wrist} b={dir(tip, -6, job.phi)} t={9} tone="navy" />
          <Bar a={dir(tip, -8, job.phi)} b={tip} t={5} tone="gold" />
        </>
      ) : (
        <>
          <Bar a={wrist} b={palm} t={8} tone="navy" />
          {control === "assemble" ? <Box x={tip[0] - 6} y={tip[1] - 12} w={12} h={30} r={2} tone="gold" /> : null}
          {control === "palletise" ? <Box x={tip[0] - 15} y={tip[1] - 11} w={30} h={22} r={2} tone="warn" /> : null}
          <Claw at={palm} angle={job.phi} open={0} grip={control === "palletise" ? 30 : 12} />
        </>
      )}
      <Pin at={wrist} r={5} tone="outline" />
      {control === "weld" && p > 0.02 && p < 0.999 ? (
        <>
          <Dot at={[tip[0] + 6, tip[1] - 3]} r={2} tone="gold" />
          <Dot at={[tip[0] - 7, tip[1] - 6]} r={1.8} tone="gold" />
          <Dot at={[tip[0] + 3, tip[1] - 9]} r={1.6} tone="gold" />
        </>
      ) : null}
      <Box x={384} y={60} w={160} h={66} label={job.name} sub={job.tool} tone="navy" d={300} />
      <Chip x={464} y={170} text={bi("same arm, new tool", "الذراع نفسها، أداة جديدة")} tone="gold" center d={900} />
      <Fade d={1200}>
        <Text x={464} y={222} text={bi("base · links · joints · wrist", "قاعدة · وصلات · مفاصل · معصم")} tone="muted" size={10.5} />
      </Fade>
    </Svg>
  );
}

/* ---------- Networked robots ---------- */

function Network({ control }: { control: string }) {
  const tcp = control === "tcp";
  const lineY = 52;
  const send = (d: number) => <Token pts={[[136, lineY], [424, lineY]]} d={d} dur={900} tone="navy" />;
  const slots = tcp
    ? [
        { n: "1", x: 120, tone: "success" as const, d: 1500 },
        { n: "2", x: 180, tone: "success" as const, d: 1900 },
        { n: "3", x: 330, tone: "danger" as const, d: 3300 },
        { n: "4", x: 362, tone: "danger" as const, d: 3400 },
      ]
    : [
        { n: "1", x: 120, tone: "success" as const, d: 1500 },
        { n: "2", x: 180, tone: "success" as const, d: 1900 },
        { n: "4", x: 300, tone: "success" as const, d: 2700 },
      ];
  return (
    <Svg>
      <Box x={16} y={28} w={120} h={48} label={bi("Remote PC", "حاسوب بعيد")} tone="slate" d={0} />
      <Box x={424} y={28} w={120} h={48} label={bi("Robot controller", "متحكِّم الروبوت")} tone="navy" size={12} d={0} />
      <Arrow pts={[[136, lineY], [424, lineY]]} tone="faint" head={false} d={200} dur={400} />
      <Text x={280} y={92} text={bi("LAN or Internet, wired or wireless", "LAN أو الإنترنت، سلكية أو لاسلكية")} tone="muted" size={10.5} d={300} />
      {send(600)}
      {send(1000)}
      <Token pts={[[136, lineY], [270, lineY]]} d={1400} dur={450} tone="navy" />
      <Mark x={270} y={lineY} ok={false} d={1900} />
      {send(1800)}
      {tcp ? send(2500) : null}
      <Text x={60} y={118} text={bi("arrives at the robot", "يصل إلى الروبوت")} tone="heading" size={11} anchor="start" d={1100} />
      <Arrow pts={[[40, 160], [540, 160]]} tone="faint" d={1100} dur={400} />
      <Text x={540} y={176} text="t" tone="muted" size={11} mono anchor="end" d={1200} />
      {slots.map((s) => (
        <Box key={s.n} x={s.x - 14} y={148} w={28} h={24} r={4} label={s.n} tone={s.tone} mono d={s.d} />
      ))}
      {tcp ? (
        <Text x={346} y={194} text={bi("3 is resent; 4 waits for it", "تُعاد 3، وتنتظرها 4")} tone="danger" size={10.5} d={3500} />
      ) : (
        <>
          <Mark x={240} y={160} ok={false} r={9} d={2300} />
          <Text x={240} y={194} text={bi("3 is skipped", "تُتخطّى 3")} tone="danger" size={10.5} d={2400} />
        </>
      )}
      <Box x={16} y={214} w={120} h={44} label={bi("E-stop", "إيقاف الطوارئ")} tone="danger" d={400} />
      <Arrow pts={[[136, 236], [496, 236], [496, 76]]} tone="danger" head d={600} dur={700} />
      <Text x={316} y={254} text={bi("hard-wired, never on the network", "موصول بسلك مباشر، لا عبر الشبكة")} tone="danger" size={10.5} d={1000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof arm>>({
  "black-box": BlackBox,
  system: System,
  jobs: Jobs,
  network: Network,
});
