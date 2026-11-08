"use client";

import type { products } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const BUYERS: [number, number][] = [
  [420, 50],
  [470, 50],
  [520, 50],
  [420, 140],
  [470, 140],
  [520, 140],
];

function TwoKinds({ control }: { control: string }) {
  if (control === "custom") {
    return (
      <Svg>
        <Box x={20} y={92} w={150} h={68} label={bi("University", "الجامعة")} sub={bi("one customer", "عميل واحد")} tone="slate" d={0} />
        <Box x={390} y={92} w={150} h={68} label={bi("Developer", "المطوّر")} sub={bi("under contract", "بموجب عقد")} tone="navy" d={200} />
        <Arrow pts={[[172, 112], [388, 112]]} tone="slate" d={500} label={bi("its own needs", "احتياجاتها الخاصة")} labelAt={[280, 84]} labelTone="slate" />
        <Token pts={[[172, 112], [388, 112]]} tone="navy" d={600} dur={700} />
        <Arrow pts={[[465, 162], [465, 226], [362, 226]]} tone="gold" d={1200} />
        <Box x={200} y={194} w={160} h={68} label={bi("Admission system", "نظام القبول")} sub={bi("built for it alone", "مبني لها وحدها")} tone="gold" d={1500} />
        <Arrow pts={[[198, 226], [95, 226], [95, 162]]} tone="gold" d={1800} />
        <Token pts={[[465, 162], [465, 226], [362, 226]]} d={1200} dur={600} />
        <Token pts={[[198, 226], [95, 226], [95, 162]]} d={1900} dur={600} />
        <Mark x={170} y={96} ok d={2300} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Box x={20} y={110} w={140} h={48} label={bi("Software company", "شركة برمجيات")} tone="navy" d={0} />
      <Arrow pts={[[162, 134], [196, 134]]} tone="slate" d={300} dur={300} />
      <Box x={198} y={100} w={150} h={68} label={bi("Word processor", "معالج النصوص")} sub={bi("one version", "نسخة واحدة")} tone="gold" d={400} />
      <Arrow pts={[[350, 124], [396, 74]]} tone="gold" d={700} dur={300} />
      <Arrow pts={[[350, 144], [396, 160]]} tone="gold" d={700} dur={300} />
      {BUYERS.map(([x, y], i) => (
        <Person key={i} x={x} y={y} tone="outline" d={900 + i * 80} />
      ))}
      <Token pts={[[350, 124], [396, 74]]} d={1000} dur={500} />
      <Token pts={[[350, 144], [396, 160]]} d={1200} dur={500} />
      <Text x={470} y={210} text={bi("anyone who buys it", "أي شخص يشتريه")} tone="heading" size={12} d={1500} />
      <Chip x={280} y={250} text={bi("open market", "السوق المفتوحة")} tone="slate" center d={1700} />
    </Svg>
  );
}

function Specification({ control }: { control: string }) {
  if (control === "custom") {
    return (
      <Svg>
        <Person x={80} y={60} label={bi("Customer", "العميل")} d={0} />
        <Person x={480} y={60} label={bi("Developer", "المطوّر")} d={100} />
        <Doc x={225} y={50} w={110} h={100} label={bi("Contract", "العقد")} tone="gold" d={300} />
        <Arrow pts={[[108, 84], [222, 98]]} tone="slate" d={600} />
        <Arrow pts={[[452, 84], [338, 98]]} tone="slate" d={600} />
        <Mark x={252} y={132} ok d={1000} />
        <Mark x={308} y={132} ok d={1200} />
        <Arrow pts={[[280, 152], [280, 180]]} tone="gold" d={1400} dur={250} />
        <Token pts={[[280, 152], [280, 180]]} d={1500} dur={300} />
        <Doc x={215} y={182} w={130} h={82} label={bi("Specification", "التوصيف")} tone="outline" d={1600} />
        <Text x={460} y={222} text={bi("agreed by both sides", "يتفق عليه الطرفان")} tone="success" size={12} d={1900} />
      </Svg>
    );
  }
  return (
    <Svg>
      {[40, 80, 120, 160].map((x, i) => (
        <Person key={i} x={x} y={62} tone="outline" d={i * 90} />
      ))}
      <Text x={100} y={124} text={bi("The market", "السوق")} tone="heading" size={12} d={300} />
      <Box x={190} y={38} w={356} h={226} r={14} tone="ghost" dashed d={400} />
      <Text x={300} y={236} text={bi("inside the company", "داخل الشركة")} tone="muted" size={11.5} d={500} />
      <Arrow pts={[[180, 82], [208, 82]]} tone="slate" d={700} dur={250} />
      <Box x={210} y={58} w={150} h={48} label={bi("Marketing dept.", "قسم التسويق")} tone="slate" d={700} />
      <Arrow pts={[[362, 82], [396, 82]]} tone="gold" d={1000} dur={300} />
      <Token pts={[[180, 82], [208, 82], [362, 82], [396, 82]]} d={800} dur={900} />
      <Doc x={398} y={50} w={120} h={84} label={bi("Specification", "التوصيف")} tone="gold" d={1100} />
      <Arrow pts={[[458, 136], [458, 166]]} tone="gold" d={1400} dur={250} />
      <Box x={384} y={168} w={148} h={46} label={bi("Developers", "المطوّرون")} tone="navy" d={1500} />
    </Svg>
  );
}

const SLICES = Array.from({ length: 10 }, (_, i) => i);

function UsersCost({ control }: { control: string }) {
  const custom = control === "custom";
  return (
    <Svg>
      <Text x={280} y={22} text={bi("Development cost", "تكلفة التطوير")} tone="heading" size={12.5} d={0} />
      {custom ? (
        <>
          <Box x={60} y={48} w={440} h={40} r={6} tone="gold" d={100} />
          <Arrow pts={[[280, 90], [280, 124]]} tone="danger" d={600} dur={300} />
          <Token pts={[[280, 90], [280, 124]]} tone="danger" d={700} dur={400} />
          <Person x={280} y={128} label={bi("One customer", "عميل واحد")} d={600} />
          <Chip x={420} y={150} text={bi("pays it all: high", "يدفعها كلها: مرتفعة")} tone="danger" center d={1000} />
          <Chip x={280} y={248} text={bi("no marketing needed", "لا حاجة إلى التسويق")} tone="muted" center d={1300} />
        </>
      ) : (
        <>
          {SLICES.map((i) => (
            <g key={i}>
              <Box x={60 + i * 44} y={48} w={44} h={40} r={0} tone="gold" d={100 + i * 60} />
              <Arrow pts={[[82 + i * 44, 90], [82 + i * 44, 124]]} tone="faint" d={700 + i * 60} dur={200} />
              <Token pts={[[82 + i * 44, 90], [82 + i * 44, 124]]} r={4} d={800 + i * 80} dur={300} />
              <Person x={82 + i * 44} y={128} tone="outline" d={700 + i * 60} />
            </g>
          ))}
          <Text x={280} y={192} text={bi("many users: each pays a small share", "مستخدمون كثيرون: يدفع كل منهم حصة صغيرة")} tone="success" size={12} d={1600} />
          <Chip x={280} y={248} text={bi("marketing needed to reach them", "يلزم التسويق للوصول إليهم")} tone="warn" center d={1900} />
        </>
      )}
    </Svg>
  );
}

function Changes({ control }: { control: string }) {
  if (control === "custom") {
    const limits = [bi("time", "الوقت"), bi("budget", "الميزانية"), bi("needs", "الاحتياجات")];
    return (
      <Svg>
        <Person x={70} y={46} label={bi("Customer", "العميل")} d={0} />
        {limits.map((l, i) => (
          <Chip key={i} x={70} y={142 + i * 44} w={96} text={l} tone="slate" center d={200 + i * 150} />
        ))}
        <Arrow pts={[[100, 72], [188, 84]]} tone="gold" d={700} />
        <Doc x={190} y={52} w={120} h={70} label={bi("Change request", "طلب تغيير")} tone="gold" d={800} />
        <Arrow pts={[[312, 88], [362, 88]]} tone="gold" d={1100} dur={300} />
        <Box x={364} y={64} w={130} h={48} label={bi("Developer", "المطوّر")} tone="navy" d={1200} />
        <Arrow pts={[[429, 114], [429, 160]]} tone="gold" d={1400} dur={300} />
        <Box x={374} y={162} w={110} h={44} label="v1.1" mono tone="success" d={1600} />
        <Arrow pts={[[372, 184], [126, 184]]} tone="success" d={1800} label={bi("delivered to the customer", "يُسلَّم إلى العميل")} labelAt={[250, 206]} labelTone="success" />
        <Token pts={[[100, 72], [188, 84], [312, 88], [362, 88]]} d={900} dur={800} />
        <Token pts={[[372, 184], [126, 184]]} tone="success" d={1900} dur={700} />
      </Svg>
    );
  }
  const versions = ["v1.0", "v2.0", "v3.0"];
  return (
    <Svg>
      <Box x={20} y={50} w={150} h={48} label={bi("Market demand", "طلب السوق")} tone="slate" d={0} />
      <Text x={420} y={66} text={bi("planned future updates", "تحديثات مستقبلية مخطط لها")} tone="muted" size={11.5} d={200} />
      {versions.map((v, i) => (
        <Box key={v} x={180 + i * 120} y={150} w={96} h={44} label={v} mono tone={i === 0 ? "navy" : "gold"} dashed={i > 0} d={300 + i * 200} />
      ))}
      <Arrow pts={[[278, 172], [298, 172]]} tone="gold" d={700} dur={200} />
      <Arrow pts={[[398, 172], [418, 172]]} tone="gold" d={900} dur={200} />
      <Arrow pts={[[150, 100], [330, 148]]} tone="slate" dashed d={1100} />
      <Arrow pts={[[160, 92], [450, 148]]} tone="slate" dashed d={1200} />
      <Token pts={[[150, 100], [330, 148]]} tone="navy" d={1300} dur={600} />
      <Token pts={[[160, 92], [450, 148]]} tone="navy" d={1500} dur={700} />
      <Text x={348} y={226} text={bi("the company plans each version", "تخطط الشركة لكل إصدار")} tone="gold" size={12} d={1800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof products>>({
  "two-kinds": TwoKinds,
  specification: Specification,
  "users-cost": UsersCost,
  changes: Changes,
});
