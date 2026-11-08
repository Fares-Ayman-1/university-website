"use client";

import type { queryPath } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Cylinder, Fade, Person, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function DdlDml({ control }: { control: string }) {
  const ddl = control === "ddl";
  const on = (active: boolean) => (active ? "gold" : "faint");
  const compilerToEngine: Pt[] = [
    [315, 199],
    [350, 199],
    [350, 150],
    [378, 150],
  ];
  return (
    <Svg>
      <Box x={150} y={14} w={396} h={254} r={16} tone="ghost" dashed d={0} />
      <Text x={262} y={30} text={bi("Inside the DBMS", "داخل نظام إدارة قواعد البيانات")} tone="muted" size={11.5} d={0} />
      <Person x={60} y={36} label="DBA" tone={ddl ? "gold" : "muted"} d={100} />
      <Person x={60} y={166} label={bi("Users, programs", "المستخدمون والبرامج")} tone={ddl ? "muted" : "gold"} d={100} />
      <Box x={175} y={56} w={140} h={42} label={bi("DDL processor", "معالج DDL")} tone={ddl ? "navy" : "muted"} d={200} />
      <Box x={175} y={178} w={140} h={42} label={bi("Query compiler", "مترجم الاستعلامات")} tone={ddl ? "muted" : "navy"} d={250} />
      <Box x={380} y={130} w={150} h={40} label={bi("Execution engine", "محرك التنفيذ")} tone={ddl ? "muted" : "navy"} d={300} />
      <Cylinder x={396} y={40} w={124} h={72} tone={ddl ? "gold" : "slate"} label={bi("Metadata", "البيانات الوصفية")} d={350} />
      <Cylinder x={406} y={190} w={104} h={70} tone={ddl ? "muted" : "gold"} label={bi("Data", "البيانات")} d={400} />
      <Arrow pts={[[88, 70], [172, 77]]} tone={on(ddl)} d={600} label="CREATE / ALTER" labelAt={[130, 52]} labelTone={ddl ? "gold" : "muted"} />
      <Arrow pts={[[315, 77], [394, 77]]} tone={on(ddl)} d={900} label={bi("schema change", "تغيير المخطط")} labelAt={[352, 106]} labelTone={ddl ? "gold" : "muted"} />
      <Arrow pts={[[88, 200], [172, 199]]} tone={on(!ddl)} d={600} label="SELECT / UPDATE" labelAt={[130, 250]} labelTone={ddl ? "muted" : "gold"} />
      <Arrow pts={compilerToEngine} tone={on(!ddl)} d={900} />
      <Arrow pts={[[455, 170], [455, 190]]} tone={on(!ddl)} d={1200} dur={250} />
      <Arrow pts={[[455, 130], [455, 114]]} tone="slate" dashed d={1200} />
      {ddl ? <Token pts={[[88, 70], [172, 77], [315, 77], [394, 77]]} d={1300} dur={1200} /> : <Token pts={[[88, 200], [172, 199], ...compilerToEngine, [455, 150], [455, 192]]} d={1400} dur={1600} />}
    </Svg>
  );
}

