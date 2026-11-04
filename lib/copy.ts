/**
 * Every string the interface shows. Indonesian, warm, editorial and concise —
 * kept in one place so the voice stays consistent and copy edits never touch
 * component logic.
 */

export const COPY = {
  wordmark: "Wikinder",
  skipToContent: "Lompat ke konten",
  appDescription:
    "Artikel Wikipedia acak dalam kartu yang bisa digeser. Simpan yang membuat penasaran, baca dengan tenang.",

  nav: {
    jelajah: "Jelajah",
    koleksi: "Koleksi",
    cari: "Cari",
    pengaturan: "Pengaturan",
  },

  deck: {
    bahasa: "Bahasa",
    labelKartu: "Kartu artikel",
    nomorEdisi: "No.",
    ringkasan: "Ringkasan",
    bacaArtikel: "Baca artikel",
    sesiProgress: "Kemajuan sesi",
    kartuKe: (n: number) => `Kartu ${n} dari 10`,
    petunjuk: "Geser kartu, atau pakai tombol di bawah.",
    petunjukKeyboard:
      "Panah kiri melewati, panah kanan menyimpan, panah atas membaca, Z mengurungkan.",
    aksi: {
      lewati: "Lewati",
      simpan: "Simpan",
      baca: "Baca",
      urungkan: "Urungkan",
    },
    menu: "Aksi lain untuk kartu ini",
    bagikan: "Bagikan",
    bagikanTersalin: "Tautan disalin",
    bukaWikipedia: "Buka di Wikipedia",
    sembunyikan: "Sembunyikan artikel ini",
    sembunyikanBerhasil: "Artikel disembunyikan",
  },

  toast: {
    disimpan: "Disimpan ke koleksi",
    dilewati: "Dilewati",
    urungkan: "Urungkan",
    sudahTersimpan: "Artikel ini sudah ada di koleksimu",
    sudahDibaca: "Ditandai sudah dibaca",
    dihapus: "Dihapus dari koleksi",
    disembunyikan: "Artikel disembunyikan",
    tidakAdaUrungkan: "Belum ada tindakan untuk diurungkan",
    gagalSimpan: "Penyimpanan penuh. Coba hapus beberapa kartu lama.",
  },

  loading: {
    memuatKartu: "Menyiapkan kartu…",
    memuatArtikel: "Membuka halaman…",
  },

  error: {
    kartuJudul: "Kartu belum bisa datang.",
    kartuPesan:
      "Koneksinya sedang tersendat. Kartumu aman, coba lagi sebentar.",
    artikelJudul: "Halaman ini belum terbuka.",
    artikelPesan:
      "Wikipedia tidak menjawab dengan lengkap. Coba muat ulang, atau kembali ke kartu.",
    cariJudul: "Pencarian terhenti.",
    cariPesan: "Koneksi ke Wikipedia sedang lambat. Coba lagi sebentar.",
    cobaLagi: "Coba lagi",
    bukaKoleksi: "Buka koleksi",
    kembaliJelajah: "Kembali ke Jelajah",
    tidakDitemukanJudul: "Artikelnya tidak ditemukan.",
    tidakDitemukanPesan:
      "Mungkin halaman ini sudah berpindah atau judulnya berubah.",
  },

  sesi: {
    selesai: "Sesi selesai.",
    ringkasan: "Sepuluh kartu sudah lewat. Ini yang tertinggal.",
    dilihat: "Dilihat",
    disimpan: "Disimpan",
    dilewati: "Dilewati",
    mulaiBaru: "Mulai sesi baru",
    lihatKoleksi: "Lihat koleksi",
    catatanKecil: "Kartu yang kamu simpan menunggu di Koleksi.",
  },

  koleksi: {
    judul: "Koleksi",
    subjudul: "Yang kamu sisihkan untuk dibaca nanti.",
    tabIngin: "Ingin dibaca",
    tabSudah: "Sudah dibaca",
    kosongInginJudul: "Rak ini masih kosong.",
    kosongInginPesan:
      "Belum ada yang tersimpan. Geser kanan pada sesuatu yang bikin penasaran.",
    kosongSudahJudul: "Belum ada yang selesai.",
    kosongSudahPesan:
      "Tandai artikel selesai setelah membacanya, dan ia akan pindah ke sini.",
    mulaiJelajah: "Mulai jelajah",
    tersimpanPada: "Disimpan",
    menu: "Aksi untuk kartu ini",
    tandaiSelesai: "Tandai selesai",
    tandaiIngin: "Pindahkan ke ingin dibaca",
    hapus: "Hapus dari koleksi",
    buka: "Baca artikel",
    jumlah: (n: number) => `${n} artikel`,
  },

  reader: {
    kembali: "Kembali",
    breadcrumbJelajah: "Jelajah",
    panelTampilan: "Tampilan",
    tampilan: "Atur tampilan bacaan",
    tema: "Tema",
    ukuranTeks: "Ukuran teks",
    jenisHuruf: "Jenis huruf",
    serif: "Serif",
    sans: "Sans",
    tinggiBaris: "Tinggi baris",
    rapat: "Rapat",
    lapang: "Lapang",
    tutup: "Tutup",
    simpan: "Simpan",
    tersimpan: "Tersimpan",
    tandaiSelesai: "Tandai selesai",
    sudahDibaca: "Sudah dibaca",
    menu: "Aksi lain",
    bukaWikipedia: "Buka di Wikipedia",
    bagikan: "Bagikan",
    bagian: "Bagian",
    artikelAcak: "Artikel acak berikutnya",
    atribusi:
      "Teks dari Wikipedia, berlisensi CC BY-SA 4.0. Wikinder bukan produk resmi Wikimedia.",
    lihatSumber: "Lihat artikel asli",
    menitBaca: (n: number) => `± ${n} menit baca`,
    progresBaca: "Progres baca",
  },

  cari: {
    judul: "Cari",
    subjudul: "Telusuri Wikipedia dalam empat bahasa.",
    label: "Kata kunci",
    placeholder: "Misalnya: kopi, wayang, gunung…",
    tombol: "Cari",
    kosongAwalJudul: "Mulai dari satu kata.",
    kosongAwalPesan:
      "Ketik judul atau topik, lalu tunggu sejenak. Hasil muncul sendiri.",
    kosongJudul: "Tidak ada yang cocok.",
    kosongPesan: "Coba kata yang lebih umum, atau ejaan lain.",
    hasilUntuk: (q: string) => `Hasil untuk “${q}”`,
    jumlahHasil: (n: number) => `${n} artikel`,
    bersihkan: "Bersihkan pencarian",
  },

  pengaturan: {
    judul: "Pengaturan",
    subjudul: "Sesuaikan cara membaca, bukan isinya.",
    bagianBacaan: "Bacaan",
    bagianTampilan: "Tampilan",
    bagianData: "Data",
    bagianTentang: "Tentang",
    bahasa: "Bahasa artikel",
    bahasaBantuan: "Bahasa untuk kartu acak dan pencarian.",
    tema: "Tema",
    temaBantuan: "Empat suasana kertas, semuanya sudah diuji keterbacaannya.",
    ukuranTeks: "Ukuran teks bacaan",
    jenisHuruf: "Jenis huruf bacaan",
    tinggiBaris: "Tinggi baris bacaan",
    hanyaBergambar: "Hanya tampilkan kartu bergambar",
    hanyaBergambarBantuan:
      "Kartu tanpa gambar tetap indah, tetapi opsi ini membuat tumpukan lebih seragam.",
    hapusData: "Hapus data lokal",
    hapusDataBantuan:
      "Menghapus koleksi, riwayat, dan pengaturan dari perangkat ini. Tidak bisa dibatalkan.",
    hapusDataKonfirmasi: "Hapus semua data lokal?",
    hapusDataKonfirmasiPesan:
      "Koleksi dan riwayatmu akan hilang dari perangkat ini. Artikel di Wikipedia tidak terpengaruh.",
    yaHapus: "Ya, hapus",
    batal: "Batal",
    dataTerhapus: "Data lokal dihapus",
    tentangIsi:
      "Wikinder bukan produk resmi Wikimedia. Konten berasal dari Wikipedia dan berlisensi CC BY-SA 4.0.",
    tentangSumber: "Sumber data: MediaWiki Action API",
    versi: "Versi",
    temaNama: {
      kertas: "Kertas",
      malam: "Malam",
      sepia: "Sepia",
      kontras: "Kontras",
    } as Record<string, string>,
    ukuranNama: {
      0: "Kecil",
      1: "Sedang",
      2: "Nyaman",
      3: "Besar",
      4: "Sangat besar",
    } as Record<number, string>,
  },

  umum: {
    tutup: "Tutup",
    batal: "Batal",
    simpan: "Simpan",
    hapus: "Hapus",
    buka: "Buka",
    berikutnya: "Berikutnya",
    kembali: "Kembali",
    menu: "Menu",
    pilih: "Pilih",
    aktif: "Aktif",
  },
} as const;

export type Copy = typeof COPY;
