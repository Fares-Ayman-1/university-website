"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/artificial-intelligence/lecture-02";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Artificial Intelligence · Lecture 2, keyed by walkthrough id. */
export const loaders = {
  "ai2-agents": dynamic(() => import("./lecture-02/agents").then((m) => m.Scene)),
  "ai2-problem-types": dynamic(() => import("./lecture-02/types").then((m) => m.Scene)),
  "ai2-formulation": dynamic(() => import("./lecture-02/formulation").then((m) => m.Scene)),
  "ai2-abstraction": dynamic(() => import("./lecture-02/abstraction").then((m) => m.Scene)),
  "ai2-examples": dynamic(() => import("./lecture-02/examples").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
