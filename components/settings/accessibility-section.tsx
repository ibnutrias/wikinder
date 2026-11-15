"use client";

import { ListRow } from "@/components/ui/list-row";
import { Segmented } from "@/components/ui/segmented";
import { SwitchRow } from "@/components/ui/switch-row";
import { COPY } from "@/lib/copy";
import { updateSettings, useSettings } from "@/lib/store";
import { MOTION_PREFERENCES, TOUCH_TARGETS, type MotionPreference, type TouchTarget } from "@/lib/types";

export function AccessibilitySection() {
  const settings = useSettings();

  return (
    <div>
      <ListRow label={COPY.pengaturan.gerak} description={COPY.pengaturan.gerakBantuan} align="start">
        <Segmented
          label={COPY.pengaturan.gerak}
          value={settings.motion}
          onChange={(value) =>
            updateSettings({ motion: value as MotionPreference })
          }
          options={MOTION_PREFERENCES.map((value) => ({
            value,
            label: COPY.pengaturan.gerakNama[value],
          }))}
        />
      </ListRow>

      <SwitchRow
        label={COPY.pengaturan.kontras}
        description={COPY.pengaturan.kontrasBantuan}
        checked={settings.theme === "kontras"}
        onChange={(checked) => updateSettings({ theme: checked ? "kontras" : "system" })}
      />

      <ListRow
        label={COPY.pengaturan.targetSentuh}
        description={COPY.pengaturan.targetSentuhBantuan}
        align="start"
      >
        <Segmented
          label={COPY.pengaturan.targetSentuh}
          value={settings.touchTarget}
          onChange={(value) => updateSettings({ touchTarget: value as TouchTarget })}
          options={TOUCH_TARGETS.map((value) => ({
            value,
            label: COPY.pengaturan.targetNama[value],
          }))}
        />
      </ListRow>
    </div>
  );
}
