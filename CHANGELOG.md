# Changelog

## [2026-09-05] Perbaikan filter broker, error state daftar saham, lint & analisis broker flow

- Perbaiki filter di tab "Broker Summary" halaman detail saham: sebelumnya ganti preset 7/30/90 hari tidak mengubah data broker yang tampil; sekarang pilihan tanggal dipertahankan antar preset, ada dropdown untuk lompat langsung ke tanggal tertentu, dan kontrol filter diletakkan di sisi kiri.
- Halaman daftar saham sekarang menampilkan pesan error + tombol "Coba lagi" kalau data gagal dimuat.
- Tambahkan integrasi data analisis broker flow di halaman detail saham: tampilkan fase akumulasi/distribusi, net asing, serta tabel anomali broker (deteksi via Modified Z-Score) sehingga pergerakan tidak wajar bisa langsung terlihat.
- Tambahkan konfigurasi ESLint supaya lint bisa jalan otomatis (CI).
- Perkenalkan komponen dropdown-menu reusable untuk memperbaiki kontrol filter tanggal di halaman detail saham.
