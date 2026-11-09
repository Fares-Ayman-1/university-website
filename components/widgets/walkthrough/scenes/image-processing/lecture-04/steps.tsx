"use client";

import type { steps } from "@/lib/walkthroughs/image-processing/lecture-04";
import { filterTest, invertWithoutUnshift, keptSpectrum, spectrumImage, TEST_D0, TEST_IMG, TEST_N, toDisplay } from "@/lib/widgets/ip-lecture-04";
import { mapGrid } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Svg, Text, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { NumGrid, Raster } from "./local";

type Step = { label: Bi; sub: string; tone: Tone };

const STEPS: readonly Step[] = [
  { label: bi("Grayscale", "تحويل إلى رمادي"), sub: "rgb2gray(f)", tone: "outline" },
  { label: bi("Fourier transform", "تحويل فورييه"), sub: "F = fft2(f)", tone: "slate" },
  { label: bi("Shift to centre", "الإزاحة للمركز"), sub: "fftshift(F)", tone: "slate" },
  { label: bi("Build H", "بناء المرشح H"), sub: "from D(u,v), D0", tone: "gold" },
  { label: bi("Multiply", "الضرب"), sub: "G = H .* F", tone: "gold" },
  { label: bi("Inverse transform", "التحويل المعكوس"), sub: "ifft2(ifftshift(G))", tone: "slate" },
  { label: bi("Normalise, display", "التطبيع والعرض"), sub: "imshow(g, [])", tone: "outline" },
];

const BOX_W = 112;
const BOX_H = 66;
const XS = [16, 152, 288, 424];
const ROW1 = 40;
const ROW2 = 150;

/** Where step i sits: 1–4 left to right on the top row, 5–7 right to left underneath. */
const place = (i: number) => (i < 4 ? { x: XS[i], y: ROW1 } : { x: XS[7 - i], y: ROW2 });

