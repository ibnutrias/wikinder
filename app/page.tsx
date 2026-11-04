import { Wordmark } from "@/components/wordmark";
import { COPY } from "@/lib/copy";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8">
      <Wordmark size="sm" />
      <h1 className="text-display text-[clamp(2rem,7vw,3rem)]">{COPY.deck.petunjuk}</h1>
    </div>
  );
}
