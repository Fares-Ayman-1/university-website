"use client";

import type { applications } from "@/lib/walkthroughs/image-processing/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Shape } from "./local";

function Cctv() {
  const people = [190, 240, 290, 340, 390, 440, 490];
  const odd = 5;
  return (
    <Svg>
      <Box x={20} y={36} w={100} h={44} label="CCTV" tone="navy" d={0} />
      <Chip x={70} y={104} text={bi("24/7, real time", "على مدار الساعة")} tone="danger" center d={200} />
      <Box x={162} y={102} w={370} h={86} r={12} tone="ghost" dashed d={300} />
      <Text x={347} y={80} text={bi("camera view", "مجال رؤية الكاميرا")} tone="muted" size={11} d={300} />
      <Arrow pts={[[122, 58], [160, 104]]} tone="faint" d={300} dur={300} />
      {people.map((x, i) => (
        <Person key={i} x={x} y={122} tone={i === odd ? "danger" : "slate"} d={400 + i * 90} />
      ))}
      <Frame x={people[odd] - 22} y={114} w={44} h={54} tone="danger" d={1200} />
      <Chip x={people[odd]} y={218} text={bi("abnormal", "غير طبيعي")} tone="danger" center d={1300} />
      <Arrow pts={[[people[odd], 170], [people[odd], 198]]} tone="danger" d={1300} dur={200} />
      <Chip x={250} y={218} text={bi("people counted: 7", "عدد الأشخاص: 7")} tone="gold" center d={1500} />
      <Chip x={250} y={258} text={bi("crowd detected", "اكتشاف حشد")} tone="outline" center d={1700} />
    </Svg>
  );
}

