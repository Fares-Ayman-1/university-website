"use client";

import type { architectures } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import {
  HALF_DONE,
  PLANS,
  REFLEX_RULES,
  THRESHOLD,
  firedRule,
  goalReached,
  reflexVacuumAgent,
  resultOf,
  showPercept,
  stateAgentStep,
  utility,
  type Percept,
  type PlanId,
  type World,
} from "@/lib/widgets/ai-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { FrameLabel } from "./local";

/* ---------- The shared frame: agent on the left, environment on the right ---------- */

const L = { x: 22, w: 178 };
const R = { x: 228, w: 180 };
const RC = R.x + R.w / 2;

const WORLD_NOW = bi("What the world is like now", "كيف يبدو العالم الآن");
const WHAT_IF = bi("What if I follow the plan?", "ماذا لو نفّذت الخطة؟");
const HAPPY = bi("How happy will I be?", "ما مدى سعادتي؟");
const DO_NOW = bi("What should I do now?", "ماذا يجب أن أفعل الآن؟");
const EVOLVES = bi("How the world evolves", "كيف يتطوّر العالم");
const MY_ACTIONS = bi("What my actions do", "ما الذي تفعله أفعالي");
const RULES = bi("Condition–action rules", "قواعد الشرط–الفعل");

/** Agent frame, environment, and the sensor and actuator arrows at heights `sy` and `ay`. */
function Frame({ sy, ay, action, d = 0, actionAt }: { sy: number; ay: number; action?: string; d?: number; actionAt: number }) {
  return (
    <>
      <Box x={8} y={22} w={404} h={252} r={14} tone="ghost" dashed d={d} />
      <FrameLabel x={20} y={22} text={bi("Agent", "الوكيل")} d={d} />
      <Box x={474} y={30} w={76} h={238} r={10} tone="slate" label={bi("Environment", "البيئة")} size={11} d={d} />
      <Arrow pts={[[472, sy], [410, sy]]} tone="gold" d={d + 200} dur={300} label={bi("Sensors", "المستشعرات")} labelAt={[443, sy - 28]} labelTone="gold" />
      <Token pts={[[512, sy], [410, sy]]} d={d + 300} dur={500} />
      <Arrow pts={[[410, ay], [472, ay]]} tone="gold" d={actionAt} dur={300} label={bi("Actuators", "المشغِّلات")} labelAt={[443, ay - 28]} labelTone="gold" />
      {action ? <Token pts={[[410, ay], [512, ay]]} d={actionAt + 100} dur={500} tone="navy" /> : null}
    </>
  );
}

const showWorld = (w: World) => `A: ${w.dirty.A ? "Dirty" : "Clean"}, B: ${w.dirty.B ? "Dirty" : "Clean"}`;

/* ---------- Ladder ---------- */

const LADDER: readonly { name: Bi; adds: Bi }[] = [
  { name: bi("Simple reflex", "الانعكاس البسيط"), adds: bi("rules", "قواعد") },
  { name: bi("Model-based", "القائم على النموذج"), adds: bi("adds a state", "يضيف حالة") },
  { name: bi("Goal-based", "القائم على الهدف"), adds: bi("adds goals", "يضيف أهدافًا") },
  { name: bi("Utility-based", "القائم على المنفعة"), adds: bi("adds utility", "يضيف المنفعة") },
];

function Ladder() {
  return (
    <Svg>
      <Box x={10} y={44} w={540} h={226} r={14} tone="ghost" dashed d={1400} />
      <Chip x={280} y={44} text={bi("Learning: any of them can learn", "التعلّم: يمكن لأي منها أن يتعلّم")} tone="gold" size={11} center d={1500} />
      {LADDER.map((step, i) => {
        const h = 70 + i * 34;
        return <Box key={i} x={24 + i * 131} y={258 - h} w={123} h={h} label={step.name} sub={step.adds} tone={i === 0 ? "slate" : "navy"} size={11.5} subSize={10.5} d={200 + i * 250} />;
      })}
      <Arrow pts={[[30, 160], [540, 56]]} tone="gold" d={1100} dur={500} label={bi("increasing generality", "عمومية متزايدة")} labelAt={[124, 104]} labelTone="gold" />
    </Svg>
  );
}

