"use client";

import type { whatIsSensor } from "@/lib/walkthroughs/robotics/lecture-03";
import { LDR_K, R_FIXED, SUPPLY, SWITCH_V, ldrCurrent, ldrOut, show, type Light } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import type { Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Pixels, Svg, Text, Token, type L, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Ground, Meter, Node, Resistor, Wire } from "./local";

type Stage = { label: L; sub: L };
type Chain = { input: Stage; sensor: L; output: Stage; reads: Stage; step: Bi; stepTone: Tone };

const CHAINS: Record<string, Chain> = {
  thermocouple: {
    input: { label: bi("Temperature", "درجة الحرارة"), sub: bi("hot vs cold end", "طرف ساخن وآخر بارد") },
    sensor: bi("Thermocouple", "المزدوجة الحرارية"),
    output: { label: "tens of µV/°C", sub: bi("very small", "صغير جدًا") },
    reads: { label: "ADC", sub: bi("analog input", "دخل تناظري") },
    step: bi("amplify first", "يُضخَّم أولًا"),
    stepTone: "gold",
  },
  switch: {
    input: { label: bi("Contact", "التلامس"), sub: bi("part present?", "هل القطعة موجودة؟") },
    sensor: bi("Limit switch", "المفتاح الحدّي"),
    output: { label: `${SWITCH_V.open} V / ${SWITCH_V.industrial} V`, sub: bi("one bit", "بِت واحد") },
    reads: { label: bi("Digital input", "دخل رقمي"), sub: bi("logic 0 / 1", "المنطق 0 / 1") },
    step: bi("read directly", "يُقرأ مباشرة"),
    stepTone: "success",
  },
  ldr: {
    input: { label: bi("Light", "الضوء"), sub: bi("illumination", "شدة الإضاءة") },
    sensor: bi("LDR", "مقاومة ضوئية"),
    output: { label: `${LDR_K.bright}–${LDR_K.dark} kΩ`, sub: bi("a resistance", "مقاومة") },
    reads: { label: "ADC", sub: bi("analog input", "دخل تناظري") },
    step: bi("divider → volts", "مقسِّم جهد ← فولت"),
    stepTone: "navy",
  },
};

const COLS = [70, 210, 350, 490];
const HEADS = [bi("Physical input", "الدخل الفيزيائي"), bi("Sensor", "المستشعر"), bi("Electrical output", "الخرج الكهربائي"), bi("Controller", "المتحكِّم")];

function Definition({ control }: { control: string }) {
  const c = CHAINS[control] ?? CHAINS.thermocouple;
  const bx = (i: number) => COLS[i] - 55;
  return (
    <Svg>
      {HEADS.map((h, i) => (
        <Text key={i} x={COLS[i]} y={40} text={h} size={11} tone="muted" d={i * 120} />
      ))}
      <Box x={bx(0)} y={78} w={110} h={74} tone="slate" label={c.input.label} sub={c.input.sub} size={12} subSize={10.5} d={0} />
      <Box x={bx(1)} y={78} w={110} h={74} tone="navy" label={c.sensor} size={12.5} d={200} />
      <Box x={bx(2)} y={78} w={110} h={74} tone="outline" label={c.output.label} sub={c.output.sub} size={11.5} subSize={10.5} mono={typeof c.output.label === "string"} d={400} />
      <Box x={bx(3)} y={78} w={110} h={74} tone="outline" label={c.reads.label} sub={c.reads.sub} size={12} subSize={10.5} d={600} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Arrow pts={[[COLS[i] + 56, 115], [COLS[i + 1] - 57, 115]]} tone="gold" d={300 + i * 250} dur={250} />
          <Token pts={[[COLS[i] + 56, 115], [COLS[i + 1] - 57, 115]]} d={700 + i * 350} dur={350} r={5} />
        </g>
      ))}
      <Chip x={420} y={186} text={c.step} tone={c.stepTone} center d={1500} />
      <Chip x={280} y={244} text={bi("usable = something the controller can read", "القابل للاستخدام = ما يستطيع المتحكِّم قراءته")} tone="outline" center d={1800} />
    </Svg>
  );
}

const WORLDS = [bi("One part in the chute", "قطعة واحدة في المجرى"), bi("Two parts jammed", "قطعتان عالقتان"), bi("The emitter has failed", "المُرسِل معطَّل"), bi("Dust covers the lens", "الغبار يغطي العدسة")];

