"use client";

import { useId, useLayoutEffect, useReducer, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { EASE } from "@/lib/motion";
import {
  contextChanges,
  contextValues,
  describeFired,
  enabledEvents,
  fire,
  guardsFor,
  initialContext,
  logDetail,
  logLine,
  stateOf,
  type Context,
} from "@/lib/widgets/state-machine";
import { BiText } from "./BiText";
import { PRESETS, type Anchor, type DiagramTransition, type Preset, type PresetName } from "./state-machine/presets";
import { bi, type Bi } from "./types";
import { usePrefersReducedMotion } from "./useStepper";
import styles from "./StateMachine.module.css";
import shared from "./widgets.module.css";

const UI = {
  current: bi("Current state", "الحالة الحالية"),
  events: bi("Events", "الأحداث"),
  eventsHint: bi(
    "Events that can fire now have a gold border. Press any other one to see why it can't fire.",
    "الأحداث التي يمكن أن تقع الآن محاطة بإطار ذهبي. اضغط على أي حدث آخر لتعرف لماذا لا يمكن أن يقع.",
  ),
  log: bi("Transition log (newest first)", "سجل الانتقالات (الأحدث أولًا)"),
  logEmpty: bi("No transitions yet: press an event.", "لا توجد انتقالات بعد: اضغط على حدث."),
  reset: bi("Reset", "إعادة الضبط"),
  lastAction: bi("Last action", "آخر إجراء"),
} as const;

const label = (text: Bi) => `${text.en} · ${text.ar}`;

/** Newest-first transition log length */
const LOG_CAP = 8;
/** Token travel time along an edge, seconds */
const TRAVEL = 0.5;

type Entry = { serial: number; line: Bi; detail: Bi | null };

type Run = {
  state: string;
  context: Context;
  log: Entry[];
  status: { tone: "info" | "fired" | "refused"; text: Bi; key: number };
  /** The last transition taken; the serial makes the same edge animate again */
  moved: { index: number; serial: number } | null;
  serial: number;
  /** What the last action did (shown next to the context) */
  effect: Bi | null;
  /** Changes whenever the context does, to flash the value */
  flash: number;
};

type Msg = { type: "fire"; event: string } | { type: "adjust"; key: string; delta: number } | { type: "reset" };

function intro(machine: Preset): Bi {
  const first = stateOf(machine, machine.initial).label;
  return {
    en: `The initial state is “${first.en}” (the arrow from the filled dot). Press an event to fire it.`,
    ar: `الحالة الابتدائية هي «${first.ar}» (يشير إليها السهم الخارج من الدائرة المُصمَتة). اضغط على حدث لإطلاقه.`,
  };
}

function start(machine: Preset): Run {
  return {
    state: machine.initial,
    context: initialContext(machine),
    log: [],
    status: { tone: "info", text: intro(machine), key: 0 },
    moved: null,
    serial: 0,
    effect: null,
    flash: 0,
  };
}

function step(machine: Preset, run: Run, msg: Msg): Run {
  const key = run.status.key + 1;

  if (msg.type === "reset") {
    return { ...start(machine), status: { tone: "info", text: intro(machine), key } };
  }

  if (msg.type === "adjust") {
    const variable = machine.context?.find((v) => v.key === msg.key);
    if (!variable) return run;
    const from = run.context[msg.key];
    const to = Math.min(variable.max, Math.max(variable.min, from + msg.delta));
    if (to === from) return run;
    const who = msg.delta < 0 ? variable.less : variable.more;
    return {
      ...run,
      context: { ...run.context, [msg.key]: to },
      status: {
        tone: "info",
        text: { en: `${who.en}: ${msg.key} ${from} → ${to}.`, ar: `${who.ar}، فتتغيّر قيمة ${msg.key} من ${from} إلى ${to}.` },
        key,
      },
      flash: key,
    };
  }

  const result = fire(machine, run.state, run.context, msg.event);
  if (!result.ok) return { ...run, status: { tone: "refused", text: result.reason, key } };

  const serial = run.serial + 1;
  const { action } = result.transition;
  const changes = contextChanges(machine, result);
  return {
    state: result.transition.to,
    context: result.context,
    log: [{ serial, line: logLine(machine, result), detail: logDetail(machine, result) }, ...run.log].slice(0, LOG_CAP),
    status: { tone: "fired", text: describeFired(machine, result), key },
    moved: { index: result.index, serial },
    serial,
    effect:
      action && !action.none
        ? {
            en: `/ ${action.label.en}` + changes.map((c) => ` · ${c.key} ${c.from} → ${c.to}`).join(""),
            ar: `/ ${action.label.ar}` + changes.map((c) => ` · قيمة ${c.key} من ${c.from} إلى ${c.to}`).join(""),
          }
        : run.effect,
    flash: changes.length ? key : run.flash,
  };
}

/** The label drawn on an edge: event (or [guard]) on the first line, "/ action" below, English then Arabic. */
function edgeLines(machine: Preset, t: DiagramTransition): { en: string[]; ar: string[] } {
  const main = t.guard
    ? { en: `[${t.guard.label.en}]`, ar: `[${t.guard.label.ar}]` }
    : machine.events.find((e) => e.id === t.event)!.label;
  const en = [main.en];
  const ar = [main.ar];
  if (t.action) {
    en.push(`/ ${t.action.label.en}`);
    ar.push(`/ ${t.action.label.ar}`);
  }
  return { en, ar };
}

// Right-to-left text measures text-anchor from its right edge, so start and end swap.
const RTL_ANCHOR: Record<Anchor, Anchor> = { start: "end", middle: "middle", end: "start" };
const LINE = 14.5;
const STATE_H = 50;

export function StateMachinePlayer({ preset }: { preset: PresetName }) {
  const machine = PRESETS[preset];
  const [run, dispatch] = useReducer((current: Run, msg: Msg) => step(machine, current, msg), machine, start);
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // The token travels the edge of the last transition; until it arrives no state is lit.
  const [arrived, setArrived] = useState(0);
  const moving = run.moved && !reduced && arrived < run.moved.serial ? run.moved : null;
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const tokenRef = useRef<SVGGElement>(null);
  const progress = useMotionValue(0);

  useLayoutEffect(() => {
    if (!moving) return;
    const path = pathRefs.current[moving.index];
    const token = tokenRef.current;
    if (!path || !token) {
      setArrived(moving.serial);
      return;
    }
    const length = path.getTotalLength();
    const place = (t: number) => {
      const point = path.getPointAtLength(t * length);
      token.setAttribute("transform", `translate(${point.x} ${point.y})`);
    };
    const land = () => {
      place(1);
      setArrived(moving.serial);
    };
    progress.jump(0);
    place(0);
    const controls = animate(progress, 1, { duration: TRAVEL, ease: EASE.outExpo, onUpdate: place, onComplete: land });
    // Animation frames stall in a hidden or throttled page: land anyway so a state is always lit.
    const fallback = window.setTimeout(() => {
      controls.stop();
      land();
    }, TRAVEL * 1000 + 250);
    return () => {
      window.clearTimeout(fallback);
      controls.stop();
    };
  }, [moving, progress]);

  const current = stateOf(machine, run.state);
  const enabled = enabledEvents(machine, run.state, run.context);
  const lit = moving ? null : run.state;
  const arrow = `url(#${uid}-arrow)`;
  const arrowOn = `url(#${uid}-arrow-on)`;
  const { width, height } = machine.view;

  return (
    <MotionRoot>
      <div className={shared.body}>
        <div className={styles.toolbar}>
          <p className={styles.current}>
            <span className={styles.currentLabel}>
              <BiText text={UI.current} inline />
            </span>
            <span className={styles.currentName}>
              <BiText text={current.label} inline />
            </span>
          </p>
          <button type="button" className={styles.reset} onClick={() => dispatch({ type: "reset" })}>
            <RotateCcw aria-hidden="true" />
            <span>
              <BiText text={UI.reset} inline />
            </span>
          </button>
        </div>

        <div className={styles.diagram}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${width} ${height}`}
            style={{ aspectRatio: `${width} / ${height}` }}
            role="img"
            aria-label={`${machine.summary.en} Current state: ${current.label.en}. · ${machine.summary.ar} الحالة الحالية: ${current.label.ar}.`}
          >
            <defs>
              {[
                [`${uid}-arrow`, styles.head],
                [`${uid}-arrow-on`, styles.headOn],
              ].map(([id, className]) => (
                <marker
                  key={id}
                  id={id}
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="10"
                  markerHeight="10"
                  markerUnits="userSpaceOnUse"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className={className} />
                </marker>
              ))}
            </defs>

            {/* Initial pseudo-state */}
            <circle className={styles.pseudo} cx={machine.start.x} cy={machine.start.y} r={7} />
            <path className={styles.edge} d={machine.start.path} markerEnd={arrow} />

            {machine.transitions.map((t, i) => {
              const on = run.moved?.index === i;
              return (
                <path
                  key={`edge-${i}`}
                  ref={(element) => {
                    pathRefs.current[i] = element;
                  }}
                  className={styles.edge}
                  data-active={on || undefined}
                  data-moving={moving?.index === i || undefined}
                  d={t.path}
                  markerEnd={on ? arrowOn : arrow}
                />
              );
            })}

            {/* Final states point to the UML bull's-eye */}
            {machine.states.map((s) =>
              s.bullseye ? (
                <g key={`final-${s.id}`} className={styles.final} data-current={lit === s.id || undefined}>
                  <path className={styles.edge} d={s.bullseye.path} markerEnd={arrow} />
                  <circle className={styles.finalRing} cx={s.bullseye.x} cy={s.bullseye.y} r={11} />
                  <circle className={styles.finalDot} cx={s.bullseye.x} cy={s.bullseye.y} r={6} />
                </g>
              ) : null,
            )}

            {machine.states.map((s) => (
              <g
                key={s.id}
                className={styles.state}
                data-current={lit === s.id || undefined}
                transform={`translate(${s.x} ${s.y})`}
              >
                <rect x={-s.w / 2} y={-STATE_H / 2} width={s.w} height={STATE_H} rx={12} />
                <text className={styles.stateName} y={-3} textAnchor="middle">
                  {s.label.en}
                </text>
                <text className={`ar ${styles.stateNameAr}`} y={15} textAnchor="middle" direction="rtl" lang="ar">
                  {s.label.ar}
                </text>
              </g>
            ))}

            {/* Labels last, so their halo sits over the lines */}
            {machine.transitions.map((t, i) => {
              const lines = edgeLines(machine, t);
              const { x, y, anchor } = t.at;
              return (
                <g key={`label-${i}`} className={styles.edgeLabel} data-active={run.moved?.index === i || undefined}>
                  {lines.en.map((line, k) => (
                    <text key={`en-${k}`} x={x} y={y + k * LINE} textAnchor={anchor}>
                      {line}
                    </text>
                  ))}
                  {lines.ar.map((line, k) => (
                    <text
                      key={`ar-${k}`}
                      className={`ar ${styles.edgeLabelAr}`}
                      x={x}
                      y={y + (lines.en.length + k) * LINE + 1}
                      textAnchor={RTL_ANCHOR[anchor]}
                      direction="rtl"
                      lang="ar"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {moving ? (
              <g ref={tokenRef} className={styles.token} aria-hidden="true">
                <circle r={8} />
              </g>
            ) : null}
          </svg>
        </div>

        {machine.context?.map((v) => {
          const value = run.context[v.key];
          return (
            <div key={v.key} className={styles.contextBar}>
              <p className={styles.contextLabel}>
                <BiText text={v.label} inline /> <span className={styles.code}>{v.key}</span>
              </p>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={shared.iconButton}
                  onClick={() => dispatch({ type: "adjust", key: v.key, delta: -1 })}
                  disabled={value <= v.min}
                  aria-label={label(v.less)}
                  title={label(v.less)}
                >
                  <Minus aria-hidden="true" />
                </button>
                <span
                  key={run.flash}
                  className={styles.value}
                  data-flash={run.flash > 0 || undefined}
                  aria-label={`${v.key} = ${value}`}
                >
                  {value}
                </span>
                <button
                  type="button"
                  className={shared.iconButton}
                  onClick={() => dispatch({ type: "adjust", key: v.key, delta: 1 })}
                  disabled={value >= v.max}
                  aria-label={label(v.more)}
                  title={label(v.more)}
                >
                  <Plus aria-hidden="true" />
                </button>
              </div>
              {run.effect ? (
                <p className={styles.effect}>
                  <span className={styles.effectLabel}>
                    <BiText text={UI.lastAction} inline />
                  </span>{" "}
                  <BiText text={run.effect} />
                </p>
              ) : null}
              {machine.contextHint ? (
                <p className={`${shared.hint} ${styles.contextHint}`}>
                  <BiText text={machine.contextHint} />
                </p>
              ) : null}
            </div>
          );
        })}

        <p className={styles.sectionTitle}>
          <BiText text={UI.events} inline />
        </p>
        <div className={styles.events} role="group" aria-label={label(UI.events)}>
          {machine.events.map((event) => {
            const guards = guardsFor(machine, run.state, event.id);
            return (
              <button
                key={event.id}
                type="button"
                className={styles.event}
                data-enabled={enabled.includes(event.id)}
                onClick={() => dispatch({ type: "fire", event: event.id })}
              >
                <span className={styles.eventName}>
                  <BiText text={event.label} />
                </span>
                {guards.length ? (
                  <span className={styles.guards}>
                    {guards.map((g) => (
                      <span key={g.expr} className={styles.guard} data-holds={g.test(run.context)}>
                        [{g.expr}]
                      </span>
                    ))}
                    <span className={styles.guardValue}>{contextValues(machine, run.context)}</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className={shared.hint}>
          <BiText text={UI.eventsHint} />
        </p>
        {machine.note ? (
          <p className={shared.hint}>
            <BiText text={machine.note} />
          </p>
        ) : null}

        <div className={`${shared.status} ${styles.status}`} data-tone={run.status.tone} aria-live="polite">
          <p key={run.status.key}>
            <BiText text={run.status.text} />
          </p>
        </div>

        <section className={styles.logBox} aria-label={label(UI.log)}>
          <p className={styles.sectionTitle}>
            <BiText text={UI.log} inline />
          </p>
          {run.log.length ? (
            <ol className={styles.log}>
              {run.log.map((entry) => (
                <li key={entry.serial}>
                  <span className={styles.logIndex}>{entry.serial}</span>
                  <span className={styles.logLine}>
                    {entry.line.en}
                    <ArLine>{entry.line.ar}</ArLine>
                  </span>
                  {entry.detail ? (
                    <span className={styles.logDetail}>
                      <BiText text={entry.detail} />
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.logEmpty}>
              <BiText text={UI.logEmpty} />
            </p>
          )}
        </section>
      </div>
    </MotionRoot>
  );
}
