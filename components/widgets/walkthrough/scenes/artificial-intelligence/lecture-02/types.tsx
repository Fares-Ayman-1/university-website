"use client";

import type { problemTypes } from "@/lib/walkthroughs/artificial-intelligence/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { CONFORMANT_PLAN, CONFORMANT_TRACE, SINGLE_PLAN, SINGLE_TRACE, VACUUM_STATES, noDirt } from "@/lib/widgets/ai-lecture-02";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Text, Token, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Vac } from "./local";

function States() {
  const at = (n: number) => ({ x: n % 2 === 1 ? 62 : 196, y: 40 + Math.floor((n - 1) / 2) * 56 });
  const factors = [bi("Robot in A or in B", "الروبوت في A أو في B"), bi("A dirty or clean", "A متسخ أو نظيف"), bi("B dirty or clean", "B متسخ أو نظيف")];
  return (
    <Svg>
      {VACUUM_STATES.map((n, i) => {
        const { x, y } = at(n);
        return (
          <g key={n}>
            <Text x={x - 10} y={y + 17} text={String(n)} anchor="end" mono size={12} tone="heading" d={100 + i * 110} />
            <Vac x={x} y={y} n={n} cw={46} ch={34} goal={noDirt(n)} d={100 + i * 110} />
          </g>
        );
      })}
      {factors.map((f, i) => (
        <g key={i}>
          <Box x={330} y={44 + i * 56} w={165} h={44} label={f} tone="slate" size={12} d={1100 + i * 200} />
          <Chip x={528} y={66 + i * 56} text="× 2" tone="gold" center d={1200 + i * 200} />
        </g>
      ))}
      <Box x={330} y={214} w={220} h={48} label={bi(`2 × 2 × 2 = ${VACUUM_STATES.length} states`, `${VACUUM_STATES.length} حالات`)} tone="gold" d={1800} />
    </Svg>
  );
}

type Kind = "single" | "conformant" | "contingency" | "exploration";
const KINDS: Record<Kind, { env: Bi; state: [Bi, Tone]; acts: [Bi, Tone]; sol: Bi }> = {
  single: {
    env: bi("Deterministic, fully observable", "حتمية وقابلة للملاحظة كليًا"),
    state: [bi("yes", "نعم"), "success"],
    acts: [bi("yes", "نعم"), "success"],
    sol: bi("Solution: a fixed sequence", "الحل: تسلسل ثابت"),
  },
  conformant: {
    env: bi("Non-observable (sensorless)", "غير قابلة للملاحظة (عديمة المستشعرات)"),
    state: [bi("no", "لا"), "danger"],
    acts: [bi("yes", "نعم"), "success"],
    sol: bi("Solution: a sequence for every start", "الحل: تسلسل ينجح من أي بداية"),
  },
  contingency: {
    env: bi("Nondeterministic and/or partially observable", "غير حتمية و/أو قابلة للملاحظة جزئيًا"),
    state: [bi("partly", "جزئيًا"), "warn"],
    acts: [bi("not always", "ليس دائمًا"), "warn"],
    sol: bi("Solution: a plan with branches", "الحل: خطة ذات تفرعات"),
  },
  exploration: {
    env: bi("Unknown state space", "فضاء حالات مجهول"),
    state: [bi("no map", "بلا خريطة"), "danger"],
    acts: [bi("no", "لا"), "danger"],
    sol: bi("Solution: act, observe, learn the map", "الحل: التصرف والملاحظة وتعلّم الخريطة"),
  },
};

