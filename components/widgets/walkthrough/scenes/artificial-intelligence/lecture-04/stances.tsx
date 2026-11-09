"use client";

import type { stances } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import { EVAL_VALUE, FEATURES, INTENTION, INTENTION_VALUES, intentionChoice, PLAYOUT_WINS, PLAYOUTS, show } from "@/lib/widgets/ai-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, fmt, In, Mark, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { ChanceNode, LeafNode, MaxNode, MinNode, Subtree } from "./local";
import w from "../../../../Walkthrough.module.css";

const FEATURE_NAMES = { material: bi("material", "العتاد"), mobility: bi("mobility", "حرية الحركة"), king: bi("king safety", "أمان الملك") } as const;

function Aggregate() {
  const dots = Array.from({ length: 30 }, (_, i) => [40 + (i % 6) * 22, 62 + Math.floor(i / 6) * 22] as const);
  return (
    <>
      {dots.map(([x, y], i) => (
        <In key={i} d={i * 25}>
          <circle cx={x} cy={y} r={6} className={`${w.shape} ${w.slate}`} />
        </In>
      ))}
      <Text x={95} y={182} text={bi("thousands of agents", "آلاف الوكلاء")} tone="heading" size={11.5} d={700} />
      <Arrow pts={[[166, 106], [204, 106]]} tone="gold" d={800} dur={300} />
      <Box x={206} y={82} w={112} h={48} label={bi("Economy", "الاقتصاد")} tone="navy" d={900} />
      <Arrow pts={[[320, 106], [356, 106]]} tone="gold" d={1100} dur={300} />
      <Curve box={{ x: 380, y: 66, w: 150, h: 110 }} fn={(t) => 0.12 + 0.75 * t ** 1.5} axes xLabel={bi("demand", "الطلب")} yLabel={bi("price", "السعر")} d={1200} />
      <Text x={280} y={244} text={bi("predict the whole, not each agent", "تنبّأ بالكل لا بكل وكيل")} tone="muted" size={11.5} d={1800} />
    </>
  );
}

function Environment() {
  const outcomes = [200, 280, 360];
  return (
    <>
      <MaxNode x={280} y={62} label="" tone="navy" d={0} />
      <Text x={312} y={62} text="MAX" anchor="start" size={11} tone="muted" d={100} />
      <Arrow pts={[[280, 79], [280, 121]]} tone="faint" head={false} d={200} dur={250} />
      <ChanceNode x={280} y={140} label="?" d={300} />
      <Text x={306} y={140} text={bi("opponent = chance", "الخصم = مصادفة")} anchor="start" size={11.5} tone="heading" d={450} />
      {outcomes.map((x, i) => (
        <g key={i}>
          <Arrow pts={[[280, 157], [x, 213]]} tone="faint" head={false} d={500 + i * 80} dur={250} />
          <LeafNode x={x} y={226} label={["8", "3", "0"][i]} d={650 + i * 80} />
        </g>
      ))}
      <Text x={280} y={258} text={bi("plan for every outcome", "خطّط لكل نتيجة")} tone="muted" size={11.5} d={1000} />
      {/* A rain cloud: the weather is the model for the opponent. */}
      <In d={700}>
        <circle cx={84} cy={118} r={16} className={`${w.shape} ${w.muted}`} />
        <circle cx={106} cy={110} r={20} className={`${w.shape} ${w.muted}`} />
        <circle cx={128} cy={120} r={14} className={`${w.shape} ${w.muted}`} />
        <rect x={84} y={118} width={44} height={16} className={w.under} />
        <rect x={84} y={118} width={44} height={16} className={`${w.shape} ${w.muted}`} style={{ stroke: "none" }} />
      </In>
      {[88, 104, 120].map((x, i) => (
        <Arrow key={x} pts={[[x, 142], [x - 4, 158]]} tone="slate" head={false} d={900 + i * 80} dur={200} />
      ))}
      <Text x={106} y={182} text={bi("like the weather", "مثل الطقس")} tone="heading" size={11.5} d={1000} />
    </>
  );
}

