"use client";

import type { evolution } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../types";
import { Arrow, Box, Chip, In, Svg, Table, Text, Token, type Pt } from "../../primitives";
import { sceneSet } from "../../scene-set";

const ERAS: [string, Bi][] = [
  ["1960s", bi("Flat files", "الملفات المسطحة")],
  ["1960s–70s", bi("Hierarchy, network", "الهرمي والشبكي")],
  ["1970s–80s", bi("Relational", "العلائقي")],
  ["1990s", bi("Object", "الكائني")],
  ["2000s", bi("XML, RDF", "XML و RDF")],
];

function Timeline() {
  const y = 140;
  return (
    <Svg>
      <Arrow pts={[[30, y], [490, y]]} tone="slate" head={false} d={0} dur={1300} width={2.4} />
      <Arrow pts={[[490, y], [540, y]]} tone="faint" dashed d={1500} />
      {ERAS.map(([era, model], i) => {
        const x = 60 + i * 100;
        const up = i % 2 === 1;
        return (
          <In key={era} d={200 + i * 250}>
            <circle cx={x} cy={y} r={8} style={{ fill: "var(--gold)", stroke: "var(--surface)", strokeWidth: 3 }} />
            <Text x={x} y={up ? y + 28 : y - 26} text={era} tone="gold" size={11.5} mono />
            <Text x={x} y={up ? y - 50 : y + 30} text={model} tone="heading" size={12} />
          </In>
        );
      })}
      <Chip x={476} y={236} text={bi("today: also NoSQL", "اليوم: NoSQL أيضًا")} tone="ghost" center d={1600} />
    </Svg>
  );
}

function Flat() {
  const dup = (r: number, c: number) => (r < 3 && c < 2 ? ("danger" as const) : undefined);
  return (
    <Svg>
      <Text x={225} y={26} text="ORDERS.dat" tone="heading" size={12.5} mono d={0} />
      <Table
        x={60}
        y={44}
        cols={["CUSTOMER", "ADDRESS", "ITEM"]}
        cw={[100, 140, 90]}
        rows={[
          ["Sara", "12 Nile St.", "Desk"],
          ["Sara", "12 Nile St.", "Chair"],
          ["Sara", "12 Nile St.", "Lamp"],
          ["Omar", "5 Tahrir Sq.", "Shelf"],
        ]}
        rh={30}
        cell={dup}
        d={100}
        stagger={180}
      />
      <Arrow pts={[[398, 76], [412, 76], [412, 164], [398, 164]]} tone="danger" head={false} d={1000} />
      <Text x={480} y={120} text={bi("written 3 times", "مكتوب 3 مرات")} tone="danger" size={12} d={1100} />
    </Svg>
  );
}

type Node = { id: string; label: Bi | string; at: Pt; tone?: "navy" | "slate" | "outline" | "danger" | "gold" };

