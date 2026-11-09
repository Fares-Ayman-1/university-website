"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/image-processing/lecture-04";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Image Processing · Lecture 4, keyed by walkthrough id. */
export const loaders = {
  "ip4-intro": dynamic(() => import("./lecture-04/intro").then((m) => m.Scene)),
  "ip4-dft-1d": dynamic(() => import("./lecture-04/dft1d").then((m) => m.Scene)),
  "ip4-dft-2d": dynamic(() => import("./lecture-04/dft2d").then((m) => m.Scene)),
  "ip4-advantages": dynamic(() => import("./lecture-04/advantages").then((m) => m.Scene)),
  "ip4-filtering": dynamic(() => import("./lecture-04/filtering").then((m) => m.Scene)),
  "ip4-filters": dynamic(() => import("./lecture-04/filters").then((m) => m.Scene)),
  "ip4-steps": dynamic(() => import("./lecture-04/steps").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
