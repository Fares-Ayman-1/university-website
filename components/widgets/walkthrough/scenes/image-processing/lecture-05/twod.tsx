"use client";

import type { twoD } from "@/lib/walkthroughs/image-processing/lecture-05";
import { abs, arg, dft2, dftRows, fftshift2, fmtNum, LOG_IMG, logMag, mapGrid, MOVED_SQUARE, normalise, RAMP4, squareImage, tightC } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { CGrid } from "./local";

function Separable({ control }: { control: string }) {
  const rows = control !== "columns";
  const grid = rows ? dftRows(RAMP4) : dft2(RAMP4);
  const gx = 190;
  const gy = 72;
  const cw = 86;
  const ch = 30;
  return (
    <Svg>
      <Text x={76} y={40} text={bi("image f(x, y)", "الصورة f(x, y)")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={78} values={RAMP4} cell={26} max={4} d={100} stagger={80} />
      <Text x={76} y={202} text={bi("every row is f = [1, 2, 3, 4]", "كل صف هو f = [1, 2, 3, 4]")} size={10.5} tone="muted" d={400} />
      <Arrow pts={[[134, 130], [182, 130]]} tone="gold" d={500} dur={300} label="DFT" labelAt={[158, 116]} />
      <Text x={362} y={28} text={rows ? bi("step 1: the 1-D DFT along every row", "الخطوة 1: DFT أحادي البُعد على امتداد كل صف") : bi("step 2: then along every column", "الخطوة 2: ثم على امتداد كل عمود")} tone="heading" size={12} d={600} />
      {rows ? (
        <Arrow pts={[[gx + 8, gy - 8], [gx + cw * 4 - 8, gy - 8]]} tone="gold" d={700} dur={400} />
      ) : (
        <Arrow pts={[[gx + cw * 4 + 10, gy + 4], [gx + cw * 4 + 10, gy + ch * 4 - 4]]} tone="gold" d={700} dur={400} />
      )}
      <CGrid
        x={gx}
        y={gy}
        cells={grid.map((row) => row.map((c) => tightC(c)))}
        cw={cw}
        ch={ch}
        size={11}
        byColumn={!rows}
        tone={(r) => (rows ? "slate" : r === 0 ? "gold" : "muted")}
        d={900}
        stagger={rows ? 160 : 160}
      />
      <Text
        x={362}
        y={222}
        text={rows ? bi("each row becomes the worked example's F", "يصبح كل صف هو F في المثال المحلول") : bi("constant columns: only the top row (u = 0) survives", "الأعمدة ثابتة: لا يبقى إلا الصف العلوي (u = 0)")}
        size={11}
        tone={rows ? "slate" : "gold"}
        d={1700}
      />
    </Svg>
  );
}

const QUAD = ["A", "B", "C", "D"];

function Centre({ control }: { control: string }) {
  const centred = control === "centred";
  const img = squareImage(8, 4, 2, 2);
  const mag = normalise(logMag(dft2(img)));
  const shown = centred ? fftshift2(mag) : mag;
  const c = 22;
  const gx = 300;
  const gy = 50;
  const half = 4 * c;
  const order = centred ? [3, 2, 1, 0] : [0, 1, 2, 3];
  const dc = centred ? 4 : 0;
  return (
    <Svg>
      <Text x={112} y={26} text={bi("image", "الصورة")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={gy} values={img} cell={c} show="none" d={100} stagger={40} />
      <Arrow pts={[[214, 138], [290, 138]]} tone="gold" d={500} dur={300} label={centred ? "fftshift(fft2)" : "fft2"} labelAt={[252, 124]} />
      <Text x={gx + half} y={26} text={centred ? bi("log(1 + |F|) after fftshift", "log(1 + |F|) بعد fftshift") : bi("log(1 + |F|) as computed", "log(1 + |F|) كما حُسب")} tone="heading" size={12} d={600} />
      <Pixels x={gx} y={gy} values={shown} cell={c} show="none" d={700} stagger={40} outline={(r, cc) => (r === dc && cc === dc ? "gold" : undefined)} />
      <Arrow pts={[[gx + half, gy], [gx + half, gy + 2 * half]]} tone="gold" head={false} dashed d={1200} />
      <Arrow pts={[[gx, gy + half], [gx + 2 * half, gy + half]]} tone="gold" head={false} dashed d={1200} />
      {order.map((q, i) => (
        <Box key={i} x={gx + (i % 2) * half + half / 2 - 11} y={gy + Math.floor(i / 2) * half + half / 2 - 11} w={22} h={22} r={5} label={QUAD[q]} tone="outline" size={11} mono d={1300 + i * 120} />
      ))}
      <Text x={gx + half} y={244} text={centred ? bi("DC in the middle, quadrants swapped diagonally", "المركبة المستمرة في المنتصف، والأرباع مبدَّلة قُطريًا") : bi("DC in the top-left corner", "المركبة المستمرة في الركن العلوي الأيسر")} size={11} tone="gold" d={1800} />
    </Svg>
  );
}

function LogScale({ control }: { control: string }) {
  const log = control === "log";
  const F = fftshift2(dft2(LOG_IMG));
  const mags = F.flat().map(abs).sort((a, b) => b - a);
  const shown = log ? normalise(logMag(F)) : normalise(mapGrid(F, abs));
  const c = 11;
  return (
    <Svg>
      <Text x={112} y={26} text={bi("image", "الصورة")} tone="heading" size={12} d={0} />
      <Pixels x={24} y={50} values={LOG_IMG} cell={c} show="none" d={100} stagger={25} />
      <Arrow pts={[[214, 138], [290, 138]]} tone="gold" d={500} dur={300} label="fft2" labelAt={[252, 124]} />
      <Text x={388} y={26} text={log ? "log(1 + |F|)" : bi("|F|, drawn as it is", "|F| كما هو")} tone="heading" size={12} mono={log} d={600} />
      <Pixels x={300} y={50} values={shown} cell={c} show="none" d={700} stagger={25} />
      <Text x={112} y={244} text={bi("a bright square on mid-grey", "مربع ساطع على رمادي متوسط")} size={11} tone="muted" d={400} />
      <Text
        x={388}
        y={244}
        text={bi(`DC = ${fmtNum(mags[0], 1)}; the next largest is ${fmtNum(mags[1], 1)}`, `المركبة المستمرة = ${fmtNum(mags[0], 1)}، وأكبر قيمة تالية ${fmtNum(mags[1], 1)}`)}
        size={11}
        tone={log ? "success" : "danger"}
        d={1300}
      />
    </Svg>
  );
}

function MagPhase({ control }: { control: string }) {
  const img = MOVED_SQUARE[control === "right" ? "right" : "left"];
  const F = fftshift2(dft2(img));
  const mag = normalise(logMag(F));
  const phase = mapGrid(F, (v) => (abs(v) < 1e-6 ? 128 : Math.round(((arg(v) + Math.PI) / (2 * Math.PI)) * 255)));
  const c = 18;
  const xs = [22, 208, 394];
  const titles = [bi("image", "الصورة"), bi("magnitude, log scale", "المقدار بمقياس لوغاريتمي"), bi("phase", "الطور")];
  const grids = [img, mag, phase];
  return (
    <Svg>
      {grids.map((g, i) => (
        <g key={i}>
          <Text x={xs[i] + 72} y={36} text={titles[i]} tone="heading" size={12} d={i * 400} />
          <Pixels x={xs[i]} y={64} values={g} cell={c} show="none" d={100 + i * 400} stagger={30} />
        </g>
      ))}
      <Arrow pts={[[170, 136], [202, 136]]} tone="gold" d={300} dur={250} />
      <Text x={xs[1] + 72} y={240} text={bi("the same wherever the square is", "نفسه أينما كان المربع")} size={11} tone="success" d={1300} />
      <Text x={xs[2] + 72} y={240} text={bi("changes with the position", "يتغير بتغيّر الموضع")} size={11} tone="danger" d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof twoD>>({
  separable: Separable,
  centre: Centre,
  log: LogScale,
  "mag-phase": MagPhase,
});
