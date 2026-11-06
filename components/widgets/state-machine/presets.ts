/**
 * The state machines the <StateMachine preset="…"> widget can show, with their hand-placed
 * diagrams. Client-importable: guards and actions are functions, so the player imports a
 * preset by name instead of receiving it from the server.
 *
 * Wording comes from the pages: OS lecture 3 (slide 9 and the states table) and SE section 6
 * (the hotel reservation table and its Python code).
 */
import type { Action, ContextVar, Guard, Machine, MachineState, Transition } from "@/lib/widgets/state-machine";
import type { Bi } from "../types";

const b = (en: string, ar: string): Bi => ({ en, ar });

export type Anchor = "start" | "middle" | "end";

export type DiagramState = MachineState & {
  /** Centre of the rounded rectangle and its width, in viewBox units */
  x: number;
  y: number;
  w: number;
  /** For a final state: the UML bull's-eye it points to */
  bullseye?: { x: number; y: number; path: string };
};

export type DiagramTransition = Transition & {
  /** SVG path from the source's border to the target's; the arrowhead (and the token) end here */
  path: string;
  /** Baseline of the label's first line, and the side the text grows from it */
  at: { x: number; y: number; anchor: Anchor };
};

/** A context variable the visitor can also change (other objects share it), with − / + labels */
export type AdjustableVar = ContextVar & { min: number; max: number; less: Bi; more: Bi };

export type Preset = Omit<Machine, "states" | "transitions" | "context"> & {
  kicker: Bi;
  title: Bi;
  /** Accessible description of the diagram */
  summary: Bi;
  view: { width: number; height: number };
  /** The initial pseudo-state dot and its arrow to `initial` */
  start: { x: number; y: number; path: string };
  states: DiagramState[];
  transitions: DiagramTransition[];
  context?: AdjustableVar[];
  /** Shown under the context controls */
  contextHint?: Bi;
  /** Shown under the event buttons */
  note?: Bi;
};

// ---------- OS lecture 3: the five process states (slide 9) ----------

const processStates: Preset = {
  kicker: b("Process states", "حالات العملية"),
  title: b("Move a process through its five states", "انقل عملية بين حالاتها الخمس"),
  summary: b(
    "State diagram of a process: new, ready, running, waiting and terminated.",
    "مخطط حالات العملية: جديدة، وجاهزة، وقيد التشغيل، ومنتظرة، ومنتهية.",
  ),
  view: { width: 760, height: 370 },
  initial: "new",
  start: { x: 26, y: 60, path: "M 34 60 H 66" },
  states: [
    { id: "new", label: b("new", "جديدة"), meaning: b("Being created", "قيد الإنشاء"), x: 130, y: 60, w: 124 },
    {
      id: "ready",
      label: b("ready", "جاهزة"),
      meaning: b("Waiting to be assigned to a CPU", "تنتظر أن يُسند إليها معالج"),
      x: 240,
      y: 180,
      w: 124,
    },
    {
      id: "running",
      label: b("running", "قيد التشغيل"),
      meaning: b("Instructions are executing", "تعليماتها قيد التنفيذ"),
      x: 520,
      y: 180,
      w: 124,
    },
    {
      id: "waiting",
      label: b("waiting", "منتظرة"),
      meaning: b(
        "Waiting for an event, such as I/O completion or a signal",
        "تنتظر حدثًا، مثل اكتمال عملية إدخال/إخراج أو وصول إشارة (signal)",
      ),
      x: 380,
      y: 330,
      w: 124,
    },
    {
      id: "terminated",
      label: b("terminated", "منتهية"),
      meaning: b("Finished execution", "انتهى تنفيذها"),
      final: true,
      x: 630,
      y: 60,
      w: 124,
      bullseye: { x: 728, y: 60, path: "M 692 60 H 715" },
    },
  ],
  events: [
    { id: "admit", label: b("admitted", "القبول") },
    { id: "dispatch", label: b("scheduler dispatch", "إيفاد المُجدوِل") },
    { id: "interrupt", label: b("interrupt", "المقاطعة") },
    { id: "io-wait", label: b("I/O or event wait", "انتظار إدخال/إخراج أو حدث") },
    { id: "io-complete", label: b("I/O or event completion", "اكتمال إدخال/إخراج أو حدث") },
    { id: "exit", label: b("exit", "الخروج") },
  ],
  transitions: [
    { from: "new", event: "admit", to: "ready", path: "M 192 60 C 224 60, 224 100, 224 153", at: { x: 234, y: 92, anchor: "start" } },
    {
      from: "ready",
      event: "dispatch",
      to: "running",
      path: "M 272 207 C 310 252, 450 252, 488 207",
      at: { x: 380, y: 264, anchor: "middle" },
    },
    {
      from: "running",
      event: "interrupt",
      to: "ready",
      path: "M 488 153 C 450 108, 310 108, 272 153",
      at: { x: 380, y: 90, anchor: "middle" },
    },
    {
      from: "running",
      event: "io-wait",
      to: "waiting",
      path: "M 540 207 C 540 270, 500 330, 444 330",
      at: { x: 548, y: 268, anchor: "start" },
    },
    {
      from: "waiting",
      event: "io-complete",
      to: "ready",
      path: "M 316 330 C 260 330, 220 270, 220 209",
      at: { x: 212, y: 268, anchor: "end" },
    },
    { from: "running", event: "exit", to: "terminated", path: "M 548 153 C 548 100, 530 60, 566 60", at: { x: 562, y: 116, anchor: "start" } },
  ],
};

