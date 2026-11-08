"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/image-processing/lecture-02";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Image Processing · Lecture 2, keyed by walkthrough id. */
export const loaders = {
  "ip2-classes": dynamic(() => import("./lecture-02/classes").then((m) => m.Scene)),
  "ip2-point-ops": dynamic(() => import("./lecture-02/point-ops").then((m) => m.Scene)),
  "ip2-arithmetic": dynamic(() => import("./lecture-02/arithmetic").then((m) => m.Scene)),
  "ip2-complements": dynamic(() => import("./lecture-02/complements").then((m) => m.Scene)),
  "ip2-histograms": dynamic(() => import("./lecture-02/histograms").then((m) => m.Scene)),
  "ip2-stretching": dynamic(() => import("./lecture-02/stretching").then((m) => m.Scene)),
  "ip2-gamma": dynamic(() => import("./lecture-02/gamma").then((m) => m.Scene)),
  "ip2-piecewise": dynamic(() => import("./lecture-02/piecewise").then((m) => m.Scene)),
  "ip2-equalization": dynamic(() => import("./lecture-02/equalization").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
