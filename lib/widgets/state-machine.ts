/**
 * A UML state machine with `event [guard] / action` transitions over a small numeric
 * context (e.g. a room count). Pure and client-safe: the player runs it in the browser, and
 * the server wrapper replays an `expect` path with it at build time.
 *
 * Every sentence it produces is bilingual (`Bi`). Arabic sentences keep code (`rooms > 0`,
 * `rooms = 1`) and digits as separate runs between Arabic words, never after a colon, so the
 * site's automatic left-to-right isolation (ArLine) keeps them in the right order.
 */
import type { Bi } from "@/components/widgets/types";

export type Context = Readonly<Record<string, number>>;

export type MachineState = {
  id: string;
  label: Bi;
  /** UML final state: no event leaves it (drawn with an arrow to a bull's-eye) */
  final?: boolean;
  /** What the state means, in the page's own words */
  meaning?: Bi;
};

export type MachineEvent = { id: string; label: Bi };

export type Guard = {
  /** As written on the page, drawn in [brackets] */
  label: Bi;
  /** The same condition as code over the context, e.g. "rooms > 0" */
  expr: string;
  test: (context: Context) => boolean;
};

export type Action = {
  /** As written after the slash on the page */
  label: Bi;
  /** How the action changes the context (omitted: it doesn't) */
  apply?: (context: Context) => Context;
  /** The page's "/ none": drawn on the edge, but nothing is done */
  none?: boolean;
};

export type Transition = {
  from: string;
  event: string;
  to: string;
  guard?: Guard;
  action?: Action;
};

export type ContextVar = { key: string; label: Bi; initial: number };

export type Machine = {
  initial: string;
  states: readonly MachineState[];
  events: readonly MachineEvent[];
  transitions: readonly Transition[];
  context?: readonly ContextVar[];
};

export type Fired = {
  ok: true;
  /** Index into machine.transitions */
  index: number;
  transition: Transition;
  before: Context;
  context: Context;
};

export type Refused = {
  ok: false;
  reason: Bi;
  /** The events that can fire in this state with this context */
  enabled: string[];
};

export type FireResult = Fired | Refused;

// ---------- lookups ----------

export function stateOf(machine: Machine, id: string): MachineState {
  const state = machine.states.find((s) => s.id === id);
  if (!state) throw new Error(`Unknown state "${id}"`);
  return state;
}

export function eventOf(machine: Machine, id: string): MachineEvent {
  const event = machine.events.find((e) => e.id === id);
  if (!event) throw new Error(`Unknown event "${id}" (known: ${machine.events.map((e) => e.id).join(", ")})`);
  return event;
}

export function initialContext(machine: Machine): Context {
  return Object.fromEntries((machine.context ?? []).map((v) => [v.key, v.initial]));
}

const passes = (t: Transition, context: Context) => !t.guard || t.guard.test(context);

/** Events that can fire from `state` with `context`, in the machine's event order. */
export function enabledEvents(machine: Machine, state: string, context: Context): string[] {
  return machine.events
    .filter((e) => machine.transitions.some((t) => t.from === state && t.event === e.id && passes(t, context)))
    .map((e) => e.id);
}

/** The guarded transitions that `event` could take from `state` (to show on its button). */
export function guardsFor(machine: Machine, state: string, event: string): Guard[] {
  const all = machine.transitions.filter((t) => t.event === event && t.guard);
  const here = all.filter((t) => t.from === state);
  const guards = (here.length ? here : all).map((t) => t.guard!);
  return guards.filter((g, i) => guards.findIndex((h) => h.expr === g.expr) === i);
}

// ---------- wording ----------

const qEn = (s: string) => `“${s}”`;
const qAr = (s: string) => `«${s}»`;

/** “a”, “b” and “c” / «a»، «b» و«c» */
function listOf(items: Bi[]): Bi {
  const en = items.map((b) => qEn(b.en));
  const ar = items.map((b) => qAr(b.ar));
  const last = (words: string[], and: string, comma: string) =>
    words.length > 1 ? `${words.slice(0, -1).join(comma)}${and}${words[words.length - 1]}` : words.join("");
  return { en: last(en, " and ", ", "), ar: last(ar, " و", "، ") };
}

function join(...parts: (Bi | null | undefined)[]): Bi {
  const kept = parts.filter((p): p is Bi => Boolean(p));
  return { en: kept.map((p) => p.en).join(" "), ar: kept.map((p) => p.ar).join(" ") };
}

/** "rooms = 1, …": code, the same in both languages */
export function contextValues(machine: Machine, context: Context): string {
  return (machine.context ?? []).map((v) => `${v.key} = ${context[v.key]}`).join(", ");
}

function possibleNow(machine: Machine, state: MachineState, enabled: string[]): Bi {
  if (enabled.length === 0) {
    return {
      en: `No event can fire in ${qEn(state.label.en)}: press Reset to start again.`,
      ar: `لا يمكن أن يقع أي حدث في الحالة ${qAr(state.label.ar)}، فاضغط «إعادة الضبط» للبدء من جديد.`,
    };
  }
  const names = listOf(enabled.map((id) => eventOf(machine, id).label));
  return {
    en: `In ${qEn(state.label.en)} you can fire: ${names.en}.`,
    ar: `الأحداث التي يمكن أن تقع في الحالة ${qAr(state.label.ar)} هي ${names.ar}.`,
  };
}

