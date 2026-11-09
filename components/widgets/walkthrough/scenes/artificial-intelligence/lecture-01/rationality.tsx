"use client";

import type { rationality } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import { REFLEX_RUN, STATE_RUN, showPercept, stepPoints, sum, type Action, type MeasureId } from "@/lib/widgets/ai-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Fade, Mark, Svg, Text, Token, fmt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dirt, Glide, Robot, Square, Vanish } from "./local";

const MEASURE_TEXT = {
  cleaned: bi("1 point per square cleaned", "نقطة لكل مربع يُنظَّف"),
  "clean-moves": bi("1 point per clean square per step, minus 1 per move", "نقطة لكل مربع نظيف في كل خطوة، مع خصم نقطة لكل حركة"),
  penalty: bi("minus 1 for every step while a square is dirty", "خصم نقطة عن كل خطوة يبقى فيها مربع متسخ"),
} as const;

const actionTone = (a: Action): Tone => (a === "Suck" ? "navy" : a === "NoOp" ? "gold" : "outline");
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

function Measure({ control }: { control: string }) {
  const measure = (control in MEASURE_TEXT ? control : "cleaned") as MeasureId;
  const rows = [
    { label: bi("Reflex agent", "الوكيل الانعكاسي"), run: REFLEX_RUN, y: 68 },
    { label: bi("Agent with state", "الوكيل ذو الحالة"), run: STATE_RUN, y: 160 },
  ].map((r) => ({ ...r, points: stepPoints(r.run, measure) }));
  const totals = rows.map((r) => sum(r.points));
  const best = Math.max(...totals);
  const tie = totals[0] === totals[1];
  const sx = (i: number) => 160 + i * 56;
  return (
    <Svg>
      <Text x={280} y={20} text={MEASURE_TEXT[measure]} tone="gold" size={12} d={0} />
      {rows[0].run.map((s, i) => (
        <Text key={i} x={sx(i)} y={52} text={`t${s.t}`} mono size={10.5} tone="muted" d={100} />
      ))}
      <Text x={516} y={44} text={bi("total", "المجموع")} size={10.5} tone="muted" d={100} />
      {rows.map((r, ri) => (
        <g key={ri}>
          <Box x={10} y={r.y} w={118} h={56} label={r.label} tone="slate" size={11.5} d={200 + ri * 100} />
          {r.run.map((s, i) => (
            <g key={i}>
              <Chip x={sx(i)} y={r.y + 16} w={52} text={s.action} tone={actionTone(s.action)} size={11} center d={350 + i * 160 + ri * 60} />
              <Text
                x={sx(i)}
                y={r.y + 44}
                text={signed(r.points[i])}
                mono
                size={12}
                tone={r.points[i] > 0 ? "success" : r.points[i] < 0 ? "danger" : "muted"}
                d={500 + i * 160 + ri * 60}
              />
            </g>
          ))}
          <Box x={484} y={r.y} w={64} h={56} label={fmt(totals[ri])} mono size={18} tone={!tie && totals[ri] === best ? "gold" : "outline"} d={1500 + ri * 150} />
        </g>
      ))}
      <Chip
        x={280}
        y={252}
        text={tie ? bi("a tie: this measure can't tell them apart", "تعادل: لا يميّز هذا المقياس بينهما") : bi("the agent with state wins: its NoOp saves moves", "يفوز الوكيل ذو الحالة: يوفّر NoOp الحركات")}
        tone={tie ? "muted" : "gold"}
        size={11}
        center
        d={1900}
      />
    </Svg>
  );
}

const A = { x: 30, y: 60, w: 170, h: 130 };
const B = { x: 210, y: 60, w: 170, h: 130 };

