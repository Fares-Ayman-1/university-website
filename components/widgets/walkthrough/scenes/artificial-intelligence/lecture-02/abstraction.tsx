"use client";

import type { abstraction } from "@/lib/walkthroughs/artificial-intelligence/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { VIA_RIMNICU, cityName, road } from "@/lib/widgets/ai-lecture-02";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Svg, Text, Token, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dot } from "./local";

function States() {
  const cards = [
    { label: bi("rain, news on the radio", "مطر، والأخبار في الراديو"), sub: bi("hotel car park, 9:40", "موقف الفندق، 9:40") },
    { label: bi("sunny, music playing", "مشمس، وموسيقى في الراديو"), sub: bi("city centre, 13:15", "وسط المدينة، 13:15") },
    { label: bi("cloudy, radio off", "غائم، والراديو مغلق"), sub: bi("petrol station, 18:05", "محطة الوقود، 18:05") },
  ];
  const ys = [44, 116, 188];
  const ends: Pt[] = [
    [360, 136],
    [360, 150],
    [360, 164],
  ];
  return (
    <Svg>
      <Text x={133} y={16} text={bi("real states in Arad", "حالات حقيقية في أراد")} size={12} tone="heading" d={0} />
      {cards.map((c, i) => (
        <Box key={i} x={20} y={ys[i]} w={226} h={68} label={c.label} sub={c.sub} tone="outline" size={12.5} d={100 + i * 200} />
      ))}
      {cards.map((_, i) => (
        <g key={i}>
          <Arrow pts={[[248, ys[i] + 34], ends[i]]} tone="slate" d={800 + i * 150} dur={350} />
          <Token pts={[[248, ys[i] + 34], ends[i]]} d={900 + i * 150} dur={500} />
        </g>
      ))}
      <Box x={362} y={112} w={180} h={76} label="In(Arad)" sub={bi("one abstract state", "حالة مجردة واحدة")} tone="navy" mono size={15} d={1300} />
      <Chip x={452} y={222} text={bi("details dropped", "التفاصيل مُسقَطة")} tone="muted" center d={1600} />
    </Svg>
  );
}

const ROUTES: { pts: Pt[]; tone: "slate" | "muted"; tag?: { at: Pt; text: ReturnType<typeof bi>; tone: Tone } }[] = [
  {
    pts: [
      [120, 140],
      [190, 124],
      [260, 140],
      [330, 122],
      [400, 138],
      [440, 140],
    ],
    tone: "slate",
  },
  {
    pts: [
      [120, 165],
      [170, 215],
      [250, 238],
      [340, 230],
      [410, 190],
      [440, 165],
    ],
    tone: "muted",
    tag: { at: [250, 238], text: bi("detour", "تحويلة"), tone: "warn" },
  },
  {
    pts: [
      [120, 115],
      [170, 66],
      [280, 50],
      [380, 64],
      [440, 115],
    ],
    tone: "muted",
    tag: { at: [280, 50], text: bi("rest stop", "استراحة"), tone: "outline" },
  },
];

