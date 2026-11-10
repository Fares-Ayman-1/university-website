"use client";

import { Fragment, useState } from "react";
import { ArLine } from "@/components/mdx/Arabic";
import { closedForm, COST_RANGE, costRows, formatCount, power, ratio, type CostInputs, type CostKey, type CostRow } from "@/lib/widgets/cheat-ai";
import { BiText } from "./BiText";
import { bi, type Bi } from "./types";
import styles from "./widgets.module.css";
import css from "./SearchCostCalc.module.css";

const both = (text: Bi) => `${text.en} · ${text.ar}`;
/** Non-breaking spaces: a formula inside an Arabic line stays on one line, as one left-to-right run. */
const nb = (text: string) => text.replace(/ /g, "\u00a0");

const T = {
  widget: bi("Search cost calculator: edit the inputs and every count is worked out again.", "حاسبة تكلفة البحث: عدّل المدخلات فتُحسب كل الأعداد من جديد."),
  inputs: bi("Inputs", "المدخلات"),
  root: bi("The root (depth 0)", "الجذر، أي العمق 0"),
  rootOut: bi("Not counted", "لا يُحتسب"),
  rootIn: bi("Counted", "يُحتسب"),
  results: bi("Worst-case nodes generated, by strategy", "العقد المولَّدة في أسوأ الحالات لكل استراتيجية"),
  time: bi("Time", "الزمن"),
  space: bi("Space", "المساحة"),
  shortcut: bi("Shortcut: the geometric series", "اختصار: المتسلسلة الهندسية"),
  ratios: bi("IDS against BFS", "IDS مقارنةً بـ BFS"),
  allLevels: bi("every node of levels 0 to d, the root included", "كل عقد المستويات من 0 إلى d، ومعها الجذر"),
  oneLevel: bi("b = 1: one node per level (the formula would divide by 0)", "b = 1: عقدة واحدة في كل مستوى، والصيغة هنا ستقسم على 0"),
  minusRoot: bi("without the root: BFS, goal tested on generation", "دون الجذر نحصل على BFS مع اختبار الهدف عند التوليد"),
  allLevelsRoot: bi("every node of levels 0 to d: BFS, goal tested on generation, root counted", "كل عقد المستويات من 0 إلى d، وهذا هو BFS مع اختبار الهدف عند التوليد واحتساب الجذر"),
  plusLevel: bi("add the children of every depth-d node except the goal: BFS, goal tested on expansion", "أضف أبناء كل عقدة عند العمق d ما عدا الهدف فنحصل على BFS مع اختبار الهدف عند التوسيع"),
  limit: bi("what the first ratio approaches as d grows", "القيمة التي تقترب منها النسبة الأولى كلما كبر d"),
  noRatio: bi("BFS generates no nodes here (d = 0 and the root is not counted), so there is no ratio.", "لا يولّد BFS أي عقدة هنا، لأن d = 0 والجذر لا يُحتسب، لذا لا توجد نسبة."),
  hint: bi(
    "Lecture 3 leaves the root out for b = 10, d = 5 (IDS 123,450) and counts it in its b = 2, d = 3 practice (IDS 26). m, l, C* and ε are optional: leave one empty to skip its row.",
    `تستبعد المحاضرة 3 الجذر في مثال ${nb("b = 10")} و ${nb("d = 5")}، حيث ${nb("IDS = 123,450")}، وتحتسبه في تمرين ${nb("b = 2")} و ${nb("d = 3")}، حيث ${nb("IDS = 26")}. والمدخلات m و l و C* و ε اختيارية: اترك أيًّا منها فارغًا لتخطي صفه.`,
  ),
};

type Field = "b" | "d" | "m" | "l" | "cstar" | "eps";

