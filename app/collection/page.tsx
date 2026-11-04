import type { Metadata } from "next";
import { CollectionView } from "@/components/collection/collection-view";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: `${COPY.koleksi.judul} · ${COPY.wordmark}`,
  description: COPY.koleksi.subjudul,
};

export default function CollectionPage() {
  return <CollectionView />;
}
