import Link from "next/link";
import { getSubjects } from "@/lib/content";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const subjects = getSubjects();

  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Quantro AI home">
          <BrandMark />
        </Link>
        <nav className={styles.nav} aria-label="Subjects">
          {subjects.map((subject) => (
            <Link key={subject.slug} href={`/subjects/${subject.slug}/`} className={styles.navLink}>
              {subject.shortTitle}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
