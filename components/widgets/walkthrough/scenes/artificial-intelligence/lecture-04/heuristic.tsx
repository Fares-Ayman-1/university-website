"use client";

import { cityName } from "@/lib/widgets/ai-lecture-02";
import { BOOK_H, CITIES, GOAL, H_SLD, H_STAR, IMPLIED_H, START, OPTIMAL_ROUTE } from "@/lib/widgets/ai-lecture-04";
import type { heuristic } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Mark, Text, Svg, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Key, RomaniaMap, SIDE_MAP, WIDE_MAP, placeCity, shortName, trim } from "./local";

function Estimate() {
  const arad: Pt = [62, 150];
  const zer: Pt = [140, 80];
  const ora: Pt = [220, 80];
  const sib: Pt = [298, 150];
  const buc: Pt = [490, 150];
  return (
    <Svg>
      <Arrow pts={[[94, 150], [262, 150]]} tone="navy" d={300} dur={420} />
      <Text x={178} y={166} text="g = 140" mono size={11} tone="heading" d={600} />
      <Arrow pts={[[80, 136], [118, 92]]} tone="slate" d={700} dur={260} />
      <Arrow pts={[[166, 80], [192, 80]]} tone="slate" d={900} dur={200} />
      <Arrow pts={[[240, 92], [282, 136]]} tone="slate" d={1100} dur={260} />
      <Text x={180} y={52} text="g = 75 + 71 + 151 = 297" mono size={11} tone="slate" d={1300} />
      <Box x={arad[0] - 32} y={arad[1] - 14} w={64} h={28} label="Arad" tone="navy" size={11.5} d={0} />
      <Box x={zer[0] - 26} y={zer[1] - 13} w={52} h={26} label="Zerind" tone="outline" size={10} d={700} />
      <Box x={ora[0] - 26} y={ora[1] - 13} w={52} h={26} label="Oradea" tone="outline" size={10} d={900} />
      <Box x={sib[0] - 34} y={sib[1] - 14} w={68} h={28} label="Sibiu" tone="gold" size={11.5} d={200} />
      <Box x={buc[0] - 44} y={buc[1] - 14} w={88} h={28} label="Bucharest" tone="success" size={11.5} d={200} />
      <Arrow pts={[[334, 150], [444, 150]]} tone="gold" dashed d={1600} />
      <Text x={389} y={136} text={`h = ${H_SLD.Sibiu}`} mono size={11.5} tone="gold" d={1700} />
      <Text x={389} y={166} text={bi("estimated", "تقدير")} size={10.5} tone="muted" d={1800} />
      <Text x={490} y={176} text="h = 0" mono size={11} tone="success" d={1900} />
      <Chip x={150} y={236} text={bi("g: known, depends on the path", "g: معلومة، وتعتمد على المسار")} tone="navy" center size={10.5} d={2100} />
      <Chip x={410} y={236} text={bi("h: estimated, depends on the state", "h: مقدَّرة، وتعتمد على الحالة")} tone="gold" center size={10.5} d={2300} />
    </Svg>
  );
}

/** Where a city's h-value sits: on the far side from Bucharest, so it misses the dashed line. */
function awayFromGoal(city: string, r: number): Pt {
  const [x, y] = placeCity(WIDE_MAP, city);
  const [bx, by] = placeCity(WIDE_MAP, GOAL);
  if (city === GOAL) return [x + 18, y + 16];
  // Pitesti sits where the lines from the west converge: its gap is straight above it.
  if (city === "Pitesti") return [x, y - r - 16];
  const len = Math.hypot(x - bx, y - by);
  const k = r + 13;
  return [x + ((x - bx) / len) * k, y + ((y - by) / len) * k];
}

