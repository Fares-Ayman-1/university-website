"use client";

import type { examples } from "@/lib/walkthroughs/artificial-intelligence/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import {
  DIRS,
  PUZZLE_GOAL,
  PUZZLE_START,
  TILE_ACTIONS,
  VACUUM_EDGES,
  VACUUM_STATES,
  arrangements,
  blankTarget,
  legalMoves,
  moveBlank,
  noDirt,
  reachable,
  thousands,
  type Dir,
} from "@/lib/widgets/ai-lecture-02";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Board, Dot, Stroke, Vac, arcPts, cellCentre, polar } from "./local";

/* ---------- The vacuum world's state space ---------- */

const W = 36;
const H = 28;
const COL = [30, 160, 300, 430];
const ROW = [70, 170];
/** Pairs that differ only in the robot's square sit side by side; Suck moves between pairs. */
const POS: Record<number, Pt> = { 1: [COL[0], ROW[0]], 2: [COL[1], ROW[0]], 3: [COL[2], ROW[0]], 4: [COL[3], ROW[0]], 5: [COL[0], ROW[1]], 6: [COL[1], ROW[1]], 7: [COL[2], ROW[1]], 8: [COL[3], ROW[1]] };

function edgeGeometry(from: number, to: number, action: string): { pts: Pt[]; label: Pt } {
  const [fx, fy] = POS[from];
  const [tx, ty] = POS[to];
  if (action === "Right") return { pts: [[fx + 2 * W + 2, fy + 8], [tx - 2, ty + 8]], label: [(fx + 2 * W + tx) / 2, fy - 2] };
  if (action === "Left") return { pts: [[fx - 2, fy + 20], [tx + 2 * W + 2, ty + 20]], label: [(fx + tx + 2 * W) / 2, fy + 36] };
  if (fx === tx) return { pts: [[fx + W, fy + H + 2], [tx + W, ty - 2]], label: [fx + W + 12, (fy + H + ty) / 2] };
  // Suck within a row: around the pair in between, above the top row and below the bottom one.
  const above = fy === ROW[0];
  const yy = above ? fy - 26 : fy + H + 28;
  return {
    pts: [
      [fx + W, above ? fy - 2 : fy + H + 2],
      [fx + W, yy],
      [tx + W, yy],
      [tx + W, above ? ty - 2 : ty + H + 2],
    ],
    label: [(fx + tx) / 2 + W, above ? yy - 9 : yy - 10],
  };
}

function Vacuum() {
  return (
    <Svg>
      {VACUUM_EDGES.map((e, i) => {
        const g = edgeGeometry(e.from, e.to, e.action);
        return <Arrow key={i} pts={g.pts} tone={e.action === "Suck" ? "gold" : "slate"} d={1000 + i * 90} dur={300} label={e.action[0]} labelAt={g.label} labelTone={e.action === "Suck" ? "gold" : "slate"} />;
      })}
      {VACUUM_STATES.map((n, i) => (
        <g key={n}>
          <Text x={POS[n][0] + 4} y={POS[n][1] - 8} text={String(n)} anchor="start" mono size={10.5} tone="heading" d={100 + i * 100} />
          <Vac x={POS[n][0]} y={POS[n][1]} n={n} cw={W} ch={H} goal={noDirt(n)} d={100 + i * 100} />
        </g>
      ))}
      <Text x={280} y={252} text={bi("goal: no dirt (states 7 and 8)", "الهدف: لا أوساخ (الحالتان 7 و 8)")} size={12} tone="success" d={2300} />
    </Svg>
  );
}

/* ---------- The 8-puzzle ---------- */

function Puzzle() {
  return (
    <Svg>
      <Board x={60} y={44} tiles={PUZZLE_START} cell={40} d={0} />
      <Text x={120} y={182} text={bi("Start state", "الحالة الابتدائية")} size={12} tone="heading" d={100} />
      <Arrow pts={[[196, 104], [364, 104]]} tone="gold" d={500} dur={500} label={bi("slide tiles", "حرّك القطع")} labelAt={[280, 76]} labelTone="gold" />
      <Board x={380} y={44} tiles={PUZZLE_GOAL} cell={40} tone={() => "success"} d={900} />
      <Text x={440} y={182} text={bi("Goal state", "الحالة الهدف")} size={12} tone="heading" d={1000} />
      <Chip x={112} y={240} text={bi("state: where each tile is", "الحالة: موضع كل قطعة")} tone="slate" center d={1300} />
      <Chip x={316} y={240} text={bi("goal test: = goal state", "اختبار الهدف: = الحالة الهدف")} tone="slate" center d={1500} />
      <Chip x={482} y={240} text={bi("cost: 1 per move", "التكلفة: 1 لكل حركة")} tone="slate" center d={1700} />
    </Svg>
  );
}

