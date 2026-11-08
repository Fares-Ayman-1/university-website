import type { Bi } from "@/components/widgets/types";

/*
 * Walkthroughs: a heading's ideas as a row of panels, each with an animated SVG scene, a
 * short explanation and sometimes a toggle. The text lives here as data (typed Bi, so the
 * Arabic can't be forgotten); the scenes are client components in
 * components/widgets/walkthrough/scenes/, one file per walkthrough, keyed by panel id.
 */

export type ControlOption = { id: string; label: Bi };

/** A segmented toggle above the scene: the scene and the extra points follow the choice. */
export type ControlDef = {
  label: Bi;
  options: readonly ControlOption[];
  initial: string;
};

export type PanelDef = {
  id: string;
  /** Short label on the step pill */
  pill: Bi;
  heading: Bi;
  points: readonly Bi[];
  control?: ControlDef;
  /** Points shown after `points` only while that control option is chosen */
  pointsFor?: Readonly<Record<string, readonly Bi[]>>;
};

export type WalkthroughDef = {
  id: string;
  title: Bi;
  /** One line under the panels: "Think of it as…" */
  analogy?: Bi;
  panels: readonly PanelDef[];
  /**
   * Numbers the scenes show, computed by pure code (lib/widgets/*). The page's `expect` can
   * name them ("lost=500"), so a scene can't drift from the worked example in the text.
   */
  facts?: Readonly<Record<string, string | number>>;
};

/** Keeps the id and panel ids as literal types, so the scene registry and scene files can be typed against them. */
export function defineWalkthrough<const I extends string, const P extends readonly PanelDef[]>(def: Omit<WalkthroughDef, "id" | "panels"> & { id: I; panels: P }) {
  return def;
}

export type PanelIdOf<W extends { panels: readonly { id: string }[] }> = W["panels"][number]["id"];

/** The walkthrough ids in a lecture module's `all` list. */
export type IdsOf<T extends readonly { id: string }[]> = T[number]["id"];

/**
 * Throws (failing the static build) when the definition is malformed or disagrees with the
 * page. `expect` is the panel ids in order, then optionally `; fact=value` clauses:
 *   expect="acid, crash, lost-update; transfer=500; lost=500"
 */
export function validateWalkthrough(def: WalkthroughDef, expect: string | undefined, where: string): void {
  const problems: string[] = [];
  const ids = def.panels.map((p) => p.id);
  if (ids.length === 0) problems.push("it has no panels");
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`duplicate panel ids: ${[...new Set(dupes)].join(", ")}`);

  for (const p of def.panels) {
    if (p.points.length === 0) problems.push(`panel "${p.id}" has no points`);
    if (p.control) {
      const options = p.control.options.map((o) => o.id);
      if (options.length < 2) problems.push(`panel "${p.id}": a control needs at least two options`);
      if (!options.includes(p.control.initial)) problems.push(`panel "${p.id}": initial "${p.control.initial}" is not one of ${options.join(", ")}`);
    }
    for (const key of Object.keys(p.pointsFor ?? {})) {
      if (!p.control?.options.some((o) => o.id === key)) problems.push(`panel "${p.id}": pointsFor["${key}"] has no matching control option`);
    }
  }

  if (expect !== undefined) {
    const [panelList, ...clauses] = expect.split(";").map((s) => s.trim());
    const wanted = panelList.split(",").map((s) => s.trim()).filter(Boolean);
    if (wanted.join() !== ids.join()) problems.push(`expect lists panels [${wanted.join(", ")}] but the walkthrough has [${ids.join(", ")}]`);
    for (const clause of clauses.filter(Boolean)) {
      const match = /^([\w-]+)\s*=\s*(.+)$/.exec(clause);
      if (!match) {
        problems.push(`expect clause "${clause}" is not of the form name=value`);
        continue;
      }
      const [, name, value] = match;
      const actual = def.facts?.[name];
      if (actual === undefined) problems.push(`expect names fact "${name}", which the walkthrough doesn't define (known: ${Object.keys(def.facts ?? {}).join(", ") || "none"})`);
      else if (String(actual) !== value.trim()) problems.push(`fact ${name} is ${actual}, but the page expects ${value.trim()}`);
    }
  }

  if (problems.length) throw new Error(`${where} "${def.id}":\n  ${problems.join("\n  ")}`);
}
