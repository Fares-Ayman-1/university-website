import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  { ignores: [".next/**", "out/**", "node_modules/**", "public/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Animated islands use the lazy `m` components inside <MotionRoot>; `motion.*` would
      // bundle every framer-motion feature into the page.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              importNames: ["motion", "LazyMotion"],
              message: "Use `m` inside <MotionRoot> (components/motion/MotionRoot.tsx).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/motion/MotionRoot.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
];

export default eslintConfig;
