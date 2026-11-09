"use client";

import type { environments } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import { DIMENSIONS, ENVIRONMENTS, hardCount, hardness, type Answer, type Dimension, type Task } from "@/lib/widgets/ai-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, Mark, Person, Svg, Text, Token, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dirt, Glide, Robot, Square } from "./local";

function Observable({ control }: { control: string }) {
  const fully = control === "fully";
  return (
    <Svg>
      <Square x={24} y={100} w={180} h={130} name="A" d={0} />
      <Square x={214} y={100} w={180} h={130} name="B" d={0} />
      <Dirt x={304} y={196} d={100} />
      <Robot x={114} y={170} r={18} d={150} />
      {fully ? (
        <>
          <Box x={164} y={22} w={90} h={44} label={bi("Camera", "كاميرا")} tone="navy" size={12} d={300} />
          <Arrow pts={[[190, 68], [114, 124]]} tone="gold" dashed d={600} head={false} />
          <Arrow pts={[[228, 68], [304, 124]]} tone="gold" dashed d={700} head={false} />
          <Fade d={900}>
            <rect x={30} y={106} width={358} height={118} rx={6} fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 4" />
          </Fade>
        </>
      ) : (
        <>
          <Fade d={500}>
            <rect x={30} y={106} width={168} height={118} rx={6} fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 4" />
          </Fade>
          <Box x={220} y={106} w={168} h={118} r={6} tone="muted" dashed label="?" size={30} d={700} />
          <Text x={114} y={74} text={bi("local dirt sensor", "مستشعر أوساخ محلي")} tone="gold" size={11.5} d={400} />
        </>
      )}
      <Text x={480} y={68} text={bi("What it perceives", "ما يُدركه")} tone="heading" size={12} d={1000} />
      <Box x={414} y={92} w={132} h={64} label="A: Clean" sub={fully ? "B: Dirty" : "B: ?"} mono size={13} subSize={12} tone={fully ? "success" : "warn"} d={1100} />
      <Chip x={480} y={196} text={fully ? bi("the complete state", "الحالة كاملة") : bi("part of the state", "جزء من الحالة")} tone={fully ? "success" : "warn"} size={11} center d={1300} />
      <Chip x={480} y={246} text={fully ? bi("no memory needed", "لا حاجة إلى ذاكرة") : bi("must remember B", "يجب أن يتذكر B")} tone="outline" size={11} center d={1500} />
    </Svg>
  );
}