const FIELDS: { key: Field; sym: string; label: Bi; optional: boolean; integer: boolean; min: number; max?: number }[] = [
  { key: "b", sym: "b", label: bi("branching factor", "معامل التفرّع"), optional: false, integer: true, ...COST_RANGE.b },
  { key: "d", sym: "d", label: bi("goal depth", "عمق الهدف"), optional: false, integer: true, ...COST_RANGE.d },
  { key: "m", sym: "m", label: bi("maximum depth", "أقصى عمق"), optional: true, integer: true, ...COST_RANGE.m },
  { key: "l", sym: "l", label: bi("depth limit", "حد العمق"), optional: true, integer: true, ...COST_RANGE.l },
  { key: "cstar", sym: "C*", label: bi("optimal cost", "تكلفة الحل الأمثل"), optional: true, integer: false, min: 0 },
  { key: "eps", sym: "ε", label: bi("least step cost", "أصغر تكلفة خطوة"), optional: true, integer: false, min: 0 },
];

const SYMBOL: Record<CostRow["missing"][number], string> = { m: "m", l: "l", cstar: "C*", eps: "ε" };

const NAMES: Record<CostKey, { name: Bi; test?: Bi }> = {
  "bfs-gen": { name: bi("Breadth-first (BFS)", "البحث بالعرض أولًا (BFS)"), test: bi("goal tested on generation", "اختبار الهدف عند التوليد") },
  "bfs-exp": { name: bi("Breadth-first (BFS)", "البحث بالعرض أولًا (BFS)"), test: bi("goal tested on expansion", "اختبار الهدف عند التوسيع") },
  ids: { name: bi("Iterative deepening (IDS)", "البحث بالتعميق التكراري (IDS)") },
  dfs: { name: bi("Depth-first (DFS), maximum depth m", "البحث بالعمق أولًا (DFS)، بأقصى عمق m") },
  dls: { name: bi("Depth-limited (DLS), limit l", "البحث محدود العمق (DLS)، بالحد l") },
  ucs: { name: bi("Uniform-cost (UCS)", "البحث بالتكلفة الموحدة (UCS)") },
  bidi: { name: bi("Bidirectional", "البحث ثنائي الاتجاه (bidirectional)") },
};

/** "b^(d+1)", "10^6", "b^⌈d/2⌉": the power typeset as a superscript. */
const POWER = /\^(\([^()]*\)|⌈[^⌉]*⌉|⌊[^⌋]*⌋|[0-9A-Za-z]+)/g;

