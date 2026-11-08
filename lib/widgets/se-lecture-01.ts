/*
 * Software Engineering · Lecture 1: the numbers its walkthrough scenes draw. Kept as pure
 * data so the page's `expect` can check them against the text ("roughly 60 % … 40 %").
 */

/** Share of the cost of building a system (before delivery), in percent. */
export const BUILD_SPLIT = { development: 60, testing: 40 } as const;

/**
 * Evolution after delivery, drawn in the same units as the build split. "For custom software,
 * evolution costs often exceed development costs": any value above the development share
 * says that; 100 makes it as big as the whole build.
 */
export const EVOLUTION_DRAWN = 100;
