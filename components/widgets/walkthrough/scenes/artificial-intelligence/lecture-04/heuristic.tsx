"use client";

import type { heuristic } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import { BEAM_WIDTH, CHESS, CHESS_BUDGET, CHESS_PLY, EVAL_VALUE, FEATURE_TERMS, FEATURES, FORWARD_MOVES, HORIZON, isLeaf, minimaxValues, ROOT_MOVES, show, WORKED } from "@/lib/widgets/ai-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, fmt, Mark, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { G, leafAt, MaxNode, MinNode, Subtree, Tree2 } from "./local";

const VALUES = minimaxValues(WORKED);
const signed = (x: number) => (x > 0 ? `+${show(x)}` : show(x));

function Cutoff() {
  const leaves = WORKED.children.flatMap((m, i) => (isLeaf(m) ? [] : m.children.map((_, j) => leafAt(i, j))));
  return (
    <Svg>
      <Tree2 tree={WORKED} rootMoves={ROOT_MOVES} leafNames={false} look={(id) => ({ label: String(VALUES[id]), tone: id.length === 1 ? "navy" : "outline" })} />
      <Arrow pts={[[92, 198], [548, 198]]} tone="danger" dashed head={false} d={900} />
      <Text x={14} y={188} text={bi("cutoff d = 2", "القطع d = 2")} anchor="start" size={10.5} tone="danger" d={1000} />
      <Text x={14} y={G.leafY} text="EVAL" anchor="start" size={10.5} tone="muted" mono d={1000} />
      {leaves.map(([x, y], k) => (
        <Subtree key={k} x={x} y={y + 15} w={28} h={22} d={1100 + k * 40} />
      ))}
      <Chip x={440} y={56} text={bi("≈ 3: an estimate", "≈ 3: تقدير")} tone="gold" center d={1500} />
    </Svg>
  );
}

const FEATURE_NAMES = { material: bi("Material", "العتاد"), mobility: bi("Mobility", "حرية الحركة"), king: bi("King safety", "أمان الملك") } as const;

function Eval() {
  return (
    <Svg>
      <Text x={125} y={38} text={bi("feature", "السمة")} size={11.5} tone="muted" d={0} />
      <Text x={285} y={38} text="fi(s)" size={11.5} tone="muted" mono d={0} />
      <Text x={370} y={38} text="wi" size={11.5} tone="muted" mono d={0} />
      <Text x={452} y={38} text="wi·fi" size={11.5} tone="muted" mono d={0} />
      {FEATURES.map((f, i) => {
        const y = 62 + i * 50;
        const d = 200 + i * 300;
        return (
          <g key={f.id}>
            <Box x={30} y={y} w={190} h={44} label={FEATURE_NAMES[f.id]} tone="slate" d={d} />
            <Text x={285} y={y + 22} text={signed(f.value)} size={13} tone="heading" mono d={d + 100} />
            <Text x={330} y={y + 22} text="×" size={13} tone="muted" d={d + 100} />
            <Text x={370} y={y + 22} text={String(f.weight)} size={13} tone="heading" mono d={d + 150} />
            <Text x={404} y={y + 22} text="=" size={13} tone="muted" d={d + 150} />
            <Box x={420} y={y} w={64} h={44} label={fmt(FEATURE_TERMS[i])} tone="outline" mono size={13} d={d + 200} />
          </g>
        );
      })}
      <Arrow pts={[[420, 214], [484, 214]]} tone="faint" head={false} d={1300} dur={250} />
      <Text x={410} y={240} text="EVAL(s) =" anchor="end" size={12} tone="heading" mono d={1400} />
      <Box x={420} y={220} w={64} h={40} label={fmt(EVAL_VALUE)} tone="gold" mono size={14} d={1500} />
      <Text x={30} y={240} text={bi("weights: hand-tuned or learned", "الأوزان: تُضبط يدويًا أو تُتعلَّم")} anchor="start" size={11} tone="muted" d={1700} />
    </Svg>
  );
}

