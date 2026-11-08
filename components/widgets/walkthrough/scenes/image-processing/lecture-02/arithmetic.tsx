"use client";

import type { arithmetic } from "@/lib/walkthroughs/image-processing/lecture-02";
import { CLIPPED_BY_PLUS, OPS, X, clip, countOverflow, flat, overflows, pointOp, round, wrap, type OpName } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Curve, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { ClippedLine, MapMark, T_BOX, Transfer } from "./local";

const TITLE: Record<OpName, string> = { plus: "y = x + 128", minus: "y = x − 128", double: "y = 2x", half: "y = x / 2", lift: "y = x/2 + 128" };
const OUT_LABEL: Record<OpName, string> = { plus: "x + 128", minus: "x − 128", double: "2x", half: "x / 2", lift: "x/2 + 128" };
/** The pixel values marked on each curve: [value, clipped?] */
const MARKS: Record<OpName, number[]> = { plus: [100, 200], minus: [200, 60], double: [60, 200], half: [200], lift: [20, 250] };

/** One arithmetic operation on the example image: its clipped curve, two marked pixels and the result. */
function Op({ op }: { op: OpName }) {
  const f = OPS[op];
  const out = pointOp(X, f);
  const n = countOverflow(X, f);
  const values = flat(out);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const toward = op === "minus" ? 0 : 255;
  const chip = n
    ? { text: bi(`${n} values clipped to ${toward}`, `قُصَّت ${n} قيم إلى ${toward}`), tone: "danger" as const }
    : op === "half"
      ? { text: bi(`darker: ${lo} to ${hi}, nothing clipped`, `أدكن: من ${lo} إلى ${hi}، دون قصّ`), tone: "slate" as const }
      : { text: bi(`brighter: ${lo} to ${hi}, nothing clipped`, `أكثر سطوعًا: من ${lo} إلى ${hi}، دون قصّ`), tone: "success" as const };
  return (
    <Svg>
      <Transfer input={X} output={out} title={TITLE[op]} outLabel={OUT_LABEL[op]} ring={(r, c) => (overflows(f, X[r][c]) ? "danger" : undefined)}>
        <ClippedLine f={f} d={500} />
        {MARKS[op].map((v, i) => (
          <MapMark key={v} box={T_BOX} x={v} y={clip(round(f(v)))} tone={overflows(f, v) ? "danger" : "gold"} d={1000 + i * 300} />
        ))}
      </Transfer>
      <Chip x={280} y={246} text={chip.text} tone={chip.tone} center d={2300} />
    </Svg>
  );
}

const Add = ({ control }: { control: string }) => <Op op={control === "minus" ? "minus" : "plus"} />;
const Multiply = ({ control }: { control: string }) => <Op op={control as OpName} />;

/** The eight pixels that +128 clips, brightened and then un-brightened. */
function Lost({ control }: { control: string }) {
  const squeeze = control === "squeeze";
  const row1 = [CLIPPED_BY_PLUS];
  const row2 = [CLIPPED_BY_PLUS.map((v) => (squeeze ? round(OPS.lift(v)) : clip(v + 128)))];
  const row3 = [row2[0].map((y) => (squeeze ? 2 * (y - 128) : y - 128))];
  const back = row3[0].every((v, i) => v === CLIPPED_BY_PLUS[i]);
  const X0 = 144;
  const CELL = 34;
  return (
    <Svg>
      <Text x={X0 - 10} y={47} text="x" size={12.5} mono anchor="end" tone="heading" d={0} />
      <Pixels x={X0} y={30} values={row1} cell={CELL} size={11} d={0} />
      <Arrow pts={[[424, 47], [446, 47], [446, 125], [426, 125]]} tone={squeeze ? "gold" : "danger"} d={400} />
      <Text x={500} y={80} text={bi("brighten", "زِد السطوع")} size={11.5} tone={squeeze ? "gold" : "danger"} d={500} />
      <Text x={X0 - 10} y={125} text={squeeze ? "x/2 + 128" : "x + 128"} size={12.5} mono anchor="end" tone="heading" d={700} />
      <Pixels x={X0} y={108} values={row2} cell={CELL} size={11} d={700} outline={() => (squeeze ? undefined : "danger")} />
      <Arrow pts={[[424, 125], [446, 125], [446, 203], [426, 203]]} tone="slate" d={1300} />
      <Text x={500} y={158} text={bi("undo", "تراجع")} size={11.5} tone="slate" d={1400} />
      <Text x={X0 - 10} y={203} text={squeeze ? "2(y − 128)" : "y − 128"} size={12.5} mono anchor="end" tone="heading" d={1600} />
      <Pixels x={X0} y={186} values={row3} cell={CELL} size={11} d={1600} outline={(_, c) => (row3[0][c] === CLIPPED_BY_PLUS[c] ? "success" : "danger")} />
      <Chip
        x={280}
        y={256}
        text={back ? bi(`all ${CLIPPED_BY_PLUS.length} values recovered exactly`, "استُعيدت كل القيم كما كانت تمامًا") : bi(`all ${CLIPPED_BY_PLUS.length} became ${row3[0][0]}: the originals are lost`, `أصبحت كلها ${row3[0][0]}: ضاعت القيم الأصلية`)}
        tone={back ? "success" : "danger"}
        center
        d={2300}
      />
    </Svg>
  );
}

/** x + 128 in uint8: MATLAB saturates (clips), NumPy wraps around modulo 256. */
function Overflow({ control }: { control: string }) {
  const wraps = control === "wrap";
  const f = OPS.plus;
  const out = pointOp(X, f, wraps ? "wrap" : "clip");
  const knee = 255 - 128;
  return (
    <Svg>
      <Transfer input={X} output={out} title={wraps ? "NumPy: x + 128" : "imadd(x, 128)"} outLabel="uint8" ring={(r, c) => (overflows(f, X[r][c]) ? "danger" : undefined)}>
        {wraps ? (
          <>
            <Curve box={T_BOX} points={[[0, f(0)], [knee, f(knee)]]} d={500} dur={400} />
            <Curve box={T_BOX} points={[[knee + 1, wrap(f(knee + 1))], [255, wrap(f(255))]]} tone="danger" width={3} d={900} dur={400} />
          </>
        ) : (
          <ClippedLine f={f} d={500} />
        )}
        <MapMark box={T_BOX} x={100} y={f(100)} d={1100} />
        <MapMark box={T_BOX} x={140} y={wraps ? wrap(f(140)) : clip(f(140))} tone="danger" d={1400} />
      </Transfer>
      <Chip
        x={280}
        y={246}
        text={wraps ? bi(`268 wraps around to ${wrap(268)}`, `تلتفّ القيمة 268 إلى ${wrap(268)}`) : bi("268 is clipped to 255", "تُقصّ القيمة 268 إلى 255")}
        tone={wraps ? "danger" : "success"}
        center
        d={2300}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof arithmetic>>({
  add: Add,
  multiply: Multiply,
  lost: Lost,
  overflow: Overflow,
});
