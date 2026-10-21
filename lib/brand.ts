import "server-only";
import fs from "node:fs";
import path from "node:path";

const BRAND_DIR = path.join(process.cwd(), "public", "brand");
const EXTENSIONS = ["svg", "webp", "png"];

function findLogo(name: string): string | null {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(BRAND_DIR, `${name}.${ext}`))) return `/brand/${name}.${ext}`;
  }
  return null;
}

type ThemedLogo = { light: string; dark: string };

/** Pairs a navy file (light theme) with a cream file (dark theme); one alone serves both. */
function themedLogo(navyName: string, creamName: string): ThemedLogo | null {
  const light = findLogo(navyName);
  const dark = findLogo(creamName);
  if (!light && !dark) return null;
  return { light: (light ?? dark)!, dark: (dark ?? light)! };
}

/**
 * Logo files live in ../brand (copied into public/brand by scripts/sync-materials.mjs):
 *   logo-navy / logo-cream            – the mark without tagline, for the header
 *   logo-navy-full / logo-cream-full  – the full logo with tagline, for the home hero
 * Navy files are shown on the light theme, cream files on the dark theme.
 */
export function getLogos(): ThemedLogo | null {
  return themedLogo("logo-navy", "logo-cream");
}

export function getFullLogos(): ThemedLogo | null {
  return themedLogo("logo-navy-full", "logo-cream-full");
}
