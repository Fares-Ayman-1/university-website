"use client";

import type { basics } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Cylinder, Doc, Person, Svg, Table, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

/** A segment from (x0, y0) towards (x1, y1), trimmed by r0 at the start and r1 at the end. */
function ray(x0: number, y0: number, x1: number, y1: number, r0: number, r1: number): Pt[] {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  return [
    [x0 + ux * r0, y0 + uy * r0],
    [x1 - ux * r1, y1 - uy * r1],
  ];
}

const FACTS: [string, number, number][] = [
  ["Sara", 52, 72],
  ["CS201", 138, 60],
  ["A", 186, 104],
  ["Omar", 70, 126],
  ["B+", 150, 146],
  ["Mona", 58, 182],
  ["CS201", 146, 200],
  ["A", 96, 236],
];

function DataInfo({ control }: { control: string }) {
  const summary = control === "summary";
  return (
    <Svg>
      <Text x={115} y={24} text={bi("Data: raw facts", "البيانات: حقائق خام")} tone="heading" size={13.5} d={0} />
      {FACTS.map(([fact, x, y], i) => (
        <Chip key={i} x={x} y={y} text={fact} tone="outline" center d={100 + i * 90} />
      ))}
      <Arrow pts={[[222, 146], [300, 146]]} tone="gold" d={900} width={2.4} label={bi("processed", "معالجة")} labelAt={[261, 122]} labelTone="gold" />
      <Text x={430} y={24} text={summary ? bi("Information: a summary", "المعلومات: ملخص") : bi("Information: a roster", "المعلومات: كشف أسماء")} tone="heading" size={13.5} d={1100} />
      {summary ? (
        <>
          <Arrow pts={[[340, 216], [530, 216]]} tone="faint" head={false} d={1200} />
          <Box x={370} y={76} w={56} h={140} r={6} tone="gold" d={1300} />
          <Box x={460} y={146} w={56} h={70} r={6} tone="slate" d={1450} />
          <Text x={398} y={62} text="2" tone="heading" size={14} d={1600} />
          <Text x={488} y={132} text="1" tone="heading" size={14} d={1700} />
          <Text x={398} y={232} text="A" tone="text" size={12.5} d={1300} />
          <Text x={488} y={232} text="B+" tone="text" size={12.5} d={1450} />
          <Text x={445} y={254} text={bi("students per grade", "عدد الطلاب لكل تقدير")} tone="muted" size={11} d={1800} />
        </>
      ) : (
        <>
          <Table
            x={335}
            y={70}
            cols={["NAME", "COURSE", "GRADE"]}
            cw={[72, 72, 62]}
            rows={[
              ["Sara", "CS201", "A"],
              ["Omar", "CS201", "B+"],
              ["Mona", "CS201", "A"],
            ]}
            d={1200}
          />
          <Text x={438} y={200} text={bi("in context: who takes CS201", "في سياق: من يدرس CS201")} tone="muted" size={11} d={1800} />
        </>
      )}
    </Svg>
  );
}

function Metadata() {
  const cols: [string, number, number][] = [
    ["VARCHAR(30)", 85, 140],
    ["CHAR(5)", 180, 176],
    ["DECIMAL(3,2)", 255, 140],
  ];
  return (
    <Svg>
      <Text x={160} y={18} text={bi("A record (data)", "سجل (بيانات)")} tone="heading" size={13} d={0} />
      <Table x={30} y={52} cols={["NAME", "ID", "GPA"]} cw={[110, 80, 70]} rows={[["Sara Ali", "20231", "3.60"]]} d={100} />
      {cols.map(([type, x, y], i) => (
        <g key={type}>
          <Arrow pts={[[x, 102], [x, y - 14]]} tone="faint" head={false} d={600 + i * 200} dur={300} />
          <Chip x={x} y={y} text={type} tone="slate" center d={700 + i * 200} />
        </g>
      ))}
      <Chip x={255} y={212} text="CHECK 0–4" tone="slate" center d={1300} />
      <Text x={150} y={252} text={bi("Its description (metadata)", "وصفه (بيانات وصفية)")} tone="heading" size={13} d={1400} />
      <Arrow pts={[[312, 160], [404, 150]]} tone="gold" d={1600} width={2.2} label={bi("kept in", "يُحفظ في")} labelAt={[358, 126]} labelTone="gold" />
      <Cylinder x={410} y={86} w={124} h={116} tone="gold" label={bi("Catalog", "الكتالوج")} sub={bi("data dictionary", "قاموس البيانات")} d={1800} />
    </Svg>
  );
}

