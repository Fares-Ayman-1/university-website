"use client";

import dynamic from "next/dynamic";
import type { WalkthroughId } from "@/lib/walkthroughs";
import type { SceneProps } from "./scene-set";

/*
 * One chunk per walkthrough: a page downloads only the drawings it shows. Keyed by
 * WalkthroughId, so a walkthrough without scenes is a type error.
 */
const SCENES: Record<WalkthroughId, React.ComponentType<SceneProps>> = {
  "db-basics": dynamic(() => import("./scenes/databases/basics").then((m) => m.Scene)),
  "db-files": dynamic(() => import("./scenes/databases/files").then((m) => m.Scene)),
  "db-approach": dynamic(() => import("./scenes/databases/approach").then((m) => m.Scene)),
  "db-users": dynamic(() => import("./scenes/databases/users").then((m) => m.Scene)),
  "db-evolution": dynamic(() => import("./scenes/databases/evolution").then((m) => m.Scene)),
  "db-query-path": dynamic(() => import("./scenes/databases/query-path").then((m) => m.Scene)),
  "db-transactions": dynamic(() => import("./scenes/databases/transactions").then((m) => m.Scene)),
  "db-programs": dynamic(() => import("./scenes/databases/programs").then((m) => m.Scene)),
};

export function WalkthroughScene({ id, panel, control }: SceneProps & { id: string }) {
  const Scene = SCENES[id as WalkthroughId];
  return Scene ? <Scene panel={panel} control={control} /> : null;
}

