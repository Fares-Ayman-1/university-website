"use client";

import { chain, encoder, ik3, landings, meanOf, spreadOf, staircase, ENCODERS } from "@/lib/widgets/rob-lecture-02";
import type { performance } from "@/lib/walkthroughs/robotics/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, Mark, Svg, Table, Text, type PlotBox, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Bar, Chain, Claw, Dot, Floor, Pedestal, Poly, dir, screen, trackAll, useMotion } from "./local";
import w from "../../../../Walkthrough.module.css";

/** Pixels per millimetre on the dartboards. */
const SCALE = 32;

/** A target: rings 1, 2 and 3 mm out, and a cross on the given point. */
function Board({ c, d = 0 }: { c: Pt; d?: number }) {
  return (
    <In d={d}>
      <circle cx={c[0]} cy={c[1]} r={112} className={w.under} />
      <circle cx={c[0]} cy={c[1]} r={112} className={`${w.shape} ${w.outline}`} />
      {[1, 2, 3].map((mm) => (
        <circle key={mm} cx={c[0]} cy={c[1]} r={mm * SCALE} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 1.2 }} />
      ))}
      <path d={`M${c[0] - 9},${c[1]} H${c[0] + 9} M${c[0]},${c[1] - 9} V${c[1] + 9}`} className={`${w.line} ${w.danger}`} style={{ strokeWidth: 2.4 }} />
    </In>
  );
}

const VERDICT: Record<string, Bi> = {
  "tight-off": bi("repeatable, not accurate", "متكرر لكنه غير دقيق"),
  "wide-on": bi("accurate on average only", "دقيق في المتوسط فقط"),
  "tight-on": bi("accurate and repeatable", "دقيق ومتكرر"),
  "wide-off": bi("neither", "لا هذا ولا ذاك"),
};

function Dartboard({ control }: { control: string }) {
  const C: Pt = [150, 140];
  const px = (q: Pt): Pt => [C[0] + q[0] * SCALE, C[1] - q[1] * SCALE];
  const pts = landings(control);
  const m = meanOf(pts);
  const spread = spreadOf(pts);
  const accurate = Math.hypot(m[0], m[1]) < 0.5;
  const repeatable = spread < 0.6;
  const both = accurate && repeatable;
  return (
    <Svg>
      <Board c={C} />
      {pts.map((q, i) => (
        <Fade key={i} d={400 + i * 110}>
          <Dot at={px(q)} r={4} tone="navy" />
        </Fade>
      ))}
      {Math.hypot(m[0], m[1]) > 0.4 ? <Arrow pts={[C, px(m)]} tone="gold" d={1700} width={2.6} /> : null}
      <Fade d={1900}>
        <circle cx={px(m)[0]} cy={px(m)[1]} r={spread * SCALE + 7} className={`${w.line} ${w.slate} ${w.dashed}`} />
      </Fade>
      <Box x={298} y={36} w={206} h={66} label={bi("Accuracy", "الدقة")} sub={bi("gold arrow: off target", "السهم الذهبي: البُعد عن الهدف")} tone="outline" d={200} />
      <Mark x={526} y={69} ok={accurate} d={2100} />
      <Box x={298} y={122} w={206} h={66} label={bi("Repeatability", "التكرارية")} sub={bi("dashed ring: spread", "الحلقة المتقطعة: التشتت")} tone="outline" d={300} />
      <Mark x={526} y={155} ok={repeatable} d={2200} />
      <Chip x={412} y={234} text={VERDICT[control] ?? VERDICT["tight-off"]} tone={both ? "success" : accurate || repeatable ? "gold" : "danger"} center d={2400} />
    </Svg>
  );
}

/* ---------- A calculated point or a taught one ---------- */

const ERRORS: readonly Bi[] = [
  bi("Computational errors", "أخطاء الحساب"),
  bi("Machining accuracy", "دقة التشغيل الآلي"),
  bi("Link flexibility", "مرونة الوصلات"),
  bi("Gear backlash", "الخلوص في التروس"),
  bi("Static and dynamic effects", "التأثيرات الساكنة والديناميكية"),
];

const S: Pt = [80, 158];
const LEN = [80, 70, 30] as const;

