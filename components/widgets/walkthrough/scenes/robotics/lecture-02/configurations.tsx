"use client";

import { PLANAR, configOf, reach } from "@/lib/widgets/rob-lecture-02";
import type { configurations } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Mark, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Bar, Claw, Dot, Floor, Line, Pin, Poly, Shape, Tag, dir, ellipsePts, track, useMotion } from "./local";
import w from "../../../../Walkthrough.module.css";

const f1 = (v: number) => v.toFixed(1);
const pathOf = (pts: readonly Pt[], close = true) => pts.map((q, i) => `${i ? "L" : "M"}${f1(q[0])},${f1(q[1])}`).join(" ") + (close ? " Z" : "");

/* ---------- The workspace, swept from above ---------- */

function Envelope() {
  const C: Pt = [150, 148];
  const k = 120 / reach.outer;
  const rings = Array.from({ length: 12 }, (_, j) => -PLANAR.elbow + j * ((2 * PLANAR.elbow) / 12));
  const innerR = reach.inner * k;
  const p = useMotion(400, 2600, false);
  const t1 = 360 * p;
  const elbow = dir(C, PLANAR.l1 * k, t1);
  const tip = dir(elbow, PLANAR.l2 * k, t1 + 70);
  return (
    <Svg>
      {rings.map((t2, j) => (
        <Fade key={t2} d={500 + j * 110}>
          {Array.from({ length: 24 }, (_, i) => i * 15).map((a) => (
            <Dot key={a} at={dir(dir(C, PLANAR.l1 * k, a), PLANAR.l2 * k, a + t2)} r={2.3} tone="muted" />
          ))}
        </Fade>
      ))}
      <Fade d={2100}>
        <circle cx={C[0]} cy={C[1]} r={reach.outer * k} className={`${w.line} ${w.gold} ${w.dashed}`} style={{ strokeWidth: 2 }} />
        <circle cx={C[0]} cy={C[1]} r={innerR} className={`${w.shape} ${w.danger} ${w.dashed}`} style={{ fillOpacity: 0.5 }} />
      </Fade>
      <Bar a={C} b={elbow} t={12} />
      <Bar a={elbow} b={tip} t={9} tone="gold" />
      <circle cx={C[0]} cy={C[1]} r={14} className={w.under} />
      <circle cx={C[0]} cy={C[1]} r={14} className={`${w.shape} ${w.slate}`} />
      <Pin at={elbow} r={5} />
      <Text x={C[0] + reach.outer * k + 8} y={C[1]} text={`${reach.outer} mm`} size={11} mono tone="gold" anchor="start" d={2300} />
      <Tag at={[300, 252]} to={[C[0] + innerR * Math.SQRT1_2, C[1] + innerR * Math.SQRT1_2]} text={bi(`nearest: ${reach.inner} mm`, `الأقرب: ${reach.inner} مم`)} tone="danger" size={10.5} d={2300} />
      <Box x={344} y={28} w={200} h={46} label={bi("1 · sweep every joint", "1 · حرّك كل مفصل عبر مداه")} tone="outline" size={11.5} d={300} />
      <Box x={344} y={88} w={200} h={46} label={bi("2 · combine what is reached", "2 · اجمع ما وُصل إليه")} tone="gold" size={11.5} d={1200} />
      <Box x={344} y={148} w={200} h={46} label={bi("3 · subtract the dead zone", "3 · اطرح المنطقة الميتة")} tone="danger" size={11.5} d={2100} />
      <Text x={444} y={238} text={bi("seen from above", "منظر من أعلى")} tone="muted" size={10.5} d={300} />
    </Svg>
  );
}

/* ---------- Five serial configurations ---------- */

const WORKSPACE: Record<string, Bi> = {
  cartesian: bi("a rectangular box", "صندوق مستطيل"),
  cylindrical: bi("a hollow cylinder", "أسطوانة مجوّفة"),
  spherical: bi("a thick spherical shell (section)", "قشرة كروية سميكة (مقطع)"),
  articulated: bi("roughly spherical, hollow centre (section)", "كروية تقريبًا بمركز مجوّف (مقطع)"),
  scara: bi("a ring shape, extruded vertically", "شكل حلقي ممتد رأسيًا"),
};

function Code({ joints, d = 0 }: { joints: readonly string[]; d?: number }) {
  return (
    <>
      {joints.map((j, i) => (
        <Box key={i} x={22 + i * 36} y={14} w={32} h={32} r={6} label={j} tone={j === "P" ? "gold" : "navy"} mono size={16} d={d + i * 250} />
      ))}
    </>
  );
}

