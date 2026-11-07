"use client";

import dynamic from "next/dynamic";

/*
 * Code-split widget players. The dynamic import has to live in a client module: called from
 * a server component, next/dynamic does not split, and every player (plus framer-motion)
 * would ship with every lecture and section page. From here each player is its own chunk,
 * server-rendered as usual and downloaded only by pages that render it.
 */

export const ConvolutionPlayer = dynamic(() => import("./ConvolutionPlayer").then((m) => m.ConvolutionPlayer));
export const StateMachinePlayer = dynamic(() => import("./StateMachinePlayer").then((m) => m.StateMachinePlayer));
export const SearchStepperPlayer = dynamic(() => import("./SearchStepperPlayer").then((m) => m.SearchStepperPlayer));
export const RelationalAlgebraPlayer = dynamic(() =>
  import("./RelationalAlgebraPlayer").then((m) => m.RelationalAlgebraPlayer),
);
export const EncoderSimPlayer = dynamic(() => import("./EncoderSimPlayer").then((m) => m.EncoderSimPlayer));
export const WalkthroughPlayer = dynamic(() => import("./WalkthroughPlayer").then((m) => m.WalkthroughPlayer));
