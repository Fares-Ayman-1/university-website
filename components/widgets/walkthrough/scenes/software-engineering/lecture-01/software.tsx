"use client";

import type { software } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Bundle({ control }: { control: string }) {
  if (control === "software") {
    const docs = [
      { x: 200, y: 60, w: 140, h: 66, label: bi("Config files", "ملفات التهيئة") },
      { x: 32, y: 146, w: 100, h: 72, label: bi("Install guide", "دليل التثبيت") },
      { x: 144, y: 146, w: 100, h: 72, label: bi("User guide", "دليل المستخدم") },
    ];
    return (
      <Svg>
        <Text x={186} y={22} text={bi("What the user receives", "ما يتسلّمه المستخدم")} tone="heading" size={12.5} d={0} />
        <Box x={16} y={50} w={340} h={218} r={14} tone="ghost" dashed d={0} />
        <Box x={32} y={64} w={150} h={60} label={bi("Program", "البرنامج")} sub="app.exe" tone="navy" d={100} />
        {docs.map((doc, i) => (
          <Doc key={i} x={doc.x} y={doc.y} w={doc.w} h={doc.h} label={doc.label} tone="outline" d={300 + i * 180} />
        ))}
        <Box x={256} y={146} w={92} h={72} label={bi("Website", "موقع الويب")} sub={bi("new versions", "إصدارات جديدة")} tone="slate" d={840} />
        <Text x={186} y={243} text={bi("programs + documentation", "البرامج + الوثائق")} tone="gold" size={12} d={1000} />
        <Arrow pts={[[358, 150], [432, 150]]} tone="gold" d={1100} />
        <Token pts={[[358, 150], [432, 150]]} d={1200} dur={600} />
        <Person x={470} y={110} label={bi("User", "المستخدم")} d={1200} />
        <Mark x={500} y={114} ok d={1600} />
        <Chip x={470} y={220} text={bi("installs and uses it", "يثبّته ويستخدمه")} tone="success" center d={1700} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Text x={186} y={22} text={bi("What the user receives", "ما يتسلّمه المستخدم")} tone="heading" size={12.5} d={0} />
      <Box x={60} y={110} w={160} h={60} label={bi("Program", "البرنامج")} sub="app.exe" tone="navy" d={100} />
      <Arrow pts={[[222, 140], [408, 140]]} tone="muted" d={400} label={bi("only the code", "الشيفرة فقط")} labelAt={[315, 112]} />
      <Token pts={[[222, 140], [408, 140]]} d={500} dur={700} />
      <Person x={450} y={100} label={bi("User", "المستخدم")} d={600} />
      <Mark x={480} y={104} ok={false} d={1100} />
      <Chip x={450} y={206} text={bi("How do I install it?", "كيف أثبّته؟")} tone="outline" center d={1300} />
      <Chip x={450} y={250} text={bi("How do I use it?", "كيف أستخدمه؟")} tone="outline" center d={1500} />
    </Svg>
  );
}

function Professional({ control }: { control: string }) {
  if (control === "professional") {
    const team = [50, 95, 140];
    const users: [number, number][] = [
      [420, 46],
      [470, 46],
      [520, 46],
      [420, 132],
      [470, 132],
      [520, 132],
    ];
    return (
      <Svg>
        {team.map((x, i) => (
          <Person key={i} x={x} y={74} d={i * 120} />
        ))}
        <Text x={95} y={130} text={bi("Team", "الفريق")} tone="heading" size={12} d={300} />
        <Arrow pts={[[168, 100], [212, 100]]} tone="gold" d={500} />
        <Box x={214} y={76} w={130} h={48} label={bi("Product", "المنتج")} tone="navy" d={600} />
        <Doc x={244} y={136} w={70} h={62} label={bi("Docs", "الوثائق")} tone="outline" d={800} />
        <Arrow pts={[[346, 92], [398, 66]]} tone="gold" d={1000} />
        <Arrow pts={[[346, 110], [398, 150]]} tone="gold" d={1000} />
        {users.map(([x, y], i) => (
          <Person key={i} x={x} y={y} tone="outline" d={1100 + i * 90} />
        ))}
        <Token pts={[[346, 92], [398, 66]]} d={1300} dur={600} />
        <Token pts={[[346, 110], [398, 150]]} d={1500} dur={600} />
        <Text x={470} y={196} text={bi("Other people", "أشخاص آخرون")} tone="heading" size={12} d={1300} />
        <Chip x={280} y={248} text={bi("built by a team, used by others", "يبنيها فريق ويستخدمها آخرون")} tone="gold" center d={1700} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Person x={90} y={86} label={bi("Developer", "المطوّر")} d={0} />
      <Arrow pts={[[122, 110], [186, 110]]} tone="slate" d={300} label={bi("writes", "يكتب")} labelAt={[154, 80]} />
      <Box x={188} y={86} w={140} h={48} label={bi("Program", "البرنامج")} tone="outline" d={400} />
      <Arrow pts={[[258, 136], [258, 214], [90, 214], [90, 178]]} tone="gold" d={800} dur={700} label={bi("the only user", "المستخدم الوحيد")} labelAt={[174, 238]} labelTone="gold" />
      <Token pts={[[258, 136], [258, 214], [90, 214], [90, 178]]} d={900} dur={1000} />
      <Chip x={448} y={84} text={bi("no documentation", "بلا وثائق")} tone="muted" center d={1300} />
      <Chip x={448} y={140} text={bi("nobody else relies on it", "لا يعتمد عليه أحد غيره")} tone="muted" center d={1500} />
    </Svg>
  );
}

function Lifetime() {
  const versions = ["v1.0", "v1.1", "v2.0", "v2.1"];
  const requests = [
    { x: 145, label: bi("bug report", "تقرير خطأ"), tone: "danger" as const },
    { x: 265, label: bi("new need", "حاجة جديدة"), tone: "gold" as const },
    { x: 385, label: bi("bug report", "تقرير خطأ"), tone: "danger" as const },
  ];
  return (
    <Svg>
      <Arrow pts={[[20, 150], [548, 150]]} tone="faint" d={0} dur={800} />
      <Text x={544} y={124} text={bi("years", "سنوات")} anchor="end" tone="muted" size={11} d={300} />
      {versions.map((v, i) => (
        <Box key={v} x={40 + i * 120} y={130} w={90} h={40} label={v} mono tone={i === 0 ? "navy" : "slate"} d={200 + i * 500} />
      ))}
      {requests.map((r, i) => (
        <g key={i}>
          <Chip x={r.x} y={74} text={r.label} tone={r.tone} center d={500 + i * 500} />
          <Arrow pts={[[r.x, 94], [r.x + 34, 128]]} tone={r.tone} d={600 + i * 500} dur={300} />
          <Token pts={[[r.x, 94], [r.x + 34, 128]]} tone={r.tone === "gold" ? "gold" : "danger"} d={600 + i * 500} dur={400} />
        </g>
      ))}
      <Arrow pts={[[445, 172], [445, 202]]} tone="gold" d={2000} dur={250} />
      <Box x={375} y={204} w={140} h={44} label={bi("Product website", "موقع المنتج")} tone="outline" d={2100} />
      <Arrow pts={[[373, 226], [262, 226]]} tone="gold" d={2300} dur={300} />
      <Token pts={[[373, 226], [262, 226]]} d={2400} dur={500} />
      <Person x={230} y={196} tone="outline" d={2300} />
      <Text x={200} y={226} text={bi("users update", "يحدّث المستخدمون")} anchor="end" tone="heading" size={11.5} d={2500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof software>>({
  bundle: Bundle,
  professional: Professional,
  lifetime: Lifetime,
});
