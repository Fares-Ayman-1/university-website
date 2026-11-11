"use client";

import type { tactile } from "@/lib/walkthroughs/robotics/lecture-04";
import { centreOfPressure, pressureMap } from "@/lib/widgets/rob-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Person, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import w from "../../../../Walkthrough.module.css";
import { Dot, Spin, Stroke, Travel, Until } from "./local";

/** A grid of taxels shaded by load (gold, darker = more force), values printed where loaded. */
function Taxels({ x, y, map, cell, max = 9, numbers = true, d = 0, stagger = 40 }: { x: number; y: number; map: readonly (readonly number[])[]; cell: number; max?: number; numbers?: boolean; d?: number; stagger?: number }) {
  return (
    <>
      {map.map((row, r) => (
        <In key={r} d={d + r * stagger}>
          {row.map((v, c) => (
            <g key={c}>
              <rect x={x + c * cell} y={y + r * cell} width={cell} height={cell} style={{ fill: "var(--surface)", stroke: "var(--border-strong)", strokeWidth: 0.8 }} />
              {v > 0 ? <rect x={x + c * cell + 1} y={y + r * cell + 1} width={cell - 2} height={cell - 2} style={{ fill: "var(--gold)", opacity: 0.18 + 0.82 * (v / max) }} /> : null}
              {numbers && v > 0 ? (
                <text x={x + c * cell + cell / 2} y={y + r * cell + cell / 2} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} className={`${w.mono}`} style={{ fill: v / max > 0.55 ? "var(--navy)" : "var(--heading)" }}>
                  {v}
                </text>
              ) : null}
            </g>
          ))}
        </In>
      ))}
    </>
  );
}

// ---------- An array of elements ----------
const LAYERS: { at: number; y: number; label: Bi }[] = [
  { at: 160, y: 118, label: bi("outer layer", "الطبقة الخارجية") },
  { at: 173, y: 166, label: bi("sensing elements", "عناصر الاستشعار") },
  { at: 187, y: 212, label: bi("base", "القاعدة") },
];

function ArrayPress({ control }: { control: string }) {
  const firm = control === "firm";
  const map = pressureMap(8, 3.5, 3.5, firm ? 1.5 : 0.85, firm ? 9 : 5);
  const { active } = centreOfPressure(map);
  const under = firm ? [1, 2, 3, 4, 5] : [2, 3, 4];
  return (
    <Svg>
      <Text x={132} y={20} text={bi("pressure map, seen from above", "خريطة الضغط من أعلى")} size={11.5} tone="heading" d={0} />
      <Taxels x={36} y={42} map={map} cell={24} d={900} />
      <Text x={132} y={256} text={bi(`${active} of 64 elements loaded`, `${active} عنصرًا من 64 محمَّلة`)} size={11} tone="muted" d={1400} />
      <In d={0}>
        <Box x={280} y={154} w={140} h={12} r={3} tone="slate" />
        {Array.from({ length: 7 }, (_, k) => (
          <Box key={k} x={282 + k * 20} y={168} w={16} h={10} r={2} tone="outline" />
        ))}
        <Box x={280} y={180} w={140} h={14} r={3} tone="muted" />
      </In>
      {under.map((k) => (
        <Box key={k} x={282 + k * 20} y={168} w={16} h={10} r={2} tone="gold" d={900} />
      ))}
      <Travel pts={[[0, -34], [0, firm ? 3 : 0]]} d={300} dur={600}>
        <Box x={318} y={44} w={64} h={110} r={30} tone="outline" label={bi("finger", "الإصبع")} size={11} />
      </Travel>
      {LAYERS.map((l, i) => (
        <Fade key={i} d={200}>
          <Stroke pts={[[422, l.at], [434, l.at], [440, l.y + 6]]} tone="faint" width={1} />
        </Fade>
      ))}
      {LAYERS.map((l, i) => (
        <Text key={i} x={444} y={l.y} text={l.label} anchor="start" size={10.5} tone="muted" d={200} />
      ))}
      <Text x={350} y={250} text={bi("cross-section (slide 40)", "مقطع عرضي (الشريحة 40)")} size={10.5} tone="muted" d={200} />
    </Svg>
  );
}

