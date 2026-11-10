"use client";

import { useMemo, useRef, useState } from "react";
import { cityName, fringeTable, H_SLD, ROMANIA_CITIES, ROMANIA_GOAL, type TableMode, type TableRun, type TableStep } from "@/lib/widgets/cheat-ai";
import { BiText } from "./BiText";
import { UI } from "./i18n";
import { StepperControls } from "./StepperControls";
import { bi, type Bi } from "./types";
import { stepperKeyDown, useStepper } from "./useStepper";
import styles from "./widgets.module.css";
import css from "./AStarTable.module.css";

const both = (text: Bi) => `${text.en} · ${text.ar}`;

type FNode = TableStep["removed"];

const T = {
  widget: bi(
    "A* and greedy search table. Pick a start city and a search, then use the left and right arrow keys to step.",
    "جدول البحث A* والبحث الجشع: اختر مدينة البداية ونوع البحث، ثم استخدم السهمين الأيمن والأيسر للتنقل بين الخطوات.",
  ),
  start: bi("Start city", "مدينة البداية"),
  mode: bi("Search", "البحث"),
  greedy: bi("Greedy", "الجشع"),
  goal: bi("Goal", "الهدف"),
  removedNow: bi("Removed now", "المُزالة الآن"),
  goalPassed: bi("goal test passed", "اجتازت اختبار الهدف"),
  table: bi("The fringe before this removal, lowest f first", "الحافة قبل هذه الإزالة، الأقل f أولًا"),
  via: bi("via", "عبر"),
  chosen: bi("removed now", "تُزال الآن"),
  fresh: bi("new on the fringe", "جديدة على الحافة"),
  legend: bi(
    "▶ removed now · + new, from the last expansion · ← the parent it was reached from · equal f: first in, first out",
    "▶ تُزال الآن · + جديدة من آخر توسيع · ← العقدة الأم التي وُصل إليها منها · عند تساوي f يخرج الأسبق دخولًا",
  ),
  greedyNote: bi("Greedy orders the fringe by h alone; g is shown so the route's cost can be added up.", "يرتّب البحث الجشع الحافة حسب h وحدها؛ وتظهر g لجمع تكلفة الطريق فقط."),
  path: bi("Path", "المسار"),
  cost: bi("Cost", "التكلفة"),
  order: bi("Removed, in order", "العقد المُزالة بالترتيب"),
  removed: bi("removed", "مُزالة"),
  expanded: bi("expanded", "موسَّعة"),
  generated: bi("generated", "مولَّدة"),
  notExpanded: bi("The goal is removed and passes the goal test; it is not expanded.", "يُزال الهدف ويجتاز اختبار الهدف، لكنه لا يُوسَّع."),
};

/** Non-breaking spaces: a formula inside an Arabic line stays on one line, as one left-to-right run. */
const nb = (text: string) => text.replace(/ /g, "\u00a0");
const fExpr = (n: FNode, mode: TableMode) => nb(mode === "astar" ? `f = ${n.g} + ${n.h} = ${n.f}` : `f = h = ${n.h}`);
/** "Sibiu 393, Timisoara 447": the Arabic list is separated by «،», so each entry is its own left-to-right run. */
const scored = (nodes: readonly FNode[], sep: string) => nodes.map((n) => nb(`${cityName(n.city)} ${n.f}`)).join(sep);
const named = (nodes: readonly FNode[], sep: string) => [...new Set(nodes.map((n) => nb(cityName(n.city))))].join(sep);
const km = (n: number) => nb(`${n} km`);