function Cartesian({ p }: { p: number }) {
  const cx = track([90, 180, 130], p);
  const zl = track([70, 120, 96], p);
  return (
    <>
      <Box x={40} y={70} w={14} h={180} r={3} tone="slate" d={0} />
      <Box x={236} y={70} w={14} h={180} r={3} tone="slate" d={0} />
      <Bar a={[40, 72]} b={[250, 72]} t={14} tone="slate" d={0} />
      <Box x={cx - 18} y={62} w={36} h={22} r={3} tone="gold" />
      <Bar a={[cx, 84]} b={[cx, 84 + zl]} t={10} tone="gold" />
      <Claw at={[cx, 84 + zl]} angle={-90} open={0.6} size={0.9} grip={8} />
      <Arrow pts={[[62, 100], [112, 100]]} tone="gold" both d={300} dur={300} />
      <Text x={87} y={114} text="x" size={12} mono tone="gold" d={400} />
      <Arrow pts={[[214, 108], [236, 90]]} tone="gold" both d={500} dur={300} />
      <Text x={214} y={84} text="y" size={12} mono tone="gold" d={600} />
      <Floor x={20} y={250} w={250} d={0} />
    </>
  );
}

function CartesianSpace() {
  const F = [[318, 96], [468, 96], [468, 206], [318, 206]] as const;
  const D: Pt = [46, -34];
  const B = F.map((q) => [q[0] + D[0], q[1] + D[1]] as Pt);
  return (
    <In d={800}>
      <Line pts={[B[3], B[0], B[1]]} tone="faint" dashed />
      <Line pts={[F[3], B[3]]} tone="faint" dashed />
      <Poly pts={[F[0], B[0], B[1], F[1]]} tone="gold" opacity={0.3} />
      <Poly pts={[F[1], B[1], B[2], F[2]]} tone="gold" opacity={0.22} />
      <Poly pts={F} tone="gold" opacity={0.16} />
    </In>
  );
}

function Cylindrical({ p }: { p: number }) {
  const cz = track([150, 100, 130], p);
  const rl = track([60, 140, 100], p);
  return (
    <>
      <Box x={60} y={236} w={80} h={14} r={3} tone="slate" d={0} />
      <Bar a={[100, 238]} b={[100, 62]} t={18} tone="slate" d={0} />
      <Bar a={[74, cz]} b={[100 + rl, cz]} t={12} tone="gold" />
      <Box x={86} y={cz - 13} w={28} h={26} r={3} tone="gold" />
      <Claw at={[100 + rl, cz + 6]} angle={-90} open={0.6} size={0.9} grip={8} />
      <Arrow pts={ellipsePts([100, 222], 34, 8, 200, 500)} tone="navy" d={300} />
      <Text x={146} y={226} text="θ" size={12} mono tone="heading" d={400} />
      <Arrow pts={[[122, 70], [122, 118]]} tone="gold" both d={500} dur={300} />
      <Text x={134} y={78} text="z" size={12} mono tone="gold" anchor="start" d={600} />
      <Arrow pts={[[150, cz - 24], [220, cz - 24]]} tone="gold" both d={700} dur={300} />
      <Text x={232} y={cz - 24} text="r" size={12} mono tone="gold" anchor="start" d={800} />
      <Floor x={20} y={250} w={250} d={0} />
    </>
  );
}

function CylinderSpace() {
  const cx = 424;
  const top = 76;
  const bot = 196;
  const R = 108;
  const r = 44;
  const ry = 22;
  const body = `M${cx - R},${top} L${cx - R},${bot} A${R},${ry} 0 0 0 ${cx + R},${bot} L${cx + R},${top} A${R},${ry} 0 0 1 ${cx - R},${top} Z`;
  return (
    <In d={800}>
      <Shape path={body} tone="gold" opacity={0.22} />
      <Line pts={[[cx - r, top], [cx - r, bot]]} tone="faint" dashed />
      <Line pts={[[cx + r, top], [cx + r, bot]]} tone="faint" dashed />
      <ellipse cx={cx} cy={top} rx={R} ry={ry} className={`${w.shape} ${w.gold}`} style={{ fillOpacity: 0.35 }} />
      <ellipse cx={cx} cy={top} rx={r} ry={ry * (r / R)} className={w.under} />
      <ellipse cx={cx} cy={top} rx={r} ry={ry * (r / R)} className={`${w.shape} ${w.danger}`} style={{ fillOpacity: 0.4 }} />
    </In>
  );
}

