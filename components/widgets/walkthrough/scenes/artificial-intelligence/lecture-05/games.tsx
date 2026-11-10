"use client";

import type { games } from "@/lib/walkthroughs/artificial-intelligence/lecture-05";
import { TTT_LEAVES } from "@/lib/widgets/ai-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Board, LeafNode, MaxNode, MinNode } from "./local";

function Properties() {
  const boxes = [
    { label: bi("Deterministic", "حتمية"), sub: bi("no dice, no chance", "لا نرد ولا مصادفة") },
    { label: bi("Turn-taking", "تبادل الأدوار"), sub: bi("MAX, MIN, MAX, …", "MAX ثم MIN ثم MAX…") },
    { label: bi("Perfect information", "معلومات كاملة"), sub: bi("both see the whole board", "يرى اللاعبان الرقعة كاملة") },
    { label: bi("Zero-sum", "صفرية المجموع"), sub: bi("my gain is your loss", "ربحي خسارتك") },
  ];
  return (
    <Svg>
      {boxes.map((b, i) => (
        <Box key={i} x={i % 2 ? 288 : 24} y={i < 2 ? 44 : 128} w={248} h={72} label={b.label} sub={b.sub} tone={i === 3 ? "gold" : "navy"} d={i * 200} />
      ))}
      <MaxNode x={166} y={236} s={13} tone="navy" d={1000} />
      <Text x={186} y={232} text={bi("MAX moves first", "MAX يبدأ")} anchor="start" size={12} tone="heading" d={1100} />
      <MinNode x={346} y={234} s={13} tone="slate" d={1200} />
      <Text x={366} y={232} text={bi("MIN replies", "MIN يرد")} anchor="start" size={12} tone="heading" d={1300} />
    </Svg>
  );
}

const PAYOFFS = {
  chess: [
    ["1", "0", "1"],
    ["½", "½", "1"],
    ["0", "1", "1"],
  ],
  symmetric: [
    ["+1", "−1", "0"],
    ["0", "0", "0"],
    ["−1", "+1", "0"],
  ],
} as const;

function Payoff({ control }: { control: string }) {
  const rows = PAYOFFS[control === "symmetric" ? "symmetric" : "chess"];
  const outcomes = [bi("MAX wins", "يفوز MAX"), bi("Draw", "تعادل"), bi("MIN wins", "يفوز MIN")];
  const xs = [40, 210, 310, 410];
  const ws = [170, 100, 100, 110];
  return (
    <Svg>
      <Box x={xs[0]} y={44} w={ws[0]} h={44} r={0} label={bi("Outcome", "النتيجة")} tone="navy" d={0} />
      {["MAX", "MIN", "MAX + MIN"].map((h, c) => (
        <Box key={h} x={xs[c + 1]} y={44} w={ws[c + 1]} h={44} r={0} label={h} tone="navy" mono size={12} d={0} />
      ))}
      {rows.map((row, r) => (
        <g key={r}>
          <Box x={xs[0]} y={88 + r * 44} w={ws[0]} h={44} r={0} label={outcomes[r]} tone="outline" d={200 + r * 200} />
          {row.map((v, c) => (
            <Box key={c} x={xs[c + 1]} y={88 + r * 44} w={ws[c + 1]} h={44} r={0} label={v} tone={c === 2 ? "gold" : "outline"} mono size={14} d={c === 2 ? 900 + r * 150 : 250 + r * 200} />
          ))}
        </g>
      ))}
      <Text
        x={280}
        y={246}
        text={control === "symmetric" ? bi("every total is 0", "كل مجموع يساوي 0") : bi("every total is 1: a constant sum", "كل مجموع يساوي 1: مجموع ثابت")}
        tone="gold"
        size={12.5}
        d={1500}
      />
    </Svg>
  );
}

function Formal() {
  const boards = [
    { x: 30, cells: ".........", label: "S0" },
    { x: 170, cells: "X...O....", label: "s", numbers: true },
    { x: 310, cells: "X.X.O....", label: "s′" },
    { x: 450, cells: "XXXOO....", label: bi("terminal t", "الحالة النهائية t") },
  ];
  const left = ["TO-MOVE(s) = MAX", "ACTIONS(s) = {2,3,4,6,7,8,9}", "s′ = RESULT(s, 3)"];
  const right = ["IS-TERMINAL(s) = false", "IS-TERMINAL(t) = true", "UTILITY(t, MAX) = +1"];
  return (
    <Svg>
      {boards.map((b, i) => (
        <g key={i}>
          <Board x={b.x} y={40} cells={b.cells} c={22} numbers={b.numbers} tone={i === 1 ? "slate" : "outline"} d={i * 250} />
          <Text x={b.x + 33} y={122} text={b.label} size={11} tone="heading" mono d={100 + i * 250} />
        </g>
      ))}
      <Arrow pts={[[100, 73], [164, 73]]} tone="faint" dashed d={300} />
      <Arrow pts={[[240, 73], [304, 73]]} tone="gold" d={600} label="a = 3" labelAt={[272, 60]} labelTone="gold" />
      <Arrow pts={[[380, 73], [444, 73]]} tone="faint" dashed d={850} />
      {left.map((t, i) => (
        <Box key={t} x={24} y={150 + i * 42} w={252} h={40} label={t} tone="outline" mono size={11} d={1100 + i * 150} />
      ))}
      {right.map((t, i) => (
        <Box key={t} x={290} y={150 + i * 42} w={250} h={40} label={t} tone={i === 2 ? "gold" : "outline"} mono size={11} d={1550 + i * 150} />
      ))}
    </Svg>
  );
}

