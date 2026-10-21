import "server-only";
import fs from "node:fs";
import path from "node:path";

const BRAND_DIR = path.join(process.cwd(), "public", "brand");
const EXTENSIONS = ["svg", "png", "webp"];

function findLogo(name: string): string | null {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(BRAND_DIR, `${name}.${ext}`))) return `/brand/${name}.${ext}`;
  }
  return null;
}

/**
 * Logo files live in ../brand (copied into public/brand by scripts/sync-materials.mjs):
 *   logo-navy.{svg,png,webp}  – navy mark, shown on the light theme
 *   logo-cream.{svg,png,webp} – cream mark, shown on the dark theme
 * If only one exists it is used for both themes; if neither exists the wordmark is shown.
 */
export function getLogos(): { light: string; dark: string } | null {
  const light = findLogo("logo-navy");
  const dark = findLogo("logo-cream");
  if (!light && !dark) return null;
  return { light: (light ?? dark)!, dark: (dark ?? light)! };
}
