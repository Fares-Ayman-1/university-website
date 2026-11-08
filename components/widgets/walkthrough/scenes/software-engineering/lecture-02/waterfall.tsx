"use client";

import type { waterfall } from "@/lib/walkthroughs/software-engineering/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Mark, Svg, Text, Token, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const PHASES = [bi("Requirements", "المتطلبات"), bi("Design", "التصميم"), bi("Implementation", "التنفيذ"), bi("Testing", "الاختبار"), bi("Operation", "التشغيل")];

/** The five phases as a staircase, like the slide: phase i at (20 + 100i, 40 + 46i), 130 × 44. */
const step = (i: number) => ({ x: 20 + 100 * i, y: 40 + 46 * i });

function Staircase({ pace, docTone = "outline" }: { pace: number; docTone?: Tone }) {
  return (
    <>
      {PHASES.map((label, i) => {
        const { x, y } = step(i);
        const d = i * pace;
        return (
          <g key={i}>
            <Box x={x} y={y} w={130} h={44} label={label} tone="navy" d={d} />
            {i < 4 ? (
              <>
                <Doc x={x + 178} y={y + 4} w={28} h={36} tone={docTone} d={d + pace * 0.4} />
                <Mark x={x + 192} y={y + 26} ok r={7} d={d + pace * 0.55} />
                <Arrow pts={[[x + 132, y + 22], [x + 165, y + 22], [x + 165, y + 45]]} d={d + pace * 0.6} dur={pace * 0.35} />
              </>
            ) : null}
          </g>
        );
      })}
      <Doc x={398} y={40} w={22} h={28} tone="outline" d={0} />
      <Text x={428} y={50} text={bi("signed-off document", "وثيقة مُصادَق عليها")} anchor="start" size={11} tone="muted" d={0} />
    </>
  );
}

function Cascade() {
  return (
    <Svg>
      <Staircase pace={500} />
      <Text x={110} y={226} text={bi("each phase waits for the one above", "كل مرحلة تنتظر المرحلة التي فوقها")} size={11.5} tone="muted" d={2400} />
    </Svg>
  );
}

function Feedback({ control }: { control: string }) {
  const practice = control === "practice";
  return (
    <Svg>
      {/* Under the boxes, so it shows only on the arrows between phases. */}
      {practice ? (
        <Token pts={[[418, 246], [150, 246], [150, 108]]} tone="danger" d={1900} dur={1200} />
      ) : (
        <Token pts={[[85, 62], [185, 62], [185, 108], [285, 108], [285, 154], [385, 154], [385, 200], [485, 200], [485, 246]]} d={900} dur={3200} />
      )}
      <Staircase pace={180} />
      {practice ? (
        <>
          <Arrow pts={[[418, 246], [50, 246], [50, 86]]} tone="danger" d={1100} dur={700} />
          <Arrow pts={[[150, 246], [150, 132]]} tone="danger" d={1500} dur={300} />
          <Arrow pts={[[250, 246], [250, 178]]} tone="danger" d={1500} dur={300} />
          <Arrow pts={[[350, 246], [350, 224]]} tone="danger" d={1500} dur={300} />
          {[0, 1].map((i) => (
            <Fade key={i} d={2900 + i * 200}>
              <Doc x={step(i).x + 178} y={step(i).y + 4} w={28} h={36} tone="warn" />
            </Fade>
          ))}
          <Text x={540} y={100} text={bi("going back: re-approve documents", "العودة تعني إعادة اعتماد الوثائق")} anchor="end" size={11} tone="danger" d={3100} />
        </>
      ) : (
        <Text x={110} y={226} text={bi("one way: down only", "اتجاه واحد: إلى الأسفل فقط")} size={11.5} tone="muted" d={1200} />
      )}
    </Svg>
  );
}

const ROW = (i: number) => 30 + 100 * i;

function Visibility({ control }: { control: string }) {
  const manager = control === "manager";
  return (
    <Svg>
      {PHASES.map((label, i) => (
        <Box key={i} x={ROW(i)} y={44} w={96} h={44} label={label} tone="navy" size={11.5} d={i * 120} />
      ))}
      {manager ? (
        <>
          {PHASES.map((_, i) => (
            <g key={i}>
              <Doc x={ROW(i) + 32} y={104} w={32} h={40} tone="outline" d={600 + i * 250} />
              <Mark x={ROW(i) + 48} y={160} ok r={8} d={750 + i * 250} />
            </g>
          ))}
          <Arrow pts={[[30, 184], [526, 184]]} tone="success" head={false} width={3} d={700} dur={1300} />
          <Token pts={[[30, 184], [526, 184]]} tone="success" d={700} dur={1300} />
          <Text x={278} y={204} text={bi("progress is visible against the plan", "التقدم مرئي مقارنةً بالخطة")} tone="success" size={11.5} d={1900} />
          <Text x={278} y={246} text={bi("but writing and approving every document is costly", "لكن كتابة كل وثيقة واعتمادها مكلفان")} tone="muted" size={11} d={2300} />
        </>
      ) : (
        <>
          <Box x={30} y={108} w={296} h={48} label={bi("nothing the customer can try", "لا شيء يمكن للعميل تجربته")} tone="muted" dashed size={12} d={500} />
          <Box x={330} y={108} w={196} h={48} label={bi("working software", "برمجيات عاملة")} tone="gold" size={12} d={1300} />
          <Arrow pts={[[30, 252], [250, 250], [350, 244], [430, 230], [490, 212], [526, 196]]} tone="danger" head={false} width={2.4} d={700} dur={1600} />
          <Text x={60} y={226} text={bi("risk", "المخاطر")} anchor="start" tone="danger" size={11.5} d={900} />
          <Text x={428} y={178} text={bi("value arrives only here", "القيمة تصل هنا فقط")} tone="gold" size={11} d={1700} />
        </>
      )}
    </Svg>
  );
}