function Deterministic({ control }: { control: string }) {
  if (control === "stochastic") {
    const rolls = ["6 + 6", "3 + 1", "5 + 2"];
    return (
      <Svg>
        <Box x={16} y={104} w={124} h={72} label={bi("Position", "الوضع")} sub={bi("before the turn", "قبل الدور")} tone="slate" size={12} d={0} />
        <Arrow pts={[[142, 140], [196, 140]]} tone="slate" d={300} dur={250} />
        <Box x={198} y={108} w={96} h={64} label={bi("Dice", "النرد")} sub="? + ?" tone="navy" size={12} subSize={12} d={400} />
        {rolls.map((r, i) => {
          const y = 40 + i * 80;
          return (
            <g key={r}>
              <Arrow pts={[[296, 140], [388, y + 30]]} tone="gold" d={800 + i * 250} dur={350} />
              <Token pts={[[296, 140], [388, y + 30]]} d={850 + i * 250} dur={450} />
              <Box x={390} y={y} w={150} h={60} label={bi(`Position ${i + 1}`, `الوضع ${i + 1}`)} sub={r} tone="outline" size={12} subSize={12} d={1100 + i * 250} />
            </g>
          );
        })}
        <Chip x={140} y={232} text={bi("same move, many next states", "الحركة نفسها وحالات تالية كثيرة")} tone="warn" size={11} center d={1900} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Square x={20} y={70} w={150} h={130} name="A" d={0} />
      <Dirt x={95} y={170} d={100} />
      <Robot x={95} y={130} r={17} d={150} />
      <Arrow pts={[[176, 135], [380, 135]]} tone="gold" d={500} dur={500} label="Suck" labelAt={[278, 115]} labelTone="gold" />
      <Token pts={[[176, 135], [380, 135]]} d={600} dur={600} />
      <Square x={386} y={70} w={150} h={130} name="A" tone="success" d={1100} />
      <Robot x={461} y={130} r={17} d={1150} />
      <Mark x={536} y={70} ok d={1400} />
      <Text x={95} y={224} text={bi("now", "الآن")} tone="muted" size={11.5} d={200} />
      <Text x={461} y={224} text={bi("next state", "الحالة التالية")} tone="muted" size={11.5} d={1200} />
      <Chip x={278} y={250} text={bi("one action, exactly one next state", "فعل واحد وحالة تالية واحدة فقط")} tone="success" size={11} center d={1600} />
    </Svg>
  );
}

function Episodic({ control }: { control: string }) {
  if (control === "sequential") {
    const moves = [bi("Move 1", "الحركة 1"), bi("Move 2", "الحركة 2"), bi("Move 3", "الحركة 3")];
    return (
      <Svg>
        {moves.map((m, i) => (
          <g key={i}>
            <Box x={20 + i * 130} y={120} w={104} h={52} label={m} tone={i === 0 ? "gold" : "outline"} size={12} d={i * 300} />
            <Arrow pts={[[126 + i * 130, 146], [148 + i * 130, 146]]} tone="slate" d={200 + i * 300} dur={200} />
          </g>
        ))}
        <Box x={410} y={120} w={130} h={52} label={bi("Outcome", "النتيجة")} tone="navy" size={12} d={900} />
        <Arrow pts={[[72, 118], [72, 70], [475, 70], [475, 118]]} tone="gold" d={1200} dur={800} label={bi("an early move shapes the end", "حركة مبكرة تحدد النهاية")} labelAt={[274, 46]} labelTone="gold" />
        <Token pts={[[72, 118], [72, 70], [475, 70], [475, 118]]} d={1300} dur={1100} />
        <Chip x={280} y={232} text={bi("each decision affects the later ones", "كل قرار يؤثر في القرارات اللاحقة")} tone="warn" size={11} center d={2300} />
      </Svg>
    );
  }
  const parts = [
    { ok: true, label: bi("OK", "سليمة") },
    { ok: false, label: bi("Defective", "معيبة") },
    { ok: true, label: bi("OK", "سليمة") },
  ];
  return (
    <Svg>
      {parts.map((p, i) => {
        const x = 16 + i * 184;
        const d = i * 450;
        return (
          <g key={i}>
            <Box x={x} y={30} w={160} h={160} r={12} tone="ghost" dashed d={d} />
            <Text x={x + 80} y={50} text={bi(`Episode ${i + 1}`, `الحلقة ${i + 1}`)} tone="heading" size={12} d={d} />
            <Box x={x + 50} y={82} w={60} h={40} r={6} label={bi("part", "قطعة")} tone="slate" size={11.5} d={d + 100} />
            <Arrow pts={[[x + 80, 124], [x + 80, 140]]} tone="muted" d={d + 200} dur={150} />
            <Chip x={x + 80} y={162} w={110} text={p.label} tone={p.ok ? "success" : "danger"} size={11} center d={d + 300} />
            {i < 2 ? <Mark x={x + 172} y={110} ok={false} r={9} d={d + 400} /> : null}
          </g>
        );
      })}
      <Chip x={280} y={236} text={bi("no link: one label doesn't change the next part", "لا رابط: تصنيف قطعة لا يغيّر القطعة التالية")} tone="success" size={11} center d={1500} />
    </Svg>
  );
}

type Snapshot = { title: Bi; world: Bi; score: Bi; worldChanged: boolean; scoreChanged: boolean };
const STATIC: Record<string, Snapshot> = {
  static: { title: bi("Solitaire: static", "السوليتير: ساكنة"), world: bi("cards don't move", "الأوراق لا تتحرك"), score: bi("score unchanged", "الأداء لا يتغير"), worldChanged: false, scoreChanged: false },
  semi: { title: bi("Chess with a clock: semi-dynamic", "الشطرنج بساعة توقيت: شبه ديناميكية"), world: bi("board waits", "الرقعة تنتظر"), score: bi("clock runs", "الساعة تعمل"), worldChanged: false, scoreChanged: true },
  dynamic: { title: bi("Taxi driving: dynamic", "قيادة سيارة الأجرة: ديناميكية"), world: bi("other cars move", "السيارات الأخرى تتحرك"), score: bi("time matters", "الوقت مهم"), worldChanged: true, scoreChanged: true },
};

function Car({ x, y, tone = "slate" }: { x: number; y: number; tone?: "slate" | "gold" | "navy" }) {
  return <Box x={x - 18} y={y - 10} w={36} h={20} r={6} tone={tone} />;
}

function WorldPic({ kind, x, after }: { kind: string; x: number; after: boolean }) {
  if (kind === "static") {
    return (
      <>
        {["7", "J", "3"].map((c, i) => (
          <Box key={i} x={x + 22 + i * 34} y={78} w={28} h={40} r={4} label={c} mono size={13} tone="outline" />
        ))}
      </>
    );
  }
  if (kind === "semi") {
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={x + 26 + (i % 2) * 22} y={74 + Math.floor(i / 2) * 22} width={22} height={22} style={{ fill: (i === 0 || i === 3) ? "var(--slate)" : "var(--surface-2)" }} />
        ))}
        <Box x={x + 82} y={84} w={48} h={26} r={6} label={after ? "4:12" : "5:00"} mono size={12} tone={after ? "warn" : "outline"} />
      </>
    );
  }
  return (
    <>
      <Arrow pts={[[x + 10, 98], [x + 140, 98]]} tone="faint" head={false} d={0} dur={1} />
      <Car x={x + 40} y={98} tone="gold" />
      <Car x={after ? x + 120 : x + 84} y={98} />
    </>
  );
}

