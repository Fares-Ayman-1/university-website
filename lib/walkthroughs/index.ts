import type { WalkthroughDef } from "@/lib/widgets/walkthrough";
import * as db01 from "./databases/lecture-01";

/*
 * Every walkthrough, by id. A new one needs its definition here and its scenes in
 * components/widgets/walkthrough/scenes.tsx (TypeScript enforces the second).
 */
const ALL = [db01.basics, db01.files, db01.approach, db01.users, db01.evolution, db01.queryPath, db01.transactions, db01.programs] as const;

export type WalkthroughId = (typeof ALL)[number]["id"];

export const WALKTHROUGHS: Readonly<Record<string, WalkthroughDef>> = Object.fromEntries(ALL.map((def) => [def.id, def]));

if (Object.keys(WALKTHROUGHS).length !== ALL.length) {
  const ids = ALL.map((d) => d.id);
  throw new Error(`lib/walkthroughs: duplicate walkthrough ids: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(", ")}`);
}
