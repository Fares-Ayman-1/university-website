"use client";

import type { manifesto } from "@/lib/walkthroughs/software-engineering/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Tri } from "./local";

const PAIRS = [
  [bi("Individuals and interactions", "الأفراد والتفاعلات"), bi("Processes and tools", "العمليات والأدوات")],
  [bi("Working software", "البرمجيات العاملة"), bi("Comprehensive documentation", "التوثيق الشامل")],
  [bi("Customer collaboration", "التعاون مع العميل"), bi("Contract negotiation", "التفاوض على العقود")],
  [bi("Responding to change", "الاستجابة للتغيير"), bi("Following a plan", "اتباع خطة")],
] as const;

function Over() {
  return (
    <Svg>
      {PAIRS.map(([left, right], i) => {
        const c = 46 + i * 60;
        const d = i * 350;
        return (
          <g key={i}>
            <Arrow pts={[[214, c + 6], [346, c - 6]]} tone="slate" head={false} width={2.2} d={d + 250} dur={300} />
            <Tri x={280} y={c} s={11} tone="slate" d={d + 200} />
            <Box x={14} y={c - 16} w={200} h={44} label={left} tone="gold" size={12} d={d} />
            <Box x={346} y={c - 28} w={200} h={44} label={right} tone="outline" size={12} d={d + 100} />
            <Text x={280} y={c + 23} text={bi("over", "أكثر من")} tone="muted" size={10.5} d={d + 300} />
          </g>
        );
      })}
    </Svg>
  );
}

function People({ control }: { control: string }) {
  if (control === "talk") {
    return (
      <Svg>
        <Person x={200} y={92} label={bi("Developer", "المطوّر")} d={0} />
        <Person x={360} y={92} label={bi("Customer", "العميل")} tone="gold" d={100} />
        <Arrow pts={[[222, 112], [338, 112]]} tone="gold" both d={400} label={bi("talk", "حديث")} labelAt={[280, 82]} labelTone="gold" />
        <Token pts={[[222, 112], [338, 112]]} d={700} dur={600} />
        <Token pts={[[338, 112], [222, 112]]} d={1400} dur={600} tone="navy" />
        <Text x={280} y={196} text={bi("answer in minutes", "الإجابة خلال دقائق")} tone="success" size={12.5} d={2000} />
        <Mark x={190} y={196} ok d={2100} />
        <Arrow pts={[[384, 160], [430, 196]]} tone="faint" dashed d={1700} />
        <Box x={400} y={198} w={130} h={44} label={bi("Tracking tool", "أداة التتبع")} tone="muted" size={11.5} d={1700} />
        <Text x={465} y={258} text={bi("still records it", "ما زالت تسجّله")} tone="muted" size={11} d={1800} />
      </Svg>
    );
  }
  const steps = [bi("Ticket form", "نموذج التذكرة"), bi("Tracking tool", "أداة التتبع"), bi("Queue", "قائمة الانتظار")];
  return (
    <Svg>
      <Person x={46} y={92} label={bi("Developer", "المطوّر")} d={0} />
      <Person x={514} y={92} label={bi("Customer", "العميل")} tone="gold" d={100} />
      {steps.map((s, i) => (
        <Box key={i} x={92 + i * 134} y={92} w={110} h={44} label={s} tone="slate" size={11.5} d={200 + i * 150} />
      ))}
      {[
        [64, 90],
        [202, 224],
        [336, 358],
        [470, 496],
      ].map(([a, b], i) => (
        <Arrow key={i} pts={[[a, 114], [b, 114]]} tone="muted" d={500 + i * 120} dur={200} />
      ))}
      <Token pts={[[64, 114], [496, 114]]} d={900} dur={2600} />
      <Arrow pts={[[514, 172], [514, 196], [46, 196], [46, 172]]} tone="danger" dashed d={3500} label={bi("answer, days later", "الإجابة بعد أيام")} labelAt={[280, 216]} labelTone="danger" />
    </Svg>
  );
}

