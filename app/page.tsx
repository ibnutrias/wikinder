import type { Metadata } from "next";
import { ExploreView } from "@/components/deck/explore-view";
import { SessionProvider } from "@/components/deck/session-provider";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: `${COPY.nav.jelajah} · ${COPY.wordmark}`,
};

export default function HomePage() {
  return (
    <SessionProvider>
      <ExploreView />
    </SessionProvider>
  );
}
