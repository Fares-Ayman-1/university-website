"use client";

import type { incremental } from "@/lib/walkthroughs/software-engineering/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Mark, Person, Svg, Text, Token, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Versions() {
  return (
    <Svg>
      {/* Tokens first: they slip out from under the activities and into the versions. */}
      <Token pts={[[150, 162], [200, 162]]} d={700} dur={500} />
      <Token pts={[[320, 98], [390, 98]]} d={1500} dur={700} />
      <Token pts={[[320, 162], [390, 162]]} d={2100} dur={700} />
      <Token pts={[[320, 226], [390, 226]]} d={2700} dur={700} />
      <Box x={16} y={138} w={136} h={48} label={bi("Outline description", "وصف مبدئي")} tone="slate" size={12} d={0} />
      <Arrow pts={[[154, 162], [194, 162]]} d={300} dur={300} />
      <Box x={176} y={30} w={170} h={232} r={12} tone="ghost" dashed d={200} />
      <Text x={261} y={46} text={bi("Concurrent activities", "أنشطة متزامنة")} size={11.5} tone="muted" d={200} />
      <Box x={196} y={76} w={130} h={44} label={bi("Specification", "التوصيف")} tone="navy" size={12} d={400} />
      <Box x={196} y={140} w={130} h={44} label={bi("Development", "التطوير")} tone="navy" size={12} d={500} />
      <Box x={196} y={204} w={130} h={44} label={bi("Validation", "التحقق من الصلاحية")} tone="navy" size={12} d={600} />
      <Arrow pts={[[261, 122], [261, 138]]} both d={800} dur={200} />
      <Arrow pts={[[261, 186], [261, 202]]} both d={800} dur={200} />
      <Arrow pts={[[348, 98], [384, 98]]} both d={1300} dur={250} />
      <Arrow pts={[[348, 162], [384, 162]]} both d={1900} dur={250} />
      <Arrow pts={[[348, 226], [384, 226]]} d={2500} dur={250} />
      <Box x={386} y={76} w={146} h={44} label={bi("Initial version", "النسخة الأولية")} tone="outline" size={12} d={1600} />
      <Box x={394} y={146} w={146} h={44} tone="outline" d={2200} />
      <Box x={390} y={142} w={146} h={44} tone="outline" d={2200} />
      <Box x={386} y={138} w={146} h={44} label={bi("Intermediate versions", "النسخ الوسيطة")} tone="outline" size={12} d={2200} />
      <Box x={386} y={204} w={146} h={44} label={bi("Final version", "النسخة النهائية")} tone="success" size={12} d={2800} />
    </Svg>
  );
}

function Evolve() {
  const cols = [100, 280, 460];
  const blocks = (n: number, cx: number, d: number) =>
    Array.from({ length: n }, (_, k) => <Box key={k} x={cx - 55} y={172 - k * 30} w={110} h={28} r={6} label={`F${k + 1}`} mono size={11} tone={k === n - 1 ? "gold" : "slate"} d={d + k * 80} />);
  const people = [190, 370];
  return (
    <Svg>
      {cols.map((cx, i) => (
        <g key={i}>
          {blocks(i + 1, cx, i * 1000)}
          <Text x={cx} y={218} text={`v${i + 1}`} mono size={12.5} tone="heading" d={i * 1000} />
        </g>
      ))}
      {people.map((px, i) => (
        <g key={i}>
          <Arrow pts={[[px - 70, 168 - i * 30], [px - 14, 64]]} tone="slate" d={i * 1000 + 300} dur={350} />
          <Person x={px} y={40} label={bi("Users", "المستخدمون")} d={i * 1000 + 450} />
          <Arrow pts={[[px + 16, 64], [px + 60, 138 - i * 28]]} tone="gold" d={i * 1000 + 700} dur={350} />
        </g>
      ))}
      <Text x={280} y={248} text={bi("each version adds functionality to the previous one", "كل نسخة تضيف وظائف إلى سابقتها")} size={11.5} tone="muted" d={2300} />
    </Svg>
  );
}

const INCREMENTS = (i: number) => 20 + i * 106;

