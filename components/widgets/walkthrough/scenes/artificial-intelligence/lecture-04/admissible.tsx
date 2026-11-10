"use client";

import { ASTAR_RUN, GOAL, H_OVER, H_SLD, H_STAR, OVER_CITY, OVER_RUN, fringeBefore, generatedNodes, goalFirstSeen } from "@/lib/widgets/ai-lecture-04";
import type { admissible } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Mark, Text, Svg, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, FringeList, Key, RomaniaMap, SIDE_MAP, fringeCells, shortName } from "./local";

const BAR_CITIES = ["Arad", "Zerind", "Timisoara", "Sibiu", "Fagaras", "Rimnicu_Vilcea", "Pitesti", "Craiova"];

function Optimistic({ control }: { control: string }) {
  const h = control === "over" ? H_OVER : H_SLD;
  const base = 214;
  const scale = 140 / 540;
  const slot = 62;
  const x0 = 36;
  return (
    <Svg>
      <Key x={330} y={46} tone="gold" text="h(n)" d={0} />
      <Key x={420} y={46} tone="slate" text={bi("h*(n), by road", "h*(n) عبر الطريق")} d={0} />
      <Arrow pts={[[x0 - 6, base], [x0 + BAR_CITIES.length * slot, base]]} tone="faint" head={false} d={0} dur={300} />
      {BAR_CITIES.map((c, i) => {
        const x = x0 + i * slot + 6;
        const over = h[c] > H_STAR[c];
        const hh = h[c] * scale;
        const sh = H_STAR[c] * scale;
        const tone: Tone = over ? "danger" : "gold";
        return (
          <g key={c}>
            <Box x={x} y={base - hh} w={22} h={hh} r={2} tone={tone} d={200 + i * 120} />
            <Box x={x + 25} y={base - sh} w={22} h={sh} r={2} tone="slate" d={260 + i * 120} />
            <Text x={x + 11} y={base - hh - 8} text={String(h[c])} mono size={9} tone={over ? "danger" : "gold"} d={400 + i * 120} />
            <Text x={x + 36} y={base - sh - 8} text={String(H_STAR[c])} mono size={9} tone="slate" d={460 + i * 120} />
            <Text x={x + 24} y={base + 13} text={shortName(c)} size={9.5} tone="muted" d={200 + i * 120} />
            {over ? <Mark x={x + 11} y={base - hh - 26} ok={false} r={9} d={1400} /> : null}
          </g>
        );
      })}
      <Text
        x={30}
        y={250}
        text={control === "over" ? bi(`h(${OVER_CITY}) = ${H_OVER[OVER_CITY]} > ${H_STAR[OVER_CITY]}: not admissible`, `h(${OVER_CITY}) = ${H_OVER[OVER_CITY]} > ${H_STAR[OVER_CITY]}: غير مقبول`) : bi("h(n) ≤ h*(n) for every city: admissible", "h(n) ≤ h*(n) لكل مدينة: مقبول")}
        anchor="start"
        tone={control === "over" ? "danger" : "success"}
        size={10.5}
        d={1500}
      />
    </Svg>
  );
}

function Overestimate({ control }: { control: string }) {
  const over = control === "over";
  const run = over ? OVER_RUN : ASTAR_RUN;
  const seen = goalFirstSeen(run)!;
  const snap = fringeBefore(run, seen.step + 1).slice(0, 5);
  const removed = [...new Set(run.order)];
  const ok = !over;
  return (
    <Svg>
      <RomaniaMap
        box={SIDE_MAP}
        look={(c) => (c === GOAL ? (ok ? "success" : "danger") : removed.includes(c) ? "navy" : "muted")}
        lines={[{ path: run.path!, tone: ok ? "gold" : "danger", d: 400 + removed.length * 140 }]}
        badges={removed.map((c, i) => ({ city: c, n: i + 1, d: 300 + i * 140 }))}
      />
      <Text x={330} y={46} text={bi("fringe after Fagaras", "الحافة بعد Fagaras")} anchor="start" tone="muted" size={10.5} d={0} />
      <FringeList
        x={330}
        y={74}
        head={["n", "g + h", "f"]}
        rows={snap.map((n) => fringeCells(n, "f"))}
        cw={[94, 76, 44]}
        rh={21}
        size={10.5}
        frontTone={snap[0].city === OVER_CITY ? "gold" : "outline"}
        mark={(r) => (snap[r].city === GOAL ? "warn" : snap[r].city === OVER_CITY ? "danger" : undefined)}
        d={200}
        stagger={110}
      />
      <Text
        x={437}
        y={214}
        text={ok ? bi("Pitesti comes out before Bucharest", "تخرج Pitesti قبل Bucharest") : bi("Bucharest comes out before Pitesti", "تخرج Bucharest قبل Pitesti")}
        tone={ok ? "gold" : "danger"}
        size={10.5}
        d={1200}
      />
      <Chip x={420} y={256} text={bi(`A* returns ${run.cost} km`, `يُرجع A* الطول ${run.cost} km`)} tone={ok ? "success" : "danger"} center size={10.5} d={1600} />
      <Mark x={510} y={256} ok={ok} d={1800} />
    </Svg>
  );
}

