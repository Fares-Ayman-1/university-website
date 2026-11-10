"use client";

import type { minimax as minimaxDef } from "@/lib/walkthroughs/artificial-intelligence/lecture-05";
import { bestChild, CHESS, CHESS_TREE_EXP, dfsOrder, isLeaf, minimaxValues, ROOT_MOVES, WORKED, type Inner } from "@/lib/widgets/ai-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Fade, In, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { G, leafAt, leafEdge, LeafNode, MaxNode, MinNode, minAt, rootEdge, Tree2 } from "./local";
import w from "../../../../Walkthrough.module.css";

const VALUES = minimaxValues(WORKED);
const MINS = WORKED.children as readonly Inner[];
const BEST = bestChild(WORKED) as Inner;
const BEST_I = MINS.indexOf(BEST);
const REPLY = bestChild(BEST);
const REPLY_J = BEST.children.indexOf(REPLY);
/** Under each MIN node, the index of the leaf it picks (the smallest). */
const MIN_PICK = MINS.map((m) => m.children.indexOf(bestChild(m)));
const toneOf = (id: string) => (id === WORKED.id ? "navy" : MINS.some((m) => m.id === id) ? "slate" : "outline") as "navy" | "slate" | "outline";

/** A number in superscript digits, which stay in order inside right-to-left text (unlike "^"). */
const sup = (n: number) => [...String(n)].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("");

const leafLabel = (id: string) => {
  const n = MINS.flatMap((m) => m.children).find((c) => c.id === id);
  return n && isLeaf(n) ? String(n.utility) : undefined;
};

function Leaves() {
  return (
    <Svg>
      <Tree2 tree={WORKED} rootMoves={ROOT_MOVES} look={(id) => ({ label: leafLabel(id), tone: toneOf(id) })} />
      <Text x={14} y={G.leafY} text={bi("utility", "المنفعة")} anchor="start" size={11} tone="muted" d={600} />
      <Text x={346} y={G.root[1]} text={bi("MAX to move", "دور MAX")} anchor="start" size={11.5} tone="heading" d={800} />
      <Chip x={64} y={104} text={bi("2 ply", "مستويان")} tone="gold" center d={1100} />
    </Svg>
  );
}

function MinLevel() {
  return (
    <Svg>
      <Tree2 tree={WORKED} look={(id) => ({ label: leafLabel(id), tone: toneOf(id) })} />
      {MINS.map((m, i) => {
        const j = MIN_PICK[i];
        const [p, q] = leafEdge(i, j);
        const [lx, ly] = leafAt(i, j);
        const d = 900 + i * 650;
        return (
          <g key={m.id}>
            <Arrow pts={[p, q]} tone="gold" head={false} width={2.4} d={d} dur={250} />
            <Fade d={d}>
              <LeafNode x={lx} y={ly} label={leafLabel(m.children[j].id)} tone="gold" />
            </Fade>
            <Token pts={[q, p]} d={d + 150} dur={600} />
            <Fade d={d + 700}>
              <MinNode x={minAt(i)[0]} y={G.minY} s={G.s} label={String(VALUES[m.id])} tone="navy" />
            </Fade>
            <Text x={minAt(i)[0] - 28} y={G.minY} text={m.id} anchor="end" size={12} tone="heading" d={d + 700} />
          </g>
        );
      })}
    </Svg>
  );
}

function MaxLevel() {
  const [a, b] = rootEdge(BEST_I);
  const [p, q] = leafEdge(BEST_I, REPLY_J);
  const [lx, ly] = leafAt(BEST_I, REPLY_J);
  return (
    <Svg>
      <Tree2 tree={WORKED} rootMoves={ROOT_MOVES} leafNames look={(id) => ({ label: id === WORKED.id ? undefined : leafLabel(id) ?? String(VALUES[id]), tone: id === WORKED.id ? "slate" : leafLabel(id) ? "outline" : "navy" })} />
      {MINS.map((m, i) => {
        const [ea, eb] = rootEdge(i);
        return <Token key={m.id} pts={[eb, ea]} tone={i === BEST_I ? "gold" : "navy"} d={700 + i * 120} dur={700} />;
      })}
      <Arrow pts={[a, b]} tone="gold" head={false} width={2.6} d={1500} dur={300} />
      <Fade d={1500}>
        <MaxNode x={G.root[0]} y={G.root[1]} s={G.s} label={String(VALUES.A)} tone="gold" />
      </Fade>
      <Chip x={440} y={56} text={bi(`decision: ${ROOT_MOVES[BEST.id]}`, `القرار: ${ROOT_MOVES[BEST.id]}`)} tone="gold" center d={1700} />
      <Arrow pts={[p, q]} tone="gold" head={false} width={2.4} d={2100} dur={250} />
      <Fade d={2100}>
        <LeafNode x={lx} y={ly} label={leafLabel(REPLY.id)} tone="gold" />
      </Fade>
    </Svg>
  );
}

