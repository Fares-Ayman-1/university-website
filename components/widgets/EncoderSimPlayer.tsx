"use client";

import { Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArLine } from "@/components/mdx/Arabic";
import {
  abAt,
  abString,
  absoluteStep,
  bitString,
  binaryToGray,
  channelA,
  channelB,
  countedBy,
  countToDegrees,
  crossingAt,
  detectorAngles,
  DRAWN_SLOTS,
  encodeSector,
  grayToBinary,
  initialIncremental,
  isMisread,
  popcount,
  quarterIndex,
  readWord,
  sectorAngle,
  sectorAt,
  sectorCentre,
  skewOffsets,
  slotPeriod,
  stepBy,
  turnTo,
  type AB,
  type Code,
  type Direction,
  type EncoderMode,
  type IncrementalState,
} from "@/lib/widgets/encoder";
import { BiText } from "./BiText";
import { UI } from "./i18n";
import { bi, type Bi } from "./types";
import { usePrefersReducedMotion } from "./useStepper";
import css from "./EncoderSim.module.css";
import styles from "./widgets.module.css";

const SLOTS = DRAWN_SLOTS;
const HISTORY = 16; // states shown in the pulse-train plot
const SPEED = 25; // deg/s while playing: one quadrature state every 0.3 s on the drawn disc
const REDUCED_INTERVAL = 600; // ms per state when the visitor prefers reduced motion

const T = {
  type: bi("Encoder", "المُرمِّز"),
  incremental: bi("Incremental", "تزايدي"),
  absolute: bi("Absolute", "مطلق"),
  playDirection: bi("Play direction", "اتجاه التشغيل"),
  forward: bi("Forward", "للأمام"),
  backward: bi("Backward", "للخلف"),
  stepBack: bi("Step backward one state", "خطوة للخلف بحالة واحدة"),
  stepForward: bi("Step forward one state", "خطوة للأمام بحالة واحدة"),
  abState: bi("AB state", "الحالة AB"),
  direction: bi("Direction", "الاتجاه"),
  count1: bi("Count ×1", "العدّ ×1"),
  count2: bi("Count ×2", "العدّ ×2"),
  count4: bi("Count ×4", "العدّ ×4"),
  angle: bi("Angle", "الزاوية"),
  notYet: bi("Not moved yet", "لم يتحرك بعد"),
  forwardLead: bi("Forward: B leads A", "للأمام: تتقدم B على A"),
  backwardLead: bi("Backward: A leads B", "للخلف: تتقدم A على B"),
  plot: bi("Pulse trains A and B, one column per state (newest on the right)", "قطارا النبضات A و B، عمود لكل حالة (الأحدث على اليمين)"),
  discIncremental: bi(
    "Slotted encoder disc with detectors A and B. Drag to turn it, or use the left and right arrow keys.",
    "قرص المُرمِّز ذو الفتحات مع الكاشفين A و B. اسحبه لتدويره، أو استخدم مفتاحي السهمين الأيسر والأيمن.",
  ),
  discAbsolute: bi(
    "Absolute encoder disc with one detector per track. Drag to turn it, or use the left and right arrow keys.",
    "قرص المُرمِّز المطلق مع كاشف لكل مسار. اسحبه لتدويره، أو استخدم مفتاحي السهمين الأيسر والأيمن.",
  ),
  pattern: bi("Disc pattern", "نمط القرص"),
  binary: bi("Binary", "ثنائي"),
  gray: bi("Gray", "جراي"),
  skew: bi("Detector skew", "انحراف الكواشف"),
  sector: bi("Sector", "القطاع"),
  binaryReads: bi("Binary disc reads", "يقرأ القرص الثنائي"),
  grayReads: bi("Gray disc reads", "يقرأ قرص جراي"),
  misread: bi("Misread", "قراءة خاطئة"),
  stepBackAbs: bi("Step backward", "خطوة للخلف"),
  stepForwardAbs: bi("Step forward", "خطوة للأمام"),
  resetAbs: bi("Back to the starting sector", "العودة إلى قطاع البداية"),
} as const;

