"use client";

import { levelSizes, placeTree, thousands, treeMeasures } from "@/lib/widgets/ai-lecture-03";
import { BDM_GOAL, BDM_TREE, type evaluating } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { TreeView } from "./local";

function Criteria() {
  const cards = [
    { col: 0, row: 0, label: bi("Completeness", "الاكتمال"), sub: bi("finds a solution if one exists?", "هل يجد حلًّا إن وُجد؟") },
    { col: 0, row: 1, label: bi("Optimality", "الأمثلية"), sub: bi("finds a least-cost solution?", "هل يجد الحل الأقل تكلفة؟") },
    { col: 1, row: 0, label: bi("Time", "الزمن"), sub: bi("nodes generated or expanded", "العقد المولَّدة أو الموسَّعة") },
    { col: 1, row: 1, label: bi("Space", "المساحة"), sub: bi("most nodes in memory at once", "أقصى عدد للعقد في الذاكرة") },
  ];
  return (
    <Svg>
      <Text x={150} y={24} text={bi("The answer", "الإجابة")} tone="heading" size={12.5} d={0} />
      <Text x={410} y={24} text={bi("What it costs", "التكلفة")} tone="heading" size={12.5} d={600} />
      {cards.map((c, i) => (
        <Box key={i} x={24 + c.col * 262} y={56 + c.row * 88} w={250} h={76} label={c.label} sub={c.sub} tone={c.col ? "slate" : "navy"} d={c.col * 600 + c.row * 250 + 100} />
      ))}
      <Text x={280} y={252} text={bi("time and space are measured with b, d and m", "يُقاس الزمن والمساحة باستخدام b و d و m")} tone="gold" size={12} d={1500} />
    </Svg>
  );
}

const bdmTree = placeTree(BDM_TREE, { x: 56, y: 50, w: 320, h: 200 });
const bdm = treeMeasures(BDM_TREE, BDM_GOAL);

function Bdm() {
  const levelY = (k: number) => 50 + (k * 200) / bdm.m;
  return (
    <Svg>
      {Array.from({ length: bdm.m + 1 }, (_, k) => (
        <Text key={k} x={424} y={levelY(k)} text={bi(`depth ${k}`, `العمق ${k}`)} anchor="start" tone="muted" size={10.5} d={100 + k * 80} />
      ))}
      <TreeView tree={bdmTree} nh={24} base={(id) => (id === BDM_GOAL ? "success" : "outline")} d={0} />
      <Chip x={bdmTree.byId.A.x + 44} y={levelY(0)} text={`b = ${bdm.b}`} tone="slate" center d={900} />
      <Chip x={516} y={levelY(bdm.d) - 1} text={`d = ${bdm.d}`} tone="success" center d={1200} />
      <Chip x={516} y={levelY(bdm.m) - 1} text={`m = ${bdm.m}`} tone="navy" center d={1500} />
    </Svg>
  );
}

const DEPTH = 5;

function Growth({ control }: { control: string }) {
  const b = Number(control);
  const sizes = levelSizes(b, DEPTH);
  const total = sizes.reduce((s, v) => s + v, 0);
  const box = { x: 70, y: 66, w: 420, h: 150 };
  const max = Math.max(...sizes);
  const slot = box.w / sizes.length;
  return (
    <Svg>
      <Text x={24} y={24} text={bi(`nodes on level k (b = ${b})`, `العقد في المستوى k (b = ${b})`)} anchor="start" tone="heading" size={12} d={0} />
      <Bars x={box.x} y={box.y} w={box.w} h={box.h} values={sizes} labels={sizes.map((_, k) => `k = ${k}`)} barTone={(i) => (i === DEPTH ? "gold" : "slate")} d={100} stagger={120} />
      {sizes.map((v, i) => (
        <Text key={i} x={box.x + i * slot + slot / 2} y={box.y + box.h - (v / max) * box.h - 10} text={thousands(v)} size={10.5} mono tone="heading" d={300 + i * 120} />
      ))}
      <Chip x={280} y={256} text={bi(`whole tree: ${thousands(total)} nodes`, `الشجرة كلها: ${thousands(total)} عقدة`)} tone="gold" center d={1200} />
    </Svg>
  );
}

function Blind({ control }: { control: string }) {
  const informed = control === "informed";
  return (
    <Svg>
      <Arrow pts={[[96, 146], [214, 90]]} tone="navy" d={200} dur={300} />
      <Arrow pts={[[96, 162], [214, 206]]} tone="navy" d={300} dur={300} />
      <Arrow pts={[[302, 90], [452, 90], [480, 182]]} tone="faint" dashed head={false} d={500} />
      <Arrow pts={[[302, 206], [440, 206]]} tone="faint" dashed d={600} />
      <Box x={40} y={132} w={56} h={44} label="S" tone="navy" d={0} />
      <Box x={216} y={68} w={86} h={44} label="X" tone="gold" d={150} />
      <Box x={216} y={184} w={86} h={44} label="Y" tone="gold" d={250} />
      <Box x={442} y={184} w={86} h={44} label={bi("goal G", "الهدف G")} tone="success" d={400} />
      <Text x={56} y={200} text={bi("start", "البداية")} tone="muted" size={10.5} d={100} />
      <Text x={259} y={140} text={bi("both in the fringe", "كلتاهما في الحافة")} tone="muted" size={10.5} d={700} />
      {informed ? (
        <>
          <Chip x={259} y={40} text={bi("estimate: far", "التقدير: بعيدة")} tone="slate" center size={10.5} d={900} />
          <Chip x={259} y={256} text={bi("estimate: near, expand first", "التقدير: قريبة، وسّعها أولًا")} tone="success" center size={10.5} d={1100} />
        </>
      ) : (
        <>
          <Chip x={259} y={40} text={bi("not a goal: no more is known", "ليست هدفًا، ولا شيء غير ذلك")} tone="muted" center size={10.5} d={900} />
          <Chip x={259} y={256} text={bi("not a goal: no more is known", "ليست هدفًا، ولا شيء غير ذلك")} tone="muted" center size={10.5} d={1000} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof evaluating>>({ criteria: Criteria, bdm: Bdm, growth: Growth, blind: Blind });
