/**
 * English UI strings for Wikinder.
 * Kept in one place so voice stays consistent and copy edits never touch logic.
 * Two separate settings: uiLang (interface) and articleLang (Wikipedia language).
 */
export const COPY = {
  wordmark: "Wikinder",
  appDescription:
    "Random Wikipedia articles in swipeable cards. Save what piques your curiosity, read in peace.",

  skipToContent: "Skip to content",
  offline: "You are offline. Swiped cards remain accessible.",

  nav: {
    jelajah: "Explore",
    koleksi: "Collection",
    cari: "Search",
    pengaturan: "Settings",
    utama: "Main navigation",
    utamaLebar: "Main navigation, wide screen",
  },

  umum: {
    tutup: "Close",
    batal: "Cancel",
    simpan: "Save",
    hapus: "Delete",
    buka: "Open",
    kembali: "Back",
    berikutnya: "Next",
    menu: "Menu",
    pilih: "Choose",
    cobaLagi: "Try again",
    urungkan: "Undo",
    memuat: "Loading…",
    tersimpan: "Saved",
    aktif: "Active",
    dari: "from",
  },

  deck: {
    bahasa: "Article language",
    labelKartu: "Article card",
    ringkasan: "Summary",
    bacaArtikel: "Read article",
    sesiProgress: "Session progress",
    kartuKe: (n: number, total: number) => `Card ${n} of ${total}`,
    petunjuk: "Swipe cards, or use the buttons below.",
    petunjukKeyboard:
      "Left arrow skips, right arrow saves, up arrow reads, Z undoes.",
    aksi: {
      lewati: "Skip",
      simpan: "Save",
      baca: "Read",
      urungkan: "Undo",
    },
    menu: "Other actions for this card",
    bagikan: "Share",
    bagikanTersalin: "Link copied",
    bukaWikipedia: "Open in Wikipedia",
    sembunyikan: "Hide this article",
    sembunyikanBerhasil: "Article hidden",
    disimpan: "Saved to collection",
    dilewati: "Skipped",
    sudahTersimpan: "This article is already in your collection",
    semuaTersembunyi: "All cards filtered. Open settings to change filter.",
  },

  sesi: {
    judul: "Session finished",
    ringkasan: (n: number) => `${n} cards skipped. What's left behind.`,
    dilihat: "Seen",
    disimpan: "Saved",
    dilewati: "Skipped",
    mulaiBaru: "Start new session",
    lihatKoleksi: "View collection",
    catatanKecil: "Cards you saved await in Collection.",
  },

  koleksi: {
    judul: "Collection",
    subjudul: "What you've set aside to read later.",
    tabIngin: "To read",
    tabSudah: "Read",
    kosongInginJudul: "Nothing saved yet.",
    kosongInginPesan: "Swipe right to save to here.",
    kosongSudahJudul: "Nothing finished yet.",
    kosongSudahPesan: "Mark article as finished after reading, then it goes here.",
    mulaiJelajah: "Start exploring",
    tersimpanPada: "Saved",
    menu: "Action for this card",
    tandaiSelesai: "Mark as finished",
    tandaiIngin: "Move to want to read",
    hapus: "Remove from collection",
    dihapus: "Removed from collection",
    jumlah: (n: number) => `${n} articles`,
  },

  reader: {
    kembali: "Back",
    daftarIsi: "Table of contents",
    tampilan: "Display",
    aksiLain: "Other actions",
    simpan: "Save",
    tandaiSelesai: "Mark as finished",
    sudahDibaca: "Finished",
    disimpan: "Saved to collection",
    ditandaiSelesai: "Marked as finished",
    menitBaca: (n: number) => `${n} min read`,
    diubah: (tanggal: string) => `Updated ${tanggal}`,
    bukaSemua: "Show all",
    tutupSemua: "Hide all",
    lanjutBaca: (bagian: string) => `Continue from "${bagian}"`,
    lanjutBacaPesan: "You stopped at this section last time.",
    lanjutkan: "Continue",
    mulaiAwal: "Start from beginning",
    sorot: "Highlight paragraph",
    sorotan: "Highlight",
    sorotanKosong: "No highlights yet. Long-press a paragraph to mark it.",
    hapusSorotan: "Remove highlight",
    sorotanDihapus: "Highlight removed",
    sitasi: "Copy citation",
    sitasiJudul: "Copy citation",
    sitasiTeks: "Plain text",
    sitasiApa: "APA summary",
    sitasiTersalin: "Link copied",
    sitasiGagal: "Could not copy. Please select text manually.",
    lisensi: "CC BY-SA 4.0 license",
    bagikan: "Share",
    tautanTersalin: "Link copied",
    bukaWikipedia: "Open in Wikipedia",
    bacaNyaring: "Read aloud",
    putar: "Play",
    jeda: "Pause",
    hentikan: "Stop",
    kecepatan: "Speed",
    suaraTiada: "No voice available for this language on your device.",
    berikutnya: "Next random article",
    keKoleksi: "Open collection",
    atribusi:
      "Text from Wikipedia, licensed under CC BY-SA 4.0. Wikinder is not an official Wikimedia product.",
    lihatSumber: "View original article",
    progresBaca: "Reading progress",
    tandaiPrompt: "Mark this article as read?",
    tandaiYa: "Mark as finished",
    tandaiTidak: "Later",
    tampilanPanel: "Reading settings",
    pratinjau: "Preview",
    kembalikan: "Reset to defaults",
    ukuranTeks: "Text size",
    jenisHuruf: "Font",
    serif: "Serif",
    sans: "Sans",
    tinggiBaris: "Line height",
    rapat: "Tight",
    nyaman: "Comfortable",
    lapang: "Wide",
    lebarBaca: "Column width",
    sempit: "Narrow",
    normal: "Normal",
    lebar: "Wide",
    tema: "Theme",
    navigasiSeksi: "Next section",
    pintasan: "Keyboard shortcuts",
    pintasanDaftar: [
      { kunci: "j / k", aksi: "Next / previous section" },
      { kunci: "t", aksi: "Open table of contents" },
      { kunci: "a", aksi: "Open display panel" },
      { kunci: "s", aksi: "Save article" },
      { kunci: "?", aksi: "Show shortcuts" },
      { kunci: "Esc", aksi: "Close panel or go back" },
    ],
    tanpaSeksi: "This article has no sections. The summary is above.",
    bagian: "section",
    modeFokus: "Focus mode",
    gambarArtikel: "Article image",
    perbesarGambar: "Enlarge image",
  },

  cari: {
    judul: "Search",
    subjudul: "Search Wikipedia in four languages.",
    label: "Keywords",
    placeholder: "e.g.: coffee, wayang, mountain",
    tombol: "Search",
    kosongAwalJudul: "Start with a single word.",
    kosongAwalPesan: "Enter a title or topic, then wait a moment.",
    kosongJudul: "Nothing matches.",
    kosongPesan: "Try a more general keyword, or alternative spelling.",
    hasilUntuk: (q: string) => `Results for "${q}"`,
    jumlahHasil: (n: number) => `${n} articles`,
    bersihkan: "Clear search",
    memuat: "Searching…",
    gagal: "Search stopped.",
    gagalPesan: "Wikipedia connection is slow. Try again shortly.",
    buka: "Read article",
  },

  pengaturan: {
    judul: "Settings",
    subjudul: "Adjust how you read, not what's in it.",
    indeks: "Settings section",
    tampilan: "Appearance",
    jelajah: "Explore",
    membaca: "Reading",
    aksesibilitas: "Motion & accessibility",
    data: "Data",
    tentang: "About",

    tema: "Theme",
    temaBantuan: "Follow system, or choose an atmosphere.",
    temaNama: {
      system: "System",
      terang: "Light",
      gelap: "Dark",
      sepia: "Sepia",
      kontras: "High contrast",
    } as Record<string, string>,
    ukuranTeks: "Reading text size",
    jenisHuruf: "Reading font",
    tinggiBaris: "Line height",
    lebarBaca: "Column width",
    pratinjau: "Live preview",
    ukuranNama: {
      0: "Small",
      1: "Medium",
      2: "Large",
      3: "Larger",
      4: "Largest",
    } as Record<number, string>,

    bahasa: "Article language",
    bahasaBantuan: "Used for random cards and search.",
    hanyaBergambar: "Only illustrated articles",
    hanyaBergambarBantuan:
      "Cards without images remain available when this option is off.",
    jumlahKartu: "Cards per session",
    getaran: "Swipe vibration",
    getaranBantuan: "Only active on devices that support it.",
    petunjukGestur: "Show gesture hint again",
    petunjukGesturBantuan: "Appears once at the start of next session.",
    petunjukDinyalakan: "Gesture hints will appear again",

    bukaSemua: "Open all sections",
    bukaSemuaBantuan: "Long sections open immediately on load.",
    daftarIsiDesktop: "Table of contents sidebar on wide screen",
    daftarIsiDesktopBantuan: "Show sidebar rail next to text.",
    lanjutkan: "Offer to continue reading",
    lanjutkanBantuan: "Show continue-reading suggestion at last position.",
    kecepatanBaca: "Read-aloud speed",

    gerak: "Motion",
    gerakBantuan: "Reduce motion, or follow system settings.",
    gerakNama: {
      system: "Follow system",
      reduce: "Reduce",
      full: "Full",
    } as Record<string, string>,
    kontras: "High contrast",
    kontrasBantuan: "Using High contrast theme: black, white, and dark blue.",
    targetSentuh: "Touch target size",
    targetSentuhBantuan: "Larger targets increase button height.",
    targetNama: {
      normal: "Normal",
      besar: "Large",
    } as Record<string, string>,

    ekspor: "Export data",
    eksporBantuan: "Collection and settings as a JSON file.",
    eksporTombol: "Download JSON",
    eksporSelesai: "Export file downloaded",
    impor: "Import data",
    imporBantuan: "Merge or replace collection and settings from a file.",
    imporTombol: "Choose file",
    imporJudul: "Import data",
    imporPratinjau: (n: number) => `File contains ${n} articles.`,
    imporGabung: "Merge",
    imporTimpa: "Replace",
    imporSelesai: "Data imported",
    imporGagal: "File could not be read.",
    imporGagalPesan: "Make sure the JSON file was exported from Wikinder.",
    imporTerlaluBesar: "File too large. Maximum 2 MB.",
    hapusRiwayat: "Clear history",
    hapusRiwayatBantuan: (n: number) => `${n} articles viewed.`,
    hapusKoleksi: "Clear collection",
    hapusKoleksiBantuan: (n: number) => `${n} articles saved.`,
    resetSemua: "Reset all data",
    resetSemuaBantuan:
      "Collection, history, highlights, and settings on this device.",

    konfirmasiHapus: (n: number) => `Delete ${n} saved articles`,
    konfirmasiRiwayat: (n: number) => `Clear ${n} history entries`,
    konfirmasiReset: "Reset all Wikinder data",
    konfirmasiPesan: "This action cannot be undone.",
    terhapus: "Data deleted",
    urungkan: "Undo",
    dikembalikan: "Restored",

    tentangIsi:
      "Wikinder is not an official Wikimedia product. Content comes from Wikipedia and is licensed under CC BY-SA 4.0.",
    lisensi: "Read CC BY-SA 4.0 license",
    versi: "Version",
    pintasan: "Keyboard shortcuts",
  },

  error: {
    judul: "This page could not be opened.",
    pesan: "Wikipedia did not respond fully. Try again, or go back to Explore.",
    tidakDitemukanJudul: "Article not found.",
    tidakDitemukanPesan:
      "This page may have moved or its title has changed.",
    keJelajah: "Back to Explore",
    keKoleksi: "Open Collection",
  },
} as const;

/** Language tag for the interface (uiLang). */
export type UiLang = "en" | "id" | "jv" | "su";

/** Allowlisted Wikipedia article languages. */
export type ArticleLang =
  | "en"
  | "id"
  | "jv"
  | "su"
  | "ms"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "nl"
  | "ru"
  | "uk"
  | "tr"
  | "ar"
  | "hi"
  | "ja"
  | "ko"
  | "zh"
  | "vi"
  | "pl"
  | "sv";

/** Full copy type. */
export type Copy = typeof COPY;