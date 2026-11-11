"use client";

import { FREE_BODY, GEARED, RAIL, SCARA_WRIST, SIX_AXIS, chain, dofOf } from "@/lib/widgets/rob-lecture-02";
import type { degrees } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Fade, In, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Bar, Claw, Count, Dot, Floor, Line, Pedestal, Pin, Poly, dir, ellipsePts, screen, stage, track, useMotion } from "./local";
import w from "../../../../Walkthrough.module.css";

const dofLabel = (n: number): Bi =>
  n === 1 ? bi("1 DOF", "درجة حرية واحدة (1 DOF)") : n === 2 ? bi("2 DOF", "درجتا حرية (2 DOF)") : bi(`${n} DOF`, `${n} درجات حرية (${n} DOF)`);

/* ---------- A block on a rail ---------- */

function Rail({ control }: { control: string }) {
  const turn = control === "slide-turn";
  const n = dofOf(turn ? RAIL.slideTurn : RAIL.slide);
  const p = useMotion(600, 1800);
  const bx = 130 + 170 * p;
  const theta = 140 * p;
  const face: Pt = [bx + 37, 150];
  const mark: Pt = [face[0] + 9 * Math.cos((theta * Math.PI) / 180), face[1] - 26 * Math.sin((theta * Math.PI) / 180)];
  return (
    <Svg>
      <Bar a={[50, 150]} b={[510, 150]} t={12} tone="muted" d={0} />
      <Box x={36} y={126} w={18} h={48} r={3} tone="slate" d={0} />
      <Box x={506} y={126} w={18} h={48} r={3} tone="slate" d={0} />
      <Box x={bx - 37} y={122} w={74} h={56} r={6} tone="gold" />
      {turn ? (
        <>
          <ellipse cx={face[0]} cy={face[1]} rx={9} ry={26} className={`${w.shape} ${w.gold}`} style={{ filter: "brightness(1.08)" }} />
          <Line pts={[face, mark]} tone="navy" width={2.4} />
          <Arrow pts={ellipsePts([440, 150], 9, 26, 70, 330)} tone="navy" d={500} dur={600} />
          <Text x={440} y={196} text="θ" size={14} mono tone="heading" d={900} />
        </>
      ) : null}
      <Line pts={[[93, 200], [Math.max(95, bx - 37), 200]]} tone="gold" width={2.2} />
      <Line pts={[[93, 190], [93, 210]]} tone="faint" />
      <Line pts={[[bx - 37, 190], [bx - 37, 210]]} tone="faint" />
      <Text x={(93 + bx - 37) / 2 + 4} y={222} text="d" size={14} mono tone="gold" />
      <Box x={36} y={22} w={170} h={58} label={bi("Variables", "المتغيرات")} sub={turn ? "d, θ" : "d"} tone="outline" size={12} d={200} />
      <Box x={354} y={22} w={170} h={58} label={bi("Degrees of freedom", "درجات الحرية")} sub={dofLabel(n)} tone="navy" size={12} d={300} />
    </Svg>
  );
}

/* ---------- A free body: six motions ---------- */

