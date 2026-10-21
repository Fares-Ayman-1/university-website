import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          <strong>Quantro AI</strong> · University study platform
        </p>
        <p className={styles.note}>Lectures and sections are independent tracks within each subject.</p>
      </div>
    </footer>
  );
}
