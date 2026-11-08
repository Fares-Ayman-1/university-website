"use client";

import type { frNfr } from "@/lib/walkthroughs/software-engineering/lecture-04";
import { DOWNTIME_LIMIT, TEST_WEEK, checkDowntime } from "@/lib/widgets/se-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Person, Svg, Text, Token, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const NOUN = bi("noun", "اسم");
const VERB = bi("verb", "فعل");
const ADVERB = bi("adverb", "ظرف");

function FrVsNfr({ control }: { control: string }) {
  const nfr = control === "nfr";
  const words: { w: string; tag: Bi; key?: boolean }[] = nfr
    ? [
        { w: "The system", tag: NOUN },
        { w: "prints", tag: VERB },
        { w: "invoices", tag: NOUN },
        { w: "quickly", tag: ADVERB, key: true },
      ]
    : [
        { w: "The system", tag: NOUN },
        { w: "prints", tag: VERB },
        { w: "an invoice", tag: NOUN },
      ];
  const widths = words.map((x) => x.w.length * 12 * 0.6 + 24);
  const gap = 12;
  const total = widths.reduce((s, v) => s + v, 0) + gap * (words.length - 1);
  const xs = widths.map((_, i) => 280 - total / 2 + widths.slice(0, i).reduce((s, v) => s + v, 0) + gap * i);
  const target = nfr ? 415 : 145;
  const path: Pt[] = [
    [280, 110],
    [280, 132],
    [target, 132],
    [target, 156],
  ];
  return (
    <Svg>
      {words.map((x, i) => (
        <g key={i}>
          <Chip x={xs[i]} y={44} w={widths[i]} text={x.w} size={12} tone={x.key ? "gold" : "outline"} d={i * 150} />
          <Text x={xs[i] + widths[i] / 2} y={78} text={x.tag} tone={x.key ? "gold" : "muted"} size={11} d={300 + i * 150} />
        </g>
      ))}
      <Arrow pts={path} tone={nfr ? "gold" : "navy"} d={900} dur={600} />
      <Token pts={path} d={1000} dur={900} />
      <Box x={30} y={160} w={230} h={68} label={bi("Functional", "وظيفي")} sub={bi("a service it performs", "خدمة يؤديها")} tone={nfr ? "muted" : "navy"} d={500} />
      <Box x={300} y={160} w={230} h={68} label={bi("Non-functional", "غير وظيفي")} sub={bi("how well it performs it", "مدى جودة أدائه لها")} tone={nfr ? "gold" : "muted"} d={500} />
      {nfr ? (
        <Chip x={415} y={254} w={236} text={bi("how quickly? not testable yet", "ما مدى السرعة؟ غير قابل للاختبار بعد")} tone="warn" center d={1600} />
      ) : (
        <Chip x={145} y={254} w={236} text={bi("a test: did it print?", "اختبار: هل طُبعت؟")} tone="success" center d={1600} />
      )}
    </Svg>
  );
}

function FrBehaviour() {
  const rows: { cy: number; input: string | Bi; mono?: boolean; req: Bi; output: Bi; tone: Tone; token: "gold" | "danger" }[] = [
    { cy: 70, input: "ID 20231187", mono: true, req: bi("requirement 3", "المتطلب 3"), output: bi("Staff identified", "تم التعرّف على الموظف"), tone: "success", token: "gold" },
    { cy: 146, input: "ID 2023", mono: true, req: bi("requirement 3", "المتطلب 3"), output: bi("Rejected: not 8 digits", "مرفوض: ليس 8 أرقام"), tone: "danger", token: "danger" },
    { cy: 222, input: bi("Today's appointments", "مواعيد اليوم"), req: bi("requirement 2", "المتطلب 2"), output: bi("Patient list per clinic", "قائمة مرضى لكل عيادة"), tone: "slate", token: "gold" },
  ];
  return (
    <Svg>
      <Text x={95} y={22} text={bi("Input", "المدخل")} tone="heading" size={13} d={0} />
      <Text x={280} y={22} text="Mentcare" tone="heading" size={13} d={0} />
      <Text x={466} y={22} text={bi("Output", "المخرج")} tone="heading" size={13} d={0} />
      <Box x={214} y={46} w={132} h={200} r={12} tone="navy" d={100} />
      {rows.map((r, i) => {
        const d = 300 + i * 700;
        return (
          <g key={i}>
            <Box x={20} y={r.cy - 24} w={150} h={48} label={r.input} mono={r.mono} size={12} tone="outline" d={d} />
            <Chip x={280} y={r.cy} w={114} text={r.req} tone="gold" center d={d + 100} />
            <Arrow pts={[[172, r.cy], [212, r.cy]]} tone="muted" d={d + 150} dur={250} />
            <Arrow pts={[[348, r.cy], [386, r.cy]]} tone={r.tone === "danger" ? "danger" : "gold"} d={d + 450} dur={250} />
            <Token pts={[[172, r.cy], [386, r.cy]]} tone={r.token} d={d + 150} dur={600} />
            <Box x={388} y={r.cy - 24} w={156} h={48} label={r.output} size={11.5} tone={r.tone} d={d + 550} />
          </g>
        );
      })}
    </Svg>
  );
}

