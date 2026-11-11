"use client";

import type { limitSwitch } from "@/lib/walkthroughs/robotics/lecture-03";
import { SWITCH_V } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { Arrow, Box, Chip, Curve, Fade, In, Svg, Text, type PlotBox, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Glide, Ground, Node, Turn, Wire, polar } from "./local";
import w from "../../../../Walkthrough.module.css";

/** A switch drawn as two terminals and a blade: closed joins them, open swings the blade away. */
function Contact({ x, y1, y2, closed, d = 0 }: { x: number; y1: number; y2: number; closed: boolean; d?: number }) {
  return (
    <>
      <Node x={x} y={y1} d={d} />
      <Node x={x} y={y2} d={d} />
      <Arrow pts={closed ? [[x, y2], [x, y1 + 2]] : [[x, y2], [x + 26, y1 + 10]]} tone={closed ? "success" : "danger"} head={false} d={d + 150} dur={300} width={2.6} />
    </>
  );
}

function OnOff({ control }: { control: string }) {
  const present = control === "present";
  const plungerTop = present ? 166 : 148;
  return (
    <Svg>
      <Text x={165} y={26} text={bi("Machining table", "طاولة التشغيل الآلي")} tone="heading" size={12} d={0} />
      <Arrow pts={[[50, 184], [50, 240]]} tone="faint" head={false} d={0} dur={200} width={3} />
      <Arrow pts={[[280, 184], [280, 240]]} tone="faint" head={false} d={0} dur={200} width={3} />
      <Box x={140} y={186} w={60} h={36} r={4} tone="navy" d={100} />
      <Text x={170} y={236} text={bi("limit switch", "مفتاح حدّي")} size={10.5} tone="muted" d={200} />
      <Box x={166} y={plungerTop} w={8} h={186 - plungerTop} r={2} tone="gold" d={200} />
      <Box x={160} y={plungerTop - 4} w={20} h={6} r={2} tone="gold" d={200} />
      <Box x={30} y={170} w={270} h={14} r={3} tone="slate" d={50} />
      {present ? (
        <Box x={110} y={124} w={120} h={46} r={4} tone="outline" label={bi("workpiece", "قطعة العمل")} size={11.5} d={400} />
      ) : (
        <>
          <Box x={110} y={124} w={120} h={46} r={4} tone="ghost" dashed d={400} />
          <Text x={134} y={140} text={bi("empty", "فارغة")} size={11} tone="muted" d={450} />
        </>
      )}
      <Text x={430} y={26} text={bi("Input circuit", "دائرة الدخل")} tone="heading" size={12} d={500} />
      <Text x={430} y={58} text={`+${SWITCH_V.industrial} V DC`} mono size={11.5} tone="heading" d={600} />
      <Wire pts={[[430, 68], [430, 84]]} d={650} dur={150} />
      <Contact x={430} y1={84} y2={130} closed={present} d={700} />
      <Text x={470} y={107} text={present ? bi("closed", "مغلق") : bi("open", "مفتوح")} anchor="start" size={11} tone={present ? "success" : "danger"} d={1000} />
      <Wire pts={[[430, 130], [430, 156]]} d={900} dur={150} />
      <Box x={380} y={156} w={100} h={42} tone="outline" label={bi("PLC input", "دخل PLC")} size={11.5} d={950} />
      <Wire pts={[[430, 198], [430, 210]]} d={1000} dur={100} />
      <Ground x={430} y={210} d={1050} />
      <Chip
        x={352}
        y={252}
        text={present ? bi(`${SWITCH_V.industrial} V DC → logic 1: part present`, `${SWITCH_V.industrial} V DC ← المنطق 1: القطعة موجودة`) : bi(`${SWITCH_V.open} V → logic 0: no part`, `${SWITCH_V.open} V ← المنطق 0: لا توجد قطعة`)}
        tone={present ? "success" : "muted"}
        center
        d={1300}
      />
    </Svg>
  );
}

