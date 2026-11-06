/**
 * Relational algebra on one relation, as in databases lecture 4: SELECT (σ) with one or two
 * comparisons joined by AND / OR, then PROJECT (π) with duplicate elimination. Comparisons
 * with NULL are unknown (three-valued logic) and σ keeps only tuples whose condition is true.
 * Pure and client-safe; the server wrapper also runs it at build time to check `expect`.
 * No runtime imports, so `node --experimental-strip-types` can test it directly.
 */
import type { Bi } from "../../components/widgets/types";

export type Scalar = string | number;
export type Value = Scalar | null;
export type AttributeType = "string" | "number";
export type Attribute = { name: string; type: AttributeType; label: Bi };
export type Tuple = Record<string, Value>;
export type Relation = { name: string; attributes: Attribute[]; rows: Tuple[] };

export type Op = "=" | "≠" | "<" | "≤" | ">" | "≥";
export type Connective = "AND" | "OR";
export type Comparison = { attr: string; op: Op; value: Scalar };
/** One comparison, or two joined by `connective` (ignored with a single term). */
export type Condition = { terms: Comparison[]; connective: Connective };

export const NUMBER_OPS: Op[] = ["=", "≠", "<", "≤", ">", "≥"];
/** Text attributes (names, SSNs, SEX) are compared for equality only. */
export const TEXT_OPS: Op[] = ["=", "≠"];
export const opsFor = (type: AttributeType) => (type === "number" ? NUMBER_OPS : TEXT_OPS);

const NEGATION: Record<Op, Op> = { "=": "≠", "≠": "=", "<": "≥", "≤": ">", ">": "≤", "≥": "<" };
const SQL_OP: Record<Op, string> = { "=": "=", "≠": "<>", "<": "<", "≤": "<=", ">": ">", "≥": ">=" };
const OP_ALIASES: Record<string, Op> = {
  "=": "=",
  "==": "=",
  "≠": "≠",
  "!=": "≠",
  "<>": "≠",
  "<": "<",
  "≤": "≤",
  "<=": "≤",
  ">": ">",
  "≥": "≥",
  ">=": "≥",
};

// ---------------------------------------------------------------- schema helpers

export function attributeOf(relation: Relation, name: string): Attribute {
  const found = relation.attributes.find((a) => a.name.toUpperCase() === name.toUpperCase());
  if (!found) {
    throw new Error(`${relation.name} has no attribute "${name}" (it has ${relation.attributes.map((a) => a.name).join(", ")})`);
  }
  return found;
}

/** The distinct non-NULL values of an attribute, sorted (numbers ascending, text A→Z). */
export function domainOf(relation: Relation, name: string): Scalar[] {
  const attr = attributeOf(relation, name);
  const values = [...new Set(relation.rows.map((row) => row[attr.name]).filter((v): v is Scalar => v !== null))];
  return attr.type === "number"
    ? (values as number[]).sort((a, b) => a - b)
    : (values as string[]).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** The value a new comparison on this attribute starts with: the first row's (non-NULL) value. */
export function firstValueOf(relation: Relation, name: string): Scalar {
  const attr = attributeOf(relation, name);
  const found = relation.rows.map((row) => row[attr.name]).find((v): v is Scalar => v !== null);
  if (found === undefined) throw new Error(`${attr.name} has no non-NULL value`);
  return found;
}

// ---------------------------------------------------------------- formatting

export const formatValue = (value: Value) => (value === null ? "NULL" : String(value));
/** A constant as written in a condition: text quoted ('F'), numbers bare. */
export const literal = (value: Scalar) => (typeof value === "string" ? `'${value}'` : String(value));
export const formatTuple = (values: Value[]) => `(${values.map(formatValue).join(", ")})`;

const comparisonText = (c: Comparison) => `${c.attr} ${c.op} ${literal(c.value)}`;

/** "DNO = 4 AND SALARY ≥ 25000", the subscript of σ. */
export const conditionText = (condition: Condition) =>
  condition.terms.map(comparisonText).join(` ${condition.connective} `);

/** True when the projection keeps every attribute (π is then the identity and is not written). */
export const projectsAll = (relation: Relation, projection: string[]) =>
  relation.attributes.every((a) => projection.includes(a.name));

/** The equivalent SQL. π needs DISTINCT because SQL tables are multisets; keeping every attribute is SELECT *. */
export function toSql(relation: Relation, condition: Condition | null, projection: string[]): string {
  const columns = projectsAll(relation, projection) ? "*" : `DISTINCT ${projection.join(", ")}`;
  const where = condition
    ? ` WHERE ${condition.terms.map((c) => `${c.attr} ${SQL_OP[c.op]} ${literal(c.value)}`).join(` ${condition.connective} `)}`
    : "";
  return `SELECT ${columns} FROM ${relation.name}${where};`;
}

// ---------------------------------------------------------------- parsing (props and expect)

const COMPARISON = /^\s*([A-Za-z_]\w*)\s*(<>|!=|==|<=|>=|=|<|>|≠|≤|≥)\s*('([^']*)'|"([^"]*)"|[^\s'"]+)\s*/;
const CONNECTIVE = /^(AND|OR)\s+/i;