const label = (text: Bi) => `${text.en} · ${text.ar}`;
const signed = (n: number) => (n < 0 ? `−${-n}` : String(n));
const deg = (x: number) => {
  const s = x.toFixed(3).replace(/\.?0+$/, "");
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
};
const bitsAr = (k: number) => (k === 1 ? "بِتًا واحدًا" : k === 2 ? "بِتَّين" : `${k} بتات`);
const bitsEn = (k: number) => (k === 1 ? "1 bit" : `${k} bits`);

// ---------------------------------------------------------------- SVG geometry

const VIEW = 260;
const C = VIEW / 2;
const TOP = -90; // detectors read at 12 o'clock
const fx = (n: number) => n.toFixed(2);
const polar = (r: number, a: number): [number, number] => [C + r * Math.cos((a * Math.PI) / 180), C + r * Math.sin((a * Math.PI) / 180)];

/** Annular sector between radii r1 < r2, from angle a0 clockwise to a1 (a0 < a1). */
function ring(r1: number, r2: number, a0: number, a1: number): string {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(r2, a0);
  const [x1, y1] = polar(r2, a1);
  const [x2, y2] = polar(r1, a1);
  const [x3, y3] = polar(r1, a0);
  return `M${fx(x0)} ${fx(y0)}A${r2} ${r2} 0 ${large} 1 ${fx(x1)} ${fx(y1)}L${fx(x2)} ${fx(y2)}A${r1} ${r1} 0 ${large} 0 ${fx(x3)} ${fx(y3)}Z`;
}

/** A small detector window centred at (r, a), long side along the radius. */
function detectorRect(r: number, a: number, length: number) {
  const [x, y] = polar(r, a);
  return { x: -3.5, y: -length / 2, width: 7, height: length, rx: 2, transform: `translate(${fx(x)} ${fx(y)}) rotate(${fx(a + 90)})` };
}

// Incremental disc: slots on a ring, detectors A and B a quarter period apart at the top.
const R_FACE = 112;
const R_SLOT_IN = 80;
const R_SLOT_OUT = 104;
const R_DETECTOR = (R_SLOT_IN + R_SLOT_OUT) / 2;
const R_LABEL = 121;
const PERIOD = slotPeriod(SLOTS);
const DETECTORS = detectorAngles(SLOTS, TOP);
const OPENINGS = Array.from({ length: SLOTS }, (_, k) =>
  ring(R_SLOT_IN, R_SLOT_OUT, DETECTORS.a + k * PERIOD, DETECTORS.a + k * PERIOD + PERIOD / 2),
);

// Absolute disc: one concentric track per bit, MSB innermost.
const R_IN = 30;
const R_OUT = 102;
const R_SECTOR_LABEL = 114;

function absoluteTracks(bits: number, code: Code) {
  const N = 2 ** bits;
  const S = sectorAngle(bits);
  const width = (R_OUT - R_IN) / bits;
  return Array.from({ length: bits }, (_, k) => {
    const inner = R_IN + (bits - 1 - k) * width;
    // Runs of neighbouring sectors whose bit k is 1, drawn as one arc each (no seams).
    const runs: [number, number][] = [];
    for (let s = 0; s < N; s++) {
      if (!((encodeSector(s, code) >> k) & 1)) continue;
      const last = runs[runs.length - 1];
      if (last && last[1] === s - 1) last[1] = s;
      else runs.push([s, s]);
    }
    if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][1] === N - 1) {
      const wrap = runs.pop()!;
      runs[0] = [wrap[0] - N, runs[0][1]];
    }
    // Sector s spans TOP − (s + 1)·S … TOP − s·S in the disc's frame (counting anticlockwise).
    const paths = runs.map(([a, b]) => ring(inner, inner + width, TOP - (b + 1) * S, TOP - a * S));
    return { bit: k, inner, outer: inner + width, mid: inner + width / 2, paths };
  });
}

// ---------------------------------------------------------------- status lines

