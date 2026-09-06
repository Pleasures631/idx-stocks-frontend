export interface EducationLesson {
  title: string
  href: string
}

export interface EducationLevel {
  title: string
  href: string
  lessons: EducationLesson[]
}

const academy = "https://saham.jamet.id/akademi"

export const educationLevels: EducationLevel[] = [
  {
    title: "LEVEL 1 – Mindset & Reality Check (WAJIB)",
    href: `${academy}/level-1-mindset-reality-check-wajib/`,
    lessons: [
      ["1.1 Judol vs Saham: Investasi dan Spekulasi", "judol-vs-saham-antara-investasi-dan-spekulasi"],
      ["1.2 Kenapa Banyak Orang Boncos di Saham?", "kenapa-banyak-orang-boncos-di-saham"],
      ["1.3 FOMO, Flexing, dan Ilusi Cepat Kaya", "fomo-flexing-dan-ilusi-cepat-kaya"],
      ["1.4 Saham Itu Bisnis, Bukan Tebak Angka", "saham-itu-bisnis-bukan-tebak-angka"],
      ["1.5 Kapan Saham Jadi Judi?", "kapan-saham-jadi-judi"],
      ["1.6 Investasi vs Trading", "investasi-vs-trading-mana-yang-cocok-buat-kita"],
      ["1.7 Bandar Itu Siapa? Mitos vs Fakta", "bandar-itu-siapa-mitos-vs-fakta"],
      ["1.8 Mental Dulu atau Cuan Dulu?", "mental-dulu-atau-cuan-dulu"],
    ].map(([title, slug]) => ({ title, href: `${academy}/level-1/${slug}/` })),
  },
  {
    title: "LEVEL 2 – Prinsip Dasar Saham (Basic Survival)",
    href: `${academy}/level-2-prinsip-dasar-saham-basic-survival/`,
    lessons: [
      ["2.1 Apa Itu Saham Sebenarnya?", "apa-itu-saham-sebenarnya"],
      ["2.2 IHSG Itu Apa dan Kenapa Penting?", "ihsg-itu-apa-dan-kenapa-penting"],
      ["2.3 Lot, Bid, Ask", "lot-bid-ask-dalam-mekanisme-perdagangan-saham"],
      ["2.4 Penyebab Harga Saham Naik Turun", "penyebab-harga-saham-bisa-naik-turun"],
      ["2.5 Dari Mana Datangnya Dividen?", "dari-mana-datangnya-dividen"],
      ["2.6 Saham Blue Chip vs Gorengan", "blue-chip-vs-gorengan"],
      ["2.7 Market Cap dan Nilai Saham", "market-cap-dan-nilai-saham"],
      ["2.8 Apa itu IPO (Initial Public Offering)?", "apa-itu-ipo-initial-public-offering"],
      ["2.9 Saham Syariah & Non-Syariah", "perbedaan-saham-syariah-non-syariah"],
    ].map(([title, slug]) => ({ title, href: `${academy}/level-2/${slug}/` })),
  },
  {
    title: "LEVEL 3 – Cara Jual Beli Saham",
    href: `${academy}/level-3-cara-jual-beli-saham/`,
    lessons: [
      ["3.1 Cara Buka Rekening Saham", "cara-buka-rekening-saham"],
      ["3.2 Beli Saham Pertama Kali", "beli-saham-pertama-kali"],
      ["3.3 Jual Saham Tanpa Panik", "jual-saham-tanpa-panik"],
      ["3.4 Cara Baca Order Book", "cara-baca-order-book"],
      ["3.5 Market Order vs Limit Order", "market-order-vs-limit-order"],
      ["3.6 Jam Trading dan Waktu Terbaik", "jam-trading-dan-waktu-terbaik"],
      ["3.7 Hitung Untung Rugi Saham", "hitung-untung-rugi-saham"],
      ["3.8 Cut Loss dan Take Profit", "cut-loss-dan-take-profit"],
      ["3.9 Ukuran, Posisi dan Modal", "ukuran-posisi-dan-modal"],
    ].map(([title, slug]) => ({ title, href: `${academy}/level-3/${slug}/` })),
  },
  {
    title: "LEVEL 4 – Fundamental Dasar",
    href: `${academy}/level-4-fundamental-dasar/`,
    lessons: [
      ["4.1 Baca Laporan Keuangan Tanpa Pusing", "cara-baca-laporan-keuangan-tanpa-pusing"],
      ["4.2 Pendapatan vs Laba Bersih", "pendapatan-vs-laba-bersih"],
      ["4.3 Aset, Utang, Ekuitas", "aset-utang-ekuitas"],
      ["4.4 Arus Kas", "arus-kas"],
      ["4.5 Apa Itu PER, PBV, ROE?", "apa-itu-per-pbv-roe"],
      ["4.6 Utang, Apakah Berbahaya?", "utang-apakah-berbahaya"],
      ["4.7 Cara Menilai Saham Mahal atau Murah", "cara-menilai-saham-mahal-atau-murah"],
      ["4.8 Growth vs Value", "growth-vs-value"],
      ["4.9 Laba Naik Tapi Sahamnya Nyungsep?", "kenapa-laba-naik-tapi-sahamnya-nyungsep"],
    ].map(([title, slug]) => ({ title, href: `${academy}/level-4/${slug}/` })),
  },
  {
    title: "LEVEL 5 – Teknikal Dasar",
    href: `${academy}/level-5-teknikal-dasar/`,
    lessons: [
      ["5.1 Candlestick Itu Apa?", "candlestick-itu-apa"],
      ["5.2 Support & Resistance", "support-resistance"],
      ["5.3 Mengenal Trend", "mengenal-trend"],
      ["5.4 Volume Itu Nyawa", "volume-itu-nyawa"],
      ["5.5 Breakout vs False Breakout", "breakout-vs-false-breakout"],
      ["5.6 Timeframe Buat Pemula", "timeframe-yang-cocok-buat-pemula"],
      ["5.7 Indikator Bukan Ramalan Dukun", "indikator-bukan-ramalan-dukun"],
    ].map(([title, slug]) => ({ title, href: `${academy}/level-5/${slug}/` })),
  },
]
