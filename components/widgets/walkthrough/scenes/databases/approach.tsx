"use client";

import type { approach } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../types";
import { Arrow, Box, Chip, Cylinder, Fade, Mark, Person, Svg, Table, Text, Token, type Tone } from "../../primitives";
import { sceneSet } from "../../scene-set";

function Central() {
  const depts = [bi("Orders", "الطلبات"), bi("Accounting", "المحاسبة"), bi("Payroll", "الرواتب")];
  return (
    <Svg>
      {depts.map((d, i) => {
        const y = 42 + i * 80;
        return (
          <g key={i}>
            <Box x={20} y={y} w={130} h={44} label={d} tone="slate" d={i * 120} />
            <Arrow pts={[[150, y + 22], [218, 140]]} tone="gold" d={500 + i * 120} />
            <Token pts={[[150, y + 22], [218, 140], [410, 140]]} d={1300 + i * 300} dur={1100} />
          </g>
        );
      })}
      <Box x={222} y={96} w={144} h={88} label="DBMS" sub={bi("controls every access", "يتحكم في كل وصول")} tone="navy" d={300} />
      <Arrow pts={[[366, 140], [410, 140]]} tone="gold" d={800} width={2.4} />
      <Cylinder x={414} y={78} w={126} h={124} tone="gold" label={bi("Shared data", "البيانات المشتركة")} sub={bi("each fact once", "كل حقيقة مرة واحدة")} d={600} />
    </Svg>
  );
}

function Catalog() {
  return (
    <Svg>
      <Chip x={280} y={26} text="SELECT name FROM STUDENT" tone="outline" center d={0} />
      <Arrow pts={[[280, 40], [280, 70]]} tone="gold" d={250} dur={300} />
      <Box x={210} y={72} w={140} h={54} label="DBMS" tone="navy" d={100} />
      <Arrow pts={[[236, 126], [150, 164]]} tone="gold" d={700} label={bi("1 · read the description", "1 · يقرأ الوصف")} labelAt={[130, 128]} labelTone="gold" />
      <Cylinder x={16} y={158} w={176} h={104} tone="gold" label={bi("Catalog", "الكتالوج")} sub="STUDENT: NAME, ID, GPA" d={500} />
      <Arrow pts={[[324, 126], [410, 164]]} tone="navy" d={1500} label={bi("2 · then read the rows", "2 · ثم يقرأ الصفوف")} labelAt={[440, 128]} labelTone="heading" />
      <Cylinder x={384} y={158} w={156} h={104} tone="navy" label={bi("Data", "البيانات")} sub={bi("the records", "السجلات")} d={1300} />
      <Token pts={[[280, 100], [236, 126], [150, 164]]} d={900} dur={800} />
      <Token pts={[[280, 100], [324, 126], [410, 164]]} d={1700} dur={800} tone="navy" />
    </Svg>
  );
}

const ORDER = ["Sara", "Omar", "Mona", "Ali"];

function Independence({ control }: { control: string }) {
  const after = control === "after";
  const records = after ? [...ORDER].sort() : ORDER;
  const target = records.indexOf("Omar");
  const y = (i: number) => 52 + i * 38;
  return (
    <Svg>
      <Box x={20} y={30} w={170} h={58} label={bi("Program", "البرنامج")} sub="get student 'Omar'" tone="slate" d={0} />
      <Arrow pts={[[190, 59], [228, 59]]} tone="gold" d={300} />
      <Box x={232} y={30} w={110} h={58} label="DBMS" sub={bi("+ catalog", "+ الكتالوج")} tone="navy" d={150} />
      <Box x={380} y={14} w={164} h={254} r={14} tone="ghost" dashed d={200} />
      <Text x={462} y={30} text={bi("Stored records", "السجلات المخزَّنة")} tone="muted" size={11} d={200} />
      {records.map((r, i) => (
        <Box key={r} x={396} y={y(i)} w={132} h={30} r={6} label={r} mono tone={i === target ? "gold" : "outline"} d={300 + i * 100} />
      ))}
      {after ? <Box x={396} y={212} w={132} h={36} r={6} label="INDEX on NAME" mono tone="slate" d={800} /> : null}
      <Arrow pts={[[342, 74], [364, 74], [364, y(target) + 15], [394, y(target) + 15]]} tone="gold" d={after ? 1100 : 800} />
      <Fade d={after ? 1600 : 1300}>
        <Box x={40} y={112} w={130} h={36} label={bi("Omar found", "وُجد Omar")} tone="success" />
      </Fade>
      <Mark x={170} y={112} ok d={after ? 1700 : 1400} />
      <Text
        x={190}
        y={196}
        text={after ? bi("storage changed, program unchanged", "تغيّر التخزين ولم يتغير البرنامج") : bi("the program never sees storage", "البرنامج لا يرى التخزين أبدًا")}
        tone={after ? "success" : "muted"}
        size={12}
        d={after ? 1800 : 1500}
      />
    </Svg>
  );
}

const STUDENTS = [
  ["Sara", "CS", "3.6", "Giza"],
  ["Omar", "IS", "3.1", "Cairo"],
  ["Mona", "CS", "3.8", "Giza"],
];
const COLS = ["NAME", "MAJOR", "GPA", "ADDRESS"];
const WIDTHS = [76, 68, 56, 90];