function Quiescence({ control }: { control: string }) {
  const deep = control === "quiescence";
  const value = deep ? HORIZON.afterRecapture : HORIZON.atCutoff;
  const tone = deep ? "navy" : "warn";
  return (
    <Svg>
      <MaxNode x={150} y={62} label={signed(value)} tone={tone} d={deep ? 1400 : 600} />
      <Arrow pts={[[150, 79], [150, 125]]} tone="slate" head={false} d={100} dur={250} />
      <Text x={162} y={102} text="Q×N" anchor="start" size={11} tone="heading" mono d={200} />
      <MinNode x={150} y={142} label={signed(value)} tone={tone} d={deep ? 1200 : 400} />
      <Text x={182} y={136} text="s1" anchor="start" size={11} tone="muted" mono d={400} />
      <Arrow pts={[[64, 176], [236, 176]]} tone="danger" dashed head={false} d={300} />
      <Text x={14} y={176} text={bi("cutoff", "القطع")} anchor="start" size={10.5} tone="danger" d={350} />
      <Arrow pts={[[150, 162], [150, 205]]} tone={deep ? "slate" : "faint"} dashed={!deep} head={false} d={deep ? 700 : 500} dur={250} />
      <Text x={162} y={190} text="R×Q" anchor="start" size={11} tone={deep ? "heading" : "muted"} mono d={600} />
      <MaxNode x={150} y={226} label={deep ? signed(HORIZON.afterRecapture) : "?"} tone={deep ? "success" : "muted"} dashed={!deep} d={deep ? 900 : 600} />
      <Text x={182} y={232} text="s2" anchor="start" size={11} tone="muted" mono d={600} />
      {deep ? (
        <>
          <Box x={290} y={98} w={230} h={68} label={bi("s1 is not quiet", "s1 ليست هادئة")} sub={bi("a capture is pending", "هناك أسر معلّق")} tone="outline" d={500} />
          <Box x={290} y={190} w={230} h={56} label={`EVAL(s2) = ${signed(HORIZON.afterRecapture)}`} sub={bi("quiet: no captures left", "هادئة: لا عمليات أسر متبقية")} tone="success" mono d={1000} />
          <Mark x={540} y={218} ok d={1500} />
        </>
      ) : (
        <>
          <Box x={290} y={98} w={230} h={68} label={`EVAL(s1) = ${signed(HORIZON.atCutoff)}`} sub={bi("MAX looks a knight up", "يبدو MAX متقدمًا بحصان")} tone="warn" mono d={500} />
          <Box x={290} y={190} w={230} h={56} label={bi("unseen: MIN takes the queen", "غير مرئي: MIN يأسر الوزير")} tone="muted" dashed d={900} />
          <Mark x={540} y={132} ok={false} d={1300} />
        </>
      )}
    </Svg>
  );
}

function Deepening() {
  const runs = [
    { x: 40, y: 52, w: 34, label: "d=1" },
    { x: 74, y: 96, w: 52, label: "d=2" },
    { x: 126, y: 140, w: 130, label: "d=3" },
  ];
  return (
    <Svg>
      <Arrow pts={[[40, 238], [520, 238]]} tone="faint" d={0} dur={400} />
      <Text x={520} y={254} text={bi("time", "الزمن")} anchor="end" size={11} tone="muted" d={200} />
      {runs.map((r, i) => (
        <Box key={r.label} x={r.x} y={r.y} w={r.w} h={40} label={r.label} tone={i === 2 ? "navy" : "slate"} mono size={11} d={200 + i * 300} />
      ))}
      <Box x={256} y={184} w={164} h={44} label={bi("d=4: unfinished", "d=4: لم يكتمل")} tone="danger" dashed size={11.5} d={1200} />
      <Arrow pts={[[420, 46], [420, 238]]} tone="danger" dashed head={false} d={1300} />
      <Text x={426} y={52} text={bi("time limit", "حدّ الوقت")} anchor="start" size={11} tone="danger" d={1400} />
      <Box x={262} y={56} w={150} h={68} label={bi("Transposition table", "جدول التبديلات")} sub={bi("orders the next search", "يرتّب البحث التالي")} tone="outline" size={12} d={800} />
      <Arrow pts={[[128, 110], [258, 96]]} tone="slate" dashed d={900} />
      <Arrow pts={[[300, 126], [232, 138]]} tone="gold" dashed d={1000} />
      <Arrow pts={[[258, 160], [426, 176]]} tone="gold" d={1600} />
      <Box x={430} y={150} w={116} h={72} label={bi("Play", "العب")} sub={bi("depth 3's move", "نقلة العمق 3")} tone="gold" d={1800} />
    </Svg>
  );
}

const FX = [80, 180, 280, 380, 480];

