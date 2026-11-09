"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Artificial Intelligence · Lecture 3, keyed by walkthrough id. */
export const loaders = {
  "ai3-tree-search": dynamic(() => import("./lecture-03/tree-search").then((m) => m.Scene)),
  "ai3-evaluating": dynamic(() => import("./lecture-03/evaluating").then((m) => m.Scene)),
  "ai3-bfs": dynamic(() => import("./lecture-03/bfs").then((m) => m.Scene)),
  "ai3-ucs": dynamic(() => import("./lecture-03/ucs").then((m) => m.Scene)),
  "ai3-dfs": dynamic(() => import("./lecture-03/dfs").then((m) => m.Scene)),
  "ai3-dls": dynamic(() => import("./lecture-03/dls").then((m) => m.Scene)),
  "ai3-ids": dynamic(() => import("./lecture-03/ids").then((m) => m.Scene)),
  "ai3-summary": dynamic(() => import("./lecture-03/summary").then((m) => m.Scene)),
  "ai3-graph-search": dynamic(() => import("./lecture-03/graph-search").then((m) => m.Scene)),
  "ai3-python": dynamic(() => import("./lecture-03/python").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
