"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Image Processing · Lecture 3, keyed by walkthrough id. */
export const loaders = {
  "ip3-spatial-filtering": dynamic(() => import("./lecture-03/spatial").then((m) => m.Scene)),
  "ip3-mean-filter": dynamic(() => import("./lecture-03/mean").then((m) => m.Scene)),
  "ip3-separable": dynamic(() => import("./lecture-03/separable").then((m) => m.Scene)),
  "ip3-frequency": dynamic(() => import("./lecture-03/frequency").then((m) => m.Scene)),
  "ip3-laplacian": dynamic(() => import("./lecture-03/laplacian").then((m) => m.Scene)),
  "ip3-unsharp": dynamic(() => import("./lecture-03/unsharp").then((m) => m.Scene)),
  "ip3-nonlinear": dynamic(() => import("./lecture-03/nonlinear").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
