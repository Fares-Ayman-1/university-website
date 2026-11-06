import { runPath, validateMachine } from "@/lib/widgets/state-machine";
import { isPresetName, PRESET_NAMES, PRESETS } from "./state-machine/presets";
import { WidgetShell } from "./WidgetShell";
import { StateMachinePlayer } from "./players";


/**
 * <StateMachine preset="process-states" expect="admit,dispatch,exit" caption="…" captionAr="…" />
 * The machine (states, events, guards, actions, diagram) is a named preset in
 * state-machine/presets.ts; its functions can't cross to the client, so only the name does.
 * `expect`, a comma-separated event path from the initial state, makes the build fail if any
 * of its events can't fire.
 */
export function StateMachine({
  preset,
  expect,
  title,
  titleAr,
  caption,
  captionAr,
}: {
  preset: string;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  const where = `<StateMachine preset="${preset}">`;
  if (!isPresetName(preset)) {
    throw new Error(`${where}: unknown preset (known: ${PRESET_NAMES.join(", ")})`);
  }
  const machine = PRESETS[preset];
  validateMachine(machine, where);
  if (expect !== undefined) runPath(machine, expect, where);

  return (
    <WidgetShell
      name="state-machine"
      kicker={machine.kicker}
      title={title ?? machine.title.en}
      titleAr={title ? titleAr : (titleAr ?? machine.title.ar)}
      caption={caption}
      captionAr={captionAr}
    >
      <StateMachinePlayer preset={preset} />
    </WidgetShell>
  );
}
