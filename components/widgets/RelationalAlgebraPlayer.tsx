"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ArLine } from "@/components/mdx/Arabic";
import {
  attributeOf,
  conditionText,
  domainOf,
  evaluate,
  firstValueOf,
  formatTuple,
  formatValue,
  opsFor,
  projectsAll,
  toSql,
  type Comparison,
  type Condition,
  type Connective,
  type Evaluation,
  type Op,
  type Relation,
  type RowFate,
} from "@/lib/widgets/relational";
import { BiText } from "./BiText";
import { UI } from "./i18n";
import { StepperControls } from "./StepperControls";
import { bi, type Bi } from "./types";
import { stepperKeyDown, useStepper } from "./useStepper";
import styles from "./widgets.module.css";
import ra from "./RelationalAlgebra.module.css";

/** 0 the relation · 1 σ marks the rows it rejects · 2 σ removes them · 3 π marks columns and duplicates · 4 π removes them */
const STEPS = 5;
const stageOf = (step: number) => (step === 0 ? 0 : step <= 2 ? 1 : 2);

/** A comparison as edited: `text` is what the number box shows while typing, `value` the last valid one. */
type Term = Comparison & { text: string };
type Join = "none" | Connective;

const both = (text: Bi) => `${text.en} · ${text.ar}`;

const T = {
  sigma: bi("σ Selection condition", "σ شرط الاختيار"),
  pi: bi("π Attributes to keep", "π السمات التي تبقى"),
  comparison: (n: number) => bi(`Comparison ${n}`, `المقارنة ${n}`),
  attribute: bi("Attribute", "السمة"),
  operator: bi("Operator", "المؤثر"),
  value: bi("Value", "القيمة"),
  noCondition: bi("No condition", "بلا شرط"),
  second: bi("Second comparison", "المقارنة الثانية"),
  none: bi("None", "لا يوجد"),
  expression: bi("Relational algebra", "الجبر العلائقي"),
  sql: bi("Equivalent SQL", "عبارة SQL المكافئة"),
  tuples: bi("Tuples", "عدد الصفوف"),
  why: bi("Why the tuple goes", "سبب حذف الصف"),
  duplicate: (tuple: string) => bi(`duplicate ${tuple}`, "مكرر"),
  table: (name: string) => bi(`The relation ${name} at the current step`, `العلاقة ${name} في الخطوة الحالية`),
  widget: bi(
    "Relational algebra stepper. Build σ and π, then use the left and right arrow keys to step.",
    "أداة الجبر العلائقي خطوة بخطوة: كوّن σ و π، ثم استخدم السهمين الأيمن والأيسر للتنقل.",
  ),
};

const tuplesEn = (n: number) => `${n} tuple${n === 1 ? "" : "s"}`;

function makeTerm(relation: Relation, attr: string, op: Op = "="): Term {
  const value = firstValueOf(relation, attr);
  const ops = opsFor(attributeOf(relation, attr).type);
  return { attr, op: ops.includes(op) ? op : "=", value, text: String(value) };
}

const toTerm = (c: Comparison): Term => ({ ...c, text: String(c.value) });

