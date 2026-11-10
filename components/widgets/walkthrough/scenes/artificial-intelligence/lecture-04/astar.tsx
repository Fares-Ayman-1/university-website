"use client";

import { ASTAR_RUN, GOAL, GREEDY_RUN, fringeBefore, goalFirstSeen, type BestFirstRun } from "@/lib/widgets/ai-lecture-04";
import type { astar } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Mark, Text, Svg, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, FringeList, RomaniaMap, RunStep, SIDE_MAP, fringeCells, shortName } from "./local";

/** The A* fringe right after Sibiu is expanded: where Rimnicu Vilcea and Fagaras compete. */
const afterSibiu = fringeBefore(ASTAR_RUN, 2);
const pick = (city: string) => afterSibiu.find((n) => n.city === city)!;

const F_AT: Record<string, Pt> = { Arad: [56, 112], Sibiu: [180, 112], Rimnicu_Vilcea: [270, 176], Fagaras: [320, 64], Bucharest: [496, 150] };

function Formula({ control }: { control: string }) {
  const id = control === "fagaras" ? "Fagaras" : "Rimnicu_Vilcea";
  const other = id === "Fagaras" ? "Rimnicu_Vilcea" : "Fagaras";
  const n = pick(id);
  const at = F_AT[id];
  const rows = ["Rimnicu_Vilcea", "Fagaras"].map((c) => pick(c));
  return (
    <Svg>
      <Arrow pts={[[90, 112], [146, 112]]} tone="navy" width={2.6} d={200} dur={260} label="140" labelAt={[118, 100]} />
      <Arrow pts={[F_AT.Sibiu, at].map((p, i) => (i === 0 ? ([p[0] + 30, p[1] + (id === "Fagaras" ? -8 : 10)] as Pt) : ([p[0] - 36, p[1]] as Pt)))} tone="navy" width={2.6} d={460} dur={260} label={String(n.g - 140)} labelAt={id === "Fagaras" ? [244, 78] : [214, 160]} />
      <Arrow pts={[[at[0] + 50, at[1]], [452, 150]]} tone="gold" dashed d={900} />
      <Box x={F_AT.Arad[0] - 34} y={F_AT.Arad[1] - 14} w={68} h={28} label="Arad" tone="navy" size={11.5} d={0} />
      <Box x={F_AT.Sibiu[0] - 34} y={F_AT.Sibiu[1] - 14} w={68} h={28} label="Sibiu" tone="navy" size={11.5} d={100} />
      <Box x={F_AT[other][0] - 50} y={F_AT[other][1] - 14} w={100} h={28} label={shortName(other)} tone="muted" size={11} d={100} />
      <Box x={at[0] - 50} y={at[1] - 14} w={100} h={28} label={shortName(id)} tone="gold" size={11} d={300} />
      <Box x={F_AT.Bucharest[0] - 44} y={F_AT.Bucharest[1] - 14} w={88} h={28} label="Bucharest" tone="success" size={11} d={100} />
      <Text x={id === "Fagaras" ? 470 : 380} y={id === "Fagaras" ? 96 : 150} text={`h = ${n.h}`} mono size={11.5} tone="gold" d={1000} />
      <Text x={160} y={id === "Fagaras" ? 152 : 64} text={`g = ${n.g}`} mono size={11.5} tone="heading" d={700} />
      <FringeList
        x={150}
        y={206}
        head={["n", "g + h", "f"]}
        headH={20}
        rows={rows.map((r) => fringeCells(r, "f"))}
        cw={[110, 90, 60]}
        rh={22}
        size={11}
        frontTone="gold"
        mark={(r) => (id === "Fagaras" && r === 1 ? "warn" : undefined)}
        d={1200}
        stagger={150}
      />
      <Text x={480} y={240} text={id === "Fagaras" ? bi("greedy would pick this", "يختارها البحث الجشع") : bi("A* picks this", "يختارها A*")} tone={id === "Fagaras" ? "danger" : "gold"} size={10.5} d={1700} />
    </Svg>
  );
}

function Run({ control }: { control: string }) {
  return <RunStep run={ASTAR_RUN} k={Number(control)} kind="f" routeCost={ASTAR_RUN.cost!} />;
}