function Errors({ control }: { control: string }) {
  const cad = control === "cad";
  const target: Pt = [215, 205];
  const landed: Pt = cad ? [226, 197] : target;
  const toMath = (q: Pt): Pt => [q[0] - S[0], S[1] - q[1]];
  const home: Pt = [70, 20];
  const goal = toMath(landed);
  const frames = Array.from({ length: 11 }, (_, i) => ik3(LEN, [home[0] + ((goal[0] - home[0]) * i) / 10, home[1] + ((goal[1] - home[1]) * i) / 10], -90));
  const p = useMotion(500, 1500);
  const pts = chain([0, 0], LEN, trackAll(frames, p)).map((q) => screen(S, q));
  const [, elbow, wrist, tip] = pts;
  return (
    <Svg>
      <Floor x={14} y={262} w={300} d={0} />
      <Poly pts={[[166, 212], [304, 212], [304, 222], [166, 222]]} tone="muted" d={0} />
      <Bar a={[176, 222]} b={[176, 262]} t={5} tone="muted" />
      <Bar a={[294, 222]} b={[294, 262]} t={5} tone="muted" />
      <Pedestal x={S[0]} top={S[1] + 12} floor={262} wTop={36} wBottom={62} d={0} />
      {cad ? (
        <Fade d={100}>
          <path d={`M${target[0] - 7},${target[1]} H${target[0] + 7} M${target[0]},${target[1] - 7} V${target[1] + 7}`} className={`${w.line} ${w.navy}`} style={{ strokeWidth: 2.4 }} />
        </Fade>
      ) : (
        <Fade d={100}>
          <circle cx={target[0]} cy={target[1]} r={6} className={`${w.line} ${w.success}`} style={{ strokeWidth: 2.4 }} />
        </Fade>
      )}
      <Chain pts={[S, elbow, wrist]} t={[14, 11]} />
      <Bar a={wrist} b={dir(tip, -14, -90)} t={6} tone="navy" />
      <Claw at={dir(tip, -14, -90)} angle={-90} open={0.6} size={0.85} grip={8} />
      <Text x={235} y={242} text={cad ? bi("CAD coordinate", "إحداثي CAD") : bi("taught point", "نقطة مُعلَّمة")} tone={cad ? "heading" : "success"} size={10.5} d={300} />
      {cad ? <Arrow pts={[target, landed]} tone="danger" d={2100} dur={300} width={2.4} /> : null}
      {ERRORS.map((e, i) => (
        <Box key={i} x={330} y={12 + i * 40} w={214} h={36} label={e} tone={cad ? "danger" : "muted"} size={11} d={600 + i * 150} />
      ))}
      {cad ? null : (
        <Fade d={1500}>
          {ERRORS.map((_, i) => (
            <path key={i} d={`M340,${30 + i * 40} H534`} className={`${w.line} ${w.success}`} style={{ strokeWidth: 1.6 }} />
          ))}
        </Fade>
      )}
      <Box
        x={330}
        y={214}
        w={214}
        h={60}
        label={cad ? bi("They add up", "تتراكم") : bi("Same on every visit: they cancel", "متطابقة في كل زيارة: تلغي بعضها")}
        sub={cad ? bi("an offset at the tool", "إزاحة عند الأداة") : bi("left: controller resolution", "يبقى: استبانة المتحكِّم")}
        tone={cad ? "danger" : "success"}
        size={11.5}
        d={1900}
      />
    </Svg>
  );
}

/* ---------- Calibration ---------- */

