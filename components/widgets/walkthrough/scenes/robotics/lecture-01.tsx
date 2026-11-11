"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/robotics/lecture-01";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Robotics · Lecture 1, keyed by walkthrough id. */
export const loaders = {
  "rob1-what-is-robot": dynamic(() => import("./lecture-01/what-is-robot").then((m) => m.Scene)),
  "rob1-history": dynamic(() => import("./lecture-01/history").then((m) => m.Scene)),
  "rob1-definitions": dynamic(() => import("./lecture-01/definitions").then((m) => m.Scene)),
  "rob1-system": dynamic(() => import("./lecture-01/system").then((m) => m.Scene)),
  "rob1-classify": dynamic(() => import("./lecture-01/classify").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
