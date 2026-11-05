/**
 * Arabic translations are always in the HTML (so they're crawlable); this only controls
 * whether they're shown. `html[data-arabic="off"]` hides every `.ar` element via CSS.
 */
export const ARABIC_STORAGE_KEY = "quantro-arabic";

export function readArabicShown(): boolean {
  return document.documentElement.dataset.arabic !== "off";
}

export function applyArabicShown(shown: boolean) {
  document.documentElement.dataset.arabic = shown ? "on" : "off";
  try {
    localStorage.setItem(ARABIC_STORAGE_KEY, shown ? "on" : "off");
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
}
