import { boardText, checkPuzzleExpect, LECTURE_BOARD, LECTURE_GOAL, parseBoard, puzzleWork, type Board } from "@/lib/widgets/cheat-ai";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { PuzzleHeuristicsPlayer } from "./players";

const where = "<PuzzleHeuristics>";

// Lecture 4: h1 = 6 and h2 = 2 + 0 + 3 + 1 + 0 + 1 + 3 + 4 = 14 on Lecture 2's start state.
const lecture = puzzleWork(LECTURE_BOARD, LECTURE_GOAL);
if (lecture.h1 !== 6 || lecture.h2 !== 14 || lecture.tiles.map((t) => t.distance).join("+") !== "2+0+3+1+0+1+3+4") {
  throw new Error(`${where}: h1 = ${lecture.h1}, h2 = ${lecture.h2} on the lecture's board, not 6 and 14`);
}

function boardProp(name: "board" | "goal", text: string): Board {
  const parsed = parseBoard(text);
  if (parsed.error) {
    const why = { symbol: "use the digits 1–8 and _ (or 0) for the blank", count: "write 9 squares", repeat: "use each of 0–8 once" }[parsed.error];
    throw new Error(`${where}: ${name}="${text}": ${why} (e.g. "7 2 4 / 5 _ 6 / 8 3 1")`);
  }
  return parsed.board;
}

/**
 * <PuzzleHeuristics board="7 2 4 / 5 _ 6 / 8 3 1" goal="1 2 3 / 4 5 6 / 7 8 _" expect="h1=6; h2=14" />
 *
 * The 8-puzzle's h1 (misplaced tiles, the blank not counted) and h2 (the sum of the tiles'
 * Manhattan distances), with the misplaced tiles highlighted, a per-tile table of rows +
 * columns, and h2's sum written out in reading order (as Lecture 4 writes it). The board is
 * editable: click two squares to swap them, or type a board. `board` and `goal` default to
 * Lecture 2's start and goal, the ones Lecture 4 uses (h1 = 6, h2 = 14); write them row by row,
 * with "_" or 0 for the blank.
 *
 * `expect`, copied from the page, makes the build fail if the numbers differ: "h1=6; h2=14"
 * for the board and goal given. Grammar: checkPuzzleExpect in lib/widgets/cheat-ai.ts.
 */
export function PuzzleHeuristics({
  board = boardText(LECTURE_BOARD),
  goal = boardText(LECTURE_GOAL),
  expect,
  title = "8-puzzle heuristics: misplaced tiles and Manhattan distance",
  titleAr = "استدلالات اللغز الثماني: البلاطات في غير مواضعها ومسافة مانهاتن",
  caption,
  captionAr,
}: {
  board?: string;
  goal?: string;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  const start = boardProp("board", board);
  const target = boardProp("goal", goal);

  if (expect) {
    const failures = checkPuzzleExpect(expect, start, target);
    if (failures.length) throw new Error(`${where} expect does not hold:\n  ${failures.join("\n  ")}`);
  }

  const isLecture = start.join() === LECTURE_BOARD.join() && target.join() === LECTURE_GOAL.join();
  return (
    <WidgetShell
      name="puzzle-heuristics"
      kicker={bi("Calculator", "حاسبة")}
      title={title}
      titleAr={titleAr}
      caption={caption}
      captionAr={captionAr}
    >
      <PuzzleHeuristicsPlayer board={[...start]} goal={[...target]} lecture={isLecture} />
    </WidgetShell>
  );
}