/** What the status line says at each step. */
function statusOf(step: number, relation: Relation, condition: Condition | null, ev: Evaluation, identity: boolean): Bi {
  const n = relation.rows.length;
  const d = relation.attributes.length;
  const k = ev.selectedCount;
  const r = ev.result.length;
  const p = ev.projection.length;
  const dups = ev.duplicateCount;
  const cond = condition ? conditionText(condition) : "";
  const list = ev.projection.join(", ");
  const R = relation.name;

  switch (step) {
    case 0:
      return bi(
        `${R} has ${tuplesEn(n)} and ${d} attributes. First σ chooses rows, then π chooses columns.`,
        `في ${R} عدد الصفوف ${n} وعدد السمات ${d}. أولًا تنتقي σ الصفوف، ثم تنتقي π الأعمدة.`,
      );
    case 1: {
      if (!condition) {
        return bi(
          `No selection condition, so σ keeps all ${n} tuples and is left out of the expression.`,
          `لا يوجد شرط اختيار، لذا تُبقي σ كل الصفوف (${n}) ولا تُكتب في التعبير.`,
        );
      }
      const main =
        k === n
          ? bi(`Every tuple satisfies ${cond}, so σ removes nothing.`, `كل الصفوف تحقق الشرط ${cond}، لذا لا تحذف σ شيئًا.`)
          : k === 0
            ? bi(
                `No tuple satisfies ${cond}: every row is dimmed, with the reason beside it.`,
                `لا يوجد صف يحقق الشرط ${cond}: كل الصفوف باهتة، وبجانب كل منها السبب.`,
              )
            : bi(
                `σ tests each tuple against ${cond}: ${k} of ${n} satisfy it. The dimmed ones do not, and the chip beside each says why.`,
                `تختبر σ كل صف مقابل الشرط ${cond}: يحققه ${k} من ${n}. أما الصفوف الباهتة فلا تحققه، والشارة بجانب كل منها توضح السبب.`,
              );
      if (!ev.fates.some((fate) => fate.unknown)) return main;
      return bi(
        `${main.en} A comparison with NULL is unknown, and σ keeps only tuples whose condition is true.`,
        `${main.ar} والمقارنة مع NULL نتيجتها غير معروفة (unknown)، و σ لا تُبقي إلا الصفوف التي يكون شرطها صحيحًا.`,
      );
    }
    case 2:
      return condition
        ? bi(
            `The rejected tuples are removed. σ's result has ${tuplesEn(k)} and still all ${d} attributes: σ never changes the degree.`,
            `حُذفت الصفوف المرفوضة. عدد صفوف نتيجة σ هو ${k}، وما زالت فيها السمات كلها (${d}): لا تغيّر σ الدرجة (degree) أبدًا.`,
          )
        : bi(`No condition: all ${n} tuples go on to π.`, `لا يوجد شرط: تنتقل كل الصفوف (${n}) إلى π.`);
    case 3: {
      if (identity) {
        return bi(
          "π keeps every attribute, so it changes nothing here and is left out of the expression.",
          "تُبقي π كل السمات، لذا لا تغيّر شيئًا هنا ولا تُكتب في التعبير.",
        );
      }
      const dupText = dups
        ? bi(
            `${dups === 1 ? "1 tuple now repeats" : `${dups} tuples now repeat`} an earlier tuple on these attributes (marked).`,
            `عدد الصفوف التي صارت تكرارًا لصف سابق على هذه السمات: ${dups} (مُعلَّمة).`,
          )
        : bi("No two tuples agree on all of them, so there are no duplicates.", "لا يتفق صفان على كل هذه السمات، لذا لا توجد مكررات.");
      return bi(
        `π keeps ${list}; the faded attributes are dropped. ${dupText.en}`,
        `تُبقي π السمات ${list}، وتُحذف السمات الباهتة. ${dupText.ar}`,
      );
    }
    default: {
      const result = bi(
        `Result: ${tuplesEn(r)} × ${p} attribute${p === 1 ? "" : "s"}.`,
        `النتيجة: عدد الصفوف ${r} وعدد السمات ${p}.`,
      );
      if (dups) {
        return bi(
          `${result.en} A relation is a set, so π removed the ${dups === 1 ? "duplicate" : `${dups} duplicates`}: ${k} → ${r} tuples. SQL needs DISTINCT to do the same.`,
          `${result.ar} العلاقة مجموعة (set)، لذا حذفت π المكررات: انخفض عدد الصفوف من ${k} إلى ${r}. وتحتاج SQL إلى DISTINCT لتعطي النتيجة نفسها.`,
        );
      }
      if (identity) return result;
      return bi(`${result.en} There were no duplicates to remove.`, `${result.ar} لم تكن هناك مكررات لحذفها.`);
    }
  }
}

