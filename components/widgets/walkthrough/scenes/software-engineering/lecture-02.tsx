"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/software-engineering/lecture-02";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Software Engineering · Lecture 2, keyed by walkthrough id. */
export const loaders = {
  "se2-process": dynamic(() => import("./lecture-02/process").then((m) => m.Scene)),
  "se2-waterfall": dynamic(() => import("./lecture-02/waterfall").then((m) => m.Scene)),
  "se2-incremental": dynamic(() => import("./lecture-02/incremental").then((m) => m.Scene)),
  "se2-reuse": dynamic(() => import("./lecture-02/reuse").then((m) => m.Scene)),
  "se2-change": dynamic(() => import("./lecture-02/change").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
