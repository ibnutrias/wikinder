import type { Metadata } from "next";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = { title: COPY.koleksi.judul };

export default function CollectionPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <h1 className="text-display text-[clamp(2rem,6vw,2.75rem)]">{COPY.koleksi.judul}</h1>
    </div>
  );
}