function Spherical({ p }: { p: number }) {
  const P0: Pt = [100, 150];
  const e = track([18, 40, 26], p);
  const ext = track([10, 70, 40], p);
  const sleeveEnd = dir(P0, 92, e);
  const end = dir(P0, 92 + ext, e);
  return (
    <>
      <Box x={60} y={236} w={80} h={14} r={3} tone="slate" d={0} />
      <Bar a={[100, 238]} b={[100, 160]} t={22} tone="slate" d={0} />
      <Bar a={dir(P0, 60, e)} b={end} t={9} tone="gold" />
      <Bar a={dir(P0, -14, e)} b={sleeveEnd} t={17} tone="slate" />
      <Pin at={P0} r={8} />
      <Claw at={end} angle={e} open={0.6} size={0.9} grip={8} />
      <Arrow pts={ellipsePts([100, 222], 34, 8, 200, 500)} tone="navy" d={300} />
      <Arrow pts={[dir(P0, 52, 52), dir(P0, 52, 62), dir(P0, 52, 72)]} tone="navy" d={500} dur={300} />
      <Arrow pts={[dir(P0, 150, e + 10), dir(P0, 190, e + 10)]} tone="gold" both d={700} dur={300} />
      <Floor x={20} y={250} w={250} d={0} />
    </>
  );
}

function ShellSection({ inner, from, to, O, R, d = 800 }: { inner: number; from: number; to: number; O: Pt; R: number; d?: number }) {
  const outer = ellipsePts(O, R, R, from, to, 30);
  const back = ellipsePts(O, inner, inner, to, from, 30);
  return (
    <In d={d}>
      <Shape path={pathOf([...outer, ...back])} tone="gold" opacity={0.3} />
    </In>
  );
}

function Articulated({ p }: { p: number }) {
  const S: Pt = [100, 164];
  const a1 = track([62, 80, 66], p);
  const a2 = track([-70, -100, -82], p);
  const E = dir(S, 86, a1);
  const T = dir(E, 82, a1 + a2);
  return (
    <>
      <Box x={60} y={232} w={80} h={18} r={3} tone="slate" d={0} />
      <Bar a={[100, 234]} b={S} t={24} tone="slate" d={0} />
      <Bar a={S} b={E} t={16} tone="slate" />
      <Bar a={E} b={T} t={13} tone="slate" />
      <Pin at={S} r={8} tone="navy" />
      <Pin at={E} r={7} tone="navy" />
      <Claw at={T} angle={a1 + a2} open={0.6} size={0.9} grip={8} />
      <Arrow pts={ellipsePts([100, 222], 34, 8, 200, 500)} tone="navy" d={300} />
      <Floor x={20} y={250} w={250} d={0} />
    </>
  );
}

function ArticulatedSpace() {
  const O: Pt = [420, 150];
  const R = 112;
  const a = dir(O, R, -32);
  const b = dir(O, R, 212);
  const outer = `M${f1(a[0])},${f1(a[1])} A${R},${R} 0 1 0 ${f1(b[0])},${f1(b[1])} Z`;
  const hole = `M${O[0] + 36},${O[1]} A36,36 0 1 0 ${O[0] - 36},${O[1]} A36,36 0 1 0 ${O[0] + 36},${O[1]} Z`;
  return (
    <In d={800}>
      <path d={`${outer} ${hole}`} fillRule="evenodd" className={`${w.shape} ${w.gold}`} style={{ fillOpacity: 0.28 }} />
      <circle cx={O[0]} cy={O[1]} r={5} style={{ fill: "var(--heading)" }} />
    </In>
  );
}

function Scara({ p }: { p: number }) {
  const qy = track([64, 104, 84], p);
  return (
    <>
      <Box x={78} y={112} w={44} h={138} r={4} tone="slate" d={0} />
      <Line pts={[[100, 40], [100, 100]]} tone="faint" dashed />
      <Line pts={[[200, 40], [200, 100]]} tone="faint" dashed />
      <Bar a={[100, 104]} b={[204, 104]} t={18} tone="slate" d={0} />
      <Bar a={[196, 118]} b={[284, 118]} t={15} tone="slate" d={0} />
      <Pin at={[100, 104]} r={7} tone="navy" />
      <Pin at={[200, 111]} r={6} tone="navy" />
      <Bar a={[280, qy]} b={[280, qy + 112]} t={9} tone="gold" />
      <Claw at={[280, qy + 112]} angle={-90} open={0.6} size={0.9} grip={8} />
      <Arrow pts={ellipsePts([100, 62], 22, 6, 200, 500)} tone="navy" d={300} />
      <Arrow pts={ellipsePts([200, 62], 22, 6, 200, 500)} tone="navy" d={450} />
      <Arrow pts={[[300, 120], [300, 190]]} tone="gold" both d={600} dur={300} />
      <Floor x={20} y={250} w={250} d={0} />
    </>
  );
}

