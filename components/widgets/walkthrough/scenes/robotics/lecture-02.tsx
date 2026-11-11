"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/robotics/lecture-02";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Robotics · Lecture 2, keyed by walkthrough id. */
export const loaders = {
  "rob2-arm": dynamic(() => import("./lecture-02/arm").then((m) => m.Scene)),
  "rob2-performance": dynamic(() => import("./lecture-02/performance").then((m) => m.Scene)),
  "rob2-components": dynamic(() => import("./lecture-02/components").then((m) => m.Scene)),
  "rob2-dof": dynamic(() => import("./lecture-02/dof").then((m) => m.Scene)),
  "rob2-joints": dynamic(() => import("./lecture-02/joints").then((m) => m.Scene)),
  "rob2-frames": dynamic(() => import("./lecture-02/frames").then((m) => m.Scene)),
  "rob2-configurations": dynamic(() => import("./lecture-02/configurations").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
