"use client";

import type { classify } from "@/lib/walkthroughs/robotics/lecture-01";
import { AFR, AXES, FAMILIES, GENERATIONS, JIRA, RIA_CLASSES, SPECIMENS, copes, isRiaRobot, machineShare, rangeOf, type Family } from "@/lib/widgets/rob-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Cylinder, Fade, Mark, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { ArmIcon, AuvIcon, DroneIcon, LoaderIcon, Plate, PlatformIcon, ReachArm, RoverIcon } from "./local";
import w from "../../../../Walkthrough.module.css";

/* ---------- JIRA's six classes ---------- */

const rowY = (n: number) => 56 + (n - 1) * 37;
const BAR_X = 246;
const BAR_W = 220;

function Jira({ control }: { control: string }) {
  const ria = control === "ria";
  const first = RIA_CLASSES[0];
  return (
    <Svg>
      <Text x={22} y={12} text={bi("class", "الفئة")} tone="muted" size={10.5} d={0} />
      <Text x={138} y={12} text={bi("name", "الاسم")} tone="muted" size={10.5} d={0} />
      <Text x={290} y={12} text={bi("human decides", "يقرّر الإنسان")} tone="slate" size={10.5} d={0} />
      <Text x={426} y={12} text={bi("machine decides", "تقرّر الآلة")} tone="gold" size={10.5} d={0} />
      <Arrow pts={[[548, 44], [548, 256]]} tone="faint" d={200} dur={700} />
      {JIRA.map((c, i) => {
        const y = rowY(c.n);
        const out = ria && !isRiaRobot(c.n);
        const share = machineShare(c.n);
        const d = 150 + i * 140;
        return (
          <g key={c.n}>
            <Box x={8} y={y - 14} w={28} h={28} r={14} label={String(c.n)} tone={out ? "muted" : "navy"} mono size={12} d={d} />
            <Box x={44} y={y - 16} w={190} h={32} r={8} label={c.name} tone={out ? "muted" : c.n === 6 ? "gold" : "outline"} size={10.5} d={d + 50} />
            {out ? null : (
              <>
                {share < 1 ? <Box x={BAR_X} y={y - 8} w={BAR_W * (1 - share)} h={16} r={4} tone="slate" d={d + 100} /> : null}
                {share > 0 ? <Box x={BAR_X + BAR_W * (1 - share)} y={y - 8} w={BAR_W * share} h={16} r={4} tone="gold" d={d + 100} /> : null}
              </>
            )}
          </g>
        );
      })}
      {ria ? (
        <>
          <Box x={BAR_X} y={rowY(1) - 16} w={BAR_W} h={rowY(first - 1) - rowY(1) + 32} r={8} label={bi("not robots: tooling or automation", "ليست روبوتات: أدوات أو أتمتة")} tone="muted" dashed size={10.5} d={1100} />
          <Arrow pts={[[478, rowY(first) - 14], [486, rowY(first) - 14], [486, rowY(6) + 14], [478, rowY(6) + 14]]} tone="gold" head={false} d={1300} dur={500} />
          <Text x={514} y={rowY(4) + 6} text="RIA" mono size={13} tone="gold" d={1700} />
          <Text x={514} y={rowY(4) + 26} text={bi("robots", "روبوتات")} size={11} tone="heading" d={1800} />
        </>
      ) : (
        <Text x={514} y={rowY(4) + 16} text={bi("autonomy", "الاستقلالية")} size={10.5} tone="muted" d={1100} />
      )}
    </Svg>
  );
}

/* ---------- AFR types, and the two kinds of path ---------- */