function Roads({ control }: { control: string }) {
  if (control === "driving") {
    return (
      <Svg>
        <Chip x={280} y={26} text={bi("fog", "ضباب")} tone="muted" center d={0} />
        <Arrow pts={[[60, 270], [250, 110]]} tone="faint" head={false} d={100} />
        <Arrow pts={[[500, 270], [310, 110]]} tone="faint" head={false} d={100} />
        <Arrow pts={[[150, 270], [262, 112]]} tone="gold" head={false} width={3} d={500} />
        <Arrow pts={[[410, 270], [298, 112]]} tone="gold" head={false} width={3} d={500} />
        <Text x={140} y={232} text={bi("lane", "حارة")} tone="gold" size={11.5} d={800} />
        <Shape x={96} y={56} w={26} h={56} fill="rgb(52,52,52)" d={700} />
        <Frame x={88} y={48} w={42} h={72} tone="success" d={900} />
        <Text x={109} y={136} text={bi("traffic light", "إشارة مرور")} tone="success" size={11} d={1000} />
        <Shape x={438} y={66} w={40} h={40} rx={20} fill="rgb(200,60,60)" d={700} />
        <Frame x={430} y={58} w={56} h={56} tone="success" d={1100} />
        <Text x={458} y={130} text={bi("sign", "لافتة")} tone="success" size={11} d={1200} />
        <Shape x={250} y={196} w={60} h={34} fill="rgb(120,120,120)" d={800} />
        <Frame x={242} y={188} w={76} h={50} tone="danger" d={1300} />
        <Text x={280} y={256} text={bi("obstacle: slow down", "عائق: خفّف السرعة")} tone="danger" size={11} d={1400} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Box x={24} y={78} w={160} h={96} r={16} tone="slate" d={0} />
      <Text x={104} y={100} text={bi("car", "سيارة")} tone="heading" size={12} d={100} />
      <Box x={58} y={134} w={92} h={28} r={4} label="DS 8354" tone="outline" mono size={12} d={200} />
      <Frame x={52} y={128} w={104} h={40} tone="gold" d={500} />
      <Arrow pts={[[186, 126], [226, 126]]} tone="gold" d={700} dur={300} />
      <Token pts={[[186, 126], [226, 126]]} d={800} dur={400} />
      <Box x={228} y={98} w={110} h={56} label="ANPR" sub={bi("reads the plate", "يقرأ اللوحة")} tone="navy" d={900} />
      <Arrow pts={[[340, 126], [380, 126]]} tone="gold" d={1200} dur={300} />
      <Chip x={436} y={126} text="DS 8354" tone="gold" center w={100} d={1300} />
      <Arrow pts={[[436, 142], [436, 186]]} tone="gold" d={1500} dur={300} />
      <Box x={376} y={188} w={120} h={46} label={bi("Gate opens", "تُفتح البوابة")} tone="success" d={1600} />
      <Mark x={496} y={188} ok d={1800} />
    </Svg>
  );
}

function HealthIndustry({ control }: { control: string }) {
  if (control === "inspection") {
    const bottles = [50, 140, 230, 320, 410];
    const bad = 3;
    return (
      <Svg>
        <Box x={232} y={20} w={110} h={40} label={bi("Camera", "الكاميرا")} tone="navy" d={0} />
        <Arrow pts={[[287, 62], [362, 114]]} tone="faint" head={false} dashed d={300} />
        <Arrow pts={[[287, 62], [318, 114]]} tone="faint" head={false} dashed d={300} />
        <Arrow pts={[[16, 200], [544, 200]]} tone="slate" head={false} width={3} d={100} />
        {[40, 120, 200, 280, 360, 440, 520].map((x, i) => (
          <Shape key={i} x={x - 6} y={202} w={12} h={12} ellipse fill="var(--surface-3)" d={150} />
        ))}
        {bottles.map((x, i) => (
          <g key={i}>
            <Box x={x} y={118} w={40} h={80} r={8} tone="outline" d={300 + i * 120} />
            {i === bad ? null : <Box x={x + 3} y={146} w={34} h={22} r={2} tone="gold" d={400 + i * 120} />}
            {i === bad ? null : <Mark x={x + 20} y={104} ok r={9} d={1300 + i * 80} />}
          </g>
        ))}
        <Mark x={bottles[bad] + 20} y={104} ok={false} r={9} d={1500} />
        <Arrow pts={[[bottles[bad] + 20, 216], [bottles[bad] + 20, 236]]} tone="danger" d={1700} dur={250} />
        <Chip x={bottles[bad] + 20} y={256} text={bi("no label: rejected", "بلا بطاقة: مرفوضة")} tone="danger" center d={1800} />
        <Text x={80} y={248} text={bi("conveyor belt", "السير الناقل")} tone="muted" size={11} d={300} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Shape x={30} y={28} w={170} h={200} rx={6} fill="rgb(24,24,28)" d={0} />
      <Shape x={52} y={60} w={56} h={128} ellipse fill="rgb(150,150,156)" stroke="none" d={200} />
      <Shape x={122} y={60} w={56} h={128} ellipse fill="rgb(150,150,156)" stroke="none" d={200} />
      <Shape x={109} y={46} w={12} h={160} rx={6} fill="rgb(205,205,210)" stroke="none" d={250} />
      <Frame x={130} y={98} w={30} h={30} tone="danger" d={900} />
      <Text x={115} y={246} text={bi("chest X-ray", "أشعة الصدر")} tone="muted" size={11} d={300} />
      <Arrow pts={[[204, 145], [252, 145]]} tone="gold" d={1000} dur={300} />
      <Box x={254} y={120} w={110} h={50} label={bi("Vision model", "نموذج الرؤية")} tone="navy" d={1100} />
      <Arrow pts={[[366, 132], [400, 72]]} tone="gold" d={1300} dur={300} />
      <Arrow pts={[[366, 145], [400, 145]]} tone="gold" d={1400} dur={300} />
      <Arrow pts={[[366, 158], [400, 218]]} tone="gold" d={1500} dur={300} />
      <Chip x={474} y={66} text={bi("detect tumours", "اكتشاف الأورام")} tone="danger" w={140} center d={1400} />
      <Chip x={474} y={145} text={bi("measure organs", "قياس الأعضاء")} tone="outline" w={140} center d={1500} />
      <Chip x={474} y={224} text={bi("COVID-19 or not?", "COVID-19 أم لا؟")} tone="gold" w={140} center d={1600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof applications>>({
  cctv: Cctv,
  roads: Roads,
  "health-industry": HealthIndustry,
});