/** The shape of a solution, drawn in the right half of the Types scene. */
function Shape({ kind }: { kind: Kind }) {
  const D = 900;
  if (kind === "single") {
    return (
      <>
        <Chip x={296} y={170} text="5" tone="navy" center d={D} />
        <Arrow pts={[[318, 170], [334, 170]]} tone="gold" d={D + 150} dur={150} />
        <Chip x={362} y={170} text="Right" tone="outline" center d={D + 250} />
        <Arrow pts={[[392, 170], [414, 170]]} tone="gold" d={D + 400} dur={150} />
        <Chip x={441} y={170} text="Suck" tone="outline" center d={D + 500} />
        <Arrow pts={[[468, 170], [490, 170]]} tone="gold" d={D + 650} dur={150} />
        <Chip x={512} y={170} text="8" tone="success" center d={D + 750} />
        <Token pts={[[318, 170], [490, 170]]} d={D + 900} dur={1000} />
      </>
    );
  }
  if (kind === "conformant") {
    return (
      <>
        <Box x={298} y={96} w={238} h={34} r={17} tone="ghost" dashed d={D} />
        {VACUUM_STATES.map((n, i) => (
          <Chip key={n} x={318 + i * 28} y={113} text={String(n)} w={24} tone="slate" center size={10.5} d={D + 100 + i * 50} />
        ))}
        <Arrow pts={[[417, 132], [417, 152]]} tone="gold" d={D + 600} dur={200} />
        <Box x={317} y={154} w={200} h={28} r={14} label={`[${CONFORMANT_PLAN.join(", ")}]`} tone="outline" mono size={11.5} d={D + 700} />
        <Arrow pts={[[417, 184], [417, 202]]} tone="gold" d={D + 900} dur={200} />
        <Chip x={417} y={216} text={String(CONFORMANT_TRACE[CONFORMANT_TRACE.length - 1][0])} tone="success" center d={D + 1000} />
      </>
    );
  }
  if (kind === "contingency") {
    return (
      <>
        <Chip x={296} y={170} text="5" tone="navy" center d={D} />
        <Arrow pts={[[318, 170], [330, 170]]} tone="gold" d={D + 150} dur={150} />
        <Chip x={360} y={170} text="Right" tone="outline" center d={D + 250} />
        <Arrow pts={[[390, 170], [402, 170]]} tone="gold" d={D + 400} dur={150} />
        <Box x={404} y={148} w={54} h={44} label={bi("dirt?", "أوساخ؟")} tone="warn" size={12} d={D + 500} />
        <Arrow pts={[[460, 160], [488, 122]]} tone="gold" d={D + 700} dur={200} />
        <Arrow pts={[[460, 180], [488, 214]]} tone="gold" d={D + 700} dur={200} />
        <Chip x={515} y={112} text="Suck" tone="outline" center d={D + 850} />
        <Chip x={515} y={226} text="NoOp" tone="outline" center d={D + 950} />
      </>
    );
  }
  const probes: [number, number][] = [
    [430, 112],
    [430, 170],
    [430, 228],
  ];
  return (
    <>
      <Box x={296} y={150} w={60} h={40} label="s₀" tone="navy" mono d={D} />
      {probes.map(([x, y], i) => (
        <g key={i}>
          <Arrow pts={[[358, 170], [x - 30, y]]} tone="muted" dashed d={D + 200 + i * 120} />
          <Box x={x - 28} y={y - 20} w={56} h={40} label="?" tone="ghost" dashed d={D + 250 + i * 120} />
        </g>
      ))}
      <Token pts={[[358, 170], [400, 170]]} d={D + 800} dur={500} />
      <Fade d={D + 1300}>
        <Box x={402} y={150} w={56} h={40} label="s₁" tone="slate" mono />
      </Fade>
      <Text x={510} y={170} text="…" size={18} tone="muted" d={D + 1500} />
    </>
  );
}

function Types({ control }: { control: string }) {
  const kind = (control in KINDS ? control : "single") as Kind;
  const k = KINDS[kind];
  return (
    <Svg>
      <Box x={20} y={30} w={520} h={44} label={k.env} tone="navy" d={0} />
      <Text x={24} y={112} text={bi("Knows its state?", "يعرف حالته؟")} anchor="start" size={12} tone="heading" d={200} />
      <Chip x={214} y={112} w={80} text={k.state[0]} tone={k.state[1]} center d={350} />
      <Text x={24} y={168} text={bi("Actions predictable?", "أفعاله متوقعة النتائج؟")} anchor="start" size={12} tone="heading" d={450} />
      <Chip x={214} y={168} w={80} text={k.acts[0]} tone={k.acts[1]} center d={600} />
      <Box x={16} y={214} w={264} h={48} label={k.sol} tone="gold" size={11.5} d={750} />
      <Shape kind={kind} />
    </Svg>
  );
}

function Single() {
  const states = SINGLE_TRACE.map((s) => s[0]);
  const xs = [30, 230, 430];
  return (
    <Svg>
      {states.map((n, i) => (
        <g key={n}>
          <Text x={xs[i] + 50} y={80} text={bi(`state ${n}`, `الحالة ${n}`)} size={12} tone="heading" d={i * 700} />
          <Vac x={xs[i]} y={110} n={n} cw={50} ch={38} goal={noDirt(n)} d={i * 700} />
        </g>
      ))}
      {SINGLE_PLAN.map((a, i) => (
        <g key={a}>
          <Arrow pts={[[xs[i] + 104, 129], [xs[i + 1] - 4, 129]]} tone="gold" d={350 + i * 700} dur={300} label={a} labelAt={[xs[i] + 150, 114]} labelTone="gold" />
          <Token pts={[[xs[i] + 104, 129], [xs[i + 1] - 4, 129]]} d={400 + i * 700} dur={400} />
        </g>
      ))}
      <Mark x={530} y={110} ok d={1700} />
      <Chip x={280} y={200} text={`[${SINGLE_PLAN.join(", ")}]`} tone="gold" center d={1800} />
      <Text x={280} y={240} text={bi("known start, so one fixed sequence", "بداية معروفة، إذن تسلسل واحد ثابت")} size={12} tone="muted" d={1900} />
    </Svg>
  );
}