// ---------- firing ----------

/** Fires `event` in `state`: the transition taken and the new context, or why it can't fire. */
export function fire(machine: Machine, state: string, context: Context, event: string): FireResult {
  const st = stateOf(machine, state);
  const ev = eventOf(machine, event).label;
  const indexed = machine.transitions.map((transition, index) => ({ transition, index }));
  const leaving = indexed.filter(({ transition }) => transition.from === state);
  const candidates = leaving.filter(({ transition }) => transition.event === event);

  const taken = candidates.find(({ transition }) => passes(transition, context));
  if (taken) {
    const { transition, index } = taken;
    const next = transition.action?.apply ? transition.action.apply(context) : context;
    return { ok: true, index, transition, before: context, context: next };
  }

  const enabled = enabledEvents(machine, state, context);
  let reason: Bi;

  if (leaving.length === 0) {
    reason = st.final
      ? {
          en: `${qEn(ev.en)} can't fire: ${qEn(st.label.en)} is a final state, so no event leaves it. Press Reset to start again.`,
          ar: `لا يمكن أن يقع الحدث ${qAr(ev.ar)}، لأن ${qAr(st.label.ar)} حالة نهائية لا يخرج منها أي حدث. اضغط «إعادة الضبط» للبدء من جديد.`,
        }
      : {
          en: `${qEn(ev.en)} can't fire: no transition leaves ${qEn(st.label.en)}. Press Reset to start again.`,
          ar: `لا يمكن أن يقع الحدث ${qAr(ev.ar)}، لأنه لا يخرج أي انتقال من الحالة ${qAr(st.label.ar)}. اضغط «إعادة الضبط» للبدء من جديد.`,
        };
    return { ok: false, reason, enabled };
  }

  if (candidates.length === 0) {
    const sources = machine.transitions
      .filter((t) => t.event === event)
      .map((t) => t.from)
      .filter((id, i, all) => all.indexOf(id) === i)
      .map((id) => stateOf(machine, id).label);
    const from = listOf(sources);
    reason = {
      en: `${qEn(ev.en)} can't fire in ${qEn(st.label.en)}: no ${qEn(ev.en)} transition leaves this state (it only leaves ${from.en}).`,
      ar: `لا يمكن أن يقع الحدث ${qAr(ev.ar)} في الحالة ${qAr(st.label.ar)}، لأنه لا يخرج منها أي انتقال بهذا الحدث (فهو لا يخرج إلا من ${from.ar}).`,
    };
  } else {
    const guards = candidates.map(({ transition }) => transition.guard!);
    const values = contextValues(machine, context);
    if (guards.length === 1) {
      const [g] = guards;
      reason = {
        en: `${qEn(ev.en)} can't fire in ${qEn(st.label.en)}: its guard [${g.label.en}] (${g.expr}) is false, since ${values}.`,
        ar: `لا يمكن أن يقع الحدث ${qAr(ev.ar)} في الحالة ${qAr(st.label.ar)}، لأن شرط الحراسة [${g.label.ar}] غير متحقق: الشرط ${g.expr} خاطئ لأن ${values}.`,
      };
    } else {
      reason = {
        en: `${qEn(ev.en)} can't fire in ${qEn(st.label.en)}: all its guards are false (${guards.map((g) => `[${g.label.en}] ${g.expr}`).join("; ")}), since ${values}.`,
        ar: `لا يمكن أن يقع الحدث ${qAr(ev.ar)} في الحالة ${qAr(st.label.ar)}، لأن جميع شروط الحراسة الخاصة به غير متحققة (${guards.map((g) => `[${g.label.ar}]`).join("، ")}) لأن ${values}.`,
      };
    }
  }

  return { ok: false, reason: join(reason, possibleNow(machine, st, enabled)), enabled };
}

/**
 * Replays a comma-separated event path from the initial state ("admit,dispatch,exit") and
 * throws, naming the step and the reason, if any event can't fire. Used to fail the build.
 */
export function runPath(machine: Machine, path: string, where = "state machine") {
  const ids = path
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length === 0) throw new Error(`${where}: expect="${path}" names no events`);
  let state = machine.initial;
  let context = initialContext(machine);
  const steps: Fired[] = [];
  ids.forEach((id, i) => {
    if (!machine.events.some((e) => e.id === id)) {
      throw new Error(`${where}: expect step ${i + 1} "${id}" is not an event (known: ${machine.events.map((e) => e.id).join(", ")})`);
    }
    const result = fire(machine, state, context, id);
    if (!result.ok) throw new Error(`${where}: expect step ${i + 1} "${id}" can't fire in "${state}". ${result.reason.en}`);
    steps.push(result);
    state = result.transition.to;
    context = result.context;
  });
  return { state, context, steps };
}