// ---------- In a finger ----------
const PAD = { rows: 8, cols: 5, cell: 22, x: 300, y: 56 } as const;
const GRIPS = {
  centred: { row: 3.5, objY: 100 },
  offset: { row: 1.1, objY: 74 },
  slip: { row: 5.2, objY: 118 },
} as const;

function Grip({ control }: { control: string }) {
  const kind = (control in GRIPS ? control : "centred") as keyof typeof GRIPS;
  const g = GRIPS[kind];
  const map = pressureMap(PAD.rows, g.row, 2, 1.1, 9);
  const cop = centreOfPressure(map);
  const copAt = (row: number, col: number): Pt => [PAD.x + (col + 0.5) * PAD.cell, PAD.y + (row + 0.5) * PAD.cell];
  const start = pressureMap(PAD.rows, GRIPS.centred.row, 2, 1.1, 9);
  const startCop = centreOfPressure(start);
  const slip = kind === "slip";
  const shift = 1400;
  return (
    <Svg>
      <In d={0}>
        <Box x={40} y={206} w={200} h={22} r={4} tone="navy" />
        <Box x={56} y={66} w={22} h={142} r={4} tone="slate" />
        <Box x={202} y={66} w={22} h={142} r={4} tone="slate" />
        <Box x={196} y={80} w={6} h={118} r={2} tone="gold" />
      </In>
      {slip ? (
        <>
          <Travel pts={[[0, GRIPS.centred.objY - g.objY], [0, 0]]} d={shift - 500} dur={900}>
            <Box x={84} y={g.objY} w={112} h={70} r={6} tone="outline" label={bi("object", "الجسم")} size={11} />
          </Travel>
          <Arrow pts={[[140, 52], [140, 92]]} tone="danger" d={shift} dur={400} />
        </>
      ) : (
        <Box x={84} y={g.objY} w={112} h={70} r={6} tone="outline" label={bi("object", "الجسم")} size={11} d={0} />
      )}
      <Text x={140} y={250} text={bi("tactile pad on the finger", "وسادة لمسية على الإصبع")} size={11} tone="muted" d={100} />
      <Stroke pts={[[199, 198], [199, 238], [180, 238]]} tone="faint" width={1} d={100} />
      <Text x={355} y={34} text={bi("pad pressure map", "خريطة ضغط الوسادة")} size={11.5} tone="heading" d={200} />
      {slip ? (
        <Until at={shift}>
          <Taxels x={PAD.x} y={PAD.y} map={start} cell={PAD.cell} numbers={false} d={300} />
        </Until>
      ) : null}
      <Taxels x={PAD.x} y={PAD.y} map={map} cell={PAD.cell} numbers={false} d={slip ? shift : 300} stagger={slip ? 0 : 40} />
      {slip ? (
        <>
          <Dot at={copAt(startCop.row, startCop.col)} r={7} tone="faint" ring d={shift} />
          <Arrow pts={[copAt(startCop.row, startCop.col + 0.6), copAt(cop.row - 0.6, cop.col + 0.6)]} tone="danger" d={shift + 200} dur={400} />
        </>
      ) : null}
      <Dot at={copAt(cop.row, cop.col)} r={7} tone="danger" ring d={slip ? shift + 300 : 900} />
      <Stroke pts={[[copAt(cop.row, cop.col)[0] + 8, copAt(cop.row, cop.col)[1]], [416, copAt(cop.row, cop.col)[1]]]} tone="faint" width={1} d={slip ? shift + 300 : 900} />
      <Text x={420} y={copAt(cop.row, cop.col)[1]} text={bi("centre of pressure", "مركز الضغط")} anchor="start" size={10.5} tone="danger" d={slip ? shift + 300 : 900} />
      <Chip
        x={445}
        y={256}
        text={kind === "offset" ? bi("held off-centre", "ممسوك بعيدًا عن المركز") : slip ? bi("slipping: tighten the grip", "ينزلق: شُدَّ القبضة") : bi("held squarely", "ممسوك باستقامة")}
        tone={kind === "centred" ? "success" : "danger"}
        center
        d={slip ? shift + 500 : 1100}
      />
    </Svg>
  );
}

// ---------- Robot skin ----------
const ARM: Pt[] = [
  [205, 208],
  [250, 106],
  [372, 82],
];