function LateChange({ control }: { control: string }) {
  const late = control === "late";
  const now = late ? 3 : 0;
  const tone = (i: number): Tone => (i === now ? "gold" : i < now ? "slate" : "muted");
  const artefacts = [
    { x: ROW(0) + 30, label: bi("spec", "التوصيف") },
    { x: ROW(1) + 30, label: bi("design", "التصميم") },
    { x: ROW(2) + 30, label: bi("code", "الشيفرة") },
  ];
  return (
    <Svg>
      {PHASES.map((label, i) => (
        <Box key={i} x={ROW(i)} y={46} w={96} h={44} label={label} tone={tone(i)} size={11.5} d={i * 100} />
      ))}
      {artefacts.map((a, i) =>
        late || i === 0 ? (
          <Doc key={i} x={a.x} y={104} w={40} h={46} label={a.label} tone="outline" size={10} d={400 + i * 120} />
        ) : (
          <Box key={i} x={a.x} y={108} w={40} h={42} r={4} tone="ghost" dashed d={400 + i * 120} />
        ),
      )}
      {late ? null : <Text x={ROW(1) + 98} y={170} text={bi("not written yet", "لم تُكتب بعد")} size={11} tone="muted" d={600} />}
      <Chip x={late ? 378 : 78} y={186} text={bi("change", "تغيير")} tone="danger" center d={900} />
      <Arrow pts={late ? [[378, 166], [378, 92]] : [[78, 166], [78, 152]]} tone="danger" d={1100} dur={late ? 400 : 200} />
      {late ? <Arrow pts={[[340, 160], [44, 160]]} tone="danger" dashed d={1500} /> : null}
      {(late ? [0, 1, 2] : [0]).map((i) => (
        <Fade key={i} d={1700 + (2 - i) * 150}>
          <Doc x={artefacts[i].x} y={104} w={40} h={46} label={late ? bi("redo", "يُعاد") : bi("edit", "تعديل")} tone={late ? "danger" : "warn"} size={10} />
        </Fade>
      ))}
      <Text x={30} y={222} text={bi("work to redo", "العمل المطلوب إعادته")} anchor="start" size={11.5} tone="heading" d={2000} />
      <Box x={170} y={214} w={late ? 300 : 36} h={18} r={4} tone={late ? "danger" : "warn"} d={2200} />
      <Text
        x={late ? 480 : 216}
        y={223}
        text={late ? bi("3 phases", "3 مراحل") : bi("1 document", "وثيقة واحدة")}
        anchor="start"
        size={11.5}
        tone={late ? "danger" : "success"}
        d={2400}
      />
    </Svg>
  );
}

function When() {
  const conditions = [bi("Requirements well understood", "المتطلبات مفهومة جيدًا"), bi("Requirements unlikely to change", "المتطلبات لن تتغير على الأرجح"), bi("Delivery time not critical", "وقت التسليم غير حرج")];
  const sites = ["A", "B", "C"];
  return (
    <Svg>
      <Text x={145} y={22} text={bi("Use it only when…", "استخدمه فقط عندما…")} size={12.5} tone="heading" d={0} />
      {conditions.map((c, i) => (
        <g key={i}>
          <Box x={20} y={50 + i * 56} w={250} h={48} label={c} tone="outline" size={12} d={200 + i * 250} />
          <Mark x={288} y={74 + i * 56} ok r={10} d={400 + i * 250} />
        </g>
      ))}
      <Text x={145} y={232} text={bi("all three must hold", "يجب أن تتحقق الثلاثة")} size={11} tone="muted" d={1200} />
      <Text x={440} y={22} text={bi("Mostly used for…", "يُستخدم غالبًا في…")} size={12.5} tone="heading" d={1000} />
      <Doc x={392} y={46} w={96} h={80} label={bi("Shared plan", "الخطة المشتركة")} tone="gold" d={1200} />
      {sites.map((s, i) => {
        const cx = 355 + i * 80;
        return (
          <g key={s}>
            <Arrow pts={[[440, 128], [cx, 182]]} tone="slate" d={1500 + i * 120} dur={350} />
            <Token pts={[[440, 128], [cx, 208]]} tone="navy" r={5} d={1900 + i * 120} dur={700} />
            <Box x={cx - 35} y={186} w={70} h={44} label={bi(`Site ${s}`, `الموقع ${s}`)} tone="slate" size={12} d={1400 + i * 120} />
          </g>
        );
      })}
      <Text x={435} y={250} text={bi("large system, several sites", "نظام كبير وعدة مواقع")} size={11} tone="muted" d={2200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof waterfall>>({
  cascade: Cascade,
  feedback: Feedback,
  visibility: Visibility,
  "late-change": LateChange,
  when: When,
});
