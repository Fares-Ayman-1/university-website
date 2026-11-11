"use client";

import type { photoelectric } from "@/lib/walkthroughs/robotics/lecture-03";
import { PHOTO_TYPES, RANGE_MM, logX, outputOn, receiverLit, type Operation, type PhotoType } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import type { Bi } from "../../../../types";
import { Arrow, Box, Chip, In, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Lamp, Meter, Swatch } from "./local";

const TYPE_NAME: Record<PhotoType, Bi> = {
  through: bi("Through-beam", "الشعاع المباشر"),
  retro: bi("Retro-reflective", "العاكس الارتدادي"),
  diffuse: bi("Diffuse", "الانعكاس المنتشر"),
};
const LIT = bi("light", "ضوء");
const DARK = bi("dark", "ظلام");

/** One row of the arrangement: housings, beam and object, with the receiver's state at the right. */
function Row({ type, object, yc, d }: { type: PhotoType; object: boolean; yc: number; d: number }) {
  const lit = receiverLit(type, object);
  const one = type !== "through";
  const objX = 270;
  return (
    <>
      {one ? <Box x={90} y={yc - 20} w={50} h={40} r={6} tone="navy" label="E | R" mono size={11} d={d} /> : <Box x={90} y={yc - 16} w={36} h={32} r={6} tone="navy" label="E" mono size={12} d={d} />}
      {type === "through" ? <Box x={444} y={yc - 16} w={36} h={32} r={6} tone={lit ? "gold" : "muted"} label="R" mono size={12} d={d + 50} /> : null}
      {type === "retro" ? (
        <>
          <Box x={456} y={yc - 22} w={12} h={44} r={2} tone="warn" d={d + 50} />
          <Text x={462} y={yc + 34} text={bi("reflector", "العاكس")} size={10} tone="muted" d={d + 50} />
        </>
      ) : null}
      {type === "through" ? (
        <Arrow pts={[[127, yc], [object ? objX - 2 : 442, yc]]} tone="gold" d={d + 200} dur={500} width={2.6} />
      ) : type === "retro" ? (
        <>
          <Arrow pts={[[141, yc - 7], [object ? objX - 2 : 454, yc - 7]]} tone="gold" d={d + 200} dur={500} width={2.4} />
          {object ? null : <Arrow pts={[[454, yc + 7], [143, yc + 7]]} tone="gold" dashed d={d + 700} />}
        </>
      ) : (
        <>
          <Arrow pts={[[141, yc - 7], [object ? objX - 2 : 420, yc - 7]]} tone="gold" head={object} d={d + 200} dur={500} width={2.4} />
          {object ? (
            <>
              <Arrow pts={[[objX - 4, yc + 2], [143, yc + 8]]} tone="gold" dashed d={d + 700} />
              <Arrow pts={[[objX - 4, yc - 2], [objX - 40, yc - 26]]} tone="gold" dashed head={false} d={d + 700} />
              <Arrow pts={[[objX - 4, yc + 4], [objX - 40, yc + 26]]} tone="gold" dashed head={false} d={d + 700} />
            </>
          ) : (
            <Arrow pts={[[420, yc - 7], [520, yc - 7]]} tone="faint" dashed head={false} d={d + 600} />
          )}
        </>
      )}
      {object ? <Box x={objX} y={yc - 26} w={40} h={52} r={6} tone="slate" d={d + 100} /> : null}
      <Chip x={528} y={yc} text={lit ? LIT : DARK} tone={lit ? "gold" : "muted"} center d={d + 900} />
    </>
  );
}

