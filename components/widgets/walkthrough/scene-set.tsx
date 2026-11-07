"use client";

export type SceneProps = { panel: string; control: string };

/**
 * Builds a scene file's `Scene` export from one drawing per panel. Typed with the panel ids
 * (PanelIdOf<typeof def>), so a panel without a drawing, or a stray one, is a type error.
 */
export function sceneSet<K extends string>(scenes: Record<K, React.ComponentType<{ control: string }>>) {
  return function Scene({ panel, control }: SceneProps) {
    const Panel: React.ComponentType<{ control: string }> | undefined = scenes[panel as K];
    return Panel ? <Panel control={control} /> : null;
  };
}