function Badge({ x, y, n, d }: { x: number; y: number; n: number; d: number }) {
  return (
    <In d={d}>
      <circle cx={x} cy={y} r={8.5} className={`${w.shape} ${w.gold}`} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight={700} className={`${w.bt} ${w.gold}`}>
        {n}
      </text>
    </In>
  );
}

function DepthFirst() {
  const order = dfsOrder(WORKED);
  const at = (id: string): Pt => {
    if (id === WORKED.id) return [G.root[0] + 26, G.root[1] - 14];
    const i = MINS.findIndex((m) => m.id === id);
    if (i >= 0) return [minAt(i)[0] + (i === 2 ? 30 : -30), G.minY - 16];
    const mi = MINS.findIndex((m) => m.children.some((c) => c.id === id));
    const j = MINS[mi].children.findIndex((c) => c.id === id);
    return [leafAt(mi, j)[0] + 16, G.leafY - 15];
  };
  return (
    <Svg>
      <Text x={14} y={18} text={bi("time O(b^m), space O(bm)", "الزمن O(b^m) والمساحة O(bm)")} anchor="start" size={11.5} tone="heading" d={0} />
      <Text x={490} y={18} text={bi(`chess: ${CHESS.b}${sup(CHESS.m)} ≈ 10${sup(CHESS_TREE_EXP)} nodes`, `الشطرنج: ${CHESS.b}${sup(CHESS.m)} ≈ 10${sup(CHESS_TREE_EXP)} عقدة`)} anchor="end" size={11.5} tone="danger" d={2400} />
      <Tree2 tree={WORKED} leafNames={false} look={(id) => ({ label: leafLabel(id) ?? String(VALUES[id]), tone: leafLabel(id) ? "outline" : "navy" })} />
      {order.map((id, k) => {
        const [x, y] = at(id);
        return <Badge key={id} x={x} y={y} n={k + 1} d={600 + k * 120} />;
      })}
    </Svg>
  );
}

function Suboptimal({ control }: { control: string }) {
  const careless = control === "careless";
  const j = careless ? 1 : REPLY_J;
  const leaf = BEST.children[j];
  const [a, b] = rootEdge(BEST_I);
  const [p, q] = leafEdge(BEST_I, j);
  const [lx, ly] = leafAt(BEST_I, j);
  const got = leafLabel(leaf.id);
  return (
    <Svg>
      <Tree2 tree={WORKED} rootMoves={ROOT_MOVES} look={(id) => ({ label: leafLabel(id) ?? String(VALUES[id]), tone: leafLabel(id) ? "outline" : "navy" })} />
      <Arrow pts={[a, b]} tone="gold" head={false} width={2.6} d={700} dur={300} />
      <Arrow pts={[p, q]} tone={careless ? "danger" : "gold"} head={false} width={2.4} d={1100} dur={250} />
      <Token pts={[G.root, b, [G.minX[BEST_I], G.minY + G.s], q]} tone={careless ? "danger" : "gold"} d={800} dur={1000} />
      <Fade d={1500}>
        <LeafNode x={lx} y={ly} label={got} tone={careless ? "success" : "gold"} />
      </Fade>
      <Chip
        x={440}
        y={56}
        text={careless ? bi(`MAX gets ${got} ≥ ${VALUES.A}`, `يحصل MAX على ${got}، أي أكثر من ${VALUES.A}`) : bi(`MAX gets ${got}`, `يحصل MAX على ${got}`)}
        tone={careless ? "success" : "gold"}
        w={careless ? 196 : undefined}
        center
        d={1700}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof minimaxDef>>({
  leaves: Leaves,
  "min-level": MinLevel,
  "max-level": MaxLevel,
  "depth-first": DepthFirst,
  suboptimal: Suboptimal,
});