/* ---------- Simple reflex ---------- */

const PERCEPTS: Record<string, Percept> = { "a-dirty": ["A", "Dirty"], "a-clean": ["A", "Clean"], "b-clean": ["B", "Clean"] };

function SimpleReflex({ control }: { control: string }) {
  const percept = PERCEPTS[control] ?? PERCEPTS["a-dirty"];
  const action = reflexVacuumAgent(percept);
  const fired = firedRule(percept);
  const ruleY = (i: number) => 150 + i * 38;
  const sy = 46 + 29;
  const ay = 242;
  return (
    <Svg>
      <Frame sy={sy} ay={ay} action={action} actionAt={2300} />
      <Box x={R.x} y={46} w={R.w} h={58} label={WORLD_NOW} sub={showPercept(percept)} tone="outline" size={11} subSize={11.5} d={300} />
      <Box x={L.x} y={104} w={L.w} h={166} r={10} tone="outline" d={400} />
      <Text x={L.x + L.w / 2} y={120} text={RULES} tone="heading" size={11.5} d={400} />
      {REFLEX_RULES.map((r, i) => (
        <g key={i}>
          <Box x={L.x + 12} y={ruleY(i)} w={L.w - 24} h={28} r={6} label={`if ${r.when} → ${r.action}`} mono size={11} tone="outline" d={500 + i * 100} />
          {i < fired ? (
            <Fade d={1000 + i * 200}>
              <Box x={L.x + 12} y={ruleY(i)} w={L.w - 24} h={28} r={6} label={`if ${r.when} → ${r.action}`} mono size={11} tone="muted" />
              <Mark x={L.x + L.w - 12} y={ruleY(i)} ok={false} r={8} />
            </Fade>
          ) : null}
        </g>
      ))}
      <Fade d={1000 + fired * 200}>
        <Box x={L.x + 12} y={ruleY(fired)} w={L.w - 24} h={28} r={6} label={`if ${REFLEX_RULES[fired].when} → ${REFLEX_RULES[fired].action}`} mono size={11} tone="gold" />
        <Mark x={L.x + L.w - 12} y={ruleY(fired)} ok r={8} />
      </Fade>
      <Arrow pts={[[250, 104], [250, 136], [202, 136]]} tone="slate" d={800} dur={300} />
      <Token pts={[[250, 104], [250, 136], [202, 136]]} d={800} dur={400} r={5} />
      <Arrow pts={[[L.x + L.w - 6, ruleY(fired) + 14], [214, ruleY(fired) + 14], [214, ay], [226, ay]]} tone="gold" d={1400 + fired * 200} dur={400} />
      <Token pts={[[L.x + L.w - 6, ruleY(fired) + 14], [214, ruleY(fired) + 14], [214, ay], [226, ay]]} d={1500 + fired * 200} dur={500} r={5} />
      <Box x={R.x} y={214} w={R.w} h={56} label={DO_NOW} sub={action} tone="navy" size={11} subSize={12} d={1900} />
      <Text x={RC} y={160} text={bi(`rule ${fired + 1} fires`, `تُنفَّذ القاعدة ${fired + 1}`)} tone="gold" size={12} d={1300 + fired * 200} />
    </Svg>
  );
}

/* ---------- Model-based ---------- */

const MEMORY = { recent: { A: 0, B: 1 }, "long-ago": { A: 0, B: 4 } } as const;