function ChangeCost({ control }: { control: string }) {
  if (control === "incremental") {
    const incs: { tone: Tone; sub: ReturnType<typeof bi> }[] = [
      { tone: "success", sub: bi("done", "انتهت") },
      { tone: "success", sub: bi("done", "انتهت") },
      { tone: "gold", sub: bi("now", "الحالية") },
      { tone: "ghost", sub: bi("later", "لاحقًا") },
      { tone: "ghost", sub: bi("later", "لاحقًا") },
    ];
    return (
      <Svg>
        {incs.map((inc, i) => (
          <Box key={i} x={INCREMENTS(i)} y={50} w={96} h={68} label={bi(`Increment ${i + 1}`, `الزيادة ${i + 1}`)} sub={inc.sub} tone={inc.tone} dashed={inc.tone === "ghost"} size={11.5} d={i * 150} />
        ))}
        <Chip x={280} y={162} text={bi("needs change", "تغيّر الاحتياجات")} tone="danger" center d={900} />
        <Arrow pts={[[280, 142], [280, 122]]} tone="danger" d={1100} dur={250} />
        <Fade d={1400}>
          <Box x={INCREMENTS(2)} y={50} w={96} h={68} label={bi("Increment 3", "الزيادة 3")} sub={bi("adjusted", "تُعدَّل")} tone="warn" size={11.5} />
        </Fade>
        <Arrow pts={[[336, 162], [376, 162], [376, 122]]} tone="gold" d={1700} dur={350} />
        <Fade d={2000}>
          <Box x={INCREMENTS(3)} y={50} w={96} h={68} label={bi("Increment 4", "الزيادة 4")} sub={bi("+ new", "+ جديد")} tone="outline" size={11.5} />
        </Fade>
        <Text x={30} y={208} text={bi("analysis and documentation to redo", "التحليل والتوثيق المطلوب إعادتهما")} anchor="start" size={11.5} tone="heading" d={2200} />
        <Box x={30} y={234} w={70} h={18} r={4} tone="warn" d={2400} />
        <Text x={110} y={243} text={bi("a little", "قليل")} anchor="start" size={11.5} tone="success" d={2600} />
      </Svg>
    );
  }
  const docs = [
    { x: 40, label: bi("Requirements", "المتطلبات"), sub: bi("all of them", "كلها") },
    { x: 180, label: bi("Design", "التصميم"), sub: bi("whole system", "النظام كله") },
    { x: 320, label: bi("Code", "الشيفرة"), sub: bi("half written", "نصفها مكتوب") },
  ];
  return (
    <Svg>
      {docs.map((doc, i) => (
        <Doc key={i} x={doc.x} y={44} w={110} h={96} label={doc.label} sub={doc.sub} tone="outline" d={i * 200} />
      ))}
      <Chip x={496} y={92} text={bi("needs change", "تغيّر الاحتياجات")} tone="danger" center d={800} />
      <Arrow pts={[[492, 114], [492, 162], [96, 162], [96, 142]]} tone="danger" d={1000} dur={700} />
      <Arrow pts={[[236, 162], [236, 142]]} tone="danger" d={1500} dur={200} />
      <Arrow pts={[[376, 162], [376, 142]]} tone="danger" d={1500} dur={200} />
      {docs.map((doc, i) => (
        <Fade key={i} d={1700 + i * 150}>
          <Doc x={doc.x} y={44} w={110} h={96} label={doc.label} sub={bi("redo", "يُعاد")} tone="danger" />
        </Fade>
      ))}
      <Text x={30} y={208} text={bi("analysis and documentation to redo", "التحليل والتوثيق المطلوب إعادتهما")} anchor="start" size={11.5} tone="heading" d={2200} />
      <Box x={30} y={234} w={400} h={18} r={4} tone="danger" d={2400} />
      <Text x={440} y={243} text={bi("a lot", "كثير")} anchor="start" size={11.5} tone="danger" d={2600} />
    </Svg>
  );
}

function Value({ control }: { control: string }) {
  const inc = control === "incremental";
  const valueChip = (x: number, d: number) => <Chip x={x} y={inc ? 140 : 134} w={70} text={bi("value", "قيمة")} tone="gold" center d={d} />;
  const risk: readonly Pt[] = inc
    ? [[20, 256], [90, 244], [100, 256], [265, 244], [275, 256], [440, 244], [450, 256], [530, 252]]
    : [[20, 258], [300, 256], [400, 244], [450, 222], [470, 190]];
  return (
    <Svg>
      <Text x={280} y={18} text={inc ? bi("Incremental: a release every cycle", "التزايدي: إصدار في كل دورة") : bi("Waterfall: one release, at the end", "الشلال: إصدار واحد في النهاية")} size={12} tone="heading" d={0} />
      {inc ? (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <Box x={20 + i * 175} y={44} w={150} h={68} label={bi(`Cycle ${i + 1}`, `الدورة ${i + 1}`)} sub={bi("define · build · release", "تحديد · بناء · إصدار")} tone="navy" size={12} d={i * 500} />
              {i < 2 ? <Arrow pts={[[172 + i * 175, 78], [193 + i * 175, 78]]} d={i * 500 + 400} dur={200} /> : null}
              {valueChip(95 + i * 175, i * 500 + 350)}
            </g>
          ))}
        </>
      ) : (
        <>
          <Box x={20} y={44} w={140} h={44} label={bi("Define", "التحديد")} tone="navy" d={0} />
          <Arrow pts={[[162, 66], [178, 66]]} d={300} dur={200} />
          <Box x={180} y={44} w={160} h={44} label={bi("Build", "البناء")} tone="navy" d={400} />
          <Arrow pts={[[342, 66], [358, 66]]} d={700} dur={200} />
          <Box x={360} y={44} w={110} h={44} label={bi("Release", "الإصدار")} tone="navy" d={800} />
          {valueChip(415, 1300)}
        </>
      )}
      <Arrow pts={[[20, 172], [534, 172]]} tone="faint" d={200} dur={900} />
      <Text x={534} y={188} text={bi("time", "الزمن")} anchor="end" size={11} tone="muted" d={600} />
      <Arrow pts={risk} tone="danger" head={false} width={2.4} d={1200} dur={1400} />
      <Text x={40} y={inc ? 212 : 226} text={bi("risk", "المخاطر")} anchor="start" size={11.5} tone="danger" d={1400} />
      <Text x={inc ? 360 : 300} y={inc ? 212 : 210} text={inc ? bi("stays low", "تبقى منخفضة") : bi("grows until release", "تتزايد حتى الإصدار")} size={11} tone="danger" d={2400} />
    </Svg>
  );
}