function FreeBody() {
  const O: Pt = [168, 168];
  const X: Pt = [292, 168];
  const Y: Pt = dir(O, 82, 37);
  const Z: Pt = [168, 46];
  const D: Pt = [16, -12];
  const f = [
    [O[0] - 22, O[1] + 16],
    [O[0] + 22, O[1] + 16],
    [O[0] + 22, O[1] - 16],
    [O[0] - 22, O[1] - 16],
  ] as const;
  const back = f.map((q) => [q[0] + D[0], q[1] + D[1]] as Pt);
  const motions = [
    { axis: X, label: "x" },
    { axis: Y, label: "y" },
    { axis: Z, label: "z" },
  ];
  const rot = [
    ellipsePts([262, 168], 7, 18, 60, 320),
    ellipsePts(dir(O, 62, 37), 14, 14, 100, 380),
    ellipsePts([168, 76], 22, 7, 150, 410),
  ];
  return (
    <Svg>
      <In d={0}>
        <Poly pts={[f[3], f[2], back[2], back[3]]} tone="muted" />
        <Poly pts={[f[1], back[1], back[2], f[2]]} tone="outline" />
        <Poly pts={f} tone="slate" />
      </In>
      {motions.map((m, i) => (
        <g key={m.label}>
          <Arrow pts={[O, m.axis]} tone="gold" d={300 + i * 350} dur={400} width={2.4} />
          <Text x={dir(m.axis, 12, i === 0 ? 0 : i === 1 ? 37 : 90)[0]} y={dir(m.axis, 12, i === 0 ? 0 : i === 1 ? 37 : 90)[1]} text={m.label} size={13} mono tone="heading" d={400 + i * 350} />
        </g>
      ))}
      {rot.map((pts, i) => (
        <Arrow key={i} pts={pts} tone="navy" d={1350 + i * 350} dur={450} />
      ))}
      {FREE_BODY.map((m, i) => (
        <Box
          key={i}
          x={330}
          y={14 + i * 41}
          w={214}
          h={36}
          r={18}
          label={m.kind === "t" ? bi(`${i + 1} · along ${m.axis}`, `${i + 1} · على امتداد ${m.axis}`) : bi(`${i + 1} · about ${m.axis}`, `${i + 1} · حول ${m.axis}`)}
          tone={m.kind === "t" ? "gold" : "navy"}
          size={11.5}
          d={300 + i * 350}
        />
      ))}
      <Box x={18} y={208} w={196} h={60} label={dofLabel(FREE_BODY.length)} sub={bi("3 position + 3 orientation", "3 للموضع + 3 للاتجاه")} tone="outline" size={13} d={2500} />
    </Svg>
  );
}

/* ---------- One DOF per joint ---------- */

function Tally({ n, x, y, d, step, split }: { n: number; x: number; y: number; d: number; step: number; split: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} x={x + i * 23} y={y} w={19} h={19} r={4} tone={i < split ? "gold" : "navy"} d={d + i * step} />
      ))}
    </>
  );
}

function ArmDof({ control }: { control: string }) {
  const scara = control === "scara";
  const joints = scara ? SCARA_WRIST : SIX_AXIS;
  const n = dofOf(joints);
  const step = 380;
  const d0 = 500;
  const p = useMotion(d0 + 2 * step, 900);
  if (scara) {
    const quillY = 84 + 26 * Math.sin(p * Math.PI);
    return (
      <Svg>
        <Floor x={40} y={252} w={340} d={0} />
        <Box x={98} y={104} w={44} h={148} r={4} tone="slate" d={0} />
        <Line pts={[[120, 30], [120, 104]]} tone="faint" dashed />
        <Line pts={[[240, 30], [240, 86]]} tone="faint" dashed />
        <In d={100}>
          <Bar a={[120, 96]} b={[240, 96]} t={20} />
          <Bar a={[240, 110]} b={[350, 110]} t={16} />
        </In>
        <Bar a={[350, quillY]} b={[350, quillY + 112]} t={10} tone="muted" />
        <Pin at={[350, quillY + 112]} r={5} />
        <Claw at={[350, quillY + 118]} angle={-90} open={0.6} size={0.9} grip={8} />
        <Count at={[120, 96]} n={1} tone="gold" d={d0} />
        <Count at={[240, 103]} n={2} tone="gold" d={d0 + step} />
        <Count at={[372, 150]} n={3} tone="gold" d={d0 + 2 * step} />
        <Count at={[372, quillY + 112]} n={4} tone="navy" d={d0 + 3 * step} />
        <Box x={398} y={26} w={148} h={46} label={bi("1–3: position", "1–3: الموضع")} tone="gold" size={12} d={200} />
        <Box x={398} y={82} w={148} h={46} label={bi("4: roll only", "4: لفّ فقط")} tone="navy" size={12} d={300} />
        <Tally n={n} x={410} y={148} d={d0} step={step} split={3} />
        <Text x={472} y={200} text={bi(`${n} joints → ${n} DOF`, `${n} مفاصل ← ${n} درجات حرية`)} tone="heading" size={12.5} d={d0 + 4 * step} />
        <Text x={472} y={246} text={bi("no pitch, no yaw", "لا ميل ولا انعراج")} tone="danger" size={11} d={d0 + 4 * step + 200} />
      </Svg>
    );
  }
  const S: Pt = [150, 172];
  const E: Pt = [205, 90];
  const W: Pt = [330, 110];
  const u: Pt = [(W[0] - E[0]) / Math.hypot(W[0] - E[0], W[1] - E[1]), (W[1] - E[1]) / Math.hypot(W[0] - E[0], W[1] - E[1])];
  const J4: Pt = [(E[0] + W[0]) / 2, (E[1] + W[1]) / 2];
  const J6: Pt = [W[0] + 30 * u[0], W[1] + 30 * u[1]];
  const ang = (Math.atan2(-(W[1] - E[1]), W[0] - E[0]) * 180) / Math.PI;
  return (
    <Svg>
      <Floor x={40} y={252} w={340} d={0} />
      <Pedestal x={150} top={208} floor={252} wTop={40} wBottom={70} d={0} />
      <Box x={124} y={194} w={52} h={16} r={4} tone="slate" d={0} />
      <In d={100}>
        <Bar a={[150, 196]} b={S} t={22} tone="slate" />
        <Bar a={S} b={E} t={18} />
        <Bar a={E} b={W} t={14} />
        <Bar a={W} b={J6} t={9} tone="navy" />
        <Claw at={J6} angle={ang} open={0.6} size={0.9} />
      </In>
      {joints.map((_, i) => (
        <Count key={i} at={[[150, 202] as Pt, S, E, J4, W, J6][i]} n={i + 1} tone={i < 3 ? "gold" : "navy"} d={d0 + i * step} />
      ))}
      <Box x={398} y={26} w={148} h={46} label={bi("1–3: position", "1–3: الموضع")} tone="gold" size={12} d={200} />
      <Box x={398} y={82} w={148} h={46} label={bi("4–6: orientation", "4–6: الاتجاه")} tone="navy" size={12} d={300} />
      <Tally n={n} x={403} y={148} d={d0} step={step} split={3} />
      <Text x={472} y={200} text={bi(`${n} joints → ${n} DOF`, `${n} مفاصل ← ${n} درجات حرية`)} tone="heading" size={12.5} d={d0 + 6 * step} />
      <Text x={472} y={246} text={bi("any position, any orientation", "أي موضع، بأي اتجاه")} tone="success" size={11} d={d0 + 6 * step + 200} />
    </Svg>
  );
}

