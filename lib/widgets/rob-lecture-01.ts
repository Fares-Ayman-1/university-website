import { bi, type Bi } from "@/components/widgets/types";

/*
 * Robotics · Lecture 1 (introduction): the history milestones, Asimov's laws and how their
 * order settles a conflict, the sense–think–act test, the three institutional definitions,
 * the robotic system's blocks and flows, and the classification schemes (JIRA, RIA, AFR,
 * generations, the practical axes, the function families), as pure data and functions. The
 * walkthrough text, its `facts` (checked against the MDX by `expect`) and the scenes all read
 * from here, so a drawing can't drift from the page. Sources: book Ch 1 (pp. 19–40), slides 4–22.
 */

/* ---------- History (slides 4–5, book §1.2) ---------- */

export type MilestoneKey = "word" | "asimov" | "devol" | "dh" | "unimation" | "t3" | "abb";
export type Milestone = { key: MilestoneKey; year: number; label: Bi };

export const MILESTONES: readonly Milestone[] = [
  { key: "word", year: 1922, label: bi("the word robot", "كلمة «روبوت»") },
  { key: "asimov", year: 1950, label: bi("Asimov's laws", "قوانين أسيموف") },
  { key: "devol", year: 1954, label: bi("programmable robot", "روبوت قابل للبرمجة") },
  { key: "dh", year: 1955, label: bi("robot mathematics", "رياضيات الروبوت") },
  { key: "unimation", year: 1962, label: bi("industrial robots", "روبوتات صناعية") },
  { key: "t3", year: 1973, label: bi("the T3 robot", "الروبوت T3") },
  { key: "abb", year: 1990, label: bi("robots go to ABB", "الروبوتات إلى ABB") },
];

export const YEAR = Object.fromEntries(MILESTONES.map((m) => [m.key, m.year])) as Record<MilestoneKey, number>;

/** Years from one milestone to another. */
export const yearsBetween = (from: MilestoneKey, to: MilestoneKey) => YEAR[to] - YEAR[from];

/** The milestones each history panel adds to the timeline, in order. */
export const ERAS = {
  word: ["word", "asimov"],
  programmable: ["devol", "dh"],
  industry: ["unimation", "t3", "abb"],
} as const satisfies Record<string, readonly MilestoneKey[]>;

/* ---------- Asimov's laws ---------- */

export type Law = { rank: 0 | 1 | 2 | 3; rule: Bi };

/** Highest priority first. Law 0 was added after the other three. */
export const LAWS: readonly Law[] = [
  { rank: 0, rule: bi("Don't harm humanity", "لا تؤذِ البشرية") },
  { rank: 1, rule: bi("Don't harm a human", "لا تؤذِ إنسانًا") },
  { rank: 2, rule: bi("Obey human orders", "أطِع أوامر البشر") },
  { rank: 3, rule: bi("Protect yourself", "احمِ نفسك") },
];

/** The laws Asimov first proposed, before the zeroth. */
export const FIRST_LAWS = LAWS.filter((l) => l.rank > 0).length;

export type Verdict = "act" | "refuse";
export type Pull = { rank: Law["rank"]; says: Verdict };
export type Dilemma = { order: Bi; pulls: readonly Pull[] };

export const DILEMMAS = {
  harm: { order: bi("“Push that person.”", "«ادفع ذلك الشخص.»"), pulls: [{ rank: 2, says: "act" }, { rank: 1, says: "refuse" }] },
  flood: { order: bi("“Fetch the tool from the flooded pit.”", "«أحضِر الأداة من الحفرة المغمورة.»"), pulls: [{ rank: 2, says: "act" }, { rank: 3, says: "refuse" }] },
} as const satisfies Record<string, Dilemma>;

/** Strict precedence: of the laws with a say, the highest-ranked one (lowest number) decides. */
export const resolve = (d: Dilemma): Pull => d.pulls.reduce((best, p) => (p.rank < best.rank ? p : best));

/* ---------- Sense, think, act (slide 7, book §1.4) ---------- */

export type Faculty = "senses" | "thinks" | "acts";
export const FACULTIES: readonly Faculty[] = ["senses", "thinks", "acts"];
export type StaMachine = Record<Faculty, boolean>;

/** The book's test cases: a timer washing machine acts only; an alarm senses and decides but doesn't act physically. */
export const STA_MACHINES = {
  washer: { senses: false, thinks: false, acts: true },
  alarm: { senses: true, thinks: true, acts: false },
  robot: { senses: true, thinks: true, acts: true },
} as const satisfies Record<string, StaMachine>;

