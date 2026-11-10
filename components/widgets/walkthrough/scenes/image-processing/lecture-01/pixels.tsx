"use client";

import type { pixels } from "@/lib/walkthroughs/image-processing/lecture-01";
import { CENTRE, FACE, FACE_PATCH, NEIGHBOURHOOD, PICKED, POINT_ADD, centreValue, crop, neighbourhoodMean, pickedValue, pointResult } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, type LineTone, Pixels, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Veil } from "./local";

/* ---------- The matrix, indexed from 1 or from 0 ---------- */

function Matrix({ control }: { control: string }) {
  const numpy = control === "numpy";
  const base = numpy ? 0 : 1;
  const s = 11;
  const fx = 24;
  const fy = 58;
  const { r0, c0, rows, cols } = FACE_PATCH;
  const zx = 262;
  const zy = 66;
  const z = 44;
  const pr = PICKED.r - r0;
  const pc = PICKED.c - c0;
  const r = PICKED.r + base;
  const c = PICKED.c + base;
  return (
    <Svg>
      <Arrow pts={[[fx + (c0 + cols) * s, fy + r0 * s], [zx - 4, zy]]} tone="faint" head={false} d={600} dur={300} />
      <Arrow pts={[[fx + (c0 + cols) * s, fy + (r0 + rows) * s], [zx - 4, zy + rows * z]]} tone="faint" head={false} d={600} dur={300} />
      <Pixels x={fx} y={fy} values={FACE} cell={s} show="none" d={0} />
      <Text x={fx + 6 * s} y={fy + 15 * s + 16} text={bi("15 × 12 pixels", "15 × 12 بكسلًا")} tone="muted" size={11} d={200} />
      <Frame x={fx + c0 * s} y={fy + r0 * s} w={cols * s} h={rows * s} d={400} />
      <Pixels x={zx} y={zy} values={crop(FACE, r0, c0, rows, cols)} cell={z} outline={(i, j) => (i === pr && j === pc ? "gold" : undefined)} d={700} stagger={80} />
      {Array.from({ length: cols }, (_, j) => (
        <Text key={`c${j}`} x={zx + j * z + z / 2} y={zy - 10} text={String(c0 + j + base)} size={11} tone={j === pc ? "gold" : "muted"} mono d={1000} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <Text key={`r${i}`} x={zx - 8} y={zy + i * z + z / 2} text={String(r0 + i + base)} anchor="end" size={11} tone={i === pr ? "gold" : "muted"} mono d={1000} />
      ))}
      <Text x={500} y={128} text={numpy ? bi("indices from 0", "الفهارس من 0") : bi("indices from 1", "الفهارس من 1")} tone="heading" size={12} d={1200} />
      <Chip x={500} y={176} text={numpy ? `f[${r}, ${c}] = ${pickedValue}` : `f(${r}, ${c}) = ${pickedValue}`} tone="gold" center d={1400} />
    </Svg>
  );
}

/* ---------- A row as a function ---------- */

const ROW_INDEX = 4;

function FunctionView() {
  const row = FACE[ROW_INDEX];
  const cell = 38;
  const x = 52;
  return (
    <Svg>
      <Text x={280} y={20} text={bi(`Row ${ROW_INDEX + 1} of the face, as heights`, `الصف ${ROW_INDEX + 1} من الوجه على هيئة ارتفاعات`)} tone="heading" size={12.5} d={0} />
      <Pixels x={x} y={48} values={[row]} cell={cell} d={100} />
      <Bars x={x} y={104} w={row.length * cell} h={146} values={row} max={255} tone="slate" barTone={(i) => (row[i] >= 200 ? "gold" : undefined)} d={600} gap={0.22} />
      <Text x={x - 8} y={104} text="255" anchor="end" size={10} tone="muted" mono d={600} />
      <Text x={x - 8} y={250} text="0" anchor="end" size={10} tone="muted" mono d={600} />
    </Svg>
  );
}

/* ---------- Neighbourhoods ---------- */

