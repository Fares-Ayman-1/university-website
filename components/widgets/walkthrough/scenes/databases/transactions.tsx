"use client";

import type { transactions } from "@/lib/walkthroughs/databases/lecture-01";
import { AMOUNT, START, deposits, total, transfer, type TxEvent } from "@/lib/widgets/transactions";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../types";
import { Arrow, Box, Chip, Cylinder, Fade, Mark, Svg, Text, Token, type Tone } from "../../primitives";
import { sceneSet } from "../../scene-set";

const ok = transfer(START, AMOUNT);
const crashed = transfer(START, AMOUNT, true);

function Acid() {
  const letters = [bi("Atomicity", "الذرّية"), bi("Consistency", "الاتساق"), bi("Isolation", "العزل"), bi("Durability", "الديمومة")];
  return (
    <Svg>
      <Box x={20} y={14} w={520} h={170} r={14} tone="ghost" dashed d={0} />
      <Text x={36} y={32} text="BEGIN" anchor="start" mono size={11.5} tone="muted" d={0} />
      <Box x={50} y={58} w={150} h={64} label="A" sub={`${START.A}`} mono tone="slate" size={16} d={100} />
      <Box x={360} y={58} w={150} h={64} label="B" sub={`${START.B}`} mono tone="slate" size={16} d={200} />
      <Arrow pts={[[202, 90], [356, 90]]} tone="gold" d={500} width={2.4} label={`${AMOUNT}`} labelAt={[279, 74]} labelTone="gold" />
      <Token pts={[[202, 90], [356, 90]]} d={700} dur={900} />
      <Fade d={800}>
        <Box x={50} y={58} w={150} h={64} label="A" sub={`${ok.afterDebit.A}  (−${AMOUNT})`} mono tone="warn" size={16} />
      </Fade>
      <Fade d={1500}>
        <Box x={360} y={58} w={150} h={64} label="B" sub={`${ok.final.B}  (+${AMOUNT})`} mono tone="success" size={16} />
      </Fade>
      <Text x={524} y={168} text="COMMIT" anchor="end" mono size={11.5} tone="gold" d={1800} />
      <Text x={280} y={150} text={`A + B = ${total(ok.final)}`} mono size={13} tone="success" d={2000} />
      <Mark x={356} y={150} ok d={2100} />
      {letters.map((l, i) => (
        <Box key={i} x={20 + i * 132} y={204} w={124} h={52} label={l} tone="navy" d={2300 + i * 150} />
      ))}
    </Svg>
  );
}

