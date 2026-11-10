"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/artificial-intelligence/lecture-05";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Artificial Intelligence · Lecture 5, keyed by walkthrough id. */
export const loaders = {
  "ai5-intro": dynamic(() => import("./lecture-05/intro").then((m) => m.Scene)),
  "ai5-stances": dynamic(() => import("./lecture-05/stances").then((m) => m.Scene)),
  "ai5-games": dynamic(() => import("./lecture-05/games").then((m) => m.Scene)),
  "ai5-minimax": dynamic(() => import("./lecture-05/minimax").then((m) => m.Scene)),
  "ai5-alpha-beta": dynamic(() => import("./lecture-05/alpha-beta").then((m) => m.Scene)),
  "ai5-heuristic": dynamic(() => import("./lecture-05/heuristic").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
