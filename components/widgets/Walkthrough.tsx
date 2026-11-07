import { WALKTHROUGHS } from "@/lib/walkthroughs";
import { validateWalkthrough } from "@/lib/widgets/walkthrough";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { WalkthroughPlayer } from "./players";

/** "5 panels" in Arabic: the dual for 2, a plural for 3–10, a singular from 11 on. */
const panelsAr = (n: number) => (n === 1 ? "لوحة واحدة" : n === 2 ? "لوحتان" : n <= 10 ? `${n} لوحات` : `${n} لوحة`);

/**
 * <Walkthrough id="db-transactions" expect="acid, crash, lost-update, deadlock, redo; lost=500" />
 *
 * A heading's ideas as panels: step pills, an animated drawing per panel, the panel's points,
 * Back/Next. The text is in lib/walkthroughs/<subject>/…; the drawings are in
 * components/widgets/walkthrough/scenes/<subject>/…, one file per walkthrough.
 *
 * `expect`, copied from the page, makes the build fail when the walkthrough disagrees with
 * it: the panel ids in order, then optional `; fact=value` clauses checked against the
 * numbers the scenes draw (see validateWalkthrough in lib/widgets/walkthrough.ts).
 */
export function Walkthrough({ id, expect, caption, captionAr }: { id: string; expect?: string; caption?: string; captionAr?: string }) {
  const where = "<Walkthrough>";
  const def = WALKTHROUGHS[id];
  if (!def) throw new Error(`${where}: unknown id "${id}" (known: ${Object.keys(WALKTHROUGHS).join(", ")})`);
  validateWalkthrough(def, expect, where);
  const n = def.panels.length;

  return (
    <WidgetShell
      name="walkthrough"
      kicker={bi(`Walkthrough · ${n} panel${n === 1 ? "" : "s"}`, `جولة مرئية · ${panelsAr(n)}`)}
      title={def.title.en}
      titleAr={def.title.ar}
      caption={caption}
      captionAr={captionAr}
    >
      <WalkthroughPlayer def={def} />
    </WidgetShell>
  );
}
