"use client";

import { road } from "@/lib/widgets/ai-lecture-02";
import { GOAL, GREEDY_ROUTE, GREEDY_RUN, H_SLD, OPTIMAL_ROUTE, greedyLoop } from "@/lib/widgets/ai-lecture-04";
import type { greedy } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Mark, Text, Token, Svg, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, RunStep } from "./local";

function Rule() {
  const kids = GREEDY_RUN.steps[0].added;
  const cx = [110, 280, 450];
  const best = GREEDY_RUN.steps[0].fringe[0].city;
  const shortest = [...kids].sort((a, b) => a.g - b.g)[0].city;
  return (
    <Svg>
      <Box x={235} y={44} w={90} h={28} label="Arad" tone="navy" size={12} d={0} />
      {kids.map((n, i) => (
        <Arrow key={n.city} pts={[[280, 74], [cx[i], 116]]} tone={n.city === best ? "gold" : "faint"} head={false} d={200 + i * 100} dur={260} label={`${n.g} km`} labelAt={[(280 + cx[i]) / 2 + (i === 1 ? 32 : i === 0 ? -34 : 34), 86]} />
      ))}
      {kids.map((n, i) => (
        <Box key={n.city} x={cx[i] - 66} y={118} w={132} h={44} label={n.city} sub={`h = ${n.h}`} tone={n.city === best ? "gold" : "outline"} size={12.5} subSize={11} d={400 + i * 100} />
      ))}
      <Chip x={cx[kids.findIndex((n) => n.city === best)]} y={196} text={bi("lowest h: expanded next", "أقل h: تُوسَّع تاليًا")} tone="gold" center size={10.5} d={1000} />
      <Chip x={cx[kids.findIndex((n) => n.city === shortest)]} y={196} text={bi("shortest road, but ignored", "أقصر طريق، لكنه مُتجاهَل")} tone="muted" center size={10.5} d={1300} />
      <Text x={280} y={252} text="f(n) = h(n)" mono size={14} tone="heading" d={1500} />
    </Svg>
  );
}

function Run({ control }: { control: string }) {
  return <RunStep run={GREEDY_RUN} k={Number(control)} kind="h" routeCost={GREEDY_RUN.cost!} />;
}

const AT: Record<string, Pt> = { Arad: [56, 150], Sibiu: [176, 150], Fagaras: [306, 78], Rimnicu_Vilcea: [256, 214], Pitesti: [386, 214], Bucharest: [494, 150] };
const LABEL = (c: string) => (c === "Rimnicu_Vilcea" ? "Rimnicu V." : c);

function Cost() {
  const edges = [...GREEDY_ROUTE.slice(1).map((c, i) => [GREEDY_ROUTE[i], c]), ...OPTIMAL_ROUTE.slice(2).map((c, i) => [OPTIMAL_ROUTE[i + 1], c])];
  const onGreedy = (a: string, b: string) => GREEDY_ROUTE.some((c, i) => c === a && GREEDY_ROUTE[i + 1] === b);
  const total = (route: readonly string[]) => route.slice(1).reduce((s, c, i) => s + road(route[i], c), 0);
  const kmAt = (a: Pt, b: Pt, up: boolean): Pt => [(a[0] + b[0]) / 2 + (up ? -8 : 8), (a[1] + b[1]) / 2 + (up ? -12 : 14)];
  return (
    <Svg>
      {edges.map(([a, b], i) => {
        const g = onGreedy(a, b) && !(a === "Arad");
        const pa = AT[a];
        const pb = AT[b];
        const up = pb[1] <= pa[1] && !(a === "Arad");
        return (
          <Arrow
            key={`${a}-${b}`}
            pts={[pa, pb]}
            tone={a === "Arad" ? "navy" : g ? "danger" : "success"}
            head={false}
            width={2.4}
            d={300 + i * 200}
            dur={300}
            label={String(road(a, b))}
            labelAt={a === "Arad" ? [116, 138] : kmAt(pa, pb, up || (a === "Fagaras"))}
            labelTone="muted"
          />
        );
      })}
      {Object.entries(AT).map(([c, [x, y]]) => (
        <Box key={c} x={x - 40} y={y - 14} w={80} h={28} label={LABEL(c)} tone={c === GOAL ? "gold" : "outline"} size={11} d={0} />
      ))}
      <Text x={306} y={52} text={`g = 239, h = ${H_SLD.Fagaras}`} mono size={10.5} tone="danger" d={900} />
      <Text x={256} y={242} text={`g = 220, h = ${H_SLD.Rimnicu_Vilcea}`} mono size={10.5} tone="success" d={1300} />
      <Chip x={480} y={86} text={bi(`via Fagaras: ${total(GREEDY_ROUTE)} km`, `عبر Fagaras: ${total(GREEDY_ROUTE)} km`)} tone="danger" center size={10.5} d={1600} />
      <Chip x={462} y={256} text={bi(`via Pitesti: ${total(OPTIMAL_ROUTE)} km`, `عبر Pitesti: ${total(OPTIMAL_ROUTE)} km`)} tone="success" center size={10.5} d={1900} />
      <Text x={96} y={232} text={bi(`${total(GREEDY_ROUTE) - total(OPTIMAL_ROUTE)} km too long`, `أطول بـ ${total(GREEDY_ROUTE) - total(OPTIMAL_ROUTE)} km`)} tone="danger" size={11.5} d={2200} />
    </Svg>
  );
}

