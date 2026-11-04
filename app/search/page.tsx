import type { Metadata } from "next";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = { title: COPY.cari.judul };

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <h1 className="text-display text-[clamp(2rem,6vw,2.75rem)]">{COPY.cari.judul}</h1>
    </div>
  );
}
