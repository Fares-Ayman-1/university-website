"use client";

import { Fragment, useMemo, useState } from "react";
import { boardText, parseBoard, puzzleWork, squareOf, swapTiles, type Board, type BoardParse } from "@/lib/widgets/cheat-ai";
import { BiText } from "./BiText";
import { bi, type Bi } from "./types";
import styles from "./widgets.module.css";
import css from "./PuzzleHeuristics.module.css";

const both = (text: Bi) => `${text.en} · ${text.ar}`;
/** Non-breaking spaces: a formula inside an Arabic line stays on one line, as one left-to-right run. */
const nb = (text: string) => text.replace(/ /g, "\u00a0");

const T = {
  widget: bi("8-puzzle heuristics calculator: edit the board and h1 and h2 are worked out again.", "حاسبة استدلالات اللغز الثماني: عدّل اللوحة فيُحسب h1 و h2 من جديد."),
  board: bi("Board: click two squares to swap them", "اللوحة: انقر مربعين لتبديلهما"),
  goal: bi("Goal", "الهدف"),
  typeBoard: bi("Type the board", "اكتب اللوحة"),
  typeGoal: bi("Type the goal", "اكتب الهدف"),
  format: bi("Row by row, _ for the blank: 7 2 4 / 5 _ 6 / 8 3 1", `صفًّا بعد صف، و _ للفراغ، مثل ${nb("7 2 4 / 5 _ 6 / 8 3 1")}`),
  resetLecture: bi("Reset to the lecture's board", "العودة إلى لوحة المحاضرة"),
  resetStart: bi("Reset to the starting board", "العودة إلى لوحة البداية"),
  h1: bi("h1: misplaced tiles", "h1: البلاطات في غير مواضعها"),
  h1How: bi("Count the tiles that are not on their goal square. The blank is not a tile.", "عُدّ البلاطات التي ليست في مربعها في الهدف. والفراغ ليس بلاطة."),
  h2: bi("h2: sum of Manhattan distances", "h2: مجموع مسافات مانهاتن"),
  h2How: bi(
    "For each tile: the rows plus the columns between it and its goal square. Added up in reading order.",
    "لكل بلاطة: عدد الصفوف زائد عدد الأعمدة بينها وبين مربعها في الهدف، وتُجمع بترتيب القراءة.",
  ),
  none: bi("none", "لا يوجد"),
  tile: bi("Tile", "البلاطة"),
  at: bi("At", "موضعها"),
  to: bi("Goal", "في الهدف"),
  rc: bi("Rows + cols = distance", "صفوف + أعمدة = المسافة"),
  tableLabel: bi("Each tile's Manhattan distance", "مسافة مانهاتن لكل بلاطة"),
  dominance: bi(
    "h2 ≥ h1 on every board: each misplaced tile is at least one square away. So h2 dominates h1, and both are admissible.",
    "دائمًا h2 ≥ h1: فكل بلاطة في غير موضعها تبعد مربعًا واحدًا على الأقل. لذا يهيمن h2 على h1، وكلاهما مقبول.",
  ),
  hint: bi(
    "Keyboard: Tab to a square and press Enter to pick it, then Enter on another to swap; or type a digit (or _) on a square to swap that tile into it.",
    "بلوحة المفاتيح: انتقل إلى مربع بـ Tab واضغط Enter لاختياره، ثم Enter على مربع آخر للتبديل؛ أو اكتب رقمًا (أو _) على المربع لتنقل تلك البلاطة إليه.",
  ),
  start: bi("Click a tile, then another square, to swap them: h1 and h2 update at once.", "انقر بلاطة ثم مربعًا آخر لتبديلهما، فيتحدّث h1 و h2 فورًا."),
};

const ERRORS: Record<NonNullable<BoardParse["error"]>, Bi> = {
  symbol: bi("Use the digits 1–8, and _ for the blank.", "استخدم الأرقام 1–8، و _ للفراغ."),
  count: bi("A board has 9 squares: 8 tiles and the blank.", "اللوحة 9 مربعات: 8 بلاطات والفراغ."),
  repeat: bi("Each tile appears exactly once.", "تظهر كل بلاطة مرة واحدة فقط."),
};

const tileName = (t: number) => (t === 0 ? bi("the blank", "الفراغ") : bi(`tile ${t}`, `البلاطة ${t}`));
const at = (i: number) => `(${squareOf(i).join(",")})`;

function squareLabel(board: Board, goal: Board, i: number, selected: boolean): string {
  const t = board[i];
  const [r, c] = squareOf(i);
  const where = bi(`row ${r}, column ${c}`, `الصف ${r}، العمود ${c}`);
  if (t === 0) return both(bi(`The blank, ${where.en}${selected ? ", selected" : ""}`, `الفراغ، ${where.ar}${selected ? "، مُختار" : ""}`));
  const to = goal.indexOf(t);
  const [gr, gc] = squareOf(to);
  const d = Math.abs(r - gr) + Math.abs(c - gc);
  const state =
    to === i
      ? bi("on its goal square", "في مربعها في الهدف")
      : bi(`misplaced, ${d} ${d === 1 ? "square" : "squares"} from its goal square`, `في غير موضعها، وتبعد ${d} عن مربعها في الهدف`);
  return both(bi(`Tile ${t}, ${where.en}: ${state.en}${selected ? ", selected" : ""}`, `البلاطة ${t}، ${where.ar}: ${state.ar}${selected ? "، مُختارة" : ""}`));
}