function toComparison(relation: Relation, name: string, opToken: string, raw: string, source: string): Comparison {
  const attr = attributeOf(relation, name);
  const op = OP_ALIASES[opToken];
  if (attr.type === "number") {
    const value = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(value)) throw new Error(`"${source}": ${attr.name} is a number, got ${raw}`);
    return { attr: attr.name, op, value };
  }
  if (!TEXT_OPS.includes(op)) throw new Error(`"${source}": compare the text attribute ${attr.name} with = or ≠`);
  const domain = domainOf(relation, attr.name);
  if (!domain.includes(raw)) {
    throw new Error(`"${source}": '${raw}' is not a value of ${attr.name} (${domain.join(", ")})`);
  }
  return { attr: attr.name, op, value: raw };
}

/**
 * "DNO = 4", "SEX = 'F'", "DNO = 4 AND SALARY >= 25000": one or two comparisons. Operators
 * = ≠ != <> < ≤ <= > ≥ >=; text constants quoted or bare (and in the attribute's domain).
 */
export function parseCondition(source: string, relation: Relation): Condition {
  let rest = source.trim();
  const terms: Comparison[] = [];
  let connective: Connective = "AND";
  for (;;) {
    const match = COMPARISON.exec(rest);
    if (!match) throw new Error(`Cannot read the condition "${source}" at "${rest}"`);
    const raw = match[4] ?? match[5] ?? match[3];
    terms.push(toComparison(relation, match[1], match[2], raw, source));
    rest = rest.slice(match[0].length);
    if (!rest) break;
    const join = CONNECTIVE.exec(rest);
    if (!join || terms.length === 2) throw new Error(`"${source}": use at most two comparisons joined by AND or OR`);
    connective = join[1].toUpperCase() as Connective;
    rest = rest.slice(join[0].length);
  }
  return { terms, connective };
}

/** "SEX, SALARY" → ["SEX", "SALARY"], in the order given (names checked, no repeats). */
export function parseAttributeList(source: string, relation: Relation): string[] {
  const names = source
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((name) => attributeOf(relation, name).name);
  if (names.length === 0) throw new Error(`π needs at least one attribute: "${source}"`);
  if (new Set(names).size !== names.length) throw new Error(`An attribute is listed twice: "${source}"`);
  return names;
}

// ---------------------------------------------------------------- evaluation

/** true / false, or null for unknown (a comparison with NULL). */
type Truth = boolean | null;

function compare(left: Scalar, op: Op, right: Scalar): boolean {
  switch (op) {
    case "=":
      return left === right;
    case "≠":
      return left !== right;
    case "<":
      return left < right;
    case "≤":
      return left <= right;
    case ">":
      return left > right;
    case "≥":
      return left >= right;
  }
}

function test(row: Tuple, c: Comparison): Truth {
  const value = row[c.attr];
  return value === null ? null : compare(value, c.op, c.value);
}

/** Why a comparison is not true for this row: "DNO = 5 ≠ 4", or NULL → unknown. */
function reasonFor(row: Tuple, c: Comparison): Bi {
  const value = row[c.attr];
  if (value === null) {
    return { en: `${c.attr} is NULL: unknown`, ar: `${c.attr} فارغة (NULL): غير معروفة` };
  }
  const text = c.op === "≠" ? `${c.attr} = ${literal(value)}` : `${c.attr} = ${literal(value)} ${NEGATION[c.op]} ${literal(c.value)}`;
  return { en: text, ar: text };
}

export type RowFate = {
  /** σ's condition is true for this row (always, without a condition) */
  selected: boolean;
  /** The condition was unknown (a comparison with NULL decided it), not false */
  unknown: boolean;
  /** For a rejected row: the comparisons that were not true, and why */
  reasons: Bi[];
  /** For a selected row whose projected tuple already appeared: that earlier row's index */
  duplicateOf: number | null;
};

export type Evaluation = {
  /** One per row of the relation, in order */
  fates: RowFate[];
  /** Tuples in σ's result */
  selectedCount: number;
  /** Selected rows that π removes as duplicates */
  duplicateCount: number;
  projection: string[];
  /** π(σ(R)): the distinct projected tuples, in order of first appearance */
  result: Value[][];
};

