"use client";

import type { whatIsAi } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

type Quadrant = { id: string; row: 0 | 1; col: 0 | 1; label: Bi; tag: Bi; ideas: readonly Bi[] };

const QUADRANTS: readonly Quadrant[] = [
  {
    id: "think-human",
    row: 0,
    col: 0,
    label: bi("Thinking humanly", "التفكير بشكل بشري"),
    tag: bi("Cognitive modelling", "النمذجة المعرفية"),
    ideas: [bi("theories of the mind", "نظريات عن العقل"), bi("psychology", "علم النفس"), bi("neuroscience", "علم الأعصاب")],
  },
  {
    id: "think-rational",
    row: 0,
    col: 1,
    label: bi("Thinking rationally", "التفكير بعقلانية"),
    tag: bi("Laws of thought", "قوانين التفكير"),
    ideas: [bi("correct logic", "منطق صحيح"), bi("valid conclusions", "استنتاجات سليمة"), bi("certain knowledge", "معرفة يقينية")],
  },
  {
    id: "act-human",
    row: 1,
    col: 0,
    label: bi("Acting humanly", "التصرف بشكل بشري"),
    tag: bi("Turing test", "اختبار تورنغ"),
    ideas: [bi("language", "اللغة"), bi("knowledge", "المعرفة"), bi("reasoning", "الاستدلال"), bi("learning", "التعلّم")],
  },
  {
    id: "act-rational",
    row: 1,
    col: 1,
    label: bi("Acting rationally", "التصرف بعقلانية"),
    tag: bi("Rational agent", "الوكيل العقلاني"),
    ideas: [bi("the right thing", "الشيء الصحيح"), bi("best expected outcome", "أفضل نتيجة متوقَّعة"), bi("this course", "هذا المقرر")],
  },
];

const GX = [112, 262];
const GY = [60, 158];
const CW = 140;
const CH = 88;

function Axes({ control }: { control: string }) {
  const chosen = QUADRANTS.find((q) => q.id === control) ?? QUADRANTS[0];
  return (
    <Svg>
      <Text x={GX[0] + CW / 2} y={24} text={bi("Like humans", "مثل البشر")} tone="heading" size={12} d={0} />
      <Text x={GX[1] + CW / 2} y={24} text={bi("Rationally", "بعقلانية")} tone="heading" size={12} d={100} />
      <Text x={56} y={GY[0] + CH / 2 - 6} text={bi("Thinking", "التفكير")} tone="heading" size={12} d={200} />
      <Text x={56} y={GY[1] + CH / 2 - 6} text={bi("Acting", "التصرف")} tone="heading" size={12} d={300} />
      {QUADRANTS.map((q, i) => (
        <Box key={q.id} x={GX[q.col]} y={GY[q.row]} w={CW} h={CH} label={q.label} sub={q.tag} tone="outline" size={12} subSize={10.5} d={300 + i * 120} />
      ))}
      <Fade d={850}>
        <Box x={GX[chosen.col]} y={GY[chosen.row]} w={CW} h={CH} label={chosen.label} sub={chosen.tag} tone="gold" size={12} subSize={10.5} />
      </Fade>
      <Text x={482} y={24} text={bi("Key ideas", "أفكار رئيسية")} tone="gold" size={12} d={1000} />
      {chosen.ideas.map((idea, i) => (
        <Chip key={`${chosen.id}-${i}`} x={482} y={78 + i * 50} w={132} text={idea} tone={chosen.id === "act-rational" && i === 2 ? "gold" : "outline"} size={10.5} center d={1100 + i * 160} />
      ))}
    </Svg>
  );
}

function Turing({ control }: { control: string }) {
  const machine = control === "machine";
  return (
    <Svg>
      <Person x={56} y={86} label={bi("Interrogator", "المُحاوِر")} d={0} />
      <Box x={112} y={52} w={256} h={48} label={bi("Q: What did you have for breakfast?", "س: ماذا تناولت على الفطور؟")} tone="outline" size={11.5} d={200} />
      <Arrow pts={[[370, 76], [400, 76]]} tone="slate" d={500} dur={250} />
      <Token pts={[[112, 76], [400, 76]]} d={500} dur={700} tone="navy" />
      <Box x={402} y={50} w={14} h={214} r={4} tone="muted" d={100} />
      <Text x={409} y={22} text={bi("wall", "جدار")} tone="muted" size={10.5} d={200} />
      {machine ? (
        <Box x={434} y={92} w={104} h={56} label={bi("Machine", "آلة")} sub="AI" tone="navy" d={300} />
      ) : (
        <Person x={486} y={86} label={bi("Person", "إنسان")} tone="outline" d={300} />
      )}
      <Arrow pts={[[400, 140], [370, 140]]} tone="slate" d={1300} dur={250} />
      <Token pts={[[400, 140], [112, 140]]} d={1300} dur={700} tone={machine ? "gold" : "navy"} />
      <Box x={112} y={116} w={256} h={48} label={bi("A: Just tea, I was running late.", "ج: الشاي فقط، فقد كنت متأخرًا.")} tone="slate" size={11.5} d={1700} />
      <Chip x={240} y={200} text={bi("Person or machine? Can't tell.", "إنسان أم آلة؟ لا يمكن التمييز.")} tone="outline" size={11} center d={2100} />
      {machine ? (
        <>
          <Chip x={240} y={250} text={bi("The machine passes", "نجحت الآلة في الاختبار")} tone="success" size={11} center d={2400} />
          <Mark x={334} y={250} ok d={2600} />
        </>
      ) : (
        <Chip x={240} y={250} text={bi("A person wrote it this time", "كتبها إنسان هذه المرة")} tone="muted" size={11} center d={2400} />
      )}
    </Svg>
  );
}