const afrY = (i: number) => 60 + i * 54;
const TAUGHT: readonly Pt[] = [
  [320, 206],
  [372, 96],
  [452, 178],
  [522, 76],
];
/** Points along a quadratic Bézier from a to b that bulges by `bend` (px) to the side. */
function arc(a: Pt, b: Pt, bend: number, n = 10): Pt[] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const c: Pt = [mx - ((b[1] - a[1]) / len) * bend, my + ((b[0] - a[0]) / len) * bend];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]] as Pt;
  });
}
const BENDS = [38, -46, 34];
const SEAM: readonly Pt[] = Array.from({ length: 25 }, (_, i) => {
  const t = i / 24;
  return [320 + t * 202, 206 - t * 130 - Math.sin(t * Math.PI * 2) * 26] as Pt;
});
const pathOf = (pts: readonly Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

function Afr({ control }: { control: string }) {
  const cp = control === "cp";
  const legs = TAUGHT.slice(1).map((b, i) => arc(TAUGHT[i], b, BENDS[i]));
  const ptpRoute = legs.flatMap((l, i) => (i ? l.slice(1) : l));
  return (
    <Svg>
      <Text x={92} y={22} text="AFR" mono size={12} tone="heading" d={0} />
      <Text x={234} y={22} text="JIRA" mono size={12} tone="heading" d={0} />
      {AFR.map((t, i) => {
        const y = afrY(i);
        const isC = t.letter === "C";
        const jira = t.jira.length > 1 ? bi(`classes ${rangeOf(t.jira)}`, `الفئات ${rangeOf(t.jira)}`) : bi(`class ${t.jira[0]}`, `الفئة ${t.jira[0]}`);
        return (
          <g key={t.letter}>
            <Box x={8} y={y - 20} w={32} h={40} r={8} label={t.letter} tone={isC ? "gold" : "navy"} mono size={14} d={100 + i * 150} />
            <Box x={46} y={y - 20} w={132} h={40} r={8} label={t.desc} tone={isC ? "gold" : "outline"} size={10.5} d={150 + i * 150} />
            <Arrow pts={[[180, y], [196, y]]} tone="slate" d={250 + i * 150} dur={150} />
            <Box x={198} y={y - 18} w={74} h={36} r={18} label={jira} tone="slate" size={10.5} d={300 + i * 150} />
          </g>
        );
      })}
      <Box x={290} y={34} w={262} h={216} r={12} tone="ghost" dashed d={700} />
      <Text x={421} y={22} text={bi("a type C robot's tool", "أداة روبوت من النوع C")} tone="muted" size={10.5} d={700} />
      {cp ? (
        <>
          <Fade d={900}>
            <path d={pathOf(SEAM)} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 7 }} />
          </Fade>
          <path d={pathOf(SEAM)} pathLength={1} className={`${w.line} ${w.gold} ${w.draw}`} style={{ "--d": "1300ms", "--dur": "2200ms", strokeWidth: 3 } as React.CSSProperties} />
          <Token pts={SEAM} d={1300} dur={2200} tone="navy" />
          <Chip x={421} y={226} text={bi("the path itself is controlled", "المسار نفسه مُتحكَّم فيه")} tone="gold" size={10.5} center d={2600} />
        </>
      ) : (
        <>
          {legs.map((l, i) => (
            <Fade key={i} d={1300 + i * 700}>
              <path d={pathOf(l)} className={`${w.line} ${w.muted} ${w.dashed}`} />
            </Fade>
          ))}
          <Token pts={ptpRoute} d={1200} dur={2400} tone="navy" />
          <Chip x={421} y={226} text={bi("between points: not specified", "بين النقاط: غير محدد")} tone="outline" size={10.5} center d={3000} />
        </>
      )}
      {cp
        ? [SEAM[0], SEAM[SEAM.length - 1]].map((p, i) => (
            <Fade key={i} d={900 + i * 120}>
              <circle cx={p[0]} cy={p[1]} r={5} style={{ fill: "var(--gold)", stroke: "var(--surface)", strokeWidth: 2 }} />
            </Fade>
          ))
        : TAUGHT.map((p, i) => (
            <g key={i}>
              <Fade d={900 + i * 120}>
                <circle cx={p[0]} cy={p[1]} r={6.5} style={{ fill: "var(--gold)", stroke: "var(--surface)", strokeWidth: 2 }} />
              </Fade>
              <Text x={p[0] + (i % 2 ? 18 : -18)} y={p[1] + (i % 2 ? -6 : 6)} text={`P${i + 1}`} mono size={11} tone="heading" d={950 + i * 120} />
            </g>
          ))}
    </Svg>
  );
}

/* ---------- Generations ---------- */

const SHOULDER: Pt = [100, 104];
const PART_X = 300;
const TAUGHT_X = 220;
const BELT_Y = 186;

