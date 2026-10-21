import type { ThemeRegistrationRaw } from "shiki";

const tokenColorRules: ThemeRegistrationRaw["settings"] = [
  { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#6B8FAF", fontStyle: "italic" } },
  {
    scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.logical", "keyword.operator.new"],
    settings: { foreground: "#D3AE6C" },
  },
  { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: "#8FE0BC" } },
  { scope: ["constant.numeric", "constant.language", "constant.character"], settings: { foreground: "#F2A97E" } },
  {
    scope: ["entity.name.function", "support.function", "meta.function-call.generic", "variable.function"],
    settings: { foreground: "#9EC3FF" },
  },
  {
    scope: ["entity.name.type", "entity.name.class", "support.class", "support.type", "entity.other.inherited-class"],
    settings: { foreground: "#F0D49A" },
  },
  { scope: ["variable.parameter", "variable.parameter.function"], settings: { foreground: "#E8C9A0" } },
  { scope: ["variable.language.self", "variable.language.this"], settings: { foreground: "#C9A5E8", fontStyle: "italic" } },
  { scope: ["keyword.operator", "punctuation"], settings: { foreground: "#B6C2DC" } },
  { scope: ["entity.name.tag"], settings: { foreground: "#D3AE6C" } },
  { scope: ["entity.other.attribute-name"], settings: { foreground: "#9EC3FF" } },
  { scope: ["markup.heading"], settings: { foreground: "#D3AE6C", fontStyle: "bold" } },
  { scope: ["variable.other.constant", "support.constant"], settings: { foreground: "#F2A97E" } },
];

/**
 * Shiki theme in the Quantro AI house style: navy code card, gold keywords,
 * mint strings, steel-blue comments, cream text. Used in both light and dark mode.
 */
export const quantroCodeTheme: ThemeRegistrationRaw = {
  name: "quantro",
  type: "dark",
  colors: {
    "editor.background": "#0C1A40",
    "editor.foreground": "#F5F1EA",
  },
  // rehype-pretty-code recognises a custom theme by its `tokenColors` key.
  tokenColors: tokenColorRules,
  settings: tokenColorRules,
};
