import { checkTableExpect, cityId, fringeTable, ROMANIA_CITIES, TABLE_MODES, type TableMode } from "@/lib/widgets/cheat-ai";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { AStarTablePlayer } from "./players";

const where = "<AStarTable>";

// Lecture 4's worked examples, and a route to Bucharest from every city in both modes
// (the start select offers them all).
const LECTURE_FACTS =
  "Arad => astar=418; greedy=450; astar-order=Arad,Sibiu,Rimnicu Vilcea,Fagaras,Pitesti,Bucharest; astar-removed=6; greedy-order=Arad,Sibiu,Fagaras,Bucharest";
const selfTest = checkTableExpect(LECTURE_FACTS);
const pitesti = fringeTable("Arad", "astar").steps.find((s) => s.removed.city === "Pitesti")?.removed.f;
if (pitesti !== 417) selfTest.push(`A* removes Pitesti with f = ${pitesti}, not 417`);
for (const city of ROMANIA_CITIES) for (const mode of TABLE_MODES) if (!fringeTable(city, mode).path) selfTest.push(`${mode} from ${city} never reaches Bucharest`);
if (selfTest.length) throw new Error(`${where}: the search disagrees with Lecture 4:\n  ${selfTest.join("\n  ")}`);

/**
 * <AStarTable start="Arad" mode="astar" expect="Arad => astar=418; greedy=450" />
 *
 * Greedy best-first search (f = h) or A* (f = g + h) from `start` to Bucharest on the Romania
 * map, one removal per step: the fringe as a table of n, g, h and f (lowest f first, the removed
 * row highlighted, new entries marked), what the step does, and at the goal the path, its cost
 * and the nodes removed, expanded and generated. Lecture 4's search: tree search with h_SLD,
 * children alphabetically, goal tested on removal, ties first in, first out. The start city and
 * the mode can be changed in the widget.
 *
 * `expect`, copied from the page, makes the build fail if the search disagrees: clauses
 * separated by "|", each `<start city> => outcome; …` with outcomes astar=<km>, greedy=<km>,
 * and <mode>-removed / -expanded / -generated (counts) or -order / -path (comma-separated
 * cities). Full grammar: checkTableExpect in lib/widgets/cheat-ai.ts.
 */
export function AStarTable({
  start = "Arad",
  mode = "astar",
  expect,
  title = "A* and greedy search on Romania, one removal at a time",
  titleAr = "البحث A* والبحث الجشع على خريطة رومانيا، إزالةً بعد إزالة",
  caption,
  captionAr,
}: {
  start?: string;
  mode?: TableMode;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  const city = cityId(start);
  if (!city) throw new Error(`${where}: unknown start city "${start}" (known: ${ROMANIA_CITIES.join(", ")})`);
  if (!TABLE_MODES.includes(mode)) throw new Error(`${where}: mode="${mode}" must be ${TABLE_MODES.join(" or ")}`);

  if (expect) {
    const failures = checkTableExpect(expect);
    if (failures.length) throw new Error(`${where} expect does not hold:\n  ${failures.join("\n  ")}`);
  }

  return (
    <WidgetShell
      name="astar-table"
      kicker={bi("Calculator", "حاسبة")}
      title={title}
      titleAr={titleAr}
      caption={caption}
      captionAr={captionAr}
    >
      <AStarTablePlayer start={city} mode={mode} />
    </WidgetShell>
  );
}
