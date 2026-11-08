"use client";

import type { userSystem } from "@/lib/walkthroughs/software-engineering/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

/** Each open question in the user requirement and the system requirement that answers it. */
const REFINED: [Bi, Bi][] = [
  [bi("On which day?", "في أي يوم؟"), bi("1.1 Last working day: drugs, costs, clinics", "1.1 آخر يوم عمل: الأدوية والتكاليف والعيادات")],
  [bi("Made by hand? At what time?", "يدويًا؟ وفي أي ساعة؟"), bi("1.2 Generated automatically after 17:30", "1.2 يُولَّد تلقائيًا بعد 17:30")],
  [bi("What does each report list?", "ماذا يتضمن كل تقرير؟"), bi("1.3 Per clinic: drugs, prescriptions, doses, cost", "1.3 لكل عيادة: الأدوية والوصفات والجرعات والتكلفة")],
  [bi("What about different doses?", "وماذا عن الجرعات المختلفة؟"), bi("1.4 A separate report for each dose unit", "1.4 تقرير منفصل لكل وحدة جرعة")],
  [bi("Who may read it?", "من يحق له قراءته؟"), bi("1.5 Only users on the access control list", "1.5 للمستخدمين في قائمة التحكم بالوصول فقط")],
];

function Refine({ control }: { control: string }) {
  const system = control === "system";
  const ys = [16, 69, 122, 175, 228];
  return (
    <Svg>
      <Box
        x={16}
        y={100}
        w={184}
        h={88}
        label={bi("User requirement", "متطلب المستخدم")}
        sub={bi("monthly drug-cost reports", "تقارير شهرية بتكلفة الأدوية")}
        tone="slate"
        size={12.5}
        d={0}
      />
      <Text x={108} y={212} text={system ? bi("refined for developers", "مُفصَّل للمطورين") : bi("in natural language", "بلغة طبيعية")} tone="muted" size={11} d={300} />
      {REFINED.map(([question, answer], i) => {
        const cy = ys[i] + 23;
        return (
          <g key={i}>
            <Arrow pts={[[202, 144], [216, 144], [216, cy], [228, cy]]} tone={system ? "gold" : "danger"} dashed={!system} d={300 + i * 180} dur={420} />
            {system ? (
              <Box x={232} y={ys[i]} w={312} h={46} label={answer} tone="navy" size={11} d={450 + i * 180} />
            ) : (
              <Box x={232} y={ys[i]} w={312} h={46} label={question} tone="warn" dashed size={12} d={450 + i * 180} />
            )}
          </g>
        );
      })}
    </Svg>
  );
}

function WhatHow() {
  const levels: { y: number; label: Bi; sub: Bi; tone: "slate" | "navy" | "outline"; example: Bi }[] = [
    {
      y: 14,
      label: bi("User requirements", "متطلبات المستخدم"),
      sub: bi("the business need · BRS", "حاجة العمل · BRS"),
      tone: "slate",
      example: bi("“Monthly drug-cost reports per clinic”", "«تقارير شهرية بتكلفة الأدوية لكل عيادة»"),
    },
    {
      y: 106,
      label: bi("System requirements", "متطلبات النظام"),
      sub: bi("exact behaviour · SRS", "السلوك الدقيق · SRS"),
      tone: "navy",
      example: bi("“After 17:30 on the last working day”", "«بعد 17:30 في آخر يوم عمل»"),
    },
    {
      y: 198,
      label: bi("Design", "التصميم"),
      sub: bi("how it is built inside", "كيف يُبنى من الداخل"),
      tone: "outline",
      example: bi("a cron job queries the prescriptions", "مهمة مجدولة (cron job) تستعلم عن الوصفات"),
    },
  ];
  return (
    <Svg>
      {levels.map((l, i) => (
        <g key={i}>
          <Box x={16} y={l.y} w={196} h={68} label={l.label} sub={l.sub} tone={l.tone} dashed={i === 2} size={12.5} d={i * 500} />
          <Text x={228} y={l.y + 30} text={l.example} anchor="start" tone={i === 2 ? "muted" : "text"} size={11.5} weight={500} d={200 + i * 500} />
          {i < 2 ? <Arrow pts={[[114, l.y + 70], [114, l.y + 90]]} tone="gold" d={350 + i * 500} dur={250} /> : null}
        </g>
      ))}
      <Arrow pts={[[470, 14], [480, 14], [480, 174], [470, 174]]} tone="gold" head={false} d={1300} />
      <Text x={520} y={76} text={bi("what", "ماذا")} tone="gold" size={14} d={1400} />
      <Text x={520} y={116} text={bi("requirements", "المتطلبات")} tone="muted" size={10} d={1400} />
      <Arrow pts={[[470, 198], [480, 198], [480, 266], [470, 266]]} tone="slate" head={false} d={1600} />
      <Text x={520} y={214} text={bi("how", "كيف")} tone="slate" size={14} d={1700} />
      <Text x={520} y={250} text={bi("design", "التصميم")} tone="muted" size={10} d={1700} />
    </Svg>
  );
}

const READERS: { label: Bi; reads: ("user" | "system")[] }[] = [
  { label: bi("Client managers", "مديرو العميل"), reads: ["user"] },
  { label: bi("Contractor managers", "مديرو المقاول"), reads: ["user"] },
  { label: bi("System end-users", "المستخدمون النهائيون"), reads: ["user", "system"] },
  { label: bi("Client engineers", "مهندسو العميل"), reads: ["user", "system"] },
  { label: bi("System architects", "معماريو النظام"), reads: ["user", "system"] },
  { label: bi("Software developers", "مطورو البرمجيات"), reads: ["system"] },
];

function Readers({ control }: { control: string }) {
  const kind = control === "system" ? "system" : "user";
  const ys = [30, 72, 114, 156, 198, 240];
  let n = 0;
  return (
    <Svg>
      <Doc
        x={30}
        y={70}
        w={140}
        h={140}
        label={kind === "user" ? bi("User requirements", "متطلبات المستخدم") : bi("System requirements", "متطلبات النظام")}
        sub={kind === "user" ? bi("natural language", "لغة طبيعية") : bi("detailed, structured", "مفصّلة ومنظَّمة")}
        tone={kind === "user" ? "slate" : "navy"}
        d={0}
      />
      {READERS.map((r, i) => {
        const reads = r.reads.includes(kind);
        const order = reads ? n++ : 0;
        return (
          <g key={i}>
            {reads ? <Arrow pts={[[172, 140], [306, ys[i]]]} tone="gold" d={400 + order * 160} dur={380} /> : null}
            <Chip x={310} y={ys[i]} w={220} text={r.label} tone={reads ? "gold" : "muted"} d={reads ? 550 + order * 160 : 200} />
          </g>
        );
      })}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof userSystem>>({
  refine: Refine,
  "what-how": WhatHow,
  readers: Readers,
});