function Inference() {
  return (
    <Svg>
      <Text x={130} y={26} text={bi("Break-beam over a chute", "قطع الشعاع فوق مجرى")} tone="heading" size={12} d={0} />
      <Box x={24} y={62} w={34} h={30} r={5} tone="navy" label="E" mono size={12} d={100} />
      <Box x={202} y={62} w={34} h={30} r={5} tone="muted" label="R" mono size={12} d={150} />
      <Arrow pts={[[60, 77], [114, 77]]} tone="gold" head={false} d={300} dur={300} width={3} />
      <Box x={116} y={60} w={28} h={34} r={5} tone="muted" label="?" size={16} d={500} />
      <Arrow pts={[[146, 77], [200, 77]]} tone="faint" dashed head={false} d={600} />
      <Text x={41} y={106} text={bi("emitter", "المُرسِل")} size={10.5} tone="muted" d={200} />
      <Text x={219} y={106} text={bi("receiver", "المُستقبِل")} size={10.5} tone="muted" d={200} />
      <Chip x={130} y={152} text={bi("reading: BLOCKED", "القراءة: محجوب")} tone="danger" center d={800} />
      <Text x={460} y={26} text={bi("Possible worlds", "العوالم الممكنة")} tone="heading" size={12} d={900} />
      {WORLDS.map((wd, i) => {
        const yc = 70 + i * 50;
        return (
          <g key={i}>
            <Box x={350} y={yc - 20} w={200} h={40} tone="outline" label={wd} size={11.5} d={1000 + i * 200} />
            <Arrow pts={[[348, yc], [202, 152]]} tone="gold" d={1100 + i * 200} dur={350} />
          </g>
        );
      })}
      <Text x={130} y={196} text={bi("each gives the same reading", "كلٌّ منها يعطي القراءة نفسها")} size={11} tone="muted" d={1900} />
      <Chip x={140} y={246} text={bi("reason back from reading to world", "استدلّ عكسيًا من القراءة إلى العالم")} tone="navy" center d={2100} />
    </Svg>
  );
}

const LEVELS = ["switch", "scale", "mic", "camera"] as const;
const LEVEL_NAMES = [bi("switch", "المفتاح"), bi("scale", "الميزان"), bi("mic", "الميكروفون"), bi("camera", "الكاميرا")];
const LEVEL_WORK = [bi("almost none: 1 bit", "شبه معدومة: بِت واحد"), bi("calibration", "المعايرة"), bi("filtering, frequency analysis", "الترشيح وتحليل الترددات"), bi("computer vision", "الرؤية الحاسوبية")];
const CAMERA = Array.from({ length: 5 }, (_, r) => Array.from({ length: 9 }, (_, c) => (37 * r + 53 * c + 11 * r * c) % 256));

function Levels({ control }: { control: string }) {
  const k = Math.max(0, LEVELS.indexOf(control as (typeof LEVELS)[number]));
  const slot = (i: number) => 352 + i * 60;
  const heights = [12, 40, 80, 140];
  return (
    <Svg>
      <Text x={160} y={26} text={bi("Raw output", "الخرج الخام")} tone="heading" size={12} d={0} />
      {k === 0 ? (
        <>
          <Curve box={{ x: 50, y: 70, w: 230, h: 100, domain: [0, 10], range: [0, 5.6] }} axes points={[[0, 0], [4, 0], [4, 5], [10, 5]]} tone="gold" d={100} />
          <Text x={56} y={142} text={bi(`open: ${SWITCH_V.open} V`, `مفتوح: ${SWITCH_V.open} V`)} anchor="start" size={11} tone="muted" d={700} />
          <Text x={282} y={98} text={bi(`closed: ${SWITCH_V.closed} V`, `مغلق: ${SWITCH_V.closed} V`)} anchor="end" size={11} tone="gold" d={900} />
        </>
      ) : k === 1 ? (
        <>
          <Box x={70} y={78} w={180} h={70} r={8} tone="navy" label="72.4 kg" mono size={24} d={100} />
          <Text x={160} y={168} text={bi("one number per reading", "رقم واحد لكل قراءة")} size={11} tone="muted" d={500} />
        </>
      ) : k === 2 ? (
        <Curve
          box={{ x: 50, y: 64, w: 230, h: 110, domain: [0, 1], range: [-1, 1] }}
          axes
          fn={(t) => 0.55 * Math.sin(2 * Math.PI * 5 * t) + 0.3 * Math.sin(2 * Math.PI * 13 * t + 1)}
          samples={200}
          tone="gold"
          d={100}
          dur={1200}
        />
      ) : (
        <>
          <Pixels x={62} y={60} values={CAMERA} cell={22} max={255} show="none" d={100} stagger={80} />
          <Text x={161} y={186} text={bi("× millions, arriving again and again", "× الملايين، تصل مرة بعد مرة")} size={11} tone="muted" d={700} />
        </>
      )}
      <Chip x={160} y={240} text={LEVEL_WORK[k]} tone={k === 0 ? "success" : k === 3 ? "danger" : "gold"} center d={1200} />
      <Text x={442} y={26} text={bi("Processing needed", "المعالجة المطلوبة")} tone="heading" size={12} d={200} />
      <Arrow pts={[[326, 200], [558, 200]]} tone="faint" head={false} d={300} dur={300} />
      {heights.map((h, i) => (
        <g key={i}>
          <Box x={slot(i) - 17} y={200 - h} w={34} h={h} r={3} tone={i === k ? "gold" : "muted"} d={400 + i * 120} />
          <Text x={slot(i)} y={214} text={LEVEL_NAMES[i]} size={10} tone={i === k ? "gold" : "muted"} d={400 + i * 120} />
        </g>
      ))}
    </Svg>
  );
}