const CELL = 44;
const LEFT: Pt = [40, 58];
const RIGHT: Pt = [388, 58];
const NAME: Record<Dir, string> = { up: "Up", down: "Down", left: "Left", right: "Right" };

function Blank({ control }: { control: string }) {
  const dir = (DIRS as readonly string[]).includes(control) ? (control as Dir) : "left";
  const target = blankTarget(PUZZLE_START, dir);
  const after = moveBlank(PUZZLE_START, dir);
  if (target === null || after === null) return null;
  const tile = PUZZLE_START[target];
  const from = cellCentre(LEFT[0], LEFT[1], PUZZLE_START.indexOf(0), 3, CELL);
  const to = cellCentre(LEFT[0], LEFT[1], target, 3, CELL);
  const towards = (a: Pt, b: Pt, f: number): Pt => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const moves = legalMoves(PUZZLE_START).length;
  return (
    <Svg>
      <Text x={LEFT[0] + 66} y={40} text="s" mono size={12} tone="heading" d={0} />
      <Board x={LEFT[0]} y={LEFT[1]} tiles={PUZZLE_START} cell={CELL} tone={(t) => (t === tile ? "gold" : undefined)} d={0} />
      <Arrow pts={[towards(to, from, 0.3), towards(to, from, 0.75)]} tone="gold" width={2.4} d={500} dur={300} />
      <Token pts={[to, from]} d={700} dur={600} />
      <Arrow pts={[[182, 124], [378, 124]]} tone="gold" d={1000} dur={400} label={bi(`blank ${NAME[dir].toLowerCase()}`, `الخانة الفارغة ${{ up: "إلى أعلى", down: "إلى أسفل", left: "إلى اليسار", right: "إلى اليمين" }[dir]}`)} labelAt={[280, 142]} labelTone="gold" />
      <Text x={RIGHT[0] + 66} y={40} text={`RESULT(s, ${NAME[dir]})`} mono size={12} tone="heading" d={1300} />
      <Board x={RIGHT[0]} y={RIGHT[1]} tiles={after} cell={CELL} tone={(t) => (t === tile ? "gold" : undefined)} d={1300} />
      <Chip x={150} y={240} text={bi(`${moves} moves of the blank`, `${moves} حركات للخانة الفارغة`)} tone="success" center d={1700} />
      <Chip x={400} y={240} text={bi(`vs ${TILE_ACTIONS} tile moves, ${moves} legal`, `مقابل ${TILE_ACTIONS} حركة للقطع، ${moves} منها مسموحة`)} tone="muted" center d={1900} />
    </Svg>
  );
}

function Count({ control }: { control: string }) {
  const size = control === "four" ? 4 : 3;
  const cells = size * size;
  const goal = [...Array.from({ length: cells - 1 }, (_, i) => i + 1), 0];
  const swapped = [goal[1], goal[0], ...goal.slice(2)];
  const cell = size === 3 ? 16 : 14;
  const half = thousands(reachable(size));
  const halves = [
    { x: 30, tiles: goal, tone: "success" as const, sub: bi("reachable from the start", "يمكن الوصول إليها من البداية") },
    { x: 284, tiles: swapped, tone: "muted" as const, sub: bi("two tiles swapped: never reached", "تبديل قطعتين: لا تُبلغ أبدًا") },
  ];
  return (
    <Svg>
      <Text x={280} y={26} text={bi(`${cells}! = ${thousands(arrangements(size))} arrangements`, `${thousands(arrangements(size))} ترتيبًا`)} size={12.5} tone="heading" d={0} />
      {halves.map((h, i) => (
        <g key={i}>
          <Box x={h.x} y={56} w={246} h={160} tone={h.tone} d={300 + i * 500} />
          <Board x={h.x + 123 - (size * cell) / 2} y={68} tiles={h.tiles} size={size} cell={cell} d={400 + i * 500} />
          <Text x={h.x + 123} y={146} text={half} mono size={17} tone="heading" d={500 + i * 500} />
          <Text x={h.x + 123} y={178} text={h.sub} size={11} tone={i ? "muted" : "success"} d={600 + i * 500} />
        </g>
      ))}
      <Mark x={280} y={136} ok={false} d={1400} />
      <Chip
        x={280}
        y={250}
        text={size === 3 ? bi(`9!/2 = ${half} states`, `${half} حالة`) : bi("finding the optimal solution is NP-hard", "إيجاد الحل الأمثل مسألة NP-hard")}
        tone="gold"
        center
        d={1600}
      />
    </Svg>
  );
}

