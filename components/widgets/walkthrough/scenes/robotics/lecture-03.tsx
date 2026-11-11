"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/robotics/lecture-03";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Robotics · Lecture 3, keyed by walkthrough id. */
export const loaders = {
  "rob3-what-is-sensor": dynamic(() => import("./lecture-03/what-is-sensor").then((m) => m.Scene)),
  "rob3-limit-switch": dynamic(() => import("./lecture-03/limit-switch").then((m) => m.Scene)),
  "rob3-proximity": dynamic(() => import("./lecture-03/proximity").then((m) => m.Scene)),
  "rob3-photoelectric": dynamic(() => import("./lecture-03/photoelectric").then((m) => m.Scene)),
  "rob3-ldr": dynamic(() => import("./lecture-03/ldr").then((m) => m.Scene)),
  "rob3-potentiometer": dynamic(() => import("./lecture-03/potentiometer").then((m) => m.Scene)),
  "rob3-guidecane": dynamic(() => import("./lecture-03/guidecane").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