function Types({ control }: { control: string }) {
  const type = (PHOTO_TYPES as readonly string[]).includes(control) ? (control as PhotoType) : "through";
  return (
    <Svg>
      <Text x={300} y={22} text={bi("E = emitter · R = receiver", "E = المُرسِل · R = المُستقبِل")} size={11} tone="muted" d={0} />
      <Text x={44} y={84} text={bi("no object", "لا جسم")} size={11} tone="heading" d={0} />
      <Text x={44} y={194} text={bi("object", "جسم موجود")} size={11} tone="heading" d={600} />
      <Arrow pts={[[16, 139], [544, 139]]} tone="faint" dashed head={false} d={0} />
      <Row type={type} object={false} yc={84} d={100} />
      <Row type={type} object yc={194} d={700} />
      <Chip
        x={300}
        y={256}
        text={type === "diffuse" ? bi("object present → light at the receiver", "الجسم موجود ← ضوء عند المُستقبِل") : bi("object present → dark at the receiver", "الجسم موجود ← ظلام عند المُستقبِل")}
        tone="outline"
        center
        d={1700}
      />
    </Svg>
  );
}

function LightDark({ control }: { control: string }) {
  const op: Operation = control === "dark" ? "dark" : "light";
  const cols = [
    { x: 16, w: 150 },
    { x: 174, w: 182 },
    { x: 364, w: 182 },
  ];
  const heads = [bi("Type", "النوع"), bi("No object", "لا جسم"), bi("Object present", "جسم موجود")];
  return (
    <Svg>
      {heads.map((h, i) => (
        <Box key={i} x={cols[i].x} y={28} w={cols[i].w} h={40} r={6} tone="navy" label={h} size={11.5} d={0} />
      ))}
      {PHOTO_TYPES.map((t, r) => {
        const y = 74 + r * 56;
        const d = 300 + r * 300;
        return (
          <g key={t}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={50} r={6} tone="outline" label={TYPE_NAME[t]} size={11.5} d={d} />
            {[false, true].map((object, c) => {
              const lit = receiverLit(t, object);
              const on = outputOn(op, lit);
              const col = cols[c + 1];
              return (
                <In key={c} d={d + 100 + c * 100}>
                  <Box x={col.x} y={y} w={col.w} h={50} r={6} tone="outline" />
                  <Lamp x={col.x + 24} y={y + 25} r={9} off={!lit} />
                  <Text x={col.x + 42} y={y + 25} text={lit ? LIT : DARK} anchor="start" size={11} tone={lit ? "gold" : "muted"} />
                  <Chip x={col.x + 140} y={y + 25} text={on ? bi("ON", "يعمل") : bi("OFF", "مطفأ")} tone={on ? "success" : "muted"} w={56} center />
                </In>
              );
            })}
          </g>
        );
      })}
      <Chip
        x={280}
        y={259}
        text={op === "light" ? bi("light-on: output on while the receiver is lit", "بالضوء: الخرج يعمل ما دام المُستقبِل مضاءً") : bi("dark-on: output on while the receiver is dark", "بالظلام: الخرج يعمل ما دام المُستقبِل مظلمًا")}
        tone={op === "light" ? "gold" : "slate"}
        center
        d={1400}
      />
    </Svg>
  );
}