/** π_projection(σ_condition(relation)); with a null condition σ keeps every tuple. */
export function evaluate(relation: Relation, condition: Condition | null, projection: string[]): Evaluation {
  const seen = new Map<string, number>();
  const result: Value[][] = [];
  let selectedCount = 0;
  let duplicateCount = 0;
  const fates = relation.rows.map((row, index): RowFate => {
    let truth: Truth = true;
    const reasons: Bi[] = [];
    if (condition) {
      const truths = condition.terms.map((c) => test(row, c));
      // Three-valued logic: AND is false if any part is false, OR is true if any part is true.
      if (condition.connective === "AND" || truths.length === 1) {
        truth = truths.includes(false) ? false : truths.includes(null) ? null : true;
      } else {
        truth = truths.includes(true) ? true : truths.includes(null) ? null : false;
      }
      if (truth !== true) condition.terms.forEach((c, i) => truths[i] !== true && reasons.push(reasonFor(row, c)));
    }
    if (truth !== true) return { selected: false, unknown: truth === null, reasons, duplicateOf: null };
    selectedCount++;
    const tuple = projection.map((name) => row[name]);
    const key = JSON.stringify(tuple);
    const first = seen.get(key);
    if (first !== undefined) {
      duplicateCount++;
      return { selected: true, unknown: false, reasons, duplicateOf: first };
    }
    seen.set(key, index);
    result.push(tuple);
    return { selected: true, unknown: false, reasons, duplicateOf: null };
  });
  return { fates, selectedCount, duplicateCount, projection, result };
}

// ---------------------------------------------------------------- expect (build-time check)

/**
 * `expect` format: clauses separated by ";", each `<query> => <outcome>`.
 *
 *   query:   [σ <condition>] [π <attribute, …>]   (either order; σ is applied first, then π;
 *            with neither, the whole relation). The condition uses the `select` syntax.
 *   outcome: <n>                     the result has exactly n tuples
 *            <ATTR>: <v1>, <v2>, …   the result's values of ATTR, compared as a sorted list
 *                                    (so the tuple count is checked too)
 *
 *   expect="σ DNO = 4 => FNAME: Alicia, Jennifer, Ahmad; π SEX, SALARY => 7"
 *
 * Returns one message per clause that does not hold; throws on a clause it cannot read.
 */
export function checkExpect(relation: Relation, source: string): string[] {
  const failures: string[] = [];
  for (const clause of source.split(";").map((s) => s.trim()).filter(Boolean)) {
    const split = /^(.*)(?:=>|→)(.*)$/s.exec(clause);
    if (!split) throw new Error(`expect clause "${clause}" needs "=>" between the query and the outcome`);
    const { condition, projection } = parseQuery(split[1], relation);
    const attrs = projection ?? relation.attributes.map((a) => a.name);
    const { result } = evaluate(relation, condition, attrs);
    const outcome = split[2].trim();

    if (/^\d+$/.test(outcome)) {
      if (result.length !== Number(outcome)) failures.push(`"${clause}": the result has ${result.length} tuples`);
      continue;
    }
    const listed = /^([A-Za-z_]\w*)\s*:(.*)$/s.exec(outcome);
    if (!listed) throw new Error(`expect clause "${clause}": the outcome must be a tuple count or "ATTR: v1, v2, …"`);
    const attr = attributeOf(relation, listed[1]).name;
    const column = attrs.indexOf(attr);
    if (column < 0) throw new Error(`expect clause "${clause}": ${attr} is not in the projection`);
    const sorted = (values: string[]) => [...values].sort();
    const expected = sorted(listed[2].split(",").map((v) => v.trim().replace(/^'(.*)'$|^"(.*)"$/, "$1$2")).filter(Boolean));
    const actual = sorted(result.map((tuple) => formatValue(tuple[column])));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      failures.push(`"${clause}": the result's ${attr} values are ${actual.join(", ") || "(none)"}`);
    }
  }
  return failures;
}

/** "σ DNO = 4 π SEX, SALARY" (or π first) → its condition and projection; either may be absent. */
export function parseQuery(source: string, relation: Relation): { condition: Condition | null; projection: string[] | null } {
  const parts = source.split(/([σπ])/);
  if (parts[0].trim()) throw new Error(`"${source}": start the query with σ or π`);
  let condition: Condition | null = null;
  let projection: string[] | null = null;
  for (let i = 1; i < parts.length; i += 2) {
    const body = parts[i + 1] ?? "";
    if (parts[i] === "σ") {
      if (condition) throw new Error(`"${source}": only one σ`);
      condition = parseCondition(body, relation);
    } else {
      if (projection) throw new Error(`"${source}": only one π`);
      projection = parseAttributeList(body, relation);
    }
  }
  return { condition, projection };
}