/** A robot must do all three. */
export const passesSta = (m: StaMachine) => FACULTIES.every((f) => m[f]);

/* ---------- Formal definitions (slide 6, book §1.3) ---------- */

export type Body = "ria" | "raa" | "jara";
export const BODIES: readonly Body[] = ["ria", "raa", "jara"];

export type Criterion = "manipulator" | "reprogrammable" | "multifunctional" | "industrial" | "lifelike";
export const CRITERIA: readonly { id: Criterion; label: Bi }[] = [
  { id: "manipulator", label: bi("a manipulator", "ذراع آلية") },
  { id: "reprogrammable", label: bi("re-programmable", "قابل لإعادة البرمجة") },
  { id: "multifunctional", label: bi("multifunctional", "متعدد الوظائف") },
  { id: "industrial", label: bi("“industrial”", "«صناعي»") },
  { id: "lifelike", label: bi("lifelike motion", "حركة كالكائن الحي") },
];

/**
 * What each definition's wording contains (slide 6, book §1.3, pp. 22–23). Read off the wording, not
 * Table 1.1: that table gives the RIA the same industrial scope as the RAA, but only the RAA's
 * wording says "industrial" (p. 22).
 */
export const REQUIRES: Record<Body, Record<Criterion, boolean>> = {
  ria: { manipulator: true, reprogrammable: true, multifunctional: true, industrial: false, lifelike: false },
  raa: { manipulator: true, reprogrammable: true, multifunctional: true, industrial: true, lifelike: false },
  jara: { manipulator: false, reprogrammable: false, multifunctional: false, industrial: false, lifelike: true },
};

/** Each body's name, and the phrases of its definition that do the work. */
export const DEFINITIONS: Record<Body, { abbr: string; name: string; phrases: readonly Bi[] }> = {
  ria: {
    abbr: "RIA",
    name: "Robotics Industry Association",
    phrases: [bi("re-programmable", "قابلة لإعادة البرمجة"), bi("multifunctional manipulator", "ذراع آلية متعددة الوظائف"), bi("moves material, parts, tools", "تحرّك المواد والقطع والأدوات"), bi("variable programmed motions", "حركات مبرمجة متغيرة")],
  },
  raa: {
    abbr: "RAA",
    name: "Robotics Association of America",
    phrases: [bi("an industrial robot", "الروبوت الصناعي"), bi("re-programmable", "قابل لإعادة البرمجة"), bi("multifunctional manipulator", "ذراع آلية متعددة الوظائف"), bi("variable programmed motions", "حركات مبرمجة متغيرة")],
  },
  jara: {
    abbr: "JARA",
    name: "Japan Robot Association",
    phrases: [bi("moves in a flexible manner", "تتحرك بطريقة مرنة"), bi("like living organisms", "مثل الكائنات الحية"), bi("with or without intelligence", "ذكية أو غير ذكية"), bi("in response to human commands", "استجابةً لأوامر الإنسان")],
  },
};

/** A machine's relevant traits. JARA also asks for operation in response to human commands. */
export type Traits = Record<Criterion, boolean> & { onCommand: boolean };

/** Does the machine meet the body's definition? Every requirement must hold. */
export function meets(body: Body, t: Traits): boolean {
  const required = CRITERIA.filter((c) => REQUIRES[body][c.id]).every((c) => t[c.id]);
  return body === "jara" ? required && t.onCommand : required;
}

export type Candidate = { id: string; name: Bi; traits: Traits };

const ARM_TRAITS: Traits = { manipulator: true, reprogrammable: true, multifunctional: true, industrial: true, lifelike: true, onCommand: true };

/** The book's borderline cases (p. 23): a powered prosthetic limb and a teleoperated handling device. */
export const CANDIDATES = {
  arm: { id: "arm", name: bi("Welding arm", "ذراع لحام"), traits: ARM_TRAITS },
  prosthetic: {
    id: "prosthetic",
    name: bi("Prosthetic limb", "طرف صناعي"),
    traits: { manipulator: false, reprogrammable: false, multifunctional: false, industrial: false, lifelike: true, onCommand: true },
  },
  teleop: {
    id: "teleop",
    name: bi("Teleoperated handler", "مناوِل يُدار عن بُعد"),
    traits: { manipulator: true, reprogrammable: false, multifunctional: true, industrial: true, lifelike: true, onCommand: true },
  },
} as const satisfies Record<string, Candidate>;

