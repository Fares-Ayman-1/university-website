import type { Metadata, Viewport } from "next";
import "@fontsource-variable/source-serif-4/wght.css";
import "@fontsource-variable/source-serif-4/wght-italic.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
// Arabic subset only: Latin inside Arabic text keeps using Inter (see --font-arabic).
import "@fontsource/ibm-plex-sans-arabic/arabic-400.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-600.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-700.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RevealObserver } from "@/components/RevealObserver";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { ARABIC_STORAGE_KEY } from "@/lib/arabic";

export const metadata: Metadata = {
  title: { default: "Quantro AI · University", template: "%s · Quantro AI" },
  description: "Study each subject through two independent tracks: lectures and sections.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1EA" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1A40" },
  ],
};

// Runs before first paint so the page never flashes the wrong theme.
const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;

// Arabic translations are shown unless the visitor turned them off; also set before paint.
const arabicInitScript = `(function(){var a="on";try{if(localStorage.getItem(${JSON.stringify(
  ARABIC_STORAGE_KEY,
)})==="off")a="off"}catch(e){}document.documentElement.dataset.arabic=a})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: arabicInitScript }} />
      </head>
      <body>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
