/*
 * Arabic translations shown under the English. Every element carries the `ar` class so the
 * header toggle (html[data-arabic="off"]) can hide them all; the text stays in the HTML.
 */

/** `<Ar>` on its own line: a translated block under a paragraph, heading, list or table. */
export function Ar({ children }: { children: React.ReactNode }) {
  return (
    <div className="ar" lang="ar" dir="rtl">
      {children}
    </div>
  );
}

/**
 * `<Ar>` inside a paragraph, list item or table cell. The remarkArabic plugin renames
 * text-level `Ar` elements to this, so it renders a span (a div inside <p> is invalid HTML).
 */
export function ArInline({ children }: { children: React.ReactNode }) {
  return (
    <span className="ar ar-inline" lang="ar" dir="rtl">
      {children}
    </span>
  );
}

/** A short Arabic line for a component's title, label or caption (the `…Ar` props). */
export function ArLine({ children, inline = false }: { children?: React.ReactNode; inline?: boolean }) {
  if (!children) return null;
  return (
    <span className="ar ar-line" lang="ar" dir="rtl" data-inline={inline || undefined}>
      {typeof children === "string" ? isolateLatin(children) : children}
    </span>
  );
}

/*
 * Inside right-to-left text, an English stretch ("(man pages)", "man -k", "--help", "1..5",
 * "-height : int = 10", "INSTR('HelloWorld', 'W')") must be isolated left-to-right, or its
 * neutral characters (dashes, slashes, dots, brackets, operators) jump to the wrong end.
 * The text is split into Arabic and non-Arabic stretches (Arabic punctuation and «» count as
 * Arabic); a non-Arabic stretch containing a letter or digit is one isolated run.
 */
const ARABIC_STRETCH = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿«»]+(?:\s+[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿«»]+)*/g;

/** Wraps each English stretch of a plain Arabic string in <bdi dir="ltr"> so it reads correctly. */
export function isolateLatin(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pushLatin = (segment: string, offset: number) => {
    // Keep surrounding spaces and sentence punctuation outside the isolated run.
    const match = /^(\s*)(.*?)([\s.,:;!?]*)$/s.exec(segment)!;
    const [, lead, core, trail] = match;
    if (!/[A-Za-z0-9]/.test(core)) {
      out.push(segment);
      return;
    }
    if (lead) out.push(lead);
    out.push(
      <bdi key={offset} dir="ltr">
        {core}
      </bdi>,
    );
    if (trail) out.push(trail);
  };
  let last = 0;
  for (const match of text.matchAll(ARABIC_STRETCH)) {
    if (match.index > last) pushLatin(text.slice(last, match.index), last);
    out.push(match[0]);
    last = match.index + match[0].length;
  }
  if (last < text.length) pushLatin(text.slice(last), last);
  return out;
}

/** A plain Arabic string (frontmatter, subject.json) rendered with English runs isolated. */
export function ArText({ children }: { children?: string }) {
  return children ? <>{isolateLatin(children)}</> : null;
}
