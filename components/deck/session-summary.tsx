"use client";

import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import type { SessionCounts } from "@/components/deck/session-provider";

type SessionSummaryProps = {
  counts: SessionCounts;
  onRestart: () => void;
};

export function SessionSummary({ counts, onRestart }: SessionSummaryProps): React.ReactElement {
  return (
    <div className="flex h-full flex-col justify-center py-6">
      <div className="rounded-[var(--radius-box)] bg-base-200 p-6 shadow-float sm:p-8">
        <h2 className="t-36">{COPY.sesi.judul}</h2>
        <p className="mt-2 max-w-[40ch] t-16 text-muted">{COPY.sesi.ringkasan(counts.seen)}</p>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-hairline py-4">
          <div>
            <dt className="t-12 text-muted">{COPY.sesi.dilihat}</dt>
            <dd className="tabular t-28 font-semibold">{counts.seen}</dd>
          </div>
          <div>
            <dt className="t-12 text-muted">{COPY.sesi.disimpan}</dt>
            <dd className="tabular t-28 font-semibold text-primary">{counts.saved}</dd>
          </div>
          <div>
            <dt className="t-12 text-muted">{COPY.sesi.dilewati}</dt>
            <dd className="tabular t-28 font-semibold">{counts.skipped}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" size="lg" onClick={onRestart} block>
            {COPY.sesi.mulaiBaru}
          </Button>
          <Button href="/collection" size="lg" block>
            {COPY.sesi.lihatKoleksi}
          </Button>
        </div>
      </div>
    </div>
  );
}