/** Attribute, operator and value controls for one comparison (or "No condition" for the first). */
function TermFields({
  relation,
  index,
  term,
  onChange,
  onClear,
}: {
  relation: Relation;
  index: number;
  term: Term | null;
  onChange: (term: Term) => void;
  /** Offers "No condition" in the attribute list */
  onClear?: () => void;
}) {
  const listId = useId();
  const attr = term ? attributeOf(relation, term.attr) : null;
  const domain = term ? domainOf(relation, term.attr) : [];
  const invalid = term !== null && attr?.type === "number" && (term.text.trim() === "" || !Number.isFinite(Number(term.text)));

  return (
    <div className={ra.term} role="group" aria-label={both(T.comparison(index))}>
      <label className={styles.field}>
        <span>
          <BiText text={T.attribute} inline />
        </span>
        <select
          value={term?.attr ?? ""}
          onChange={(event) => {
            const name = event.target.value;
            if (!name) onClear?.();
            else onChange(makeTerm(relation, name, term?.op));
          }}
        >
          {onClear ? <option value="">{both(T.noCondition)}</option> : null}
          {relation.attributes.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      {term && attr ? (
        <>
          <label className={styles.field}>
            <span>
              <BiText text={T.operator} inline />
            </span>
            <select value={term.op} onChange={(event) => onChange({ ...term, op: event.target.value as Op })}>
              {opsFor(attr.type).map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>
              <BiText text={T.value} inline />
            </span>
            {attr.type === "number" ? (
              <>
                <input
                  className={ra.number}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  list={listId}
                  value={term.text}
                  aria-invalid={invalid || undefined}
                  onChange={(event) => {
                    const text = event.target.value;
                    const value = Number(text);
                    const valid = text.trim() !== "" && Number.isFinite(value);
                    onChange({ ...term, text, value: valid ? value : term.value });
                  }}
                  onBlur={() => onChange({ ...term, text: String(term.value) })}
                />
                <datalist id={listId}>
                  {domain.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </>
            ) : (
              <select value={String(term.value)} onChange={(event) => onChange({ ...term, value: event.target.value, text: event.target.value })}>
                {domain.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            )}
          </label>
        </>
      ) : null}
    </div>
  );
}

/** A reason or duplicate chip: one line when both languages read the same ("DNO = 5 ≠ 4"). */
function Chip({ kind, text }: { kind: "fail" | "dup"; text: Bi }) {
  return (
    <span className={ra.chip} data-kind={kind}>
      {text.en}
      {text.ar !== text.en ? <ArLine>{text.ar}</ArLine> : null}
    </span>
  );
}

export function RelationalAlgebraPlayer({
  relation,
  condition: initialCondition,
  projection: initialProjection,
}: {
  relation: Relation;
  condition: Condition | null;
  projection: string[];
}) {
  const schema = useMemo(() => relation.attributes.map((a) => a.name), [relation]);
  const fallbackSecond = relation.attributes.find((a) => a.type === "number")?.name ?? schema[0];

  const [first, setFirst] = useState<Term | null>(initialCondition ? toTerm(initialCondition.terms[0]) : null);
  const [second, setSecond] = useState<Term>(
    initialCondition?.terms[1] ? toTerm(initialCondition.terms[1]) : makeTerm(relation, fallbackSecond, "≥"),
  );
  const [join, setJoin] = useState<Join>(initialCondition && initialCondition.terms.length > 1 ? initialCondition.connective : "none");
  const [kept, setKept] = useState<string[]>(initialProjection);

  const bodyRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const stepper = useStepper(STEPS, { frameRef: bodyRef, interval: 1600 });
  const step = stepper.index;
  const stage = stageOf(step);

  const condition = useMemo<Condition | null>(() => {
    if (!first) return null;
    const strip = ({ attr, op, value }: Term): Comparison => ({ attr, op, value });
    return {
      terms: join === "none" ? [strip(first)] : [strip(first), strip(second)],
      connective: join === "OR" ? "OR" : "AND",
    };
  }, [first, second, join]);
  const projection = useMemo(() => schema.filter((name) => kept.includes(name)), [schema, kept]);
  const ev = useMemo(() => evaluate(relation, condition, projection), [relation, condition, projection]);
  const identity = projectsAll(relation, projection);
  const status = statusOf(step, relation, condition, ev, identity);

  const rowState = (fate: RowFate) => {
    if (!fate.selected) return step >= 2 ? "gone" : step === 1 ? "fail" : undefined;
    if (fate.duplicateOf !== null) return step >= 4 ? "gone" : step === 3 ? "dup" : undefined;
    return undefined;
  };
  const colState = (name: string) => (projection.includes(name) ? undefined : step >= 4 ? "gone" : step === 3 ? "drop" : undefined);
  // The "why" column opens only while there is something to explain.
  const noteOn =
    (step === 1 && ev.fates.some((fate) => !fate.selected)) || (step === 3 && ev.fates.some((fate) => fate.duplicateOf !== null));

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Arrow keys inside the table scroll it sideways instead of stepping.
    if (tableRef.current?.contains(event.target as Node)) return;
    stepperKeyDown(stepper)(event);
  };

  const condText = condition ? conditionText(condition) : null;
  const piText = identity ? null : projection.join(", ");

  return (
    <div ref={bodyRef} className={styles.body} tabIndex={0} onKeyDown={onKeyDown} aria-label={both(T.widget)}>
      <div className={ra.builder}>
        <fieldset className={ra.group}>
          <legend className={ra.legend}>
            <BiText text={T.sigma} inline />
          </legend>
          <div className={ra.groupBody}>
            <TermFields relation={relation} index={1} term={first} onChange={setFirst} onClear={() => setFirst(null)} />
            {first ? (
              <div className={styles.field}>
                <span>
                  <BiText text={T.second} inline />
                </span>
                <div className={styles.segmented} role="group" aria-label={both(T.second)}>
                  {(["none", "AND", "OR"] as const).map((key) => (
                    <button key={key} type="button" aria-pressed={join === key} onClick={() => setJoin(key)}>
                      {key === "none" ? <BiText text={T.none} inline /> : key}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {first && join !== "none" ? <TermFields relation={relation} index={2} term={second} onChange={setSecond} /> : null}
          </div>
        </fieldset>

        <fieldset className={ra.group}>
          <legend className={ra.legend}>
            <BiText text={T.pi} inline />
          </legend>
          <div className={ra.picks}>
            {relation.attributes.map((a) => {
              const on = kept.includes(a.name);
              return (
                <label key={a.name} className={ra.pick} title={both(a.label)}>
                  <input
                    type="checkbox"
                    checked={on}
                    // π needs at least one attribute.
                    disabled={on && kept.length === 1}
                    onChange={() => setKept(on ? kept.filter((name) => name !== a.name) : [...kept, a.name])}
                    aria-label={`${a.name} · ${both(a.label)}`}
                  />
                  <span>{a.name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className={ra.query}>
        <p className={ra.queryLabel}>
          <BiText text={T.expression} inline />
        </p>
        <p className={ra.expr} dir="ltr">
          {piText ? (
            <>
              <span className={ra.op} data-active={stage === 2 || undefined}>
                π<sub>{piText}</sub>
              </span>
              (
            </>
          ) : null}
          {condText ? (
            <>
              <span className={ra.op} data-active={stage === 1 || undefined}>
                σ<sub>{condText}</sub>
              </span>
              (
            </>
          ) : null}
          <span className={ra.op} data-active={stage === 0 || undefined}>
            {relation.name}
          </span>
          {condText ? ")" : null}
          {piText ? ")" : null}
        </p>
        <p className={ra.queryLabel}>
          <BiText text={T.sql} inline />
        </p>
        <code className={styles.formula}>{toSql(relation, condition, projection)}</code>
      </div>

      <div ref={tableRef} className={ra.tableWrap} role="region" tabIndex={0} aria-label={both(T.table(relation.name))}>
        <table className={ra.table}>
          <thead>
            <tr>
              {relation.attributes.map((a) => (
                <th key={a.name} scope="col" className={ra.cell} data-col={colState(a.name)}>
                  <div className={ra.box}>
                    <div className={ra.inner}>
                      <span className={ra.attrName}>{a.name}</span>
                      <ArLine>{a.label.ar}</ArLine>
                    </div>
                  </div>
                </th>
              ))}
              <th scope="col" className={`${ra.cell} ${ra.note}`} data-note={noteOn ? undefined : "off"}>
                <div className={ra.box}>
                  <div className={ra.inner}>
                    <span className="visually-hidden">{both(T.why)}</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {relation.rows.map((row, i) => {
              const fate = ev.fates[i];
              return (
                <tr key={i} className={ra.row} data-row={rowState(fate)}>
                  {relation.attributes.map((a) => {
                    const value = row[a.name];
                    return (
                      <td key={a.name} className={ra.cell} data-col={colState(a.name)}>
                        <div className={ra.box}>
                          <div className={ra.inner}>{value === null ? <span className={ra.null}>NULL</span> : formatValue(value)}</div>
                        </div>
                      </td>
                    );
                  })}
                  <td className={`${ra.cell} ${ra.note}`} data-note={noteOn ? undefined : "off"}>
                    <div className={ra.box}>
                      <div className={ra.inner}>
                        {!fate.selected && (step === 1 || step === 2)
                          ? fate.reasons.map((reason, j) => <Chip key={j} kind="fail" text={reason} />)
                          : null}
                        {fate.duplicateOf !== null && step >= 3 ? (
                          <Chip kind="dup" text={T.duplicate(formatTuple(projection.map((name) => row[name])))} />
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={ra.counts} dir="ltr">
        <span className={ra.countsLabel}>
          <BiText text={T.tuples} inline />
        </span>
        <span className={ra.count} data-active={stage === 0 || undefined}>
          {relation.name} <b>{relation.rows.length}</b>
        </span>
        <span aria-hidden="true">→</span>
        <span className={ra.count} data-active={stage === 1 || undefined}>
          σ <b>{ev.selectedCount}</b>
        </span>
        <span aria-hidden="true">→</span>
        <span className={ra.count} data-active={stage === 2 || undefined}>
          π <b>{ev.result.length}</b>
        </span>
      </p>

      <StepperControls stepper={stepper} />

      <div className={styles.status} aria-live="polite">
        <span className={ra.stageTag}>{stage === 0 ? relation.name : stage === 1 ? "1 · σ" : "2 · π"}</span>
        <BiText text={status} />
      </div>
      <p className={styles.hint}>
        <BiText text={UI.keys} />
      </p>
    </div>
  );
}
