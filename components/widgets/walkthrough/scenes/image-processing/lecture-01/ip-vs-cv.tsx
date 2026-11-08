"use client";

import type { ipVsCv } from "@/lib/walkthroughs/image-processing/lecture-01";
import { DENOISED_PATCH, NOISY_PATCH } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Pixels, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const spike = (v: number) => v === 0 || v === 255;

function Outputs({ control }: { control: string }) {
  const cell = 28;
  const cv = control === "cv";
  return (
    <Svg>
      <Pixels x={20} y={52} values={NOISY_PATCH} cell={cell} outline={(r, c) => (spike(NOISY_PATCH[r][c]) ? "danger" : undefined)} d={0} stagger={50} />
      <Text x={90} y={210} text={bi("Input image", "صورة الدخل")} tone="heading" size={12} d={300} />
      <Arrow pts={[[164, 122], [204, 122]]} tone="gold" d={500} dur={300} />
      <Box x={206} y={94} w={148} h={56} label={cv ? bi("Computer vision", "الرؤية الحاسوبية") : bi("Image processing", "معالجة الصور")} tone={cv ? "gold" : "navy"} size={12.5} d={600} />
      <Arrow pts={[[356, 122], [396, 122]]} tone="gold" d={900} dur={300} />
      <Token pts={[[164, 122], [204, 122]]} d={600} dur={400} />
      {cv ? (
        <>
          <Chip x={470} y={98} text={bi('"Smiling kid"', "«طفل مبتسم»")} tone="gold" center d={1100} />
          <Text x={470} y={150} text={bi("knowledge of the scene", "معرفة بمحتوى المشهد")} tone="heading" size={12} d={1300} />
          <Chip x={470} y={214} text={bi("not an image", "ليست صورة")} tone="muted" center d={1500} />
        </>
      ) : (
        <>
          <Pixels x={400} y={52} values={DENOISED_PATCH} cell={cell} outline={(r, c) => (spike(NOISY_PATCH[r][c]) ? "success" : undefined)} d={1000} stagger={50} />
          <Text x={470} y={210} text={bi("Image in a better form", "الصورة في شكل أفضل")} tone="heading" size={12} d={1400} />
        </>
      )}
    </Svg>
  );
}

const STEPS = [bi("Denoise", "إزالة الضوضاء"), bi("Sharpen", "الإبراز"), bi("Segment", "التقطيع")];

function Chain() {
  const bx = (i: number) => 118 + i * 80;
  const y = 104;
  return (
    <Svg>
      <Box x={96} y={36} w={364} h={214} r={14} tone="ghost" dashed d={0} />
      <Text x={278} y={54} text={bi("Computer vision system", "نظام رؤية حاسوبية")} tone="heading" size={12.5} d={0} />
      <Box x={108} y={92} w={252} h={136} r={10} tone="ghost" dashed d={200} />
      <Text x={234} y={190} text={bi("Image processing steps", "خطوات معالجة الصور")} tone="muted" size={11.5} d={300} />
      <Pixels x={16} y={100} values={NOISY_PATCH.slice(0, 4).map((r) => r.slice(0, 4))} cell={13} show="none" d={100} />
      <Arrow pts={[[70, 126], [116, 126]]} tone="gold" d={400} dur={300} />
      {STEPS.map((s, i) => (
        <Box key={i} x={bx(i)} y={y} w={70} h={46} label={s} tone="navy" size={11} d={500 + i * 250} />
      ))}
      <Arrow pts={[[188, 127], [196, 127]]} tone="gold" d={700} dur={150} />
      <Arrow pts={[[268, 127], [276, 127]]} tone="gold" d={950} dur={150} />
      <Arrow pts={[[348, 127], [370, 127]]} tone="gold" d={1200} dur={250} />
      <Box x={372} y={y} w={78} h={46} label={bi("Recognise", "التعرّف")} tone="gold" size={11} d={1300} />
      <Arrow pts={[[452, 127], [478, 127]]} tone="gold" d={1500} dur={250} />
      <Chip x={516} y={127} text="DS 8354" tone="outline" center w={74} d={1600} />
      <Text x={516} y={160} text={bi("plate read", "اللوحة مقروءة")} tone="heading" size={11} d={1700} />
      <Token pts={[[70, 126], [116, 126], [450, 126], [478, 126]]} d={600} dur={1800} />
    </Svg>
  );
}

const LABELS = [bi("Mountain", "جبل"), bi("Sun", "شمس"), bi("Cloud", "سحابة"), bi("Grass", "عشب"), bi("Flower", "زهرة")];

function HumanComputer({ control }: { control: string }) {
  const labels = (d: number) =>
    LABELS.map((l, i) => <Chip key={i} x={474} y={52 + i * 44} text={l} tone="outline" w={104} center d={d + i * 100} />);
  if (control === "computer") {
    const boxes = [
      { label: bi("Sensors (camera)", "المستشعرات (الكاميرا)"), tone: "slate" as const },
      { label: bi("Pre-processing", "المعالجة المسبقة"), tone: "navy" as const },
      { label: bi("Feature extraction", "استخلاص السمات"), tone: "navy" as const },
      { label: bi("Machine learning model", "نموذج تعلم الآلة"), tone: "navy" as const },
    ];
    return (
      <Svg>
        {boxes.map((b, i) => (
          <Box key={i} x={30} y={30 + i * 58} w={180} h={46} label={b.label} tone={b.tone} size={11.5} d={i * 250} />
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow key={i} pts={[[120, 76 + i * 58], [120, 86 + i * 58]]} tone="gold" d={200 + i * 250} dur={150} />
        ))}
        <Box x={20} y={80} w={200} h={192} r={12} tone="ghost" dashed d={900} />
        <Text x={300} y={104} text={bi("inference system", "نظام الاستدلال")} tone="muted" size={11.5} d={1000} />
        <Arrow pts={[[212, 237], [414, 150]]} tone="gold" d={1100} dur={500} />
        <Token pts={[[212, 237], [414, 150]]} d={1200} dur={600} />
        {labels(1500)}
      </Svg>
    );
  }
  return (
    <Svg>
      <Box x={30} y={50} w={180} h={70} label={bi("Eye", "العين")} sub={bi("forms the image", "تكوّن الصورة")} tone="slate" d={0} />
      <Arrow pts={[[120, 122], [120, 156]]} tone="gold" d={300} dur={250} />
      <Box x={30} y={158} w={180} h={70} label={bi("Brain", "الدماغ")} sub={bi("interprets it", "يفسّرها")} tone="navy" d={400} />
      <Arrow pts={[[212, 193], [414, 150]]} tone="gold" d={800} dur={500} />
      <Token pts={[[212, 193], [414, 150]]} d={900} dur={600} />
      {labels(1200)}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof ipVsCv>>({
  outputs: Outputs,
  chain: Chain,
  "human-computer": HumanComputer,
});
