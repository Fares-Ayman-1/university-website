"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/robotics/lecture-04";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Robotics · Lecture 4, keyed by walkthrough id. */
export const loaders = {
  "rob4-encoders": dynamic(() => import("./lecture-04/encoders").then((m) => m.Scene)),
  "rob4-sonar": dynamic(() => import("./lecture-04/sonar").then((m) => m.Scene)),
  "rob4-lidar": dynamic(() => import("./lecture-04/lidar").then((m) => m.Scene)),
  "rob4-infrared": dynamic(() => import("./lecture-04/infrared").then((m) => m.Scene)),
  "rob4-tachometer": dynamic(() => import("./lecture-04/tachometer").then((m) => m.Scene)),
  "rob4-tactile": dynamic(() => import("./lecture-04/tactile").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