const LOOP_AT: Record<string, Pt> = { Fagaras: [70, 176], Bucharest: [196, 176], Urziceni: [322, 176], Vaslui: [450, 120], Iasi: [360, 64], Neamt: [190, 64] };
const LOOP_ROADS: [string, string][] = [
  ["Fagaras", "Bucharest"],
  ["Bucharest", "Urziceni"],
  ["Urziceni", "Vaslui"],
  ["Vaslui", "Iasi"],
  ["Iasi", "Neamt"],
];

function Loop() {
  const seq = greedyLoop(6);
  const tone = (c: string) => (c === "Fagaras" ? "success" : c === "Iasi" ? "navy" : c === "Neamt" ? "warn" : "outline");
  const I = LOOP_AT.Iasi;
  const N = LOOP_AT.Neamt;
  return (
    <Svg>
      {LOOP_ROADS.map(([a, b], i) => (
        <Arrow key={i} pts={[LOOP_AT[a], LOOP_AT[b]]} tone="faint" head={false} d={i * 80} dur={260} />
      ))}
      {Object.entries(LOOP_AT).map(([c, [x, y]]) => (
        <Box key={c} x={x - 40} y={y - 14} w={80} h={28} label={c} tone={tone(c)} size={11} d={100} />
      ))}
      <Arrow pts={[[I[0] - 44, I[1] - 8], [N[0] + 44, N[1] - 8]]} tone="danger" d={700} dur={300} />
      <Arrow pts={[[N[0] + 44, N[1] + 8], [I[0] - 44, I[1] + 8]]} tone="danger" d={1000} dur={300} />
      <Token pts={[[I[0] - 46, I[1] - 8], [N[0] + 46, N[1] - 8], [N[0] + 46, N[1] + 8], [I[0] - 46, I[1] + 8], [I[0] - 46, I[1] - 8], [N[0] + 46, N[1] - 8]]} d={1300} dur={2600} tone="danger" r={5} />
      <Text x={190} y={96} text={bi("looks closest, dead end", "تبدو الأقرب، طريق مسدود")} tone="danger" size={10} d={800} />
      <Text x={456} y={150} text={bi("looks farther: never tried", "تبدو أبعد: لا تُجرَّب أبدًا")} tone="muted" size={10} d={900} />
      <Text x={70} y={204} text={bi("goal", "الهدف")} tone="success" size={10.5} d={300} />
      <Text x={30} y={244} text={bi("removed:", "المُزالة:")} anchor="start" tone="muted" size={10.5} d={1500} />
      {seq.map((c, i) => (
        <Box key={i} x={104 + i * 66} y={234} w={60} h={22} r={4} label={c} tone={c === "Neamt" ? "warn" : "navy"} size={10} d={1600 + i * 180} />
      ))}
      <Text x={508} y={245} text="…" size={14} tone="danger" d={1600 + seq.length * 180} />
      <Mark x={536} y={245} ok={false} d={1700 + seq.length * 180} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof greedy>>({ rule: Rule, run: Run, cost: Cost, loop: Loop });
