import { MousePointerClick } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { BiText } from "./BiText";
import { UI } from "./i18n";
import type { Bi } from "./types";
import styles from "./widgets.module.css";

/**
 * Server-rendered frame around an interactive widget: kicker, title and caption (both
 * languages), with the client player as children. Scroll-revealed like figures.
 */
export function WidgetShell({
  name,
  kicker,
  title,
  titleAr,
  caption,
  captionAr,
  children,
}: {
  /** data-widget value, for styling and tests */
  name: string;
  kicker: Bi;
  title: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={`${styles.widget} reveal`} data-widget={name}>
      <header className={styles.head}>
        <span className={styles.badge} aria-hidden="true">
          <MousePointerClick />
        </span>
        <div>
          <p className={styles.kicker}>
            <BiText text={UI.interactive} inline /> · <BiText text={kicker} inline />
          </p>
          <p className={styles.title}>
            {title}
            <ArLine>{titleAr}</ArLine>
          </p>
        </div>
      </header>
      {children}
      {caption ? (
        <figcaption className={styles.caption}>
          {caption}
          <ArLine>{captionAr}</ArLine>
        </figcaption>
      ) : null}
    </figure>
  );
}