function MiniWorld() {
  const course: Pt = [420, 142];
  return (
    <Svg>
      <Text x={130} y={20} text={bi("Mini-world: a university", "العالم المصغَّر: جامعة")} tone="heading" size={13} d={0} />
      <Box x={20} y={44} w={220} h={220} r={16} tone="ghost" dashed d={0} />
      <Person x={75} y={56} label={bi("Student", "طالب")} d={150} />
      <Person x={185} y={56} label={bi("Professor", "أستاذ")} d={300} />
      <Doc x={44} y={150} w={62} h={70} label={bi("Course", "مقرر")} tone="outline" d={450} />
      <Box x={155} y={150} w={62} h={70} r={4} label={bi("Room", "قاعة")} tone="muted" d={600} />
      <Arrow pts={[[248, 146], [294, 146]]} tone="gold" d={800} width={2.4} />
      <Text x={425} y={20} text={bi("Entities and relationships", "الكيانات والعلاقات")} tone="heading" size={13} d={900} />
      <Box x={300} y={46} w={96} h={40} label="STUDENT" mono tone="navy" d={1000} />
      <Box x={448} y={46} w={104} h={40} label="PROFESSOR" mono tone="navy" d={1100} />
      <Box x={course[0] - 50} y={course[1] - 20} w={100} h={40} label="COURSE" mono tone="navy" d={1200} />
      <Box x={370} y={222} w={100} h={40} label="ROOM" mono tone="navy" d={1300} />
      <Arrow pts={[[348, 86], [400, 122]]} tone="slate" head={false} d={1450} />
      <Arrow pts={[[500, 86], [444, 122]]} tone="slate" head={false} d={1600} />
      <Arrow pts={[[420, 162], [420, 222]]} tone="slate" head={false} d={1750} />
      <Chip x={352} y={108} text={bi("takes", "يدرس")} tone="gold" center d={1500} />
      <Chip x={500} y={108} text={bi("teaches", "يدرّس")} tone="gold" center d={1650} />
      <Chip x={482} y={192} text={bi("meets in", "يُعقد في")} tone="gold" center d={1800} />
    </Svg>
  );
}

function Layers() {
  return (
    <Svg>
      <Box x={14} y={12} w={532} h={258} r={20} tone="ghost" dashed d={1200} />
      <Text x={30} y={32} text={bi("Database system", "نظام قاعدة البيانات")} anchor="start" tone="heading" size={13.5} d={1250} />
      <Box x={160} y={56} w={240} h={196} r={16} tone="slate" d={600} />
      <Text x={280} y={76} text={bi("DBMS software", "برمجيات DBMS")} tone="slate" size={13} d={650} />
      <Cylinder x={228} y={112} w={104} h={112} tone="navy" label={bi("Database", "قاعدة البيانات")} sub={bi("stored data", "البيانات المخزَّنة")} d={0} />
      <Person x={70} y={96} label={bi("Users", "المستخدمون")} d={1500} />
      <Arrow pts={[[96, 128], [156, 146]]} tone="gold" d={1650} />
      <Box x={436} y={104} w={96} h={50} label={bi("Programs", "البرامج")} tone="outline" d={1500} />
      <Arrow pts={[[436, 129], [404, 129]]} tone="gold" d={1650} />
    </Svg>
  );
}

const JOBS: [Bi, number, number][] = [
  [bi("1 · Define", "1 · التعريف"), 280, 34],
  [bi("2 · Construct", "2 · الإنشاء"), 462, 92],
  [bi("3 · Manipulate", "3 · المعالجة"), 440, 232],
  [bi("4 · Share", "4 · المشاركة"), 120, 232],
  [bi("5 · Protect, maintain", "5 · الحماية والصيانة"), 104, 92],
];

function DbmsJobs() {
  const c: Pt = [280, 150];
  return (
    <Svg>
      <Cylinder x={c[0] - 50} y={c[1] - 52} w={100} h={104} tone="navy" label="DBMS" sub={bi("+ database", "+ قاعدة البيانات")} d={0} />
      {JOBS.map(([text, x, y], i) => (
        <g key={i}>
          <Arrow pts={ray(c[0], c[1], x, y, 60, 26)} tone="gold" head={false} d={300 + i * 280} dur={360} />
          <Chip x={x} y={y} text={text} tone="gold" center d={450 + i * 280} />
        </g>
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof basics>>({
  "data-info": DataInfo,
  metadata: Metadata,
  "mini-world": MiniWorld,
  layers: Layers,
  "dbms-jobs": DbmsJobs,
});