function Arm({ skin, d = 0 }: { skin: boolean; d?: number }) {
  const bands = skin
    ? ARM.slice(1).flatMap((p, i) => {
        const a = ARM[i];
        const len = Math.hypot(p[0] - a[0], p[1] - a[1]);
        const [ux, uy] = [(p[0] - a[0]) / len, (p[1] - a[1]) / len];
        return Array.from({ length: Math.floor(len / 12) - 1 }, (_, k) => {
          const t = 12 * (k + 1);
          const c: Pt = [a[0] + ux * t, a[1] + uy * t];
          return [
            [c[0] - uy * 9, c[1] + ux * 9],
            [c[0] + uy * 9, c[1] - ux * 9],
          ] as Pt[];
        });
      })
    : [];
  return (
    <In d={d}>
      <Box x={170} y={208} w={70} h={24} r={4} tone="navy" />
      <Stroke pts={ARM} tone="slate" width={18} />
      {bands.map((b, i) => (
        <Stroke key={i} pts={b} tone="gold" width={2} cap="butt" />
      ))}
      {ARM.map((p, i) => (
        <Dot key={i} at={p} r={i === 2 ? 5 : 7} tone="navy" ring />
      ))}
      <Stroke pts={[ARM[2], [ARM[2][0] + 20, ARM[2][1] - 12]]} tone="navy" width={3} />
      <Stroke pts={[ARM[2], [ARM[2][0] + 22, ARM[2][1] + 8]]} tone="navy" width={3} />
    </In>
  );
}

function Skin({ control }: { control: string }) {
  const skin = control === "skin";
  if (!skin) {
    return (
      <Svg>
        <Box x={120} y={40} w={300} h={196} r={6} tone="ghost" dashed d={300} />
        <Text x={270} y={20} text={bi("guarded envelope: a fence", "منطقة محروسة: سياج")} size={11.5} tone="heading" d={300} />
        <Arm skin={false} d={0} />
        <Person x={490} y={110} tone="outline" label={bi("people stay out", "يبقى الناس خارجها")} d={600} />
        <Chip x={270} y={256} text={bi("safe because nobody is near it", "آمن لأن لا أحد بقربه")} tone="slate" center d={900} />
      </Svg>
    );
  }
  const touch: Pt = [340, 88];
  return (
    <Svg>
      <Arm skin d={0} />
      <Text x={178} y={100} text={bi("tactile skin", "جلد لمسي")} size={11} tone="gold" d={300} />
      <Person x={470} y={110} tone="outline" label={bi("a person works beside it", "شخص يعمل بجانبه")} d={300} />
      <Arrow pts={[[456, 146], touch]} tone="slate" d={800} dur={600} />
      <Fade d={1400}>
        <circle cx={touch[0]} cy={touch[1]} r={14} style={{ fill: "var(--danger-soft)", stroke: "var(--danger)", strokeWidth: 2 }} />
      </Fade>
      <Chip x={340} y={38} text={bi("contact felt: stop", "شُعر بالتلامس: توقّف")} tone="danger" center d={1600} />
      <Chip x={270} y={256} text={bi("safe because it responds to contact", "آمن لأنه يستجيب للتلامس")} tone="success" center d={1900} />
    </Svg>
  );
}

// ---------- Sensing principles ----------
const FORCE_D = 300;
const PRESS = 900;
const PRESS_DUR = 600;

function Force({ x, y }: { x: number; y: number }) {
  return <Arrow pts={[[x, y - 46], [x, y - 4]]} tone="danger" d={FORCE_D} dur={400} label={bi("force", "القوة")} labelAt={[x + 34, y - 38]} labelTone="danger" />;
}

function Readout({ title, change, note }: { title: Bi; change: Bi; note: Bi }) {
  return (
    <>
      <Text x={424} y={64} text={title} size={12} tone="heading" d={200} />
      <Chip x={424} y={124} text={change} tone="gold" center d={PRESS + PRESS_DUR} />
      <Text x={424} y={182} text={note} size={10.5} tone="muted" d={PRESS + PRESS_DUR + 200} />
    </>
  );
}

