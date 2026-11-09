"use client";

import type { formulation } from "@/lib/walkthroughs/artificial-intelligence/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import {
  DEAD_END,
  OPTIMAL,
  PUZZLE_GOAL,
  PUZZLE_START,
  VACUUM_GOALS,
  VACUUM_STATES,
  VIA_FAGARAS,
  cityName,
  moveBlank,
  neighbours,
  noDirt,
  road,
  runningCost,
  vacuumResult,
  type Board,
} from "@/lib/widgets/ai-lecture-02";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Table, Text, Token, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Vac } from "./local";

/** "724 / 5_6 / 831" */
const flat = (b: Board) => [0, 1, 2].map((r) => b.slice(r * 3, r * 3 + 3).map((t) => (t ? String(t) : "_")).join("")).join(" / ");

const PARTS = [bi("Initial state", "الحالة الابتدائية"), bi("Actions", "الأفعال"), bi("Transition model", "نموذج الانتقال"), bi("Goal test", "اختبار الهدف"), bi("Path cost", "تكلفة المسار")];

const AFTER_LEFT = moveBlank(PUZZLE_START, "left");

const VALUES: Record<string, (string | Bi)[]> = {
  romania: ["In(Arad)", "Arad→Zerind, Arad→Sibiu, …", "RESULT(Arad, Arad→Zerind) = Zerind", "x = In(Bucharest)", bi("sum of road lengths in km", "مجموع أطوال الطرق بالكيلومتر")],
  vacuum: [bi("any state, e.g. 5", "أي حالة، مثل 5"), "Left, Right, Suck, NoOp", `RESULT(5, Right) = ${vacuumResult(5, "Right")}`, `NoDirt(x): ${VACUUM_GOALS.join(", ")}`, bi("1 per action", "1 لكل فعل")],
  puzzle: [flat(PUZZLE_START), "Up, Down, Left, Right", `RESULT(s, Left) = ${AFTER_LEFT ? flat(AFTER_LEFT) : "-"}`, `s = ${flat(PUZZLE_GOAL)}`, bi("1 per move", "1 لكل حركة")],
};

function Components({ control }: { control: string }) {
  const values = VALUES[control] ?? VALUES.romania;
  const rowY = (i: number) => 26 + i * 50;
  return (
    <Svg>
      {PARTS.map((p, i) => (
        <Box key={i} x={100} y={rowY(i)} w={170} h={44} label={p} tone="navy" size={12.5} d={i * 150} />
      ))}
      {values.map((v, i) => (
        <Box key={i} x={280} y={rowY(i)} w={264} h={44} label={v} tone={i === 1 || i === 2 ? "slate" : "outline"} mono={typeof v === "string"} size={typeof v === "string" ? 11 : 12} d={300 + i * 180} />
      ))}
      <Arrow pts={[[96, 82], [86, 82], [86, 164], [96, 164]]} tone="gold" head={false} d={1300} dur={400} />
      <Chip x={46} y={116} text="S(x)" tone="gold" center d={1500} />
      <Text x={46} y={144} text={bi("slides", "الشرائح")} size={10.5} tone="gold" d={1600} />
    </Svg>
  );
}

const SUCC_AT: Record<string, Pt> = { Zerind: [220, 70], Sibiu: [220, 140], Timisoara: [220, 210] };

function Successor({ control }: { control: string }) {
  const split = control === "split";
  const roads = neighbours("Arad").sort((a, b) => SUCC_AT[a.to][1] - SUCC_AT[b.to][1]);
  const edgeEnd = (c: string): Pt => [SUCC_AT[c][0] - (c.length * 6.9 + 22) / 2 - 3, SUCC_AT[c][1]];
  return (
    <Svg>
      {roads.map((r, i) => (
        <Arrow key={r.to} pts={[[98, 140 + (SUCC_AT[r.to][1] - 140) * 0.08], edgeEnd(r.to)]} tone="gold" d={300 + i * 250} dur={350} />
      ))}
      <Chip x={70} y={140} text="Arad" tone="navy" center d={0} />
      {roads.map((r, i) => (
        <Chip key={r.to} x={SUCC_AT[r.to][0]} y={SUCC_AT[r.to][1]} text={r.to} tone="outline" center d={400 + i * 250} />
      ))}
      {split ? (
        <>
          {roads.map((r, i) => (
            <Fade key={r.to} d={1900 + i * 200}>
              <Chip x={SUCC_AT[r.to][0]} y={SUCC_AT[r.to][1]} text={r.to} tone="success" center />
            </Fade>
          ))}
          <Table
            x={290}
            y={60}
            cols={["a ∈ ACTIONS(Arad)", "RESULT(Arad, a)"]}
            rows={roads.map((r) => [`Arad→${r.to}`, r.to])}
            cw={[140, 116]}
            rh={30}
            d={1100}
            stagger={200}
            cell={(_, c) => (c === 1 ? "success" : undefined)}
          />
          <Text x={418} y={206} text={bi("two functions, the same information", "دالتان، والمعلومات نفسها")} size={12} tone="heading" d={2400} />
        </>
      ) : (
        <>
          <Table x={290} y={60} cols={["S(Arad)"]} rows={roads.map((r) => [`(Arad→${r.to}, ${r.to})`])} cw={256} rh={30} d={1100} stagger={250} head="gold" />
          <Text x={418} y={206} text={bi("one function: a set of pairs", "دالة واحدة: مجموعة من الأزواج")} size={12} tone="heading" d={2200} />
        </>
      )}
    </Svg>
  );
}

