import { bi } from "./types";

/** UI strings shared by every widget's controls. */
export const UI = {
  interactive: bi("Interactive", "تفاعلي"),
  play: bi("Play", "تشغيل"),
  pause: bi("Pause", "إيقاف مؤقت"),
  next: bi("Next step", "الخطوة التالية"),
  previous: bi("Previous step", "الخطوة السابقة"),
  reset: bi("Back to the start", "العودة إلى البداية"),
  scrub: bi("Step", "الخطوة"),
  keys: bi("Focus the widget, then use ← → to step and Space to play or pause.", "انقر داخل الأداة ثم استخدم ← → للتنقل بين الخطوات و Space للتشغيل أو الإيقاف."),
} as const;

export function stepOf(index: number, count: number) {
  return bi(`Step ${index + 1} of ${count}`, `الخطوة ${index + 1} من ${count}`);
}