/** One shop floor, counted with each body's rule. */
export const FLEET: readonly Candidate[] = [
  CANDIDATES.arm,
  { id: "painter", name: bi("Painting arm", "ذراع طلاء"), traits: ARM_TRAITS },
  { id: "palletiser", name: bi("Palletiser", "رصّ المنصات"), traits: ARM_TRAITS },
  CANDIDATES.prosthetic,
  CANDIDATES.teleop,
];

export const robotCount = (body: Body, machines: readonly Candidate[] = FLEET) => machines.filter((m) => meets(body, m.traits)).length;

/* ---------- The robotic system (slide 8, book §1.5) ---------- */

export type BlockId = "sensors" | "power" | "input" | "controller" | "arm" | "storage" | "tooling";

export const BLOCKS: Record<BlockId, Bi> = {
  sensors: bi("Sensors", "المستشعرات"),
  power: bi("Power supply", "مصدر الطاقة"),
  input: bi("Input / teach pendant", "الإدخال / لوحة التعليم"),
  controller: bi("Computer controller", "المتحكِّم الحاسوبي"),
  arm: bi("Mechanical arm", "الذراع الميكانيكية"),
  storage: bi("Program storage", "تخزين البرامج"),
  tooling: bi("End-of-arm tooling", "أدوات نهاية الذراع"),
};

/** What each block does, in a few words. */
export const BLOCK_ROLES: Record<BlockId, Bi> = {
  sensors: bi("report the state", "تُبلغ عن الحالة"),
  power: bi("energy for the arm", "طاقة للذراع"),
  input: bi("a human teaches it", "الإنسان يعلّمه"),
  controller: bi("the brain", "الدماغ"),
  arm: bi("moves in space", "تتحرك في الفضاء"),
  storage: bi("keeps the programs", "تحفظ البرامج"),
  tooling: bi("does the work", "تنجز العمل"),
};

/** The arrows of slide 8: two one-way (sensors → controller, power → arm), the rest both ways. */
export const LINKS: readonly { a: BlockId; b: BlockId; twoWay: boolean }[] = [
  { a: "sensors", b: "controller", twoWay: false },
  { a: "power", b: "arm", twoWay: false },
  { a: "input", b: "controller", twoWay: true },
  { a: "controller", b: "arm", twoWay: true },
  { a: "storage", b: "controller", twoWay: true },
  { a: "arm", b: "tooling", twoWay: true },
];

/** Can something travel from `from` to `to` along one of the slide's arrows? */
export const canFlow = (from: BlockId, to: BlockId) => LINKS.some((l) => (l.a === from && l.b === to) || (l.twoWay && l.a === to && l.b === from));

export type Flow = "outward" | "back";

/** Commands and power flow out toward the mechanism; information flows back (book p. 25). */
export const FLOWS: Record<Flow, readonly (readonly BlockId[])[]> = {
  outward: [
    ["input", "controller", "arm", "tooling"],
    ["storage", "controller"],
    ["power", "arm"],
  ],
  back: [
    ["sensors", "controller"],
    ["tooling", "arm", "controller"],
    ["controller", "input"],
  ],
};

for (const [flow, routes] of Object.entries(FLOWS))
  for (const route of routes)
    route.slice(1).forEach((to, i) => {
      if (!canFlow(route[i], to)) throw new Error(`rob-lecture-01: the ${flow} route ${route.join(" → ")} has no arrow ${route[i]} → ${to}`);
    });

/** The blocks that carry a flow. */
export const blocksOf = (flow: Flow) => [...new Set(FLOWS[flow].flat())];

export type Discipline = "mechanical" | "electrical" | "computer" | "biology";

/** What each discipline the page names gives the system (book Table 1.2), and the blocks it shapes. */
export const DISCIPLINES: Record<Discipline, { gives: Bi; blocks: readonly BlockId[] }> = {
  mechanical: { gives: bi("mechanisms, structures, joints, transmissions", "الآليات والهياكل والمفاصل ونقل الحركة"), blocks: ["arm", "tooling"] },
  electrical: { gives: bi("motors, drives, power, sensors, safety circuits", "المحركات والطاقة والمستشعرات ودوائر السلامة"), blocks: ["power", "sensors", "arm"] },
  computer: { gives: bi("programs, planning, perception, networks, interfaces", "البرامج والتخطيط والإدراك والشبكات والواجهات"), blocks: ["controller", "storage", "input"] },
  biology: { gives: bi("inspiration: limbs, hands, perception", "الإلهام: الأطراف والأيدي والإدراك"), blocks: ["arm", "tooling", "sensors"] },
};

