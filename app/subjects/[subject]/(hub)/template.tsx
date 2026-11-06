"use client";

import { useEffect, useState } from "react";

// Set after the first mount: the first page load already plays the card entrances, so only
// later tab switches (Overview / Lectures / Sections / Review) fade the new tab in.
let hasMounted = false;

/** Re-mounts on every hub tab change; fades the new tab's content in (opacity only, CSS). */
export default function HubTemplate({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => hasMounted);
  useEffect(() => {
    hasMounted = true;
  }, []);
  return <div className={animate ? "hub-enter" : undefined}>{children}</div>;
}