/** One state of the switch body: plunger, NC and NO fixed contacts, the movable contact and the spring. */
function Body({ cx, pressed, wired, d }: { cx: number; pressed: boolean; wired: "no" | "nc"; d: number }) {
  const barY = pressed ? 140 : 104;
  const pairY = { nc: 96, no: 148 };
  const closed = wired === "nc" ? !pressed : pressed;
  const spring: Pt[] = [[cx, barY + 8]];
  const bottom = 214;
  const coils = 6;
  for (let i = 1; i <= coils; i++) spring.push([cx + (i % 2 ? 9 : -9), barY + 8 + ((bottom - barY - 8) * i) / (coils + 1)]);
  spring.push([cx, bottom]);
  return (
    <>
      {(["nc", "no"] as const).map((p) => (
        <g key={p}>
          <Box x={cx - 62} y={pairY[p] - 4} w={18} h={8} r={2} tone={p === wired ? "gold" : "muted"} d={d} />
          <Box x={cx + 44} y={pairY[p] - 4} w={18} h={8} r={2} tone={p === wired ? "gold" : "muted"} d={d} />
          <Text x={cx - 70} y={pairY[p]} text={p.toUpperCase()} anchor="end" mono size={11} tone={p === wired ? "gold" : "muted"} d={d} />
        </g>
      ))}
      <Box x={cx - 5} y={44} w={10} h={barY - 44} r={2} tone="slate" d={d + 100} />
      <Arrow pts={spring} tone="muted" head={false} d={d + 150} dur={400} />
      <Box x={cx - 52} y={pressed ? barY - 4 : barY - 4} w={104} h={8} r={3} tone="navy" d={d + 200} />
      {pressed ? <Arrow pts={[[cx + 40, 34], [cx + 40, 58]]} tone="gold" d={d + 300} dur={250} label={bi("push", "دفع")} labelAt={[cx + 66, 40]} labelTone="gold" /> : null}
      <Chip x={cx} y={246} text={closed ? bi("circuit closed → 1", "الدائرة مغلقة ← 1") : bi("circuit open → 0", "الدائرة مفتوحة ← 0")} tone={closed ? "success" : "danger"} center d={d + 500} />
    </>
  );
}

function Contacts({ control }: { control: string }) {
  const wired = control === "nc" ? "nc" : "no";
  return (
    <Svg>
      <Text x={140} y={22} text={bi("Released", "غير مضغوط")} tone="heading" size={12} d={0} />
      <Text x={420} y={22} text={bi("Pressed", "مضغوط")} tone="heading" size={12} d={600} />
      <Arrow pts={[[280, 16], [280, 266]]} tone="faint" dashed head={false} d={0} />
      <Body cx={140} pressed={false} wired={wired} d={100} />
      <Body cx={420} pressed wired={wired} d={700} />
      <Text x={222} y={180} text={bi("return spring", "نابض الإرجاع")} size={10.5} tone="muted" d={400} />
      <Text x={222} y={60} text={bi("plunger", "المكبس")} size={10.5} tone="muted" d={400} />
    </Svg>
  );
}

/** The common switch body and its plunger button, `push` px down. */
function SwitchBody({ push = 0, d = 0 }: { push?: number; d?: number }) {
  return (
    <>
      <Box x={345} y={136 + push} w={10} h={16} r={2} tone="gold" d={d} />
      <Box x={300} y={150} w={100} h={60} r={6} tone="navy" label={bi("switch body", "جسم المفتاح")} size={11.5} d={d} />
    </>
  );
}

const CAM_PATH = (cx: number, cy: number) =>
  Array.from({ length: 73 }, (_, i) => {
    const a = i * 5;
    const lobe = Math.max(0, Math.cos(((a - 180) * Math.PI) / 180)) ** 3;
    return polar(cx, cy, 24 + 22 * lobe, a);
  })
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ") + " Z";