function incrementalStatus(state: IncrementalState, playing: boolean, direction: Direction): Bi {
  if (playing) {
    return direction > 0
      ? bi(
          "Turning forward: every change of A or B adds +1 to the ×4 count. Pause or step to read each transition.",
          "يدور القرص للأمام: كل تغيّر في A أو B يضيف +1 إلى العدّ ×4. أوقفه مؤقتًا أو تقدّم خطوة خطوة لقراءة كل انتقال.",
        )
      : bi(
          "Turning backward: every change of A or B adds −1 to the ×4 count. Pause or step to read each transition.",
          "يدور القرص للخلف: كل تغيّر في A أو B يضيف −1 إلى العدّ ×4. أوقفه مؤقتًا أو تقدّم خطوة خطوة لقراءة كل انتقال.",
        );
  }
  if (!state.last) {
    return bi(
      "Drag the disc or step it. Each change of A or B is one quadrature state, and the STEP table turns it into +1 or −1.",
      "اسحب القرص أو حرّكه خطوة خطوة. كل تغيّر في A أو B هو حالة واحدة من حالات الترميز التربيعي (quadrature)، ويحوّله جدول STEP إلى +1 أو −1.",
    );
  }
  const { prev, cur, step } = state.last;
  const onA = ((prev ^ cur) & 0b10) !== 0;
  const channel = onA ? "A" : "B";
  const rising = (onA ? channelA(cur) : channelB(cur)) === 1;
  const by = countedBy(prev, cur);
  const move = `${abString(prev)} → ${abString(cur)}`;
  const stepEn = step > 0 ? "+1 (forward)" : "−1 (backward)";
  const stepAr = step > 0 ? "+1 (للأمام)" : "−1 (للخلف)";
  const counted = !by.x2
    ? bi("Only ×4 counts it: ×1 and ×2 watch channel A.", "لا يعدّه إلا ×4، لأن ×1 و ×2 يراقبان القناة A فقط.")
    : by.x1
      ? bi("×4, ×2 and ×1 all count it: it is the edge of A that ×1 uses.", "يعدّه ×4 و ×2 و ×1 جميعًا: فهذه هي حافة A التي يعتمد عليها ×1.")
      : bi("×4 and ×2 count it; ×1 uses only one edge of A per slot.", "يعدّه ×4 و ×2؛ أما ×1 فلا يستخدم إلا حافة واحدة من A في كل فتحة.");
  return bi(
    `${move}: ${channel} ${rising ? "rises" : "falls"}, so STEP gives ${stepEn}. ${counted.en}`,
    `${move}: ${rising ? "حافة صاعدة" : "حافة هابطة"} على القناة ${channel}، فيعطي STEP القيمة ${stepAr}. ${counted.ar}`,
  );
}

function absoluteStatus(theta: number, bits: number, skew: boolean): Bi {
  const S = sectorAngle(bits);
  const N = 2 ** bits;
  const sector = sectorAt(theta, bits);
  const bs = (w: number) => bitString(w, bits);
  const gs = (s: number) => bs(binaryToGray(s));
  const range = `${deg(sector * S)}°–${deg((sector + 1) * S)}°`;
  if (!skew) {
    return bi(
      `Sector ${sector} (${range}): binary ${bs(sector)}, Gray ${gs(sector)}. All detectors sit on one radius, so both discs read the true sector.`,
      `القطاع ${sector} (${range}): الثنائي ${bs(sector)}، وجراي ${gs(sector)}. تقع الكواشف كلها على نصف قطر واحد، لذا يقرأ القرصان القطاع الصحيح.`,
    );
  }
  const boundary = crossingAt(theta, bits);
  if (boundary === null) {
    return bi(
      `Detectors skewed (exaggerated here): each sits at a slightly different angle. Inside sector ${sector} they still agree (binary ${bs(sector)}, Gray ${gs(sector)}); step or drag across a boundary.`,
      `الكواشف منحرفة (skewed) بشكل مبالغ فيه هنا: يقع كل منها عند زاوية مختلفة قليلًا. وداخل القطاع ${sector} تظل متفقة (الثنائي ${bs(sector)}، وجراي ${gs(sector)})؛ تقدّم خطوة أو اسحب القرص عبر أحد الحدود.`,
    );
  }
  const lo = (((boundary - 1) % N) + N) % N;
  const hi = ((boundary % N) + N) % N;
  const changed = popcount(lo ^ hi);
  const binary = readWord(theta, "binary", bits, true);
  const gray = grayToBinary(readWord(theta, "gray", bits, true));
  if (isMisread(theta, binary, "binary", bits, true)) {
    return bi(
      `Crossing ${lo} ↔ ${hi}: binary changes ${bitsEn(changed)} (${bs(lo)} → ${bs(hi)}) and the skewed detectors don't switch together, so the binary disc reads ${bs(binary)} = sector ${binary}. Gray changes 1 bit (${gs(lo)} → ${gs(hi)}), so it reads ${gray}, never more than one step off.`,
      `عبور الحدّ بين ${lo} و ${hi}: يغيّر الترميز الثنائي ${bitsAr(changed)} (${bs(lo)} → ${bs(hi)})، ولا تتبدّل الكواشف المنحرفة معًا، لذا يقرأ القرص الثنائي ${bs(binary)} = القطاع ${binary}. أما شفرة جراي (Gray code) فتغيّر بِتًا واحدًا (${gs(lo)} → ${gs(hi)})، فيقرأ قرصها ${gray}، ولا يتجاوز الخطأ خطوة واحدة أبدًا.`,
    );
  }
  return bi(
    `Crossing ${lo} ↔ ${hi}: binary changes ${bitsEn(changed)} here (${bs(lo)} → ${bs(hi)}) and reads ${binary} right now; Gray changes 1 bit and reads ${gray}. Both are one of the two neighbours.`,
    `عبور الحدّ بين ${lo} و ${hi}: يغيّر الترميز الثنائي هنا ${bitsAr(changed)} (${bs(lo)} → ${bs(hi)}) ويقرأ الآن ${binary}؛ وتغيّر شفرة جراي بِتًا واحدًا وتقرأ ${gray}. وكلتا القراءتين أحد القطاعين المتجاورين.`,
  );
}

