"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Software Engineering · Lecture 1, keyed by walkthrough id. */
export const loaders = {
  "se1-what-is-software": dynamic(() => import("./lecture-01/software").then((m) => m.Scene)),
  "se1-attributes": dynamic(() => import("./lecture-01/attributes").then((m) => m.Scene)),
  "se1-engineering": dynamic(() => import("./lecture-01/engineering").then((m) => m.Scene)),
  "se1-products": dynamic(() => import("./lecture-01/products").then((m) => m.Scene)),
  "se1-process": dynamic(() => import("./lecture-01/process").then((m) => m.Scene)),
  "se1-challenges": dynamic(() => import("./lecture-01/challenges").then((m) => m.Scene)),
  "se1-app-types": dynamic(() => import("./lecture-01/app-types").then((m) => m.Scene)),
  "se1-ethics": dynamic(() => import("./lecture-01/ethics").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
