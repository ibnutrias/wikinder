"use client";

import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

export default function ReaderError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <h1 className="t-28">{COPY.error.judul}</h1>
      <p className="mt-2 t-16 text-muted">{COPY.error.pesan}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="primary" onClick={reset}>
          {COPY.umum.cobaLagi}
        </Button>
        <Button href="/">{COPY.error.keJelajah}</Button>
        <Button href="/collection">{COPY.error.keKoleksi}</Button>
      </div>
    </div>
  );
}