function Static({ control }: { control: string }) {
  const kind = control in STATIC ? control : "static";
  const s = STATIC[kind];
  return (
    <Svg>
      <Text x={280} y={20} text={s.title} tone="gold" size={12.5} d={0} />
      <Box x={16} y={50} w={150} h={96} r={10} tone="outline" d={100} />
      <In d={150}>
        <WorldPic kind={kind} x={16} after={false} />
      </In>
      <Text x={91} y={164} text={bi("before", "قبل")} tone="muted" size={11} d={200} />
      <Box x={196} y={76} w={168} h={44} label={bi("the agent thinks…", "الوكيل يفكر…")} tone="navy" size={12} d={300} />
      <Token pts={[[196, 134], [364, 134]]} d={500} dur={1400} tone="navy" r={5} />
      <Arrow pts={[[196, 134], [364, 134]]} tone="faint" d={400} dur={1400} />
      <Box x={394} y={50} w={150} h={96} r={10} tone={s.worldChanged ? "warn" : "outline"} d={1900} />
      <In d={1950}>
        <WorldPic kind={kind} x={394} after />
      </In>
      <Text x={469} y={164} text={bi("after", "بعد")} tone="muted" size={11} d={2000} />
      <Chip x={170} y={222} w={210} text={s.world} tone={s.worldChanged ? "warn" : "success"} size={11} center d={2200} />
      <Mark x={275} y={208} ok={!s.worldChanged} r={9} d={2300} />
      <Chip x={410} y={222} w={190} text={s.score} tone={s.scoreChanged ? "warn" : "success"} size={11} center d={2400} />
      <Mark x={505} y={208} ok={!s.scoreChanged} r={9} d={2500} />
    </Svg>
  );
}

const PLOT: PlotBox = { x: 40, y: 78, w: 200, h: 110, domain: [0, 10], range: [-1.2, 1.2] };