function ScaraSpace() {
  const c: Pt = [430, 86];
  const R = 106;
  const r = 44;
  const k = 0.34;
  const top = [...ellipsePts(c, R, R * k, -140, 140, 30), ...ellipsePts(c, r, r * k, 140, -140, 30)];
  const drop = 104;
  const bottom = top.map((q) => [q[0], q[1] + drop] as Pt);
  return (
    <In d={800}>
      <Shape path={pathOf(bottom)} tone="gold" opacity={0.16} dashed />
      <Line pts={[[c[0] + R * Math.cos((140 * Math.PI) / 180), c[1] - R * k * Math.sin((140 * Math.PI) / 180)], [c[0] + R * Math.cos((140 * Math.PI) / 180), c[1] - R * k * Math.sin((140 * Math.PI) / 180) + drop]]} tone="faint" />
      <Line pts={[[c[0] + R * Math.cos((-140 * Math.PI) / 180), c[1] - R * k * Math.sin((-140 * Math.PI) / 180)], [c[0] + R * Math.cos((-140 * Math.PI) / 180), c[1] - R * k * Math.sin((-140 * Math.PI) / 180) + drop]]} tone="faint" />
      <Line pts={[[c[0] + R, c[1]], [c[0] + R, c[1] + drop]]} tone="faint" />
      <Shape path={pathOf(top)} tone="gold" opacity={0.32} />
    </In>
  );
}

function Serial({ control }: { control: string }) {
  const c = configOf(control);
  const p = useMotion(900, 2400, false);
  const robot = { cartesian: <Cartesian p={p} />, cylindrical: <Cylindrical p={p} />, spherical: <Spherical p={p} />, articulated: <Articulated p={p} />, scara: <Scara p={p} /> }[c.id];
  const space = {
    cartesian: <CartesianSpace />,
    cylindrical: <CylinderSpace />,
    spherical: <ShellSection O={[332, 214]} R={190} inner={86} from={-4} to={74} />,
    articulated: <ArticulatedSpace />,
    scara: <ScaraSpace />,
  }[c.id];
  return (
    <Svg>
      <Code joints={c.joints} d={200} />
      {robot}
      {space}
      <Text x={424} y={250} text={WORKSPACE[c.id]} tone="heading" size={11.5} d={1100} />
    </Svg>
  );
}

/* ---------- Spherical and SCARA: both RRP ---------- */

const RRP_ROWS: Record<string, readonly Bi[]> = {
  spherical: [bi("R · vertical axis", "R · محور رأسي"), bi("R · horizontal axis, ⊥ to 1", "R · محور أفقي، ⊥ على 1"), bi("P · along the arm", "P · على امتداد الذراع")],
  scara: [bi("R · vertical axis", "R · محور رأسي"), bi("R · vertical axis, ∥ to 1", "R · محور رأسي، ∥ مع 1"), bi("P · straight up and down", "P · لأعلى ولأسفل مباشرةً")],
};

function Rrp({ control }: { control: string }) {
  const scara = control === "scara";
  const p = useMotion(800, 2400, false);
  const rows = RRP_ROWS[scara ? "scara" : "spherical"];
  return (
    <Svg>
      {scara ? (
        <Scara p={p} />
      ) : (
        <>
          <Line pts={[[100, 40], [100, 160]]} tone="faint" dashed />
          <Spherical p={p} />
          <In d={300}>
            <circle cx={100} cy={150} r={13} className={`${w.line} ${w.danger}`} style={{ strokeWidth: 2.4 }} />
          </In>
        </>
      )}
      {rows.map((r, i) => (
        <g key={i}>
          <Box x={318} y={22 + i * 62} w={54} h={52} r={6} label={`J${i + 1}`} tone="navy" mono size={13} d={300 + i * 250} />
          <Box x={378} y={22 + i * 62} w={166} h={52} label={r} tone={i === 0 ? "outline" : "gold"} size={11} d={350 + i * 250} />
        </g>
      ))}
      <Chip x={430} y={220} text={bi("both read RRP", "كلاهما يُقرأ RRP")} tone="slate" center d={1300} />
      <Text x={430} y={254} text={scara ? bi("axes parallel", "محاور متوازية") : bi("axes perpendicular", "محاور متعامدة")} tone="muted" size={10.5} d={1400} />
    </Svg>
  );
}

/* ---------- Parallel robots ---------- */

