"use client";

import type { why } from "@/lib/walkthroughs/software-engineering/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Unclear() {
  const known = [bi("Log in", "تسجيل الدخول"), bi("Search", "البحث"), bi("Cart", "سلة الشراء")];
  return (
    <Svg>
      <Text x={100} y={26} text={bi("Week 1", "الأسبوع 1")} tone="heading" size={12} d={0} />
      <Text x={280} y={26} text={bi("Week 4", "الأسبوع 4")} tone="heading" size={12} d={0} />
      <Text x={470} y={26} text={bi("Week 8", "الأسبوع 8")} tone="heading" size={12} d={0} />
      {known.map((k, i) => (
        <Box key={i} x={40} y={58 + i * 52} w={120} h={44} label={k} tone="outline" size={12} d={150 + i * 120} />
      ))}
      <Arrow pts={[[30, 240], [540, 240]]} tone="faint" d={200} dur={700} />
      {[100, 280, 470].map((x, i) => (
        <Arrow key={i} pts={[[x, 233], [x, 247]]} tone="faint" head={false} d={300} dur={200} />
      ))}
      <Token pts={[[100, 240], [470, 240]]} d={700} dur={2200} tone="navy" />
      <Box x={220} y={58} w={120} h={44} label={bi("Wish list", "قائمة الأمنيات")} tone="gold" size={12} d={1600} />
      <Text x={280} y={118} text={bi("discovered", "اكتُشف")} tone="gold" size={11} d={1700} />
      <Box x={400} y={58} w={140} h={44} label={bi("Cart + coupons", "السلة + القسائم")} tone="warn" size={12} d={2800} />
      <Text x={470} y={118} text={bi("changed", "تغيّر")} tone="danger" size={11} d={2900} />
      <Box x={400} y={146} w={140} h={44} label={bi("Reviews", "المراجعات")} tone="gold" size={12} d={3100} />
      <Text x={470} y={206} text={bi("discovered", "اكتُشف")} tone="gold" size={11} d={3200} />
    </Svg>
  );
}

const STAGES = [bi("Requirements", "المتطلبات"), bi("Design", "التصميم"), bi("Code", "كتابة الشيفرة"), bi("Test", "الاختبار"), bi("Deliver", "التسليم")];
const sx = (i: number) => 14 + i * 106;
const sy = (i: number) => 50 + i * 38;

function Rework({ control }: { control: string }) {
  const late = control === "late";
  const redo = late ? 4 : 1;
  return (
    <Svg>
      {STAGES.map((s, i) => (
        <g key={i}>
          <Box x={sx(i)} y={sy(i)} w={100} h={44} label={s} tone="slate" size={12} d={i * 140} />
          {i < STAGES.length - 1 ? (
            <Arrow
              pts={[
                [sx(i) + 100, sy(i) + 22],
                [sx(i + 1) + 50, sy(i) + 22],
                [sx(i + 1) + 50, sy(i + 1) - 2],
              ]}
              tone="muted"
              d={100 + i * 140}
              dur={300}
            />
          ) : null}
        </g>
      ))}
      {late ? (
        <>
          <Chip x={460} y={118} text={bi("change!", "تغيير!")} tone="danger" center d={800} />
          <Arrow pts={[[452, 137], [424, 162]]} tone="danger" d={900} dur={250} />
          <Arrow pts={[[360, 162], [360, 26], [64, 26], [64, 48]]} tone="danger" dashed d={1200} label={bi("back to the start", "العودة إلى البداية")} labelAt={[250, 42]} labelTone="danger" />
          <Token pts={[[360, 162], [360, 26], [64, 26], [64, 48]]} d={1200} dur={1100} tone="danger" />
        </>
      ) : (
        <>
          <Chip x={170} y={28} text={bi("change!", "تغيير!")} tone="warn" center d={800} />
          <Arrow pts={[[136, 38], [116, 52]]} tone="gold" d={900} dur={250} />
        </>
      )}
      {STAGES.slice(0, redo).map((s, i) => (
        <Fade key={i} d={(late ? 2300 : 1200) + i * 180}>
          <Box x={sx(i)} y={sy(i)} w={100} h={44} label={s} tone="warn" size={12} />
        </Fade>
      ))}
      <Text
        x={130}
        y={232}
        text={late ? bi("4 stages redone", "إعادة 4 مراحل") : bi("1 stage updated", "تحديث مرحلة واحدة")}
        tone={late ? "danger" : "success"}
        size={12.5}
        d={late ? 3100 : 1500}
      />
      <Mark x={late ? 60 : 50} y={232} ok={!late} d={late ? 3200 : 1600} />
    </Svg>
  );
}

const wx = (week: number) => 50 + week * 38;

function Feedback({ control }: { control: string }) {
  const often = control === "often";
  const weeks = often ? [2, 4, 6, 8, 10, 12] : [12];
  const at = (week: number) => 400 + (week / 12) * 2400;
  return (
    <Svg>
      <Text x={14} y={30} text={bi("Customer feedback", "ملاحظات العميل")} anchor="start" tone="muted" size={11.5} d={0} />
      <Arrow pts={[[40, 176], [536, 176]]} tone="faint" d={100} dur={600} />
      {Array.from({ length: 13 }, (_, w) => (
        <g key={w}>
          <Arrow pts={[[wx(w), 172], [wx(w), 180]]} tone="faint" head={false} d={200} dur={150} />
          {w % 2 === 0 ? <Text x={wx(w)} y={192} text={`${w}`} mono size={10.5} tone="muted" d={200} /> : null}
        </g>
      ))}
      <Text x={536} y={212} text={bi("weeks", "الأسابيع")} anchor="end" tone="muted" size={11} d={200} />
      <Token pts={[[wx(0), 176], [wx(12), 176]]} d={400} dur={2400} tone="navy" />
      {!often ? (
        <>
          <Arrow pts={[[wx(0), 150], [wx(12) - 22, 150]]} tone="danger" dashed head={false} d={500} />
          <Text x={268} y={118} text={bi("nothing to try until week 12", "لا شيء للتجربة حتى الأسبوع 12")} tone="danger" size={11.5} d={700} />
        </>
      ) : null}
      {weeks.map((w, i) => (
        <g key={w}>
          <Box x={wx(w) - 18} y={120} w={36} h={36} r={6} label={`v${i + 1}`} mono size={11.5} tone="gold" d={at(w)} />
          <Arrow pts={[[wx(w), 118], [wx(w), 102]]} tone="gold" d={at(w) + 200} dur={250} />
          <Person x={wx(w)} y={56} tone="slate" d={at(w) + 300} />
        </g>
      ))}
      <Text
        x={280}
        y={248}
        text={often ? bi("6 deliveries: feedback every 2 weeks", "6 تسليمات: ملاحظات كل أسبوعين") : bi("1 delivery: feedback only at the end", "تسليم واحد: الملاحظات في النهاية فقط")}
        tone={often ? "success" : "danger"}
        size={12.5}
        d={3100}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof why>>({
  unclear: Unclear,
  rework: Rework,
  feedback: Feedback,
});
