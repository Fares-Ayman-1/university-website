"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArLine, isolateLatin } from "@/components/mdx/Arabic";
import type { WalkthroughDef } from "@/lib/widgets/walkthrough";
import { stepOf } from "./i18n";
import { bi, type Bi } from "./types";
import { useStepper } from "./useStepper";
import { StageContext } from "./walkthrough/primitives";
import { WalkthroughScene } from "./walkthrough/scenes";
import styles from "./widgets.module.css";
import w from "./Walkthrough.module.css";

const T = {
  panels: bi("Panels", "اللوحات"),
  back: bi("Back", "السابق"),
  next: bi("Next", "التالي"),
  replay: bi("Replay the drawing", "أعد تشغيل الرسم"),
  analogy: bi("Think of it as:", "تخيّلها هكذا:"),
  swipe: bi("Swipe the drawing sideways to see all of it.", "اسحب الرسم جانبيًا لرؤيته كاملًا."),
  widget: bi("Walkthrough. Use the left and right arrow keys to move between panels.", "جولة مرئية: استخدم السهمين الأيمن والأيسر للتنقل بين اللوحات."),
};

const both = (text: Bi) => `${text.en} · ${text.ar}`;

/** `**bold**` inside a point's text. Arabic pieces keep their English runs isolated. */
function rich(text: string, arabic = false) {
  return text.split("**").map((part, i) => {
    const content = arabic ? isolateLatin(part) : part;
    return i % 2 ? <strong key={i}>{content}</strong> : <Fragment key={i}>{content}</Fragment>;
  });
}

/** English, with the Arabic line only when it says something different ("SQL" needs none). */
function Two({ text }: { text: Bi }) {
  return (
    <>
      {text.en}
      {text.ar !== text.en ? <ArLine>{text.ar}</ArLine> : null}
    </>
  );
}

function RichBi({ text }: { text: Bi }) {
  return (
    <>
      {rich(text.en)}
      <ArLine>{rich(text.ar, true)}</ArLine>
    </>
  );
}

export function WalkthroughPlayer({ def }: { def: WalkthroughDef }) {
  const { panels } = def;
  const stepper = useStepper(panels.length);
  const { index, atStart, atEnd, reduced } = stepper;
  const panel = panels[index];
  const [choices, setChoices] = useState<Record<string, string>>({});
  const choice = panel.control ? (choices[panel.id] ?? panel.control.initial) : "";
  const [replay, setReplay] = useState(0);

  // Entrances wait until the stage is on screen (they'd otherwise finish unseen).
  const stageRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [live, setLive] = useState(false);
  useEffect(() => {
    setArmed(true);
    const el = stageRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setLive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep the current pill in view when the row scrolls sideways.
  const pillsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = pillsRef.current;
    const pill = row?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!row || !pill) return;
    const left = pill.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + pill.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - 8, behavior: reduced ? "auto" : "smooth" });
    }
  }, [index, reduced]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") stepper.next();
    else if (event.key === "ArrowLeft") stepper.prev();
    else if (event.key === "Home") stepper.go(0);
    else if (event.key === "End") stepper.go(panels.length - 1);
    else return;
    event.preventDefault();
  };

  const position = stepOf(index, panels.length);
  const points = [...panel.points, ...(panel.pointsFor?.[choice] ?? [])];

  return (
    <div className={styles.body} tabIndex={0} onKeyDown={onKeyDown} aria-label={both(T.widget)}>
      <div className={w.pills} ref={pillsRef} role="group" aria-label={both(T.panels)}>
        {panels.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={w.pill}
            aria-current={i === index ? "step" : undefined}
            data-state={i < index ? "done" : i === index ? "current" : "todo"}
            onClick={() => stepper.go(i)}
          >
            <span className={w.pillNum}>{i + 1}</span>
            <span>
              <Two text={p.pill} />
            </span>
          </button>
        ))}
      </div>

      {panel.control ? (
        <div className={w.controlRow}>
          <span className={w.controlLabel}>
            {panel.control.label.en}
            <ArLine>{panel.control.label.ar}</ArLine>
          </span>
          <div className={styles.segmented} role="group" aria-label={both(panel.control.label)}>
            {panel.control.options.map((o) => (
              <button key={o.id} type="button" aria-pressed={o.id === choice} onClick={() => setChoices((c) => ({ ...c, [panel.id]: o.id }))}>
                <Two text={o.label} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={w.stage} ref={stageRef} data-armed={armed || undefined} data-live={live || undefined} data-reduced={reduced || undefined}>
        <button type="button" className={w.replay} onClick={() => setReplay((n) => n + 1)} aria-label={both(T.replay)} title={both(T.replay)}>
          <RotateCcw aria-hidden="true" />
        </button>
        {/* On phones the drawing keeps a readable minimum width and scrolls sideways here. */}
        <div className={w.sceneScroll}>
          <StageContext.Provider value={{ live, reduced, label: both(panel.heading) }}>
            <WalkthroughScene key={`${panel.id}:${choice}:${replay}`} id={def.id} panel={panel.id} control={choice} />
          </StageContext.Provider>
        </div>
      </div>

      <p className={w.swipeHint} aria-hidden="true">
        {T.swipe.en}
        <ArLine>{T.swipe.ar}</ArLine>
      </p>

      <div className={w.text} aria-live="polite">
        <p className={w.panelHeading}>
          {panel.heading.en}
          <ArLine>{panel.heading.ar}</ArLine>
        </p>
        <ul className={w.points}>
          {points.map((p, i) => (
            <li key={`${choice}:${i}`}>
              <RichBi text={p} />
            </li>
          ))}
        </ul>
      </div>

      <div className={w.nav}>
        <button type="button" className={w.navButton} onClick={stepper.prev} disabled={atStart}>
          <ArrowLeft aria-hidden="true" />
          <span>
            {T.back.en}
            <ArLine>{T.back.ar}</ArLine>
          </span>
        </button>
        {/* Arabic on its own line: inline, its number would sit next to the English one. */}
        <p className={w.position}>
          {position.en}
          <ArLine>{position.ar}</ArLine>
        </p>
        <button type="button" className={`${w.navButton} ${w.navPrimary}`} onClick={stepper.next} disabled={atEnd}>
          <span>
            {T.next.en}
            <ArLine>{T.next.ar}</ArLine>
          </span>
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      {def.analogy ? (
        <p className={w.analogy}>
          <span className={w.analogyLabel}>{T.analogy.en}</span> {rich(def.analogy.en)}
          <ArLine>
            <span className={w.analogyLabel}>{T.analogy.ar}</span> {rich(def.analogy.ar, true)}
          </ArLine>
        </p>
      ) : null}
    </div>
  );
}