function Calibrate({ control }: { control: string }) {
  const wide = control === "wide";
  const C: Pt = [150, 130];
  const px = (q: Pt): Pt => [C[0] + q[0] * SCALE, C[1] - q[1] * SCALE];
  const pts = landings(wide ? "wide-off" : "tight-off");
  const m = meanOf(pts);
  const spread = spreadOf(pts);
  const p = useMotion(1500, 1300);
  const shift: Pt = [-m[0] * SCALE * p, m[1] * SCALE * p];
  const mEnd = px([0, 0]);
  return (
    <Svg>
      <Board c={C} />
      {pts.map((q, i) => (
        <Fade key={i} d={300 + i * 60}>
          <circle cx={px(q)[0]} cy={px(q)[1]} r={4} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 1.4 }} />
        </Fade>
      ))}
      <Arrow pts={[px(m), mEnd]} tone="gold" d={1000} dur={450} width={2.6} />
      <g transform={`translate(${shift[0].toFixed(2)} ${shift[1].toFixed(2)})`}>
        {pts.map((q, i) => (
          <Fade key={i} d={300 + i * 60}>
            <Dot at={px(q)} r={4.6} tone="navy" />
          </Fade>
        ))}
      </g>
      <Fade d={2900}>
        <circle cx={mEnd[0]} cy={mEnd[1]} r={spread * SCALE + 7} className={`${w.line} ${w.slate} ${w.dashed}`} />
      </Fade>
      <Text x={150} y={257} text={bi("hollow: before · filled: after", "المفرّغة: قبل · الممتلئة: بعد")} tone="muted" size={10.5} d={800} />
      <Box x={298} y={36} w={206} h={66} label={bi("Offset", "الإزاحة")} sub={bi("removed by calibration", "تُزال بالمعايرة")} tone="outline" d={200} />
      <Mark x={526} y={69} ok d={2800} />
      <Box x={298} y={122} w={206} h={66} label={bi("Spread", "التشتت")} sub={wide ? bi("unchanged: still wide", "لم يتغير: ما زال واسعًا") : bi("already small", "صغير أصلًا")} tone="outline" d={300} />
      <Mark x={526} y={155} ok={!wide} d={3000} />
      <Chip x={412} y={234} text={wide ? bi("still not repeatable", "ما زال غير متكرر") : bi("now accurate and repeatable", "صار دقيقًا ومتكررًا")} tone={wide ? "danger" : "success"} center d={3200} />
    </Svg>
  );
}

/* ---------- Resolution ---------- */

function Resolution({ control }: { control: string }) {
  const e = encoder(control);
  const p = useMotion(300, 1800);
  const box: PlotBox = { x: 330, y: 46, w: 190, h: 168, domain: [0, 1], range: [0, 1] };
  const cx = 44 + 168 * p;
  return (
    <Svg>
      <Text x={145} y={26} text={bi("n-bit encoder: 2ⁿ positions", "مُرمِّز n بت: 2ⁿ موضعًا")} tone="heading" size={12} d={0} />
      <Bar a={[30, 70]} b={[262, 70]} t={9} tone="muted" d={0} />
      <Box x={cx - 18} y={57} w={36} h={26} r={4} tone="gold" />
      <Text x={30} y={94} text="0" size={10.5} mono tone="muted" d={100} />
      <Text x={262} y={94} text="1000 mm" size={10.5} mono tone="muted" anchor="end" d={100} />
      <Table
        x={30}
        y={114}
        cols={["bits", "2ⁿ", "step (mm)"]}
        rows={ENCODERS.map((x) => {
          const v = encoder(x.id);
          return [String(v.bits), String(v.states), v.label];
        })}
        cw={[60, 80, 92]}
        rh={26}
        d={200}
        cell={(r) => (ENCODERS[r].id === e.id ? "gold" : undefined)}
      />
      <Chip x={146} y={250} text={`1000 ÷ ${e.states} ≈ ${e.label} mm`} tone="navy" center d={900} />
      <Curve box={box} axes points={[]} d={100} />
      <Curve box={box} points={[[0, 0], [1, 1]]} tone="faint" dashed d={300} />
      <Curve box={box} points={staircase(e.step)} tone="gold" width={2.6} d={600} dur={1300} />
      <Text x={322} y={box.y + box.h + 10} text="0" size={10.5} mono tone="muted" anchor="end" d={200} />
      <Text x={box.x + box.w} y={box.y + box.h + 12} text="1" size={10.5} mono tone="muted" d={200} />
      <Text x={322} y={box.y} text="1" size={10.5} mono tone="muted" anchor="end" d={200} />
      <Text x={338} y={30} text={bi("sensed position", "الموضع المُستشعَر")} tone="muted" size={10.5} anchor="start" d={200} />
      <Text x={425} y={248} text={bi("true travel, first 1 mm", "الحركة الحقيقية، أول 1 مم")} tone="muted" size={10.5} d={200} />
      {e.bits === 8 ? <Text x={425} y={150} text={bi("no step inside 1 mm", "لا خطوة واحدة خلال 1 مم")} tone="danger" size={11} d={1500} /> : null}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof performance>>({
  dartboard: Dartboard,
  errors: Errors,
  calibrate: Calibrate,
  resolution: Resolution,
});
