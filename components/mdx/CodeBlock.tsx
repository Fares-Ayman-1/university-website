"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import styles from "./mdx.module.css";

type PreProps = React.ComponentProps<"pre"> & { "data-language"?: string };

const LANGUAGE_LABELS: Record<string, string> = {
  py: "Python",
  python: "Python",
  bash: "Terminal",
  sh: "Terminal",
  plaintext: "Text",
  text: "Text",
  cmake: "CMake",
  cpp: "C++ (Arduino)",
  arduino: "C++ (Arduino)",
  xml: "XML",
  yaml: "YAML",
  msg: "ROS msg",
};

export function CodeBlock({ children, ...props }: PreProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = props["data-language"] ?? "plaintext";

  async function copy() {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the code is still selectable.
    }
  }

  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span className={styles.codeDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.codeLang}>{LANGUAGE_LABELS[language] ?? language}</span>
        <button type="button" className={styles.copy} onClick={copy} aria-label="Copy code">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </div>
  );
}
