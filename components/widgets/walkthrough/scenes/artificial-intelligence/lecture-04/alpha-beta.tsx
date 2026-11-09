"use client";

import type { alphaBeta as alphaBetaDef } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import { alphaBeta, GROWTH, GROWTH_B, isLeaf, leafIds, minimaxValues, orderTree, ROOT_MOVES, show, WORKED, type AlphaBetaRun, type Inner, type Ordering, type Stage } from "@/lib/widgets/ai-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Fade, Mark, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { AlphaBeta, G, minAt, Tree2, type EdgeLook, type Look } from "./local";
import w from "../../../../Walkthrough.module.css";

const RUN = alphaBeta(WORKED);
const TOTAL = leafIds(WORKED).length;

function utilities(tree: Inner): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of tree.children) if (!isLeaf(m)) for (const c of m.children) if (isLeaf(c)) out[c.id] = c.utility;
  return out;
}
const UTIL = utilities(WORKED);

/** How a node looks at one stage of the search (or at its end). */
function lookAt(stage: Stage, current?: string) {
  return (id: string): Look => {
    if (id in UTIL) {
      if (stage.read.includes(id)) return { label: String(UTIL[id]), tone: id === current ? "gold" : "outline" };
      return { label: stage.pruned.includes(id) ? "?" : "", tone: "muted", dashed: true };
    }
    const v = stage.nodes[id];
    if (!v) return { label: "", tone: "muted", dashed: true };
    const isMax = id === WORKED.id;
    const bound = isMax ? (v.v > -Infinity ? `≥${show(v.v)}` : "") : v.v < Infinity ? `≤${show(v.v)}` : "";
    if (v.state === "open") return { label: bound, tone: "gold" };
    if (v.state === "cut") return { label: bound, tone: "danger" };
    return { label: show(v.v), tone: "navy" };
  };
}

function edgeAt(stage: Stage, current?: string) {
  return (id: string): EdgeLook => {
    if (id in UTIL) {
      if (stage.pruned.includes(id)) return { dashed: true, cut: true };
      if (stage.read.includes(id)) return id === current ? { tone: "gold", width: 2.4 } : { tone: "slate" };
      return { dashed: true };
    }
    return stage.nodes[id] ? { tone: "slate" } : { dashed: true };
  };
}

function Windows({ stage, d = 500 }: { stage: Stage; d?: number }) {
  return (
    <>
      {Object.entries(stage.nodes).map(([id, v]) => {
        if (id === WORKED.id) return <AlphaBeta key={id} x={G.root[0] + 32} y={G.root[1]} alpha={show(v.alpha)} beta={show(v.beta)} anchor="start" d={d} />;
        const i = WORKED.children.findIndex((c) => c.id === id);
        return <AlphaBeta key={id} x={minAt(i)[0] - 28} y={G.minY} alpha={show(v.alpha)} beta={show(v.beta)} d={d} />;
      })}
    </>
  );
}

function Bounds() {
  const X = (v: number) => 60 + v * 32;
  const alpha = 3;
  const beta = 10;
  const samples = [
    { v: 1, ok: false, text: bi("prune at a MIN node if v ≤ α", "تقليم عند عقدة MIN إذا كان v ≤ α") },
    { v: 6.5, ok: true, text: bi("inside: keep searching", "في الداخل: تابع البحث") },
    { v: 13, ok: false, text: bi("prune at a MAX node if v ≥ β", "تقليم عند عقدة MAX إذا كان v ≥ β") },
  ];
  return (
    <Svg>
      <Box x={X(alpha)} y={134} w={X(beta) - X(alpha)} h={32} r={4} tone="warn" d={600} />
      <Arrow pts={[[44, 150], [528, 150]]} tone="faint" both d={0} dur={500} />
      <Text x={36} y={150} text="−∞" anchor="end" size={11} tone="muted" mono d={200} />
      <Text x={536} y={150} text="+∞" anchor="start" size={11} tone="muted" mono d={200} />
      {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
        <Text key={v} x={X(v)} y={172} text={String(v)} size={10} tone="muted" mono d={300} />
      ))}
      {[
        { v: alpha, name: "α", note: bi("MAX already has α", "لدى MAX مسبقًا α"), tone: "gold" as const },
        { v: beta, name: "β", note: bi("MIN can hold MAX to β", "يستطيع MIN حصر MAX في β"), tone: "slate" as const },
      ].map((m, i) => (
        <g key={m.name}>
          <Arrow pts={[[X(m.v), 120], [X(m.v), 164]]} tone={m.tone} head={false} width={2.4} d={700 + i * 300} dur={250} />
          <Text x={X(m.v)} y={108} text={`${m.name} = ${m.v}`} size={13} tone={m.tone} mono d={800 + i * 300} />
          <Text x={X(m.v)} y={62} text={m.note} size={11.5} tone="heading" d={900 + i * 300} />
        </g>
      ))}
      {samples.map((s, i) => (
        <g key={s.v}>
          <Mark x={X(s.v)} y={150} ok={s.ok} r={9} d={1500 + i * 300} />
          <Text x={X(s.v)} y={198} text={s.text} size={10.5} tone={s.ok ? "success" : "danger"} d={1600 + i * 300} />
        </g>
      ))}
      <Text x={280} y={248} text={bi("outside [α, β] a node cannot change the decision", "خارج [α, β] لا تستطيع العقدة تغيير القرار")} size={11.5} tone="muted" d={2500} />
    </Svg>
  );
}