function Generations({ control }: { control: string }) {
  const g = GENERATIONS.find((x) => String(x.n) === control) ?? GENERATIONS[0];
  const situation = g.n === 3 ? "new" : "shifted";
  const ok = copes(g.n, situation);
  const goX = ok ? PART_X : TAUGHT_X;
  const sees = g.n >= 2;
  const move = sees ? 1000 : 500;
  return (
    <Svg>
      <Box x={150} y={BELT_Y} w={222} h={10} r={5} tone="slate" d={0} />
      {[158, 364].map((x) => (
        <circle key={x} cx={x} cy={BELT_Y + 5} r={8} className={`${w.shape} ${w.navy}`} />
      ))}
      <Box x={TAUGHT_X - 16} y={BELT_Y - 20} w={32} h={20} r={3} tone="ghost" dashed d={100} />
      <Text x={TAUGHT_X} y={BELT_Y + 28} text={bi("taught spot", "الموضع المعلَّم")} tone="muted" size={10.5} d={150} />
      {situation === "new" ? (
        <Cylinder x={PART_X - 15} y={BELT_Y - 30} w={30} h={30} tone="gold" d={250} />
      ) : (
        <Plate x={PART_X - 16} y={BELT_Y - 20} w={32} h={20} tone="warn" />
      )}
      <Text x={PART_X} y={BELT_Y + 28} text={situation === "new" ? bi("a new part", "قطعة جديدة") : bi("the part", "القطعة")} tone="heading" size={10.5} d={250} />
      {sees ? (
        <>
          <Box x={338} y={48} w={30} h={20} r={4} tone="navy" d={300} />
          <circle cx={353} cy={58} r={5} className={`${w.shape} ${w.gold}`} />
          <Arrow pts={[[346, 70], [PART_X - 10, BELT_Y - 22]]} tone="slate" dashed head={false} d={500} />
          <Arrow pts={[[360, 70], [PART_X + 12, BELT_Y - 22]]} tone="slate" dashed head={false} d={500} />
          <Text x={353} y={20} text={g.n === 3 ? bi("camera + AI", "كاميرا + ذكاء اصطناعي") : bi("camera", "كاميرا")} tone="slate" size={10.5} d={400} />
        </>
      ) : null}
      <ReachArm sx={SHOULDER[0]} sy={SHOULDER[1]} l1={110} l2={115} rest={[-60, 75]} target={[goX, BELT_Y - (situation === "new" ? 30 : 20)]} at={move} dur={1100} baseY={236} />
      <Mark x={goX + 28} y={BELT_Y - 44} ok={ok} d={move + 1300} />
      <Chip
        x={226}
        y={258}
        text={ok ? (g.n === 3 ? bi("grasps a part it has never seen", "يقبض على قطعة لم يرها من قبل") : bi("reaches the part where it is", "يصل إلى القطعة حيث هي")) : bi("grips the air where the part used to be", "يقبض على الهواء حيث كانت القطعة")}
        tone={ok ? "success" : "danger"}
        size={11}
        center
        d={move + 1500}
      />
      <Box x={396} y={86} w={156} h={156} r={12} tone="outline" d={100} />
      <Text x={474} y={104} text={g.name} tone="gold" size={12.5} d={150} />
      <Text x={474} y={134} text={g.period} tone="muted" size={10.5} d={200} />
      <Text x={474} y={170} text={g.sensing} tone="heading" size={10.5} d={300} />
      <Text x={474} y={210} text={g.decides} tone="heading" size={10.5} d={400} />
    </Svg>
  );
}

/* ---------- One robot on every axis ---------- */

const treeY = (i: number) => 36 + i * 52;
const LEAF_X = 272;
const LEAF_STEP = 94;
const LEAF_W = 86;

function SpecimenIcon({ id }: { id: keyof typeof SPECIMENS }) {
  if (id === "loader") return <LoaderIcon x={63} y={100} s={0.9} d={0} />;
  if (id === "rover") return <RoverIcon x={63} y={100} s={1.15} d={0} />;
  return <ArmIcon x={56} y={100} s={1.2} tool="torch" d={0} />;
}