function Query({ control }: { control: string }) {
  const hit = control === "hit";
  const down: Pt[] = [
    [45, 55],
    [150, 55],
    [288, 55],
    [458, 55],
    [458, 150],
  ];
  const slot = (i: number) => 424 + i * 40;
  return (
    <Svg>
      <Box x={15} y={30} w={60} h={50} label="SQL" mono tone="outline" d={0} />
      <Box x={90} y={30} w={120} h={50} label={bi("Query compiler", "مترجم الاستعلامات")} tone="navy" d={150} />
      <Box x={228} y={30} w={120} h={50} label={bi("Execution engine", "محرك التنفيذ")} tone="navy" d={300} />
      <Box x={366} y={30} w={184} h={50} label={bi("Index/file/record manager", "مدير الفهارس والملفات والسجلات")} size={12} tone="navy" d={450} />
      <Arrow pts={[[75, 55], [88, 55]]} d={600} dur={200} />
      <Arrow pts={[[210, 55], [226, 55]]} tone="gold" d={700} dur={200} label={bi("plan", "الخطة")} labelAt={[218, 98]} labelTone="gold" />
      <Arrow pts={[[348, 55], [364, 55]]} d={800} dur={200} />
      <Arrow pts={[[458, 80], [458, 148]]} d={900} dur={300} />
      <Box x={415} y={150} w={135} h={68} label={bi("Buffer manager", "مدير المخازن المؤقتة")} sub={bi("pages in memory", "صفحات في الذاكرة")} tone="slate" d={500} />
      {[0, 1, 2].map((i) => (
        <Box key={i} x={slot(i)} y={224} w={34} h={22} r={4} tone="ghost" dashed d={550} />
      ))}
      <Box x={245} y={158} w={135} h={54} label={bi("Storage manager", "مدير التخزين")} tone={hit ? "muted" : "slate"} d={650} />
      <Cylinder x={70} y={150} w={110} h={86} tone={hit ? "muted" : "outline"} label={bi("Disk", "القرص")} d={700} />
      <Token pts={down} d={1000} dur={1500} />
      {hit ? (
        <>
          <Box x={slot(1)} y={224} w={34} h={22} r={4} tone="gold" label="p7" mono size={10} d={0} />
          <Arrow pts={[[424, 150], [300, 82]]} tone="success" dashed d={2600} label={bi("rows, no disk read", "الصفوف دون قراءة القرص")} labelAt={[330, 128]} labelTone="success" />
        </>
      ) : (
        <>
          <Arrow pts={[[415, 187], [382, 187]]} tone="gold" d={2500} dur={250} />
          <Arrow pts={[[245, 187], [184, 190]]} tone="gold" d={2800} dur={300} />
          <Token pts={[[415, 187], [382, 187], [245, 187], [184, 190]]} d={2500} dur={900} />
          <Arrow pts={[[125, 236], [125, 264], [vSlot(slot(1)), 264], [vSlot(slot(1)), 248]]} tone="gold" dashed d={3500} />
          <Token pts={[[125, 236], [125, 264], [vSlot(slot(1)), 264], [vSlot(slot(1)), 248]]} d={3500} dur={1100} />
          <Fade d={4600}>
            <Box x={slot(1)} y={224} w={34} h={22} r={4} tone="gold" label="p7" mono size={10} />
          </Fade>
          <Arrow pts={[[424, 150], [300, 82]]} tone="success" dashed d={4800} label={bi("rows", "الصفوف")} labelAt={[364, 118]} labelTone="success" />
        </>
      )}
    </Svg>
  );
}

/** Centre of a buffer slot that starts at x. */
const vSlot = (x: number) => x + 17;

function Info() {
  const c: Pt = [280, 140];
  const items = [
    { at: [90, 66] as Pt, el: <Cylinder x={40} y={24} w={100} h={84} tone="navy" label={bi("Data", "البيانات")} sub={bi("the records", "السجلات")} d={300} /> },
    { at: [470, 66] as Pt, el: <Cylinder x={420} y={24} w={100} h={84} tone="gold" label={bi("Metadata", "البيانات الوصفية")} sub={bi("the catalog", "الكتالوج")} d={500} /> },
    { at: [90, 214] as Pt, el: <Box x={20} y={180} w={140} h={70} label={bi("Statistics", "الإحصاءات")} sub={bi("for the optimizer", "للمُحسِّن")} tone="slate" d={700} /> },
    { at: [470, 214] as Pt, el: <Box x={400} y={180} w={140} h={70} label={bi("Indexes", "الفهارس")} sub={bi("fast lookup", "بحث سريع")} tone="slate" d={900} /> },
    { at: [280, 236] as Pt, el: <Box x={210} y={204} w={140} h={70} label={bi("Log", "السجل")} sub={bi("every change", "كل تغيير")} tone="warn" d={1100} /> },
  ];
  return (
    <Svg>
      {items.map((it, i) => {
        const [x, y] = it.at;
        const start: Pt = [c[0] + (x - c[0]) * 0.32, c[1] + (y - c[1]) * 0.32];
        const end: Pt = [c[0] + (x - c[0]) * 0.72, c[1] + (y - c[1]) * 0.72];
        return (
          <g key={i}>
            <Arrow pts={[start, end]} tone="faint" dashed head={false} d={200 + i * 200} />
            {it.el}
          </g>
        );
      })}
      <Box x={c[0] - 75} y={c[1] - 26} w={150} h={52} label={bi("DBMS components", "مكوّنات النظام")} tone="navy" d={0} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof queryPath>>({
  "ddl-dml": DdlDml,
  query: Query,
  info: Info,
});