/* ---------- Robotic assembly ---------- */

const BASE: Pt = [110, 206];
const L1 = 110;
const L2 = 100;

function Assembly({ control }: { control: string }) {
  const discrete = control === "discrete";
  const a1 = discrete ? 60 : 58.27;
  const a2 = discrete ? -75 : -71.62;
  const j1 = polar(BASE, L1, a1);
  const end = polar(j1, L2, a1 + a2);
  const sweep = discrete ? [30, 45, 60] : Array.from({ length: 13 }, (_, i) => 34 + ((a1 - 34) * i) / 12);
  const path = sweep.map((t) => polar(polar(BASE, L1, t), L2, t + a2));
  const fmtAngle = (v: number) => `${v < 0 ? "−" : ""}${Math.abs(v)}°`;
  return (
    <Svg>
      <Text x={24} y={40} text={`θ₁ = ${fmtAngle(a1)}`} anchor="start" mono size={12.5} tone="heading" d={0} />
      <Text x={24} y={62} text={`θ₂ = ${fmtAngle(a2)}`} anchor="start" mono size={12.5} tone="heading" d={100} />
      {discrete ? (
        Array.from({ length: 11 }, (_, i) => 15 + i * 15).map((t) => <Stroke key={t} pts={[polar(BASE, 28, t), polar(BASE, t === a1 ? 44 : 36, t)]} tone={t === a1 ? "gold" : "faint"} width={t === a1 ? 2.4 : 1.6} d={200 + t * 3} />)
      ) : (
        <>
          <Stroke pts={arcPts(BASE, 34, 0, 180, 36)} tone="faint" dashed d={200} />
          <Stroke pts={arcPts(BASE, 34, 0, a1)} tone="gold" width={2.4} d={400} />
        </>
      )}
      <Box x={200} y={176} w={96} h={30} label={bi("parts", "الأجزاء")} tone="outline" size={11} d={300} />
      <Box x={70} y={206} w={80} h={16} r={4} tone="slate" d={0} />
      <Stroke pts={[BASE, j1]} tone="slate" width={8} round d={500} />
      <Stroke pts={[j1, end]} tone="slate" width={7} round d={700} />
      <Dot at={BASE} r={7} tone="slate" ring d={500} />
      <Dot at={j1} r={6.5} tone="slate" ring d={700} />
      <Box x={end[0] - 10} y={end[1] + 4} w={20} h={14} r={2} tone="gold" d={900} />
      <Token pts={path} d={1100} dur={1400} />
      <Box x={316} y={36} w={228} h={44} label={bi("States: joint angles + parts", "الحالات: زوايا المفاصل + الأجزاء")} tone="slate" size={12} d={1200} />
      <Box x={316} y={88} w={228} h={44} label={bi("Actions: continuous joint motions", "الأفعال: حركات متصلة للمفاصل")} tone="slate" size={12} d={1400} />
      <Box x={316} y={140} w={228} h={44} label={bi("Goal: complete, robot not in it", "الهدف: تجميع كامل دون الروبوت")} tone="slate" size={12} d={1600} />
      <Box x={316} y={192} w={228} h={44} label={bi("Path cost: time to execute", "تكلفة المسار: زمن التنفيذ")} tone="slate" size={12} d={1800} />
      <Chip
        x={150}
        y={252}
        text={discrete ? bi("every 15°: a finite grid of states", "كل 15°: شبكة منتهية من الحالات") : bi("infinitely many states", "عدد لا نهائي من الحالات")}
        tone={discrete ? "success" : "danger"}
        center
        d={2000}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof examples>>({
  vacuum: Vacuum,
  puzzle: Puzzle,
  blank: Blank,
  count: Count,
  assembly: Assembly,
});
