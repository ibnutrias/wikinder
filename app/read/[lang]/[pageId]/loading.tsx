export default function ReaderLoading() {
  return (
    <div className="min-h-dvh" aria-busy="true" aria-live="polite">
      <div className="fixed inset-x-0 top-0 z-40 h-14 border-b border-hairline bg-base-100" />
      <div className="pt-14" style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}>
        <div className="aspect-[16/9] w-full animate-pulse bg-base-300 sm:aspect-[21/9]" />
        <div className="mx-auto max-w-[72ch] px-4 pt-6 sm:px-6">
          <div className="h-9 w-3/4 animate-pulse rounded-[var(--radius-selector)] bg-base-300" />
          <div className="mt-3 h-4 w-40 animate-pulse rounded-[var(--radius-selector)] bg-base-300" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="h-4 animate-pulse rounded-[var(--radius-selector)] bg-base-300"
                style={{ width: index === 6 ? "58%" : index === 0 ? "92%" : "100%" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
