import { COPY } from "@/lib/copy";
import { APP_VERSION } from "@/lib/version";

export function AboutSection() {
  return (
    <div className="space-y-5">
      <p className="max-w-[56ch] t-16 text-muted">{COPY.pengaturan.tentangIsi}</p>

      <p className="t-14">
        <span className="font-medium">{COPY.pengaturan.versi}</span>{" "}
        <span className="tabular text-muted">{APP_VERSION}</span>
      </p>

      <div>
        <h3 className="t-14 font-semibold">{COPY.pengaturan.pintasan}</h3>
        <dl className="mt-2 divide-y divide-hairline">
          {COPY.reader.pintasanDaftar.map((item) => (
            <div key={item.kunci} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="t-14">{item.aksi}</dt>
              <dd>
                <kbd className="rounded-[var(--radius-selector)] border border-hairline bg-base-200 px-2 py-1 t-12 font-medium">
                  {item.kunci}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center t-14 font-medium text-primary underline underline-offset-2"
      >
        {COPY.pengaturan.lisensi}
      </a>
    </div>
  );
}
