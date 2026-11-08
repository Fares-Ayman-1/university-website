"use client";

import { filterImage, KERNEL_PRESETS, type Padding } from "@/lib/widgets/convolution";
import { clip, edgeSharpenedRaw, impulseImage, kernel, scaleTo255, WORKED_IMAGE, WORKED_MASK, worked } from "@/lib/widgets/ip-lecture-03";
import type { spatial } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Pixels, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Matrix, Op, num } from "./local";

const cropped = worked("correlation", "none").output;

function OnePixel({ control }: { control: string }) {
  const hood = control === "neighbourhood";
  const C = 30;
  const window = WORKED_IMAGE.slice(1, 4).map((row) => row.slice(1, 4));
  const products = window.map((row, r) => row.map((f, c) => f * WORKED_MASK[r][c]));
  return (
    <Svg>
      <Text x={99} y={24} text={bi("Input f", "المدخلات f")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={62} values={WORKED_IMAGE} cell={C} max={3} d={0} stagger={60} outline={(r, c) => (r === 2 && c === 2 ? "navy" : undefined)} />
      {hood ? (
        <>
          <Frame x={24 + C} y={62 + C} w={3 * C} h={3 * C} d={500} />
          <Text x={280} y={24} text={bi("Mask w", "القناع w")} tone="heading" size={12} d={600} />
          <Matrix x={241} y={56} values={WORKED_MASK} cell={26} d={700} />
          <Arrow pts={[[178, 137], [234, 186]]} tone="gold" d={900} dur={400} />
          <Text x={280} y={148} text="w × f" size={11.5} mono tone="gold" d={1000} />
          <Matrix x={241} y={160} values={products} cell={26} tone={(_r, _c, v) => (v ? "gold" : "muted")} d={1100} stagger={120} />
          <Text x={480} y={24} text={bi("Output g", "المخرجات g")} tone="heading" size={12} d={1300} />
          <Matrix x={429} y={80} values={cropped.map((row, r) => row.map((v, c) => (r === 1 && c === 1 ? v : "")))} cell={34} tone={(r, c) => (r === 1 && c === 1 ? "gold" : "muted")} d={1400} />
          <Arrow pts={[[324, 199], [480, 199], [480, 186]]} tone="gold" d={1700} label={`Σ = ${cropped[1][1]}`} labelAt={[402, 186]} labelTone="gold" />
          <Chip x={400} y={244} text={bi("3×3 window → 1 pixel", "نافذة 3×3 ← بكسل واحد")} tone="navy" center d={2100} />
        </>
      ) : (
        <>
          <Arrow pts={[[180, 137], [203, 137]]} tone="navy" d={500} dur={300} />
          <Box x={205} y={104} w={150} h={66} label="T(2)" sub={bi("one value in, one out", "قيمة تدخل وقيمة تخرج")} tone="navy" mono d={600} />
          <Arrow pts={[[357, 137], [406, 137]]} tone="navy" d={900} dur={300} />
          <Text x={475} y={24} text={bi("Output g", "المخرجات g")} tone="heading" size={12} d={1000} />
          <Matrix x={410} y={72} values={WORKED_IMAGE.map((row, r) => row.map((_, c) => (r === 2 && c === 2 ? "T(2)" : "")))} cell={26} size={10} tone={(r, c) => (r === 2 && c === 2 ? "gold" : "muted")} d={1100} />
          <Chip x={280} y={244} text={bi("the neighbours are never read", "لا يُقرأ الجيران أبدًا")} tone="slate" center d={1500} />
        </>
      )}
    </Svg>
  );
}

function Flip({ control }: { control: string }) {
  const conv = control === "convolution";
  const out = filterImage(impulseImage(5), kernel(WORKED_MASK), conv ? "convolution" : "correlation", "zero").output;
  return (
    <Svg>
      <Text x={85} y={24} text={bi("Impulse", "النبضة (impulse)")} tone="heading" size={12} d={0} />
      <Pixels x={20} y={64} values={impulseImage(5)} cell={26} max={1} d={0} stagger={50} outline={(r, c) => (r === 2 && c === 2 ? "gold" : undefined)} />
      <Op x={170} y={129} sign={conv ? "∗" : "☆"} d={400} />
      <Text x={229} y={24} text={bi("Mask w", "القناع w")} tone="heading" size={12} d={400} />
      <Matrix x={190} y={90} values={WORKED_MASK} cell={26} tone={(r, c) => (r === 0 && c === 2 ? "success" : undefined)} d={500} />
      <Chip x={229} y={206} text={conv ? bi("rotated 180° first", "يُدوَّر 180° أولًا") : bi("laid as it is", "يوضع كما هو")} tone={conv ? "navy" : "slate"} center d={800} />
      <Op x={292} y={129} sign="=" d={900} />
      <Text x={381} y={24} text={bi("Output", "المخرجات")} tone="heading" size={12} d={1000} />
      <Pixels x={316} y={64} values={out} cell={26} max={2} d={1000} stagger={80} outline={(r, c) => ((conv ? r === 1 && c === 3 : r === 3 && c === 1) ? "success" : undefined)} />
      <Frame x={342} y={90} w={78} h={78} d={1600} />
      <Chip
        x={381}
        y={250}
        text={conv ? bi("= w itself: the impulse response", "= w نفسه: الاستجابة النبضية") : bi("= w rotated by 180°", "= w مدوَّرًا بزاوية 180°")}
        tone={conv ? "success" : "gold"}
        center
        d={1900}
      />
    </Svg>
  );
}

function Delta({ control }: { control: string }) {
  const left = control === "left";
  const mask = left ? KERNEL_PRESETS.shift : KERNEL_PRESETS.identity;
  const out = filterImage(WORKED_IMAGE, mask, "convolution", "zero").output;
  return (
    <Svg>
      <Text x={90} y={24} text={bi("Image f", "الصورة f")} tone="heading" size={12} d={0} />
      <Pixels x={20} y={64} values={WORKED_IMAGE} cell={28} max={3} d={0} stagger={50} />
      <Op x={180} y={134} sign="∗" d={400} />
      <Text x={239} y={24} text={bi("Mask", "القناع")} tone="heading" size={12} d={400} />
      <Matrix x={200} y={95} values={mask.weights} cell={26} tone={(_r, _c, v) => (v === 1 ? "gold" : undefined)} d={500} />
      <Op x={300} y={134} sign="=" d={800} />
      <Text x={390} y={24} text={bi("Output", "المخرجات")} tone="heading" size={12} d={900} />
      <Pixels x={320} y={64} values={out} cell={28} max={3} d={900} stagger={80} outline={left ? (_r, c) => (c === 4 ? "danger" : undefined) : undefined} />
      {left ? (
        <>
          <Arrow pts={[[446, 220], [394, 220]]} tone="gold" d={1600} dur={400} />
          <Chip x={390} y={252} text={bi("moved 1 pixel left", "تحركت بكسلًا واحدًا لليسار")} tone="gold" center d={1800} />
          <Text x={514} y={134} text={bi("zero padding", "حشو بالأصفار")} tone="danger" size={11} d={1900} />
        </>
      ) : (
        <Chip x={390} y={240} text={bi("an exact copy of f", "نسخة مطابقة من f")} tone="success" center d={1600} />
      )}
    </Svg>
  );
}

function Borders({ control }: { control: string }) {
  const mode = control as Padding;
  const res = worked("correlation", mode);
  if (mode === "none") {
    return (
      <Svg>
        <Text x={99} y={24} text={bi("Input f (5×5)", "المدخلات f (5×5)")} tone="heading" size={12} d={0} />
        <Pixels x={24} y={62} values={WORKED_IMAGE} cell={30} max={3} d={0} stagger={50} />
        <Frame x={24} y={62} w={90} h={90} d={500} />
        <Arrow pts={[[184, 137], [316, 137]]} tone="muted" d={800} label={bi("mask stays inside", "القناع يبقى داخلها")} labelAt={[250, 112]} />
        <Text x={381} y={24} text={bi("Output (3×3)", "المخرجات (3×3)")} tone="heading" size={12} d={1000} />
        <Pixels x={330} y={86} values={res.output} cell={34} max={25} d={1100} stagger={80} outline={(r, c) => (r === 0 && c === 0 ? "gold" : undefined)} />
        <Chip x={280} y={246} text="M − m + 1 = 5 − 3 + 1 = 3" tone="navy" center d={1600} />
      </Svg>
    );
  }
  const values = res.padded.map((row) => row.map((p) => p.value));
  return (
    <Svg>
      <Text x={115} y={24} text={bi("Padded input (7×7)", "المدخلات بعد الحشو (7×7)")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={56} values={values} cell={26} max={3} d={0} stagger={50} outline={(r, c) => (res.padded[r][c].pad ? "faint" : undefined)} />
      <Frame x={50} y={82} w={130} h={130} tone="navy" dashed d={600} width={2} />
      <Frame x={24} y={56} w={78} h={78} d={800} />
      <Arrow pts={[[214, 147], [306, 147]]} tone="muted" d={1000} />
      <Text x={390} y={24} text={bi("Output (5×5)", "المخرجات (5×5)")} tone="heading" size={12} d={1100} />
      <Pixels x={320} y={64} values={res.output} cell={28} max={25} d={1200} stagger={70} outline={(r, c) => (r === 0 && c === 0 ? "gold" : undefined)} />
      <Chip x={390} y={240} text="M + 2p − m + 1 = 5 + 2 − 3 + 1 = 5" tone="navy" center d={1700} />
      <Text x={115} y={254} text={bi("dashed: the original image", "المتقطع: الصورة الأصلية")} tone="muted" size={10.5} d={1900} />
    </Svg>
  );
}

function Range({ control }: { control: string }) {
  const scale = control === "scale";
  const raw = edgeSharpenedRaw();
  const lo = Math.min(...raw);
  const hi = Math.max(...raw);
  const result = scale ? scaleTo255(raw) : raw.map((v) => clip(v));
  const box: PlotBox = { x: 60, y: 62, w: 200, h: 150, domain: [-60, 160], range: [0, 255] };
  const zero = plotAt(box, 0, 0);
  const top = plotAt(box, 0, 255);
  const dots = [...new Set(raw)];
  return (
    <Svg>
      <Curve box={box} axes points={[]} xLabel={bi("input", "المدخل")} yLabel={bi("output", "المخرج")} d={0} />
      <Arrow pts={[zero, top]} tone="faint" dashed head={false} d={300} />
      <Text x={zero[0]} y={box.y + box.h + 12} text="0" size={10} mono tone="muted" d={300} />
      <Text x={box.x - 6} y={top[1]} text="255" anchor="end" size={10} mono tone="muted" d={300} />
      {scale ? (
        <Curve box={box} points={[[lo, 0], [hi, 255]]} tone="gold" d={400} />
      ) : (
        <Curve box={box} points={[[-60, 0], [0, 0], [160, 160]]} tone="gold" d={400} />
      )}
      {dots.map((v, i) => {
        const [px, py] = plotAt(box, v, scale ? scaleTo255([lo, v, hi])[1] : clip(v));
        return <Box key={i} x={px - 4} y={py - 4} w={8} h={8} r={4} tone={v < 0 ? "danger" : "navy"} d={1100 + i * 120} />;
      })}
      <Text x={plotAt(box, lo, 0)[0]} y={box.y + box.h + 12} text={num(lo)} size={10} mono tone="danger" d={1000} />
      <Text x={430} y={30} text={bi("Sharpened row f − ∇²f", "الصف بعد الإبراز f − ∇²f")} tone="heading" size={12} d={200} />
      <Pixels x={330} y={66} values={[raw]} cell={40} max={255} d={300} outline={(_r, c) => (raw[c] < 0 ? "danger" : undefined)} />
      <Arrow pts={[[430, 112], [430, 154]]} tone="gold" d={800} label={scale ? bi("scale", "تحجيم") : bi("clip", "قصّ")} labelAt={[472, 127]} labelTone="gold" />
      <Pixels x={330} y={160} values={[result]} cell={40} max={255} d={1000} outline={(_r, c) => (result[c] !== raw[c] ? "gold" : undefined)} />
      <Chip x={430} y={240} text={scale ? bi("every value moves", "تتغير كل القيم") : bi("in-range values stay", "القيم داخل المدى تبقى")} tone={scale ? "gold" : "success"} center d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof spatial>>({
  "one-pixel": OnePixel,
  flip: Flip,
  delta: Delta,
  borders: Borders,
  range: Range,
});