const CLINICS: [string, Bi, string[]][] = [
  ["A", bi("Clinic A", "العيادة A"), ["Sara M.", "Omar K.", "Mona T."]],
  ["B", bi("Clinic B", "العيادة B"), ["Hany R.", "Laila S.", "Karim A."]],
  ["C", bi("Clinic C", "العيادة C"), ["Nour E.", "Ali Hassan", "Rana F."]],
];
const CLINIC_X = [180, 302, 424];

function Ambiguity({ control }: { control: string }) {
  const dev = control === "developer";
  return (
    <Svg>
      <Text
        x={280}
        y={18}
        text={bi("“A user shall be able to search the appointment lists for all clinics.”", "«يجب أن يتمكن المستخدم من البحث في قوائم المواعيد لجميع العيادات».")}
        tone="heading"
        size={11.5}
        weight={500}
        d={0}
      />
      {dev ? (
        <>
          <Box x={16} y={70} w={150} h={44} label={bi("1 · clinic: A ▾", "1 · العيادة: A ▾")} size={11.5} tone="warn" d={200} />
          <Box x={16} y={126} w={150} h={44} label={bi("2 · search: Ali Hassan", "2 · بحث: Ali Hassan")} size={11.5} tone="slate" d={400} />
        </>
      ) : (
        <Box x={16} y={70} w={150} h={44} label={bi("search: Ali Hassan", "بحث: Ali Hassan")} size={11.5} tone="slate" d={200} />
      )}
      {CLINICS.map(([, name, rows], i) => {
        const x = CLINIC_X[i];
        const skipped = dev && i > 0;
        return (
          <g key={i}>
            <Box x={x} y={60} w={116} h={44} label={name} size={12} tone={skipped ? "muted" : "navy"} d={300 + i * 120} />
            {rows.map((p, j) => (
              <Box key={j} x={x} y={104 + j * 26} w={116} h={26} r={0} label={p} mono size={11} tone={skipped ? "muted" : "outline"} d={400 + i * 120 + j * 60} />
            ))}
          </g>
        );
      })}
      {dev ? (
        <>
          <Arrow pts={[[91, 68], [91, 50], [238, 50], [238, 58]]} tone="gold" d={800} />
          <Arrow pts={[[168, 148], [178, 148]]} tone="gold" d={1100} dur={200} />
          <Token pts={[[168, 148], [238, 148], [238, 182]]} d={1200} dur={900} />
          <Text x={421} y={196} text={bi("never searched", "لم يُبحث فيها")} tone="muted" size={11} d={1300} />
          <Chip x={238} y={240} w={200} text={bi("no match in Clinic A", "لا نتيجة في العيادة A")} tone="danger" center d={1900} />
          <Mark x={354} y={240} ok={false} d={2100} />
        </>
      ) : (
        <>
          {CLINIC_X.map((x, i) => (
            <Arrow key={i} pts={[[91, 68], [91, 50], [x + 58, 50], [x + 58, 58]]} tone="gold" d={700 + i * 200} />
          ))}
          <Token pts={[[91, 68], [91, 50], [238, 50], [360, 50], [482, 50], [482, 143]]} d={900} dur={1600} />
          <Fade d={2300}>
            <Box x={424} y={130} w={116} h={26} r={0} label="Ali Hassan" mono size={11} tone="success" />
          </Fade>
          <Chip x={360} y={232} w={200} text={bi("found in Clinic C", "وُجد في العيادة C")} tone="success" center d={2500} />
          <Mark x={476} y={232} ok d={2700} />
        </>
      )}
    </Svg>
  );
}

const FEATURES = [bi("Search", "البحث"), bi("Patient lists", "قوائم المرضى"), bi("Medical history", "التاريخ الطبي"), bi("Cost reports", "تقارير التكلفة")];