function Omniscient({ control }: { control: string }) {
  const omniscient = control === "omniscient";
  const ay = 140;
  return (
    <Svg>
      <Square {...A} name="A" d={0} />
      <Square {...B} name="B" d={0} />
      <Chip x={115} y={36} text={showPercept(["A", "Clean"])} tone="gold" center d={200} />
      {omniscient ? (
        <>
          <Fade d={300}>
            <rect x={B.x + 6} y={B.y + 6} width={B.w - 12} height={B.h - 12} rx={6} fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 4" />
          </Fade>
          <Robot x={115} y={ay} r={18} d={100} />
          <Chip x={115} y={232} w={70} text="NoOp" tone="gold" center d={900} />
          <Box x={400} y={52} w={148} h={68} label={bi("Knows the outcome", "يعرف النتيجة")} sub={bi("B is clean", "المربع B نظيف")} tone="navy" size={11.5} d={500} />
          <Box x={400} y={132} w={148} h={68} label={bi("Best actual action", "أفضل فعل فعليًا")} sub="NoOp" tone="outline" size={11.5} d={800} />
          <Chip x={474} y={240} text={bi("impossible in reality", "مستحيل في الواقع")} tone="danger" size={11} center d={1200} />
        </>
      ) : (
        <>
          <Vanish at={1500}>
            <Box x={B.x + 6} y={B.y + 6} w={B.w - 12} h={B.h - 12} r={6} tone="muted" dashed label="?" size={30} d={100} />
          </Vanish>
          <Glide stops={[[115, ay], [295, ay]]} at={[1000]} move={500}>
            <Robot x={115} y={ay} r={18} d={100} />
          </Glide>
          <Arrow pts={[[140, 210], [270, 210]]} tone="gold" d={700} dur={300} label="Right" labelAt={[205, 226]} labelTone="gold" />
          <Box x={400} y={52} w={148} h={68} label={bi("Best expected action", "أفضل فعل متوقَّع")} sub={bi("B might be dirty", "قد يكون B متسخًا")} tone="navy" size={11.5} d={500} />
          <Mark x={548} y={52} ok d={800} />
          <Box x={400} y={132} w={148} h={68} label={bi("Actual outcome", "النتيجة الفعلية")} sub={bi("B was clean", "كان B نظيفًا")} tone="warn" size={11.5} d={1700} />
          <Mark x={548} y={132} ok={false} d={1900} />
          <Chip x={474} y={240} text={bi("still rational", "يبقى عقلانيًا")} tone="success" size={11} center d={2100} />
        </>
      )}
    </Svg>
  );
}

function Outcome({ control }: { control: string }) {
  const surprise = control === "surprise";
  return (
    <Svg>
      <Square x={24} y={56} w={200} h={150} name="A" d={0} />
      <Vanish at={1300}>
        <Dirt x={124} y={176} d={100} />
      </Vanish>
      <Robot x={124} y={124} r={18} d={150} />
      <Chip x={124} y={30} text={showPercept(["A", "Dirty"])} tone="gold" center d={300} />
      <Arrow pts={[[226, 130], [262, 130]]} tone="slate" d={600} dur={250} />
      <Box x={264} y={100} w={110} h={60} label="Suck" sub={bi("best choice", "أفضل اختيار")} tone="navy" size={14} d={700} />
      <Arrow pts={[[376, 130], [408, 130]]} tone={surprise ? "danger" : "success"} d={1200} dur={250} />
      {surprise ? (
        <>
          <Token pts={[[180, 60], [180, 150]]} d={1900} dur={500} tone="danger" />
          <Dirt x={170} y={176} d={2300} />
          <Box x={410} y={96} w={138} h={68} label={bi("Dirt is back", "عادت الأوساخ")} sub={bi("not as expected", "على غير المتوقَّع")} tone="danger" size={12} d={2400} />
          <Mark x={548} y={96} ok={false} d={2600} />
        </>
      ) : (
        <>
          <Box x={410} y={96} w={138} h={68} label={bi("A is clean", "المربع A نظيف")} sub={bi("as expected", "كما هو متوقَّع")} tone="success" size={12} d={1500} />
          <Mark x={548} y={96} ok d={1700} />
        </>
      )}
      <Chip x={180} y={250} w={170} text={bi("rational: yes", "عقلاني: نعم")} tone="success" size={11.5} center d={surprise ? 2800 : 1900} />
      <Chip
        x={390}
        y={250}
        w={170}
        text={surprise ? bi("successful: no", "ناجح: لا") : bi("successful: yes", "ناجح: نعم")}
        tone={surprise ? "danger" : "success"}
        size={11.5}
        center
        d={surprise ? 3000 : 2100}
      />
    </Svg>
  );
}