function ModelBased({ control }: { control: string }) {
  const before = control === "long-ago" ? MEMORY["long-ago"] : MEMORY.recent;
  const percept: Percept = ["A", "Clean"];
  const { memory, action } = stateAgentStep(before, percept);
  const sy = 71;
  const ay = 242;
  return (
    <Svg>
      <Frame sy={sy} ay={ay} action={action} actionAt={2400} />
      <Box x={L.x} y={46} w={L.w} h={50} label={bi("State: steps since cleaned", "الحالة: الخطوات منذ التنظيف")} sub={`A: ${memory.A}, B: ${memory.B}`} tone="slate" size={10.5} subSize={11.5} d={300} />
      <Box x={L.x} y={104} w={L.w} h={50} label={EVOLVES} tone="slate" size={11} d={400} />
      <Box x={L.x} y={162} w={L.w} h={50} label={MY_ACTIONS} tone="slate" size={11} d={500} />
      <Box x={L.x} y={220} w={L.w} h={50} label={RULES} sub={`B > ${THRESHOLD} ? Right : NoOp`} tone="gold" size={11} subSize={11} d={600} />
      <Box x={R.x} y={46} w={R.w} h={50} label={WORLD_NOW} sub={showPercept(percept)} tone="outline" size={11} subSize={11} d={700} />
      <Arrow pts={[[200, sy], [226, sy]]} tone="slate" d={900} dur={200} />
      <Arrow pts={[[200, 129], [214, 129], [214, 84], [226, 84]]} tone="slate" d={1000} dur={300} />
      <Arrow pts={[[200, 187], [214, 187], [214, 129]]} tone="slate" d={1100} dur={250} head={false} />
      <Token pts={[[200, sy], [226, sy]]} d={1000} dur={300} r={5} />
      <Arrow pts={[[RC, 98], [RC, 212]]} tone="slate" d={1300} dur={400} />
      <Token pts={[[RC, 98], [RC, 212]]} d={1400} dur={600} r={5} />
      <Chip x={RC} y={155} w={110} text={`B: ${memory.B} ${memory.B > THRESHOLD ? ">" : "≤"} ${THRESHOLD}`} tone={memory.B > THRESHOLD ? "warn" : "success"} center d={1600} />
      <Arrow pts={[[200, ay], [226, ay]]} tone="gold" d={1900} dur={200} />
      <Box x={R.x} y={214} w={R.w} h={56} label={DO_NOW} sub={action} tone="navy" size={11} subSize={12} d={2100} />
    </Svg>
  );
}

/* ---------- Goal-based ---------- */

function GoalBased({ control }: { control: string }) {
  const plan: PlanId = control === "direct" ? "direct" : "wait";
  const predicted = resultOf(HALF_DONE, PLANS[plan]);
  const reached = goalReached(predicted);
  const percept: Percept = ["A", "Clean"];
  const action = reached ? PLANS[plan][0] : "…";
  const sy = 71;
  const ay = 242;
  return (
    <Svg>
      <Frame sy={sy} ay={ay} action={reached ? action : undefined} actionAt={2600} />
      <Box x={L.x} y={46} w={L.w} h={50} label={bi("State", "الحالة")} sub={showWorld(HALF_DONE)} tone="slate" size={11} subSize={10.5} d={300} />
      <Box x={L.x} y={104} w={L.w} h={50} label={EVOLVES} tone="slate" size={11} d={400} />
      <Box x={L.x} y={162} w={L.w} h={50} label={MY_ACTIONS} tone="slate" size={11} d={500} />
      <Box x={L.x} y={220} w={L.w} h={50} label={bi("Goals", "الأهداف")} sub="A: Clean, B: Clean" tone="gold" size={11} subSize={10.5} d={600} />
      <Box x={R.x} y={46} w={R.w} h={50} label={WORLD_NOW} sub={showPercept(percept)} tone="outline" size={11} subSize={11} d={700} />
      <Arrow pts={[[200, sy], [226, sy]]} tone="slate" d={900} dur={200} />
      <Arrow pts={[[RC, 98], [RC, 118]]} tone="slate" d={1000} dur={200} />
      <Arrow pts={[[200, 129], [214, 129], [214, 140], [226, 140]]} tone="slate" d={1100} dur={250} />
      <Arrow pts={[[200, 187], [214, 187], [214, 156], [226, 156]]} tone="slate" d={1150} dur={250} />
      <Token pts={[[RC, 98], [RC, 118]]} d={1100} dur={250} r={5} />
      <Box x={R.x} y={120} w={R.w} h={56} label={WHAT_IF} sub={showWorld(predicted)} tone={reached ? "success" : "danger"} size={11} subSize={10.5} d={1300} />
      <Mark x={R.x + R.w} y={120} ok={reached} d={1700} />
      {reached ? (
        <>
          <Arrow pts={[[RC, 178], [RC, 212]]} tone="gold" d={1900} dur={250} />
          <Token pts={[[RC, 178], [RC, 212]]} d={2000} dur={300} r={5} />
        </>
      ) : null}
      <Arrow pts={[[200, ay], [226, ay]]} tone="gold" d={1900} dur={200} />
      <Box x={R.x} y={214} w={R.w} h={56} label={DO_NOW} sub={action} tone="navy" size={11} subSize={12} d={2200} />
      {reached ? null : <Text x={RC} y={190} text={bi("plan rejected", "تُرفض الخطة")} tone="danger" size={11} d={2200} />}
    </Svg>
  );
}