function Actions({ control }: { control: string }) {
  if (control === "abstract") {
    return (
      <Svg>
        <Arrow pts={[[136, 150], [416, 150]]} tone="gold" width={3} d={300} dur={500} label={`${road("Arad", "Zerind")} km`} labelAt={[276, 136]} labelTone="gold" />
        <Token pts={[[136, 150], [396, 150]]} d={500} dur={700} />
        <Chip x={110} y={150} text="Arad" tone="navy" center d={100} />
        <Chip x={450} y={150} text="Zerind" tone="navy" center d={200} />
        <Text x={276} y={176} text={bi("one abstract action: one edge, one cost", "فعل مجرد واحد: حافة واحدة وتكلفة واحدة")} size={12} tone="heading" d={1000} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Box x={16} y={96} w={104} h={104} r={24} tone="ghost" dashed d={0} />
      <Text x={68} y={150} text="Arad" size={13} tone="heading" d={0} />
      <Box x={440} y={96} w={104} h={104} r={24} tone="ghost" dashed d={100} />
      <Text x={492} y={150} text="Zerind" size={13} tone="heading" d={100} />
      {ROUTES.map((r, i) => (
        <Arrow key={i} pts={r.pts} tone={r.tone} d={300 + i * 400} dur={700} />
      ))}
      {ROUTES.map((r, i) => (r.tag ? <Chip key={i} x={r.tag.at[0]} y={r.tag.at[1]} text={r.tag.text} tone={r.tag.tone} center d={900 + i * 400} /> : null))}
      <Token pts={ROUTES[0].pts} d={1900} dur={1400} />
    </Svg>
  );
}

const IN_ARAD: Pt[] = [
  [86, 86],
  [128, 112],
  [80, 138],
  [126, 164],
];
const IN_ZERIND: Pt[] = [
  [432, 86],
  [476, 112],
  [430, 138],
  [480, 164],
];
const VIA_Y = [76, 120, 130, 174];

function Valid() {
  return (
    <Svg>
      <Text x={280} y={24} text={bi("one abstract action, many real ones", "فعل مجرد واحد وأفعال حقيقية كثيرة")} size={12} tone="heading" d={0} />
      <Box x={30} y={56} w={150} h={150} r={36} tone="ghost" dashed d={0} />
      <Box x={380} y={56} w={150} h={150} r={36} tone="ghost" dashed d={100} />
      <Text x={105} y={190} text="In(Arad)" mono size={12} tone="heading" d={0} />
      <Text x={455} y={190} text="In(Zerind)" mono size={12} tone="heading" d={100} />
      {IN_ARAD.map((p, i) => (
        <g key={i}>
          <Arrow pts={[p, [280, VIA_Y[i]], [IN_ZERIND[i][0] - 9, IN_ZERIND[i][1]]]} tone="slate" d={600 + i * 250} dur={600} />
          <Token pts={[p, [280, VIA_Y[i]], IN_ZERIND[i]]} d={700 + i * 250} dur={800} />
        </g>
      ))}
      {IN_ARAD.map((p, i) => (
        <Dot key={i} at={p} r={6} tone="slate" d={200 + i * 80} />
      ))}
      {IN_ZERIND.map((p, i) => (
        <Dot key={i} at={p} r={6} tone="success" d={300 + i * 80} />
      ))}
      <Chip x={268} y={238} text={bi("every real state in Arad reaches Zerind", "كل حالة حقيقية في أراد تصل إلى زيرند")} tone="success" center d={2000} />
      <Mark x={430} y={238} ok d={2200} />
    </Svg>
  );
}

const CITIES_AT: [string, number][] = [
  ["Sibiu", 150],
  ["Rimnicu_Vilcea", 262],
  ["Pitesti", 378],
];

const LEVELS: Record<string, { search: number; effort: number; searchText: string; effortText: ReturnType<typeof bi>; verdict: ReturnType<typeof bi>; ok: boolean }> = {
  fine: {
    search: 1,
    effort: 0.06,
    searchText: "1000s",
    effortText: bi("tiny", "ضئيل"),
    verdict: bi("too detailed: the search is hopeless", "تفاصيل زائدة: البحث ميؤوس منه"),
    ok: false,
  },
  cities: {
    search: 0.1,
    effort: 0.16,
    searchText: String(VIA_RIMNICU.length - 1),
    effortText: bi("easy", "سهل"),
    verdict: bi("useful: few actions, each one easy", "مفيد: أفعال قليلة، وكل منها سهل"),
    ok: true,
  },
  coarse: {
    search: 0.03,
    effort: 1,
    searchText: "1",
    effortText: bi("huge", "ضخم"),
    verdict: bi("too coarse: one step as hard as the problem", "تجريد زائد: خطوة بصعوبة المسألة كلها"),
    ok: false,
  },
};

function Detail({ control }: { control: string }) {
  const level = LEVELS[control] ?? LEVELS.cities;
  const plan =
    control === "fine" ? (
      <>
        {Array.from({ length: 36 }, (_, i) => (
          <Box key={i} x={84 + i * 10.3} y={84} w={7} h={16} r={1.5} tone="slate" d={200 + i * 25} />
        ))}
        <Chip x={150} y={50} text={bi("steer left", "انعطف يسارًا")} tone="outline" center d={600} />
        <Chip x={276} y={50} text={bi("brake", "المكابح")} tone="outline" center d={800} />
        <Chip x={400} y={50} text={bi("steer right", "انعطف يمينًا")} tone="outline" center d={1000} />
      </>
    ) : control === "coarse" ? (
      <Arrow pts={[[76, 92], [466, 92]]} tone="gold" width={3} d={200} dur={600} label="Arad → Bucharest" labelAt={[270, 74]} labelTone="gold" />
    ) : (
      <>
        <Arrow pts={[[75, 92], [120, 92]]} tone="gold" d={200} dur={200} />
        <Arrow pts={[[180, 92], [203, 92]]} tone="gold" d={450} dur={150} />
        <Arrow pts={[[321, 92], [341, 92]]} tone="gold" d={700} dur={150} />
        <Arrow pts={[[415, 92], [466, 92]]} tone="gold" d={950} dur={200} />
        {CITIES_AT.map(([c, x], i) => (
          <Chip key={c} x={x} y={92} text={cityName(c)} tone="slate" center d={300 + i * 250} />
        ))}
      </>
    );
  const meter = (y: number, p: number, good: boolean, d: number) => (
    <>
      <Box x={210} y={y - 9} w={310} h={18} r={4} tone="muted" d={d} />
      <Box x={210} y={y - 9} w={Math.max(310 * p, 8)} h={18} r={4} tone={good ? "success" : "danger"} d={d + 200} />
    </>
  );
  return (
    <Svg>
      <Chip x={48} y={92} text="Arad" tone="navy" center d={0} />
      <Chip x={510} y={92} text="Bucharest" tone="gold" center d={0} />
      {plan}
      <Text x={24} y={150} text={bi("Actions to search", "الأفعال التي يُبحث فيها")} anchor="start" size={11.5} tone="heading" d={1200} />
      <Text x={200} y={150} text={level.searchText} anchor="end" mono size={11.5} tone="muted" d={1300} />
      {meter(150, level.search, level.search < 0.5, 1200)}
      <Text x={24} y={202} text={bi("Effort per action", "الجهد لكل فعل")} anchor="start" size={11.5} tone="heading" d={1500} />
      {meter(202, level.effort, level.effort < 0.5, 1500)}
      <Text x={200} y={202} text={level.effortText} anchor="end" size={11.5} tone="muted" d={1600} />
      <Chip x={280} y={252} text={level.verdict} tone={level.ok ? "success" : "danger"} center d={2000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof abstraction>>({
  states: States,
  actions: Actions,
  valid: Valid,
  detail: Detail,
});