function Deformation() {
  return (
    <>
      <Box x={36} y={70} w={16} h={110} r={2} tone="slate" d={0} />
      <Spin cx={52} cy={124} deg={6} d={PRESS} dur={PRESS_DUR}>
        <In d={0}>
          <Box x={52} y={118} w={200} h={14} r={2} tone="outline" />
          <Stroke pts={[[96, 116], [102, 112], [108, 116], [114, 112], [120, 116], [126, 112], [132, 116], [138, 112], [144, 116]]} tone="gold" width={2} />
        </In>
      </Spin>
      <Force x={236} y={118} />
      <Text x={120} y={86} text={bi("strain gauge", "مقياس الانفعال")} size={10.5} tone="gold" d={200} />
      <In d={500}>
        <path d="M150,182 L196,214 L150,246 L104,214 Z" style={{ fill: "none", stroke: "var(--heading)", strokeWidth: 1.6 }} />
        {(
          [
            [127, 198],
            [173, 198],
            [127, 230],
            [173, 230],
          ] as Pt[]
        ).map((p, i) => (
          <rect key={i} x={p[0] - 7} y={p[1] - 4} width={14} height={8} rx={1} transform={`rotate(${i === 0 || i === 3 ? -35 : 35} ${p[0]} ${p[1]})`} style={{ fill: i === 0 ? "var(--gold)" : "var(--surface)", stroke: "var(--heading)", strokeWidth: 1.2 }} />
        ))}
      </In>
      <Text x={150} y={214} text="ΔV" mono size={12} tone="heading" d={PRESS + PRESS_DUR} />
      <Text x={236} y={214} text={bi("Wheatstone bridge", "قنطرة ويتستون")} anchor="start" size={10.5} tone="muted" d={600} />
    </>
  );
}

function Layers({ moving, gap, fillMid }: { moving: React.ReactNode; gap: number; fillMid?: string }) {
  return (
    <>
      <Box x={80} y={172} w={200} h={12} r={2} tone="navy" d={0} />
      {fillMid ? (
        <>
          <Until at={PRESS}>
            <rect x={80} y={172 - gap} width={200} height={gap} style={{ fill: fillMid }} />
          </Until>
          <Fade d={PRESS}>
            <rect x={80} y={172 - gap + 10} width={200} height={gap - 10} style={{ fill: fillMid, filter: "saturate(1.6)" }} />
          </Fade>
        </>
      ) : null}
      <Travel pts={[[0, 0], [0, 10]]} d={PRESS} dur={PRESS_DUR}>
        {moving}
      </Travel>
    </>
  );
}

function Resistive() {
  return (
    <>
      <Layers gap={44} fillMid="var(--warning-soft)" moving={<Box x={80} y={116} w={200} h={12} r={2} tone="navy" />} />
      <Force x={180} y={126} />
      <Text x={180} y={148} text={bi("pressure-sensitive material", "مادة حساسة للضغط")} size={10.5} tone="heading" d={200} />
      <Text x={180} y={204} text={bi("two electrodes", "قطبان كهربائيان")} size={10.5} tone="muted" d={200} />
    </>
  );
}

function Capacitive() {
  return (
    <>
      <Layers gap={44} moving={<Box x={80} y={116} w={200} h={12} r={2} tone="navy" />} />
      <Force x={180} y={126} />
      <Text x={180} y={150} text={bi("gap d between the plates", "الفجوة d بين اللوحين")} size={10.5} tone="heading" d={200} />
    </>
  );
}

function Optical() {
  return (
    <>
      <Box x={70} y={196} w={220} h={14} r={2} tone="muted" d={0} />
      <Box x={92} y={178} w={26} h={18} r={3} tone="gold" label="LED" size={9} mono d={0} />
      <Box x={242} y={178} w={26} h={18} r={3} tone="navy" d={0} />
      <Until at={PRESS + PRESS_DUR / 2}>
        <Stroke pts={[[110, 178], [180, 118], [250, 178]]} tone="gold" width={2.6} />
      </Until>
      <Fade d={PRESS + PRESS_DUR / 2}>
        <Stroke pts={[[110, 178], [180, 118], [250, 178]]} tone="gold" width={1.2} opacity={0.45} dashed />
      </Fade>
      <Box x={70} y={104} w={220} h={10} r={2} tone="slate" d={0} />
      <Until at={PRESS}>
        <Box x={208} y={112} w={10} h={28} r={2} tone="slate" />
      </Until>
      <Fade d={PRESS}>
        <Box x={208} y={112} w={10} h={70} r={2} tone="slate" />
      </Fade>
      <Force x={213} y={104} />
      <Text x={255} y={234} text={bi("photodiode", "ثنائي ضوئي")} size={10.5} tone="muted" d={200} />
      <Text x={105} y={234} text={bi("light source", "مصدر الضوء")} size={10.5} tone="muted" d={200} />
    </>
  );
}

