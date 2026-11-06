"use client";

import { useMemo, useRef, useState } from "react";
import { ArLine } from "@/components/mdx/Arabic";
import {
  filterImage,
  formatNumber,
  KERNEL_PRESETS,
  resolveKernel,
  type FilterMode,
  type KernelPreset,
  type Padding,
} from "@/lib/widgets/convolution";
import { BiText } from "./BiText";
import { UI } from "./i18n";
import { StepperControls } from "./StepperControls";
import { bi, type Bi } from "./types";
import { stepperKeyDown, useStepper } from "./useStepper";
import styles from "./widgets.module.css";

const MASKS: Record<KernelPreset | "page", Bi> = {
  page: bi("The page's mask w", "القناع w في الصفحة"),
  mean: bi("Mean (average) 1/9", "المتوسط 1/9"),
  identity: bi("Identity (impulse)", "الهوية (النبضة)"),
  laplacian: bi("Laplacian", "لابلاسيان"),
  shift: bi("Shift (1 left of centre)", "إزاحة (1 يسار المركز)"),
};

const PADDINGS: Record<Padding, Bi> = {
  none: bi("None (output shrinks)", "بلا حشو (تصغر المخرجات)"),
  zero: bi("Zero padding", "الحشو بالأصفار"),
  replicate: bi("Replicate", "التكرار"),
  symmetric: bi("Symmetric (mirror)", "الانعكاس"),
  wrap: bi("Wrap around", "الحشو الدائري"),
};

const MODES: Record<FilterMode, Bi> = {
  correlation: bi("Correlation", "الارتباط"),
  convolution: bi("Convolution", "الالتفاف"),
};

