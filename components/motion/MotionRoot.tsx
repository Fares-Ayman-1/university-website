"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

const loadFeatures = () => import("@/lib/motion-features").then((module) => module.default);

/**
 * Wrap each animated island (not the whole app) in this, and use `m.*` components inside.
 * - Features (animation + layout) load lazily, so pages without islands ship no framer code.
 * - Every animation defaults to a calm tween; framer's default would be a bouncy spring.
 * - `reducedMotion="user"` drops transform/layout animation for visitors who ask for less motion.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ type: "tween", duration: DUR.standard, ease: EASE.outExpo }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
