"use client";

import type { history } from "@/lib/walkthroughs/robotics/lecture-01";
import { DILEMMAS, ERAS, LAWS, MILESTONES, YEAR, resolve, yearsBetween, type MilestoneKey } from "@/lib/widgets/rob-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

/* ---------- The timeline: one proportional axis, cards above and below it ---------- */

const AXIS_Y = 140;
const X0 = 30;
const SPAN: readonly [number, number] = [1915, 1995];
const xOf = (year: number) => X0 + ((year - SPAN[0]) / (SPAN[1] - SPAN[0])) * 500;

/** Where each milestone's card sits: its centre and whether it is above the axis. */
const CARD: Record<MilestoneKey, { cx: number; above: boolean }> = {
  word: { cx: 74, above: true },
  asimov: { cx: 188, above: false },
  devol: { cx: 214, above: true },
  dh: { cx: 300, above: false },
  unimation: { cx: 334, above: true },
  t3: { cx: 412, above: false },
  abb: { cx: 490, above: true },
};
const CW = 110;
const CH = 50;
const TOP_Y = 62;
const BOTTOM_Y = 168;

type Era = keyof typeof ERAS;
const ORDER: readonly Era[] = ["word", "programmable", "industry"];

/** The axis and every milestone up to `upTo`: earlier eras sit quietly, this era's cards arrive in gold. */
function Timeline({ upTo }: { upTo: Era }) {
  const last = ORDER.indexOf(upTo);
  const shown = ORDER.slice(0, last + 1).flatMap((e) => ERAS[e] as readonly MilestoneKey[]);
  const fresh = new Set<MilestoneKey>(ERAS[upTo]);
  return (
    <>
      <Arrow pts={[[X0 - 10, AXIS_Y], [X0 + 512, AXIS_Y]]} tone="faint" d={0} dur={500} />
      {[1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990].map((y) => (
        <path key={y} d={`M${xOf(y)},${AXIS_Y - 4} v8`} style={{ stroke: "var(--border-strong)", strokeWidth: 1.2 }} />
      ))}
      {MILESTONES.filter((m) => shown.includes(m.key)).map((m) => {
        const card = CARD[m.key];
        const isNew = fresh.has(m.key);
        const order = (ERAS[upTo] as readonly MilestoneKey[]).indexOf(m.key);
        const d = isNew ? 300 + order * 450 : 0;
        const x = xOf(m.year);
        const edge = card.above ? TOP_Y + CH : BOTTOM_Y;
        return (
          <g key={m.key}>
            <Arrow pts={[[x, AXIS_Y], [card.cx, edge]]} tone={isNew ? "gold" : "faint"} head={false} d={d} dur={250} />
            <Fade d={d}>
              <circle cx={x} cy={AXIS_Y} r={5} style={{ fill: isNew ? "var(--gold)" : "var(--border-strong)", stroke: "var(--surface)", strokeWidth: 2 }} />
            </Fade>
            <Box x={card.cx - CW / 2} y={card.above ? TOP_Y : BOTTOM_Y} w={CW} h={CH} label={String(m.year)} sub={m.label} tone={isNew ? "gold" : "outline"} mono size={13} subSize={10} d={d + 150} />
          </g>
        );
      })}
    </>
  );
}

function Word() {
  return (
    <Svg>
      <Timeline upTo="word" />
      <Chip x={176} y={252} w={150} text={bi("rabota: forced labour", "rabota: السُّخرة")} tone="outline" size={11} center d={1400} />
      <Arrow pts={[[254, 252], [302, 252]]} tone="gold" d={1600} dur={250} />
      <Chip x={384} y={252} w={150} text={bi("robot: a worker", "robot: عامل")} tone="gold" size={11} center d={1800} />
    </Svg>
  );
}

function Programmable() {
  return (
    <Svg>
      <Timeline upTo="programmable" />
      <Chip x={280} y={252} text={bi("change the stored program, not the machine", "غيّر البرنامج المخزَّن لا الآلة")} tone="gold" size={11} center d={1500} />
    </Svg>
  );
}

function Industry() {
  return (
    <Svg>
      <Timeline upTo="industry" />
      <Chip x={280} y={252} text={bi("from the laboratory to the factory", "من المختبر إلى المصنع")} tone="gold" size={11} center d={1900} />
    </Svg>
  );
}