function Software({ control }: { control: string }) {
  if (control === "running") {
    return (
      <Svg>
        <Box x={40} y={40} w={200} h={140} r={8} tone="outline" d={0} />
        <Box x={40} y={40} w={200} h={24} r={8} label="Mentcare" mono size={11} tone="navy" d={100} />
        <Box x={56} y={78} w={168} h={20} r={4} tone="muted" d={300} />
        <Box x={56} y={108} w={168} h={20} r={4} tone="muted" d={400} />
        <Box x={150} y={142} w={74} h={26} r={6} label="OK" mono size={11} tone="gold" d={500} />
        <Text x={140} y={202} text={bi("Increment 1, running", "الزيادة 1 تعمل")} tone="success" size={11.5} d={700} />
        <Person x={420} y={70} label={bi("Customer", "العميل")} tone="gold" d={200} />
        <Arrow pts={[[244, 96], [398, 90]]} tone="gold" d={900} label={bi("tries it", "يجرّبها")} labelAt={[320, 70]} labelTone="gold" />
        <Token pts={[[244, 96], [398, 90]]} d={1100} dur={700} />
        <Mark x={452} y={66} ok d={1600} />
        <Arrow pts={[[420, 150], [420, 168], [244, 168]]} tone="gold" dashed d={1800} label={bi("feedback now", "ملاحظات الآن")} labelAt={[330, 188]} labelTone="gold" />
        <Doc x={460} y={190} w={80} h={66} label={bi("Short notes", "توثيق موجز")} tone="muted" size={10.5} d={2200} />
      </Svg>
    );
  }
  return (
    <Svg>
      {[0, 1, 2, 3].map((i) => (
        <Doc
          key={i}
          x={40 + i * 16}
          y={70 - i * 12}
          w={100}
          h={130}
          tone="outline"
          label={i === 3 ? bi("Specification", "التوصيف") : undefined}
          sub={i === 3 ? bi("every detail", "كل التفاصيل") : undefined}
          d={i * 250}
        />
      ))}
      <Text x={114} y={226} text={bi("written, reviewed, signed", "مكتوب ومراجَع وموقَّع")} tone="muted" size={11} d={1000} />
      <Person x={420} y={70} label={bi("Customer", "العميل")} tone="gold" d={200} />
      <Arrow pts={[[192, 100], [398, 92]]} tone="muted" d={1200} label={bi("reads it", "يقرؤه")} labelAt={[295, 72]} labelTone="muted" />
      <Chip x={420} y={176} text={bi("nothing to try yet", "لا شيء للتجربة بعد")} tone="danger" center d={1700} />
      <Mark x={510} y={176} ok={false} d={1900} />
    </Svg>
  );
}