/* ---------- Roll, pitch, yaw ---------- */

function Wrist({ control }: { control: string }) {
  const p = useMotion(600, 2200, false);
  const swing = track([0, 32, -26, 20], p);
  const pitch = control === "pitch" ? swing : 0;
  const yaw = control === "yaw" ? swing : 0;
  const roll = control === "roll" ? 300 * p : 0;
  const view = (pin: Pt, start: number, a: number, showRoll: boolean) => {
    const hEnd = dir(pin, 55, a);
    const tip = dir(pin, 102, a);
    const face = dir(pin, 55, a);
    const m: Pt = [face[0] + 5 * Math.cos((roll * Math.PI) / 180), face[1] - 10 * Math.sin((roll * Math.PI) / 180)];
    return (
      <>
        <Line pts={[[start - 10, pin[1]], [pin[0] + 120, pin[1]]]} tone="faint" dashed />
        <Bar a={[start, pin[1]]} b={[pin[0] - 10, pin[1]]} t={22} tone="slate" />
        <Bar a={pin} b={hEnd} t={14} tone="navy" />
        <Bar a={hEnd} b={tip} t={4} tone="muted" />
        <Pin at={pin} r={7} />
        {showRoll ? (
          <>
            <ellipse cx={face[0]} cy={face[1]} rx={5} ry={10} className={`${w.shape} ${w.gold}`} />
            <Line pts={[face, m]} tone="navy" width={2} />
          </>
        ) : null}
      </>
    );
  };
  const left: Pt = [160, 140];
  const right: Pt = [420, 140];
  return (
    <Svg>
      <Text x={140} y={28} text={bi("Side view", "منظر جانبي")} tone="heading" size={12} d={0} />
      <Text x={410} y={28} text={bi("Top view", "منظر علوي")} tone="heading" size={12} d={0} />
      <Line pts={[[280, 52], [280, 236]]} tone="faint" />
      {view(left, 30, pitch, control === "roll")}
      {view(right, 300, -yaw, control === "roll")}
      {control === "roll" ? (
        <>
          <Arrow pts={ellipsePts([236, 140], 7, 22, 70, 330)} tone="gold" d={300} />
          <Arrow pts={ellipsePts([496, 140], 7, 22, 70, 330)} tone="gold" d={300} />
          <Text x={280} y={232} text={bi("about the arm axis", "حول محور الذراع")} tone="gold" size={11.5} d={500} />
        </>
      ) : null}
      {control === "pitch" ? (
        <>
          <Arrow pts={ellipsePts(left, 112, 112, 30, -28)} tone="gold" both d={300} dashed />
          <Text x={140} y={232} text={bi("up and down", "لأعلى ولأسفل")} tone="gold" size={11.5} d={500} />
          <Text x={410} y={232} text={bi("no change", "لا تغيير")} tone="muted" size={11} d={500} />
        </>
      ) : null}
      {control === "yaw" ? (
        <>
          <Arrow pts={ellipsePts(right, 112, 112, 30, -28)} tone="gold" both d={300} dashed />
          <Text x={410} y={232} text={bi("left and right", "يمينًا ويسارًا")} tone="gold" size={11.5} d={500} />
          <Text x={140} y={232} text={bi("no change", "لا تغيير")} tone="muted" size={11} d={500} />
        </>
      ) : null}
    </Svg>
  );
}

