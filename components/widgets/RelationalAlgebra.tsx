import { EMPLOYEE } from "@/lib/widgets/datasets/company";
import { checkExpect, parseAttributeList, parseCondition, type Relation } from "@/lib/widgets/relational";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { RelationalAlgebraPlayer } from "./players";


const DATASETS: Record<string, Relation> = {
  "company-employee": EMPLOYEE,
};

/**
 * <RelationalAlgebra dataset="company-employee" select="DNO = 5" project="FNAME, LNAME, SALARY"
 *   expect="σ DNO = 4 => FNAME: Alicia, Jennifer, Ahmad; π SEX, SALARY => 7" />
 *
 * Builds π_project(σ_select(R)) and plays it in two stages. `select` is one comparison or two
 * joined by AND / OR ("DNO = 4 AND SALARY >= 25000"; omit it for no condition). `project`
 * lists attributes in the relation's schema order (omit it to keep them all).
 *
 * `expect`, copied from the page, makes the build fail if the engine disagrees with it:
 * clauses separated by ";", each `[σ <condition>] [π <attributes>] => <outcome>`, where the
 * outcome is a tuple count ("=> 7") or the result's values of one attribute, in any order
 * ("=> FNAME: Alicia, Jennifer, Ahmad"). Full grammar: checkExpect in lib/widgets/relational.ts.
 */
export function RelationalAlgebra({
  dataset,
  select,
  project,
  expect,
  title = "Select rows, then project columns",
  titleAr = "اختر الصفوف ثم أسقط الأعمدة",
  caption,
  captionAr,
}: {
  dataset: string;
  select?: string;
  project?: string;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  const where = "<RelationalAlgebra>";
  const relation = DATASETS[dataset];
  if (!relation) throw new Error(`${where}: unknown dataset "${dataset}" (known: ${Object.keys(DATASETS).join(", ")})`);

  const condition = select ? parseCondition(select, relation) : null;
  const schema = relation.attributes.map((a) => a.name);
  const projection = project ? parseAttributeList(project, relation) : schema;
  const inSchemaOrder = schema.filter((name) => projection.includes(name));
  if (inSchemaOrder.join() !== projection.join()) {
    throw new Error(`${where}: list project="${project}" in ${relation.name}'s schema order: ${inSchemaOrder.join(", ")}`);
  }

  if (expect) {
    const failures = checkExpect(relation, expect);
    if (failures.length) throw new Error(`${where} expect does not hold:\n  ${failures.join("\n  ")}`);
  }

  return (
    <WidgetShell
      name="relational-algebra"
      kicker={bi("Relational algebra", "الجبر العلائقي")}
      title={title}
      titleAr={titleAr}
      caption={caption}
      captionAr={captionAr}
    >
      <RelationalAlgebraPlayer relation={relation} condition={condition} projection={projection} />
    </WidgetShell>
  );
}