export function ConvolutionPlayer({
  image,
  kernel,
  mode: initialMode,
  padding: initialPadding,
}: {
  image: number[][];
  kernel: string;
  mode: FilterMode;
  padding: Padding;
}) {
  const isPreset = kernel in KERNEL_PRESETS;
  const [maskKey, setMaskKey] = useState<KernelPreset | "page">(isPreset ? (kernel as KernelPreset) : "page");
  const [mode, setMode] = useState(initialMode);
  const [padding, setPadding] = useState(initialPadding);
  const bodyRef = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () => filterImage(image, maskKey === "page" ? resolveKernel(kernel) : KERNEL_PRESETS[maskKey], mode, padding),
    [image, kernel, maskKey, mode, padding],
  );
  const stepper = useStepper(result.steps.length, { frameRef: bodyRef });
  const step = result.steps[stepper.index];
  const outCols = result.output[0].length;
  const { k } = result;

  const formula =
    step.terms.map(({ f, w }) => `${formatNumber(f)}·${w < 0 ? `(${formatNumber(w)})` : formatNumber(w)}`).join(" + ") +
    ` = ${formatNumber(step.sum)}` +
    (result.divisor !== 1 ? ` → ${formatNumber(step.sum)} / ${result.divisor} = ${formatNumber(step.value)}` : "");
  const outOfRange = step.value < 0 || step.value > 255;

  return (
    <div
      ref={bodyRef}
      className={styles.body}
      tabIndex={0}
      onKeyDown={stepperKeyDown(stepper)}
      aria-label="Spatial filtering stepper. Use the left and right arrow keys to move the mask."
    >
      <div className={styles.options}>
        <label className={styles.field}>
          <span>
            Mask <ArLine inline>القناع</ArLine>
          </span>
          <select value={maskKey} onChange={(event) => setMaskKey(event.target.value as KernelPreset | "page")}>
            {(Object.keys(MASKS) as (KernelPreset | "page")[])
              .filter((key) => key !== "page" || !isPreset)
              .map((key) => (
                <option key={key} value={key}>
                  {MASKS[key].en} · {MASKS[key].ar}
                </option>
              ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>
            Borders <ArLine inline>الحدود</ArLine>
          </span>
          <select value={padding} onChange={(event) => setPadding(event.target.value as Padding)}>
            {(Object.keys(PADDINGS) as Padding[]).map((key) => (
              <option key={key} value={key}>
                {PADDINGS[key].en} · {PADDINGS[key].ar}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.field}>
          <span>
            Operation <ArLine inline>العملية</ArLine>
          </span>
          <div className={styles.segmented} role="group" aria-label="Operation">
            {(Object.keys(MODES) as FilterMode[]).map((key) => (
              <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}>
                {MODES[key].en}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <p className={styles.panelLabel}>
            Input f{padding !== "none" ? " (padded)" : ""}{" "}
            <ArLine inline>{padding !== "none" ? "المدخلات (بعد الحشو)" : "المدخلات"}</ArLine>
          </p>
          <div className={styles.grid} style={{ "--cols": result.padded[0].length } as React.CSSProperties}>
            {result.padded.map((line, r) =>
              line.map((cell, c) => {
                const i = r - step.row;
                const j = c - step.col;
                const inWindow = i >= 0 && i < k && j >= 0 && j < k;
                return (
                  <span key={`${r}-${c}`} className={styles.cell} data-pad={cell.pad}>
                    {formatNumber(cell.value)}
                    {inWindow ? <span className={styles.weight}>×{formatNumber(result.applied[i][j])}</span> : null}
                  </span>
                );
              }),
            )}
            <span
              className={styles.window}
              aria-hidden="true"
              style={{ "--k": k, "--r": step.row, "--c": step.col } as React.CSSProperties}
            />
          </div>
        </div>

        <div className={styles.panel}>
          <p className={styles.panelLabel}>
            {mode === "convolution" ? "Mask rotated 180°" : "Mask w"}{" "}
            <ArLine inline>{mode === "convolution" ? "القناع بعد تدويره" : "القناع"}</ArLine>
          </p>
          <div className={styles.grid} style={{ "--cols": k } as React.CSSProperties}>
            {result.applied.map((line, r) =>
              line.map((w, c) => (
                <span key={`${r}-${c}`} className={styles.cell} data-state="done">
                  {formatNumber(w)}
                </span>
              )),
            )}
          </div>
          {result.divisor !== 1 ? <p className={styles.panelLabel}>× 1/{result.divisor}</p> : null}
        </div>

        <div className={styles.panel}>
          <p className={styles.panelLabel}>
            Output g <ArLine inline>المخرجات</ArLine>
          </p>
          <div className={styles.grid} style={{ "--cols": outCols } as React.CSSProperties}>
            {result.steps.map((s, i) => (
              <button
                key={`${s.row}-${s.col}`}
                type="button"
                className={styles.cell}
                data-state={i === stepper.index ? "current" : i < stepper.index ? "done" : "todo"}
                onClick={() => stepper.go(i)}
                aria-label={`Output row ${s.row + 1}, column ${s.col + 1}${i <= stepper.index ? `: ${formatNumber(s.value)}` : ""}`}
              >
                {formatNumber(s.value)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <StepperControls stepper={stepper} />

      <div className={styles.status} aria-live="polite">
        <BiText
          text={bi(
            `g at row ${step.row + 1}, column ${step.col + 1}: multiply each pixel under the mask by the weight on it, then add.`,
            `قيمة g في الصف ${step.row + 1} والعمود ${step.col + 1}: اضرب كل بكسل تحت القناع في الوزن الذي فوقه ثم اجمع.`,
          )}
        />
        <code className={styles.formula}>{formula}</code>
        {outOfRange ? (
          <BiText
            text={bi(
              "Outside 0–255: for display it would be clipped or the whole output rescaled.",
              "القيمة خارج المدى 0–255: عند العرض تُقَصّ أو يُعاد تحجيم المخرجات كلها.",
            )}
          />
        ) : null}
      </div>
      <p className={styles.hint}>
        <BiText text={UI.keys} />
      </p>
    </div>
  );
}
