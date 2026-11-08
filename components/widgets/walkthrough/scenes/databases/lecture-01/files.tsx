"use client";

import type { files } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, In, Mark, Person, Svg, Table, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Silos() {
  const columns = [
    { x: 100, dept: bi("Orders dept.", "قسم الطلبات"), program: bi("Order filling", "تنفيذ الطلبات"), docs: [bi("Customer", "العملاء"), bi("Inventory", "المخزون")] },
    { x: 280, dept: bi("Accounting", "المحاسبة"), program: bi("Invoicing", "الفوترة"), docs: [bi("Customer", "العملاء"), bi("Pricing", "الأسعار")] },
    { x: 460, dept: bi("Payroll", "الرواتب"), program: bi("Payroll system", "نظام الرواتب"), docs: [bi("Employee", "الموظفون")] },
  ];
  return (
    <Svg>
      {columns.map((c, i) => {
        const d = i * 450;
        const docXs = c.docs.length === 2 ? [c.x - 72, c.x + 6] : [c.x - 33];
        return (
          <g key={i}>
            <Box x={c.x - 75} y={14} w={150} h={42} label={c.dept} tone="navy" d={d} />
            <Arrow pts={[[c.x, 56], [c.x, 80]]} d={d + 150} dur={250} />
            <Box x={c.x - 75} y={82} w={150} h={42} label={c.program} tone="slate" d={d + 250} />
            {c.docs.map((label, j) => (
              <g key={j}>
                <Arrow pts={[[c.x, 124], [docXs[j] + 33, 146]]} d={d + 350} dur={250} />
                <Doc x={docXs[j]} y={148} w={66} h={70} label={label} tone={i < 2 && j === 0 ? "danger" : "outline"} d={d + 400} />
              </g>
            ))}
          </g>
        );
      })}
      <Arrow pts={[[61, 222], [61, 238], [247, 238], [247, 222]]} tone="danger" head={false} dashed d={1600} />
      <Text x={154} y={256} text={bi("Duplicate data", "بيانات مكررة")} tone="danger" size={12} d={1700} />
    </Svg>
  );
}

function Inconsistency({ control }: { control: string }) {
  const moved = control === "after";
  const offices = [bi("Registrar", "شؤون الطلاب"), bi("Library", "المكتبة"), bi("Housing", "السكن")];
  return (
    <Svg>
      <Person x={68} y={80} label={bi("Student", "الطالب")} d={0} />
      {offices.map((office, i) => {
        const y = 22 + i * 74;
        const fresh = moved && i === 0;
        const stale = moved && i > 0;
        return (
          <g key={i}>
            {moved ? (
              i === 0 ? <Arrow pts={[[96, 100], [166, y + 22]]} tone="gold" d={200} /> : <Arrow pts={[[96, 104], [166, y + 22]]} tone="faint" dashed head={false} d={200} />
            ) : (
              <Arrow pts={[[96, 102], [166, y + 22]]} tone="faint" d={150 + i * 120} />
            )}
            <Box x={170} y={y} w={140} h={44} label={office} tone="navy" d={100 + i * 120} />
            <Box x={330} y={y + 5} w={176} h={34} label="12 Nile St." mono tone="outline" d={300 + i * 120} />
            {fresh ? (
              <Fade d={1000}>
                <Box x={330} y={y + 5} w={176} h={34} label="7 Tahrir Sq." mono tone="success" />
              </Fade>
            ) : null}
            {stale ? (
              <Fade d={1300 + i * 150}>
                <Box x={330} y={y + 5} w={176} h={34} label="12 Nile St." mono tone="danger" />
                <Text x={418} y={y + 52} text={bi("out of date", "قديم")} tone="danger" size={11} />
              </Fade>
            ) : null}
            {moved ? <Mark x={526} y={y + 22} ok={i === 0} d={i === 0 ? 1100 : 1400 + i * 150} /> : null}
          </g>
        );
      })}
      {moved ? <Token pts={[[96, 100], [166, 44]]} d={200} dur={700} /> : null}
      {!moved ? <Chip x={418} y={250} text={bi("one fact, stored 3 times", "حقيقة واحدة مخزَّنة 3 مرات")} tone="warn" center d={800} /> : null}
    </Svg>
  );
}