function Flow() {
  return (
    <Svg>
      {STEPS.map((s, i) => {
        const { x, y } = place(i);
        return (
          <g key={i}>
            <Box x={x} y={y} w={BOX_W} h={BOX_H} label={s.label} sub={s.sub} tone={s.tone} size={11} subSize={10} d={i * 260} />
            <Box x={x - 8} y={y - 8} w={20} h={20} r={10} label={String(i + 1)} tone="navy" size={10.5} d={i * 260} />
          </g>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Arrow key={`a${i}`} pts={[[XS[i] + BOX_W, ROW1 + BOX_H / 2], [XS[i + 1], ROW1 + BOX_H / 2]]} tone="gold" d={200 + i * 260} dur={160} />
      ))}
      <Arrow pts={[[XS[3] + BOX_W / 2, ROW1 + BOX_H], [XS[3] + BOX_W / 2, ROW2 - 8]]} tone="gold" d={980} dur={200} />
      {[3, 2].map((c, k) => (
        <Arrow key={`b${c}`} pts={[[XS[c], ROW2 + BOX_H / 2], [XS[c - 1] + BOX_W, ROW2 + BOX_H / 2]]} tone="gold" d={1240 + k * 260} dur={160} />
      ))}
      <Chip x={150} y={256} text={bi("round trip: steps 2, 3, 6", "الذهاب والعودة: 2 و 3 و 6")} tone="slate" center d={2000} />
      <Chip x={410} y={256} text={bi("your filter: steps 4, 5", "مرشحك: الخطوتان 4 و 5")} tone="gold" center d={2200} />
    </Svg>
  );
}

const ZOOM = { r: 4, c: 2, n: 4 } as const;

function ShiftBack({ control }: { control: string }) {
  const mode = control === "real" || control === "abs" ? control : "ifftshift";
  const { G, g, H } = filterTest("ideal", "low", TEST_D0.large);
  const wrong = invertWithoutUnshift(G);
  const values = mode === "ifftshift" ? g : mode === "real" ? wrong : mapGrid(wrong, Math.abs);
  const shown = mode === "real" ? toDisplay(values, "stretch") : toDisplay(values, "clip");
  const zoom = Array.from({ length: ZOOM.n }, (_, i) => Array.from({ length: ZOOM.n }, (_, j) => Math.round(values[ZOOM.r + i][ZOOM.c + j])));
  const c = 4;
  const s = TEST_N * c;
  return (
    <Svg>
      <Text x={20 + s / 2} y={26} text={bi("G = H · F, centred", "G = H · F بعد التوسيط")} tone="heading" size={12} d={0} />
      <Raster x={20} y={52} values={keptSpectrum(H)} cell={c} d={100} />
      <Arrow pts={[[156, 116], [228, 116]]} tone={mode === "ifftshift" ? "success" : "danger"} d={500} dur={300} />
      <Text x={192} y={96} text={mode === "ifftshift" ? "ifftshift" : "no ifftshift"} size={11} mono tone={mode === "ifftshift" ? "success" : "danger"} d={600} />
      <Text x={192} y={136} text={mode === "abs" ? "abs(ifft2)" : "ifft2"} size={11} mono tone="heading" d={600} />
      <Text x={236 + s / 2} y={26} text={bi("result", "الناتج")} tone="heading" size={12} d={700} />
      <Raster x={236} y={52} values={shown} cell={c} d={800} />
      <Box x={236 + ZOOM.c * c - 1} y={52 + ZOOM.r * c - 1} w={ZOOM.n * c + 2} h={ZOOM.n * c + 2} r={1} tone="ghost" dashed d={1200} />
      <Text x={470} y={26} text={bi("zoom: 4 × 4 values", "تكبير: 4 × 4 قيم")} tone="heading" size={12} d={1200} />
      <NumGrid
        x={398}
        y={64}
        cells={zoom.map((row) => row.map((v) => String(v).replace("-", "−")))}
        cw={36}
        ch={26}
        size={10.5}
        tone={(i, j) => (zoom[i][j] < 0 ? "danger" : undefined)}
        d={1300}
        stagger={80}
      />
      <Chip
        x={280}
        y={232}
        text={
          mode === "ifftshift"
            ? bi("correct: the smoothed image", "صحيح: الصورة المنعَّمة")
            : mode === "real"
              ? bi("every second sign flipped: a checkerboard", "إشارة بكسل من كل اثنين مقلوبة: رقعة شطرنج")
              : bi("looks right, but the signs are lost", "تبدو صحيحة، لكن الإشارات ضاعت")
        }
        tone={mode === "ifftshift" ? "success" : mode === "real" ? "danger" : "warn"}
        center
        d={1700}
      />
    </Svg>
  );
}

const MASK_D0 = TEST_D0.large;

function Result({ control }: { control: string }) {
  const high = control === "high";
  const { H, g } = filterTest("ideal", high ? "high" : "low", MASK_D0);
  const c = 3.25;
  const s = TEST_N * c;
  const cols = [120, 330];
  const rows = [48, 164];
  return (
    <Svg>
      <Text x={cols[0] + s / 2} y={24} text={bi("original", "الأصل")} tone="heading" size={12} d={0} />
      <Text x={cols[1] + s / 2} y={24} text={high ? bi("high pass", "تمرير مرتفع") : bi("low pass", "تمرير منخفض")} tone="heading" size={12} d={600} />
      <Text x={104} y={rows[0] + s / 2} text="f(x, y)" anchor="end" size={12} mono tone="muted" d={0} />
      <Text x={104} y={rows[1] + s / 2} text="|F(u, v)|" anchor="end" size={12} mono tone="muted" d={0} />
      <Raster x={cols[0]} y={rows[0]} values={TEST_IMG} cell={c} d={100} />
      <Raster x={cols[0]} y={rows[1]} values={spectrumImage(TEST_IMG)} cell={c} d={300} />
      <Arrow pts={[[cols[0] + s + 8, rows[1] + s / 2], [cols[1] - 8, rows[1] + s / 2]]} tone="gold" d={600} dur={300} label={bi("× mask", "× القناع")} labelAt={[(cols[0] + s + cols[1]) / 2, rows[1] + s / 2 - 32]} />
      <Raster x={cols[1]} y={rows[1]} values={keptSpectrum(H)} cell={c} d={800} />
      <Raster x={cols[1]} y={rows[0]} values={toDisplay(g, high ? "abs" : "clip")} cell={c} d={1300} />
      <Chip x={496} y={rows[0] + s / 2} text={high ? bi("edges only", "الحواف فقط") : bi("blurred", "ضبابية")} tone={high ? "warn" : "slate"} center d={1700} />
      <Chip x={496} y={rows[1] + s / 2} text={high ? bi("centre removed", "حُذف المركز") : bi("centre kept", "أُبقي المركز")} tone="gold" center d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof steps>>({
  flow: Flow,
  "shift-back": ShiftBack,
  result: Result,
});
