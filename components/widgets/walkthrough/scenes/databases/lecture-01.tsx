"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/databases/lecture-01";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Databases · Lecture 1, keyed by walkthrough id. */
export const loaders = {
  "db-basics": dynamic(() => import("./lecture-01/basics").then((m) => m.Scene)),
  "db-files": dynamic(() => import("./lecture-01/files").then((m) => m.Scene)),
  "db-approach": dynamic(() => import("./lecture-01/approach").then((m) => m.Scene)),
  "db-users": dynamic(() => import("./lecture-01/users").then((m) => m.Scene)),
  "db-evolution": dynamic(() => import("./lecture-01/evolution").then((m) => m.Scene)),
  "db-query-path": dynamic(() => import("./lecture-01/query-path").then((m) => m.Scene)),
  "db-transactions": dynamic(() => import("./lecture-01/transactions").then((m) => m.Scene)),
  "db-programs": dynamic(() => import("./lecture-01/programs").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
