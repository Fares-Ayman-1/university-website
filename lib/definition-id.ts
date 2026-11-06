import { slug } from "github-slugger";

/**
 * Anchor id of a <Definition>, e.g. "Spatial filtering" → "def-spatial-filtering". The prefix
 * keeps it apart from heading ids; flashcards link back to the definition with it.
 */
export function definitionId(term: string): string {
  return `def-${slug(term)}`;
}
