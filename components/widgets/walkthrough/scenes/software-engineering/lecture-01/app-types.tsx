"use client";

import type { appTypes } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Cylinder, Doc, Mark, Person, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function LocalRemote({ control }: { control: string }) {
  if (control === "interactive") {
    const users = [58, 166];
    return (
      <Svg>
        <Chip x={446} y={64} text={bi("Amazon, online banking", "Amazon والمصارف عبر الإنترنت")} tone="slate" center d={0} />
        <Box x={356} y={118} w={180} h={56} label={bi("Remote system", "النظام البعيد")} tone="navy" d={100} />
        {users.map((y, i) => {
          const from: Pt = [100, y + 24];
          const to: Pt = [354, 138 + i * 18];
          return (
            <g key={i}>
              <Person x={70} y={y} label={bi("User's PC", "حاسوب المستخدم")} d={200 + i * 150} />
              <Arrow pts={[from, to]} tone="gold" both d={500 + i * 150} />
              <Token pts={[from, to, from]} d={900 + i * 600} dur={1400} />
            </g>
          );
        })}
        <Text x={280} y={254} text={bi("requests and responses in real time", "طلبات وردود في الوقت الفعلي")} tone="gold" size={12} d={1600} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Box x={30} y={46} w={270} h={210} r={14} tone="ghost" dashed d={0} />
      <Text x={165} y={66} text={bi("Your computer", "حاسوبك")} tone="heading" size={12.5} d={0} />
      <Box x={50} y={94} w={230} h={48} label={bi("Application", "التطبيق")} tone="navy" d={200} />
      <Doc x={50} y={160} w={104} h={80} label={bi("Your files", "ملفاتك")} tone="outline" d={400} />
      <Box x={170} y={160} w={110} h={80} label={bi("All it needs", "كل ما يحتاج إليه")} tone="slate" d={550} />
      <Arrow pts={[[302, 150], [398, 150]]} tone="faint" dashed head={false} d={800} />
      <Mark x={350} y={150} ok={false} d={1000} />
      <Text x={350} y={178} text={bi("no network", "لا شبكة")} tone="danger" size={11.5} d={1100} />
      <Box x={400} y={122} w={130} h={56} label={bi("Network", "الشبكة")} tone="muted" dashed d={700} />
      <Chip x={465} y={236} text={bi("office, photo editing", "المكتب وتحرير الصور")} tone="slate" center d={1300} />
    </Svg>
  );
}

function Embedded() {
  const loop: Pt[] = [
    [105, 168],
    [105, 108],
    [182, 80],
    [228, 80],
    [392, 84],
    [480, 84],
    [480, 174],
    [418, 200],
    [152, 200],
  ];
  return (
    <Svg>
      <Box x={60} y={170} w={90} h={60} r={30} label={bi("Wheel", "العجلة")} tone="outline" d={0} />
      <Arrow pts={[[105, 168], [105, 108]]} tone="slate" d={200} dur={300} />
      <Box x={30} y={56} w={150} h={50} label={bi("Wheel-speed sensor", "مستشعر سرعة العجلة")} tone="slate" d={300} />
      <Arrow pts={[[182, 80], [228, 80]]} tone="slate" d={500} dur={250} />
      <Box x={230} y={48} w={160} h={70} label={bi("ABS controller", "وحدة تحكم ABS")} sub={bi("embedded software", "برمجيات مدمجة")} tone="navy" d={600} />
      <Arrow pts={[[392, 84], [480, 84], [480, 174]]} tone="gold" d={800} label={bi("ease the brake", "خفف المكبح")} labelAt={[436, 56]} labelTone="gold" />
      <Box x={420} y={176} w={120} h={48} label={bi("Brake", "المكبح")} tone="slate" d={900} />
      <Arrow pts={[[418, 200], [152, 200]]} tone="success" d={1100} label={bi("wheel doesn't lock", "لا تنغلق العجلة")} labelAt={[285, 222]} labelTone="success" />
      <Token pts={loop} d={1300} dur={2200} />
      <Text x={285} y={160} text={bi("many times a second", "مرات كثيرة في الثانية")} tone="gold" size={12} d={1600} />
    </Svg>
  );
}

function Batch() {
  const calls = [70, 92, 114, 136, 158, 180];
  const bills: Pt[] = [
    [400, 60],
    [470, 60],
    [400, 150],
    [470, 150],
  ];
  return (
    <Svg>
      <Text x={105} y={22} text={bi("All month", "طوال الشهر")} tone="muted" size={12} d={0} />
      {calls.map((y, i) => (
        <Token key={i} pts={[[8, y], [48, 120]]} r={4} d={200 + i * 180} dur={500} />
      ))}
      <Cylinder x={50} y={56} w={110} h={124} label={bi("Call records", "سجلات المكالمات")} sub={bi("1 month", "شهر واحد")} tone="slate" d={0} />
      <Text x={105} y={208} text={bi("inputs pile up", "تتراكم المدخلات")} tone="muted" size={11.5} d={600} />
      <Chip x={290} y={60} text={bi("once a month", "مرة كل شهر")} tone="gold" center d={1300} />
      <Arrow pts={[[162, 130], [218, 130]]} tone="gold" d={1500} dur={300} />
      <Box x={220} y={96} w={140} h={68} label={bi("Billing run", "عملية الفوترة")} sub={bi("end of month", "نهاية الشهر")} tone="navy" d={1400} />
      <Arrow pts={[[362, 130], [396, 130]]} tone="gold" d={1800} dur={250} />
      {bills.map(([x, y], i) => (
        <Doc key={i} x={x} y={y} w={60} h={76} label={bi("Bill", "فاتورة")} tone="outline" d={1900 + i * 150} />
      ))}
      <Text x={465} y={252} text={bi("a bill per customer", "فاتورة لكل عميل")} tone="heading" size={12} d={2500} />
      <Chip x={290} y={236} text={bi("not real time", "ليس في الوقت الفعلي")} tone="muted" center d={2600} />
    </Svg>
  );
}

function DataCollection() {
  const sensors = [bi("Soil moisture", "رطوبة التربة"), bi("Crop health", "صحة المحصول"), bi("Weather", "الطقس")];
  const ys = [86, 144, 202];
  return (
    <Svg>
      <Box x={16} y={44} w={190} h={222} r={14} tone="ghost" dashed d={0} />
      <Text x={111} y={62} text={bi("Out in the field", "في الحقل")} tone="heading" size={12} d={0} />
      {sensors.map((s, i) => (
        <g key={i}>
          <Box x={30} y={ys[i]} w={160} h={44} label={s} tone="slate" d={200 + i * 150} />
          <Arrow pts={[[192, ys[i] + 22], [226, 140]]} tone="faint" d={700 + i * 100} dur={250} />
          <Token pts={[[192, ys[i] + 22], [226, 140]]} r={4} d={900 + i * 250} dur={400} />
        </g>
      ))}
      <Box x={228} y={110} w={150} h={60} label={bi("Collection software", "برمجيات الجمع")} tone="navy" d={600} />
      <Arrow pts={[[380, 140], [408, 140]]} tone="gold" d={1500} dur={250} />
      <Token pts={[[380, 140], [408, 140]]} d={1700} dur={400} />
      <Box x={410} y={106} w={134} h={68} label={bi("Other systems", "أنظمة أخرى")} sub={bi("analysis", "التحليل")} tone="gold" d={1600} />
      <Chip x={390} y={236} text={bi("must be robust", "يجب أن تكون متينة")} tone="warn" center d={2000} />
    </Svg>
  );
}

const OBJECTS: Pt[] = [
  [70, 110],
  [130, 90],
  [190, 120],
  [250, 96],
  [310, 124],
  [100, 170],
  [170, 186],
  [240, 166],
  [300, 196],
];
const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [2, 6],
  [3, 7],
  [4, 8],
  [1, 5],
];