const TEST_CITIES = ["Arad", "Sibiu", "Fagaras", "Pitesti", "Bucharest"];

function GoalTest({ control }: { control: string }) {
  if (control === "implicit") {
    const x = (i: number) => 32 + i * 64;
    return (
      <Svg>
        <Box x={150} y={30} w={260} h={44} label="NoDirt(x) ?" tone="navy" mono d={0} />
        {VACUUM_STATES.map((n, i) => (
          <g key={n}>
            <Arrow pts={[[280, 76], [x(i) + 26, 110]]} tone="faint" d={300 + i * 60} dur={300} />
            <Text x={x(i) + 26} y={121} text={String(n)} mono size={10.5} tone="heading" d={400 + i * 60} />
            <Vac x={x(i)} y={132} n={n} cw={26} ch={20} goal={noDirt(n)} d={400 + i * 60} />
            <Mark x={x(i) + 26} y={176} ok={noDirt(n)} d={1100 + i * 90} />
          </g>
        ))}
        <Text
          x={280}
          y={226}
          text={bi(`${VACUUM_GOALS.length} states pass: ${VACUUM_GOALS.join(" and ")}`, `تجتازه حالتان: ${VACUUM_GOALS.join(" و ")}`)}
          size={12.5}
          tone="success"
          d={2000}
        />
      </Svg>
    );
  }
  const x = (i: number) => 64 + i * 108;
  return (
    <Svg>
      <Box x={150} y={30} w={260} h={44} label="x = In(Bucharest) ?" tone="navy" mono d={0} />
      {TEST_CITIES.map((c, i) => {
        const goal = c === "Bucharest";
        return (
          <g key={c}>
            <Arrow pts={[[280, 76], [x(i), 126]]} tone="faint" d={300 + i * 80} dur={300} />
            <Chip x={x(i)} y={140} text={c} tone={goal ? "success" : "outline"} center d={400 + i * 80} />
            <Mark x={x(i)} y={182} ok={goal} d={1000 + i * 120} />
          </g>
        );
      })}
      <Text x={280} y={226} text={bi("1 state passes", "تجتازه حالة واحدة")} size={12.5} tone="success" d={1800} />
    </Svg>
  );
}

const SCALE = 1.05;
const BAR_X = 60;

function PathCost() {
  const path = OPTIMAL.path ?? [];
  const run = runningCost(path);
  const bx = (i: number) => BAR_X + run[i] * SCALE;
  const steps = path.slice(1).map((c, i) => road(path[i], c));
  return (
    <Svg>
      <Text x={280} y={36} text={`g = ${steps.join(" + ")} = ${run[run.length - 1]}`} mono size={13} tone="heading" d={2400} />
      {steps.map((c, i) => (
        <Box key={i} x={bx(i)} y={110} w={c * SCALE} h={40} r={0} label={String(c)} tone={i % 2 ? "outline" : "slate"} mono size={12} d={300 + i * 450} />
      ))}
      <Token pts={[[BAR_X, 102], [bx(path.length - 1), 102]]} d={300} dur={1800} />
      {path.map((c, i) => (
        <g key={c}>
          <Arrow pts={[[bx(i), 152], [bx(i), 160]]} tone="faint" head={false} d={200 + i * 450} dur={100} />
          <Text x={bx(i)} y={172} text={cityName(c)} size={11} tone="heading" d={200 + i * 450} />
          {i > 0 ? <Chip x={bx(i)} y={78} text={String(run[i])} tone="gold" center d={300 + i * 450} /> : null}
        </g>
      ))}
      <Chip x={280} y={226} text={bi("c(x, a, y) ≥ 0, so g never goes down", "لا تقل تكلفة أي خطوة عن 0، فلا تتناقص g أبدًا")} tone="success" center d={2600} />
    </Svg>
  );
}

const SOL_SCALE = 0.74;

function Solution() {
  const rows: { path: readonly string[]; verdict: Bi; tone: Tone }[] = [
    { path: DEAD_END, verdict: bi("not a solution", "ليس حلًا"), tone: "danger" },
    { path: VIA_FAGARAS, verdict: bi("a solution", "حل"), tone: "slate" },
    { path: OPTIMAL.path ?? [], verdict: bi("optimal", "الأمثل"), tone: "success" },
  ];
  return (
    <Svg>
      {rows.map((row, r) => {
        const y = 56 + r * 76;
        const run = runningCost(row.path);
        const d = r * 800;
        const end = 40 + run[run.length - 1] * SOL_SCALE;
        return (
          <g key={r}>
            <Text x={40} y={y - 14} text={row.path.map(cityName).join(" → ")} mono size={11} anchor="start" tone="heading" d={d} />
            {row.path.slice(1).map((c, i) => (
              <Box key={c} x={40 + run[i] * SOL_SCALE} y={y} w={(run[i + 1] - run[i]) * SOL_SCALE} h={28} r={0} label={String(run[i + 1] - run[i])} tone={i % 2 ? "outline" : row.tone} mono size={11} d={d + 150 + i * 150} />
            ))}
            <Text x={end + 8} y={y + 14} text={`${run[run.length - 1]} km`} mono size={11.5} anchor="start" tone="heading" d={d + 600} />
            <Chip x={498} y={y + 14} text={row.verdict} tone={row.tone} center d={d + 700} />
          </g>
        );
      })}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof formulation>>({
  components: Components,
  successor: Successor,
  "goal-test": GoalTest,
  "path-cost": PathCost,
  solution: Solution,
});
