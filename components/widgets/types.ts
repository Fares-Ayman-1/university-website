/**
 * Every string a widget shows comes in both languages. Widget text lives in code (not in
 * the MDX), so `npm run check:arabic` can't see it: typing it as `Bi` makes a missing
 * Arabic string a type error instead.
 */
export type Bi = { en: string; ar: string };

export const bi = (en: string, ar: string): Bi => ({ en, ar });