function Views({ control }: { control: string }) {
  const visible = control === "library" ? [0, 3] : [0, 1, 2];
  const tone = (_: number, c: number): Tone => (visible.includes(c) ? "slate" : "muted");
  const vw = visible.map((c) => WIDTHS[c]);
  const vx = 280 - vw.reduce((s, v) => s + v, 0) / 2 + 30;
  return (
    <Svg>
      <Text x={285} y={16} text={bi("STUDENT, stored once", "STUDENT مخزَّن مرة واحدة")} tone="heading" size={12} d={0} />
      <Table x={140} y={38} cols={COLS} cw={WIDTHS} rows={STUDENTS} cell={tone} d={0} stagger={80} />
      <Text
        x={vx + vw.reduce((s, v) => s + v, 0) / 2}
        y={152}
        text={control === "library" ? bi("The library's view", "عرض المكتبة") : bi("The registrar's view", "عرض شؤون الطلاب")}
        tone="gold"
        size={12}
        d={600}
      />
      <Table
        x={vx}
        y={176}
        cols={visible.map((c) => COLS[c])}
        cw={vw}
        rows={STUDENTS.map((row) => visible.map((c) => row[c]))}
        head="gold"
        d={700}
        stagger={90}
      />
      <Person x={68} y={180} label={control === "library" ? bi("Librarian", "أمين المكتبة") : bi("Registrar", "شؤون الطلاب")} d={500} />
      <Arrow pts={[[94, 214], [vx - 6, 214]]} tone="gold" d={900} />
    </Svg>
  );
}

function Sharing() {
  return (
    <Svg>
      <Person x={70} y={30} label={bi("Clerk 1", "الموظف 1")} d={0} />
      <Person x={490} y={30} label={bi("Clerk 2", "الموظف 2")} d={0} />
      <Box x={204} y={34} w={152} h={58} label="DBMS" sub={bi("concurrency control", "التحكم في التزامن")} tone="navy" d={100} />
      <Arrow pts={[[96, 60], [200, 60]]} tone="gold" d={300} />
      <Arrow pts={[[464, 60], [360, 60]]} tone="slate" d={300} />
      <Token pts={[[96, 60], [200, 60]]} d={600} dur={700} />
      <Token pts={[[464, 60], [380, 60]]} d={650} dur={600} tone="navy" />
      <Chip x={420} y={138} text={bi("waits", "ينتظر")} tone="warn" center d={1200} />
      <Arrow pts={[[280, 92], [280, 166]]} tone="gold" d={1300} />
      <Box x={222} y={170} w={116} h={62} label="Seat 12C" sub={bi("the last seat", "المقعد الأخير")} tone="outline" mono d={200} />
      <Fade d={1700}>
        <Box x={222} y={170} w={116} h={62} label="Seat 12C" sub={bi("sold to clerk 1", "بيع للموظف 1")} tone="success" mono />
      </Fade>
      <Chip x={70} y={138} text={bi("booked", "تم الحجز")} tone="success" center d={1900} />
      <Fade d={2400}>
        <Chip x={420} y={138} text={bi("seat already taken", "المقعد محجوز بالفعل")} tone="danger" center />
      </Fade>
      <Text x={280} y={260} text={bi("one seat, sold once", "مقعد واحد يُباع مرة واحدة")} tone="success" size={12} d={2600} />
    </Svg>
  );
}

function Tradeoffs({ control }: { control: string }) {
  if (control === "costs") {
    return (
      <Svg>
        <Box x={30} y={20} w={240} h={64} label={bi("High initial investment", "استثمار أولي مرتفع")} sub={bi("software, hardware, training", "البرمجيات والعتاد والتدريب")} tone="warn" d={0} />
        <Box x={290} y={20} w={240} h={64} label={bi("Overhead", "عبء إضافي")} sub={bi("security, concurrency, recovery", "الأمان والتزامن والاسترداد")} tone="warn" d={200} />
        <Text x={280} y={114} text={bi("A DBMS may be unnecessary for:", "قد لا نحتاج إلى DBMS في:")} tone="heading" size={12.5} d={500} />
        <Chip x={135} y={162} text={bi("A simple app that won't change", "تطبيق بسيط لن يتغير")} tone="muted" center d={700} />
        <Chip x={322} y={162} text={bi("A single user", "مستخدم واحد")} tone="muted" center d={850} />
        <Chip x={472} y={162} text={bi("Hard real-time", "الزمن الحقيقي الصارم")} tone="muted" center d={1000} />
        <Text x={280} y={226} text={bi("…and insufficient when the data is too complex to model", "…وقد يكون غير كافٍ حين تكون البيانات أعقد من أن تُنمذَج")} tone="muted" size={11.5} d={1300} />
      </Svg>
    );
  }
  const pros = [
    [bi("Less redundancy", "تكرار أقل"), bi("stored once, shared", "تُخزَّن مرة وتُشارَك")],
    [bi("Standards and quality", "المعايير والجودة"), bi("constraints, one interface", "قيود وواجهة واحدة")],
    [bi("Security and recovery", "الأمان والاسترداد"), bi("access rules, backup", "قواعد وصول ونسخ احتياطي")],
    [bi("Productivity", "الإنتاجية"), bi("indexes, SQL, fast development", "فهارس و SQL وتطوير سريع")],
  ] as const;
  return (
    <Svg>
      {pros.map(([label, sub], i) => (
        <g key={i}>
          <Box x={30 + (i % 2) * 260} y={24 + Math.floor(i / 2) * 92} w={240} h={70} label={label} sub={sub} tone="success" d={i * 200} />
          <Mark x={256 + (i % 2) * 260} y={36 + Math.floor(i / 2) * 92} ok d={i * 200 + 300} />
        </g>
      ))}
      <Text x={280} y={232} text={bi("…plus flexibility, current information and economies of scale", "…إضافة إلى المرونة والمعلومات المحدَّثة ووفورات الحجم")} tone="muted" size={11.5} d={1000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof approach>>({
  central: Central,
  catalog: Catalog,
  independence: Independence,
  views: Views,
  sharing: Sharing,
  tradeoffs: Tradeoffs,
});
