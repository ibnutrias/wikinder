import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";

import { BottomTabs, SideRail } from "@/components/nav";
import { StoreBridge } from "@/components/store-bridge";
import { COPY } from "@/lib/copy";
import { THEME_SCRIPT } from "@/lib/theme-script";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: {
    default: `${COPY.wordmark} — artikel Wikipedia, satu kartu setiap kali`,
    template: `%s · ${COPY.wordmark}`,
  },
  description: COPY.appDescription,
  applicationName: COPY.wordmark,
  authors: [{ name: "Wikinder" }],
  openGraph: {
    title: COPY.wordmark,
    description: COPY.appDescription,
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#14120f" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="kertas"
      suppressHydrationWarning
      className={`${instrument.variable} ${newsreader.variable} ${hanken.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="paper-grain min-h-dvh bg-base-100 text-base-content antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-field)] focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-content"
        >
          {COPY.skipToContent}
        </a>

        <StoreBridge />
        <SideRail />

        <div className="md:pl-[4.5rem] lg:pl-[14.5rem]">
          <main
            id="konten"
            className="min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:min-h-dvh md:pb-0"
          >
            {children}
          </main>
        </div>

        <BottomTabs />
      </body>
    </html>
  );
}