function Gaps() {
  const key: readonly MilestoneKey[] = ["word", "dh", "unimation"];
  const label = { word: bi("word", "الكلمة"), dh: bi("maths", "الرياضيات"), unimation: bi("industry", "الصناعة") };
  const xw = xOf(YEAR.word);
  const xd = xOf(YEAR.dh);
  const xu = xOf(YEAR.unimation);
  const long = yearsBetween("word", "unimation");
  const short = yearsBetween("dh", "unimation");
  return (
    <Svg>
      <Arrow pts={[[X0 - 10, AXIS_Y], [X0 + 512, AXIS_Y]]} tone="faint" d={0} dur={500} />
      {key.map((k, i) => (
        <g key={k}>
          <Fade d={200 + i * 200}>
            <circle cx={xOf(YEAR[k])} cy={AXIS_Y} r={6} style={{ fill: "var(--gold)", stroke: "var(--surface)", strokeWidth: 2 }} />
          </Fade>
          <Text x={xOf(YEAR[k])} y={AXIS_Y + 18} text={String(YEAR[k])} mono size={11.5} tone="heading" d={200 + i * 200} />
        </g>
      ))}
      <Text x={xw} y={AXIS_Y - 32} text={label.word} tone="muted" size={11} d={300} />
      <Text x={xd - 26} y={AXIS_Y - 32} text={label.dh} tone="muted" size={11} d={500} />
      <Text x={xu + 30} y={AXIS_Y - 32} text={label.unimation} tone="muted" size={11} d={700} />
      <Arrow pts={[[xw, 92], [xw, 82], [xu, 82], [xu, 92]]} tone="gold" head={false} d={900} dur={700} />
      <Text x={(xw + xu) / 2} y={52} text={bi(`${long} years`, `${long} عامًا`)} tone="gold" size={14} d={1400} />
      <Arrow pts={[[xd, 182], [xd, 192], [xu, 192], [xu, 182]]} tone="navy" head={false} d={1700} dur={400} />
      <Text x={(xd + xu) / 2} y={210} text={bi(`${short} years`, `${short} أعوام`)} tone="heading" size={14} d={2000} />
      <Chip x={280} y={258} text={bi("theory ran ahead of practice", "سبقت النظرية التطبيق")} tone="outline" size={11} center d={2300} />
    </Svg>
  );
}

/* ---------- Asimov's laws ---------- */

const LAW_X = 58;
const LAW_W = 196;
const lawY = (rank: number) => 34 + rank * 58;

function Laws({ control }: { control: string }) {
  const id = (control in DILEMMAS ? control : "harm") as keyof typeof DILEMMAS;
  const dilemma = DILEMMAS[id];
  const winner = resolve(dilemma);
  const acts = winner.says === "act";
  return (
    <Svg>
      <Text x={LAW_X + LAW_W / 2 - 20} y={12} text={bi("highest priority first", "الأعلى أولوية أولًا")} tone="muted" size={10.5} d={0} />
      {LAWS.map((law, i) => (
        <g key={law.rank}>
          <Box x={14} y={lawY(law.rank)} w={36} h={44} r={8} label={String(law.rank)} tone={law.rank === 0 ? "navy" : "slate"} mono size={15} d={100 + i * 120} />
          <Box x={LAW_X} y={lawY(law.rank)} w={LAW_W} h={44} label={law.rule} tone="outline" size={11.5} d={150 + i * 120} />
        </g>
      ))}
      <Box x={292} y={34} w={258} h={44} r={12} label={dilemma.order} tone="slate" size={11.5} d={700} />
      <Text x={300} y={12} text={bi("A human orders:", "يأمر إنسانٌ:")} anchor="start" tone="muted" size={10.5} d={650} />
      {dilemma.pulls.map((p, i) => {
        const y = lawY(p.rank) + 22;
        const yes = p.says === "act";
        return (
          <g key={p.rank}>
            <Arrow pts={[[LAW_X + LAW_W + 2, y], [300, y]]} tone={yes ? "success" : "danger"} d={1000 + i * 400} dur={250} />
            <Chip x={344} y={y} w={84} text={yes ? bi("go", "نفّذ") : bi("refuse", "ارفض")} tone={yes ? "success" : "danger"} size={11} center d={1150 + i * 400} />
          </g>
        );
      })}
      <Fade d={2000}>
        <Box x={LAW_X} y={lawY(winner.rank)} w={LAW_W} h={44} label={LAWS[winner.rank].rule} tone="gold" size={11.5} />
      </Fade>
      <Token pts={[[LAW_X + LAW_W + 2, lawY(winner.rank) + 22], [300, lawY(winner.rank) + 22]]} d={2100} dur={500} />
      <Box x={404} y={acts ? 100 : 192} w={146} h={64} label={bi(`Law ${winner.rank} wins`, `يغلب القانون ${winner.rank}`)} sub={acts ? bi("the robot goes", "يذهب الروبوت") : bi("the robot refuses", "يرفض الروبوت")} tone="gold" size={12} subSize={10.5} d={2400} />
      <Mark x={540} y={acts ? 100 : 192} ok d={2700} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof history>>({
  word: Word,
  programmable: Programmable,
  industry: Industry,
  gaps: Gaps,
  laws: Laws,
});