function Magnetic() {
  return (
    <>
      <Box x={70} y={196} w={220} h={14} r={2} tone="muted" d={0} />
      <Box x={165} y={180} w={30} h={16} r={3} tone="navy" label="B" mono size={10} d={0} />
      <rect x={70} y={104} width={220} height={60} rx={6} style={{ fill: "var(--warning-soft)", stroke: "var(--warning)", strokeWidth: 1.4 }} />
      <Travel pts={[[0, 0], [0, 22]]} d={PRESS} dur={PRESS_DUR}>
        <Box x={165} y={116} w={30} h={20} r={3} tone="danger" label="N" mono size={11} />
      </Travel>
      <Force x={180} y={104} />
      <Text x={250} y={134} text={bi("soft layer", "طبقة لينة")} size={10.5} tone="heading" d={200} />
      <Text x={180} y={228} text={bi("field sensor", "مستشعر المجال")} size={10.5} tone="muted" d={200} />
    </>
  );
}

function Mechanical() {
  return (
    <>
      <Box x={70} y={196} w={220} h={14} r={2} tone="muted" d={0} />
      <Box x={84} y={168} w={22} h={28} r={2} tone="slate" d={0} />
      <Box x={222} y={182} w={30} h={14} r={2} tone="navy" d={0} />
      <Spin cx={96} cy={170} deg={10} d={PRESS} dur={PRESS_DUR}>
        <Stroke pts={[[96, 170], [232, 143]]} tone="navy" width={4} d={0} />
      </Spin>
      <Force x={200} y={160} />
      <Text x={237} y={222} text={bi("contact", "نقطة التماس")} size={10.5} tone="muted" d={200} />
      <Text x={120} y={232} text={bi("micro-switch lever", "ذراع المفتاح الدقيق")} size={10.5} tone="muted" d={200} />
    </>
  );
}

const PRINCIPLES: Record<string, { draw: () => React.ReactElement; title: Bi; change: Bi; note: Bi }> = {
  deformation: {
    draw: Deformation,
    title: bi("Deformation-based", "قائم على التشوّه"),
    change: bi("the bridge turns ΔR into ΔV", "القنطرة تحوّل ΔR إلى ΔV"),
    note: bi("a tiny change, made measurable", "تغيّر ضئيل يصبح قابلًا للقياس"),
  },
  resistive: {
    draw: Resistive,
    title: bi("Resistive", "مقاومي"),
    change: bi("squeezed: R changes", "عند الضغط: تتغير R"),
    note: bi("cheap, thin, flexible sheets", "صفائح رخيصة ورقيقة ومرنة"),
  },
  capacitive: {
    draw: Capacitive,
    title: bi("Capacitive", "سعوي"),
    change: bi("smaller gap: C changes", "فجوة أصغر: تتغير C"),
    note: bi("sensitive; feels a hand approach", "حساس؛ يشعر بيد تقترب"),
  },
  optical: {
    draw: Optical,
    title: bi("Optical", "ضوئي"),
    change: bi("received light changes", "يتغير الضوء المستقبَل"),
    note: bi("immune to electrical interference", "محصَّن ضد التداخل الكهربائي"),
  },
  magnetic: {
    draw: Magnetic,
    title: bi("Magnetic", "مغناطيسي"),
    change: bi("magnet moves: field changes", "يتحرك المغناطيس: يتغير المجال"),
    note: bi("field change measured below", "يُقاس تغيّر المجال من أسفل"),
  },
  mechanical: {
    draw: Mechanical,
    title: bi("Mechanical", "ميكانيكي"),
    change: bi("switch closes: 0 becomes 1", "ينغلق المفتاح: 0 يصبح 1"),
    note: bi("one bit per element", "بِت واحد لكل عنصر"),
  },
};

function Principles({ control }: { control: string }) {
  const p = PRINCIPLES[control] ?? PRINCIPLES.deformation;
  const Draw = p.draw;
  return (
    <Svg>
      <Draw />
      <Readout title={p.title} change={p.change} note={p.note} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof tactile>>({
  array: ArrayPress,
  grip: Grip,
  skin: Skin,
  principles: Principles,
});