function Customer({ control }: { control: string }) {
  if (control === "together") {
    return (
      <Svg>
        <Box x={24} y={30} w={512} h={134} r={14} tone="ghost" dashed d={0} />
        <Text x={40} y={46} text={bi("One team", "فريق واحد")} anchor="start" tone="muted" size={11} d={0} />
        <Person x={120} y={62} label={bi("Customer", "العميل")} tone="gold" d={100} />
        {[380, 430, 480].map((x, i) => (
          <Person key={i} x={x} y={62} tone="slate" d={200 + i * 80} />
        ))}
        <Text x={430} y={112} text={bi("Developers", "المطورون")} tone="heading" size={11.5} d={300} />
        <Arrow pts={[[146, 86], [360, 86]]} tone="gold" both d={600} label={bi("talk it over", "يتناقشون")} labelAt={[253, 60]} labelTone="gold" />
        <Token pts={[[146, 86], [360, 86]]} d={900} dur={700} />
        <Chip x={253} y={128} text={bi("change agreed", "اتُّفق على التغيير")} tone="success" center d={1400} />
        <Arrow pts={[[253, 147], [253, 184]]} tone="gold" d={1700} dur={300} />
        <Box x={150} y={186} w={206} h={68} label={bi("Next increment", "الزيادة التالية")} sub={bi("+ the change", "+ التغيير")} tone="gold" d={1900} />
        <Mark x={356} y={190} ok d={2200} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Person x={60} y={60} label={bi("Customer", "العميل")} tone="gold" d={0} />
      <Person x={470} y={60} tone="slate" d={100} />
      <Person x={510} y={60} tone="slate" d={150} />
      <Text x={490} y={110} text={bi("Team", "الفريق")} tone="heading" size={11.5} d={150} />
      <Doc x={230} y={40} w={100} h={110} label={bi("Contract", "العقد")} sub={bi("fixed scope", "نطاق ثابت")} tone="outline" d={200} />
      <Arrow pts={[[84, 86], [226, 86]]} tone="gold" d={600} label={bi("change request", "طلب تغيير")} labelAt={[155, 58]} labelTone="gold" />
      <Token pts={[[84, 86], [226, 86]]} d={800} dur={600} />
      <Chip x={280} y={182} text={bi("out of scope", "خارج النطاق")} tone="danger" center d={1300} />
      <Arrow pts={[[334, 86], [450, 86]]} tone="danger" both d={1600} label={bi("negotiate", "تفاوض")} labelAt={[392, 58]} labelTone="danger" />
      <Token pts={[[334, 86], [450, 86], [334, 86], [450, 86]]} d={1900} dur={2000} tone="danger" />
      <Text x={280} y={238} text={bi("weeks pass before any code changes", "تمرّ أسابيع قبل أن تتغير أي شيفرة")} tone="danger" size={12} d={2600} />
    </Svg>
  );
}

function Change({ control }: { control: string }) {
  const respond = control === "respond";
  return (
    <Svg>
      <Box x={20} y={186} w={80} h={44} label={bi("Start", "البداية")} tone="slate" size={12} d={0} />
      <Box x={430} y={36} w={116} h={44} label={bi("Planned goal", "الهدف المخطَّط")} tone="ghost" dashed size={11.5} d={100} />
      <Arrow pts={[[488, 82], [488, 182]]} tone="gold" dashed d={700} />
      <Token pts={[[488, 58], [488, 208]]} d={700} dur={600} />
      <Text x={420} y={134} text={bi("the need moves", "الحاجة تتغير")} anchor="end" tone="gold" size={11} d={800} />
      <Box x={430} y={186} w={116} h={44} label={bi("Real need", "الحاجة الفعلية")} tone="gold" size={11.5} d={1100} />
      {respond ? (
        <>
          <Arrow pts={[[100, 206], [190, 160], [280, 128]]} tone="navy" d={300} dur={700} />
          <Box x={184} y={154} w={12} h={12} r={6} tone="gold" d={600} />
          <Box x={274} y={122} w={12} h={12} r={6} tone="gold" d={1000} />
          <Text x={280} y={96} text={bi("check and re-plan", "مراجعة وإعادة تخطيط")} tone="gold" size={11} d={1300} />
          <Arrow pts={[[286, 130], [370, 172], [426, 204]]} tone="success" d={1500} dur={700} />
          <Box x={364} y={166} w={12} h={12} r={6} tone="gold" d={1800} />
          <Mark x={430} y={186} ok d={2300} />
          <Text x={240} y={252} text={bi("checks the direction at every step", "يراجع الاتجاه عند كل خطوة")} tone="success" size={12} d={2400} />
        </>
      ) : (
        <>
          <Arrow pts={[[100, 200], [428, 62]]} tone="navy" d={1300} dur={1000} />
          <Mark x={430} y={36} ok={false} d={2400} />
          <Text x={240} y={252} text={bi("arrives where the goal used to be", "يصل إلى حيث كان الهدف")} tone="danger" size={12} d={2500} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof manifesto>>({
  over: Over,
  people: People,
  software: Software,
  customer: Customer,
  change: Change,
});

