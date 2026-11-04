"use client";

import { ChevronDown } from "lucide-react";
import { COPY } from "@/lib/copy";
import { ALLOWED_LANGS, LANG_LABEL, isLang } from "@/lib/wikipedia";
import { updateSettings, useSettings } from "@/lib/store";

export function LanguageSelect(): React.ReactElement {
  const { lang } = useSettings();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{COPY.deck.bahasa}</span>
      <select
        value={lang}
        onChange={(event) => {
          if (isLang(event.target.value)) updateSettings({ lang: event.target.value });
        }}
        className="h-11 appearance-none rounded-[var(--radius-field)] border border-hairline bg-base-200 pl-3 pr-9 t-14 font-medium text-base-content hover:bg-base-300"
      >
        {ALLOWED_LANGS.map((code) => (
          <option key={code} value={code}>
            {LANG_LABEL[code]}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={20}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-2.5 text-muted"
      />
    </label>
  );
}