function Dependence({ control }: { control: string }) {
  const dbms = control === "dbms";
  const programs = [bi("Registration", "التسجيل"), bi("Grades", "الدرجات"), bi("Transcripts", "كشوف الدرجات")];
  return (
    <Svg>
      <Text x={74} y={50} text={bi("Student file", "ملف الطلاب")} tone="heading" size={12.5} d={0} />
      <Table x={150} y={32} cols={["NAME", "ID", "GPA"]} cw={[80, 60, 60]} rows={[]} d={0} />
      <Box x={350} y={32} w={84} h={24} r={0} label="EMAIL" mono tone="gold" d={500} />
      <Text x={442} y={40} text={bi("new field", "حقل جديد")} anchor="start" tone="gold" size={11} d={500} />
      {dbms ? (
        <>
          <Arrow pts={[[292, 58], [292, 98]]} tone="gold" d={700} />
          <Box x={182} y={100} w={220} h={52} label="DBMS" sub={bi("layout kept in the catalog", "البنية محفوظة في الكتالوج")} tone="navy" d={0} />
          <Chip x={480} y={126} text="catalog: + EMAIL" tone="gold" center d={900} />
          <Arrow pts={[[420, 126], [404, 126]]} tone="gold" head={false} d={900} dur={200} />
        </>
      ) : null}
      {programs.map((p, i) => {
        const x = 20 + i * 190;
        const from: [number, number] = dbms ? [292, 152] : [292, 58];
        return (
          <g key={i}>
            <Arrow pts={[from, [x + 70, 194]]} tone={dbms ? "success" : "danger"} d={dbms ? 1100 : 900 + i * 150} />
            <Box x={x} y={196} w={140} h={64} label={p} sub={dbms ? bi("unchanged", "دون تغيير") : bi("own copy of the layout", "نسخته من البنية")} tone="slate" d={100 + i * 120} />
            <Mark x={x + 134} y={198} ok={dbms} d={dbms ? 1300 + i * 120 : 1200 + i * 150} />
          </g>
        );
      })}
    </Svg>
  );
}

const PAGES = [0, 1, 2, 3, 4, 5];

