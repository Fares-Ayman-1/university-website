import { prepare, type PreparedDoc, type SearchDoc } from "@/lib/search";

let indexPromise: Promise<PreparedDoc[]> | null = null;

/** Fetches /search-index.json once per visit (also used to prefetch on hover/focus). */
export function loadSearchIndex(): Promise<PreparedDoc[]> {
  indexPromise ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`search index: HTTP ${response.status}`);
      return response.json() as Promise<SearchDoc[]>;
    })
    .then(prepare)
    .catch((error) => {
      indexPromise = null; // allow a retry on the next open
      throw error;
    });
  return indexPromise;
}