/* ---------- Feedback: closed and open loop ---------- */

/** Time constant of the arm's response, in plot units (0–1 of the time axis). */
const TAU = 0.18;
/** A heavy load makes an uncorrected (open-loop) arm stop short of the target at 1. */
export const OPEN_LOOP_REACH = 0.72;
export const closedLoop = (t: number) => 1 - Math.exp(-t / TAU);
export const openLoop = (t: number) => OPEN_LOOP_REACH * (1 - Math.exp(-t / TAU));

/* ---------- Classification (slides 10–15, book §1.6–1.7) ---------- */

export type JiraClass = { n: number; name: Bi };

export const JIRA: readonly JiraClass[] = [
  { n: 1, name: bi("Manual-handling device", "جهاز المناولة اليدوية") },
  { n: 2, name: bi("Fixed-sequence robot", "روبوت التسلسل الثابت") },
  { n: 3, name: bi("Variable-sequence robot", "روبوت التسلسل المتغير") },
  { n: 4, name: bi("Playback robot", "روبوت إعادة التشغيل") },
  { n: 5, name: bi("Numerical-control robot", "روبوت التحكم الرقمي") },
  { n: 6, name: bi("Intelligent robot", "الروبوت الذكي") },
];

/** The RIA names the upper four JIRA classes and counts only those as robots. */
export const RIA_CLASSES = JIRA.filter((c) => c.n >= 3).map((c) => c.n);
export const isRiaRobot = (n: number) => RIA_CLASSES.includes(n);

/** "3–6" */
export const rangeOf = (xs: readonly (number | string)[]) => `${xs[0]}–${xs[xs.length - 1]}`;

/** Share of the decisions the machine makes: none in class 1, all of them in class 6. */
export const machineShare = (n: number) => (n - 1) / (JIRA.length - 1);

export type AfrType = { letter: string; desc: Bi; jira: readonly number[] };

/** AFR types and the JIRA classes they roughly match (book Table 1.3). */
export const AFR: readonly AfrType[] = [
  { letter: "A", desc: bi("manual / telerobotics", "يدوي / عن بُعد"), jira: [1] },
  { letter: "B", desc: bi("predetermined cycles", "دورات محددة مسبقًا"), jira: [2] },
  { letter: "C", desc: bi("programmable, servo", "قابل للبرمجة، مؤازَر"), jira: [3, 4, 5] },
  { letter: "D", desc: bi("C + acquires information", "C مع اكتساب المعلومات"), jira: [6] },
];

export const afrOf = (n: number) => AFR.find((t) => t.jira.includes(n));

export type Generation = { n: number; name: Bi; period: Bi; sensing: Bi; decides: Bi };

export const GENERATIONS: readonly Generation[] = [
  { n: 1, name: bi("1st generation", "الجيل الأول"), period: bi("1960s–70s", "الستينيات والسبعينيات"), sensing: bi("internal sensors only", "مستشعرات داخلية فقط"), decides: bi("repeats stored motions", "يكرّر الحركات المخزَّنة") },
  { n: 2, name: bi("2nd generation", "الجيل الثاني"), period: bi("1980s", "الثمانينيات"), sensing: bi("+ external sensors", "+ مستشعرات خارجية"), decides: bi("limited decisions", "قرارات محدودة") },
  { n: 3, name: bi("3rd generation", "الجيل الثالث"), period: bi("late 1990s on", "منذ أواخر التسعينيات"), sensing: bi("+ artificial intelligence", "+ الذكاء الاصطناعي"), decides: bi("recognises, learns, adapts", "يتعرّف ويتعلّم ويتكيّف") },
];

/** Which situations each generation copes with: the taught spot, a shifted part, a part never seen before. */
export type Situation = "taught" | "shifted" | "new";
export const copes = (generation: number, s: Situation) => (s === "taught" ? true : s === "shifted" ? generation >= 2 : generation >= 3);

export type Axis = "use" | "mobility" | "power" | "control" | "generation";

