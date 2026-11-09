"use client";

import type { peas } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import { PEAS, PEAS_LETTERS, componentOf, type PeasLetter, type PeasTask } from "@/lib/widgets/ai-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const LETTER_NAMES: Record<PeasLetter, Bi> = {
  P: bi("Performance measure", "مقياس الأداء"),
  E: bi("Environment", "البيئة"),
  A: bi("Actuators", "المشغِّلات"),
  S: bi("Sensors", "المستشعرات"),
};

const ITEMS: Record<string, Bi> = {
  safety: bi("safety", "السلامة"),
  destination: bi("destination", "الوصول إلى الوجهة"),
  profit: bi("profit", "الربح"),
  legality: bi("legality", "الالتزام بالقانون"),
  comfort: bi("passenger comfort", "راحة الركاب"),
  streets: bi("streets", "الشوارع"),
  highways: bi("highways", "الطرق السريعة"),
  traffic: bi("traffic", "حركة المرور"),
  pedestrians: bi("pedestrians", "المشاة"),
  weather: bi("weather", "الطقس"),
  steering: bi("steering", "المقود"),
  accelerator: bi("accelerator", "دواسة الوقود"),
  brake: bi("brake", "المكابح"),
  horn: bi("horn", "البوق"),
  speaker: bi("speaker/display", "السماعة/الشاشة"),
  cameras: bi("cameras", "الكاميرات"),
  accelerometers: bi("accelerometers", "مقاييس التسارع"),
  gauges: bi("gauges", "العدّادات"),
  engine: bi("engine sensors", "مستشعرات المحرك"),
  gps: bi("GPS", "نظام GPS"),
  keyboard: bi("keyboard", "لوحة المفاتيح"),
  price: bi("price", "السعر"),
  quality: bi("quality", "الجودة"),
  appropriateness: bi("appropriateness", "الملاءمة"),
  efficiency: bi("efficiency", "الكفاءة"),
  websites: bi("current and future websites", "المواقع الحالية والمستقبلية"),
  vendors: bi("vendors", "البائعون"),
  shippers: bi("shippers", "شركات الشحن"),
  display: bi("display to user", "العرض للمستخدم"),
  url: bi("follow URL", "فتح عنوان URL"),
  forms: bi("fill in forms", "تعبئة النماذج"),
  html: bi("HTML pages", "صفحات HTML"),
};

/** What the shopping agent's HTML pages contain, listed under them on the card. */
const HTML_PARTS = bi("text, graphics, scripts", "النصوص والرسوميات والسكربتات");

const taskOf = (control: string): PeasTask => (control === "shopping" ? "shopping" : "taxi");

function Letters() {
  return (
    <Svg>
      <Box x={14} y={30} w={360} h={234} r={14} tone="slate" d={0} />
      <Text x={36} y={50} text="E" mono size={18} tone="gold" d={100} />
      <Text x={54} y={50} text={bi("Environment", "البيئة")} anchor="start" tone="heading" size={12} d={100} />
      <Box x={94} y={100} w={210} h={112} r={12} tone="outline" d={200} />
      <Text x={199} y={118} text={bi("Agent", "الوكيل")} tone="heading" size={12} d={250} />
      <Box x={104} y={146} w={88} h={56} label="S" sub={bi("Sensors", "المستشعرات")} mono size={16} subSize={10.5} tone="navy" d={400} />
      <Box x={206} y={146} w={88} h={56} label="A" sub={bi("Actuators", "المشغِّلات")} mono size={16} subSize={10.5} tone="navy" d={500} />
      <Arrow pts={[[34, 174], [102, 174]]} tone="gold" d={700} dur={300} />
      <Token pts={[[34, 174], [102, 174]]} d={750} dur={500} />
      <Arrow pts={[[192, 174], [204, 174]]} tone="slate" d={1050} dur={150} head={false} />
      <Arrow pts={[[296, 174], [362, 174]]} tone="gold" d={1200} dur={300} />
      <Token pts={[[296, 174], [362, 174]]} d={1250} dur={500} tone="navy" />
      <Text x={66} y={236} text={bi("percepts in", "الإدراكات تدخل")} tone="gold" size={11} d={900} />
      <Text x={330} y={236} text={bi("actions out", "الأفعال تخرج")} tone="gold" size={11} d={1400} />
      <Arrow pts={[[376, 148], [420, 148]]} tone="gold" dashed d={1700} />
      <Box x={422} y={96} w={126} h={104} label="P" sub={bi("Performance measure", "مقياس الأداء")} mono size={18} subSize={10.5} tone="gold" d={1800} />
      <Text x={485} y={216} text={bi("judges the states", "يحكم على الحالات")} tone="muted" size={11} d={2000} />
      <Text x={485} y={246} text={bi("from outside", "من الخارج")} tone="muted" size={11} d={2100} />
    </Svg>
  );
}