function Range() {
  const x0 = 40;
  const W = 480;
  const at = (mm: number) => logX(mm, x0, W);
  const ticks: { mm: number; t: Bi }[] = [
    { mm: 1, t: bi("1 mm", "1 مم") },
    { mm: 10, t: bi("1 cm", "1 سم") },
    { mm: 100, t: bi("10 cm", "10 سم") },
    { mm: 1000, t: bi("1 m", "1 م") },
    { mm: 10000, t: bi("10 m", "10 م") },
  ];
  const [i0, i1] = RANGE_MM.inductive;
  const [c0, c1] = RANGE_MM.capacitive;
  const [p0, p1] = RANGE_MM.photoelectric;
  return (
    <Svg>
      <Chip x={112} y={32} text={bi("through-beam: longest", "الشعاع المباشر: الأطول")} tone="gold" center d={0} />
      <Chip x={280} y={32} text={bi("retro: medium–long", "العاكس: متوسط–طويل")} tone="outline" center d={150} />
      <Chip x={448} y={32} text={bi("diffuse: short–medium", "المنتشر: قصير–متوسط")} tone="outline" center d={300} />
      <Box x={at(i0)} y={76} w={at(i1) - at(i0)} h={20} r={4} tone="slate" d={500} />
      <Text x={at(i1) + 8} y={86} text={bi(`inductive ${i0}–${i1} mm`, `حثّي ${i0}–${i1} مم`)} anchor="start" size={11} tone="heading" d={600} />
      <Box x={at(c0)} y={114} w={at(c1) - at(c0)} h={20} r={4} tone="slate" d={700} />
      <Text x={at(c1) + 8} y={124} text={bi(`capacitive ${c0}–${c1} mm`, `سعوي ${c0}–${c1} مم`)} anchor="start" size={11} tone="heading" d={800} />
      <Arrow pts={[[at(p0) - 60, 166], [at(p0), 166]]} tone="gold" dashed head={false} d={900} />
      <Box x={at(p0)} y={149} w={at(p1) - at(p0)} h={34} r={5} tone="gold" label={bi(`photoelectric < ${p0 / 10} cm – ${p1 / 1000} m`, `كهروضوئي < ${p0 / 10} سم – ${p1 / 1000} م`)} size={11.5} d={1000} />
      <Arrow pts={[[x0, 206], [x0 + W + 12, 206]]} tone="faint" d={200} dur={400} />
      {ticks.map((t) => (
        <g key={t.mm}>
          <Arrow pts={[[at(t.mm), 202], [at(t.mm), 210]]} tone="faint" head={false} d={300} dur={100} />
          <Text x={at(t.mm)} y={222} text={t.t} size={10.5} tone="muted" d={350} />
        </g>
      ))}
      <Text x={280} y={256} text={bi("distance, log scale: each tick is 10× the last", "المسافة بمقياس لوغاريتمي: كل علامة 10 أضعاف سابقتها")} size={10.5} tone="muted" d={500} />
    </Svg>
  );
}

function Opto({ control }: { control: string }) {
  const black = control === "black";
  const level = black ? 0.15 : 0.85;
  const meter = { x: 470, y: 60, h: 150 };
  const thY = meter.y + meter.h * 0.5;
  return (
    <Svg>
      <Box x={120} y={40} w={180} h={30} r={5} tone="navy" label={bi("sensor board", "لوحة المستشعر")} size={11} d={0} />
      <Box x={150} y={70} w={30} h={14} r={3} tone="gold" d={100} />
      <Box x={240} y={70} w={30} h={14} r={3} tone="slate" d={150} />
      <Text x={142} y={78} text="LED" anchor="end" mono size={11} tone="heading" d={200} />
      <Text x={278} y={78} text={bi("phototransistor", "ترانزستور ضوئي")} anchor="start" size={11} tone="heading" d={250} />
      <Swatch x={40} y={190} w={340} h={22} fill={black ? "#1c1c1c" : "#f6f5ef"} d={300} />
      <Text x={210} y={228} text={black ? bi("black tape", "شريط أسود") : bi("white floor", "أرضية بيضاء")} size={11} tone="muted" d={350} />
      <Arrow pts={[[166, 88], [204, 186]]} tone="gold" d={600} dur={400} width={2.4} />
      {black ? <Arrow pts={[[214, 186], [252, 88]]} tone="faint" dashed d={1100} /> : <Arrow pts={[[214, 186], [252, 88]]} tone="gold" d={1000} dur={400} width={3.4} />}
      <Text x={483} y={36} text={bi("reading", "القراءة")} tone="heading" size={11.5} d={1200} />
      <Meter x={meter.x} y={meter.y} h={meter.h} w={26} value={level} max={1} tone={black ? "slate" : "gold"} d={1200} />
      <Arrow pts={[[meter.x - 8, thY], [meter.x + 34, thY]]} tone="danger" dashed head={false} d={1500} />
      <Text x={meter.x - 12} y={thY} text={bi("threshold", "العتبة")} anchor="end" size={10.5} tone="danger" d={1500} />
      <Chip x={483} y={240} text={black ? bi("low: on the line", "منخفضة: فوق الخط") : bi("high: on the floor", "مرتفعة: فوق الأرضية")} tone={black ? "slate" : "gold"} center d={1800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof photoelectric>>({
  types: Types,
  "light-dark": LightDark,
  range: Range,
  opto: Opto,
});