function Others({ control }: { control: string }) {
  if (control === "simulation") {
    return (
      <Svg>
        <Box x={30} y={44} w={320} h={214} r={14} tone="ghost" dashed d={0} />
        <Text x={190} y={62} text={bi("Weather model", "نموذج الطقس")} tone="heading" size={12} d={0} />
        {LINKS.map(([a, b], k) => (
          <Arrow key={k} pts={[OBJECTS[a], OBJECTS[b]]} tone="faint" head={false} d={300 + k * 40} dur={250} />
        ))}
        {OBJECTS.map(([x, y], i) => (
          <Box key={i} x={x - 10} y={y - 10} w={20} h={20} r={10} tone="slate" d={100 + i * 60} />
        ))}
        <Token pts={[OBJECTS[0], OBJECTS[1], OBJECTS[2], OBJECTS[3], OBJECTS[4]]} r={4} d={900} dur={1400} />
        <Token pts={[OBJECTS[5], OBJECTS[6], OBJECTS[7], OBJECTS[8]]} r={4} d={1100} dur={1400} />
        <Text x={190} y={232} text={bi("many interacting objects", "كائنات كثيرة متفاعلة")} tone="muted" size={11.5} d={1000} />
        <Person x={470} y={56} label={bi("Scientists", "العلماء")} d={500} />
        <Arrow pts={[[352, 180], [398, 180]]} tone="gold" d={1500} dur={250} />
        <Box x={400} y={150} w={140} h={60} label={bi("Forecast", "التوقعات")} tone="gold" d={1600} />
      </Svg>
    );
  }
  if (control === "sos") {
    const systems = [bi("Sales", "المبيعات"), bi("Inventory", "المخزون"), bi("Payroll", "الرواتب"), bi("Shipping", "الشحن")];
    return (
      <Svg>
        <Box x={20} y={44} w={520} h={180} r={14} tone="ghost" dashed d={0} />
        <Text x={280} y={62} text={bi("Enterprise system", "نظام المؤسسة")} tone="heading" size={12.5} d={0} />
        <Arrow pts={[[92, 186], [468, 186]]} tone="gold" head={false} d={1000} dur={600} width={2.6} />
        {systems.map((s, i) => {
          const x = 40 + i * 125;
          return (
            <g key={i}>
              <Box x={x} y={88} w={105} h={68} label={s} sub={bi("a system", "نظام")} tone="navy" d={200 + i * 150} />
              <Arrow pts={[[x + 52, 158], [x + 52, 186]]} tone="gold" head={false} d={900} dur={200} />
            </g>
          );
        })}
        <Token pts={[[92, 186], [468, 186]]} d={1500} dur={1200} />
        <Token pts={[[468, 186], [92, 186]]} tone="navy" d={1800} dur={1200} />
        <Text x={280} y={248} text={bi("each part is a software system in its own right", "كل جزء نظام برمجي قائم بذاته")} tone="muted" size={11.5} d={2000} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Person x={100} y={92} label={bi("Player", "اللاعب")} d={0} />
      <Arrow pts={[[132, 116], [218, 116]]} tone="slate" d={300} dur={300} />
      <Box x={220} y={88} w={150} h={60} label={bi("Game", "اللعبة")} tone="gold" d={300} />
      <Arrow pts={[[295, 150], [295, 206], [100, 206], [100, 172]]} tone="gold" d={700} label={bi("fun", "المتعة")} labelAt={[200, 226]} labelTone="gold" />
      <Token pts={[[295, 150], [295, 206], [100, 206], [100, 172]]} d={900} dur={900} />
      <Chip x={462} y={88} text={bi("personal use", "استخدام شخصي")} tone="slate" center d={1100} />
      <Chip x={462} y={148} text={bi("to entertain", "للإمتاع")} tone="slate" center d={1300} />
    </Svg>
  );
}

function Web({ control }: { control: string }) {
  if (control === "cloud") {
    const users = [100, 280, 460];
    return (
      <Svg>
        <Box x={180} y={44} w={200} h={68} r={34} label={bi("The cloud", "السحابة")} sub={bi("the app runs here", "يعمل التطبيق هنا")} tone="navy" d={0} />
        <Chip x={478} y={62} text={bi("web services", "خدمات الويب")} tone="slate" center d={300} />
        <Arrow pts={[[424, 70], [382, 76]]} tone="slate" dashed d={400} />
        {users.map((x, i) => (
          <g key={i}>
            <Arrow pts={[[280, 114], [x, 146]]} tone="gold" both d={600 + i * 150} />
            <Person x={x} y={150} label={bi("User", "مستخدم")} d={700 + i * 150} />
            <Token pts={[[280, 114], [x, 146]]} d={1000 + i * 200} dur={500} />
          </g>
        ))}
        <Chip x={280} y={248} text={bi("nothing to buy: pay according to use", "لا شيء للشراء: الدفع حسب الاستخدام")} tone="gold" center d={1600} />
      </Svg>
    );
  }
  const ys = [50, 116, 182];
  return (
    <Svg>
      <Box x={20} y={110} w={140} h={56} label={bi("Software vendor", "مورِّد البرمجيات")} tone="navy" d={0} />
      {ys.map((y, i) => (
        <g key={i}>
          <Arrow pts={[[162, 138], [378, y + 22]]} tone="faint" d={300 + i * 150} />
          <Box x={380} y={y} w={160} h={44} label={bi("Installed copy", "نسخة مثبتة")} tone="outline" d={500 + i * 200} />
          <Token pts={[[162, 138], [378, y + 22]]} d={700 + i * 250} dur={600} />
        </g>
      ))}
      <Text x={280} y={252} text={bi("each user buys a copy and installs it", "كل مستخدم يشتري نسخة ويثبّتها")} tone="heading" size={12} d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof appTypes>>({
  "local-remote": LocalRemote,
  embedded: Embedded,
  batch: Batch,
  "data-collection": DataCollection,
  others: Others,
  web: Web,
});