function Crash({ control }: { control: string }) {
  const crash = control === "crash";
  const ops: [string, number, number][] = [
    ["BEGIN", 20, 86],
    [`UPDATE A −${AMOUNT}`, 116, 150],
    [`UPDATE B +${AMOUNT}`, 276, 150],
    ["COMMIT", 436, 104],
  ];
  const done = crash ? 2 : 4;
  const log = crash ? ["T1 start", `T1 A: ${START.A} → ${crashed.afterDebit.A}`] : ["T1 start", `T1 A: ${START.A} → ${ok.afterDebit.A}`, `T1 B: ${START.B} → ${ok.final.B}`, "T1 commit"];
  const shown = crash ? crashed.beforeRecovery : ok.final;
  return (
    <Svg>
      {ops.map(([label, x, w], i) => (
        <Box key={i} x={x} y={18} w={w} h={38} r={8} label={label} mono size={11.5} tone={i < done ? "slate" : "ghost"} dashed={i >= done} d={i * 300} />
      ))}
      {crash ? <Chip x={276} y={74} text={bi("crash", "تعطّل")} tone="danger" center d={800} /> : null}
      <Box x={20} y={96} w={252} h={170} r={10} tone="outline" d={100} />
      <Text x={146} y={114} text={bi("Log on disk", "السجل على القرص")} tone="heading" size={12} d={100} />
      {log.map((l, i) => (
        <Text key={i} x={36} y={146 + i * 26} text={l} anchor="start" mono size={11.5} tone={l.includes("commit") ? "gold" : "text"} d={200 + i * 300} />
      ))}
      <Box x={296} y={96} w={116} h={52} label="A" sub={`${shown.A}`} mono tone="slate" d={300} />
      <Box x={428} y={96} w={116} h={52} label="B" sub={`${shown.B}`} mono tone="slate" d={300} />
      <Text x={420} y={168} text={`A + B = ${total(shown)}`} mono size={12.5} tone={crash ? "danger" : "success"} d={1200} />
      {crash ? (
        <>
          <Box x={296} y={186} w={248} h={74} label={bi("Restart: no COMMIT in the log", "إعادة التشغيل: لا COMMIT في السجل")} sub={bi(`undo A, back to ${crashed.final.A}`, `تراجع عن A وعودة إلى ${crashed.final.A}`)} tone="success" d={1800} />
          <Arrow pts={[[272, 172], [294, 210]]} tone="success" d={2100} dur={300} />
          <Fade d={2600}>
            <Box x={296} y={96} w={116} h={52} label="A" sub={`${crashed.final.A}`} mono tone="success" />
            <Box x={350} y={158} w={140} h={22} r={4} tone="outline" />
            <Text x={420} y={168} text={`A + B = ${total(crashed.final)}`} mono size={12.5} tone="success" />
          </Fade>
        </>
      ) : (
        <Mark x={496} y={168} ok d={1400} />
      )}
    </Svg>
  );
}

const OP_TONE: Record<TxEvent["op"], Tone> = { lock: "navy", unlock: "outline", read: "slate", write: "gold", wait: "warn" };

function opLabel(e: TxEvent) {
  if (e.op === "lock") return "lock A";
  if (e.op === "unlock") return "unlock A";
  if (e.op === "wait") return "wait…";
  return `${e.op} ${e.value}`;
}

function LostUpdate({ control }: { control: string }) {
  const locking = control === "lock";
  const run = deposits(START.A, AMOUNT, AMOUNT, locking);
  const n = run.events.length;
  const step = n > 5 ? 19 : 34;
  const top = 44;
  return (
    <Svg>
      <Text x={130} y={22} text="T1" mono size={13} tone="heading" d={0} />
      <Text x={430} y={22} text="T2" mono size={13} tone="heading" d={0} />
      <Text x={280} y={22} text={bi("A on disk", "A على القرص")} size={11.5} tone="muted" d={0} />
      <Arrow pts={[[280, 36], [280, top + n * step]]} tone="faint" dashed head={false} d={0} />
      {run.events.map((e, i) => {
        const y = top + i * step;
        const x = e.who === "T1" ? 60 : 360;
        return (
          <g key={i}>
            <Box x={x} y={y} w={140} h={step - 4} r={6} label={opLabel(e)} mono size={11} tone={OP_TONE[e.op]} d={200 + i * 300} />
            <Text x={280} y={y + (step - 4) / 2} text={`${e.db}`} mono size={11.5} tone={e.op === "write" ? "gold" : "muted"} d={200 + i * 300} />
          </g>
        );
      })}
      <Fade d={300 + n * 300}>
        <Box
          x={110}
          y={top + n * step + 6}
          w={340}
          h={52}
          label={run.lost ? `A = ${run.final}, expected ${run.correct}` : `A = ${run.final}`}
          sub={run.lost ? bi(`${run.lost} lost`, `ضاعت ${run.lost}`) : bi("both deposits kept", "حُفظ الإيداعان")}
          mono
          size={12}
          tone={run.lost ? "danger" : "success"}
        />
      </Fade>
    </Svg>
  );
}

