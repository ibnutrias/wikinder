"use client";

import { AccessibilitySection } from "@/components/settings/accessibility-section";
import { AboutSection } from "@/components/settings/about-section";
import { DataSection } from "@/components/settings/data-section";
import { ExploreSection } from "@/components/settings/explore-section";
import { ReadingSection } from "@/components/settings/reading-section";
import { SettingGroup } from "@/components/settings/section";
import { AppearanceControls } from "@/components/reader/appearance-controls";
import { PageHeader } from "@/components/ui/page-header";
import { COPY } from "@/lib/copy";
import { updateSettings, useSettings } from "@/lib/store";
import { useScrollSpy } from "@/lib/use-scroll-spy";
import { DEFAULT_SETTINGS } from "@/lib/types";

const SECTIONS = [
  { id: "tampilan", label: COPY.pengaturan.tampilan },
  { id: "jelajah", label: COPY.pengaturan.jelajah },
  { id: "membaca", label: COPY.pengaturan.membaca },
  { id: "aksesibilitas", label: COPY.pengaturan.aksesibilitas },
  { id: "data", label: COPY.pengaturan.data },
  { id: "tentang", label: COPY.pengaturan.tentang },
] as const;

export function SettingsView(): React.ReactElement {
  const settings = useSettings();
  const activeId = useScrollSpy(SECTIONS.map((section) => section.id));

  const goTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <PageHeader title={COPY.pengaturan.judul} description={COPY.pengaturan.subjudul} />

      <div className="mt-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label={COPY.pengaturan.indeks} className="hidden lg:block">
          <div className="sticky top-6">
            <p className="t-12 font-semibold text-muted">{COPY.pengaturan.indeks}</p>
            <ul className="mt-2 space-y-0.5">
              {SECTIONS.map((section) => {
                const active = activeId === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => goTo(section.id)}
                      aria-current={active ? "location" : undefined}
                      className={`flex min-h-10 w-full items-center rounded-[var(--radius-selector)] px-2 text-left t-14 ${
                        active
                          ? "bg-base-200 font-semibold text-primary"
                          : "text-muted hover:text-base-content"
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 max-w-[640px]">
          <SettingGroup id="tampilan" title={COPY.pengaturan.tampilan} description={COPY.pengaturan.temaBantuan}>
            <AppearanceControls />
          </SettingGroup>

          <SettingGroup
            id="jelajah"
            title={COPY.pengaturan.jelajah}
            resetLabel={COPY.reader.kembalikan}
            onReset={() =>
              updateSettings({
                lang: DEFAULT_SETTINGS.lang,
                imageOnly: DEFAULT_SETTINGS.imageOnly,
                sessionLength: DEFAULT_SETTINGS.sessionLength,
                haptics: DEFAULT_SETTINGS.haptics,
                gestureHint: true,
              })
            }
          >
            <ExploreSection />
          </SettingGroup>

          <SettingGroup
            id="membaca"
            title={COPY.pengaturan.membaca}
            resetLabel={COPY.reader.kembalikan}
            onReset={() =>
              updateSettings({
                openAllSections: DEFAULT_SETTINGS.openAllSections,
                showTocDesktop: DEFAULT_SETTINGS.showTocDesktop,
                resumePrompt: DEFAULT_SETTINGS.resumePrompt,
                speechRate: DEFAULT_SETTINGS.speechRate,
              })
            }
          >
            <ReadingSection />
          </SettingGroup>

          <SettingGroup
            id="aksesibilitas"
            title={COPY.pengaturan.aksesibilitas}
            resetLabel={COPY.reader.kembalikan}
            onReset={() =>
              updateSettings({
                motion: DEFAULT_SETTINGS.motion,
                touchTarget: DEFAULT_SETTINGS.touchTarget,
                theme: settings.theme === "kontras" ? DEFAULT_SETTINGS.theme : settings.theme,
              })
            }
          >
            <AccessibilitySection />
          </SettingGroup>

          <SettingGroup id="data" title={COPY.pengaturan.data}>
            <DataSection />
          </SettingGroup>

          <SettingGroup id="tentang" title={COPY.pengaturan.tentang}>
            <AboutSection />
          </SettingGroup>
        </div>
      </div>
    </div>
  );
}
