import { buildSearchIndex } from "@/lib/search-index";

// Built once at build time into a static file; the Ctrl+K palette fetches it on first use.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