/** Throws if a transition names an unknown state or event, or an id is used twice. */
export function validateMachine(machine: Machine, where = "state machine") {
  const fail = (message: string) => {
    throw new Error(`${where}: ${message}`);
  };
  const stateIds = machine.states.map((s) => s.id);
  const eventIds = machine.events.map((e) => e.id);
  stateIds.forEach((id, i) => stateIds.indexOf(id) !== i && fail(`state "${id}" is defined twice`));
  eventIds.forEach((id, i) => eventIds.indexOf(id) !== i && fail(`event "${id}" is defined twice`));
  if (!stateIds.includes(machine.initial)) fail(`initial state "${machine.initial}" is not a state`);
  for (const t of machine.transitions) {
    if (!stateIds.includes(t.from)) fail(`transition from unknown state "${t.from}"`);
    if (!stateIds.includes(t.to)) fail(`transition to unknown state "${t.to}"`);
    if (!eventIds.includes(t.event)) fail(`transition on unknown event "${t.event}"`);
  }
  for (const s of machine.states) {
    if (s.final && machine.transitions.some((t) => t.from === s.id)) fail(`final state "${s.id}" has a transition leaving it`);
  }
}

// ---------- what the player shows ----------

/** Log line: "ready —scheduler dispatch→ running" (in Arabic the arrow points left). */
export function logLine(machine: Machine, fired: Fired): Bi {
  const { from, to, event } = fired.transition;
  const a = stateOf(machine, from).label;
  const b = stateOf(machine, to).label;
  const ev = eventOf(machine, event).label;
  return { en: `${a.en} —${ev.en}→ ${b.en}`, ar: `${a.ar} —${ev.ar}← ${b.ar}` };
}

/** "[room available] / decrement room count · rooms 1 → 0", or null without guard and action. */
export function logDetail(machine: Machine, fired: Fired): Bi | null {
  const { guard, action } = fired.transition;
  if (!guard && !action) return null;
  const en: string[] = [];
  const ar: string[] = [];
  if (guard) {
    en.push(`[${guard.label.en}]`);
    ar.push(`[${guard.label.ar}]`);
  }
  if (action) {
    en.push(`/ ${action.label.en}`);
    ar.push(`/ ${action.label.ar}`);
  }
  const changes = contextChanges(machine, fired);
  return {
    en: en.join(" ") + changes.map((c) => ` · ${c.key} ${c.from} → ${c.to}`).join(""),
    ar: ar.join(" ") + changes.map((c) => ` · قيمة ${c.key} من ${c.from} إلى ${c.to}`).join(""),
  };
}

export function contextChanges(machine: Machine, fired: Fired) {
  return (machine.context ?? [])
    .filter((v) => fired.before[v.key] !== fired.context[v.key])
    .map((v) => ({ key: v.key, from: fired.before[v.key], to: fired.context[v.key] }));
}

/** The status sentence after a transition: what happened, the guard, the action, the new state. */
export function describeFired(machine: Machine, fired: Fired): Bi {
  const { guard, action, to } = fired.transition;
  const line = logLine(machine, fired);
  const target = stateOf(machine, to);
  const parts: Bi[] = [{ en: `${line.en}.`, ar: `${line.ar}.` }];

  if (guard) {
    const values = contextValues(machine, fired.before);
    parts.push({
      en: `Guard [${guard.label.en}] holds: ${guard.expr} is true, since ${values}.`,
      ar: `شرط الحراسة [${guard.label.ar}] متحقق، فالشرط ${guard.expr} صحيح لأن ${values}.`,
    });
  }

  if (action?.none) {
    const values = contextValues(machine, fired.context);
    parts.push(
      values
        ? { en: `Action: none; ${values} is unchanged.`, ar: `لا يوجد إجراء، وتبقى ${values} دون تغيير.` }
        : { en: "Action: none.", ar: "لا يوجد إجراء." },
    );
  } else if (action) {
    const changes = contextChanges(machine, fired);
    if (changes.length) {
      parts.push({
        en: `Action: ${action.label.en}, so ${changes.map((c) => `${c.key} goes ${c.from} → ${c.to}`).join(", ")}.`,
        ar: `الإجراء: ${action.label.ar}، ${changes.map((c) => `فتتغيّر قيمة ${c.key} من ${c.from} إلى ${c.to}`).join("، ")}.`,
      });
    } else if (machine.context?.length) {
      const values = contextValues(machine, fired.context);
      parts.push({
        en: `Action: ${action.label.en}; ${values} is unchanged.`,
        ar: `الإجراء: ${action.label.ar}، وتبقى ${values} دون تغيير.`,
      });
    } else {
      parts.push({ en: `Action: ${action.label.en}.`, ar: `الإجراء: ${action.label.ar}.` });
    }
  }

  if (target.meaning) {
    parts.push({
      en: `${qEn(target.label.en)}: ${target.meaning.en}.`,
      ar: `${qAr(target.label.ar)}: ${target.meaning.ar}.`,
    });
  }
  if (target.final) {
    parts.push({
      en: `${qEn(target.label.en)} is a final state: no event leaves it.`,
      ar: `${qAr(target.label.ar)} حالة نهائية لا يخرج منها أي حدث.`,
    });
  }
  return join(...parts);
}