const inN8 = (r: number, c: number) => Math.abs(r - CENTRE.r) <= 1 && Math.abs(c - CENTRE.c) <= 1;
const inN4 = (r: number, c: number) => Math.abs(r - CENTRE.r) + Math.abs(c - CENTRE.c) === 1;
const isCentre = (r: number, c: number) => r === CENTRE.r && c === CENTRE.c;

function Neighbourhood({ control }: { control: string }) {
  const cell = 56;
  const x = 140;
  const y = 58;
  const member = control === "n4" ? inN4 : control === "n8" ? (r: number, c: number) => inN8(r, c) && !isCentre(r, c) : (r: number, c: number) => !isCentre(r, c);
  const ring = (r: number, c: number): LineTone | undefined => (isCentre(r, c) ? "danger" : member(r, c) ? "gold" : undefined);
  const count = control === "n4" ? bi("4 neighbours: share an edge", "4 جيران: يشاركونه ضلعًا") : control === "n8" ? bi("8 neighbours: edge or corner", "8 جيران: ضلعًا أو ركنًا") : bi("3 × 5 = 15 pixels", "3 × 5 = 15 بكسلًا");
  return (
    <Svg>
      <Text x={280} y={22} text={bi(`Current pixel: ${centreValue}`, `البكسل الحالي: ${centreValue}`)} tone="heading" size={12.5} d={0} />
      <Pixels x={x} y={y} values={NEIGHBOURHOOD} cell={cell} outline={ring} d={100} stagger={80} />
      {NEIGHBOURHOOD.map((row, r) => row.map((_, c) => (isCentre(r, c) || member(r, c) ? null : <Veil key={`${r}-${c}`} x={x + c * cell} y={y + r * cell} w={cell} h={cell} d={700} />)))}
      <Chip x={280} y={256} text={count} tone="gold" center d={900} />
    </Svg>
  );
}

/* ---------- Point vs neighbourhood operations ---------- */

function Operations({ control }: { control: string }) {
  const neigh = control === "neigh";
  const cell = 44;
  const x = 24;
  const y = 64;
  const used = (r: number, c: number) => (neigh ? inN8(r, c) : isCentre(r, c));
  const out = neigh ? neighbourhoodMean : pointResult;
  const from: [number, number] = [x + 5 * cell + 6, y + 1.5 * cell];
  return (
    <Svg>
      <Pixels x={x} y={y} values={NEIGHBOURHOOD} cell={cell} outline={(r, c) => (used(r, c) ? "gold" : undefined)} d={0} stagger={60} />
      {NEIGHBOURHOOD.map((row, r) => row.map((_, c) => (used(r, c) ? null : <Veil key={`${r}-${c}`} x={x + c * cell} y={y + r * cell} w={cell} h={cell} d={500} />)))}
      <Chip x={x + 2.5 * cell} y={y + 3 * cell + 32} text={neigh ? bi("reads 9 pixels", "يقرأ 9 بكسلات") : bi("reads 1 pixel", "يقرأ بكسلًا واحدًا")} tone="outline" center d={700} />
      <Arrow pts={[from, [404, y + 1.5 * cell]]} tone="gold" d={800} />
      <Token pts={[from, [404, y + 1.5 * cell]]} d={900} dur={500} />
      <Text x={(from[0] + 404) / 2} y={y + 1.5 * cell - 22} text={neigh ? "1200 / 9 ≈ 133" : `${centreValue} + ${POINT_ADD} = ${pointResult}`} size={12} tone="heading" mono d={1000} />
      <Pixels x={410} y={y + 1.5 * cell - 30} values={[[out]]} cell={60} d={1300} />
      <Text x={440} y={y + 1.5 * cell + 48} text={bi("output pixel", "بكسل الخرج")} tone="heading" size={12} d={1400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof pixels>>({
  matrix: Matrix,
  function: FunctionView,
  neighbourhood: Neighbourhood,
  operations: Operations,
});
