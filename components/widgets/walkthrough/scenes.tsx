"use client";

import type { WalkthroughId } from "@/lib/walkthroughs";
import type { SceneProps } from "./scene-set";
import { loaders as db01 } from "./scenes/databases/lecture-01";
import { loaders as se01 } from "./scenes/software-engineering/lecture-01";
import { loaders as se02 } from "./scenes/software-engineering/lecture-02";
import { loaders as se03 } from "./scenes/software-engineering/lecture-03";
import { loaders as se04 } from "./scenes/software-engineering/lecture-04";
import { loaders as ip01 } from "./scenes/image-processing/lecture-01";
import { loaders as ip02 } from "./scenes/image-processing/lecture-02";
import { loaders as ip03 } from "./scenes/image-processing/lecture-03";
import { loaders as ip05 } from "./scenes/image-processing/lecture-05";

/*
 * One chunk per walkthrough: a page downloads only the drawings it shows. Each lecture's
 * loaders live next to its scenes (scenes/<subject>/lecture-NN.tsx); keyed by WalkthroughId,
 * so a walkthrough without scenes is a type error.
 */
const SCENES: Record<WalkthroughId, React.ComponentType<SceneProps>> = {
  ...db01,
  ...se01,
  ...se02,
  ...se03,
  ...se04,
  ...ip01,
  ...ip02,
  ...ip03,
  ...ip05,
};

export function WalkthroughScene({ id, panel, control }: SceneProps & { id: string }) {
  const Scene = SCENES[id as WalkthroughId];
  return Scene ? <Scene panel={panel} control={control} /> : null;
}
