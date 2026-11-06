"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { BookOpen, FlaskConical, GraduationCap, LayoutGrid } from "lucide-react";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { DUR, EASE } from "@/lib/motion";
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
    { href: base, label: "Overview", icon: LayoutGrid, kind: undefined, count: undefined, prefix: false },
    { href: `${base}lectures/`, label: "Lectures", icon: BookOpen, kind: "lectures", count: lectureCount, prefix: false },
    { href: `${base}sections/`, label: "Sections", icon: FlaskConical, kind: "sections", count: sectionCount, prefix: false },
    // Stays active on its sub-pages (flashcards, exam).
    { href: `${base}review/`, label: "Review", icon: GraduationCap, kind: undefined, count: undefined, prefix: true },
  ];
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <div className={styles.bar}>
      <MotionRoot>
        <nav className={`container ${styles.tabs}`} aria-label="Subject navigation">
          {tabs.map((tab) => {
            const active = tab.prefix ? normalized.startsWith(tab.href) : normalized === tab.href;
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
                    transition={{ type: "tween", duration: DUR.standard, ease: EASE.outExpo }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </MotionRoot>
    </div>
  );
}