function Trace({ control }: { control: string }) {
  const stage = RUN.stages.find((s) => s.leaf === control) ?? RUN.stages[0];
  return (
    <Svg>
      <Text x={14} y={20} text={bi(`leaves read: ${stage.read.length} of ${TOTAL}`, `الأوراق المقروءة: ${stage.read.length} من ${TOTAL}`)} anchor="start" size={11.5} tone="heading" d={0} />
      <Tree2 tree={WORKED} rootMoves={ROOT_MOVES} look={lookAt(stage, stage.leaf)} edge={edgeAt(stage, stage.leaf)} d={0} stagger={30} />
      <Windows stage={stage} d={350} />
      {stage.pruned.length ? <Chip x={150} y={66} text={bi(`pruned: ${stage.pruned.join(", ")}`, `مُقلَّمة: ${stage.pruned.join("، ")}`)} tone="danger" center d={600} /> : null}
    </Svg>
  );
}

function Final({ run, tree, chipD = 900 }: { run: AlphaBetaRun; tree: Inner; chipD?: number }) {
  const stage = run.stages[run.stages.length - 1];
  return (
    <>
      <Tree2 tree={tree} rootMoves={ROOT_MOVES} look={lookAt(stage)} edge={edgeAt(stage)} />
      <Chip
        x={440}
        y={56}
        text={bi(`${run.read.length} of ${TOTAL} leaves read`, `قُرئت ${run.read.length} من ${TOTAL} أوراق`)}
        tone={run.pruned.length ? "gold" : "slate"}
        center
        d={chipD}
      />
    </>
  );
}

/** Minimax reads everything: the same tree with every leaf read and every node exact. */
const MINIMAX_STAGE: Stage = {
  leaf: "",
  read: leafIds(WORKED),
  pruned: [],
  nodes: Object.fromEntries([WORKED, ...WORKED.children].map((n) => [n.id, { state: "done" as const, alpha: 0, beta: 0, v: minimaxValues(WORKED)[n.id] }])),
};

function Compare({ control }: { control: string }) {
  if (control === "minimax") {
    return (
      <Svg>
        <Tree2 tree={WORKED} rootMoves={ROOT_MOVES} look={lookAt(MINIMAX_STAGE)} edge={edgeAt(MINIMAX_STAGE)} />
        <Chip x={440} y={56} text={bi(`${TOTAL} of ${TOTAL} leaves read`, `قُرئت ${TOTAL} من ${TOTAL} أوراق`)} tone="slate" center d={900} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Final run={RUN} tree={WORKED} />
      <Fade d={1200}>
        <Text x={minAt(1)[0] + 28} y={G.minY} text={bi("only ≤ 2 is known", "المعروف فقط أنها لا تزيد على 2")} anchor="start" size={10.5} tone="danger" />
      </Fade>
    </Svg>
  );
}

function OrderingScene({ control }: { control: string }) {
  const order: Ordering = control === "worst" || control === "best" ? control : "book";
  const tree = orderTree(WORKED, order) as Inner;
  return (
    <Svg>
      <Final run={alphaBeta(tree)} tree={tree} />
    </Svg>
  );
}

function Growth() {
  const values = GROWTH.flatMap((g) => [Math.log10(g.minimax), Math.log10(g.alphaBeta)]);
  const counts = GROWTH.flatMap((g) => [g.minimax, g.alphaBeta]);
  const box = { x: 70, y: 70, w: 400, h: 150 };
  const top = 4.3;
  const slot = box.w / values.length;
  return (
    <Svg>
      <rect x={70} y={26} width={12} height={12} rx={2} className={`${w.shape} ${w.slate}`} />
      <Text x={88} y={32} text={bi("minimax: b^m", "minimax: b^m")} anchor="start" size={11.5} tone="heading" d={0} />
      <rect x={250} y={26} width={12} height={12} rx={2} className={`${w.shape} ${w.gold}`} />
      <Text x={268} y={32} text={bi("alpha–beta, best order: b^(m/2)", "ألفا-بيتا بأفضل ترتيب: b^(m/2)")} anchor="start" size={11.5} tone="heading" d={0} />
      <Bars x={box.x} y={box.y} w={box.w} h={box.h} values={values} max={top} gap={0.2} barTone={(i) => (i % 2 ? "gold" : "slate")} d={200} stagger={110} />
      {counts.map((c, i) => {
        const x = box.x + i * slot + slot / 2;
        const y = box.y + box.h - (values[i] / top) * box.h - 9;
        return <Text key={i} x={x} y={y} text={c.toLocaleString("en-US")} size={10} tone="heading" mono d={350 + i * 110} />;
      })}
      {GROWTH.map((g, k) => (
        <Text key={g.m} x={box.x + (2 * k + 1) * slot} y={box.y + box.h + 14} text={`m = ${g.m}`} size={11} tone="muted" mono d={300} />
      ))}
      <Text x={484} y={160} text={`b = ${GROWTH_B}`} anchor="start" size={11} tone="muted" mono d={1400} />
      <Text x={270} y={258} text={bi("leaves examined (log scale)", "الأوراق المفحوصة (مقياس لوغاريتمي)")} size={11} tone="muted" d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof alphaBetaDef>>({
  bounds: Bounds,
  trace: Trace,
  compare: Compare,
  ordering: OrderingScene,
  growth: Growth,
});