function Actuation({ control }: { control: string }) {
  if (control === "roller") {
    return (
      <Svg>
        <Text x={160} y={30} text={bi("Roller pushed down by the passing part", "بكرة يدفعها الجزء العابر إلى أسفل")} tone="heading" size={12} d={0} />
        <SwitchBody push={6} d={0} />
        <In d={100}>
          <circle cx={350} cy={134} r={10} className={w.under} />
          <circle cx={350} cy={134} r={10} className={`${w.shape} ${w.slate}`} />
        </In>
        <Glide stops={[[0, 0], [250, 0]]} at={[400]} move={1300}>
          <In d={200}>
            <path d="M40,90 h140 v14 l-20,20 h-120 z" className={w.under} />
            <path d="M40,90 h140 v14 l-20,20 h-120 z" className={`${w.shape} ${w.outline}`} />
          </In>
        </Glide>
        <Text x={100} y={150} text={bi("moving part", "الجزء المتحرك")} size={11} tone="muted" d={300} />
        <Arrow pts={[[60, 182], [150, 182]]} tone="muted" d={300} />
        <Chip x={350} y={246} text={bi("button pressed: switch operates", "ضُغط الزر: يعمل المفتاح")} tone="success" center d={1900} />
      </Svg>
    );
  }
  if (control === "cam") {
    return (
      <Svg>
        <Text x={160} y={30} text={bi("A rotating cam presses once per turn", "حدبة دوّارة تضغط مرة في كل دورة")} tone="heading" size={12} d={0} />
        <SwitchBody push={6} d={0} />
        <In d={100}>
          <circle cx={350} cy={134} r={8} className={w.under} />
          <circle cx={350} cy={134} r={8} className={`${w.shape} ${w.slate}`} />
        </In>
        <Turn cx={350} cy={80} from={0} to={360} at={300} dur={2000}>
          <In d={150}>
            <path d={CAM_PATH(350, 80)} className={w.under} />
            <path d={CAM_PATH(350, 80)} className={`${w.shape} ${w.outline}`} />
            <circle cx={350} cy={80} r={4} style={{ fill: "var(--heading)" }} />
          </In>
        </Turn>
        <Text x={416} y={62} text={bi("rotating cam", "حدبة دوّارة")} anchor="start" size={11} tone="muted" d={300} />
        <Arrow pts={Array.from({ length: 9 }, (_, i) => polar(350, 80, 58, 30 + i * 6))} tone="muted" d={400} dur={400} />
        <Chip x={160} y={200} text={bi("lobe down → pressed", "النتوء لأسفل ← مضغوط")} tone="gold" center d={2400} />
        <Chip x={350} y={246} text={bi("one press per revolution", "ضغطة واحدة في كل دورة")} tone="success" center d={2500} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Text x={160} y={30} text={bi("Lever pushed down by contact", "ذراع يدفعه التلامس إلى أسفل")} tone="heading" size={12} d={0} />
      <SwitchBody push={4} d={0} />
      <In d={100}>
        <circle cx={306} cy={136} r={5} style={{ fill: "var(--heading)" }} />
      </In>
      <Turn cx={306} cy={136} from={-10} to={2} at={800} dur={600}>
        <In d={150}>
          <rect x={306} y={132} width={130} height={7} rx={3} className={w.under} />
          <rect x={306} y={132} width={130} height={7} rx={3} className={`${w.shape} ${w.slate}`} />
        </In>
      </Turn>
      <Glide stops={[[0, 0], [0, 44]]} at={[500]} move={700}>
        <In d={200}>
          <rect x={404} y={58} width={30} height={30} rx={4} className={w.under} />
          <rect x={404} y={58} width={30} height={30} rx={4} className={`${w.shape} ${w.outline}`} />
        </In>
      </Glide>
      <Text x={480} y={78} text={bi("moving part", "الجزء المتحرك")} anchor="start" size={11} tone="muted" d={300} />
      <Text x={290} y={124} text={bi("hinge", "المفصل")} anchor="end" size={10.5} tone="muted" d={300} />
      <Chip x={350} y={246} text={bi("lever on the button: switch operates", "الذراع على الزر: يعمل المفتاح")} tone="success" center d={1500} />
    </Svg>
  );
}

function EndOfTravel() {
  const plot: PlotBox = { x: 50, y: 50, w: 190, h: 44, domain: [0, 10], range: [0, 1] };
  return (
    <Svg>
      <Text x={145} y={24} text={bi("switch output", "خرج المفتاح")} tone="heading" size={11.5} d={0} />
      <Curve box={plot} axes points={[[0, 0], [7.2, 0], [7.2, 1], [10, 1]]} tone="gold" d={300} dur={1800} />
      <Text x={44} y={94} text="0" anchor="end" mono size={10} tone="muted" d={300} />
      <Text x={44} y={50} text="1" anchor="end" mono size={10} tone="muted" d={300} />
      <Box x={430} y={66} w={90} h={40} r={5} tone="navy" label={bi("limit switch", "مفتاح حدّي")} size={11} d={0} />
      <Box x={10} y={156} w={40} h={36} r={4} tone="slate" label="M" mono size={13} d={0} />
      <Box x={50} y={196} w={470} h={10} r={3} tone="muted" d={0} />
      <Arrow pts={[[452, 150], [452, 214]]} tone="danger" dashed head={false} d={200} />
      <Text x={452} y={228} text={bi("end of travel", "نهاية المشوار")} size={10.5} tone="danger" d={300} />
      <In d={100}>
        <circle cx={464} cy={108} r={4} style={{ fill: "var(--heading)" }} />
      </In>
      <Turn cx={464} cy={108} from={0} to={-28} at={1750} dur={300}>
        <Arrow pts={[[464, 108], [450, 134]]} tone="slate" head={false} d={150} dur={200} width={3} />
        <In d={150}>
          <circle cx={448} cy={138} r={7} className={w.under} />
          <circle cx={448} cy={138} r={7} className={`${w.shape} ${w.slate}`} />
        </In>
      </Turn>
      <Glide stops={[[0, 0], [300, 0]]} at={[300]} move={1500}>
        <Box x={60} y={150} w={90} h={46} r={5} tone="navy" label={bi("carriage", "العربة")} size={11.5} d={0} />
        <Box x={128} y={134} w={18} h={16} r={2} tone="gold" d={0} />
      </Glide>
      <Arrow pts={[[150, 236], [300, 236]]} tone="muted" d={300} label={bi("axis moves", "المحور يتحرك")} labelAt={[225, 254]} />
      <Fade d={2100}>
        <Box x={262} y={58} w={150} h={44} r={8} tone="danger" label={bi("drive power off", "فصل القدرة عن المحرك")} size={11.5} />
      </Fade>
      <Arrow pts={[[428, 86], [414, 86]]} tone="danger" d={2100} dur={200} />
    </Svg>
  );
}

/** Rising edges in a 0/1 step trace. */
const risingEdges = (pts: readonly (readonly [number, number])[]) => pts.filter((p, i) => i > 0 && p[1] === 1 && pts[i - 1][1] === 0).length;

function Bounce() {
  const raw: [number, number][] = [[0, 0], [6, 0], [6, 1], [6.6, 1], [6.6, 0], [7.1, 0], [7.1, 1], [7.5, 1], [7.5, 0], [7.8, 0], [7.8, 1], [20, 1]];
  const clean: [number, number][] = [[0, 0], [11, 0], [11, 1], [20, 1]];
  const top: PlotBox = { x: 40, y: 54, w: 290, h: 46, domain: [0, 20], range: [0, 1] };
  const low: PlotBox = { x: 40, y: 150, w: 290, h: 46, domain: [0, 20], range: [0, 1] };
  const s0 = top.x + (7.8 / 20) * top.w;
  const s1 = top.x + (11 / 20) * top.w;
  return (
    <Svg>
      <Text x={40} y={26} text={bi("raw contact", "التلامس الخام")} anchor="start" tone="heading" size={12} d={0} />
      <Curve box={top} axes points={raw} tone="danger" d={100} dur={1000} />
      <Text x={150} y={26} text={bi("bounce: a few ms", "ارتداد: بضع مللي ثوانٍ")} anchor="start" size={10.5} tone="danger" d={900} />
      <Chip x={448} y={78} text={bi(`counted ${risingEdges(raw)} times`, `عُدَّت ${risingEdges(raw)} مرات`)} tone="danger" center d={1200} />
      <Text x={40} y={124} text={bi("after debouncing", "بعد إزالة الارتداد")} anchor="start" tone="heading" size={12} d={1300} />
      <Curve box={low} axes points={clean} tone="success" d={1400} dur={1000} />
      <Arrow pts={[[s0, 140], [s1, 140]]} tone="slate" both d={2000} dur={300} />
      <Text x={268} y={124} text={bi("stable for a set time", "ثابت لمدة محددة")} size={10.5} tone="slate" d={2100} />
      <Chip x={448} y={174} text={bi("counted once", "عُدَّت مرة واحدة")} tone="success" center d={2300} />
      {[
        { x: 82, t: bi("+ cheaper", "+ أرخص"), tone: "success" as const },
        { x: 210, t: bi("+ many sizes", "+ أحجام كثيرة"), tone: "success" as const },
        { x: 350, t: bi("− must touch", "− يجب أن يلمس"), tone: "danger" as const },
        { x: 482, t: bi("− parts wear", "− أجزاء تبلى"), tone: "danger" as const },
      ].map((c, i) => (
        <Chip key={i} x={c.x} y={246} text={c.t} tone={c.tone} center d={2500 + i * 120} />
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof limitSwitch>>({
  "on-off": OnOff,
  contacts: Contacts,
  actuation: Actuation,
  "end-of-travel": EndOfTravel,
  bounce: Bounce,
});