function Visibility() {
  const xs = [0, 1, 2, 3, 4, 5].map((i) => 24 + i * 70);
  return (
    <Svg>
      <Text x={20} y={52} text={bi("documents", "الوثائق")} anchor="start" size={11} tone="muted" d={0} />
      {xs.map((x, i) => (
        <g key={i}>
          <Box x={x} y={150} w={56} h={34} r={6} label={`v${i + 1}`} mono size={12} tone={i === 5 ? "gold" : "slate"} d={200 + i * 220} />
          {i < 2 ? (
            <>
              <Doc x={x + 12} y={84} w={32} h={42} tone="outline" d={350 + i * 220} />
              <Mark x={x + 28} y={136} ok r={7} d={450 + i * 220} />
            </>
          ) : (
            <Box x={x + 12} y={84} w={32} h={42} r={3} label="?" tone="ghost" dashed size={14} d={350 + i * 220} />
          )}
        </g>
      ))}
      <Arrow pts={[[24, 200], [440, 200]]} tone="faint" d={200} dur={1300} />
      <Text x={232} y={218} text={bi("versions come out quickly", "النسخ تصدر بسرعة")} size={11} tone="muted" d={900} />
      <Text x={500} y={70} text={bi("Where are we?", "أين وصلنا؟")} size={11.5} tone="heading" d={1600} />
      <Person x={500} y={104} label={bi("Manager", "المدير")} d={1500} />
      <Text x={232} y={254} text={bi("the documents fall behind the versions", "الوثائق تتأخر عن النسخ")} size={11.5} tone="danger" d={2000} />
    </Svg>
  );
}

const MODULES = [0, 1, 2, 3].map((i) => 30 + i * 80);
const TANGLED: [number, number][] = [
  [0, 5],
  [1, 4],
  [1, 6],
  [2, 4],
  [2, 7],
  [3, 5],
  [3, 4],
  [0, 7],
  [2, 5],
  [3, 6],
];
const COST = { none: [18, 36, 66, 110], refactor: [18, 22, 26, 30] };

function Structure({ control }: { control: string }) {
  const clean = control === "refactor";
  const mod = (k: number) => ({ cx: MODULES[k % 4] + 28, top: k < 4 ? 56 : 176 });
  // Module k (0–7) arrives with increment (k % 4) + 1.
  const at = (k: number) => 200 + (k % 4) * 450;
  const edges: [number, number][] = clean ? [0, 1, 2, 3].map((i) => [i, i + 4]) : TANGLED;
  return (
    <Svg>
      {edges.map(([a, b], i) => {
        const A = mod(a);
        const B = mod(b);
        return <Arrow key={i} pts={[[A.cx, A.top + 30], [B.cx, B.top]]} tone={clean ? "success" : "danger"} head={false} width={1.4} d={Math.max(at(a), at(b)) + 200} dur={300} />;
      })}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const m = mod(k);
        return <Box key={k} x={m.cx - 28} y={m.top} w={56} h={30} r={6} label={`M${k + 1}`} mono size={11} tone="slate" d={at(k)} />;
      })}
      {[0, 1, 2, 3].map((i) => (
        <Text key={i} x={MODULES[i] + 28} y={232} text={bi(`increment ${i + 1}`, `الزيادة ${i + 1}`)} size={10.5} tone="muted" d={at(i)} />
      ))}
      <Arrow pts={[[356, 30], [356, 250]]} tone="faint" dashed head={false} d={0} />
      <Text x={455} y={36} text={bi("cost of the next change", "تكلفة التغيير التالي")} size={11.5} tone="heading" d={0} />
      <Arrow pts={[[372, 214], [540, 214]]} tone="faint" head={false} d={0} />
      {(clean ? COST.refactor : COST.none).map((h, i) => (
        <g key={i}>
          <Box x={384 + i * 40} y={214 - h} w={28} h={h} r={3} tone={clean ? "success" : "danger"} d={at(i) + 300} />
          <Text x={398 + i * 40} y={228} text={`${i + 1}`} mono size={11} tone="muted" d={at(i) + 300} />
        </g>
      ))}
      <Text x={456} y={252} text={bi("after increment", "بعد الزيادة")} size={11} tone="muted" d={300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof incremental>>({
  versions: Versions,
  evolve: Evolve,
  "change-cost": ChangeCost,
  value: Value,
  visibility: Visibility,
  structure: Structure,
});
