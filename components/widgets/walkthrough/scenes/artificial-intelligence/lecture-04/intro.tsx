"use client";

import type { intro } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, In, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Board, ChessBoard } from "./local";
import w from "../../../../Walkthrough.module.css";

function Conflict() {
  return (
    <Svg>
      <Person x={90} y={46} label="MAX" tone="slate" d={0} />
      <Person x={470} y={46} label="MIN" tone="slate" d={150} />
      <Board x={241} y={64} cells="X.O.X.O.." c={26} d={300} />
      <Text x={280} y={164} text={bi("one shared game", "لعبة واحدة مشتركة")} tone="heading" size={12} d={450} />
      <Box x={24} y={150} w={132} h={46} label={bi("MAX wins", "يفوز MAX")} tone="success" d={600} />
      <Box x={404} y={150} w={132} h={46} label={bi("MIN wins", "يفوز MIN")} tone="danger" d={700} />
      <Arrow pts={[[238, 120], [158, 166]]} tone="success" d={900} />
      <Arrow pts={[[322, 120], [402, 166]]} tone="danger" d={900} />
      <Token pts={[[238, 120], [158, 166]]} tone="success" d={1100} dur={700} />
      <Token pts={[[322, 120], [402, 166]]} tone="danger" d={1100} dur={700} />
      <Chip x={280} y={240} text={bi("adversarial search", "البحث التنافسي")} tone="gold" center d={1500} />
    </Svg>
  );
}

const CHESS_PIECES = [
  { sq: "e1", p: "K", side: "w" },
  { sq: "d1", p: "Q", side: "w" },
  { sq: "a1", p: "R", side: "w" },
  { sq: "f3", p: "N", side: "w" },
  { sq: "e4", p: "P", side: "w" },
  { sq: "d4", p: "P", side: "w" },
  { sq: "e8", p: "K", side: "b" },
  { sq: "d8", p: "Q", side: "b" },
  { sq: "h8", p: "R", side: "b" },
  { sq: "c6", p: "N", side: "b" },
  { sq: "e5", p: "P", side: "b" },
] as const;

function Structured({ control }: { control: string }) {
  const chess = control === "chess";
  const rows = chess
    ? [bi("State: the exact position", "الحالة: الوضعية الدقيقة"), bi("Actions: about 35 legal moves", "الأفعال: نحو 35 نقلة مسموحة"), bi("Rules: a move is legal or not", "القواعد: النقلة إما مسموحة أو لا")]
    : [
        bi("State: continuous positions and speeds", "الحالة: مواقع وسرعات متصلة"),
        bi("Actions: endless (any angle, any force)", "الأفعال: لا حصر لها (أي زاوية وأي قوة)"),
        bi("Rules: a referee must judge", "القواعد: لا بد من حَكَم يقرر"),
      ];
  const players = [
    { x: 70, y: 96, dx: 18, dy: 10, tone: w.slate },
    { x: 112, y: 150, dx: -14, dy: 16, tone: w.slate },
    { x: 150, y: 88, dx: 10, dy: 18, tone: w.gold },
    { x: 92, y: 182, dx: 20, dy: -8, tone: w.gold },
    { x: 168, y: 160, dx: -18, dy: -12, tone: w.gold },
  ];
  return (
    <Svg>
      {chess ? (
        <>
          <ChessBoard x={36} y={52} c={19} pieces={CHESS_PIECES} d={0} />
          <Text x={112} y={228} text={bi("every square is known", "كل مربع معروف")} tone="muted" size={11.5} d={300} />
        </>
      ) : (
        <>
          <Box x={30} y={52} w={170} h={160} r={44} tone="ghost" d={0} />
          <Arrow pts={[[115, 54], [115, 210]]} tone="faint" head={false} d={100} dur={300} />
          <In d={200}>
            <circle cx={115} cy={132} r={22} className={`${w.line} ${w.faint}`} />
          </In>
          {players.map((p, i) => (
            <g key={i}>
              <In d={300 + i * 100}>
                <circle cx={p.x} cy={p.y} r={7} className={`${w.shape} ${p.tone}`} />
              </In>
              <Arrow pts={[[p.x + p.dx * 0.5, p.y + p.dy * 0.5], [p.x + p.dx * 1.6, p.y + p.dy * 1.6]]} tone="muted" d={500 + i * 100} dur={250} />
            </g>
          ))}
          <In d={900}>
            <circle cx={128} cy={124} r={3.5} className={`${w.shape} ${w.navy}`} />
          </In>
          <Text x={115} y={232} text={bi("everything moves at once", "كل شيء يتحرك في آن واحد")} tone="muted" size={11.5} d={1000} />
        </>
      )}
      {rows.map((r, i) => (
        <g key={i}>
          <Box x={222} y={52 + i * 62} w={296} h={48} label={r} tone={chess ? "outline" : "muted"} size={12} d={400 + i * 200} />
          <Mark x={538} y={76 + i * 62} ok={chess} d={700 + i * 200} />
        </g>
      ))}
    </Svg>
  );
}

function Which() {
  const games = [
    { name: bi("Chess", "الشطرنج"), det: true, perfect: true, notes: [bi("no dice", "لا نرد"), bi("board in view", "الرقعة ظاهرة")] },
    { name: bi("Go", "غو"), det: true, perfect: true, notes: [bi("no dice", "لا نرد"), bi("board in view", "الرقعة ظاهرة")] },
    { name: bi("Poker", "البوكر"), det: false, perfect: false, notes: [bi("random deal", "توزيع عشوائي"), bi("hidden cards", "أوراق مخفية")] },
  ];
  const cols = [196, 372];
  return (
    <Svg>
      <Box x={cols[0]} y={44} w={160} h={48} label={bi("Deterministic", "حتمية")} tone="navy" size={12} d={0} />
      <Box x={cols[1]} y={44} w={160} h={48} label={bi("Perfect information", "معلومات كاملة")} tone="navy" size={12} d={100} />
      {games.map((g, i) => {
        const y = 104 + i * 54;
        return (
          <g key={i}>
            <Box x={30} y={y} w={150} h={46} label={g.name} tone={g.det ? "slate" : "muted"} d={250 + i * 250} />
            {[g.det, g.perfect].map((ok, c) => (
              <g key={c}>
                <Box x={cols[c]} y={y} w={160} h={46} tone="outline" d={300 + i * 250} />
                <Mark x={cols[c] + 22} y={y + 23} ok={ok} r={10} d={500 + i * 250} />
                <Text x={cols[c] + 40} y={y + 16} text={g.notes[c]} anchor="start" size={11} tone={ok ? "muted" : "danger"} d={550 + i * 250} />
              </g>
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof intro>>({
  conflict: Conflict,
  structured: Structured,
  which: Which,
});