/* ---------- Independent motions ---------- */

function Independent({ control }: { control: string }) {
  const geared = control === "geared";
  const p = useMotion(700, 2200);
  const B: Pt = [110, 214];
  const L = [100, 80] as const;
  const t1 = geared ? 15 + 30 * p : 20 + 25 * stage(p, 0, 0.5);
  const t2 = geared ? GEARED.ratio * t1 : 40 - 60 * stage(p, 0.5, 1);
  const pts = chain([0, 0], L, [t1, t2]).map((q) => screen(B, q));
  const reach: Pt[] = [];
  if (geared) for (let a = 0; a <= 60; a += 2.5) reach.push(screen(B, chain([0, 0], L, [a, GEARED.ratio * a])[2]));
  else for (let a = 0; a <= 60; a += 6) for (let b = -40; b <= 90; b += 13) reach.push(screen(B, chain([0, 0], L, [a, b])[2]));
  const n = geared ? GEARED.independent : GEARED.joints;
  const fmt = (v: number) => `${Math.round(v)}°`.replace("-", "−");
  return (
    <Svg>
      <Floor x={40} y={240} w={260} d={0} />
      <Box x={86} y={214} w={48} h={26} r={4} tone="slate" d={0} />
      <Fade d={300}>
        {reach.map((q, i) => (
          <Dot key={i} at={q} r={2.2} tone="muted" />
        ))}
      </Fade>
      <Bar a={pts[0]} b={pts[1]} t={14} />
      <Bar a={pts[1]} b={pts[2]} t={11} />
      <Pin at={pts[0]} r={7} />
      <Pin at={pts[1]} r={6} tone={geared ? "gold" : "outline"} />
      <Dot at={pts[2]} r={4} tone="gold" />
      {geared ? (
        <In d={400}>
          <circle cx={B[0]} cy={B[1]} r={14} className={`${w.line} ${w.gold} ${w.dashed}`} />
          <circle cx={pts[1][0]} cy={pts[1][1]} r={13} className={`${w.line} ${w.gold} ${w.dashed}`} />
        </In>
      ) : null}
      <Text x={200} y={255} text={bi("dots: everywhere the tip can go", "النقاط: كل ما يصل إليه الطرف")} tone="muted" size={10.5} d={300} />
      <Box x={370} y={26} w={170} h={40} label={`θ₁ = ${fmt(t1)}`} tone="outline" mono size={13} d={200} />
      <Box x={370} y={76} w={170} h={40} label={`θ₂ = ${fmt(t2)}`} tone={geared ? "gold" : "outline"} mono size={13} d={300} />
      {geared ? <Text x={455} y={134} text={bi("θ₂ = 2 × θ₁, always", "θ₂ = 2 × θ₁ دائمًا")} tone="gold" size={11} d={500} /> : <Text x={455} y={134} text={bi("each set on its own", "كلٌّ يُضبط وحده")} tone="muted" size={11} d={500} />}
      <Box x={370} y={170} w={170} h={64} label={dofLabel(n)} sub={geared ? bi("one curve to move along", "منحنى واحد للحركة عليه") : bi("a whole area to reach", "مساحة كاملة للوصول")} tone="navy" size={13} d={600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof degrees>>({
  rail: Rail,
  "free-body": FreeBody,
  arm: ArmDof,
  wrist: Wrist,
  independent: Independent,
});