/** The practical axes of slide 13 (kinematic configuration is Lecture 2), with their categories. */
export const AXES: readonly { id: Axis; name: Bi; options: readonly { id: string; label: Bi }[] }[] = [
  { id: "use", name: bi("Use", "الاستخدام"), options: [{ id: "industrial", label: bi("Industrial", "صناعي") }, { id: "non-industrial", label: bi("Non-industrial", "غير صناعي") }] },
  { id: "mobility", name: bi("Mobility", "التنقّل"), options: [{ id: "fixed", label: bi("Fixed", "ثابت") }, { id: "mobile", label: bi("Mobile", "متنقّل") }] },
  {
    id: "power",
    name: bi("Power source", "مصدر الطاقة"),
    options: [{ id: "electric", label: bi("Electric", "كهربائي") }, { id: "hydraulic", label: bi("Hydraulic", "هيدروليكي") }, { id: "pneumatic", label: bi("Pneumatic", "هوائي") }],
  },
  { id: "control", name: bi("Control", "التحكم"), options: [{ id: "servo", label: bi("Servo", "مؤازَر") }, { id: "non-servo", label: bi("Non-servo", "غير مؤازَر") }] },
  { id: "generation", name: bi("Generation", "الجيل"), options: [{ id: "1", label: bi("1st", "الأول") }, { id: "2", label: bi("2nd", "الثاني") }, { id: "3", label: bi("3rd", "الثالث") }] },
];

/** Three machines placed on every axis: a seam-following welding arm, the book's Example 1.1 press loader, a Mars rover. */
export const SPECIMENS = {
  arm: { name: bi("Welding arm", "ذراع لحام"), values: { use: "industrial", mobility: "fixed", power: "electric", control: "servo", generation: "2" } },
  loader: { name: bi("Press loader", "مُلقِّم مكبس"), values: { use: "industrial", mobility: "fixed", power: "pneumatic", control: "non-servo", generation: "1" } },
  rover: { name: bi("Mars rover", "مركبة المريخ"), values: { use: "non-industrial", mobility: "mobile", power: "electric", control: "servo", generation: "3" } },
} as const satisfies Record<string, { name: Bi; values: Record<Axis, string> }>;

export type Family = "manip" | "motion" | "loco" | "swimfly";

/** The function families (slide 15), with the engineering problem each predicts (book p. 32). */
export const FAMILIES: Record<Family, { name: Bi; examples: readonly Bi[]; problem: Bi }> = {
  manip: {
    name: bi("Manipulators", "الأذرع الآلية"),
    examples: [bi("6-axis articulated arm", "ذراع مفصلية سداسية المحاور"), bi("4-axis palletiser", "رصّ منصات رباعي المحاور")],
    problem: bi("Where is the tool?", "أين الأداة؟"),
  },
  motion: {
    name: bi("Motion generators", "مولِّدات الحركة"),
    examples: [bi("flight simulator", "محاكي طيران"), bi("SCARA", "SCARA"), bi("moving platform", "منصة متحركة")],
    problem: bi("Move the platform", "حرّك المنصة"),
  },
  loco: {
    name: bi("Locomotors", "روبوتات التنقّل"),
    examples: [bi("Aibo, Big Dog", "Aibo و Big Dog"), bi("ASIMO, NAO", "ASIMO و NAO"), bi("Mars rover", "مركبة المريخ")],
    problem: bi("Where am I?", "أين أنا؟"),
  },
  swimfly: {
    name: bi("Swimming & flying", "السابحة والطائرة"),
    examples: [bi("AUV", "AUV"), bi("UAV", "UAV"), bi("micro-robot", "روبوت دقيق")],
    problem: bi("Sensing and energy", "الاستشعار والطاقة"),
  },
};

/* ---------- A two-link arm (the scenes draw one) ---------- */

/**
 * Joint angles in degrees, in SVG axes (y down, positive = clockwise), that put the tip of a
 * two-link arm at (dx, dy) from its shoulder, elbow up. Out-of-reach targets are clamped.
 */
export function twoLinkAngles(dx: number, dy: number, l1: number, l2: number): readonly [number, number] {
  const c = Math.min(1, Math.max(-1, (dx * dx + dy * dy - l1 * l1 - l2 * l2) / (2 * l1 * l2)));
  const q2 = Math.acos(c);
  const q1 = Math.atan2(dy, dx) - Math.atan2(l2 * Math.sin(q2), l1 + l2 * Math.cos(q2));
  const deg = (r: number) => Math.round(((r * 180) / Math.PI) * 10) / 10;
  return [deg(q1), deg(q2)];
}