function NfrCritical({ control }: { control: string }) {
  const met = control === "met";
  const spots = FEATURES.map((_, i) => [i % 2 ? 362 : 178, i < 2 ? 90 : 148] as const);
  return (
    <Svg>
      <Person x={64} y={96} label={bi("Clinic staff", "طاقم العيادة")} d={0} />
      <Box x={150} y={30} w={390} h={220} r={16} tone={met ? "success" : "danger"} d={100} />
      <Text x={345} y={52} text={bi("Availability: Mon–Fri, 08:30–17:30", "التوافر: من الاثنين إلى الجمعة، 08:30–17:30")} tone="heading" size={12} d={200} />
      {FEATURES.map((f, i) => (
        <Box key={i} x={spots[i][0]} y={spots[i][1]} w={150} h={44} label={f} size={12} tone="outline" d={300 + i * 120} />
      ))}
      {met ? null : (
        <Fade d={1300}>
          {FEATURES.map((f, i) => (
            <Box key={i} x={spots[i][0]} y={spots[i][1]} w={150} h={44} label={f} size={12} tone="muted" />
          ))}
        </Fade>
      )}
      {FEATURES.map((_, i) => (
        <Mark key={i} x={spots[i][0] + 146} y={spots[i][1] + 2} r={9} ok d={800 + i * 120} />
      ))}
      <Text
        x={345}
        y={220}
        text={met ? bi("downtime ≤ 5 s in any one day", "توقف لا يتجاوز 5 ثوانٍ في أي يوم") : bi("down Monday 10:00–12:00", "متوقف يوم الاثنين 10:00–12:00")}
        tone={met ? "success" : "danger"}
        size={12}
        d={1400}
      />
      {met ? (
        <>
          <Arrow pts={[[94, 124], [146, 124]]} tone="gold" d={1000} />
          <Chip x={64} y={206} w={116} text={bi("uses all four", "يستخدم الأربع")} tone="success" center d={1600} />
        </>
      ) : (
        <>
          <Arrow pts={[[94, 124], [146, 124]]} tone="danger" dashed d={1000} />
          <Mark x={120} y={106} ok={false} d={1500} />
          <Chip x={64} y={206} w={116} text={bi("can use none", "لا يستخدم أيًّا")} tone="danger" center d={1600} />
        </>
      )}
    </Svg>
  );
}

const CLASSES: { id: string; x: number; label: Bi; subs: Bi[]; example: Bi; source: Bi }[] = [
  {
    id: "product",
    x: 100,
    label: bi("Product", "متطلبات المنتج"),
    subs: [bi("Usability", "سهولة الاستخدام"), bi("Efficiency", "الكفاءة"), bi("Dependability", "الاعتمادية"), bi("Security", "الأمان")],
    example: bi("“Available Mon–Fri 08:30–17:30; downtime ≤ 5 s a day”", "«متاح من الاثنين إلى الجمعة 08:30–17:30، والتوقف لا يتجاوز 5 ثوانٍ يوميًا»"),
    source: bi("source: how the delivered product must behave", "المصدر: كيف يجب أن يتصرف المنتج المُسلَّم"),
  },
  {
    id: "organizational",
    x: 280,
    label: bi("Organizational", "المتطلبات التنظيمية"),
    subs: [bi("Environmental", "بيئية"), bi("Operational", "تشغيلية"), bi("Development", "تطويرية")],
    example: bi("“Users log in with their health authority identity card”", "«يسجّل المستخدمون الدخول ببطاقة الهوية الصادرة عن الهيئة الصحية»"),
    source: bi("source: the customer's policies and procedures", "المصدر: سياسات العميل وإجراءاته"),
  },
  {
    id: "external",
    x: 460,
    label: bi("External", "المتطلبات الخارجية"),
    subs: [bi("Regulatory", "رقابية"), bi("Ethical", "أخلاقية"), bi("Legislative", "تشريعية")],
    example: bi("“Implement the privacy provisions of HStan-03-2006-priv”", "«تنفيذ أحكام الخصوصية الواردة في HStan-03-2006-priv»"),
    source: bi("source: regulators, laws and ethics", "المصدر: الجهات الرقابية والقوانين والأخلاقيات"),
  },
];

function NfrTypes({ control }: { control: string }) {
  const sel = CLASSES.find((c) => c.id === control) ?? CLASSES[0];
  const chipW = 120;
  const gap = 10;
  const rowW = sel.subs.length * chipW + (sel.subs.length - 1) * gap;
  const left = 280 - rowW / 2;
  return (
    <Svg>
      <Box x={195} y={10} w={170} h={44} label={bi("Non-functional", "غير الوظيفية")} tone="navy" size={12.5} d={0} />
      <Arrow pts={[[280, 54], [280, 70]]} tone="faint" head={false} d={150} dur={200} />
      <Arrow pts={[[100, 70], [460, 70]]} tone="faint" head={false} d={250} dur={300} />
      {CLASSES.map((c) => (
        <Arrow key={c.id} pts={[[c.x, 70], [c.x, 86]]} tone="faint" head={false} d={450} dur={200} />
      ))}
      {CLASSES.map((c, i) => (
        <Box key={c.id} x={c.x - 85} y={88} w={170} h={44} label={c.label} size={12} tone={c.id === sel.id ? "gold" : "outline"} d={500 + i * 120} />
      ))}
      <Arrow pts={[[280, 54], [280, 70], [sel.x, 70], [sel.x, 86]]} tone="gold" head={false} d={900} dur={450} width={2.4} />
      <Arrow pts={[[sel.x, 134], [sel.x, 146]]} tone="gold" d={1200} dur={200} />
      {sel.subs.map((s, i) => (
        <Chip key={i} x={left + i * (chipW + gap)} y={166} w={chipW} text={s} tone="slate" d={1300 + i * 120} />
      ))}
      <Box x={20} y={198} w={520} h={68} label={sel.example} sub={sel.source} tone="outline" size={12} d={1800} />
    </Svg>
  );
}

