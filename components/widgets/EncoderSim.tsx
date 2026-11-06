import { assertEncoderExpect, DRAWN_SLOTS, type EncoderMode } from "@/lib/widgets/encoder";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { EncoderSimPlayer } from "./players";


function positiveInt(value: number | string, name: string, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`<EncoderSim>: ${name} must be a whole number from ${min} to ${max}, got "${value}".`);
  }
  return n;
}

/**
 * <EncoderSim mode="incremental" ppr={500} bits={4} expect="decode 00 01 11 10 00 = 0.72 forward; …" />
 *
 * - `mode`: the tab shown first, "incremental" (quadrature A/B) or "absolute" (binary / Gray).
 * - `ppr`: slots (pulses) per revolution used for the angle, like decode()'s slots_per_rev.
 *   The disc itself is drawn with 12 slots; without `ppr` the angle uses those 12.
 * - `bits`: tracks on the absolute disc (3–6).
 * - `expect`: clauses copied from the page, checked at build time (a mismatch throws, failing
 *   the build). Separated by ";":
 *     decode 00 01 11 10 00 = 0.72 forward   AB samples (A then B) → decode(samples, ppr) and the count's sign
 *     gray 0000 0001 0011 …                  binary_to_gray(0), (1), … as `bits`-digit words
 *     skew 0111 1000 = 1111                  what skewed detectors momentarily read on the binary disc
 *   See assertEncoderExpect in lib/widgets/encoder.ts.
 */
export function EncoderSim({
  mode = "incremental",
  ppr,
  bits = 4,
  expect,
  title = "Turn an encoder disc",
  titleAr = "أدِر قرص المُرمِّز",
  caption,
  captionAr,
}: {
  mode?: EncoderMode;
  ppr?: number | string;
  bits?: number | string;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  if (mode !== "incremental" && mode !== "absolute") {
    throw new Error(`<EncoderSim>: mode must be "incremental" or "absolute", got "${mode}".`);
  }
  const pulses = ppr === undefined ? undefined : positiveInt(ppr, "ppr", 1, 1_000_000);
  const tracks = positiveInt(bits, "bits", 3, 6);
  if (expect) assertEncoderExpect(expect, { ppr: pulses ?? DRAWN_SLOTS, bits: tracks }, "<EncoderSim>");

  return (
    <WidgetShell
      name="encoder"
      kicker={bi("Encoders", "المُرمِّزات")}
      title={title}
      titleAr={titleAr}
      caption={caption}
      captionAr={captionAr}
    >
      <EncoderSimPlayer mode={mode} ppr={pulses} bits={tracks} />
    </WidgetShell>
  );
}