function Explicit() {
  const mins: Pt[] = [
    [180, 140],
    [380, 140],
  ];
  const leaves = [
    { x: 140, v: 3, m: 0 },
    { x: 220, v: 12, m: 0 },
    { x: 340, v: 2, m: 1 },
    { x: 420, v: 4, m: 1, pruned: true },
  ];
  return (
    <>
      <Text x={14} y={62} text="MAX" anchor="start" size={11} tone="muted" d={0} />
      <Text x={14} y={140} text="MIN" anchor="start" size={11} tone="muted" d={0} />
      {mins.map(([x, y], i) => (
        <Arrow key={i} pts={[[280, 79], [x, y - 17]]} tone={i === 0 ? "gold" : "faint"} head={false} d={150} dur={300} />
      ))}
      {leaves.map((l, i) => (
        <g key={i}>
          <Arrow pts={[[mins[l.m][0], 160], [l.x, 213]]} tone="faint" dashed={l.pruned} head={false} d={300 + i * 80} dur={250} />
          <LeafNode x={l.x} y={226} label={String(l.v)} tone={l.pruned ? "muted" : "outline"} dashed={l.pruned} d={400 + i * 80} />
        </g>
      ))}
      <MaxNode x={280} y={62} label="3" tone="navy" d={0} />
      <MinNode x={180} y={140} label="3" tone="navy" d={700} />
      <MinNode x={380} y={140} label="≤2" tone="danger" d={900} />
      <Mark x={402} y={188} ok={false} r={8} d={1100} />
      <Chip x={500} y={226} text={bi("pruned", "مُقلَّم")} tone="muted" center d={1200} />
      <Text x={470} y={62} text={bi("game tree + minimax", "شجرة لعبة + minimax")} tone="heading" size={11.5} d={1300} />
    </>
  );
}

function Stances({ control }: { control: string }) {
  return <Svg>{control === "aggregate" ? <Aggregate /> : control === "environment" ? <Environment /> : <Explicit />}</Svg>;
}

function Intention({ control }: { control: string }) {
  const mode = control === "adversary" ? "adversary" : "random";
  const values = INTENTION_VALUES[mode];
  const pick = intentionChoice(mode);
  const sides = [
    { id: "L" as const, x: 160, leaves: [110, 210] },
    { id: "R" as const, x: 400, leaves: [350, 450] },
  ];
  return (
    <Svg>
      {sides.map((s, i) => {
        const chosen = s.id === pick;
        const outcomes: readonly number[] = INTENTION[s.id];
        const worst = outcomes.indexOf(Math.min(...outcomes));
        return (
          <g key={s.id}>
            <Arrow pts={[[280, 79], [s.x, 127]]} tone="faint" head={false} d={100} dur={300} />
            {chosen ? <Arrow pts={[[280, 79], [s.x, 127]]} tone="gold" width={2.6} head={false} d={1400} dur={300} /> : null}
            <Text x={i === 0 ? 212 : 348} y={92} text={s.id} size={12} tone="heading" mono d={250} />
            {s.leaves.map((x, j) => {
              const hit = mode === "adversary" && j === worst;
              return (
                <g key={j}>
                  <Arrow pts={[[s.x, mode === "random" ? 163 : 166], [x, 213]]} tone={hit ? "danger" : "faint"} head={false} d={300 + j * 80} dur={250} />
                  {mode === "random" ? <Text x={(s.x + x) / 2 + (j === 0 ? -12 : 12)} y={186} text="½" size={11} tone="muted" d={500} /> : null}
                  <LeafNode x={x} y={226} label={String(outcomes[j])} tone={hit ? "danger" : "outline"} d={400 + j * 80} />
                </g>
              );
            })}
            {mode === "random" ? <ChanceNode x={s.x} y={146} label={fmt(values[s.id])} tone={chosen ? "gold" : "slate"} size={11} d={800} /> : <MinNode x={s.x} y={146} label={show(values[s.id])} tone={chosen ? "gold" : "slate"} d={800} />}
            <Text
              x={i === 0 ? s.x - 32 : s.x + 32}
              y={146}
              text={mode === "random" ? bi(`mean ${fmt(values[s.id])}`, `المتوسط ${fmt(values[s.id])}`) : bi(`worst ${show(values[s.id])}`, `الأسوأ ${show(values[s.id])}`)}
              anchor={i === 0 ? "end" : "start"}
              size={11}
              tone={chosen ? "gold" : "muted"}
              d={1000}
            />
          </g>
        );
      })}
      <MaxNode x={280} y={62} label="" tone="navy" d={0} />
      <Fade d={1500}>
        <MaxNode x={280} y={62} label={fmt(values[pick])} tone="gold" />
      </Fade>
      <Text x={312} y={62} text="MAX" anchor="start" size={11} tone="muted" d={100} />
      <Chip x={460} y={52} text={bi(`play ${pick}`, `العب ${pick}`)} tone="gold" center d={1700} />
    </Svg>
  );
}

