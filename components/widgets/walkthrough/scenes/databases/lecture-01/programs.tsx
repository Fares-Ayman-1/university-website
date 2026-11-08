"use client";

import type { programs } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Cylinder, Mark, Svg, Table, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const RECORDS: [string, string][] = [
  ["Sara", "3.6"],
  ["Omar", "3.1"],
  ["Mona", "3.8"],
  ["Ali", "2.9"],
];

function Declarative({ control }: { control: string }) {
  if (control === "loop") {
    const code = ["f = open('students')", "for rec in f:", "    if rec.gpa >= 3.5:", "        print(rec.name)", "f.close()"];
    return (
      <Svg>
        <Text x={170} y={18} text={bi("You write how to get it", "تكتب كيف تحصل عليه")} tone="heading" size={12.5} d={0} />
        <Box x={20} y={44} w={300} h={168} r={10} tone="outline" d={0} />
        {code.map((line, i) => (
          <Text key={i} x={36} y={70 + i * 28} text={line} anchor="start" mono size={12} tone={i === 1 || i === 2 ? "gold" : "heading"} d={150 + i * 150} />
        ))}
        {RECORDS.map(([name, gpa], i) => (
          <Box key={name} x={376} y={44 + i * 44} w={130} h={34} r={6} label={`${name}  ${gpa}`} mono tone="outline" d={300 + i * 100} />
        ))}
        <Token pts={[[364, 61], [364, 105], [364, 149], [364, 193]]} d={1200} dur={2000} />
        {RECORDS.map(([name, gpa], i) => (
          <Mark key={name} x={522} y={61 + i * 44} ok={Number(gpa) >= 3.5} d={1300 + i * 600} />
        ))}
        <Text x={170} y={244} text={bi("every step is spelled out by hand", "كل خطوة مكتوبة يدويًا")} tone="muted" size={11.5} d={3500} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Text x={170} y={18} text={bi("You write what you want", "تكتب ما تريد")} tone="heading" size={12.5} d={0} />
      <Box x={20} y={44} w={300} h={66} r={10} tone="outline" d={0} />
      <Text x={36} y={68} text="SELECT name FROM student" anchor="start" mono size={12.5} tone="heading" d={150} />
      <Text x={36} y={90} text="WHERE gpa >= 3.5;" anchor="start" mono size={12.5} tone="heading" d={300} />
      <Arrow pts={[[320, 77], [376, 77]]} tone="gold" d={600} />
      <Box x={380} y={46} w={150} h={62} label="DBMS" sub={bi("decides how", "يقرر الكيفية")} tone="navy" d={700} />
      <Arrow pts={[[455, 108], [455, 142]]} tone="gold" d={1100} />
      <Table
        x={395}
        y={146}
        cols={["NAME"]}
        cw={120}
        rows={[["Sara"], ["Mona"]]}
        d={1300}
      />
      <Text x={170} y={150} text={bi("index? full scan? which order?", "فهرس؟ مسح كامل؟ أي ترتيب؟")} tone="muted" size={11.5} d={1000} />
      <Text x={170} y={186} text={bi("the optimizer chooses", "المُحسِّن يختار")} tone="gold" size={12} d={1200} />
    </Svg>
  );
}

function Api() {
  const P = 110;
  const D = 450;
  const msgs: { label: string; to: boolean }[] = [
    { label: "connect('school.db')", to: true },
    { label: "connection", to: false },
    { label: "execute(SQL, (3.5,))", to: true },
    { label: "cursor", to: false },
    { label: "next row", to: true },
    { label: "('Sara',)", to: false },
    { label: "next row", to: true },
    { label: "('Mona',)", to: false },
    { label: "close()", to: true },
  ];
  return (
    <Svg>
      <Box x={P - 80} y={8} w={160} h={34} label="api_approach.py" mono tone="slate" d={0} />
      <Box x={D - 70} y={8} w={140} h={34} label="DBMS" tone="navy" d={100} />
      <Arrow pts={[[P, 42], [P, 274]]} tone="faint" dashed head={false} d={150} />
      <Arrow pts={[[D, 42], [D, 274]]} tone="faint" dashed head={false} d={150} />
      {msgs.map((m, i) => {
        const y = 66 + i * 24;
        const pts: [number, number][] = m.to ? [[P + 4, y], [D - 4, y]] : [[D - 4, y], [P + 4, y]];
        return (
          <g key={i}>
            <Arrow pts={pts} tone={m.to ? "gold" : "slate"} dashed={!m.to} d={300 + i * 280} dur={360} />
            <Text x={(P + D) / 2} y={y - 8} text={m.label} mono size={10.5} tone={m.to ? "heading" : "slate"} d={400 + i * 280} />
          </g>
        );
      })}
    </Svg>
  );
}

function Embedded() {
  const src = ["int main() {", "  EXEC SQL SELECT name", "    INTO :n FROM student", "    WHERE id = :id;", '  printf("%s", n);', "}"];
  const out = ["int main() {", "  sql_prepare(stmt, …);", "  sql_bind(stmt, &id);", "  sql_fetch(stmt, &n);", '  printf("%s", n);', "}"];
  return (
    <Svg>
      <Text x={115} y={14} text={bi("Your source", "شيفرتك المصدرية")} tone="heading" size={12} d={0} />
      <Box x={15} y={36} w={200} h={146} r={10} tone="outline" d={0} />
      {src.map((l, i) => (
        <Text key={i} x={26} y={56 + i * 22} text={l} anchor="start" mono size={10.5} tone={i >= 1 && i <= 3 ? "gold" : "heading"} d={100 + i * 100} />
      ))}
      <Arrow pts={[[215, 110], [236, 110]]} tone="gold" d={800} dur={200} />
      <Box x={238} y={84} w={100} h={52} label={bi("Precompiler", "المترجم الأولي")} tone="gold" d={900} />
      <Arrow pts={[[338, 110], [356, 110]]} tone="gold" d={1100} dur={200} />
      <Text x={452} y={14} text={bi("After precompiling", "بعد الترجمة الأولية")} tone="heading" size={12} d={1200} />
      <Box x={358} y={36} w={190} h={146} r={10} tone="outline" d={1200} />
      {out.map((l, i) => (
        <Text key={i} x={368} y={56 + i * 22} text={l} anchor="start" mono size={10.5} tone={i >= 1 && i <= 3 ? "slate" : "heading"} d={1300 + i * 100} />
      ))}
      <Arrow pts={[[452, 182], [452, 198]]} d={1900} dur={250} />
      <Box x={358} y={200} w={190} h={68} label={bi("C compiler", "مترجم C")} sub={bi("builds the program", "يبني البرنامج")} tone="slate" d={2000} />
      <Text x={115} y={214} text={bi("EXEC SQL lines become API calls", "تصبح أسطر EXEC SQL استدعاءات API")} tone="muted" size={11.5} d={1600} />
    </Svg>
  );
}

function Plsql({ control }: { control: string }) {
  const server = control === "server";
  return (
    <Svg>
      <Box x={20} y={50} w={130} h={170} r={12} label={bi("Application", "التطبيق")} tone="slate" d={0} />
      <Box x={350} y={20} w={190} h={236} r={14} tone="ghost" dashed d={0} />
      <Text x={445} y={36} text={bi("DBMS server", "خادم النظام")} tone="muted" size={11.5} d={0} />
      <Cylinder x={395} y={172} w={100} h={72} tone="navy" label={bi("Data", "البيانات")} d={100} />
      {server ? (
        <>
          <Arrow pts={[[150, 100], [356, 100]]} tone="gold" d={300} label="CALL raise_all()" labelAt={[252, 86]} labelTone="heading" />
          <Token pts={[[150, 100], [356, 100]]} d={400} dur={700} />
          <Box x={366} y={58} w={158} h={86} label="PL/SQL" sub={bi("loop: 3 UPDATEs", "حلقة: 3 عبارات UPDATE")} tone="gold" d={900} />
          {[0, 1, 2].map((k) => (
            <Token key={k} pts={[[445, 144], [445, 172]]} d={1200 + k * 450} dur={380} tone="navy" r={5} />
          ))}
          <Arrow pts={[[356, 160], [150, 160]]} tone="slate" dashed d={2700} label="done" labelAt={[252, 146]} labelTone="slate" />
          <Chip x={252} y={250} text={bi("1 round trip", "رحلة واحدة")} tone="success" center d={3000} />
        </>
      ) : (
        <>
          {[0, 1, 2].map((k) => {
            const y = 74 + k * 50;
            return (
              <g key={k}>
                <Arrow pts={[[150, y], [390, y]]} tone="gold" d={300 + k * 800} label={`UPDATE … (${k + 1})`} labelAt={[260, y - 12]} labelTone="heading" />
                <Token pts={[[150, y], [390, y]]} d={300 + k * 800} dur={500} />
                <Arrow pts={[[390, y + 16], [150, y + 16]]} tone="slate" dashed d={700 + k * 800} />
              </g>
            );
          })}
          <Chip x={252} y={250} text={bi("3 round trips", "3 رحلات ذهاب وإياب")} tone="warn" center d={2800} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof programs>>({
  declarative: Declarative,
  api: Api,
  embedded: Embedded,
  plsql: Plsql,
});
