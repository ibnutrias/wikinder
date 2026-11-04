import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { COPY } from "@/lib/copy";

export function DeckSkeleton(): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full animate-pulse flex-col overflow-hidden rounded-[var(--radius-box)] bg-base-200 shadow-float"
    >
      <div className="h-[42%] min-h-28 w-full bg-base-300" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="h-7 w-4/5 rounded-[var(--radius-selector)] bg-base-300" />
        <Skeleton lines={4} />
      </div>
    </div>
  );
}

type DeckErrorProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function DeckError({ title, message, onRetry }: DeckErrorProps): React.ReactElement {
  return (
    <ErrorState
      title={title}
      message={message}
      action={
        <>
          <Button variant="primary" onClick={onRetry}>
            {COPY.umum.cobaLagi}
          </Button>
          <Button href="/collection">{COPY.error.keKoleksi}</Button>
        </>
      }
    />
  );
}