function Parallel({ control }: { control: string }) {
  const parallel = control === "parallel";
  const p = useMotion(800, 2600, false);
  if (!parallel) {
    const B: Pt = [70, 226];
    const pts: Pt[] = [B, dir(B, 92, 64), dir(dir(B, 92, 64), 100, 8), dir(dir(dir(B, 92, 64), 100, 8), 84, -12)];
    const sag = [0, 4, 12, 24];
    const bent = pts.map((q, i) => [q[0], q[1] + sag[i] * (0.4 + 0.6 * p)] as Pt);
    return (
      <Svg>
        <Floor x={20} y={250} w={320} d={0} />
        <Box x={46} y={226} w={48} h={24} r={4} tone="slate" d={0} />
        <Line pts={bent} tone="danger" dashed width={2} />
        {pts.slice(1).map((q, i) => (
          <Bar key={i} a={pts[i]} b={q} t={15 - i * 3} tone="slate" d={100} />
        ))}
        {pts.slice(0, 3).map((q, i) => (
          <Pin key={i} at={q} r={7 - i} d={100} />
        ))}
        <Box x={pts[3][0] - 2} y={pts[3][1] - 4} w={34} h={28} r={3} tone="warn" d={200} />
        <Dot at={bent[3]} r={4.5} tone="danger" />
        <Text x={pts[3][0] - 10} y={pts[3][1] + 52} text={bi("the tip sags", "يهبط الطرف")} tone="danger" size={10.5} d={1500} />
        <Box x={330} y={30} w={190} h={44} label={bi("large workspace", "مساحة عمل كبيرة")} tone="outline" size={11.5} d={400} />
        <Mark x={532} y={52} ok d={500} />
        <Box x={330} y={86} w={190} h={44} label={bi("each joint carries the rest", "كل مفصل يحمل ما بعده")} tone="outline" size={11} d={700} />
        <Mark x={532} y={108} ok={false} d={800} />
        <Box x={330} y={142} w={190} h={44} label={bi("errors add along the chain", "الأخطاء تتراكم على السلسلة")} tone="outline" size={11} d={1000} />
        <Mark x={532} y={164} ok={false} d={1100} />
      </Svg>
    );
  }
  const lift = 14 * Math.sin(p * 2 * Math.PI);
  const tilt = 0.14 * Math.sin(p * 2 * Math.PI + 1.2);
  const pc: Pt = [176, 96 - lift];
  const onPlat = (x: number, dy: number): Pt => [x, pc[1] + dy + tilt * (x - pc[0])];
  const A: Pt = [78, 224];
  const Bb: Pt = [176, 230];
  const Cb: Pt = [274, 224];
  const P1 = onPlat(128, 3);
  const P2 = onPlat(224, 3);
  const P3 = onPlat(176, -6);
  const legs = [
    [A, P3],
    [Cb, P3],
    [A, P1],
    [Bb, P1],
    [Bb, P2],
    [Cb, P2],
  ] as const;
  const hull = ellipsePts(pc, 74, 10, 0, 360, 24).map((q) => [q[0], q[1] + tilt * (q[0] - pc[0])] as Pt);
  return (
    <Svg>
      <Floor x={20} y={250} w={320} d={0} />
      <Poly pts={[[52, 238], [300, 238], [292, 214], [60, 214]]} tone="slate" d={0} />
      {legs.map(([a, b], i) => (
        <Bar key={i} a={a} b={b} t={7} tone="gold" />
      ))}
      <Poly pts={hull} tone="navy" />
      <Box x={pc[0] - 34} y={pc[1] - 44 + tilt * -34} w={68} h={36} r={6} label={bi("cockpit", "قمرة القيادة")} tone="warn" size={10.5} />
      <Box x={330} y={30} w={190} h={44} label={bi("very stiff", "صلب جدًا")} tone="outline" size={11.5} d={400} />
      <Mark x={532} y={52} ok d={500} />
      <Box x={330} y={86} w={190} h={44} label={bi("fast: motors on the base", "سريع: المحركات على القاعدة")} tone="outline" size={11} d={700} />
      <Mark x={532} y={108} ok d={800} />
      <Box x={330} y={142} w={190} h={44} label={bi("small workspace", "مساحة عمل صغيرة")} tone="outline" size={11.5} d={1000} />
      <Mark x={532} y={164} ok={false} d={1100} />
      <Text x={436} y={230} text={bi("flight simulators, delta pickers", "محاكيات الطيران وروبوتات delta")} tone="muted" size={10.5} d={1300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof configurations>>({
  envelope: Envelope,
  serial: Serial,
  rrp: Rrp,
  parallel: Parallel,
});