function Laws({ control }: { control: string }) {
  const certain = control === "certain";
  const premises = certain
    ? [bi("If it rains, the street gets wet", "إذا أمطرت ابتلّ الشارع"), bi("It is raining", "إنها تمطر")]
    : [bi("Clouds often bring rain", "الغيوم كثيرًا ما تجلب المطر"), bi("There are clouds", "توجد غيوم")];
  return (
    <Svg>
      <Text x={140} y={24} text={bi("Premises", "المقدّمات")} tone="heading" size={12} d={0} />
      <Text x={486} y={24} text={bi("Conclusion", "الاستنتاج")} tone="heading" size={12} d={0} />
      {premises.map((p, i) => (
        <Box key={`${control}-${i}`} x={20} y={56 + i * 72} w={240} h={52} label={p} tone="outline" size={12} d={100 + i * 200} />
      ))}
      <Arrow pts={[[262, 82], [300, 110]]} tone="slate" d={500} dur={300} />
      <Arrow pts={[[262, 154], [300, 126]]} tone="slate" d={600} dur={300} />
      <Box x={302} y={92} w={96} h={52} label={bi("Logic", "المنطق")} tone="navy" d={700} />
      <Arrow pts={[[400, 118], [424, 118]]} tone={certain ? "success" : "danger"} d={1100} dur={250} />
      <Token pts={[[262, 82], [300, 110], [350, 118], [424, 118]]} d={800} dur={900} tone={certain ? "success" : "danger"} />
      {certain ? (
        <>
          <Box x={426} y={92} w={124} h={52} label={bi("The street is wet", "الشارع مبتلّ")} tone="success" size={12} d={1400} />
          <Mark x={550} y={92} ok d={1700} />
          <Chip x={280} y={236} text={bi("valid conclusion, certain premises", "استنتاج سليم من مقدّمات يقينية")} tone="success" size={11} center d={1900} />
        </>
      ) : (
        <>
          <Box x={426} y={92} w={124} h={52} label={bi("Umbrella?", "مظلة؟")} sub="?" tone="warn" size={12} d={1400} />
          <Mark x={550} y={92} ok={false} d={1700} />
          <Chip x={280} y={236} text={bi("\"often\" is not a rule logic can use", "«كثيرًا» ليست قاعدة يستخدمها المنطق")} tone="warn" size={11} center d={1900} />
        </>
      )}
    </Svg>
  );
}

function WhyRational({ control }: { control: string }) {
  const reflex = control === "reflex";
  const x0 = 40;
  const burn = 300;
  const steps = [bi("It is hot", "إنه ساخن"), bi("Heat burns skin", "الحرارة تحرق الجلد"), bi("So: move the hand", "إذن: حرّك اليد")];
  return (
    <Svg>
      <Text x={280} y={24} text={bi("Time after touching the stove", "الزمن بعد لمس الموقد")} tone="heading" size={12} d={0} />
      <Arrow pts={[[x0, 196], [540, 196]]} tone="faint" d={100} dur={500} />
      <Text x={x0} y={214} text="0" mono size={11} tone="muted" d={200} />
      <Box x={burn} y={50} w={240} h={140} r={8} tone="danger" d={300} />
      <Text x={burn + 120} y={66} text={bi("the hand is burning", "اليد تحترق")} tone="danger" size={11.5} d={400} />
      {reflex ? (
        <>
          <Token pts={[[x0, 196], [96, 196]]} d={600} dur={400} tone="success" />
          <Box x={46} y={104} w={120} h={70} label={bi("Pull away", "اسحب اليد")} sub={bi("no inference", "بلا استدلال")} tone="success" size={12} d={800} />
          <Arrow pts={[[96, 176], [96, 192]]} tone="success" d={800} dur={200} head={false} />
          <Mark x={166} y={104} ok d={1100} />
          <Chip x={280} y={250} text={bi("fast and better: the rational choice", "سريع وأفضل: الخيار العقلاني")} tone="success" size={11} center d={1300} />
        </>
      ) : (
        <>
          <Token pts={[[x0, 196], [480, 196]]} d={600} dur={2200} tone="danger" />
          {steps.map((s, i) => (
            <Chip key={i} x={92 + i * 120} y={124} w={112} text={s} tone="outline" size={10.5} center d={700 + i * 500} />
          ))}
          <Box x={420} y={104} w={116} h={70} label={bi("Pull away", "اسحب اليد")} sub={bi("too late", "بعد فوات الأوان")} tone="danger" size={12} d={2300} />
          <Mark x={536} y={104} ok={false} d={2600} />
          <Chip x={280} y={250} text={bi("correct reasoning, but too slow", "استدلال صحيح لكنه بطيء جدًا")} tone="danger" size={11} center d={2800} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof whatIsAi>>({
  axes: Axes,
  turing: Turing,
  laws: Laws,
  "why-rational": WhyRational,
});