function Navigational({ control }: { control: string }) {
  const network = control === "network";
  const nodes: Node[] = [
    { id: "root", label: bi("Faculty", "الكلية"), at: [280, 34], tone: "navy" },
    { id: "cs", label: bi("CS dept.", "قسم CS"), at: [150, 116], tone: "slate" },
    { id: "math", label: bi("Math dept.", "قسم الرياضيات"), at: [410, 116], tone: "slate" },
    { id: "ai", label: "AI", at: [70, 216] },
    { id: "alg", label: "Algebra", at: [490, 216] },
    ...(network
      ? [{ id: "db", label: "DB", at: [280, 216] as Pt, tone: "gold" as const }]
      : [
          { id: "db", label: "DB", at: [210, 216] as Pt, tone: "gold" as const },
          { id: "db2", label: bi("DB (copy)", "DB (نسخة)"), at: [370, 216] as Pt, tone: "danger" as const },
        ]),
  ];
  const at = (id: string) => nodes.find((n) => n.id === id)!.at;
  const edges: [string, string][] = network
    ? [["root", "cs"], ["root", "math"], ["cs", "ai"], ["cs", "db"], ["math", "db"], ["math", "alg"]]
    : [["root", "cs"], ["root", "math"], ["cs", "ai"], ["cs", "db"], ["math", "db2"], ["math", "alg"]];
  const W = 110;
  const H = 40;
  const top = (id: string): Pt => [at(id)[0], at(id)[1] - H / 2];
  const bottom = (id: string): Pt => [at(id)[0], at(id)[1] + H / 2];
  const via = network ? "math" : "cs";
  const route: Pt[] = [bottom("root"), top(via), bottom(via), top("db")];
  return (
    <Svg>
      {edges.map(([a, b], i) => {
        const p = at(a);
        const q = at(b);
        return <Arrow key={`${a}-${b}`} pts={[[p[0], p[1] + H / 2], [q[0], q[1] - H / 2 - 2]]} tone="slate" d={300 + i * 120} dur={360} />;
      })}
      {nodes.map((n, i) => (
        <Box key={n.id} x={n.at[0] - W / 2} y={n.at[1] - H / 2} w={W} h={H} label={n.label} tone={n.tone ?? "outline"} size={12} d={i * 90} />
      ))}
      <Token pts={route} d={1300} dur={1500} />
      <Text x={280} y={256} text={bi("the program follows pointers, one record at a time", "يتبع البرنامج المؤشرات سجلًا بعد سجل")} tone="muted" size={11.5} d={1500} />
    </Svg>
  );
}

function Relational() {
  const y = (r: number) => 86 + r * 24;
  return (
    <Svg>
      <Text x={140} y={36} text="COURSE" tone="heading" size={12} mono d={0} />
      <Table
        x={30}
        y={50}
        cols={["CNO", "TITLE", "DNO"]}
        cw={[60, 100, 60]}
        rows={[
          ["C1", "Databases", "1"],
          ["C2", "AI", "1"],
          ["C3", "Algebra", "2"],
        ]}
        cell={(_, c) => (c === 2 ? "gold" : undefined)}
        d={0}
      />
      <Text x={440} y={36} text="DEPARTMENT" tone="heading" size={12} mono d={200} />
      <Table
        x={360}
        y={50}
        cols={["DNO", "DNAME"]}
        cw={[60, 100]}
        rows={[
          ["1", "CS"],
          ["2", "Math"],
        ]}
        cell={(_, c) => (c === 0 ? "gold" : undefined)}
        d={200}
      />
      <Arrow pts={[[250, y(0)], [358, y(0)]]} tone="gold" dashed head={false} d={900} />
      <Arrow pts={[[250, y(1)], [358, y(0)]]} tone="gold" dashed head={false} d={1050} />
      <Arrow pts={[[250, y(2)], [358, y(1)]]} tone="gold" dashed head={false} d={1200} />
      <Text x={304} y={170} text={bi("linked by equal values, not pointers", "مرتبطة بقيم متساوية لا بمؤشرات")} tone="gold" size={11.5} d={1300} />
      <Box x={40} y={196} w={480} h={66} r={10} tone="outline" d={1500} />
      <Text x={56} y={218} text="SELECT TITLE FROM COURSE NATURAL JOIN DEPARTMENT" anchor="start" mono size={11.5} tone="heading" d={1600} />
      <Text x={56} y={240} text="WHERE DNAME = 'CS';   →   Databases, AI" anchor="start" mono size={11.5} tone="heading" d={1700} />
    </Svg>
  );
}