function Forward({ control }: { control: string }) {
  const keep = (i: number) => (control === "beam" ? i < BEAM_WIDTH : control === "probcut" ? FORWARD_MOVES[i].shallow > 2 : true);
  const reduced = (i: number) => control === "lmr" && i >= 3;
  const note =
    control === "beam"
      ? bi(`beam: keep the top ${BEAM_WIDTH}`, `الحزمة: احتفظ بأفضل ${BEAM_WIDTH}`)
      : control === "probcut"
        ? bi("PROBCUT with α = 2", "PROBCUT مع α = 2")
        : bi("late moves: searched shallower", "النقلات المتأخرة: بحث أضحل");
  return (
    <Svg>
      <Text x={14} y={22} text={bi("numbers: a quick shallow score", "الأرقام: درجة سريعة من بحث ضحل")} anchor="start" size={10.5} tone="muted" d={0} />
      <Text x={14} y={58} text={note} anchor="start" size={11.5} tone="heading" d={100} />
      <MaxNode x={280} y={54} s={18} label="" tone="navy" d={0} />
      <Text x={306} y={54} text="MAX" anchor="start" size={11} tone="muted" d={100} />
      {FORWARD_MOVES.map((m, i) => {
        const x = FX[i];
        const kept = keep(i);
        return (
          <g key={m.id}>
            <Arrow pts={[[280, 70], [x, 113]]} tone={kept ? "slate" : "faint"} dashed={!kept} head={false} d={200 + i * 80} dur={250} />
            {!kept ? <Mark x={(280 + x) / 2} y={92} ok={false} r={8} d={900 + i * 80} /> : null}
            {kept ? <Subtree x={x} y={150} w={56} h={reduced(i) ? 48 : 94} tone={reduced(i) ? "slate" : "warn"} dashed={reduced(i)} d={700 + i * 80} /> : null}
            {control === "lmr" && i === 3 ? <Arrow pts={[[x, 150], [x - 28, 244], [x + 28, 244], [x, 150]]} tone="gold" dashed head={false} d={1500} /> : null}
            <MinNode x={x} y={128} s={16} label={show(m.shallow)} tone={kept ? "outline" : "muted"} dashed={!kept} size={11} d={300 + i * 80} />
            <Text x={x + 22} y={150} text={m.id} anchor="start" size={10.5} tone="muted" mono d={400 + i * 80} />
          </g>
        );
      })}
      {control === "probcut" ? <Chip x={430} y={196} text={bi("probably v ≤ α", "على الأرجح v ≤ α")} tone="danger" center d={1200} /> : null}
      {control === "beam" ? <Chip x={380} y={196} text={bi("never looked at", "لا يُنظر إليها أبدًا")} tone="danger" center d={1200} /> : null}
      {control === "lmr" ? (
        <>
          <Text x={FX[3]} y={256} text={bi("re-searched", "أُعيد بحثها")} size={10.5} tone="gold" d={1600} />
          <Text x={FX[4]} y={212} text={bi("reduced", "مخفَّض")} size={10.5} tone="slate" d={1200} />
        </>
      ) : null}
    </Svg>
  );
}

function Chess() {
  const bars = [
    { v: CHESS_PLY.minimax, label: bi("minimax", "minimax"), shown: String(CHESS_PLY.minimax) },
    { v: CHESS_PLY.random, label: bi("αβ random", "αβ عشوائي"), shown: String(CHESS_PLY.random) },
    { v: CHESS_PLY.alphaBeta, label: bi("αβ ideal", "αβ مثالي"), shown: String(CHESS_PLY.alphaBeta) },
    { v: CHESS_PLY.enhanced, label: bi("+ extras", "مع تحسينات"), shown: `${CHESS_PLY.enhanced}+` },
    { v: CHESS_PLY.stockfish, label: bi("Stockfish", "Stockfish"), shown: `${CHESS_PLY.stockfish}+` },
  ];
  const box = { x: 60, y: 60, w: 440, h: 150 };
  const top = 32;
  const slot = box.w / bars.length;
  const tones = ["slate", "slate", "gold", "gold", "navy"] as const;
  return (
    <Svg>
      <Text x={60} y={34} text={bi("ply searched per move, about one minute", "المستويات المبحوثة لكل نقلة في نحو دقيقة")} anchor="start" size={11.5} tone="heading" d={0} />
      <Bars x={box.x} y={box.y} w={box.w} h={box.h} values={bars.map((b) => b.v)} max={top} gap={0.4} barTone={(i) => tones[i]} d={100} stagger={200} />
      {bars.map((b, i) => {
        const x = box.x + i * slot + slot / 2;
        return (
          <g key={i}>
            <Text x={x} y={box.y + box.h - (b.v / top) * box.h - 10} text={b.shown} size={12} tone="heading" mono d={300 + i * 200} />
            <Text x={x} y={box.y + box.h + 16} text={b.label} size={11} tone="muted" d={300 + i * 200} />
          </g>
        );
      })}
      <Text x={280} y={266} text={`${CHESS.nodesPerSecond.toLocaleString("en-US")} × ${CHESS.seconds} = ${CHESS_BUDGET.toLocaleString("en-US")}; b = ${CHESS.b}`} size={10.5} tone="muted" mono d={1400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof heuristic>>({
  cutoff: Cutoff,
  eval: Eval,
  quiescence: Quiescence,
  deepening: Deepening,
  forward: Forward,
  chess: Chess,
});