// ---------------------------------------------------------------- the player

export function EncoderSimPlayer({ mode: initialMode, ppr, bits }: { mode: EncoderMode; ppr?: number; bits: number }) {
  const [mode, setMode] = useState<EncoderMode>(initialMode);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Incremental (quadrature)
  const [inc, setInc] = useState<IncrementalState>(() => initialIncremental(SLOTS, HISTORY));
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState<Direction>(1);

  // Absolute (binary / Gray); starts on the page's 0111 (for 4 bits), one step before 1000
  const startSector = 2 ** (bits - 1) - 1;
  const [absTheta, setAbsTheta] = useState(() => sectorCentre(startSector, bits));
  const [pattern, setPattern] = useState<Code>("binary");
  const [skew, setSkew] = useState(false);
  const tracks = useMemo(() => absoluteTracks(bits, pattern), [bits, pattern]);

  const step = (dir: Direction) => {
    if (mode === "incremental") {
      setPlaying(false);
      setInc((s) => stepBy(s, dir, SLOTS, HISTORY));
    } else {
      setAbsTheta((t) => absoluteStep(t, dir, bits, skew));
    }
  };
  const reset = () => {
    if (mode === "incremental") {
      setPlaying(false);
      setInc(initialIncremental(SLOTS, HISTORY));
    } else {
      setAbsTheta(sectorCentre(startSector, bits));
    }
  };
  const switchMode = (next: EncoderMode) => {
    setPlaying(false);
    setMode(next);
  };

  // Playing: continuous rotation, or one state per 600 ms under reduced motion.
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      const timer = window.setInterval(() => setInc((s) => stepBy(s, direction, SLOTS, HISTORY)), REDUCED_INTERVAL);
      return () => window.clearInterval(timer);
    }
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null) {
        const delta = (direction * SPEED * Math.min(now - last, 64)) / 1000;
        setInc((s) => turnTo(s, s.theta + delta, SLOTS, HISTORY));
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, direction, reduced]);

  // Stop playing when the widget leaves the viewport or the tab is hidden.
  useEffect(() => {
    if (!playing) return;
    const stop = () => setPlaying(false);
    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    let observer: IntersectionObserver | undefined;
    const frame = bodyRef.current;
    if (frame && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) stop();
      });
      observer.observe(frame);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [playing]);

  // Dragging the disc: the change in the pointer's angle around the centre turns it.
  const drag = useRef<{ id: number; angle: number | null } | null>(null);
  const pointerAngle = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(x, y) < rect.width * 0.06) return null; // too close to the axle to tell
    return (Math.atan2(y, x) * 180) / Math.PI;
  };
  const dragHandlers = {
    onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, angle: pointerAngle(event) };
      setPlaying(false);
    },
    onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      const angle = pointerAngle(event);
      if (angle === null) return;
      const previous = current.angle;
      current.angle = angle;
      if (previous === null) return;
      const delta = ((((angle - previous + 180) % 360) + 360) % 360) - 180;
      if (!delta) return;
      if (mode === "incremental") setInc((s) => turnTo(s, s.theta + delta, SLOTS, HISTORY));
      else setAbsTheta((t) => t + delta);
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
  };

  // Keyboard: ← / → step, Home resets, Space plays (incremental) when the body or disc has focus.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "Home") reset();
    else if (event.key === " " && mode === "incremental" && (target === event.currentTarget || target.getAttribute("role") === "slider")) {
      setPlaying((p) => !p);
    } else return;
    event.preventDefault();
  };

  return (
    <div ref={bodyRef} className={styles.body} tabIndex={0} onKeyDown={onKeyDown} aria-label={label(T.type)}>
      <div className={`${styles.options} ${css.options}`}>
        <div className={styles.field}>
          <span>
            {T.type.en} <ArLine inline>{T.type.ar}</ArLine>
          </span>
          <div className={styles.segmented} role="group" aria-label={label(T.type)}>
            {(["incremental", "absolute"] as const).map((key) => (
              <button key={key} type="button" aria-pressed={mode === key} onClick={() => switchMode(key)}>
                <BiText text={T[key]} inline />
              </button>
            ))}
          </div>
        </div>
        {mode === "incremental" ? (
          <div className={styles.field}>
            <span>
              {T.playDirection.en} <ArLine inline>{T.playDirection.ar}</ArLine>
            </span>
            <div className={styles.segmented} role="group" aria-label={label(T.playDirection)}>
              {([1, -1] as const).map((dir) => (
                <button key={dir} type="button" aria-pressed={direction === dir} onClick={() => setDirection(dir)}>
                  <BiText text={dir > 0 ? T.forward : T.backward} inline />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.field}>
              <span>
                {T.pattern.en} <ArLine inline>{T.pattern.ar}</ArLine>
              </span>
              <div className={styles.segmented} role="group" aria-label={label(T.pattern)}>
                {(["binary", "gray"] as const).map((key) => (
                  <button key={key} type="button" aria-pressed={pattern === key} onClick={() => setPattern(key)}>
                    <BiText text={T[key]} inline />
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className={css.toggle} aria-pressed={skew} onClick={() => setSkew((v) => !v)}>
              <span className={css.switch} aria-hidden="true" />
              <BiText text={T.skew} inline />
            </button>
          </>
        )}
      </div>

      {mode === "incremental" ? (
        <IncrementalView state={inc} ppr={ppr} dragHandlers={dragHandlers} />
      ) : (
        <AbsoluteView theta={absTheta} bits={bits} pattern={pattern} skew={skew} tracks={tracks} dragHandlers={dragHandlers} />
      )}

      <div className={styles.controls}>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={reset}
            aria-label={label(mode === "incremental" ? UI.reset : T.resetAbs)}
            title={label(mode === "incremental" ? UI.reset : T.resetAbs)}
          >
            <RotateCcw aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => step(-1)}
            aria-label={label(mode === "incremental" ? T.stepBack : T.stepBackAbs)}
            title={label(mode === "incremental" ? T.stepBack : T.stepBackAbs)}
          >
            <StepBack aria-hidden="true" />
          </button>
          {mode === "incremental" ? (
            <button
              type="button"
              className={`${styles.iconButton} ${styles.playButton}`}
              onClick={() => setPlaying((p) => !p)}
              aria-label={label(playing ? UI.pause : UI.play)}
              title={label(playing ? UI.pause : UI.play)}
              aria-pressed={playing}
            >
              {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => step(1)}
            aria-label={label(mode === "incremental" ? T.stepForward : T.stepForwardAbs)}
            title={label(mode === "incremental" ? T.stepForward : T.stepForwardAbs)}
          >
            <StepForward aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.status} aria-live="polite">
        <BiText text={mode === "incremental" ? incrementalStatus(inc, playing, direction) : absoluteStatus(absTheta, bits, skew)} />
      </div>
      <p className={styles.hint}>
        <BiText
          text={
            mode === "absolute"
              ? bi(
                  "Drag the disc, or focus it and press ← →. With detector skew on, each step stops halfway through a boundary, where the detectors disagree.",
                  "اسحب القرص، أو انقر عليه واضغط ← →. وعند تشغيل انحراف الكواشف، تتوقف كل خطوة في منتصف عبور الحدّ، حيث لا تتفق الكواشف.",
                )
              : ppr
                ? bi(
                    `Drag the disc, or focus it and press ← → (Space plays or pauses). It is drawn with ${SLOTS} slots so you can see them; the angle uses ${ppr} slots per revolution, as decode() does.`,
                    `اسحب القرص، أو انقر عليه واضغط ← → (و Space للتشغيل أو الإيقاف). رُسم القرص بـ ${SLOTS} فتحة لتراها بوضوح؛ أما الزاوية فتُحسب بـ ${ppr} فتحة في الدورة، كما تفعل decode().`,
                  )
                : bi(
                    `Drag the disc, or focus it and press ← → (Space plays or pauses). With ${SLOTS} slots, one ×4 count is 360° / ${4 * SLOTS} = ${deg(360 / (4 * SLOTS))}°.`,
                    `اسحب القرص، أو انقر عليه واضغط ← → (و Space للتشغيل أو الإيقاف). مع ${SLOTS} فتحة، تساوي عدّة ×4 الواحدة 360° / ${4 * SLOTS} = ${deg(360 / (4 * SLOTS))}°.`,
                  )
          }
        />
      </p>
    </div>
  );
}

type DragHandlers = Pick<
  React.SVGProps<SVGSVGElement>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>;

// ---------------------------------------------------------------- incremental view

function IncrementalView({ state, ppr, dragHandlers }: { state: IncrementalState; ppr?: number; dragHandlers: DragHandlers }) {
  const ab = abAt(state.theta, SLOTS);
  const lit = { a: channelA(ab), b: channelB(ab) };
  const states = 4 * SLOTS;
  const position = ((quarterIndex(state.theta, SLOTS) % states) + states) % states;
  const { x1, x2, x4 } = state.counts;
  const perRev = ppr ?? SLOTS;
  const angle = countToDegrees(x4, perRev);
  const step = state.last?.step ?? 0;

  return (
    <>
      <div className={css.stage}>
        <div className={css.discWrap}>
          <svg
            className={css.disc}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            role="slider"
            tabIndex={0}
            aria-label={label(T.discIncremental)}
            aria-valuemin={0}
            aria-valuemax={states - 1}
            aria-valuenow={position}
            aria-valuetext={`AB ${abString(ab)}, ×4 count ${signed(x4)}`}
            {...dragHandlers}
          >
            <g transform={`rotate(${state.theta.toFixed(3)} ${C} ${C})`}>
              <circle className={css.face} cx={C} cy={C} r={R_FACE} />
              <circle
                className={css.bars}
                cx={C}
                cy={C}
                r={(R_SLOT_IN + R_SLOT_OUT) / 2}
                strokeWidth={R_SLOT_OUT - R_SLOT_IN}
              />
              {OPENINGS.map((d, i) => (
                <path key={i} className={css.opening} d={d} />
              ))}
              <circle className={css.hub} cx={C} cy={C} r={18} />
              <circle className={css.mark} cx={C} cy={C - 52} r={4.5} />
            </g>
            {(["a", "b"] as const).map((key) => {
              const angleOnScreen = DETECTORS[key];
              const [lx, ly] = polar(R_LABEL, angleOnScreen + (key === "a" ? 2 : -2));
              return (
                <g key={key}>
                  <rect className={css.detector} data-lit={lit[key] === 1} {...detectorRect(R_DETECTOR, angleOnScreen, 18)} />
                  <text className={css.detectorLabel} x={fx(lx)} y={fx(ly)}>
                    {key.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <dl className={css.readouts}>
          <div className={css.readout}>
            <dt>
              <BiText text={T.abState} />
            </dt>
            <dd className={css.big}>{abString(ab)}</dd>
          </div>
          <div className={css.readout}>
            <dt>
              <BiText text={T.direction} />
            </dt>
            <dd>
              {step === 0 ? (
                <span className={css.sub}>
                  <BiText text={T.notYet} />
                </span>
              ) : (
                <>
                  {step > 0 ? "+1" : "−1"}
                  <span className={css.sub}>
                    <BiText text={step > 0 ? T.forwardLead : T.backwardLead} />
                  </span>
                </>
              )}
            </dd>
          </div>
          <div className={css.readout}>
            <dt>
              <BiText text={T.count1} />
            </dt>
            <dd>{signed(x1)}</dd>
          </div>
          <div className={css.readout}>
            <dt>
              <BiText text={T.count2} />
            </dt>
            <dd>{signed(x2)}</dd>
          </div>
          <div className={css.readout}>
            <dt>
              <BiText text={T.count4} />
            </dt>
            <dd>{signed(x4)}</dd>
          </div>
          <div className={css.readout}>
            <dt>
              <BiText text={T.angle} />
            </dt>
            <dd>{deg(angle)}°</dd>
          </div>
        </dl>
      </div>

      <code className={styles.formula}>
        θ = {signed(x4)} × 360° / (4 × {perRev}) = {deg(angle)}°
      </code>

      <PulsePlot history={state.history} />
    </>
  );
}

const PLOT_W = 320;
const PLOT_X0 = 26;
const PLOT_COL = (PLOT_W - PLOT_X0 - 4) / HISTORY;
const WAVE_ROWS = { a: { hi: 8, lo: 32 }, b: { hi: 48, lo: 72 } };

function wave(levels: (0 | 1)[], hi: number, lo: number): string {
  let d = `M${PLOT_X0} ${levels[0] ? hi : lo}`;
  levels.forEach((v, i) => {
    if (i > 0) d += `V${v ? hi : lo}`;
    d += `H${fx(PLOT_X0 + (i + 1) * PLOT_COL)}`;
  });
  return d;
}

function PulsePlot({ history }: { history: AB[] }) {
  const last = history.length - 1;
  return (
    <div className={css.plotWrap}>
      <p className={styles.panelLabel}>
        <BiText text={T.plot} inline />
      </p>
      <svg className={css.plot} viewBox={`0 0 ${PLOT_W} 80`} aria-hidden="true">
        <rect className={css.plotNow} x={fx(PLOT_X0 + last * PLOT_COL)} y={2} width={fx(PLOT_COL)} height={76} rx={3} />
        {Array.from({ length: HISTORY + 1 }, (_, i) => (
          <line key={i} className={css.plotGrid} x1={fx(PLOT_X0 + i * PLOT_COL)} x2={fx(PLOT_X0 + i * PLOT_COL)} y1={4} y2={76} />
        ))}
        <text className={css.plotLabel} x={6} y={(WAVE_ROWS.a.hi + WAVE_ROWS.a.lo) / 2}>
          A
        </text>
        <text className={css.plotLabel} x={6} y={(WAVE_ROWS.b.hi + WAVE_ROWS.b.lo) / 2}>
          B
        </text>
        <path className={css.waveA} d={wave(history.map(channelA), WAVE_ROWS.a.hi, WAVE_ROWS.a.lo)} />
        <path className={css.waveB} d={wave(history.map(channelB), WAVE_ROWS.b.hi, WAVE_ROWS.b.lo)} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------- absolute view

function AbsoluteView({
  theta,
  bits,
  pattern,
  skew,
  tracks,
  dragHandlers,
}: {
  theta: number;
  bits: number;
  pattern: Code;
  skew: boolean;
  tracks: ReturnType<typeof absoluteTracks>;
  dragHandlers: DragHandlers;
}) {
  const N = 2 ** bits;
  const S = sectorAngle(bits);
  const sector = sectorAt(theta, bits);
  const offsets = skewOffsets(bits);
  const binaryWord = readWord(theta, "binary", bits, skew);
  const grayWord = readWord(theta, "gray", bits, skew);
  const grayValue = grayToBinary(grayWord);
  const drawnWord = pattern === "gray" ? grayWord : binaryWord;
  const binaryWrong = isMisread(theta, binaryWord, "binary", bits, skew);
  const grayWrong = isMisread(theta, grayWord, "gray", bits, skew);
  const bs = (w: number) => bitString(w, bits);

  return (
    <>
      <div className={css.stage}>
        <div className={css.discWrap}>
          <svg
            className={css.disc}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            role="slider"
            tabIndex={0}
            aria-label={label(T.discAbsolute)}
            aria-valuemin={0}
            aria-valuemax={N - 1}
            aria-valuenow={sector}
            aria-valuetext={`Sector ${sector}: binary ${bs(sector)}, Gray ${bs(binaryToGray(sector))}`}
            {...dragHandlers}
          >
            <g transform={`rotate(${theta.toFixed(3)} ${C} ${C})`}>
              <circle className={css.face} cx={C} cy={C} r={R_OUT + 4} />
              {tracks.map((track) => (
                <g key={track.bit}>
                  <circle
                    className={css.trackOff}
                    cx={C}
                    cy={C}
                    r={track.mid}
                    strokeWidth={track.outer - track.inner}
                  />
                  {track.paths.map((d, i) => (
                    <path key={i} className={css.trackOn} d={d} />
                  ))}
                </g>
              ))}
              {Array.from({ length: N }, (_, s) => {
                const [x1, y1] = polar(R_IN, TOP - s * S);
                const [x2, y2] = polar(R_OUT, TOP - s * S);
                return <line key={s} className={css.divider} x1={fx(x1)} y1={fx(y1)} x2={fx(x2)} y2={fx(y2)} />;
              })}
              {tracks.map((track) => (
                <circle key={track.bit} className={css.trackEdge} cx={C} cy={C} r={track.outer} />
              ))}
              <circle className={css.trackEdge} cx={C} cy={C} r={R_IN} />
              <circle className={css.hub} cx={C} cy={C} r={R_IN - 6} />
            </g>
            {N <= 16
              ? Array.from({ length: N }, (_, s) => {
                  const [x, y] = polar(R_SECTOR_LABEL, TOP - (s + 0.5) * S + theta);
                  return (
                    <text key={s} className={css.sectorLabel} data-current={s === sector} x={fx(x)} y={fx(y)}>
                      {s}
                    </text>
                  );
                })
              : null}
            <line className={css.readLine} x1={C} y1={fx(C - R_IN + 4)} x2={C} y2={fx(C - R_OUT - 4)} />
            {tracks.map((track) => (
              <rect
                key={track.bit}
                className={css.detector}
                data-lit={((drawnWord >> track.bit) & 1) === 1}
                {...detectorRect(track.mid, TOP + (skew ? offsets[track.bit] : 0), Math.max(track.outer - track.inner - 6, 6))}
              />
            ))}
          </svg>
        </div>

        <dl className={css.readouts}>
          <div className={css.readout}>
            <dt>
              <BiText text={T.sector} />
            </dt>
            <dd className={css.big}>
              {sector}
              <span className={css.sub}>
                {deg(sector * S)}°–{deg((sector + 1) * S)}°
              </span>
            </dd>
          </div>
          <div className={css.readout} data-state={binaryWrong ? "wrong" : undefined} data-drawn={pattern === "binary"}>
            <dt>
              <BiText text={T.binaryReads} />
            </dt>
            <dd>
              {bs(binaryWord)}
              <span className={css.sub}>= {binaryWord}</span>
              {binaryWrong ? (
                <span className={css.flag}>
                  <BiText text={T.misread} inline />
                </span>
              ) : null}
            </dd>
          </div>
          <div className={css.readout} data-state={grayWrong ? "wrong" : undefined} data-drawn={pattern === "gray"}>
            <dt>
              <BiText text={T.grayReads} />
            </dt>
            <dd>
              {bs(grayWord)}
              <span className={css.sub}>→ {grayValue}</span>
              {grayWrong ? (
                <span className={css.flag}>
                  <BiText text={T.misread} inline />
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      </div>

      <code className={styles.formula}>
        binary_to_gray({sector}) = {bs(sector)} ^ {bs(sector >> 1)} = {bs(binaryToGray(sector))}
      </code>
    </>
  );
}