function WhatYouWant({ control }: { control: string }) {
  const dirt = control === "dirt";
  const actions = dirt ? ["Suck", "Dump", "Suck", "Dump", "Suck", "Dump"] : ["Suck", "NoOp", "NoOp", "NoOp", "NoOp", "NoOp"];
  const clean = actions.map((a) => a !== "Dump");
  const reward = actions.map((a, i) => (dirt ? (a === "Suck" ? 1 : 0) : clean[i] ? 1 : 0));
  const cumulative = reward.map((_, i) => sum(reward.slice(0, i + 1)));
  const sx = (i: number) => 186 + i * 60;
  return (
    <Svg>
      <Text x={280} y={20} text={dirt ? bi("Reward: 1 point per suck", "المكافأة: نقطة لكل عملية شفط") : bi("Reward: 1 point per step the floor is clean", "المكافأة: نقطة لكل خطوة تكون فيها الأرضية نظيفة")} tone="gold" size={12} d={0} />
      <Text x={20} y={58} text={bi("Action", "الفعل")} anchor="start" tone="heading" size={12} d={100} />
      <Text x={20} y={110} text={bi("Floor clean?", "الأرضية نظيفة؟")} anchor="start" tone="heading" size={12} d={100} />
      <Text x={20} y={196} text={bi("Score so far", "النتيجة حتى الآن")} anchor="start" tone="heading" size={12} d={100} />
      {actions.map((a, i) => (
        <g key={i}>
          <Chip x={sx(i)} y={62} w={56} text={a} tone={a === "Dump" ? "danger" : a === "Suck" ? "navy" : "gold"} size={11} center d={200 + i * 260} />
          <Mark x={sx(i)} y={114} ok={clean[i]} r={10} d={320 + i * 260} />
        </g>
      ))}
      <Bars x={sx(0) - 30} y={140} w={360} h={90} values={cumulative} max={6} showValues tone={dirt ? "warn" : "success"} d={300} stagger={260} />
      <Chip
        x={366}
        y={256}
        text={dirt ? bi("the score climbs, the floor never stays clean", "ترتفع النتيجة ولا تبقى الأرضية نظيفة") : bi("the score follows what you want", "تتبع النتيجة ما تريده فعلًا")}
        tone={dirt ? "danger" : "success"}
        size={11}
        center
        d={1900}
      />
    </Svg>
  );
}

function Autonomy({ control }: { control: string }) {
  const own = control === "own";
  const y = 152;
  return (
    <Svg>
      <Square x={24} y={86} w={170} h={130} name="A" d={0} />
      <Square x={204} y={86} w={170} h={130} name="B" d={0} />
      <Text x={474} y={24} text={bi("What the robot believes", "ما يعتقده الروبوت")} tone="heading" size={12} d={0} />
      <Box x={400} y={48} w={148} h={68} label={bi("Dirt only in A", "الأوساخ في A فقط")} sub={bi("built in by the designer", "أدمجها المصمم")} tone="outline" size={11.5} d={200} />
      {own ? (
        <>
          <Vanish at={2100}>
            <Dirt x={290} y={186} d={400} />
          </Vanish>
          <Glide stops={[[109, y], [289, y]]} at={[700]} move={600}>
            <Robot x={109} y={y} r={18} d={100} />
          </Glide>
          <Arrow pts={[[130, 236], [270, 236]]} tone="gold" d={600} dur={300} label={bi("goes to look", "يذهب ليتحقق")} labelAt={[200, 252]} labelTone="gold" />
          <Mark x={548} y={48} ok={false} d={1600} />
          <Box x={400} y={136} w={148} h={68} label={bi("Dirt in A and B", "الأوساخ في A و B")} sub={bi("learned from percepts", "تعلّمها من إدراكاته")} tone="success" size={11.5} d={1700} />
          <Mark x={548} y={136} ok d={1900} />
          <Chip x={474} y={244} text={bi("explores and learns", "يستكشف ويتعلّم")} tone="success" size={11} center d={2300} />
        </>
      ) : (
        <>
          <Dirt x={290} y={186} d={600} />
          <Dirt x={260} y={130} d={1300} />
          <Robot x={109} y={y} r={18} d={100} />
          <Chip x={109} y={62} w={70} text="NoOp" tone="gold" center d={900} />
          <Chip x={474} y={244} text={bi("B is never checked", "لا يُفحص B أبدًا")} tone="danger" size={11} center d={1700} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof rationality>>({
  measure: Measure,
  omniscient: Omniscient,
  outcome: Outcome,
  "what-you-want": WhatYouWant,
  autonomy: Autonomy,
});