function Deadlock({ control }: { control: string }) {
  const resolved = control === "resolved";
  return (
    <Svg>
      <Box x={100} y={40} w={90} h={46} label="A" mono size={15} tone="outline" d={0} />
      <Box x={400} y={40} w={90} h={46} label="B" mono size={15} tone="outline" d={100} />
      <Box x={100} y={176} w={90} h={46} label="T1" sub="A → B" mono tone="navy" d={200} />
      {resolved ? (
        <Box x={400} y={172} w={90} h={58} label="T2" sub={bi("victim", "الضحية")} mono tone="danger" d={300} />
      ) : (
        <Box x={400} y={176} w={90} h={46} label="T2" sub="B → A" mono tone="navy" d={300} />
      )}
      <Arrow pts={[[145, 88], [145, 172]]} tone="slate" d={500} label={bi("holds", "تحتجز")} labelAt={[110, 128]} labelTone="slate" />
      {resolved ? (
        <>
          <Arrow pts={[[400, 80], [192, 182]]} tone="gold" d={900} label={bi("B released, now held by T1", "تحرر B وتحتجزه T1 الآن")} labelAt={[262, 104]} labelTone="gold" />
          <Mark x={190} y={176} ok d={1300} />
          <Chip x={145} y={258} text="COMMIT" tone="success" center d={1500} />
          <Chip x={430} y={258} text={bi("rolled back, restarts later", "تراجع عنها وتبدأ لاحقًا")} tone="muted" center d={1700} />
        </>
      ) : (
        <>
          <Arrow pts={[[445, 88], [445, 172]]} tone="slate" d={650} label={bi("holds", "تحتجز")} labelAt={[480, 128]} labelTone="slate" />
          <Arrow pts={[[192, 180], [398, 84]]} tone="danger" dashed d={1000} />
          <Arrow pts={[[398, 180], [192, 84]]} tone="danger" dashed d={1250} />
          <Text x={295} y={100} text={bi("waits for", "تنتظر")} tone="danger" size={11} d={1300} />
          <Text x={295} y={256} text={bi("a cycle: deadlock", "دورة: جمود")} tone="danger" size={13} d={1600} />
        </>
      )}
    </Svg>
  );
}

function Durable() {
  return (
    <Svg>
      <Box x={40} y={30} w={210} h={76} label={bi("Memory buffers", "المخازن المؤقتة في الذاكرة")} sub={`A=${ok.final.A}  B=${ok.final.B}`} tone="slate" d={0} />
      <Arrow pts={[[140, 106], [136, 154]]} tone="gold" d={400} label={bi("COMMIT logged first", "تُسجَّل COMMIT أولًا")} labelAt={[244, 128]} labelTone="gold" />
      <Cylinder x={60} y={158} w={150} h={96} tone="gold" label={bi("Log", "السجل")} sub="T1 COMMIT" d={600} />
      <Cylinder x={350} y={158} w={160} h={96} tone="navy" label={bi("Data on disk", "البيانات على القرص")} sub={`A=${START.A}  B=${START.B}`} d={200} />
      <Chip x={420} y={62} text={bi("crash: memory lost", "تعطّل: ضاعت الذاكرة")} tone="danger" center d={1100} />
      <Fade d={1200}>
        <Box x={40} y={30} w={210} h={76} label={bi("Memory buffers", "المخازن المؤقتة في الذاكرة")} sub={bi("lost", "ضاعت")} tone="muted" />
      </Fade>
      <Arrow pts={[[212, 214], [346, 214]]} tone="success" d={1700} label={bi("redo from the log", "إعادة التنفيذ من السجل")} labelAt={[280, 192]} labelTone="success" />
      <Fade d={2300}>
        <Cylinder x={350} y={158} w={160} h={96} tone="success" label={bi("Data on disk", "البيانات على القرص")} sub={`A=${ok.final.A}  B=${ok.final.B}`} />
      </Fade>
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof transactions>>({
  acid: Acid,
  crash: Crash,
  "lost-update": LostUpdate,
  deadlock: Deadlock,
  durable: Durable,
});
