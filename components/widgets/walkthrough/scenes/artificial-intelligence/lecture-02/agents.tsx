"use client";

import type { agents } from "@/lib/walkthroughs/artificial-intelligence/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { VIA_FAGARAS, VIA_RIMNICU, cityName, neighbours, road, runningCost } from "@/lib/widgets/ai-lecture-02";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Loop() {
  const boxes = [
    { x: 40, y: 40, label: bi("Formulate goal", "صياغة الهدف"), sub: bi("be in Bucharest", "الوصول إلى بوخارست") },
    { x: 320, y: 40, label: bi("Formulate problem", "صياغة المسألة"), sub: bi("which states and actions", "أي الحالات والأفعال") },
    { x: 320, y: 180, label: bi("Search", "البحث"), sub: bi("find an action sequence", "إيجاد تسلسل من الأفعال") },
    { x: 40, y: 180, label: bi("Execute", "التنفيذ"), sub: bi("one action at a time", "فعل واحد في كل مرة") },
  ];
  const arrows: Pt[][] = [
    [
      [242, 74],
      [318, 74],
    ],
    [
      [420, 110],
      [420, 178],
    ],
    [
      [318, 214],
      [242, 214],
    ],
    [
      [140, 178],
      [140, 110],
    ],
  ];
  return (
    <Svg>
      {boxes.map((b, i) => (
        <Box key={i} x={b.x} y={b.y} w={200} h={68} label={b.label} sub={b.sub} tone={i === 2 ? "navy" : "slate"} d={i * 250} />
      ))}
      {arrows.map((pts, i) => (
        <Arrow key={i} pts={pts} tone="gold" d={200 + i * 250} dur={300} label={i === 3 ? bi("seq empty", "عند فراغ seq") : undefined} labelAt={[96, 144]} labelTone="gold" />
      ))}
      {arrows.map((pts, i) => (
        <Token key={i} pts={pts} d={1300 + i * 500} dur={450} />
      ))}
      <Chip x={280} y={144} text={bi("thinks ahead", "يفكر مسبقًا")} tone="gold" center d={1100} />
    </Svg>
  );
}

function Romania() {
  const arad: Pt = [80, 150];
  const at: Record<string, { c: Pt; label: Pt }> = {
    Zerind: { c: [150, 62], label: [99, 100] },
    Sibiu: { c: [250, 178], label: [165, 153] },
    Timisoara: { c: [130, 242], label: [86, 204] },
  };
  const roads = neighbours("Arad");
  return (
    <Svg>
      {roads.map((r, i) => (
        <Arrow key={r.to} pts={[arad, at[r.to].c]} tone="muted" head={false} d={300 + i * 200} dur={350} />
      ))}
      {roads.map((r, i) => (
        <Text key={r.to} x={at[r.to].label[0]} y={at[r.to].label[1]} text={String(r.km)} size={11} mono tone="muted" d={500 + i * 200} />
      ))}
      <Chip x={arad[0]} y={arad[1]} text="Arad" tone="navy" center d={0} />
      {roads.map((r, i) => (
        <Chip key={r.to} x={at[r.to].c[0]} y={at[r.to].c[1]} text={r.to} tone="outline" center d={400 + i * 200} />
      ))}
      <Arrow pts={[[282, 184], [436, 226]]} tone="faint" dashed head={false} d={1200} />
      <Text x={356} y={192} text="?" size={16} tone="muted" d={1300} />
      <Chip x={480} y={230} text="Bucharest" tone="gold" center d={1100} />
      <Text x={480} y={256} text={bi("goal", "الهدف")} size={11} tone="gold" d={1200} />
      <Box x={320} y={36} w={226} h={44} label={bi("Goal: be in Bucharest", "الهدف: الوصول إلى بوخارست")} tone="gold" size={12} d={1500} />
      <Box x={320} y={86} w={226} h={44} label={bi("States: the cities", "الحالات: المدن")} tone="outline" size={12} d={1700} />
      <Box x={320} y={136} w={226} h={44} label={bi("Actions: drive to a neighbour", "الأفعال: القيادة إلى مدينة مجاورة")} tone="outline" size={12} d={1900} />
    </Svg>
  );
}

