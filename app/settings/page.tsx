import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: COPY.pengaturan.judul,
  description: COPY.pengaturan.subjudul,
};

export default function SettingsPage() {
  return <SettingsView />;
}
