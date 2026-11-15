"use client";

import { useSyncExternalStore } from "react";
import { ListRow } from "@/components/ui/list-row";
import { Segmented } from "@/components/ui/segmented";
import { SwitchRow } from "@/components/ui/switch-row";
import { COPY } from "@/lib/copy";
import { updateSettings, useSettings } from "@/lib/store";
import { showToast } from "@/lib/toast";
import { ALLOWED_LANGS, LANG_LABEL, isLang } from "@/lib/wikipedia";
import { SESSION_LENGTHS, type SessionLength } from "@/lib/types";

function subscribeToNothing(): () => void {
  return () => {};
}

export function ExploreSection() {
  const settings = useSettings();
  const hapticsSupported = useSyncExternalStore(
    subscribeToNothing,
    () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function",
    () => false,
  );

  return (
    <div>
      <ListRow label={COPY.pengaturan.bahasa} description={COPY.pengaturan.bahasaBantuan} align="start">
        <Segmented
          label={COPY.pengaturan.bahasa}
          value={settings.lang}
          onChange={(value) => {
            if (isLang(value)) updateSettings({ lang: value });
          }}
          options={ALLOWED_LANGS.map((code) => ({ value: code, label: LANG_LABEL[code] ?? code }))}
        />
      </ListRow>

      <SwitchRow
        label={COPY.pengaturan.hanyaBergambar}
        description={COPY.pengaturan.hanyaBergambarBantuan}
        checked={settings.imageOnly}
        onChange={(checked) => updateSettings({ imageOnly: checked })}
      />

      <ListRow label={COPY.pengaturan.jumlahKartu} align="start">
        <Segmented
          label={COPY.pengaturan.jumlahKartu}
          value={String(settings.sessionLength)}
          onChange={(value) => {
            const length = Number(value);
            if ((SESSION_LENGTHS as readonly number[]).includes(length)) {
              updateSettings({ sessionLength: length as SessionLength });
            }
          }}
          options={SESSION_LENGTHS.map((length) => ({
            value: String(length),
            label: String(length),
          }))}
        />
      </ListRow>

      {hapticsSupported ? (
        <SwitchRow
          label={COPY.pengaturan.getaran}
          description={COPY.pengaturan.getaranBantuan}
          checked={settings.haptics}
          onChange={(checked) => updateSettings({ haptics: checked })}
        />
      ) : null}

      <ListRow label={COPY.pengaturan.petunjukGestur} description={COPY.pengaturan.petunjukGesturBantuan}>
        <button
          type="button"
          onClick={() => {
            updateSettings({ gestureHint: true });
            showToast({ message: COPY.pengaturan.petunjukDinyalakan });
          }}
          className="min-h-11 rounded-[var(--radius-field)] border border-hairline px-3 t-14 font-medium hover:bg-base-200"
        >
          {COPY.pengaturan.petunjukGestur}
        </button>
      </ListRow>
    </div>
  );
}
