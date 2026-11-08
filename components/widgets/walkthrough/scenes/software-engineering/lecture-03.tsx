"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/software-engineering/lecture-03";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Software Engineering · Lecture 3, keyed by walkthrough id. */
export const loaders = {
  "se3-why": dynamic(() => import("./lecture-03/why").then((m) => m.Scene)),
  "se3-manifesto": dynamic(() => import("./lecture-03/manifesto").then((m) => m.Scene)),
  "se3-principles": dynamic(() => import("./lecture-03/principles").then((m) => m.Scene)),
  "se3-xp": dynamic(() => import("./lecture-03/xp").then((m) => m.Scene)),
  "se3-scrum": dynamic(() => import("./lecture-03/scrum").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