// ---------- SE section 6: hotel reservation, event [guard] / action ----------

const roomAvailable: Guard = { label: b("room available", "توجد غرفة متاحة"), expr: "rooms > 0", test: (c) => c.rooms > 0 };
const noRoomAvailable: Guard = {
  label: b("no room available", "لا توجد غرفة متاحة"),
  expr: "rooms == 0",
  test: (c) => c.rooms === 0,
};

const none: Action = { label: b("none", "بلا إجراء"), none: true };
const decrementRooms: Action = {
  label: b("decrement room count", "إنقاص عدد الغرف"),
  apply: (c) => ({ ...c, rooms: c.rooms - 1 }),
};
const incrementRooms: Action = {
  label: b("increment room count", "زيادة عدد الغرف"),
  apply: (c) => ({ ...c, rooms: c.rooms + 1 }),
};
const putOnList: Action = { label: b("put on list", "الإضافة إلى القائمة") };
const removeFromList: Action = { label: b("remove from list", "الحذف من القائمة") };

const hotelReservation: Preset = {
  kicker: b("State machine diagram", "مخطط آلة الحالات"),
  title: b("Drive one hotel reservation through its states", "انقل حجزًا فندقيًا واحدًا بين حالاته"),
  summary: b(
    "State diagram of a hotel reservation: Null, Requested, Confirmed, On waiting list, Used, Canceled and Archived, with guards and actions on the transitions.",
    "مخطط حالات حجز فندقي: لا شيء، ومطلوب، ومؤكَّد، وعلى قائمة الانتظار، ومُستخدَم، وملغى، ومؤرشَف، مع شروط الحراسة والإجراءات على الانتقالات.",
  ),
  view: { width: 780, height: 600 },
  initial: "null",
  start: { x: 390, y: 16, path: "M 390 24 V 43" },
  states: [
    { id: "null", label: b("Null", "لا شيء"), x: 390, y: 70, w: 150 },
    { id: "requested", label: b("Requested", "مطلوب"), x: 390, y: 190, w: 150 },
    { id: "confirmed", label: b("Confirmed", "مؤكَّد"), x: 200, y: 320, w: 150 },
    { id: "waiting", label: b("On waiting list", "على قائمة الانتظار"), x: 580, y: 320, w: 150 },
    { id: "used", label: b("Used", "مُستخدَم"), x: 200, y: 450, w: 150 },
    {
      id: "canceled",
      label: b("Canceled", "ملغى"),
      final: true,
      x: 580,
      y: 450,
      w: 150,
      bullseye: { x: 700, y: 450, path: "M 655 450 H 687" },
    },
    {
      id: "archived",
      label: b("Archived", "مؤرشَف"),
      final: true,
      x: 390,
      y: 560,
      w: 150,
      bullseye: { x: 510, y: 560, path: "M 465 560 H 497" },
    },
  ],
  events: [
    { id: "request", label: b("room request", "طلب غرفة") },
    { id: "try-confirm", label: b("try to confirm", "محاولة التأكيد") },
    { id: "give-up", label: b("customer gives up", "العميل يتراجع") },
    { id: "cancel", label: b("customer cancels", "العميل يُلغي") },
    { id: "move-in", label: b("customer moves in", "العميل ينتقل للإقامة") },
    { id: "pay", label: b("customer pays", "العميل يدفع") },
  ],
  transitions: [
    { from: "null", event: "request", to: "requested", action: none, path: "M 390 95 V 163", at: { x: 402, y: 112, anchor: "start" } },
    {
      from: "requested",
      event: "try-confirm",
      to: "confirmed",
      guard: roomAvailable,
      action: decrementRooms,
      path: "M 315 190 H 212 Q 200 190 200 202 V 293",
      at: { x: 190, y: 232, anchor: "end" },
    },
    {
      from: "requested",
      event: "try-confirm",
      to: "waiting",
      guard: noRoomAvailable,
      action: putOnList,
      path: "M 465 190 H 568 Q 580 190 580 202 V 293",
      at: { x: 592, y: 232, anchor: "start" },
    },
    {
      from: "waiting",
      event: "try-confirm",
      to: "confirmed",
      guard: roomAvailable,
      action: decrementRooms,
      path: "M 505 320 H 277",
      at: { x: 391, y: 248, anchor: "middle" },
    },
    {
      from: "waiting",
      event: "give-up",
      to: "canceled",
      action: removeFromList,
      path: "M 580 345 V 423",
      at: { x: 592, y: 372, anchor: "start" },
    },
    {
      from: "confirmed",
      event: "cancel",
      to: "canceled",
      action: incrementRooms,
      path: "M 250 345 C 250 430, 400 450, 503 450",
      at: { x: 400, y: 366, anchor: "middle" },
    },
    { from: "confirmed", event: "move-in", to: "used", action: none, path: "M 160 345 V 423", at: { x: 150, y: 372, anchor: "end" } },
    {
      from: "used",
      event: "pay",
      to: "archived",
      action: incrementRooms,
      path: "M 200 475 V 548 Q 200 560 212 560 H 313",
      at: { x: 190, y: 500, anchor: "end" },
    },
  ],
  context: [
    {
      key: "rooms",
      label: b("Rooms available", "الغرف المتاحة"),
      initial: 1,
      min: 0,
      max: 5,
      less: b("Another guest takes a room", "ضيف آخر يحجز غرفة"),
      more: b("Another guest frees a room", "ضيف آخر يُخلي غرفة"),
    },
  ],
  contextHint: b(
    "Other guests change this count too: use − and + to fill the hotel or free a room.",
    "يغيّر الضيوف الآخرون هذا العدد أيضًا: استخدم − و + لملء الفندق أو لإخلاء غرفة.",
  ),
  note: b(
    "The guarded arrows have no event of their own: in the page's code, request() calls _try_confirm() straight away, and it is called again when a room frees up. Here the “try to confirm” button runs that check.",
    "ليس للأسهم المحروسة حدث خاص بها: ففي شيفرة الصفحة تستدعي request() الدالة _try_confirm() فورًا، وتُستدعى مرة أخرى عندما تتوفر غرفة. وهنا يُجري زر «محاولة التأكيد» هذا الفحص.",
  ),
};

export const PRESETS = {
  "process-states": processStates,
  "hotel-reservation": hotelReservation,
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

export const isPresetName = (name: string): name is PresetName => Object.hasOwn(PRESETS, name);
