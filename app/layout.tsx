import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

import { BottomTabs, SideRail } from "@/components/nav";
import { StoreBridge } from "@/components/store-bridge";
import { ToastViewport } from "@/components/ui/toast";
import { COPY } from "@/lib/copy";
import { THEME_SCRIPT } from "@/lib/theme-script";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-schibsted",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: `${COPY.wordmark} · artikel Wikipedia, satu kartu setiap kali`,
    template: `%s · ${COPY.wordmark}`,
  },
  description: COPY.appDescription,
  applicationName: COPY.wordmark,
  openGraph: {
    title: COPY.wordmark,
    description: COPY.appDescription,
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="terang"
      suppressHydrationWarning
      className={`${schibsted.variable} ${newsreader.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-base-100 text-base-content antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-selector)] focus:bg-primary focus:px-4 focus:py-3 focus:t-14 focus:font-semibold focus:text-primary-content"
        >
          {COPY.skipToContent}
        </a>

        <StoreBridge />
        <SideRail />

        <div className="md:pl-[4.5rem] lg:pl-[15rem]">
          <main
            id="konten"
            className="min-h-dvh pb-[calc(4.5rem_+_env(safe-area-inset-bottom))] md:pb-0"
          >
            {children}
          </main>
        </div>

        <BottomTabs />
        <ToastViewport />
      </body>
    </html>
  );
}
