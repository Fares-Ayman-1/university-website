"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { BookOpen, FlaskConical, LayoutGrid } from "lucide-react";
import styles from "./SubjectTabs.module.css";

export function SubjectTabs({
  subject,
  lectureCount,
  sectionCount,
}: {
  subject: string;
  lectureCount: number;
  sectionCount: number;
}) {
  const pathname = usePathname();
  const base = `/subjects/${subject}/`;
  const tabs = [
    { href: base, label: "Overview", icon: LayoutGrid, kind: undefined, count: undefined },
    { href: `${base}lectures/`, label: "Lectures", icon: BookOpen, kind: "lectures", count: lectureCount },
    { href: `${base}sections/`, label: "Sections", icon: FlaskConical, kind: "sections", count: sectionCount },
  ];
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <div className={styles.bar}>
      <LazyMotion features={domAnimation}>
        <nav className={`container ${styles.tabs}`} aria-label="Subject navigation">
          {tabs.map((tab) => {
            const active = normalized === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={styles.tab}
                data-kind={tab.kind}
                aria-current={active ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                {tab.label}
                {tab.count !== undefined ? <span className={styles.count}>{tab.count}</span> : null}
                {active ? (
                  <m.span
                    layoutId={`tab-indicator-${subject}`}
                    className={styles.indicator}
                    transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </LazyMotion>
    </div>
  );
}
