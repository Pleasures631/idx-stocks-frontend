# Changelog

## [2026-09-05] Tooltip chart harga menampilkan top-3 buyer & top-3 seller per tanggal

- Price Chart tooltip now shows top-3 buyer brokers and top-3 seller brokers for the hovered date, reusing the existing `broker_summary` payload from `/stocks/:symbol`. Saat hover titik pada grafik harga, tooltip menampilkan tanggal, harga close, serta dua kolom "Top Buyers" dan "Top Sellers" (masing-masing hingga 3 baris, diurutkan berdasarkan `buy_value` / `sell_value` desc). Data di-cache per `trade_date` lewat `useMemo` di halaman detail sehingga lookup saat hover tetap O(1). Tidak ada endpoint baru, tidak ada dependensi baru, dan tab "Broker Summary" tidak berubah.

## [2026-09-05] Perbaikan filter broker, error state daftar saham, lint & analisis broker flow

- Perbaiki filter di tab "Broker Summary" halaman detail saham: sebelumnya ganti preset 7/30/90 hari tidak mengubah data broker yang tampil; sekarang pilihan tanggal dipertahankan antar preset, ada dropdown untuk lompat langsung ke tanggal tertentu, dan kontrol filter diletakkan di sisi kiri.
- Halaman daftar saham sekarang menampilkan pesan error + tombol "Coba lagi" kalau data gagal dimuat.
- Tambahkan integrasi data analisis broker flow di halaman detail saham: tampilkan fase akumulasi/distribusi, net asing, serta tabel anomali broker (deteksi via Modified Z-Score) sehingga pergerakan tidak wajar bisa langsung terlihat.
- Tambahkan konfigurasi ESLint supaya lint bisa jalan otomatis (CI).
- Perkenalkan komponen dropdown-menu reusable untuk memperbaiki kontrol filter tanggal di halaman detail saham.