function Typeset({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(POWER)) {
    out.push(text.slice(last, match.index));
    const exponent = match[1].startsWith("(") ? match[1].slice(1, -1) : match[1];
    out.push(
      <sup key={match.index} className={css.sup}>
        {exponent}
      </sup>,
    );
    last = match.index + match[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

const fmt = formatCount;
const equals = (total: string) => (total.startsWith("≈") ? total : `= ${total}`);

/** A long series keeps its first three and last two terms. */
function series(parts: string[], lead = ""): string[] {
  const shown = parts.length > 8 ? [...parts.slice(0, 3), "…", ...parts.slice(-2)] : parts;
  return shown.map((part, i) => (i === 0 ? `${lead}${part}` : `+ ${part}`));
}

/** The working of a row as lines of tokens; a line breaks only between tokens. */
function workLines(row: CostRow): string[][] {
  if (row.total === null) return row.log10 !== undefined && row.ucs ? [[`${row.terms[0]?.product ?? `b^${row.ucs.exponent}`}`]] : [];
  const total = fmt(row.total);
  const values = row.terms.map((t) => fmt(t.value));
  if (row.terms.length === 0) return [[total]];
  if (row.terms.some((t) => t.product)) {
    const built = series(row.terms.map((t) => t.product ?? fmt(t.value)));
    return row.terms.length === 1 ? [[...built, equals(total)]] : [built, [...series(values, "= "), equals(total)]];
  }
  return row.terms.length === 1 ? [[total]] : [[...series(values), equals(total)]];
}

const decimals = (x: number) => String(Math.round(x * 1000) / 1000);

/** What a row's count means for these inputs, and when to be careful. */
function noteFor(row: CostRow, input: CostInputs): { text: Bi; warn?: boolean } | null {
  const { b, d } = input;
  switch (row.key) {
    case "bfs-gen":
      return {
        text: bi(
          "Each level down to depth d is generated once, and the search stops as soon as the goal is generated.",
          "يُولَّد كل مستوى حتى العمق d مرة واحدة، ويتوقف البحث بمجرد توليد الهدف.",
        ),
      };
    case "bfs-exp": {
      const extra = fmt(BigInt(b) * (power(b, d) - 1n));
      return {
        text: bi(
          `Every node at depth d except the goal is expanded too, so its children at depth d + 1 are generated: ${extra} more nodes.`,
          `وتُوسَّع أيضًا كل عقدة عند العمق d ما عدا الهدف، فيُولَّد أبناؤها عند العمق ${nb("d + 1")}، أي ${extra} عقدة إضافية.`,
        ),
      };
    }
    case "ids":
      return {
        text: bi(
          "Level k is generated d + 1 − k times, once by every iteration whose limit reaches it: the deepest level once, level 1 d times.",
          `يُولَّد المستوى k عددًا من المرات قدره ${nb("d + 1 − k")}، مرةً في كل تكرار يبلغ حدُّه ذلك المستوى: المستوى الأعمق مرة واحدة، والمستوى 1 عدد d من المرات.`,
        ),
      };
    case "dfs":
      if (input.m === null || input.m === undefined) return null;
      return input.m < d
        ? {
            warn: true,
            text: bi("m is smaller than d: the goal would lie deeper than the deepest node. Check the inputs.", "قيمة m أصغر من d: أي أن الهدف سيكون أعمق من أعمق عقدة. راجع المدخلات."),
          }
        : {
            text: bi(
              "Worst case: DFS generates the whole tree down to depth m before it reaches the goal. It keeps only one path and its siblings in memory: O(bm).",
              "في أسوأ الحالات يولّد DFS الشجرة كلها حتى العمق m قبل أن يصل إلى الهدف، لكنه لا يحتفظ في الذاكرة إلا بمسار واحد مع العقد الشقيقة على امتداده، أي O(bm).",
            ),
          };
    case "dls":
      if (input.l === null || input.l === undefined) return null;
      return input.l < d
        ? {
            warn: true,
            text: bi(
              "l < d: the goal lies below the limit, so DLS generates all of this and returns cutoff without finding it.",
              "l < d: الهدف أعمق من الحد، لذا يولّد DLS كل هذه العقد ثم يُرجع cutoff دون أن يجده.",
            ),
          }
        : {
            text: bi(
              "l ≥ d, so DLS finds the goal, but in the worst case it first generates the whole tree down to depth l.",
              "l ≥ d، لذا يجد DLS الهدف، لكنه في أسوأ الحالات يولّد أولًا الشجرة كلها حتى العمق l.",
            ),
          };
    case "ucs": {
      const u = row.ucs;
      if (!u) {
        return input.eps !== null && input.eps !== undefined && !(input.eps > 0)
          ? { warn: true, text: bi("ε must be more than 0: with zero-cost steps UCS may never stop.", "يجب أن تكون ε أكبر من 0: فمع خطوات تكلفتها صفر قد لا يتوقف UCS أبدًا.") }
          : null;
      }
      const q = nb(`C*/ε = ${input.cstar}/${input.eps} = ${decimals(u.quotient)}`);
      const exp = nb(`1 + ⌊C*/ε⌋ = 1 + ${u.floor} = ${u.exponent}`);
      const slides = nb(u.slides === null ? `b^${u.ceil}` : `${b}^${u.ceil} = ${fmt(u.slides)}`);
      const whole =
        u.floor === u.ceil
          ? bi(" C*/ε is a whole number here, so the two exponents differ by 1.", " و C*/ε عدد صحيح هنا، لذا يختلف الأُسّان بمقدار 1.")
          : bi("", "");
      if (row.log10 !== undefined) {
        const digits = Math.floor(row.log10) + 1;
        return {
          warn: true,
          text: bi(`${q}, so ${exp}: about ${digits} digits, too many to write out.`, `${q}، إذن ${exp}، أي نحو ${digits} رقمًا، وهذا أكثر من أن يُكتب.`),
        };
      }
      return {
        text: bi(
          `${q}, so ${exp}. The slides write O(b^⌈C*/ε⌉) instead: ${slides}.${whole.en}`,
          `${q}، إذن ${exp}. أما الشرائح فتكتب O(b^⌈C*/ε⌉) بدلًا منه، وقيمته ${slides}.${whole.ar}`,
        ),
      };
    }
    case "bidi":
      return d % 2 === 0
        ? {
            text: bi(
              "Two searches, forward from the start and backward from the goal, each go d/2 deep and meet in the middle.",
              "بحثان، أمامي من البداية وخلفي من الهدف، يتعمق كلٌّ منهما d/2 ويلتقيان في المنتصف.",
            ),
          }
        : {
            text: bi(
              "d is odd: one search goes ⌈d/2⌉ deep and the other ⌊d/2⌋, and they meet in the middle.",
              "d عدد فردي: يتعمق أحد البحثين ⌈d/2⌉ والآخر ⌊d/2⌋، ويلتقيان في المنتصف.",
            ),
          };
  }
}

function needText(missing: CostRow["missing"]): Bi {
  const syms = missing.map((k) => SYMBOL[k]);
  return bi(`Enter ${syms.join(" and ")} above to fill in this row.`, `أدخل ${syms.join(" و ")} في الأعلى لملء هذا الصف.`);
}

function Tokens({ tokens }: { tokens: string[] }) {
  return (
    <span className={css.line}>
      {tokens.map((token, i) => (
        <Fragment key={i}>
          {i ? " " : null}
          <span className={css.token}>
            <Typeset text={token} />
          </span>
        </Fragment>
      ))}
    </span>
  );
}

function CostCard({ row, input }: { row: CostRow; input: CostInputs }) {
  const meta = NAMES[row.key];
  const note = noteFor(row, input);
  const waiting = row.missing.length > 0;
  const lines = workLines(row);
  const total = row.total !== null ? fmt(row.total) : row.log10 !== undefined ? `≈ 10^${Math.floor(row.log10)}` : "—";
  return (
    <li className={css.row} data-waiting={waiting || undefined}>
      <div className={css.rowHead}>
        <p className={css.name}>
          {meta.name.en}
          {meta.test ? <span className={css.test}> · {meta.test.en}</span> : null}
          <ArLine>{meta.test ? `${meta.name.ar}، ${meta.test.ar}` : meta.name.ar}</ArLine>
        </p>
        <p className={css.total} dir="ltr">
          <Typeset text={total} />
        </p>
      </div>
      <p className={css.formula} dir="ltr">
        <Typeset text={row.formula} />
      </p>
      {waiting ? (
        <p className={css.need}>
          <BiText text={needText(row.missing)} />
        </p>
      ) : lines.length ? (
        <div className={css.work} dir="ltr">
          {lines.map((tokens, i) => (
            <Tokens key={i} tokens={tokens} />
          ))}
        </div>
      ) : null}
      <p className={css.bounds}>
        <span className={css.chip}>
          <BiText text={T.time} inline />{" "}
          <code dir="ltr">
            <Typeset text={row.time} />
          </code>
        </span>
        <span className={css.chip}>
          <BiText text={T.space} inline />{" "}
          <code dir="ltr">
            <Typeset text={row.space} />
            {row.spaceValue ? ` = ${row.spaceValue.product} = ${fmt(row.spaceValue.value)}` : null}
          </code>
        </span>
      </p>
      {note && !waiting ? (
        <p className={css.note} data-tone={note.warn ? "warn" : undefined}>
          <BiText text={note.text} />
        </p>
      ) : null}
    </li>
  );
}

/** One line of a side card: the calculation, then what it is. */
function Step({ code, text }: { code: string; text?: Bi }) {
  return (
    <div className={css.step}>
      <p className={css.stepCode} dir="ltr">
        <Tokens tokens={code.split(" ⏐ ")} />
      </p>
      {text ? (
        <p className={css.stepText}>
          <BiText text={text} />
        </p>
      ) : null}
    </div>
  );
}

function Shortcut({ input, rows }: { input: CostInputs; rows: CostRow[] }) {
  const { b, d } = input;
  const root = input.root ?? false;
  const cf = closedForm(b, d);
  const gen = rows.find((r) => r.key === "bfs-gen")!.total!;
  const exp = rows.find((r) => r.key === "bfs-exp")!.total!;
  const top = power(b, d + 1);
  return (
    <section className={css.side} aria-label={both(T.shortcut)}>
      <p className={css.sideTitle}>
        <BiText text={T.shortcut} />
      </p>
      <p className={css.sideFormula} dir="ltr">
        <Typeset text="1 + b + … + b^d = (b^(d+1) − 1) / (b − 1)" />
      </p>
      {cf.denominator === null ? (
        <Step code={`1 + 1 + … + 1 ⏐ = d + 1 ⏐ = ${fmt(cf.all)}`} text={T.oneLevel} />
      ) : (
        <Step
          code={`(${b}^${d + 1} − 1) / ${fmt(cf.denominator)} ⏐ = ${fmt(cf.numerator)} / ${fmt(cf.denominator)} ⏐ ${equals(fmt(cf.all))}`}
          text={root ? T.allLevelsRoot : T.allLevels}
        />
      )}
      {root ? null : <Step code={`${fmt(cf.all)} − 1 ⏐ ${equals(fmt(gen))}`} text={T.minusRoot} />}
      <Step code={`${fmt(gen)} + ${fmt(top)} − ${b} ⏐ ${equals(fmt(exp))}`} text={T.plusLevel} />
    </section>
  );
}

function Ratios({ input, rows }: { input: CostInputs; rows: CostRow[] }) {
  const { b } = input;
  const ids = rows.find((r) => r.key === "ids")!.total!;
  const gen = rows.find((r) => r.key === "bfs-gen")!.total!;
  const exp = rows.find((r) => r.key === "bfs-exp")!.total!;
  const onGen = ratio(ids, gen);
  const onExp = ratio(ids, exp);
  const percent = (r: number) => (Math.abs(r - 1) * 100).toFixed(1);
  const describe = (r: number, which: Bi): Bi =>
    r >= 1
      ? bi(`IDS ÷ BFS ${which.en}: IDS generates ${percent(r)}% more nodes`, `IDS ÷ BFS ${which.ar}: يولّد IDS عقدًا أكثر بنسبة ${percent(r)}%`)
      : bi(`IDS ÷ BFS ${which.en}: IDS generates ${percent(r)}% fewer nodes`, `IDS ÷ BFS ${which.ar}: يولّد IDS عقدًا أقل بنسبة ${percent(r)}%`);
  return (
    <section className={css.side} aria-label={both(T.ratios)}>
      <p className={css.sideTitle}>
        <BiText text={T.ratios} />
      </p>
      {onGen === null || onExp === null ? (
        <p className={css.stepText}>
          <BiText text={T.noRatio} />
        </p>
      ) : (
        <>
          <Step code={`${fmt(ids)} ÷ ${fmt(gen)} ⏐ ≈ ${onGen.toFixed(3)}`} text={describe(onGen, bi("on generation", "عند التوليد"))} />
          <Step code={`${fmt(ids)} ÷ ${fmt(exp)} ⏐ ≈ ${onExp.toFixed(3)}`} text={describe(onExp, bi("on expansion", "عند التوسيع"))} />
          {b > 1 ? <Step code={`b / (b − 1) ⏐ = ${b} / ${b - 1} ⏐ ≈ ${(b / (b - 1)).toFixed(3)}`} text={T.limit} /> : null}
        </>
      )}
    </section>
  );
}

/** Reads a field: a number in range, blank (null), or invalid. */
function readField(field: (typeof FIELDS)[number], text: string): { value: number | null; invalid: boolean } {
  const t = text.trim();
  if (!t) return { value: null, invalid: !field.optional };
  const n = Number(t);
  const ok =
    Number.isFinite(n) &&
    (!field.integer || Number.isInteger(n)) &&
    (field.key === "eps" ? n > 0 : n >= field.min) &&
    (field.max === undefined || n <= field.max);
  return ok ? { value: n, invalid: false } : { value: null, invalid: true };
}

export function SearchCostCalcPlayer({
  b,
  d,
  m,
  l,
  cstar,
  eps,
  root: initialRoot,
}: {
  b: number;
  d: number;
  m: number | null;
  l: number | null;
  cstar: number | null;
  eps: number | null;
  root: boolean;
}) {
  const show = (v: number | null) => (v === null ? "" : String(v));
  const [text, setText] = useState<Record<Field, string>>({ b: String(b), d: String(d), m: show(m), l: show(l), cstar: show(cstar), eps: show(eps) });
  // b and d always have a value: while their box is invalid, the last valid one is used.
  const [last, setLast] = useState({ b, d });
  const [root, setRoot] = useState(initialRoot);

  const read = Object.fromEntries(FIELDS.map((f) => [f.key, readField(f, text[f.key])])) as Record<Field, ReturnType<typeof readField>>;
  const input: CostInputs = {
    b: read.b.value ?? last.b,
    d: read.d.value ?? last.d,
    m: read.m.value,
    l: read.l.value,
    cstar: read.cstar.value,
    eps: read.eps.value,
    root,
  };
  const rows = costRows(input);

  const onChange = (field: (typeof FIELDS)[number], value: string) => {
    setText((t) => ({ ...t, [field.key]: value }));
    const r = readField(field, value);
    if ((field.key === "b" || field.key === "d") && r.value !== null) setLast((s) => ({ ...s, [field.key]: r.value }));
  };

  return (
    <div className={styles.body} role="group" aria-label={both(T.widget)}>
      <fieldset className={css.inputs}>
        <legend className="visually-hidden">{both(T.inputs)}</legend>
        {FIELDS.map((field) => {
          const state = read[field.key];
          return (
            <label key={field.key} className={`${styles.field} ${css.inputField}`}>
              <span className={css.inputLabel}>
                <span className={css.sym}>{field.sym}</span> {field.label.en}
                <ArLine>{field.label.ar}</ArLine>
              </span>
              <input
                className={css.number}
                type="number"
                inputMode={field.integer ? "numeric" : "decimal"}
                step={field.integer ? 1 : "any"}
                min={field.key === "eps" ? undefined : field.min}
                max={field.max}
                value={text[field.key]}
                placeholder={field.optional ? "—" : undefined}
                aria-invalid={state.invalid || undefined}
                aria-label={`${field.sym}: ${both(field.label)}`}
                onChange={(event) => onChange(field, event.target.value)}
                onBlur={() => {
                  if (state.invalid && !field.optional) setText((t) => ({ ...t, [field.key]: String(last[field.key as "b" | "d"]) }));
                }}
              />
            </label>
          );
        })}
        <div className={`${styles.field} ${css.rootField}`}>
          <span className={css.inputLabel}>
            <BiText text={T.root} />
          </span>
          <div className={styles.segmented} role="group" aria-label={both(T.root)}>
            {([false, true] as const).map((value) => (
              <button key={String(value)} type="button" aria-pressed={root === value} onClick={() => setRoot(value)}>
                <BiText text={value ? T.rootIn : T.rootOut} inline />
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      <ol className={css.rows} aria-label={both(T.results)}>
        {rows.map((row) => (
          <CostCard key={row.key} row={row} input={input} />
        ))}
      </ol>

      <div className={css.sides}>
        <Shortcut input={input} rows={rows} />
        <Ratios input={input} rows={rows} />
      </div>

      <p className={styles.hint}>
        <BiText text={T.hint} />
      </p>
    </div>
  );
}
