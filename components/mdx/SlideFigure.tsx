import fs from "node:fs";
import path from "node:path";
import type { Collection } from "@/lib/content";
import styles from "./mdx.module.css";

type Manifest = Record<string, { width: number; height: number }>;

let manifestCache: Manifest | null = null;

function readManifest(): Manifest {
  if (manifestCache && process.env.NODE_ENV === "production") return manifestCache;
  const file = path.join(process.cwd(), "public", "slides", "manifest.json");
  manifestCache = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Manifest) : {};
  return manifestCache;
}

/**
 * A slide rendered from one of this item's source PDFs by scripts/render-slides.py.
 * `source` is the index into the frontmatter `sources` list (default: the first one).
 */
export function SlideFigure({
  page,
  source = 0,
  caption,
  alt,
  context,
}: {
  page: number;
  source?: number;
  caption?: string;
  alt?: string;
  context: { subject: string; collection: Collection; slug: string };
}) {
  const key = `${context.subject}/${context.collection}/${context.slug}/s${source}-p${page}.webp`;
  const size = readManifest()[key];
  const label = alt ?? caption ?? `Slide ${page}`;

  if (!size) {
    return (
      <figure className={styles.figure}>
        <div className={styles.figureMissing}>
          Slide {page} has not been rendered yet. Run <code>npm run slides</code>.
        </div>
      </figure>
    );
  }

  return (
    <figure className={styles.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/slides/${key}`}
        alt={label}
        width={size.width}
        height={size.height}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <span className={styles.figureTag}>Slide {page}</span>
        {caption}
      </figcaption>
    </figure>
  );
}