function Os({ control }: { control: string }) {
  if (control === "security") {
    return (
      <Svg>
        <Text x={140} y={20} text={bi("Operating system", "نظام التشغيل")} tone="heading" size={13} d={0} />
        <Text x={420} y={20} text="DBMS" tone="heading" size={13} d={0} />
        <Doc x={100} y={62} w={80} h={92} label={bi("Students file", "ملف الطلاب")} tone="outline" d={100} />
        <In d={300}>
          <path d="M133,52 v-7 a7,7 0 0 1 14,0 v7" fill="none" stroke="var(--gold-text)" strokeWidth={2.2} />
          <Box x={127} y={50} w={26} h={20} r={4} tone="gold" />
        </In>
        <Person x={52} y={166} label={bi("Has the password", "يملك كلمة المرور")} d={500} />
        <Person x={228} y={166} label={bi("Doesn't", "لا يملكها")} d={500} />
        <Arrow pts={[[64, 164], [108, 156]]} tone="success" d={800} />
        <Arrow pts={[[216, 164], [172, 156]]} tone="danger" d={800} />
        <Text x={52} y={256} text={bi("sees everything", "يرى كل شيء")} tone="success" size={11} d={1100} />
        <Text x={228} y={256} text={bi("sees nothing", "لا يرى شيئًا")} tone="danger" size={11} d={1100} />
        <Table
          x={310}
          y={40}
          cols={["NAME", "GPA", "ADDR"]}
          cw={70}
          rows={[
            ["Sara", "3.6", "Giza"],
            ["Omar", "3.1", "Cairo"],
          ]}
          d={300}
        />
        <Arrow pts={[[350, 112], [350, 146]]} tone="gold" dashed d={1000} />
        <Arrow pts={[[470, 112], [470, 146]]} tone="gold" dashed d={1000} />
        <Table
          x={300}
          y={150}
          cols={["NAME", "GPA"]}
          cw={50}
          rows={[
            ["Sara", "3.6"],
            ["Omar", "3.1"],
          ]}
          head="slate"
          d={1200}
        />
        <Table
          x={420}
          y={150}
          cols={["NAME", "ADDR"]}
          cw={55}
          rows={[
            ["Sara", "Giza"],
            ["Omar", "Cairo"],
          ]}
          head="slate"
          d={1400}
        />
        <Text x={350} y={240} text={bi("Registrar's view", "عرض شؤون الطلاب")} tone="muted" size={11} d={1300} />
        <Text x={475} y={240} text={bi("Library's view", "عرض المكتبة")} tone="muted" size={11} d={1500} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Text x={140} y={20} text={bi("Operating system", "نظام التشغيل")} tone="heading" size={13} d={0} />
      <Text x={420} y={20} text="DBMS" tone="heading" size={13} d={0} />
      {PAGES.map((p) => (
        <Box key={`os${p}`} x={30} y={50 + p * 24} w={74} h={19} r={3} tone={p === 2 ? "gold" : "muted"} label={`page ${p + 1}`} size={10} mono d={p * 60} />
      ))}
      <Text x={67} y={206} text={bi("file on disk", "الملف على القرص")} tone="muted" size={11} d={300} />
      <Arrow pts={[[110, 122], [164, 122]]} tone="danger" d={500} label={bi("whole file", "الملف كاملًا")} labelAt={[137, 92]} labelTone="danger" />
      <Box x={170} y={40} w={86} h={168} r={8} tone="ghost" dashed d={400} />
      <Text x={213} y={224} text="RAM" tone="muted" size={11} mono d={400} />
      {PAGES.map((p) => (
        <Box key={`ram${p}`} x={176} y={50 + p * 24} w={74} h={19} r={3} tone={p === 2 ? "gold" : "danger"} label={`page ${p + 1}`} size={10} mono d={800 + p * 120} />
      ))}
      {PAGES.map((p) => (
        <Box key={`db${p}`} x={310} y={50 + p * 24} w={74} h={19} r={3} tone={p === 2 ? "gold" : "muted"} label={`page ${p + 1}`} size={10} mono d={p * 60} />
      ))}
      <Chip x={347} y={244} text="INDEX" tone="slate" center d={600} />
      <Arrow pts={[[318, 232], [298, 232], [298, 109], [306, 109]]} tone="slate" d={800} />
      <Box x={446} y={40} w={86} h={168} r={8} tone="ghost" dashed d={400} />
      <Text x={489} y={224} text="RAM" tone="muted" size={11} mono d={400} />
      <Arrow pts={[[388, 109], [446, 109]]} tone="gold" d={1100} label={bi("one page", "صفحة واحدة")} labelAt={[417, 82]} labelTone="gold" />
      <Box x={452} y={100} w={74} h={19} r={3} tone="gold" label="page 3" size={10} mono d={1400} />
    </Svg>
  );
}

function Sql({ control }: { control: string }) {
  const sql = control === "sql";
  const questions = [bi("Who has GPA > 3.5?", "من معدله أعلى من 3.5؟"), bi("How many study CS?", "كم طالبًا يدرس CS؟"), bi("Who lives in Giza?", "من يسكن في الجيزة؟")];
  const ys = [44, 120, 196];
  return (
    <Svg>
      {questions.map((q, i) => (
        <Chip key={i} x={20} y={ys[i]} w={196} text={q} tone="outline" d={i * 150} />
      ))}
      {sql ? (
        <>
          {ys.map((y, i) => (
            <Arrow key={i} pts={[[218, y], [270, 120]]} tone="gold" d={500 + i * 120} />
          ))}
          <Box x={274} y={88} w={110} h={64} label="SQL" sub={bi("one language", "لغة واحدة")} tone="gold" d={800} size={16} />
          <Arrow pts={[[386, 120], [430, 120]]} tone="gold" d={1100} />
          <Box x={434} y={88} w={110} h={64} label="DBMS" sub={bi("answers all three", "يجيب عن الثلاثة")} tone="navy" d={1200} />
          <Text x={280} y={252} text={bi("3 questions, 1 query language", "3 أسئلة ولغة استعلام واحدة")} tone="success" size={12} d={1500} />
        </>
      ) : (
        <>
          {ys.map((y, i) => (
            <g key={i}>
              <Arrow pts={[[218, y], [262, y]]} tone="danger" d={400 + i * 350} />
              <Box x={266} y={y - 24} w={128} h={48} label={bi("new program", "برنامج جديد")} sub={`#${i + 1}`} tone="warn" d={550 + i * 350} />
              <Arrow pts={[[396, y], [452, 120]]} d={700 + i * 350} />
            </g>
          ))}
          <Doc x={458} y={78} w={76} h={84} label={bi("Files", "الملفات")} tone="outline" d={300} />
          <Text x={280} y={252} text={bi("3 questions, 3 programs to write", "3 أسئلة و3 برامج يجب كتابتها")} tone="danger" size={12} d={1600} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof files>>({
  silos: Silos,
  inconsistency: Inconsistency,
  dependence: Dependence,
  os: Os,
  sql: Sql,
});
