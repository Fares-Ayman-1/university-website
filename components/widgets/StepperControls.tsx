"use client";

import { Pause, Play, SkipBack, StepBack, StepForward } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { UI, stepOf } from "./i18n";
import type { Stepper } from "./useStepper";
import styles from "./widgets.module.css";

const label = (text: { en: string; ar: string }) => `${text.en} · ${text.ar}`;

/** Reset / previous / play-pause / next buttons, a scrubber, and "Step i of n". */
export function StepperControls({ stepper }: { stepper: Stepper }) {
  const { index, count, atStart, atEnd, playing } = stepper;
  const position = stepOf(index, count);
  return (
    <div className={styles.controls}>
      <div className={styles.buttons}>
        <button type="button" className={styles.iconButton} onClick={stepper.reset} disabled={atStart} aria-label={label(UI.reset)} title={label(UI.reset)}>
          <SkipBack aria-hidden="true" />
        </button>
        <button type="button" className={styles.iconButton} onClick={stepper.prev} disabled={atStart} aria-label={label(UI.previous)} title={label(UI.previous)}>
          <StepBack aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.playButton}`}
          onClick={stepper.toggle}
          aria-label={label(playing ? UI.pause : UI.play)}
          title={label(playing ? UI.pause : UI.play)}
          aria-pressed={playing}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button type="button" className={styles.iconButton} onClick={stepper.next} disabled={atEnd} aria-label={label(UI.next)} title={label(UI.next)}>
          <StepForward aria-hidden="true" />
        </button>
      </div>
      <input
        className={styles.scrubber}
        type="range"
        min={0}
        max={Math.max(count - 1, 0)}
        value={index}
        onChange={(event) => stepper.go(Number(event.target.value))}
        aria-label={label(UI.scrub)}
        aria-valuetext={position.en}
      />
      {/* Arabic on its own line: inline, its trailing number would sit next to the English one. */}
      <p className={styles.position}>
        {position.en}
        <ArLine>{position.ar}</ArLine>
      </p>
    </div>
  );
}
