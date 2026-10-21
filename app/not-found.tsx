import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container" style={{ paddingBlock: "var(--space-7)", textAlign: "center" }}>
      <p className="kicker">404</p>
      <h1 style={{ marginTop: 12, fontSize: "var(--text-3xl)" }}>This page isn&apos;t in the syllabus.</h1>
      <p style={{ marginTop: 12, color: "var(--muted)" }}>
        The lecture or section you&apos;re looking for doesn&apos;t exist (yet).
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: "var(--gold-text)", fontWeight: 600 }}>
          ← Back to all subjects
        </Link>
      </p>
    </section>
  );
}