function Tree({ control }: { control: string }) {
  const id = (control in SPECIMENS ? control : "arm") as keyof typeof SPECIMENS;
  const spec = SPECIMENS[id];
  return (
    <Svg>
      <SpecimenIcon id={id} />
      <Box x={8} y={112} w={112} h={56} r={12} label={spec.name} tone="gold" size={12} d={100} />
      {AXES.map((axis, i) => {
        const y = treeY(i);
        const chosen = axis.options.findIndex((o) => o.id === spec.values[axis.id]);
        const cx = LEAF_X + chosen * LEAF_STEP + LEAF_W / 2;
        const d = 300 + i * 220;
        return (
          <g key={axis.id}>
            <Arrow pts={[[120, 140], [134, 140], [134, y], [148, y]]} tone="gold" d={d} dur={250} />
            <Box x={150} y={y - 20} w={98} h={40} r={8} label={axis.name} tone="navy" size={11} d={d + 50} />
            <Arrow pts={[[248, y], [LEAF_X, y]]} tone="faint" head={false} d={d + 100} dur={150} />
            {axis.options.map((o, k) => (
              <Box key={o.id} x={LEAF_X + k * LEAF_STEP} y={y - 16} w={LEAF_W} h={32} r={16} label={o.label} tone={k === chosen ? "gold" : "outline"} size={10.5} d={d + 120} />
            ))}
            <Arrow pts={[[248, y + 4], [258, y + 4], [258, y + 23], [cx, y + 23], [cx, y + 17]]} tone="gold" d={d + 250} dur={300} />
          </g>
        );
      })}
    </Svg>
  );
}

/* ---------- Function families ---------- */

const FAMILY_COLS: readonly { family: Family; label: Bi; x: number }[] = [
  { family: "manip", label: bi("Manipulator", "ذراع آلية"), x: 64 },
  { family: "motion", label: bi("Motion generator", "مولِّد حركة"), x: 172 },
  { family: "loco", label: bi("Locomotor", "روبوت تنقّل"), x: 280 },
  { family: "swimfly", label: bi("Swimming", "سابح"), x: 388 },
  { family: "swimfly", label: bi("Flying", "طائر"), x: 496 },
];

function FamilyIcon({ i, x }: { i: number; x: number }) {
  if (i === 0) return <ArmIcon x={x - 8} y={128} s={1.3} />;
  if (i === 1) return <PlatformIcon x={x} y={128} s={1.2} />;
  if (i === 2) return <RoverIcon x={x} y={128} s={1.1} />;
  if (i === 3) return <AuvIcon x={x} y={128} s={1.1} />;
  return <DroneIcon x={x} y={128} s={1.1} />;
}

function Functions({ control }: { control: string }) {
  const family = (control in FAMILIES ? control : "manip") as Family;
  const fam = FAMILIES[family];
  const cols = FAMILY_COLS.map((c, i) => ({ ...c, i })).filter((c) => c.family === family);
  const left = Math.min(...cols.map((c) => c.x)) - 52;
  const right = Math.max(...cols.map((c) => c.x)) + 52;
  const exX = fam.examples.length === 3 ? [140, 280, 420] : [200, 360];
  return (
    <Svg>
      {FAMILY_COLS.map((c, i) => (
        <g key={i} opacity={c.family === family ? 1 : 0.4}>
          <FamilyIcon i={i} x={c.x} />
          <path d={`M${c.x - 40},134 h80`} className={`${w.line} ${i === 0 || i === 2 ? w.slate : w.faint}`} style={{ strokeWidth: i === 0 || i === 2 ? 2.4 : 1.4 }} />
          <Text x={c.x} y={152} text={c.label} size={10.5} tone={c.family === family ? "heading" : "muted"} />
        </g>
      ))}
      <Fade d={300}>
        <rect x={left} y={22} width={right - left} height={152} rx={12} className={`${w.line} ${w.gold}`} style={{ strokeWidth: 2.4 }} />
      </Fade>
      {fam.examples.map((e, k) => (
        <Chip key={k} x={exX[k]} y={202} w={132} text={e} tone="outline" size={10.5} center d={600 + k * 180} />
      ))}
      <Chip x={280} y={252} w={220} text={fam.problem} tone="gold" size={12} center d={1300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof classify>>({
  jira: Jira,
  afr: Afr,
  generations: Generations,
  tree: Tree,
  function: Functions,
});