/** What the status line says about a step. */
function statusOf(step: TableStep, mode: TableMode): Bi {
  const name = cityName(step.removed.city);
  const f = fExpr(step.removed, mode);
  const goal = cityName(ROMANIA_GOAL);
  if (step.goal) {
    return step.removed.path.length === 1
      ? bi(`The start is already ${goal}: the first removal passes the goal test.`, `البداية هي ${goal} نفسها، فأول إزالة تجتاز اختبار الهدف.`)
      : bi(
          `${goal} has the lowest f on the fringe (${f}). It passes the goal test, so the search stops and returns its path.`,
          `لـ ${goal} أقل قيمة f على الحافة (${f}). وهي تجتاز اختبار الهدف، لذا يتوقف البحث ويُرجع مسارها.`,
        );
  }
  let en = `${name} has the lowest f on the fringe (${f}), so it is removed. It is not ${goal}, so it is expanded: ${scored(step.added, ", ")} go on the fringe.`;
  let ar = `لـ ${name} أقل قيمة f على الحافة (${f})، لذا تُزال. وهي ليست ${goal}، لذا تُوسَّع فتدخل الحافة العقد ${scored(step.added, "، ")}.`;
  const ties = step.ties.filter((n) => n.city !== ROMANIA_GOAL);
  if (ties.length) {
    en += ` ${named(ties, ", ")} ${ties.length === 1 ? "has" : "have"} the same f; ties go first in, first out, and ${name} was added earlier.`;
    ar += ` ولـ ${named(ties, "، ")} قيمة f نفسها، وعند التساوي يخرج الأسبق دخولًا، وقد دخلت ${name} الحافة أولًا.`;
  }
  const waiting = step.waiting[0];
  if (waiting) {
    if (waiting.f > step.removed.f) {
      en += ` ${goal} is already on the fringe with ${nb(`f = ${waiting.f}`)}, but the goal is tested only when a node is removed, and ${nb(`${step.removed.f} < ${waiting.f}`)}.`;
      ar += ` و ${goal} موجودة على الحافة بالفعل مع ${nb(`f = ${waiting.f}`)}، لكن اختبار الهدف لا يُجرى إلا عند إزالة العقدة، و ${nb(`${step.removed.f} < ${waiting.f}`)}.`;
    } else {
      en += ` ${goal} is on the fringe with the same f, but it was added later, and the goal is tested only on removal.`;
      ar += ` و ${goal} على الحافة بقيمة f نفسها، لكنها دخلت لاحقًا، واختبار الهدف لا يُجرى إلا عند الإزالة.`;
    }
  }
  if (step.repeats.length) {
    const one = new Set(step.repeats.map((n) => n.city)).size === 1;
    en += ` ${named(step.repeats, ", ")} ${one ? "goes" : "go"} back on the fringe: tree search does not notice repeated states.`;
    ar += ` وتعود ${named(step.repeats, "، ")} إلى الحافة، فالبحث الشجري لا ينتبه إلى الحالات المتكررة.`;
  }
  return bi(en, ar);
}

/** How this run compares with the other search from the same start. */
function compareOf(run: TableRun, other: TableRun): Bi | null {
  if (run.cost === null || other.cost === null || run.path?.length === 1) return null;
  const s = cityName(run.start);
  if (run.mode === "greedy") {
    const diff = run.cost - other.cost;
    return diff > 0
      ? bi(
          `A* from ${s} finds a ${km(other.cost)} route: greedy's is ${km(diff)} longer, because ${nb("f = h")} ignores the distance already driven.`,
          `يجد A* من ${s} طريقًا طوله ${km(other.cost)}، فطريق البحث الجشع أطول بـ ${km(diff)}، لأن ${nb("f = h")} تتجاهل المسافة المقطوعة.`,
        )
      : bi(
          `A* finds the same ${km(other.cost)} here, but greedy search does not guarantee the cheapest route.`,
          `ويجد A* الطول نفسه هنا، أي ${km(other.cost)}، لكن البحث الجشع لا يضمن أرخص طريق.`,
        );
  }
  return other.cost > run.cost
    ? bi(
        `Greedy search from ${s} removes only ${other.removed} nodes but returns ${km(other.cost)}. A* with an admissible h returns the cheapest route.`,
        `أما البحث الجشع من ${s} فيُزيل عقدًا أقل عددها ${other.removed}، لكنه يُرجع ${km(other.cost)}. و A* مع h مقبول يُرجع أرخص طريق.`,
      )
    : bi(
        `Greedy search finds the same ${km(other.cost)} here (removing ${other.removed} nodes), but only A* guarantees the cheapest route.`,
        `ويجد البحث الجشع الطول نفسه هنا، أي ${km(other.cost)}، بعد إزالة ${other.removed} من العقد، لكن A* وحده يضمن أرخص طريق.`,
      );
}

function Result({ run, other }: { run: TableRun; other: TableRun }) {
  if (!run.path || run.cost === null) return null;
  const compare = compareOf(run, other);
  const cost = run.legs.length ? `${run.legs.join(" + ")} = ${km(run.cost)}` : km(run.cost);
  return (
    <div className={css.result}>
      <dl className={css.facts}>
        <div>
          <dt>
            <BiText text={T.path} inline />
          </dt>
          <dd dir="ltr">{run.path.map(cityName).join(" → ")}</dd>
        </div>
        <div>
          <dt>
            <BiText text={T.cost} inline />
          </dt>
          <dd className={css.mono} dir="ltr">
            {cost}
          </dd>
        </div>
        <div>
          <dt>
            <BiText text={T.order} inline />
          </dt>
          <dd dir="ltr">{run.order.map(cityName).join(", ")}</dd>
        </div>
      </dl>
      <p className={css.stats}>
        {([
          [run.removed, T.removed],
          [run.expanded, T.expanded],
          [run.generated, T.generated],
        ] as const).map(([n, label]) => (
          <span key={label.en} className={css.stat}>
            <b>{n}</b> <BiText text={label} inline />
          </span>
        ))}
      </p>
      <p className={css.small}>
        <BiText text={T.notExpanded} />
      </p>
      {compare ? (
        <p className={css.small}>
          <BiText text={compare} />
        </p>
      ) : null}
    </div>
  );
}

