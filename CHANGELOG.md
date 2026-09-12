# Changelog

## [2026-09-12] Canonical Broker Colors

- Semua penanda broker code memakai `broker_group` canonical: RETAIL ungu, GOVERNMENT/PEMERINTAH hijau, FOREIGN/ASING merah.
- Warna dan label konsisten di dominant flow, tabel flow, daily Broker Summary, chart tooltip, dan anomaly table.
- Tailwind content scan mencakup `src/lib` agar class warna helper tidak ter-purge saat production build.
- Kartu dominant flow sekarang menampilkan label accumulator/distributor yang eksplisit, accent hijau/merah berdasarkan arah flow, dan badge grup broker yang kontras.
- QA PASSED: lint, TypeScript, dan production build.

## [2026-09-12] Daily Broker Flow Raw Fields

- Tabel Broker Summary harian pada halaman saham sekarang menampilkan B LOT, B FREQ, B AVG, B VAL dan field sell equivalents langsung dari API existing.
- Nilai frequency yang kosong ditampilkan sebagai `—`; tidak ada kalkulasi ticket, klasifikasi tambahan, forecast, atau redesign menu.
- QA PASSED: lint, TypeScript, production build, dan review field harian terhadap kontrak backend.

## [2026-09-12] Broker Flow Distribution Browser Sweep

- Menambahkan launcher browser terpisah untuk menjalankan 20 variasi Broker Flow arah distribusi dengan persistence dan reuse batch ID yang sama seperti sweep akumulasi.
- Shared browser runner kini memilih arah sinyal secara eksplisit tanpa mengubah default command akumulasi.
- QA PASSED: syntax check kedua script dan satu focused Playwright case yang memverifikasi 20 request `DISTRIBUTION` serta reuse batch ID.

## [2026-09-11] Broker Flow Browser Sweep Automation

- Menambahkan script `scripts/run-broker-flow-browser-sweep.mjs` yang membuka Chromium secara visible dan mengoperasikan form existing untuk 20 variasi threshold deterministik; mode headless tersedia sebagai opsi.
- Run memakai satu ticker, lookback 20, akumulasi, horizon 1D/5D/10D/20D, lalu menggunakan kembali batch ID dari hasil pertama agar seluruh ringkasan tersimpan dalam satu batch database.
- Bagian Advanced pada UI kini menyediakan opsi persistence, nomor/nama variasi, batch ID opsional, konfirmasi row tersimpan, serta pesan aman untuk konflik HTTP 409.
- QA PASSED: lint, TypeScript, production build, syntax/help CLI, dan enam focused Playwright cases termasuk tepat 20 submit serta reuse batch ID.

## [2026-09-11] Broker Flow Backtest and Simplified Analysis

- Menambahkan menu `/broker-flow-backtest` pada sidebar dan mobile drawer untuk menjalankan engine backend dengan hingga 20 ticker, tanggal/cutoff, lookback, arah, horizon, dan threshold yang dapat diatur.
- UI menampilkan statistik backend per horizon, detail signal/next-session entry, outcome nullable, warning coverage, pagination, serta loading, validation, error, dan empty state tanpa menghitung rolling metric di browser.
- Tab Analisis Broker Flow sekarang mengutamakan dominant broker, intensity, consistency, same-sign share, momentum, weighted price, price position, dan coverage; HHI/smart-money/z-score legacy dipindahkan ke Advanced.
- QA PASSED: lint, TypeScript, production build, contract review, dan Chromium Playwright 3/3 untuk submit/render, validation/empty state, serta mobile navigation.

## [2026-09-10] Liquidity Metrics API Mapping Fix

- Card Liquidity existing memetakan seluruh field ADTV, trading frequency, dan average turnover langsung dari API tanpa kalkulasi rolling di frontend.
- Nilai null/missing sekarang tampil `N/A`; rasio positif kecil memakai precision adaptif agar tidak terlihat sebagai `0.0%`, sementara literal zero tetap dipertahankan.
- QA PASSED: lint, TypeScript, production build, Chromium Playwright, runtime API, dan formula raw SQL backend untuk CUAN/BBCA/TLKM.

## [2026-09-05] Tooltip chart harga menampilkan top-3 buyer & top-3 seller per tanggal

- Price Chart tooltip now shows top-3 buyer brokers and top-3 seller brokers for the hovered date, reusing the existing `broker_summary` payload from `/stocks/:symbol`. Saat hover titik pada grafik harga, tooltip menampilkan tanggal, harga close, serta dua kolom "Top Buyers" dan "Top Sellers" (masing-masing hingga 3 baris, diurutkan berdasarkan `buy_value` / `sell_value` desc). Data di-cache per `trade_date` lewat `useMemo` di halaman detail sehingga lookup saat hover tetap O(1). Tidak ada endpoint baru, tidak ada dependensi baru, dan tab "Broker Summary" tidak berubah.

## [2026-09-05] Perbaikan filter broker, error state daftar saham, lint & analisis broker flow

- Perbaiki filter di tab "Broker Summary" halaman detail saham: sebelumnya ganti preset 7/30/90 hari tidak mengubah data broker yang tampil; sekarang pilihan tanggal dipertahankan antar preset, ada dropdown untuk lompat langsung ke tanggal tertentu, dan kontrol filter diletakkan di sisi kiri.
- Halaman daftar saham sekarang menampilkan pesan error + tombol "Coba lagi" kalau data gagal dimuat.
- Tambahkan integrasi data analisis broker flow di halaman detail saham: tampilkan fase akumulasi/distribusi, net asing, serta tabel anomali broker (deteksi via Modified Z-Score) sehingga pergerakan tidak wajar bisa langsung terlihat.
- Tambahkan konfigurasi ESLint supaya lint bisa jalan otomatis (CI).
- Perkenalkan komponen dropdown-menu reusable untuk memperbaiki kontrol filter tanggal di halaman detail saham.
