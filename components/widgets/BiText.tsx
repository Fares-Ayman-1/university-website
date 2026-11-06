import { ArLine } from "@/components/mdx/Arabic";
import type { Bi } from "./types";

/** English, with its Arabic on the next line (or inline), hidden with the «ع» toggle like all Arabic. */
export function BiText({ text, inline }: { text: Bi; inline?: boolean }) {
  return (
    <>
      {text.en}
      {inline ? " " : null}
      <ArLine inline={inline}>{text.ar}</ArLine>
    </>
  );
}
