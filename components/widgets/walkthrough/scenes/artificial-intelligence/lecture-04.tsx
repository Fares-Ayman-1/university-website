"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Artificial Intelligence · Lecture 4, keyed by walkthrough id. */
export const loaders = {
  "ai4-informed": dynamic(() => import("./lecture-04/informed").then((m) => m.Scene)),
  "ai4-heuristic": dynamic(() => import("./lecture-04/heuristic").then((m) => m.Scene)),
  "ai4-greedy": dynamic(() => import("./lecture-04/greedy").then((m) => m.Scene)),
  "ai4-astar": dynamic(() => import("./lecture-04/astar").then((m) => m.Scene)),
  "ai4-admissible": dynamic(() => import("./lecture-04/admissible").then((m) => m.Scene)),
  "ai4-compare": dynamic(() => import("./lecture-04/compare").then((m) => m.Scene)),
  "ai4-beyond": dynamic(() => import("./lecture-04/beyond").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
