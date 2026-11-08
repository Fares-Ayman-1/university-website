"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/software-engineering/lecture-04";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Software Engineering · Lecture 4, keyed by walkthrough id. */
export const loaders = {
  "se4-requirements": dynamic(() => import("./lecture-04/requirements").then((m) => m.Scene)),
  "se4-user-system": dynamic(() => import("./lecture-04/user-system").then((m) => m.Scene)),
  "se4-fr-nfr": dynamic(() => import("./lecture-04/fr-nfr").then((m) => m.Scene)),
  "se4-re-process": dynamic(() => import("./lecture-04/re-process").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