function Wait() {
  const seen = goalFirstSeen(ASTAR_RUN)!;
  const before = fringeBefore(ASTAR_RUN, seen.step + 1).slice(0, 5);
  const after = fringeBefore(ASTAR_RUN, seen.step + 2).slice(0, 5);
  const cw = [92, 70, 40];
  const isLateGoal = (n: (typeof before)[number]) => n.city === GOAL && n.f === seen.f;
  return (
    <Svg>
      <Text x={20} y={46} text={bi("after Fagaras", "بعد Fagaras")} anchor="start" tone="muted" size={10.5} d={0} />
      <FringeList x={20} y={74} head={["n", "g + h", "f"]} rows={before.map((n) => fringeCells(n, "f"))} cw={cw} rh={22} size={10.5} mark={(r) => (isLateGoal(before[r]) ? "warn" : undefined)} d={100} stagger={120} />
      <Arrow pts={[[230, 158], [330, 158]]} tone="gold" d={1000} dur={400} />
      <Text x={280} y={130} text={bi("expand Pitesti", "وسّع Pitesti")} tone="gold" size={10.5} d={1100} />
      <Text x={338} y={46} text={bi("after Pitesti", "بعد Pitesti")} anchor="start" tone="muted" size={10.5} d={1300} />
      <FringeList
        x={338}
        y={74}
        head={["n", "g + h", "f"]}
        rows={after.map((n) => fringeCells(n, "f"))}
        cw={cw}
        rh={22}
        size={10.5}
        frontTone="success"
        mark={(r) => (isLateGoal(after[r]) ? "warn" : undefined)}
        d={1400}
        stagger={120}
      />
      <Text x={132} y={226} text={bi(`goal at f = ${seen.f}: not yet`, `هدف عند f = ${seen.f}: ليس بعد`)} tone="slate" size={10.5} d={900} />
      <Text x={450} y={226} text={bi(`goal at f = ${ASTAR_RUN.cost}: removed`, `هدف عند f = ${ASTAR_RUN.cost}: يُزال`)} tone="success" size={10.5} d={2200} />
      <Chip x={280} y={262} text={bi("the goal test happens on removal", "يحدث اختبار الهدف عند الإزالة")} tone="gold" center size={10.5} d={2500} />
    </Svg>
  );
}

function Versus({ control }: { control: string }) {
  const run: BestFirstRun = control === "astar" ? ASTAR_RUN : GREEDY_RUN;
  const removed = [...new Set(run.order)];
  const route = run.path!;
  const g = route.map((c) => run.steps.find((s) => s.removed.city === c && s.removed.path.join() === route.slice(0, route.indexOf(c) + 1).join())!.removed.g);
  const best = control === "astar";
  return (
    <Svg>
      <RomaniaMap
        box={SIDE_MAP}
        look={(c) => (c === GOAL ? "success" : removed.includes(c) ? "navy" : "muted")}
        lines={[{ path: route, tone: "gold", d: 400 + removed.length * 150 }]}
        badges={removed.map((c, i) => ({ city: c, n: i + 1, d: 300 + i * 150 }))}
      />
      <Text x={330} y={46} text={bi("route, with g", "الطريق مع g")} anchor="start" tone="muted" size={10.5} d={0} />
      {route.map((c, i) => (
        <Box key={c} x={330} y={72 + i * 26} w={150} h={22} r={4} label={`${shortName(c).padEnd(11)}${String(g[i]).padStart(4)}`} tone={c === GOAL ? (best ? "success" : "danger") : "outline"} size={10.5} mono d={600 + i * 120} />
      ))}
      <Mark x={496} y={72 + (route.length - 1) * 26 + 11} ok={best} r={9} d={1700} />
      <Chip x={384} y={246} text={bi(`${run.order.length} nodes removed`, `${run.order.length} عقد مُزالة`)} tone="slate" center size={10.5} d={1300} />
      <Chip x={496} y={246} text={bi(`cost ${run.cost} km`, `التكلفة ${run.cost} km`)} tone={best ? "success" : "danger"} center size={10.5} d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof astar>>({ formula: Formula, run: Run, wait: Wait, versus: Versus });
