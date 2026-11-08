import { bi, type Bi } from "@/components/widgets/types";

/*
 * Software Engineering · Lecture 4: the measurable non-functional requirement in the
 * "se4-fr-nfr" walkthrough. Pure, so the page's `expect` can name the limit and the scene
 * draws the same verdicts as the points.
 */

/** Mentcare's product requirement: downtime in working hours shall not exceed 5 s in any one day. */
export const DOWNTIME_LIMIT = 5;

export type TestDay = { day: Bi; downtime: number };

/** One week of measured downtime (seconds per day) from a system test. */
export const TEST_WEEK: readonly TestDay[] = [
  { day: bi("Mon", "الاثنين"), downtime: 1 },
  { day: bi("Tue", "الثلاثاء"), downtime: 0 },
  { day: bi("Wed", "الأربعاء"), downtime: 3 },
  { day: bi("Thu", "الخميس"), downtime: 7 },
  { day: bi("Fri", "الجمعة"), downtime: 2 },
];

/** Checks each day against the limit: the verdict a measurable NFR makes possible. */
export function checkDowntime(week: readonly TestDay[], limit: number) {
  const days = week.map((d) => ({ ...d, ok: d.downtime <= limit }));
  const failing = days.filter((d) => !d.ok);
  const worst = days.reduce((w, d) => (d.downtime > w.downtime ? d : w), days[0]);
  return { days, failing, worst, passed: failing.length === 0 };
}