function ObjectModel() {
  return (
    <Svg>
      <Box x={60} y={30} w={210} h={40} r={0} label="Student" mono tone="navy" d={0} />
      <Box x={60} y={70} w={210} h={70} r={0} tone="outline" d={200} />
      <Text x={76} y={92} text="name : String" anchor="start" mono size={12} d={300} />
      <Text x={76} y={118} text="gpa  : Decimal" anchor="start" mono size={12} d={400} />
      <Box x={60} y={140} w={210} h={84} r={0} tone="slate" d={600} />
      <Text x={76} y={164} text="enroll(course)" anchor="start" mono size={12} d={700} />
      <Text x={76} y={190} text="transcript()" anchor="start" mono size={12} d={800} />
      <Arrow pts={[[324, 105], [276, 105]]} tone="faint" d={500} />
      <Text x={336} y={105} text={bi("attributes", "السمات")} anchor="start" tone="muted" size={11.5} d={500} />
      <Arrow pts={[[324, 182], [276, 182]]} tone="faint" d={900} />
      <Text x={336} y={182} text={bi("methods", "الدوال")} anchor="start" tone="muted" size={11.5} d={900} />
      <Text x={455} y={36} text={bi("Object-relational", "الكائني العلائقي")} tone="heading" size={12} d={1200} />
      <Table
        x={400}
        y={62}
        cols={["NAME", "GPA"]}
        cw={55}
        rows={[
          ["Sara", "3.6"],
          ["Omar", "3.1"],
        ]}
        d={1300}
      />
      <Chip x={455} y={160} text="+ enroll()" tone="gold" center d={1700} />
      <Text x={455} y={212} text={bi("a table that gains methods", "جدول يكتسب دوال")} tone="muted" size={11} d={1800} />
    </Svg>
  );
}

const BOOK_A = ["<book>", "  <title>DB Systems</title>", "  <author>Elmasri</author>", "  <author>Navathe</author>", "</book>"];
const BOOK_B = ["<book>", "  <title>SQL Basics</title>", "  <edition>3</edition>", "</book>"];

function Semi({ control }: { control: string }) {
  if (control === "rdf") {
    const n = { book: [280, 136] as Pt, a: [96, 56] as Pt, b: [96, 216] as Pt, p: [470, 136] as Pt };
    return (
      <Svg>
        <Box x={n.book[0] - 64} y={n.book[1] - 20} w={128} h={40} label="DB Systems" mono tone="gold" d={0} />
        <Box x={n.a[0] - 56} y={n.a[1] - 18} w={112} h={36} label="Elmasri" mono tone="slate" d={200} />
        <Box x={n.b[0] - 56} y={n.b[1] - 18} w={112} h={36} label="Navathe" mono tone="slate" d={350} />
        <Box x={n.p[0] - 56} y={n.p[1] - 18} w={112} h={36} label="Pearson" mono tone="slate" d={500} />
        <Arrow pts={[[152, 70], [218, 118]]} tone="navy" d={700} label="wrote" labelAt={[160, 104]} labelTone="heading" />
        <Arrow pts={[[152, 202], [218, 154]]} tone="navy" d={900} label="wrote" labelAt={[160, 168]} labelTone="heading" />
        <Arrow pts={[[344, 136], [412, 136]]} tone="navy" d={1100} label="publisher" labelAt={[378, 120]} labelTone="heading" />
        <Text x={280} y={256} text="(Elmasri, wrote, DB Systems)" mono size={11.5} tone="muted" d={1400} />
      </Svg>
    );
  }
  const line = (text: string, i: number, x: number, key: string, hi: boolean) => <Text key={key} x={x} y={62 + i * 24} text={text} anchor="start" mono size={11.5} tone={hi ? "gold" : "heading"} d={200 + i * 150} />;
  return (
    <Svg>
      <Box x={20} y={40} w={250} h={140} r={10} tone="outline" d={0} />
      {BOOK_A.map((t, i) => line(t, i, 34, `a${i}`, t.includes("author")))}
      <Box x={290} y={40} w={250} h={140} r={10} tone="outline" d={600} />
      {BOOK_B.map((t, i) => line(t, i, 304, `b${i}`, t.includes("edition")))}
      <Chip x={145} y={208} text={bi("two authors", "مؤلفان")} tone="gold" center d={1200} />
      <Chip x={415} y={208} text={bi("an edition, no author", "طبعة بلا مؤلف")} tone="gold" center d={1350} />
      <Text x={280} y={252} text={bi("same type, different attributes", "النوع نفسه بسمات مختلفة")} tone="muted" size={11.5} d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof evolution>>({
  timeline: Timeline,
  flat: Flat,
  navigational: Navigational,
  relational: Relational,
  object: ObjectModel,
  semi: Semi,
});
