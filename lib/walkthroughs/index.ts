import type { WalkthroughDef } from "@/lib/widgets/walkthrough";
import * as db01 from "./databases/lecture-01";
import * as se01 from "./software-engineering/lecture-01";
import * as se02 from "./software-engineering/lecture-02";
import * as se03 from "./software-engineering/lecture-03";
import * as se04 from "./software-engineering/lecture-04";
import * as ip01 from "./image-processing/lecture-01";
import * as ip02 from "./image-processing/lecture-02";
import * as ip03 from "./image-processing/lecture-03";
import * as ip04 from "./image-processing/lecture-04";
import * as ip05 from "./image-processing/lecture-05";

/*
 * Every walkthrough, by id. Each lecture module exports its walkthroughs as `all`; its scene
 * loaders go in components/widgets/walkthrough/scenes/<subject>/lecture-NN.tsx, spread into
 * components/widgets/walkthrough/scenes.tsx (TypeScript enforces that every id has scenes).
 */
const ALL = [...db01.all, ...se01.all, ...se02.all, ...se03.all, ...se04.all, ...ip01.all, ...ip02.all, ...ip03.all, ...ip04.all, ...ip05.all] as const;

export type WalkthroughId = (typeof ALL)[number]["id"];

export const WALKTHROUGHS: Readonly<Record<string, WalkthroughDef>> = Object.fromEntries(ALL.map((def) => [def.id, def]));

if (Object.keys(WALKTHROUGHS).length !== ALL.length) {
  const ids = ALL.map((d) => d.id);
  throw new Error(`lib/walkthroughs: duplicate walkthrough ids: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(", ")}`);
}