function BoardInput({ label, value, error, onChange }: { label: Bi; value: string; error?: Bi; onChange: (text: string) => void }) {
  return (
    <label className={`${styles.field} ${css.typeField}`}>
      <span>
        <BiText text={label} inline />
      </span>
      <input
        className={css.text}
        type="text"
        dir="ltr"
        spellCheck={false}
        autoComplete="off"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-label={both(label)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <span className={css.error} role="alert">
          <BiText text={error} />
        </span>
      ) : null}
    </label>
  );
}

export function PuzzleHeuristicsPlayer({ board: initialBoard, goal: initialGoal, lecture }: { board: number[]; goal: number[]; lecture: boolean }) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [goal, setGoal] = useState<Board>(initialGoal);
  const [boardDraft, setBoardDraft] = useState(boardText(initialBoard));
  const [goalDraft, setGoalDraft] = useState(boardText(initialGoal));
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<Bi>(T.start);

  const work = useMemo(() => puzzleWork(board, goal), [board, goal]);
  const boardError = parseBoard(boardDraft).error;
  const goalError = parseBoard(goalDraft).error;

  const show = (next: Board) => {
    setBoard(next);
    setBoardDraft(boardText(next));
  };

  const swap = (i: number, j: number) => {
    setSelected(null);
    if (i === j) return;
    const next = swapTiles(board, i, j);
    const after = puzzleWork(next, goal);
    show(next);
    const a = tileName(board[i]);
    const b = tileName(board[j]);
    setMessage(
      bi(
        `Swapped ${a.en} and ${b.en}: ${nb(`h1 = ${after.h1}`)}, ${nb(`h2 = ${after.h2}`)}.`,
        `بُدّلت ${a.ar} و${b.ar}، فصار ${nb(`h1 = ${after.h1}`)} و ${nb(`h2 = ${after.h2}`)}.`,
      ),
    );
  };

  const pick = (i: number) => {
    if (selected === null) {
      setSelected(i);
      const t = tileName(board[i]);
      setMessage(bi(`Picked ${t.en}: now click the square to swap it with.`, `اخترت ${t.ar}: انقر الآن المربع الذي تريد التبديل معه.`));
    } else if (selected === i) {
      setSelected(null);
      setMessage(T.start);
    } else swap(selected, i);
  };

  const onTileKey = (i: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key === "_" ? "0" : event.key;
    if (/^[0-8]$/.test(key)) {
      event.preventDefault();
      swap(i, board.indexOf(Number(key)));
    } else if (event.key === "Escape" && selected !== null) {
      event.preventDefault();
      setSelected(null);
      setMessage(T.start);
    }
  };

  const reset = () => {
    show(initialBoard);
    setGoal(initialGoal);
    setGoalDraft(boardText(initialGoal));
    setSelected(null);
    const w = puzzleWork(initialBoard, initialGoal);
    setMessage(
      bi(
        `Back to the starting board: ${nb(`h1 = ${w.h1}`)}, ${nb(`h2 = ${w.h2}`)}.`,
        `عدنا إلى لوحة البداية، وفيها ${nb(`h1 = ${w.h1}`)} و ${nb(`h2 = ${w.h2}`)}.`,
      ),
    );
  };

  const target = selected === null ? null : goal.indexOf(board[selected]);
  const misplacedText = work.misplaced.length ? work.misplaced.join(", ") : null;
  const sum = work.tiles.map((t) => t.distance).join(" + ");

  return (
    <div className={styles.body} role="group" aria-label={both(T.widget)}>
      <div className={css.boards}>
        <div className={css.boardPanel}>
          <p className={styles.panelLabel}>
            <BiText text={T.board} />
          </p>
          <div className={css.grid} role="group" aria-label={both(T.board)}>
            {board.map((t, i) => {
              const tile = work.tiles.find((w) => w.at === i);
              return (
                <button
                  key={i}
                  type="button"
                  className={css.square}
                  data-blank={t === 0 || undefined}
                  data-misplaced={tile?.misplaced || undefined}
                  aria-pressed={selected === i}
                  aria-label={squareLabel(board, goal, i, selected === i)}
                  onClick={() => pick(i)}
                  onKeyDown={onTileKey(i)}
                >
                  {t === 0 ? "" : t}
                  {tile?.misplaced ? (
                    <span className={css.badge} aria-hidden="true">
                      {tile.distance}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <BoardInput
            label={T.typeBoard}
            value={boardDraft}
            error={boardError ? ERRORS[boardError] : undefined}
            onChange={(text) => {
              setBoardDraft(text);
              const parsed = parseBoard(text);
              if (parsed.board) {
                setBoard(parsed.board);
                setSelected(null);
              }
            }}
          />
        </div>

        <div className={css.boardPanel}>
          <p className={styles.panelLabel}>
            <BiText text={T.goal} />
          </p>
          <div className={css.grid} aria-label={both(bi(`Goal: ${boardText(goal)}`, `الهدف: ${boardText(goal)}`))} role="img">
            {goal.map((t, i) => (
              <span key={i} className={css.square} data-goal data-blank={t === 0 || undefined} data-target={target === i || undefined}>
                {t === 0 ? "" : t}
              </span>
            ))}
          </div>
          <BoardInput
            label={T.typeGoal}
            value={goalDraft}
            error={goalError ? ERRORS[goalError] : undefined}
            onChange={(text) => {
              setGoalDraft(text);
              const parsed = parseBoard(text);
              if (parsed.board) {
                setGoal(parsed.board);
                setSelected(null);
              }
            }}
          />
        </div>
      </div>

      <p className={css.format}>
        <BiText text={T.format} />
      </p>

      <div className={css.actions}>
        <button type="button" className={css.textButton} onClick={reset}>
          <BiText text={lecture ? T.resetLecture : T.resetStart} />
        </button>
      </div>

      <div className={css.results}>
        <section className={css.result} aria-label={both(T.h1)}>
          <div className={css.resultHead}>
            <p className={css.resultTitle}>
              <BiText text={T.h1} />
            </p>
            <p className={css.value} dir="ltr">
              h1 = {work.h1}
            </p>
          </div>
          <p className={css.how}>
            <BiText text={T.h1How} />
          </p>
          <p className={css.working} dir="ltr">
            <span className={css.token}>{misplacedText ? `{ ${misplacedText} }` : both(T.none)}</span>{" "}
            <span className={css.token}>→ h1 = {work.h1}</span>
          </p>
        </section>

        <section className={css.result} aria-label={both(T.h2)}>
          <div className={css.resultHead}>
            <p className={css.resultTitle}>
              <BiText text={T.h2} />
            </p>
            <p className={css.value} dir="ltr">
              h2 = {work.h2}
            </p>
          </div>
          <p className={css.how}>
            <BiText text={T.h2How} />
          </p>
          <div className={css.tableWrap} role="region" tabIndex={0} aria-label={both(T.tableLabel)}>
            <table className={css.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <BiText text={T.tile} />
                  </th>
                  <th scope="col">
                    <BiText text={T.at} />
                  </th>
                  <th scope="col">
                    <BiText text={T.to} />
                  </th>
                  <th scope="col">
                    <BiText text={T.rc} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {work.tiles.map((t) => (
                  <tr key={t.tile} data-misplaced={t.misplaced || undefined}>
                    <td className={css.tileCell}>{t.tile}</td>
                    <td>{at(t.at)}</td>
                    <td>{at(t.to)}</td>
                    <td>
                      {t.rows} + {t.cols} = <b className={css.distance}>{t.distance}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={css.working} dir="ltr">
            {[...sum.split(" + ").map((v, i) => (i ? `+ ${v}` : `h2 = ${v}`)), `= ${work.h2}`].map((token, i) => (
              <Fragment key={i}>
                {i ? " " : null}
                <span className={css.token}>{token}</span>
              </Fragment>
            ))}
          </p>
        </section>
      </div>

      <p className={css.note}>
        <BiText text={T.dominance} />
      </p>
      <p className={css.note} data-tone={work.solvable ? undefined : "warn"}>
        <BiText
          text={
            work.solvable
              ? bi(
                  `Inversions: ${work.inversions.board} on the board and ${work.inversions.goal} in the goal, the same parity, so the goal can be reached.`,
                  `عدد الانقلابات (inversions) في اللوحة ${work.inversions.board}، وفي الهدف ${work.inversions.goal}، والزوجية واحدة، لذا يمكن الوصول إلى الهدف.`,
                )
              : bi(
                  `Inversions: ${work.inversions.board} on the board and ${work.inversions.goal} in the goal, different parity: this board can never reach the goal, though h1 and h2 are still defined. Swapping two tiles flips the parity.`,
                  `عدد الانقلابات (inversions) في اللوحة ${work.inversions.board}، وفي الهدف ${work.inversions.goal}، والزوجية مختلفة، لذا لا يمكن لهذه اللوحة أن تصل إلى الهدف أبدًا، مع أن h1 و h2 ما زالا معرَّفين. فتبديل بلاطتين يقلب الزوجية.`,
                )
          }
        />
      </p>

      <div className={styles.status} aria-live="polite">
        <BiText text={message} />
      </div>
      <p className={styles.hint}>
        <BiText text={T.hint} />
      </p>
    </div>
  );
}