function Divider({ control }: { control: string }) {
  const light: Light = control === "dark" ? "dark" : "bright";
  const r2 = LDR_K[light];
  const vout = ldrOut(light);
  const i = ldrCurrent(light);
  const iText = light === "dark" ? `${show(i * 1000, 1)} µA` : `${show(i)} mA`;
  const X = 110;
  return (
    <Svg>
      <Text x={X} y={26} text={`+${SUPPLY} V`} mono size={12} tone="heading" d={0} />
      <Node x={X} y={40} d={0} />
      <Wire pts={[[X, 40], [X, 52]]} d={100} dur={150} />
      <Resistor x={X} y={52} len={60} label={bi(`R₁ = ${R_FIXED} kΩ`, `R₁ = ${R_FIXED} kΩ ثابتة`)} d={150} />
      <Wire pts={[[X, 112], [X, 150]]} d={400} dur={200} />
      <Node x={X} y={130} tone="gold" d={500} />
      <Wire pts={[[X, 130], [190, 130]]} tone="gold" d={500} dur={300} />
      <Text x={198} y={130} text="V_out" anchor="start" mono size={12} tone="gold" d={700} />
      <Resistor x={X} y={150} len={60} label={bi(`R₂ = ${r2} kΩ`, `R₂ = ${r2} kΩ المستشعر`)} labelTone="gold" d={600} />
      <Wire pts={[[X, 210], [X, 228]]} d={900} dur={150} />
      <Ground x={X} y={228} d={950} />
      <Arrow pts={[[84, 62], [84, 200]]} tone="slate" d={1000} dur={600} />
      <Text x={72} y={131} text="I" mono size={13} tone="slate" d={1200} />
      <Text x={262} y={48} text={bi("Ohm's law: V = I · R", "قانون أوم: V = I · R")} anchor="start" tone="heading" size={12} d={1300} />
      <Text x={262} y={96} text={`I = ${SUPPLY} V / (${R_FIXED} + ${r2}) kΩ ≈ ${iText}`} anchor="start" mono size={11.5} d={1500} />
      <Text x={262} y={132} text={`V_out = I · R₂ ≈ ${iText} × ${r2} kΩ`} anchor="start" mono size={11.5} d={1800} />
      <Text x={262} y={172} text={`≈ ${show(vout)} V`} anchor="start" mono size={18} tone="gold" weight={700} d={2100} />
      <Meter x={510} y={70} h={150} w={24} value={vout} max={SUPPLY} ticks={[0, SUPPLY]} tickText={(t) => `${t}`} d={2000} />
      <Text x={522} y={236} text="V_out" mono size={10.5} tone="muted" d={2000} />
      <Chip x={380} y={240} text={light === "dark" ? bi("large R₂ takes most of the 5 V", "R₂ الكبيرة تأخذ معظم 5 V") : bi("small R₂ takes a small share", "R₂ الصغيرة تأخذ حصة صغيرة")} tone="outline" center d={2300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof whatIsSensor>>({
  definition: Definition,
  inference: Inference,
  levels: Levels,
  divider: Divider,
});
