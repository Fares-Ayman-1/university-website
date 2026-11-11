"use client";

import type { system } from "@/lib/walkthroughs/robotics/lecture-01";
import { BLOCKS, BLOCK_ROLES, DISCIPLINES, FLOWS, LINKS, closedLoop, openLoop, type BlockId, type Discipline, type Flow } from "@/lib/widgets/rob-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, Mark, Svg, Text, Token, plotAt, type LineTone, type PlotBox, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

/* ---------- The block diagram of slide 8 ---------- */

const BW = 150;
const BH = 64;
const COL = [8, 205, 402] as const;
const ROW = [4, 92, 180] as const;
const AT: Record<BlockId, readonly [number, number]> = {
  sensors: [COL[1], ROW[0]],
  power: [COL[2], ROW[0]],
  input: [COL[0], ROW[1]],
  controller: [COL[1], ROW[1]],
  arm: [COL[2], ROW[1]],
  storage: [COL[1], ROW[2]],
  tooling: [COL[2], ROW[2]],
};
const centre = (b: BlockId): Pt => [AT[b][0] + BW / 2, AT[b][1] + BH / 2];

/** The gap between two neighbouring blocks, from `a`'s side to `b`'s side. */
function gap(a: BlockId, b: BlockId): readonly [Pt, Pt] {
  const [ax, ay] = centre(a);
  const [bx, by] = centre(b);
  if (ax === bx) {
    const down = by > ay;
    return [
      [ax, down ? ay + BH / 2 : ay - BH / 2],
      [bx, down ? by - BH / 2 : by + BH / 2],
    ];
  }
  const right = bx > ax;
  return [
    [right ? ax + BW / 2 : ax - BW / 2, ay],
    [right ? bx - BW / 2 : bx + BW / 2, by],
  ];
}

/** Entrance order for the build-up: the controller first, then outward. */
const BUILD: readonly BlockId[] = ["controller", "sensors", "power", "arm", "tooling", "input", "storage"];

function Diagram({ tone, roles, build, arrows = "slide", d = 0 }: { tone?: (b: BlockId) => Tone; roles?: boolean; build?: boolean; arrows?: "slide" | "faint"; d?: number }) {
  const when = (b: BlockId) => d + (build ? BUILD.indexOf(b) * 230 : 0);
  return (
    <>
      {(Object.keys(AT) as BlockId[]).map((b) => (
        <Box key={b} x={AT[b][0]} y={AT[b][1]} w={BW} h={BH} label={BLOCKS[b]} sub={roles ? BLOCK_ROLES[b] : undefined} tone={tone?.(b) ?? (b === "controller" ? "navy" : "outline")} size={11.5} subSize={9.5} d={when(b)} />
      ))}
      {LINKS.map((l, i) => {
        const [p, q] = gap(l.a, l.b);
        const later = Math.max(when(l.a), when(l.b)) + 150;
        return <Arrow key={i} pts={[p, q]} tone={arrows === "faint" ? "faint" : "slate"} both={l.twoWay} d={later} dur={200} />;
      })}
    </>
  );
}

function Blocks() {
  return (
    <Svg>
      <Diagram roles build />
      <Text x={83} y={24} text={bi("Slide 8's diagram", "مخطط الشريحة 8")} tone="muted" size={11} d={0} />
      <Arrow pts={[[22, 194], [62, 194]]} tone="slate" d={1900} dur={200} />
      <Text x={70} y={194} text={bi("one way", "اتجاه واحد")} anchor="start" size={10.5} tone="muted" d={1950} />
      <Arrow pts={[[22, 222], [62, 222]]} tone="slate" both d={2050} dur={200} />
      <Text x={70} y={222} text={bi("both ways", "الاتجاهان")} anchor="start" size={10.5} tone="muted" d={2100} />
    </Svg>
  );
}

const FLOW_STYLE: Record<Flow, { line: LineTone; token: "gold" | "navy"; name: Bi; note: Bi }> = {
  outward: {
    line: "gold",
    token: "gold",
    name: bi("commands and power", "الأوامر والطاقة"),
    note: bi("outward, toward the mechanism", "إلى الخارج، نحو الآلية"),
  },
  back: {
    line: "navy",
    token: "navy",
    name: bi("information", "المعلومات"),
    note: bi("back, to the controller", "عائدةً إلى المتحكِّم"),
  },
};

function Flows({ control }: { control: string }) {
  const flow: Flow = control === "back" ? "back" : "outward";
  const style = FLOW_STYLE[flow];
  const routes = FLOWS[flow];
  return (
    <Svg>
      <Diagram arrows="faint" />
      <Text x={83} y={22} text={style.name} tone={flow === "outward" ? "gold" : "heading"} size={12.5} d={100} />
      <Text x={83} y={50} text={style.note} tone="muted" size={10.5} d={200} />
      {routes.map((route, r) =>
        route.slice(1).map((to, i) => {
          const [p, q] = gap(route[i], to);
          return <Arrow key={`${r}-${i}`} pts={[p, q]} tone={style.line} width={2.6} d={400 + r * 500 + i * 250} dur={250} />;
        }),
      )}
      {routes.map((route, r) => (
        <Token key={r} pts={[...route.slice(0, -1).map(centre), gap(route[route.length - 2], route[route.length - 1])[1]]} d={500 + r * 500} dur={600 + route.length * 350} tone={style.token} />
      ))}
    </Svg>
  );
}