const CELL = { w: 272, h: 134 };
const cellX = (i: number) => (i % 2 === 0 ? 6 : 282);
const cellY = (i: number) => (i < 2 ? 4 : 142);

function Card({ control }: { control: string }) {
  const task = taskOf(control);
  return (
    <Svg>
      {PEAS_LETTERS.map((letter, i) => {
        const x = cellX(i);
        const y = cellY(i);
        const items: Bi[] = (PEAS[task][letter] as readonly string[]).map((id) => ITEMS[id]);
        if (task === "shopping" && letter === "S") items.push(HTML_PARTS);
        const twoCols = items.length > 3;
        const d = 100 + i * 350;
        return (
          <g key={`${task}-${letter}`}>
            <Box x={x} y={y} w={CELL.w} h={CELL.h} r={12} tone="outline" d={d} />
            <Box x={x + 10} y={y + 8} w={30} h={30} r={8} label={letter} mono size={15} tone="gold" d={d} />
            <Text x={x + 50} y={y + 17} text={LETTER_NAMES[letter]} anchor="start" tone="heading" size={12} d={d} />
            {items.map((item, k) => {
              const col = twoCols ? Math.floor(k / 3) : 0;
              const row = twoCols ? k % 3 : k;
              const ix = x + 16 + col * 132;
              const iy = y + 50 + row * 30;
              const muted = item === HTML_PARTS;
              return (
                <In key={k} d={d + 120 + k * 70}>
                  <circle cx={ix} cy={iy} r={2.6} style={{ fill: muted ? "var(--muted)" : "var(--gold)" }} />
                  <Text x={ix + 8} y={iy} text={item} anchor="start" size={10.5} weight={muted ? 500 : 600} tone={muted ? "muted" : "text"} />
                </In>
              );
            })}
          </g>
        );
      })}
    </Svg>
  );
}

const SORT_ITEMS: Record<PeasTask, readonly string[]> = {
  taxi: ["steering", "keyboard", "pedestrians", "comfort"],
  shopping: ["forms", "html", "vendors", "price"],
};
const SHORT: Record<string, Bi> = { comfort: bi("comfort", "راحة الركاب") };
const BIN_NAMES: Record<PeasLetter, Bi> = { ...LETTER_NAMES, P: bi("Performance", "مقياس الأداء") };

function Sort({ control }: { control: string }) {
  const task = taskOf(control);
  const binX = (letter: PeasLetter) => 12 + PEAS_LETTERS.indexOf(letter) * 137;
  const itemX = (k: number) => 76 + k * 136;
  return (
    <Svg>
      {PEAS_LETTERS.map((letter, i) => (
        <g key={letter}>
          <Box x={binX(letter)} y={150} w={125} h={122} r={12} tone="outline" d={i * 100} />
          <Text x={binX(letter) + 62.5} y={170} text={letter} mono size={20} tone="gold" d={i * 100} />
          <Text x={binX(letter) + 62.5} y={196} text={BIN_NAMES[letter]} tone="heading" size={11.5} d={i * 100} />
        </g>
      ))}
      {SORT_ITEMS[task].map((id, k) => {
        const letter = componentOf(task, id) ?? "E";
        const label = SHORT[id] ?? ITEMS[id];
        const to: [number, number] = [binX(letter) + 62.5, 150];
        const d = 500 + k * 500;
        return (
          <g key={`${task}-${id}`}>
            <Chip x={itemX(k)} y={48} w={124} text={label} tone="slate" size={10.5} center d={300 + k * 100} />
            <Arrow pts={[[itemX(k), 68], to]} tone="gold" dashed d={d} />
            <Token pts={[[itemX(k), 68], to]} d={d} dur={600} />
            <Fade d={d + 600}>
              <Chip x={to[0]} y={246} w={116} text={label} tone="gold" size={10.5} center />
            </Fade>
          </g>
        );
      })}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof peas>>({
  letters: Letters,
  card: Card,
  sort: Sort,
});
