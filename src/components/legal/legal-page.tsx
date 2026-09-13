import Link from "next/link"
import { SiteFooter } from "@/components/layout/site-footer"
import { BrandMark } from "@/components/brand/brand-mark"

type LegalPageType = "privacy" | "terms" | "disclaimer"

const pages: Record<LegalPageType, { title: string; intro: string }> = {
  privacy: { title: "Kebijakan Privasi", intro: "Kami menjelaskan data apa yang diproses Yapping Saham, mengapa diperlukan, dan pilihan Anda sebagai pengguna." },
  terms: { title: "Syarat & Ketentuan", intro: "Dengan menggunakan Yapping Saham, Anda menyetujui ketentuan penggunaan layanan berikut." },
  disclaimer: { title: "Disclaimer Investasi", intro: "Informasi di Yapping Saham disediakan untuk edukasi dan informasi umum, bukan nasihat keuangan." },
}

export function LegalPage({ type }: { type: LegalPageType }) {
  const page = pages[type]
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/login" aria-label="Kembali ke login"><BrandMark className="h-9 w-36 object-contain object-left" /></Link>
          <nav className="flex gap-3 text-xs text-muted-foreground sm:gap-5 sm:text-sm">
            <Link href="/privacy" className={type === "privacy" ? "font-medium text-foreground" : "hover:text-foreground"}>Privasi</Link>
            <Link href="/terms" className={type === "terms" ? "font-medium text-foreground" : "hover:text-foreground"}>Ketentuan</Link>
            <Link href="/disclaimer" className={type === "disclaimer" ? "font-medium text-foreground" : "hover:text-foreground"}>Disclaimer</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8 md:py-12">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Yapping Saham</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{page.title}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{page.intro}</p>
        <p className="mt-2 text-xs text-muted-foreground">Terakhir diperbarui: 13 September 2026</p>
        <div className="mt-8 space-y-8 text-sm leading-7">
          {type === "privacy" && <PrivacyContent />}
          {type === "terms" && <TermsContent />}
          {type === "disclaimer" && <DisclaimerContent />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-2 text-lg font-semibold">{title}</h2>{children}</section>
}

function PrivacyContent() {
  return <>
    <Section title="Data yang kami proses"><p>Kami dapat memproses: (1) data identitas dan kontak seperti nama, email, nomor telepon, dan alamat; (2) data akun, autentikasi, preferensi, watchlist, portofolio, serta aktivitas penggunaan; (3) data perangkat, log, alamat IP, dan informasi teknis; dan (4) data transaksi atau status langganan yang dikirim melalui backend. Kata sandi dikelola melalui mekanisme autentikasi backend dan tidak ditampilkan dalam ekspor aplikasi.</p></Section>
    <Section title="Tujuan penggunaan"><p>Data digunakan untuk membuat dan mengamankan akun, menyediakan dashboard dan fitur yang Anda minta, memproses langganan atau aktivasi manual, memberikan dukungan, mencegah penyalahgunaan, memperbaiki layanan, memenuhi kewajiban hukum, serta menyampaikan komunikasi layanan. Kami tidak menjual data pribadi Anda.</p></Section>
    <Section title="Penyimpanan dan retensi"><p>Data disimpan selama akun aktif atau selama diperlukan untuk tujuan di atas. Setelah permintaan penghapusan, data dihapus atau dianonimkan sesuai kemampuan backend dan kewajiban hukum, termasuk kebutuhan pencatatan transaksi atau penyelesaian sengketa. Lama retensi dapat berbeda per kategori dan mengikuti kebijakan operasional penyedia infrastruktur.</p></Section>
    <Section title="Hak Anda"><p>Anda dapat meminta akses, salinan, koreksi, pembatasan, atau penghapusan data pribadi, serta menarik persetujuan jika pemrosesan bergantung pada persetujuan. Gunakan kontrol ekspor/hapus di Settings atau hubungi kami. Kami dapat meminta verifikasi identitas dan menjelaskan apabila sebagian data harus dipertahankan karena hukum.</p></Section>
    <Section title="Kontak"><p>Untuk pertanyaan privasi atau permintaan hak data, hubungi <a className="underline" href="mailto:privacy@yappingsaham.id">privacy@yappingsaham.id</a>. Jika alamat ini belum aktif, gunakan kanal dukungan resmi yang tercantum di aplikasi.</p></Section>
  </>
}

function TermsContent() {
  return <>
    <Section title="Penggunaan yang diperbolehkan"><p>Gunakan layanan secara sah untuk kebutuhan pribadi atau internal Anda. Jangan mengakses akun orang lain, mengganggu layanan, menguji atau mengakali kontrol akses, melakukan scraping atau redistribusi tanpa izin, memasukkan malware, atau menggunakan data untuk tujuan yang melanggar hukum.</p></Section>
    <Section title="Keterbatasan data"><p>Data pasar, harga, indikator, berita, dan analisis dapat tertunda, tidak lengkap, berubah, atau mengandung kesalahan. Layanan tidak menjamin kelangsungan, akurasi, kelengkapan, atau kesesuaian data untuk keputusan tertentu. Selalu verifikasi informasi pada sumber resmi sebelum bertindak.</p></Section>
    <Section title="Langganan dan aktivasi manual"><p>Langganan atau aktivasi manual memberikan akses selama periode yang disetujui, termasuk aktivasi 30 hari bila dinyatakan demikian. Aktivasi dapat memerlukan verifikasi pembayaran dan dilakukan oleh admin/backend. Akses dapat berakhir ketika periode habis; tidak ada perpanjangan otomatis kecuali dinyatakan secara tertulis.</p></Section>
    <Section title="Penghentian"><p>Anda dapat berhenti menggunakan layanan atau mengajukan penghapusan akun melalui Settings. Kami dapat menangguhkan atau mengakhiri akses bila terjadi pelanggaran, risiko keamanan, kewajiban hukum, atau layanan dihentikan. Ketentuan yang menurut sifatnya harus tetap berlaku akan tetap berlaku setelah penghentian.</p></Section>
    <Section title="Batas tanggung jawab"><p>Sejauh diizinkan hukum, Yapping Saham tidak bertanggung jawab atas kerugian investasi, kehilangan keuntungan, kehilangan data, gangguan, atau keputusan yang dibuat berdasarkan layanan. Layanan diberikan sebagaimana tersedia dan bukan pengganti nasihat profesional. Tidak ada jaminan keuntungan.</p></Section>
    <Section title="Kontak"><p>Pertanyaan tentang ketentuan dapat dikirim ke <a className="underline" href="mailto:support@yappingsaham.id">support@yappingsaham.id</a>.</p></Section>
  </>
}

function DisclaimerContent() {
  return <>
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"><p className="font-semibold">Penting: Yapping Saham bukan penasihat investasi berlisensi.</p><p className="mt-1">Konten, data, skor, screener, watchlist, portfolio tracker, dan analisis yang tersedia bukan instruksi untuk membeli atau menjual efek, bukan rekomendasi personal, dan bukan ajakan bertransaksi.</p></div>
    <Section title="Risiko dan kualitas informasi"><p>Investasi saham memiliki risiko kehilangan sebagian atau seluruh modal. Tidak ada jaminan profit atau hasil tertentu. Data dapat tertunda, tidak lengkap, tidak akurat, atau berubah karena sumber dan koneksi pihak ketiga. Kinerja historis tidak menjamin hasil masa depan.</p></Section>
    <Section title="Tanggung jawab pengguna"><p>Gunakan informasi hanya sebagai bahan edukasi dan lakukan riset sendiri. Pertimbangkan tujuan, profil risiko, kondisi keuangan, dan biaya Anda. Konsultasikan keputusan kepada penasihat investasi berlisensi atau profesional yang sesuai. Anda bertanggung jawab penuh atas setiap keputusan dan transaksi.</p></Section>
    <Section title="Bukan layanan eksekusi"><p>Yapping Saham tidak menerima atau mengeksekusi order, tidak mengelola dana pengguna, dan tidak bertindak sebagai broker atau manajer investasi. Tautan atau data pihak ketiga dapat memiliki syarat dan risiko tersendiri.</p></Section>
    <Section title="Pertanyaan"><p>Jika ada kekeliruan data, laporkan melalui <a className="underline" href="mailto:support@yappingsaham.id">support@yappingsaham.id</a>. Pelaporan tidak mengubah sifat umum informasi atau menghilangkan risiko investasi.</p></Section>
  </>
}