/* ---------- Feedback: closed and open loop ---------- */

const PLOT: PlotBox = { x: 300, y: 46, w: 220, h: 150, domain: [0, 1], range: [0, 1.15] };

function Feedback({ control }: { control: string }) {
  const closed = control !== "open";
  const fb: LineTone = closed ? "navy" : "faint";
  const end = closed ? closedLoop(1) : openLoop(1);
  const [ex, ey] = plotAt(PLOT, 1, end);
  const [, ty] = plotAt(PLOT, 1, 1);
  return (
    <Svg>
      <Chip x={75} y={20} w={96} text={bi("target", "الهدف")} tone="gold" size={11} center d={0} />
      <Arrow pts={[[75, 37], [75, 50]]} tone="gold" d={100} dur={150} />
      <Box x={20} y={52} w={110} h={46} label={bi("Controller", "المتحكِّم")} tone="navy" size={11.5} d={150} />
      <Arrow pts={[[75, 98], [75, 152]]} tone="gold" d={350} dur={250} label={bi("command", "أمر")} labelAt={[104, 125]} labelTone="gold" />
      <Box x={20} y={154} w={110} h={46} label={bi("Mechanical arm", "الذراع الميكانيكية")} tone="outline" size={11} d={450} />
      <Box x={150} y={103} w={96} h={46} label={bi("Sensors", "المستشعرات")} tone={closed ? "outline" : "muted"} dashed={!closed} size={11} d={550} />
      {closed ? (
        <>
          <Arrow pts={[[130, 177], [198, 177], [198, 151]]} tone={fb} d={700} dur={350} />
          <Arrow pts={[[198, 101], [198, 75], [132, 75]]} tone={fb} d={950} dur={350} label={bi("measured", "المقيس")} labelAt={[240, 80]} labelTone="slate" />
          <Token pts={[[130, 177], [198, 177], [198, 75], [132, 75]]} d={1300} dur={1100} tone="navy" />
        </>
      ) : (
        <>
          <Arrow pts={[[130, 177], [198, 177], [198, 151]]} tone="faint" dashed head={false} d={700} />
          <Arrow pts={[[198, 101], [198, 75], [132, 75]]} tone="faint" dashed head={false} d={700} />
          <Mark x={228} y={180} ok={false} d={900} />
        </>
      )}
      <Curve box={PLOT} points={[[0, 1], [1, 1]]} tone="muted" dashed axes xLabel={bi("time", "الزمن")} yLabel={bi("arm position", "موضع الذراع")} d={600} />
      <Text x={PLOT.x + PLOT.w} y={ty - 22} text={bi("target", "الهدف")} anchor="end" tone="gold" size={11} d={900} />
      <Curve box={PLOT} fn={closed ? closedLoop : openLoop} tone={closed ? "success" : "danger"} width={2.6} d={1100} dur={1400} />
      {closed ? (
        <Mark x={ex + 14} y={ey} ok d={2600} />
      ) : (
        <>
          <Arrow pts={[[ex + 12, ty], [ex + 12, ey]]} tone="danger" both d={2600} dur={250} />
          <Text x={ex + 4} y={(ty + ey) / 2 + 30} text={bi("error stays", "يبقى الخطأ")} anchor="end" tone="danger" size={11} d={2800} />
        </>
      )}
      <Chip
        x={280}
        y={256}
        text={closed ? bi("servo-controlled: measures and corrects", "مُتحكَّم به بالمؤازرة: يقيس ويصحّح") : bi("non-servo: commands, never checks", "غير مؤازَر: يأمر ولا يتحقق أبدًا")}
        tone={closed ? "success" : "danger"}
        size={11}
        center
        d={3000}
      />
    </Svg>
  );
}

/* ---------- Disciplines ---------- */

const DISCIPLINE_NAMES: Record<Discipline, Bi> = {
  mechanical: bi("Mechanical engineering", "الهندسة الميكانيكية"),
  electrical: bi("Electrical and electronic", "الكهربائية والإلكترونية"),
  computer: bi("Computer science", "علوم الحاسب"),
  biology: bi("Biology", "علم الأحياء"),
};

function Disciplines({ control }: { control: string }) {
  const id = (control in DISCIPLINES ? control : "mechanical") as Discipline;
  const disc = DISCIPLINES[id];
  const lit = new Set<BlockId>(disc.blocks);
  return (
    <Svg>
      <Diagram arrows="faint" tone={(b) => (lit.has(b) ? "gold" : "muted")} />
      <Fade d={300}>
        <Text x={83} y={24} text={DISCIPLINE_NAMES[id]} tone="heading" size={12} />
      </Fade>
      <Chip x={280} y={262} text={disc.gives} tone="outline" size={10.5} center d={700} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof system>>({
  blocks: Blocks,
  flow: Flows,
  feedback: Feedback,
  disciplines: Disciplines,
});