const ROUTE_AT: Record<string, Pt> = {
  Arad: [60, 140],
  Sibiu: [170, 140],
  Fagaras: [300, 64],
  Rimnicu_Vilcea: [250, 216],
  Pitesti: [390, 216],
  Bucharest: [500, 140],
};
const ROUTE_EDGES: { a: string; b: string; label: Pt }[] = [
  { a: "Arad", b: "Sibiu", label: [115, 128] },
  { a: "Sibiu", b: "Fagaras", label: [222, 92] },
  { a: "Sibiu", b: "Rimnicu_Vilcea", label: [196, 188] },
  { a: "Rimnicu_Vilcea", b: "Pitesti", label: [332, 204] },
  { a: "Pitesti", b: "Bucharest", label: [460, 190] },
  { a: "Fagaras", b: "Bucharest", label: [408, 90] },
];
/** The point `px` before `b` on the way from `a`: where a token stops short of a city's label. */
const short = (a: Pt, b: Pt, px: number): Pt => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [b[0] - ((b[0] - a[0]) * px) / len, b[1] - ((b[1] - a[1]) * px) / len];
};

/** Where the running total sits next to each city. */
const TOTAL_AT: Record<string, Pt> = { Sibiu: [170, 110], Fagaras: [300, 34], Rimnicu_Vilcea: [250, 248], Pitesti: [390, 248], Bucharest: [500, 108] };

function Route({ control }: { control: string }) {
  const shortest = control === "rimnicu";
  const path: readonly string[] = shortest ? VIA_RIMNICU : VIA_FAGARAS;
  const totals = runningCost(path);
  const onPath = (a: string, b: string) => path.some((c, i) => i > 0 && ((path[i - 1] === a && c === b) || (path[i - 1] === b && c === a)));
  const step = 2400 / (path.length - 1);
  return (
    <Svg>
      {ROUTE_EDGES.map((e, i) => (
        <Arrow key={i} pts={[ROUTE_AT[e.a], ROUTE_AT[e.b]]} tone={onPath(e.a, e.b) ? "gold" : "faint"} width={onPath(e.a, e.b) ? 3 : undefined} head={false} d={100 + i * 60} dur={300} />
      ))}
      {ROUTE_EDGES.map((e, i) => (
        <Text key={i} x={e.label[0]} y={e.label[1]} text={String(road(e.a, e.b))} size={11} mono tone={onPath(e.a, e.b) ? "gold" : "muted"} d={300 + i * 60} />
      ))}
      {Object.entries(ROUTE_AT).map(([id, c], i) => (
        <Chip key={id} x={c[0]} y={c[1]} text={cityName(id)} tone={id === "Arad" ? "navy" : id === "Bucharest" ? "gold" : path.includes(id) ? "slate" : "muted"} center d={i * 60} />
      ))}
      <Token pts={[...path.slice(0, -1).map((c) => ROUTE_AT[c]), short(ROUTE_AT[path[path.length - 2]], ROUTE_AT.Bucharest, 50)]} d={700} dur={2400} />
      {path.slice(1).map((c, i) => (
        <Chip key={c} x={TOTAL_AT[c][0]} y={TOTAL_AT[c][1]} text={`${totals[i + 1]} km`} tone="gold" center d={700 + (i + 1) * step} />
      ))}
      <Chip x={80} y={204} text={shortest ? bi("shortest", "الأقصر") : bi("a solution", "حل")} tone={shortest ? "success" : "outline"} center d={3300} />
      <Chip x={80} y={246} text={`g = ${totals[totals.length - 1]} km`} tone={shortest ? "success" : "gold"} center d={3200} />
    </Svg>
  );
}

const SEQ = VIA_FAGARAS.slice(1).map((c) => `→${c}`);
const SLOT_X = [110, 186, 274];