function GameTree() {
  const level2 = [110, 190, 270];
  const terminals = [
    { x: 110, cells: "XOX.OX.O.", u: "−1" },
    { x: 190, cells: "XOXXOOOXX", u: "0" },
    { x: 270, cells: "XXXOO....", u: "+1" },
  ];
  const c = 11;
  const size = 3 * c;
  return (
    <Svg>
      <Text x={14} y={62} text="MAX (X)" anchor="start" size={10.5} tone="muted" mono d={0} />
      <Text x={14} y={130} text="MIN (O)" anchor="start" size={10.5} tone="muted" mono d={0} />
      <Text x={14} y={206} text={bi("terminal", "نهائية")} anchor="start" size={10.5} tone="muted" d={0} />
      <Text x={14} y={248} text={bi("utility", "المنفعة")} anchor="start" size={10.5} tone="muted" d={0} />
      <Board x={190 - 0} y={46} cells="........." c={c} d={0} />
      {level2.map((x, i) => (
        <g key={x}>
          <Arrow pts={[[206, 80], [x + size / 2, 112]]} tone="faint" head={false} d={200 + i * 100} dur={250} />
          <Board x={x} y={114} cells={["X........", "....X....", "........X"][i]} c={c} d={300 + i * 100} />
          <Arrow pts={[[x + size / 2, 149], [x + size / 2, 182]]} tone="faint" dashed head={false} d={700} />
        </g>
      ))}
      <Arrow pts={[[206, 80], [336, 112]]} tone="faint" dashed head={false} d={500} />
      <Text x={344} y={128} text="…" size={14} tone="muted" d={600} />
      <Text x={232} y={166} text="…" size={14} tone="muted" d={800} />
      {terminals.map((t, i) => (
        <g key={t.x}>
          <Board x={t.x} y={190} cells={t.cells} c={c} d={900 + i * 150} />
          <Text x={t.x + size / 2} y={244} text={t.u} size={13} tone={t.u === "+1" ? "success" : t.u === "−1" ? "danger" : "heading"} mono d={1100 + i * 150} />
        </g>
      ))}
      <Text x={458} y={34} text={bi("complete game tree", "شجرة اللعبة الكاملة")} tone="heading" size={11.5} d={1300} />
      <Box x={370} y={64} w={176} h={70} label={bi("Tic-tac-toe", "إكس-أو")} sub={`< 9! = ${TTT_LEAVES.toLocaleString("en-US")}`} tone="slate" d={1400} />
      <Box x={370} y={150} w={176} h={70} label={bi("Chess", "الشطرنج")} sub="> 10⁴⁰" tone="navy" d={1600} />
    </Svg>
  );
}

function Value() {
  const max = { x: 280, leaves: [230, 280, 330], v: ["3", "2", "2"] };
  const min = { x: 465, leaves: [415, 465, 515], v: ["3", "12", "8"] };
  return (
    <Svg>
      <Text x={95} y={40} text={bi("Terminal state", "حالة نهائية")} tone="heading" size={12} d={0} />
      <Text x={280} y={40} text={bi("MAX node", "عقدة MAX")} tone="heading" size={12} d={0} />
      <Text x={465} y={40} text={bi("MIN node", "عقدة MIN")} tone="heading" size={12} d={0} />
      <LeafNode x={95} y={130} w={46} h={32} label="+1" tone="navy" size={14} d={200} />
      <Text x={95} y={170} text={bi("game over", "انتهت اللعبة")} tone="muted" size={11} d={300} />
      {[max, min].map((n, k) => (
        <g key={k}>
          {n.leaves.map((x, i) => (
            <g key={x}>
              <Arrow pts={[[n.x, k ? 120 : 117], [x, 173]]} tone={i === 0 ? "gold" : "faint"} head={false} d={400 + k * 600} dur={250} />
              <LeafNode x={x} y={186} label={n.v[i]} tone={i === 0 ? "gold" : "outline"} d={500 + k * 600 + i * 80} />
            </g>
          ))}
          <Token pts={[[n.leaves[0], 173], [n.x, k ? 120 : 117]]} d={900 + k * 600} dur={600} />
        </g>
      ))}
      <MaxNode x={280} y={100} label="" tone="navy" d={350} />
      <MaxNode x={280} y={100} label="3" tone="navy" d={1500} />
      <MinNode x={465} y={100} label="" tone="slate" d={950} />
      <MinNode x={465} y={100} label="3" tone="slate" d={2100} />
      <Text x={95} y={236} text="UTILITY(s, MAX)" size={11.5} tone="heading" mono d={600} />
      <Text x={280} y={236} text="max(3, 2, 2) = 3" size={11.5} tone="heading" mono d={1500} />
      <Text x={465} y={236} text="min(3, 12, 8) = 3" size={11.5} tone="heading" mono d={2100} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof games>>({
  properties: Properties,
  payoff: Payoff,
  formal: Formal,
  tree: GameTree,
  value: Value,
});