function Proof() {
  const seen = goalFirstSeen(ASTAR_RUN)!;
  const p = fringeBefore(ASTAR_RUN, seen.step + 1).find((n) => n.city === "Pitesti")!;
  const cStar = ASTAR_RUN.cost!;
  const rows = [
    { left: bi("Suppose A* returns a cost C > C*", "لنفترض أن A* يُرجع تكلفة C > C*"), right: `C = ${seen.f} > C* = ${cStar}` },
    { left: bi("n: on an optimal path, still on the fringe", "n: على مسار أمثل وما زالت على الحافة"), right: "n = Pitesti" },
    { left: bi("admissible: f(n) ≤ g*(n) + h*(n) = C*", "القبول: f(n) ≤ g*(n) + h*(n) = C*"), right: `${p.g} + ${p.h} = ${p.f} ≤ ${cStar}` },
    { left: bi("f(n) ≤ C* < C: n is removed first", "f(n) ≤ C* < C: تُزال n أولًا"), right: `${p.f} < ${seen.f}` },
  ];
  return (
    <Svg>
      {rows.map((r, i) => (
        <g key={i}>
          <Box x={20} y={42 + i * 48} w={318} h={44} label={r.left} tone={i === 3 ? "warn" : "outline"} size={11} d={i * 500} />
          <Arrow pts={[[340, 64 + i * 48], [358, 64 + i * 48]]} tone="faint" d={i * 500 + 200} dur={160} />
          <Box x={362} y={48 + i * 48} w={178} h={32} label={r.right} tone="slate" size={11} mono d={i * 500 + 250} />
        </g>
      ))}
      <Chip x={280} y={258} text={bi("contradiction: A* returns the optimal 418 km", "تناقض: يُرجع A* الطول الأمثل 418 km")} tone="success" center size={10.5} d={2300} />
    </Svg>
  );
}

function Contour() {
  const cStar = ASTAR_RUN.cost!;
  const nodes = generatedNodes(ASTAR_RUN).sort((a, b) => a.node.f - b.node.f || a.node.seq - b.node.seq);
  const base = 228;
  const top = 700;
  const hgt = 156;
  const x0 = 84;
  const slot = 450 / nodes.length;
  const y = (f: number) => base - (f / top) * hgt;
  const tone = (fate: string): Tone => (fate === "goal" ? "success" : fate === "expanded" ? "gold" : "muted");
  return (
    <Svg>
      <Key x={150} y={46} tone="gold" text={bi("expanded", "موسَّعة")} d={0} />
      <Key x={270} y={46} tone="success" text={bi("goal", "الهدف")} d={0} />
      <Key x={370} y={46} tone="muted" text={bi("never expanded", "لم تُوسَّع")} d={0} />
      <Arrow pts={[[x0 - 4, base], [x0 + 454, base]]} tone="faint" head={false} d={0} dur={300} />
      {nodes.map(({ node, fate }, i) => {
        const bx = x0 + i * slot + (slot - 20) / 2;
        return (
          <g key={node.seq}>
            <Box x={bx} y={y(node.f)} w={20} h={base - y(node.f)} r={2} tone={tone(fate)} d={200 + i * 70} />
            <Text x={bx + 10} y={y(node.f) - 8} text={String(node.f)} mono size={8.5} tone={fate === "waiting" ? "muted" : "heading"} d={300 + i * 70} />
            <Text x={bx + 10} y={base + 11} text={node.city[0]} mono size={10} tone="muted" d={200 + i * 70} />
          </g>
        );
      })}
      <Arrow pts={[[x0 - 4, y(cStar)], [x0 + 454, y(cStar)]]} tone="gold" dashed head={false} d={1500} />
      <Text x={x0 - 8} y={y(cStar)} text={`C* = ${cStar}`} anchor="end" mono size={10.5} tone="gold" d={1600} />
      <Text x={300} y={256} text={bi("bars: the f of every node A* generated, sorted", "الأعمدة: قيمة f لكل عقدة ولّدها A*، مرتبة")} tone="muted" size={10} d={1800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof admissible>>({ optimistic: Optimistic, overestimate: Overestimate, proof: Proof, contour: Contour });