/* ---------- Utility-based ---------- */

function UtilityBased({ control }: { control: string }) {
  const plan: PlanId = control === "wander" ? "wander" : "direct";
  const scores = { direct: utility(HALF_DONE, PLANS.direct), wander: utility(HALF_DONE, PLANS.wander) };
  const best: PlanId = scores.direct >= scores.wander ? "direct" : "wander";
  const u = scores[plan];
  const predicted = resultOf(HALF_DONE, PLANS[plan]);
  const action = PLANS[best][0];
  const sy = 68;
  const ay = 241;
  const rows = [46, 100, 158, 216];
  return (
    <Svg>
      <Frame sy={sy} ay={ay} action={action} actionAt={2700} />
      <Box x={L.x} y={46} w={L.w} h={50} label={bi("State", "الحالة")} sub={showWorld(HALF_DONE)} tone="slate" size={11} subSize={10.5} d={300} />
      <Box x={L.x} y={104} w={L.w} h={50} label={EVOLVES} tone="slate" size={11} d={400} />
      <Box x={L.x} y={162} w={L.w} h={50} label={MY_ACTIONS} tone="slate" size={11} d={500} />
      <Box x={L.x} y={220} w={L.w} h={50} label={bi("Utility", "المنفعة")} tone="gold" size={12} d={600} />
      <Box x={R.x} y={rows[0]} w={R.w} h={44} label={WORLD_NOW} tone="outline" size={11} d={700} />
      <Arrow pts={[[200, sy], [226, sy]]} tone="slate" d={900} dur={200} />
      <Arrow pts={[[200, 129], [226, 129]]} tone="slate" d={1000} dur={200} />
      <Arrow pts={[[200, 187], [214, 187], [214, 129]]} tone="slate" d={1050} dur={200} head={false} />
      <Box x={R.x} y={rows[1]} w={R.w} h={50} label={WHAT_IF} sub={showWorld(predicted)} tone="success" size={11} subSize={10.5} d={1200} />
      <Mark x={R.x + R.w} y={rows[1]} ok d={1500} />
      <Arrow pts={[[200, 245], [214, 245], [214, 183], [226, 183]]} tone="gold" d={1600} dur={300} />
      <Token pts={[[200, 245], [214, 245], [214, 183], [226, 183]]} d={1650} dur={450} r={5} />
      <Box x={R.x} y={rows[2]} w={R.w} h={50} label={HAPPY} sub={`U = ${u}`} tone={plan === best ? "gold" : "warn"} size={11} subSize={12} d={1900} />
      <Mark x={R.x + R.w} y={rows[2]} ok={plan === best} d={2200} />
      <Box x={R.x} y={rows[3]} w={R.w} h={50} label={DO_NOW} sub={PLANS[best].join(", ")} tone="navy" size={11} subSize={11} d={2400} />
    </Svg>
  );
}

/* ---------- Learning ---------- */