function Sld() {
  const r = 10;
  const others = CITIES.filter((c) => c !== GOAL);
  return (
    <Svg>
      {others.map((c, i) => {
        const [a, b] = trim(placeCity(WIDE_MAP, c), placeCity(WIDE_MAP, GOAL), r, r);
        return <Arrow key={c} pts={[a, b]} tone={c === START ? "gold" : "faint"} dashed head={false} d={200 + i * 40} width={c === START ? 2.2 : undefined} />;
      })}
      <RomaniaMap box={WIDE_MAP} r={r} size={11} look={(c) => (c === GOAL ? "success" : c === START ? "gold" : "outline")} withRoads={false} d={0} />
      {CITIES.map((c, i) => {
        const [x, y] = awayFromGoal(c, r);
        return <Text key={c} x={x} y={y} text={String(H_SLD[c])} mono size={10} tone={c === START ? "gold" : c === GOAL ? "success" : "muted"} d={1000 + i * 40} />;
      })}
      <Chip x={452} y={44} text={`h_SLD(Arad) = ${H_SLD.Arad} km`} tone="gold" center size={11} d={1900} />
    </Svg>
  );
}

function sourceTone(c: string): Tone {
  return BOOK_H.includes(c) ? "gold" : IMPLIED_H.includes(c) ? "slate" : "outline";
}

function Table() {
  const cols = 4;
  const perCol = CITIES.length / cols;
  return (
    <Svg>
      {CITIES.map((c, i) => {
        const col = Math.floor(i / perCol);
        const row = i % perCol;
        return <Box key={c} x={22 + col * 130} y={44 + row * 36} w={124} h={30} r={6} label={`${shortName(c).padEnd(11)}${String(H_SLD[c]).padStart(3)}`} tone={sourceTone(c)} size={11} mono d={col * 250 + row * 60} />;
      })}
      <Key x={30} y={240} tone="gold" text={bi("printed in the book", "مطبوعة في الكتاب")} d={1300} />
      <Key x={208} y={240} tone="slate" text={bi("implied by f = 417", "ناتجة من f = 417")} d={1450} />
      <Key x={378} y={240} tone="outline" text={bi("from AIMA's table", "من جدول AIMA")} d={1600} />
    </Svg>
  );
}

function Knowledge() {
  const route = OPTIMAL_ROUTE;
  const on = new Set(route);
  const [a, b] = trim(placeCity(SIDE_MAP, START), placeCity(SIDE_MAP, GOAL), 10, 10);
  return (
    <Svg>
      <RomaniaMap
        box={SIDE_MAP}
        look={(c) => (c === START ? "gold" : c === GOAL ? "success" : on.has(c) ? "navy" : "muted")}
        lines={[{ path: route, tone: "navy", d: 600 }]}
      />
      <Arrow pts={[a, b]} tone="gold" dashed head={false} d={1300} width={2.2} />
      <Box x={318} y={46} w={226} h={44} label={bi("Arad and Bucharest on the map", "Arad و Bucharest على الخريطة")} tone="outline" size={11} d={200} />
      <Text x={431} y={104} text={bi("coordinates are world knowledge", "الإحداثيات معرفة بالعالم")} tone="muted" size={10} d={400} />
      <Box x={318} y={134} w={226} h={44} label={bi(`straight line: ${H_SLD.Arad} km`, `خط مستقيم: ${H_SLD.Arad} km`)} tone="gold" size={11.5} d={1400} />
      <Box x={318} y={186} w={226} h={44} label={bi(`best road: ${H_STAR.Arad} km`, `أفضل طريق: ${H_STAR.Arad} km`)} tone="navy" size={11.5} d={900} />
      <Text x={420} y={252} text={`${H_SLD.Arad} ≤ ${H_STAR.Arad}`} mono size={13} tone="success" d={1800} />
      <Mark x={486} y={252} ok d={1900} />
      <Text x={168} y={262} text={route.map((c) => cityName(c)[0]).join(" → ")} mono size={10} tone="muted" d={1000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof heuristic>>({ estimate: Estimate, sld: Sld, table: Table, knowledge: Knowledge });