function Belief() {
  const cx = (i: number) => 56 + i * 112;
  const notation = (s: number[]) => (s.length === VACUUM_STATES.length ? `{1,…,${s.length}}` : `{${s.join(",")}}`);
  return (
    <Svg>
      {CONFORMANT_TRACE.map((set, i) => {
        const top = 146 - (set.length * 20) / 2 + 2;
        const d = 200 + i * 700;
        const last = i === CONFORMANT_TRACE.length - 1;
        return (
          <g key={i}>
            <Chip x={cx(i)} y={36} text={String(set.length)} tone={last ? "success" : "gold"} center d={d} />
            {set.map((n, j) => (
              <g key={n}>
                <Text x={cx(i) - 25} y={top + j * 20 + 7.5} text={String(n)} anchor="end" mono size={9.5} tone="muted" d={d + j * 40} />
                <Vac x={cx(i) - 20} y={top + j * 20} n={n} cw={20} ch={15} goal={last} d={d + j * 40} />
              </g>
            ))}
            <Text x={cx(i)} y={252} text={notation(set)} mono size={10.5} tone={last ? "success" : "muted"} d={d + 200} />
            {i < CONFORMANT_PLAN.length ? (
              <>
                <Arrow pts={[[cx(i) + 26, 146], [cx(i) + 72, 146]]} tone="gold" d={d + 400} dur={250} label={CONFORMANT_PLAN[i]} labelAt={[cx(i) + 49, 132]} labelTone="gold" />
                <Token pts={[[cx(i) + 26, 146], [cx(i) + 62, 146]]} d={d + 450} dur={300} />
              </>
            ) : null}
          </g>
        );
      })}
      <Mark x={cx(4) + 34} y={146} ok d={3300} />
    </Svg>
  );
}

function Contingency() {
  return (
    <Svg>
      <Text x={56} y={100} text={bi("could be 5 or 7", "قد تكون 5 أو 7")} size={11} tone="muted" d={0} />
      <Vac x={16} y={122} n={5} cw={40} ch={30} unknownB d={0} />
      <Arrow pts={[[100, 137], [136, 137]]} tone="gold" d={300} dur={250} label="Right" labelAt={[118, 122]} labelTone="gold" />
      <Token pts={[[100, 137], [136, 137]]} d={350} dur={300} />
      <Text x={180} y={100} text={bi("6 or 8: it senses B", "6 أو 8، ثم يستشعر B")} size={11} tone="muted" d={600} />
      <Vac x={140} y={122} n={6} cw={40} ch={30} unknownB d={600} />
      <Arrow pts={[[224, 130], [258, 92]]} tone="gold" d={900} dur={250} />
      <Arrow pts={[[224, 144], [258, 186]]} tone="gold" d={900} dur={250} />
      <Chip x={290} y={84} text={bi("dirt", "أوساخ")} tone="warn" center d={1100} />
      <Chip x={290} y={196} text={bi("clean", "نظيف")} tone="success" center d={1100} />
      <Arrow pts={[[318, 84], [344, 84]]} tone="gold" d={1300} dur={200} />
      <Arrow pts={[[318, 196], [344, 196]]} tone="gold" d={1300} dur={200} />
      <Chip x={374} y={84} text="Suck" tone="outline" center d={1400} />
      <Chip x={374} y={196} text="NoOp" tone="outline" center d={1400} />
      <Arrow pts={[[402, 84], [424, 84]]} tone="gold" d={1600} dur={200} />
      <Arrow pts={[[402, 196], [424, 196]]} tone="gold" d={1600} dur={200} />
      <Vac x={428} y={69} n={8} cw={40} ch={30} goal d={1700} />
      <Vac x={428} y={181} n={8} cw={40} ch={30} goal d={1800} />
      <Mark x={526} y={84} ok d={1900} />
      <Mark x={526} y={196} ok d={2000} />
      <Chip x={280} y={250} text={bi("Murphy's law: Suck on a clean square can dirty it", "قانون مورفي: قد يؤدي Suck على مربع نظيف إلى اتساخه")} tone="warn" center size={11} d={2200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof problemTypes>>({
  states: States,
  types: Types,
  single: Single,
  belief: Belief,
  contingency: Contingency,
});
