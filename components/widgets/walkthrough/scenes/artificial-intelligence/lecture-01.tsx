"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Artificial Intelligence · Lecture 1, keyed by walkthrough id. */
export const loaders = {
  "ai1-what-is-ai": dynamic(() => import("./lecture-01/what-is-ai").then((m) => m.Scene)),
  "ai1-agents": dynamic(() => import("./lecture-01/agents").then((m) => m.Scene)),
  "ai1-rationality": dynamic(() => import("./lecture-01/rationality").then((m) => m.Scene)),
  "ai1-peas": dynamic(() => import("./lecture-01/peas").then((m) => m.Scene)),
  "ai1-environments": dynamic(() => import("./lecture-01/environments").then((m) => m.Scene)),
  "ai1-architectures": dynamic(() => import("./lecture-01/architectures").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
