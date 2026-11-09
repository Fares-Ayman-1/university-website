"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/artificial-intelligence/lecture-04";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Artificial Intelligence · Lecture 4, keyed by walkthrough id. */
export const loaders = {
  "ai4-intro": dynamic(() => import("./lecture-04/intro").then((m) => m.Scene)),
  "ai4-stances": dynamic(() => import("./lecture-04/stances").then((m) => m.Scene)),
  "ai4-games": dynamic(() => import("./lecture-04/games").then((m) => m.Scene)),
  "ai4-minimax": dynamic(() => import("./lecture-04/minimax").then((m) => m.Scene)),
  "ai4-alpha-beta": dynamic(() => import("./lecture-04/alpha-beta").then((m) => m.Scene)),
  "ai4-heuristic": dynamic(() => import("./lecture-04/heuristic").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