function Execute() {
  const rowY = (i: number) => 70 + i * 52;
  return (
    <Svg>
      <Text x={238} y={24} text="seq" mono tone="heading" size={12} d={0} />
      <Text x={462} y={24} text={bi("returns FIRST(seq)", "يُرجع FIRST(seq)")} tone="heading" size={12} d={0} />
      {[0, 1, 2, 3].map((i) => {
        const y = rowY(i);
        const d = 200 + i * 650;
        return (
          <g key={i}>
            <Text x={50} y={y} text={bi(`call ${i + 1}`, `الاستدعاء ${i + 1}`)} size={11} tone="muted" d={d} />
            {i < SEQ.length ? (
              <>
                {SEQ.map((a, k) =>
                  k < i ? (
                    <Box key={k} x={SLOT_X[k]} y={y - 11.75} w={a.length * 6.9 + 22} h={23.5} r={11.75} tone="ghost" dashed d={d} />
                  ) : (
                    <Chip key={k} x={SLOT_X[k]} y={y} text={a} tone={k === i ? "gold" : "outline"} d={d + 80 * (k - i)} />
                  ),
                )}
                <Arrow pts={[[376, y], [410, y]]} tone="gold" d={d + 300} dur={250} />
                <Token pts={[[376, y], [440, y]]} d={d + 300} dur={400} />
                <Chip x={462} y={y} text={SEQ[i]} tone="navy" center d={d + 550} />
              </>
            ) : (
              <Chip x={SLOT_X[0]} y={y} text={bi("seq is empty: new goal, new search", "أصبح seq فارغًا: هدف جديد وبحث جديد")} tone="muted" d={d} />
            )}
          </g>
        );
      })}
    </Svg>
  );
}

const LOOP_AT: Pt[] = [
  [60, 150],
  [190, 150],
  [330, 150],
  [480, 150],
];

function OpenLoop({ control }: { control: string }) {
  const surprise = control === "surprise";
  const kms = VIA_FAGARAS.slice(1).map((c, i) => road(VIA_FAGARAS[i], c));
  return (
    <Svg>
      <Text x={40} y={40} text="seq =" mono tone="heading" size={12} anchor="start" d={0} />
      {SEQ.map((a, k) => (
        <Chip key={k} x={88 + [0, 76, 164][k]} y={40} text={a} tone="outline" d={100 + k * 100} />
      ))}
      {LOOP_AT.slice(1).map((p, i) => (
        <Arrow key={i} pts={[LOOP_AT[i], p]} tone="gold" head={false} d={300 + i * 150} dur={300} />
      ))}
      {kms.map((km, i) => (
        <Text key={i} x={(LOOP_AT[i][0] + LOOP_AT[i + 1][0]) / 2} y={130} text={String(km)} size={11} mono tone="muted" d={500 + i * 150} />
      ))}
      {VIA_FAGARAS.map((c, i) => (
        <Chip key={c} x={LOOP_AT[i][0]} y={LOOP_AT[i][1]} text={c} tone={i === 0 ? "navy" : "slate"} center d={200 + i * 150} />
      ))}
      <Text x={280} y={92} text={bi("percepts ignored while executing", "تُتجاهَل الإدراكات أثناء التنفيذ")} size={11} tone="muted" d={600} />
      {surprise ? (
        <>
          <Arrow pts={[[262, 177], [262, 160]]} tone="danger" d={1400} dur={250} />
          <Chip x={262} y={196} text={bi("road closed", "طريق مغلق")} tone="danger" center d={1300} />
          <Mark x={262} y={150} ok={false} d={1500} />
          <Token pts={[LOOP_AT[0], LOOP_AT[1], [244, 150]]} tone="danger" d={900} dur={1400} />
          <Fade d={2300}>
            <Chip x={88 + 76} y={40} text={SEQ[1]} tone="danger" />
            <Chip x={88 + 164} y={40} text={SEQ[2]} tone="danger" />
          </Fade>
          <Chip x={400} y={250} text={bi("percept ignored: the plan fails", "يُتجاهَل الإدراك فتفشل الخطة")} tone="danger" center d={2500} />
        </>
      ) : (
        <>
          <Token pts={[...LOOP_AT.slice(0, 3), [436, 150]]} d={900} dur={2100} />
          <Fade d={3000}>
            <Chip x={LOOP_AT[3][0]} y={LOOP_AT[3][1]} text="Bucharest" tone="success" center />
          </Fade>
          <Mark x={530} y={138} ok d={3100} />
          <Chip x={280} y={230} text={bi("every action does what the map predicts", "كل فعل يؤدي ما تتوقعه الخريطة")} tone="success" center d={3200} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof agents>>({
  loop: Loop,
  romania: Romania,
  route: Route,
  execute: Execute,
  "open-loop": OpenLoop,
});
