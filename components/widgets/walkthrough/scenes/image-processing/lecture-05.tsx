"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/image-processing/lecture-05";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Image Processing · Lecture 5, keyed by walkthrough id. */
export const loaders = {
  "ip5-why": dynamic(() => import("./lecture-05/why").then((m) => m.Scene)),
  "ip5-sines": dynamic(() => import("./lecture-05/sines").then((m) => m.Scene)),
  "ip5-continuous": dynamic(() => import("./lecture-05/continuous").then((m) => m.Scene)),
  "ip5-dft": dynamic(() => import("./lecture-05/dft").then((m) => m.Scene)),
  "ip5-properties": dynamic(() => import("./lecture-05/properties").then((m) => m.Scene)),
  "ip5-mag-phase": dynamic(() => import("./lecture-05/mag-phase").then((m) => m.Scene)),
  "ip5-pairs": dynamic(() => import("./lecture-05/pairs").then((m) => m.Scene)),
  "ip5-2d": dynamic(() => import("./lecture-05/twod").then((m) => m.Scene)),
  "ip5-filtering": dynamic(() => import("./lecture-05/filtering").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