function DiscreteAgents({ control }: { control: string }) {
  const taxi = control === "taxi";
  return (
    <Svg>
      <Text x={140} y={20} text={bi("States and actions", "الحالات والأفعال")} tone="heading" size={12} d={0} />
      <Text x={420} y={20} text={bi("Who is acting?", "من يتصرف؟")} tone="heading" size={12} d={0} />
      <Arrow pts={[[280, 44], [280, 262]]} tone="faint" head={false} d={0} dur={300} />
      {taxi ? (
        <>
          <Curve box={PLOT} fn={(t) => Math.sin(t * 0.9) * 0.8 + Math.sin(t * 2.1) * 0.2} axes xLabel={bi("time", "الزمن")} yLabel={bi("steering angle", "زاوية التوجيه")} d={200} dur={1200} />
          <Chip x={140} y={240} text={bi("continuous", "متصلة")} tone="warn" size={11} center d={1500} />
          <Car x={340} y={110} tone="gold" />
          <Text x={340} y={136} text={bi("taxi", "سيارة الأجرة")} tone="heading" size={11} d={300} />
          <Fade d={600}>
            <Car x={460} y={78} />
            <Car x={500} y={140} />
          </Fade>
          <Person x={410} y={150} tone="outline" d={900} />
          <Person x={530} y={160} tone="outline" d={1000} />
          <Text x={420} y={214} text={bi("other drivers, pedestrians", "سائقون ومشاة آخرون")} tone="muted" size={11} d={1100} />
          <Chip x={420} y={256} w={180} text={bi("multi-agent", "متعددة الوكلاء")} tone="warn" size={11} center d={1500} />
        </>
      ) : (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const cx = 60 + (i % 4) * 54;
            const cy = 74 + Math.floor(i / 4) * 50;
            const on = [0, 5, 6, 11].includes(i);
            return (
              <In key={i} d={150 + i * 50}>
                <circle cx={cx} cy={cy} r={on ? 7 : 5} style={{ fill: on ? "var(--gold)" : "var(--border-strong)" }} />
              </In>
            );
          })}
          <Arrow pts={[[66, 78], [108, 120]]} tone="gold" d={900} dur={300} />
          <Arrow pts={[[120, 124], [158, 124]]} tone="gold" d={1200} dur={300} />
          <Arrow pts={[[170, 128], [218, 170]]} tone="gold" d={1500} dur={300} />
          <Chip x={140} y={240} text={bi("discrete: countable moves", "منفصلة: حركات قابلة للعدّ")} tone="success" size={11} center d={1800} />
          <Person x={420} y={96} label={bi("the player", "اللاعب")} d={300} />
          <Text x={420} y={196} text={bi("nobody else acts", "لا أحد غيره يتصرف")} tone="muted" size={11} d={700} />
          <Chip x={420} y={240} w={180} text={bi("single agent", "وكيل واحد")} tone="success" size={11} center d={1800} />
        </>
      )}
    </Svg>
  );
}

const DIM_LABELS: Record<Dimension, Bi> = {
  observable: bi("Observable", "قابلة للملاحظة"),
  deterministic: bi("Deterministic", "حتمية"),
  episodic: bi("Episodic", "عَرَضية"),
  static: bi("Static", "ساكنة"),
  discrete: bi("Discrete", "منفصلة"),
  single: bi("Single-agent", "وكيل واحد"),
};
const ANSWERS: Record<Answer, Bi> = { Yes: bi("Yes", "نعم"), No: bi("No", "لا"), Partly: bi("Partly", "جزئيًا"), Semi: bi("Semi", "شبه ديناميكية") };
const TRACK = { x0: 170, x1: 440 };

function Tasks({ control }: { control: string }) {
  const task = (control in ENVIRONMENTS ? control : "solitaire") as Task;
  const row = (i: number) => 52 + i * 33;
  const hard = hardCount(task);
  return (
    <Svg>
      <Text x={TRACK.x0} y={22} text={bi("easy case", "الحالة السهلة")} anchor="start" tone="success" size={11} d={0} />
      <Text x={TRACK.x1} y={22} text={bi("hard case", "الحالة الصعبة")} anchor="end" tone="danger" size={11} d={0} />
      {DIMENSIONS.map((dim, i) => {
        const a = ENVIRONMENTS[task][dim];
        const h = hardness(a);
        const kx = TRACK.x0 + h * (TRACK.x1 - TRACK.x0);
        const y = row(i);
        const d = 100 + i * 140;
        return (
          <g key={`${task}-${dim}`}>
            <Text x={150} y={y - 6} text={DIM_LABELS[dim]} anchor="end" tone="heading" size={11.5} d={d} />
            <Box x={TRACK.x0 - 6} y={y - 5} w={TRACK.x1 - TRACK.x0 + 12} h={10} r={5} tone="muted" d={d} />
            <Glide stops={[[TRACK.x0, y], [kx, y]]} at={[d + 250]} move={450}>
              <In d={d + 100}>
                <circle cx={TRACK.x0} cy={y} r={9} style={{ fill: h === 1 ? "var(--danger)" : h === 0 ? "var(--success)" : "var(--gold)", stroke: "var(--surface)", strokeWidth: 2 }} />
              </In>
            </Glide>
            <Text x={462} y={y - 6} text={ANSWERS[a]} anchor="start" tone={h === 1 ? "danger" : h === 0 ? "success" : "gold"} size={11.5} d={d + 600} />
          </g>
        );
      })}
      <Chip x={305} y={258} text={bi(`hard on ${hard} of 6 dimensions`, `صعبة في ${hard} من 6 أبعاد`)} tone={hard === 6 ? "danger" : "gold"} size={11} center d={1400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof environments>>({
  observable: Observable,
  deterministic: Deterministic,
  episodic: Episodic,
  static: Static,
  "discrete-agents": DiscreteAgents,
  tasks: Tasks,
});