const CUT_NODES = [40, 100, 140, 200];

function CutTree() {
  return (
    <>
      <MaxNode x={120} y={60} s={16} label="" tone="navy" d={0} />
      {[70, 170].map((x, i) => (
        <g key={x}>
          <Arrow pts={[[120, 74], [x, 118]]} tone="faint" head={false} d={100} dur={250} />
          <MinNode x={x} y={130} s={15} label="" tone="slate" d={200 + i * 80} />
        </g>
      ))}
      {CUT_NODES.map((x, i) => (
        <g key={x}>
          <Arrow pts={[[i < 2 ? 70 : 170, 145], [x, 185]]} tone="faint" head={false} d={300 + i * 60} dur={250} />
          <Subtree x={x} y={208} w={26} h={30} d={500} />
          <LeafNode x={x} y={196} w={24} h={22} label="" tone={i === 3 ? "gold" : "outline"} d={400 + i * 60} />
        </g>
      ))}
      <Arrow pts={[[18, 172], [234, 172]]} tone="danger" dashed head={false} d={700} />
      <Text x={14} y={142} text={bi("cutoff", "القطع")} anchor="start" size={10.5} tone="danger" d={800} />
    </>
  );
}

function Estimate({ control }: { control: string }) {
  const mc = control === "mc";
  return (
    <Svg>
      <CutTree />
      {mc ? (
        <>
          {PLAYOUTS.map((won, i) => {
            const y = 52 + i * 21;
            const pts: Pt[] = [
              [214, 196],
              [270, 196 + (y - 196) * 0.35 + (i % 2 ? 6 : -6)],
              [340, 196 + (y - 196) * 0.72 + (i % 3 ? -5 : 5)],
              [404, y],
            ];
            return (
              <g key={i}>
                <Arrow pts={pts} tone={won ? "gold" : "faint"} head={false} width={1.3} d={900 + i * 90} dur={500} />
                <Mark x={420} y={y} ok={won === 1} r={7} d={1300 + i * 90} />
              </g>
            );
          })}
          <Box x={446} y={118} w={100} h={58} label={fmt(PLAYOUT_WINS / PLAYOUTS.length)} sub={bi(`${PLAYOUT_WINS} of ${PLAYOUTS.length} won`, `فوز ${PLAYOUT_WINS} من ${PLAYOUTS.length}`)} tone="gold" mono d={2400} />
        </>
      ) : (
        <>
          <Arrow pts={[[214, 198], [262, 200]]} tone="gold" d={900} dur={300} />
          <Text x={400} y={40} text={bi("Score the position", "قيّم الوضعية")} tone="heading" size={12} d={1000} />
          {FEATURES.map((f, i) => (
            <g key={f.id}>
              <Text x={282} y={78 + i * 34} text={FEATURE_NAMES[f.id]} anchor="start" size={11.5} tone="heading" d={1100 + i * 150} />
              <Text x={526} y={78 + i * 34} text={`${f.value > 0 ? "+" : ""}${show(f.value)} × ${f.weight}`} anchor="end" size={11.5} tone="slate" mono d={1150 + i * 150} />
            </g>
          ))}
          <Arrow pts={[[282, 172], [526, 172]]} tone="faint" head={false} d={1700} dur={300} />
          <Box x={266} y={180} w={270} h={40} label={`EVAL(s) = ${fmt(EVAL_VALUE)}`} tone="gold" mono d={1900} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof stances>>({
  stances: Stances,
  intention: Intention,
  estimate: Estimate,
});