const LEARN = {
  std: { x: 24, y: 46, w: 166, h: 44 },
  critic: { x: 24, y: 104, w: 166, h: 44 },
  learning: { x: 24, y: 164, w: 166, h: 44 },
  problem: { x: 24, y: 224, w: 166, h: 44 },
  performance: { x: 262, y: 140, w: 140, h: 80 },
} as const;
const LEARN_LABELS = {
  critic: bi("Critic", "الناقد"),
  learning: bi("Learning element", "عنصر التعلّم"),
  problem: bi("Problem generator", "مولِّد المسائل"),
  performance: bi("Performance element", "عنصر الأداء"),
} as const;
const LEARN_CAPTION: Record<keyof typeof LEARN_LABELS, Bi> = {
  performance: bi("selects the actions", "يختار الأفعال"),
  critic: bi("gives feedback on behaviour", "يقدّم تغذية راجعة عن السلوك"),
  learning: bi("changes the performance element", "يغيّر عنصر الأداء"),
  problem: bi("suggests exploratory actions", "يقترح أفعالًا استكشافية"),
};
const OUT_ARROW: Record<keyof typeof LEARN_LABELS, readonly Pt[]> = {
  performance: [
    [404, 200],
    [472, 200],
  ],
  critic: [
    [107, 148],
    [107, 162],
  ],
  learning: [
    [192, 186],
    [260, 186],
  ],
  problem: [
    [192, 246],
    [332, 246],
    [332, 222],
  ],
};

function Learning({ control }: { control: string }) {
  const chosen = (control in LEARN_LABELS ? control : "performance") as keyof typeof LEARN_LABELS;
  const tone = (k: keyof typeof LEARN_LABELS) => (k === "performance" ? "navy" : "outline");
  return (
    <Svg>
      <Box x={8} y={22} w={404} h={252} r={14} tone="ghost" dashed d={0} />
      <FrameLabel x={20} y={22} text={bi("Agent", "الوكيل")} d={0} />
      <Box x={474} y={30} w={76} h={238} r={10} tone="slate" label={bi("Environment", "البيئة")} size={11} d={0} />
      <Box {...LEARN.std} label={bi("Performance standard", "معيار الأداء")} tone="ghost" dashed size={11} d={100} />
      {(Object.keys(LEARN_LABELS) as (keyof typeof LEARN_LABELS)[]).map((k, i) => (
        <Box key={k} {...LEARN[k]} label={LEARN_LABELS[k]} tone={tone(k)} size={11} d={200 + i * 120} />
      ))}
      <Arrow pts={[[107, 90], [107, 102]]} tone="slate" d={700} dur={150} />
      <Arrow pts={[[472, 126], [192, 126]]} tone="slate" d={800} dur={500} label={bi("Sensors", "المستشعرات")} labelAt={[443, 143]} labelTone="slate" />
      <Arrow pts={[[332, 126], [332, 138]]} tone="slate" d={1100} dur={150} />
      <Arrow pts={[[107, 148], [107, 162]]} tone="slate" d={900} dur={150} />
      <Arrow pts={[[192, 186], [260, 186]]} tone="slate" both d={1000} dur={300} />
      <Arrow pts={[[107, 208], [107, 222]]} tone="slate" d={1100} dur={150} />
      <Arrow pts={[[192, 246], [332, 246], [332, 222]]} tone="slate" d={1200} dur={400} />
      <Arrow pts={[[404, 200], [472, 200]]} tone="slate" d={1300} dur={300} label={bi("Actuators", "المشغِّلات")} labelAt={[443, 217]} labelTone="slate" />
      <Fade d={1500}>
        <Box {...LEARN[chosen]} label={LEARN_LABELS[chosen]} tone="gold" size={11} />
      </Fade>
      <Arrow pts={OUT_ARROW[chosen]} tone="gold" d={1600} dur={400} width={2.6} />
      <Token pts={[[512, 126], [192, 126]]} d={1700} dur={700} r={5} />
      <Token pts={[[107, 148], [107, 162], [107, 186], [260, 186]]} d={2400} dur={600} r={5} />
      <Token pts={[[404, 200], [512, 200]]} d={3000} dur={500} r={5} tone="navy" />
      <Chip x={330} y={76} text={LEARN_CAPTION[chosen]} tone="gold" size={11} center d={1700} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof architectures>>({
  ladder: Ladder,
  "simple-reflex": SimpleReflex,
  "model-based": ModelBased,
  "goal-based": GoalBased,
  "utility-based": UtilityBased,
  learning: Learning,
});
