"use client";

import type { filtering } from "@/lib/walkthroughs/image-processing/lecture-04";
import { filterTest, filterUncentred, keptSpectrum, rawSpectrumImage, spectrumImage, TEST_D0, TEST_IMG, TEST_N, toDisplay } from "@/lib/widgets/ip-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Circle, Raster, Ring } from "./local";

const D0 = 5;

function Pipeline() {
  const smooth = toDisplay(filterTest("gaussian", "low", D0).g, "clip");
  const boxes = [
    { x: 14, label: bi("Fourier transform", "تحويل فورييه"), tone: "slate" as const },
    { x: 197, label: bi("Filter function", "دالة المرشح"), tone: "gold" as const },
    { x: 380, label: bi("Inverse Fourier transform", "تحويل فورييه المعكوس"), tone: "slate" as const },
  ];
  return (
    <Svg>
      {boxes.map((b, i) => (
        <Box key={i} x={b.x} y={34} w={166} h={50} label={b.label} tone={b.tone} size={11.5} d={i * 350} />
      ))}
      <Arrow pts={[[180, 59], [197, 59]]} tone="gold" d={300} dur={150} />
      <Arrow pts={[[363, 59], [380, 59]]} tone="gold" d={650} dur={150} />
      <Raster x={65} y={118} values={TEST_IMG} cell={2} d={100} />
      <Arrow pts={[[97, 114], [97, 88]]} tone="slate" d={200} dur={250} />
      <Text x={97} y={198} text={bi("input image", "صورة الدخل")} size={11} tone="muted" d={200} />
      <Arrow pts={[[463, 88], [463, 114]]} tone="slate" d={1000} dur={250} />
      <Raster x={431} y={118} values={smooth} cell={2} d={1100} />
      <Text x={463} y={198} text={bi("enhanced image", "الصورة المحسَّنة")} size={11} tone="muted" d={1100} />
      <Arrow pts={[[280, 88], [280, 124]]} tone="gold" d={800} dur={250} />
      <Text x={280} y={140} text="G(u,v) = H(u,v) · F(u,v)" size={14} mono tone="gold" d={900} />
      <Text x={204} y={166} text={bi("result", "الناتج")} size={10.5} tone="muted" d={1200} />
      <Text x={280} y={166} text={bi("filter", "المرشح")} size={10.5} tone="muted" d={1300} />
      <Text x={356} y={166} text={bi("image's FT", "تحويل الصورة")} size={10.5} tone="muted" d={1400} />
      <Chip x={280} y={252} text={bi("element by element: each frequency × the filter's value there", "عنصرًا بعنصر: كل تردد × قيمة المرشح عنده")} tone="slate" center d={1600} />
    </Svg>
  );
}

function Centre({ control }: { control: string }) {
  const centred = control === "centred";
  const c = 4;
  const s = TEST_N * c;
  const sx = 24;
  const sy = 56;
  const spec = centred ? spectrumImage(TEST_IMG) : rawSpectrumImage(TEST_IMG);
  const result = centred ? toDisplay(filterTest("ideal", "low", D0).g, "clip") : toDisplay(filterUncentred("ideal", D0), "stretch");
  const dc = centred ? [sx + (TEST_N / 2) * c, sy + (TEST_N / 2) * c] : [sx, sy];
  return (
    <Svg>
      <Text x={sx + s / 2} y={26} text={centred ? bi("spectrum, shifted", "الطيف بعد الإزاحة") : bi("spectrum, not shifted", "الطيف دون إزاحة")} tone="heading" size={12} d={0} />
      <Raster x={sx} y={sy} values={spec} cell={c} d={100} />
      <Circle cx={sx + s / 2} cy={sy + s / 2} r={D0 * c} tone="gold" d={600} />
      <Ring x={dc[0] - 7} y={dc[1] - 7} w={14 + c} h={14 + c} r={9} d={800} />
      <Text x={sx + s / 2} y={sy + s + 16} text={bi(centred ? "DC ring: in the middle" : "DC ring: in the corner", centred ? "حلقة DC: في المنتصف" : "حلقة DC: في الركن")} size={10.5} tone="muted" d={900} />
      <Arrow pts={[[164, 120], [228, 120]]} tone="gold" d={1000} dur={300} label={bi("keep the disc", "أبقِ القرص")} labelAt={[196, 92]} />
      <Text x={236 + s / 2} y={26} text={bi("result", "الناتج")} tone="heading" size={12} d={1100} />
      <Raster x={236} y={sy} values={result} cell={c} d={1200} />
      <Text x={436 + 32} y={26} text={bi("original", "الأصل")} tone="heading" size={12} d={0} />
      <Raster x={436} y={sy} values={TEST_IMG} cell={2} d={100} />
      <Chip
        x={280}
        y={248}
        text={centred ? bi("the disc covers the low frequencies: smoothed", "القرص يغطي الترددات المنخفضة: صورة منعَّمة") : bi("the disc covers the highest frequencies: wrong", "القرص يغطي أعلى الترددات: نتيجة خاطئة")}
        tone={centred ? "success" : "danger"}
        center
        d={1500}
      />
    </Svg>
  );
}

function LowPass({ control }: { control: string }) {
  const D = control === "large" ? TEST_D0.large : TEST_D0.small;
  const { H, g } = filterTest("ideal", "low", D);
  const c = 3.5;
  const s = TEST_N * c;
  const xs = [16, 156, 296, 436];
  const titles = [bi("spectrum F", "الطيف F"), bi("mask H", "القناع H"), "F · H", bi("result g", "الناتج g")];
  const grids = [spectrumImage(TEST_IMG), H.map((row) => row.map((v) => v * 255)), keptSpectrum(H), toDisplay(g, "clip")];
  return (
    <Svg>
      {grids.map((v, i) => (
        <g key={i}>
          <Text x={xs[i] + s / 2} y={28} text={titles[i]} tone="heading" size={11.5} mono={i === 2} d={i * 400} />
          <Raster x={xs[i]} y={52} values={v} cell={c} d={100 + i * 400} />
        </g>
      ))}
      <Text x={142} y={108} text="×" size={16} tone="heading" d={400} />
      <Text x={282} y={108} text="=" size={16} tone="heading" d={800} />
      <Arrow pts={[[410, 108], [430, 108]]} tone="gold" d={1100} dur={200} />
      <Raster x={16} y={190} values={TEST_IMG} cell={2} d={200} />
      <Text x={90} y={222} text={bi("the original", "الأصل")} anchor="start" size={11} tone="muted" d={200} />
      <Chip
        x={400}
        y={222}
        text={control === "large" ? bi(`D0 = ${D}: sharper, stripes still gone`, `D0 = ${D}: أوضح، والخطوط ما زالت غائبة`) : bi(`D0 = ${D}: strong blur`, `D0 = ${D}: تشويش شديد`)}
        tone={control === "large" ? "slate" : "warn"}
        center
        d={1600}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof filtering>>({
  pipeline: Pipeline,
  centre: Centre,
  lowpass: LowPass,
});
