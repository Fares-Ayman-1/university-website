import { getLogos } from "@/lib/brand";
import styles from "./SiteHeader.module.css";

export function BrandMark() {
  const logos = getLogos();

  return (
    <span className={styles.wordmark}>
      {logos ? (
        <span className={styles.logo} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logos.light} alt="" className="only-light" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logos.dark} alt="" className="only-dark" />
        </span>
      ) : (
        <svg className={styles.monogram} viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="15" cy="15" r="10.5" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M19.5 19.5 L27 27" stroke="var(--gold)" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="15" cy="15" r="3.2" fill="var(--gold)" />
        </svg>
      )}
      <span className={styles.wordmarkText}>
        Quantro <span className={styles.wordmarkAi}>AI</span>
      </span>
    </span>
  );
}
