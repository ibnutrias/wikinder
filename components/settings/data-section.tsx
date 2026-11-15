"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListRow } from "@/components/ui/list-row";
import { Sheet } from "@/components/ui/sheet";
import { COPY } from "@/lib/copy";
import {
  MAX_IMPORT_BYTES,
  buildExport,
  exportFileName,
  mergeCollections,
  parseImport,
} from "@/lib/data-transfer";
import {
  clearAllData,
  clearCollection,
  clearSeen,
  readStore,
  replaceCollection,
  updateSettings,
  useCollection,
  useSeen,
} from "@/lib/store";
import { showToast } from "@/lib/toast";
import type { CollectionItem, Settings } from "@/lib/types";

type Confirm = {
  title: string;
  message: string;
  label: string;
  run: () => void;
};

type ImportPreview = { settings: Settings; collection: CollectionItem[] };

export function DataSection() {
  const collection = useCollection();
  const seen = useSeen();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const download = (): void => {
    const payload = buildExport(readStore().settings, readStore().collection);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFileName();
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    showToast({ message: COPY.pengaturan.eksporSelesai });
  };

  const readFile = async (file: File): Promise<void> => {
    setImportError(null);
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError(COPY.pengaturan.imporTerlaluBesar);
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseImport(JSON.parse(text) as unknown);
      if (!parsed.ok) {
        setImportError(COPY.pengaturan.imporGagalPesan);
        return;
      }
      setPreview({ settings: parsed.settings, collection: parsed.collection });
    } catch {
      setImportError(COPY.pengaturan.imporGagalPesan);
    }
  };

  const applyImport = (mode: "merge" | "replace"): void => {
    if (!preview) return;
    updateSettings(preview.settings);
    if (mode === "merge") {
      replaceCollection(mergeCollections(readStore().collection, preview.collection));
    } else {
      replaceCollection(preview.collection);
    }
    setPreview(null);
    showToast({ message: COPY.pengaturan.imporSelesai });
  };

  const deleteCollection = (): void => {
    const backup = readStore().collection;
    clearCollection();
    showToast({
      message: COPY.pengaturan.terhapus,
      undoLabel: COPY.pengaturan.urungkan,
      onUndo: () => replaceCollection(backup),
    });
  };

  return (
    <div>
      <ListRow label={COPY.pengaturan.ekspor} description={COPY.pengaturan.eksporBantuan}>
        <Button onClick={download}>
          <Download aria-hidden="true" size={20} strokeWidth={1.5} />
          {COPY.pengaturan.eksporTombol}
        </Button>
      </ListRow>

      <ListRow
        label={COPY.pengaturan.impor}
        description={importError ?? COPY.pengaturan.imporBantuan}
      >
        <Button onClick={() => fileRef.current?.click()}>
          <Upload aria-hidden="true" size={20} strokeWidth={1.5} />
          {COPY.pengaturan.imporTombol}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void readFile(file);
          }}
        />
      </ListRow>

      <ListRow
        label={COPY.pengaturan.hapusRiwayat}
        description={COPY.pengaturan.hapusRiwayatBantuan(seen.length)}
      >
        <Button
          variant="danger"
          disabled={seen.length === 0}
          onClick={() =>
            setConfirm({
              title: COPY.pengaturan.konfirmasiRiwayat(seen.length),
              message: COPY.pengaturan.konfirmasiPesan,
              label: COPY.pengaturan.konfirmasiRiwayat(seen.length),
              run: () => {
                clearSeen();
                showToast({ message: COPY.pengaturan.terhapus });
              },
            })
          }
        >
          {COPY.pengaturan.hapusRiwayat}
        </Button>
      </ListRow>

      <ListRow
        label={COPY.pengaturan.hapusKoleksi}
        description={COPY.pengaturan.hapusKoleksiBantuan(collection.length)}
      >
        <Button
          variant="danger"
          disabled={collection.length === 0}
          onClick={() =>
            setConfirm({
              title: COPY.pengaturan.konfirmasiHapus(collection.length),
              message: COPY.pengaturan.konfirmasiPesan,
              label: COPY.pengaturan.konfirmasiHapus(collection.length),
              run: deleteCollection,
            })
          }
        >
          {COPY.pengaturan.hapusKoleksi}
        </Button>
      </ListRow>

      <ListRow label={COPY.pengaturan.resetSemua} description={COPY.pengaturan.resetSemuaBantuan}>
        <Button
          variant="danger"
          onClick={() =>
            setConfirm({
              title: COPY.pengaturan.konfirmasiReset,
              message: COPY.pengaturan.konfirmasiPesan,
              label: COPY.pengaturan.konfirmasiReset,
              run: () => {
                clearAllData();
                showToast({ message: COPY.pengaturan.terhapus });
              },
            })
          }
        >
          {COPY.pengaturan.resetSemua}
        </Button>
      </ListRow>

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.message}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              variant="danger"
              size="lg"
              block
              onClick={() => {
                confirm?.run();
                setConfirm(null);
              }}
            >
              {confirm?.label}
            </Button>
            <Button size="lg" block onClick={() => setConfirm(null)}>
              {COPY.umum.batal}
            </Button>
          </div>
        }
      >
        <p className="t-14 text-muted">{COPY.pengaturan.konfirmasiPesan}</p>
      </Sheet>

      <Sheet
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={COPY.pengaturan.imporJudul}
        description={preview ? COPY.pengaturan.imporPratinjau(preview.collection.length) : undefined}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button variant="primary" size="lg" block onClick={() => applyImport("merge")}>
              {COPY.pengaturan.imporGabung}
            </Button>
            <Button variant="danger" size="lg" block onClick={() => applyImport("replace")}>
              {COPY.pengaturan.imporTimpa}
            </Button>
          </div>
        }
      >
        <p className="t-14 text-muted">{COPY.pengaturan.imporBantuan}</p>
      </Sheet>
    </div>
  );
}
