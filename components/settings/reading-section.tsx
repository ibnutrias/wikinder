"use client";

import { ListRow } from "@/components/ui/list-row";
import { Segmented } from "@/components/ui/segmented";
import { SwitchRow } from "@/components/ui/switch-row";
import { COPY } from "@/lib/copy";
import { updateSettings, useSettings } from "@/lib/store";
import { DEFAULT_SETTINGS } from "@/lib/types";

const RATES = ["0.8", "1", "1.25", "1.5"];

export function ReadingSection() {
  const settings = useSettings();

  return (
    <div>
      <SwitchRow
        label={COPY.pengaturan.bukaSemua}
        description={COPY.pengaturan.bukaSemuaBantuan}
        checked={settings.openAllSections}
        onChange={(checked) => updateSettings({ openAllSections: checked })}
      />
      <SwitchRow
        label={COPY.pengaturan.daftarIsiDesktop}
        description={COPY.pengaturan.daftarIsiDesktopBantuan}
        checked={settings.showTocDesktop}
        onChange={(checked) => updateSettings({ showTocDesktop: checked })}
      />
      <SwitchRow
        label={COPY.pengaturan.lanjutkan}
        description={COPY.pengaturan.lanjutkanBantuan}
        checked={settings.resumePrompt}
        onChange={(checked) => updateSettings({ resumePrompt: checked })}
      />
      <ListRow label={COPY.pengaturan.kecepatanBaca} align="start">
        <Segmented
          label={COPY.pengaturan.kecepatanBaca}
          value={String(settings.speechRate)}
          onChange={(value) => updateSettings({ speechRate: Number(value) })}
          options={RATES.map((rate) => ({ value: rate, label: `${rate}×` }))}
        />
      </ListRow>
      <button
        type="button"
        onClick={() =>
          updateSettings({
            openAllSections: DEFAULT_SETTINGS.openAllSections,
            showTocDesktop: DEFAULT_SETTINGS.showTocDesktop,
            resumePrompt: DEFAULT_SETTINGS.resumePrompt,
            speechRate: DEFAULT_SETTINGS.speechRate,
          })
        }
        className="mt-3 min-h-11 rounded-[var(--radius-selector)] t-14 font-medium text-primary hover:underline hover:underline-offset-4"
      >
        {COPY.reader.kembalikan}
      </button>
    </div>
  );
}