export function AStarTablePlayer({ start: initialStart, mode: initialMode }: { start: string; mode: TableMode }) {
  const [start, setStart] = useState(initialStart);
  const [mode, setMode] = useState<TableMode>(initialMode);
  const run = useMemo(() => fringeTable(start, mode), [start, mode]);
  const other = useMemo(() => fringeTable(start, mode === "astar" ? "greedy" : "astar"), [start, mode]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const stepper = useStepper(run.steps.length, { frameRef: bodyRef, interval: 1600 });
  const step = run.steps[stepper.index];
  const status = statusOf(step, mode);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Arrow keys inside the table scroll it instead of stepping.
    if (tableRef.current?.contains(event.target as Node)) return;
    stepperKeyDown(stepper)(event);
  };

  const choose = (next: { start?: string; mode?: TableMode }) => {
    if (next.start) setStart(next.start);
    if (next.mode) setMode(next.mode);
    stepper.reset();
  };

  return (
    <div ref={bodyRef} className={styles.body} tabIndex={0} onKeyDown={onKeyDown} aria-label={both(T.widget)}>
      <div className={styles.options}>
        <label className={styles.field}>
          <span>
            <BiText text={T.start} inline />
          </span>
          <select value={start} onChange={(event) => choose({ start: event.target.value })}>
            {ROMANIA_CITIES.map((city) => (
              <option key={city} value={city}>
                {cityName(city)} (h = {H_SLD[city]})
              </option>
            ))}
          </select>
        </label>
        <div className={styles.field}>
          <span>
            <BiText text={T.mode} inline />
          </span>
          <div className={styles.segmented} role="group" aria-label={both(T.mode)}>
            <button type="button" aria-pressed={mode === "astar"} onClick={() => choose({ mode: "astar" })}>
              A* <span className={css.modeF}>(f = g + h)</span>
            </button>
            <button type="button" aria-pressed={mode === "greedy"} onClick={() => choose({ mode: "greedy" })}>
              <BiText text={T.greedy} inline /> <span className={css.modeF}>(f = h)</span>
            </button>
          </div>
        </div>
        <div className={styles.field}>
          <span>
            <BiText text={T.goal} inline />
          </span>
          <span className={css.goalChip}>{cityName(ROMANIA_GOAL)}</span>
        </div>
      </div>

      <p className={css.removed}>
        <span className={css.removedLabel}>
          <BiText text={T.removedNow} inline />
        </span>
        <span className={css.removedCity}>{cityName(step.removed.city)}</span>
        <code className={css.removedF} dir="ltr">
          {fExpr(step.removed, mode)}
        </code>
        {step.goal ? (
          <span className={css.goalTag}>
            ✓ <BiText text={T.goalPassed} inline />
          </span>
        ) : null}
      </p>

      <div ref={tableRef} className={css.tableWrap} role="region" tabIndex={0} aria-label={both(T.table)}>
        <table className={css.table} data-mode={mode}>
          <caption className="visually-hidden">{both(T.table)}</caption>
          <thead>
            <tr>
              <th scope="col" className={css.mark}>
                <span className="visually-hidden">{both(T.chosen)}</span>
              </th>
              <th scope="col">
                n{" "}
                <span className={css.viaHead}>
                  (<BiText text={T.via} inline />)
                </span>
              </th>
              <th scope="col" className={css.num} data-col="g">
                g
              </th>
              <th scope="col" className={css.num}>
                h
              </th>
              <th scope="col" className={css.num}>
                f
              </th>
            </tr>
          </thead>
          <tbody>
            {step.rows.map((row) => (
              <tr key={row.seq} data-chosen={row.chosen || undefined} data-fresh={row.fresh || undefined} data-goal={row.city === ROMANIA_GOAL || undefined}>
                <td className={css.mark}>
                  {row.chosen ? (
                    <>
                      <span aria-hidden="true">▶</span>
                      <span className="visually-hidden">{both(T.chosen)}</span>
                    </>
                  ) : null}
                  {row.fresh ? (
                    <>
                      <span aria-hidden="true" className={css.plus}>
                        +
                      </span>
                      <span className="visually-hidden">{both(T.fresh)}</span>
                    </>
                  ) : null}
                </td>
                <td>
                  <span className={css.cityName}>{cityName(row.city)}</span>
                  {row.via ? (
                    <span className={css.via}>
                      <span aria-hidden="true">← </span>
                      <span className="visually-hidden">{both(T.via)} </span>
                      {cityName(row.via)}
                    </span>
                  ) : null}
                </td>
                <td className={css.num} data-col="g">
                  {row.g}
                </td>
                <td className={css.num}>{row.h}</td>
                <td className={`${css.num} ${css.f}`}>{row.f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={css.legend}>
        <BiText text={T.legend} />
      </p>
      {mode === "greedy" ? (
        <p className={css.legend}>
          <BiText text={T.greedyNote} />
        </p>
      ) : null}

      {step.goal ? <Result run={run} other={other} /> : null}

      <StepperControls stepper={stepper} />

      <div className={styles.status} aria-live="polite">
        <BiText text={status} />
      </div>
      <p className={styles.hint}>
        <BiText text={UI.keys} />
      </p>
    </div>
  );
}
