"use client";

import dynamic from "next/dynamic";
import type { all } from "@/lib/walkthroughs/image-processing/lecture-01";
import type { IdsOf } from "@/lib/widgets/walkthrough";
import type { SceneProps } from "../../scene-set";

/** One lazy chunk per walkthrough in Image Processing · Lecture 1, keyed by walkthrough id. */
export const loaders = {
  "ip1-images": dynamic(() => import("./lecture-01/images").then((m) => m.Scene)),
  "ip1-ip-vs-cv": dynamic(() => import("./lecture-01/ip-vs-cv").then((m) => m.Scene)),
  "ip1-applications": dynamic(() => import("./lecture-01/applications").then((m) => m.Scene)),
  "ip1-what-is-ip": dynamic(() => import("./lecture-01/what-is-ip").then((m) => m.Scene)),
  "ip1-acquisition": dynamic(() => import("./lecture-01/acquisition").then((m) => m.Scene)),
  "ip1-pixels": dynamic(() => import("./lecture-01/pixels").then((m) => m.Scene)),
  "ip1-raster-vector": dynamic(() => import("./lecture-01/raster-vector").then((m) => m.Scene)),
  "ip1-aspects": dynamic(() => import("./lecture-01/aspects").then((m) => m.Scene)),
  "ip1-task": dynamic(() => import("./lecture-01/task").then((m) => m.Scene)),
  "ip1-types": dynamic(() => import("./lecture-01/types").then((m) => m.Scene)),
  "ip1-file-size": dynamic(() => import("./lecture-01/file-size").then((m) => m.Scene)),
  "ip1-convert": dynamic(() => import("./lecture-01/convert").then((m) => m.Scene)),
} satisfies Record<IdsOf<typeof all>, React.ComponentType<SceneProps>>;