const week = checkDowntime(TEST_WEEK, DOWNTIME_LIMIT);
const BASE = 226;
const SCALE = 14;
const BAR_X = [64, 128, 192, 256, 320];

function Measurable({ control }: { control: string }) {
  const m = control === "measurable";
  const limitY = BASE - DOWNTIME_LIMIT * SCALE;
  const worst = week.failing[0] ?? week.worst;
  return (
    <Svg>
      <Box
        x={20}
        y={10}
        w={520}
        h={46}
        label={
          m
            ? bi(`“Downtime in working hours shall not exceed ${DOWNTIME_LIMIT} s in any one day.”`, `«يجب ألا يتجاوز التوقف خلال ساعات العمل ${DOWNTIME_LIMIT} ثوانٍ في أي يوم».`)
            : bi("“The system shall be highly available.”", "«يجب أن يكون النظام عالي التوافر».")
        }
        tone={m ? "slate" : "warn"}
        size={12}
        d={0}
      />
      <Chip
        x={20}
        y={80}
        text={m ? bi(`metric: downtime per day ≤ ${DOWNTIME_LIMIT} s`, `المقياس: التوقف اليومي ≤ ${DOWNTIME_LIMIT} s`) : bi("measured: downtime per day (s)", "المقيس: التوقف اليومي (s)")}
        tone={m ? "gold" : "muted"}
        d={300}
      />
      <Arrow pts={[[34, BASE], [352, BASE]]} tone="faint" head={false} d={400} dur={400} />
      {week.days.map((day, i) => {
        const h = Math.max(day.downtime * SCALE, 2);
        const tone: Tone = m ? (day.ok ? "success" : "danger") : "slate";
        return (
          <g key={i}>
            <Box x={BAR_X[i] - 18} y={BASE - h} w={36} h={h} r={3} tone={tone} d={500 + i * 120} />
            <Text x={BAR_X[i]} y={BASE - h - 9} text={`${day.downtime}`} mono size={11.5} tone={m && !day.ok ? "danger" : "muted"} d={600 + i * 120} />
            <Text x={BAR_X[i]} y={242} text={day.day} size={11} tone="muted" d={500 + i * 120} />
          </g>
        );
      })}
      {m ? (
        <>
          <Arrow pts={[[34, limitY], [352, limitY]]} tone="gold" dashed head={false} d={1200} />
          <Text x={358} y={limitY} text={bi(`limit ${DOWNTIME_LIMIT} s`, `الحد ${DOWNTIME_LIMIT} s`)} anchor="start" tone="gold" size={11} d={1300} />
          <Box
            x={418}
            y={70}
            w={126}
            h={68}
            label={week.passed ? bi("Passes", "ينجح") : bi("Fails", "يُخفق")}
            sub={bi(`${worst.day.en}: ${worst.downtime} s > ${DOWNTIME_LIMIT} s`, `${worst.day.ar}: ${worst.downtime} > ${DOWNTIME_LIMIT}`)}
            tone={week.passed ? "success" : "danger"}
            size={13}
            d={1700}
          />
          <Mark x={540} y={72} ok={week.passed} d={1900} />
        </>
      ) : (
        <>
          <Text x={384} y={limitY} text="?" tone="danger" size={22} d={1200} />
          <Box x={418} y={70} w={126} h={68} label={bi("Pass or fail?", "نجاح أم إخفاق؟")} sub={bi("nothing to compare", "لا شيء للمقارنة")} tone="warn" size={12.5} d={1500} />
        </>
      )}
      <Person x={481} y={160} label={bi("Tester", "المختبِر")} d={1000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof frNfr>>({
  "fr-vs-nfr": FrVsNfr,
  "fr-behaviour": FrBehaviour,
  ambiguity: Ambiguity,
  "nfr-critical": NfrCritical,
  "nfr-types": NfrTypes,
  measurable: Measurable,
});
