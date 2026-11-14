# Cloud Print — Sistem Layanan Percetakan Online (Next.js)

Aplikasi web transaksional **Cloud Print** berbasis **Next.js (App Router)**, **Tailwind CSS**, **Prisma ORM**, dan **PostgreSQL** yang siap digunakan untuk lingkungan produksi (*publish*) **tanpa data dummy**.

## Fitur Utama
- **Autentikasi Terpadu (`Single Login Page`)**: Pemisahan hak akses otomatis berdasarkan `role` (`ADMIN` dan `PELANGGAN`) dengan JWT HTTP-Only Cookie dan `Modal Error` saat kredensial salah.
- **Wizard Pemesanan 2 Langkah (Pelanggan)**:
  - **Langkah 1**: Pemilihan kategori cetak (Dokumen & Kertas, Banner & Spanduk, Stiker & Label, Kartu Nama, Buku & Majalah), opsi *finishing* dinamis per kategori, kalkulasi harga otomatis dari database, serta unggah file cetak asli ke server.
  - **Langkah 2**: Ringkasan pesanan 2 kolom, verifikasi file & spesifikasi, dan pembuatan pesanan otomatis mengarah ke modal pembayaran pada Riwayat Pesanan.
- **Pusat Pembayaran di Riwayat Pesanan**: Informasi rekening/pembayaran dinamis, unggah bukti transfer, serta unggah ulang bukti jika pesanan ditolak Admin.
- **Manajemen Operasional & Lightbox (Admin)**: Pratinjau bukti transfer via *Lightbox Modal*, pembaruan status produksi, penolakan pesanan dengan alasan wajib, dan notifikasi lonceng *in-app* real-time.
- **Master Data CRUD & Pengaturan Toko (Admin)**: Tambah/Edit/Hapus jenis & harga cetak, opsi *finishing*, serta pengaturan nama toko & rekening tujuan pembayaran langsung dari antarmuka Admin.
- **Laporan Transaksi Selesai (Admin)**: Filter rentang tanggal, ringkasan omzet nyata, dan mode cetak laporan (`window.print()`).

---

## Panduan Instalasi & Publish

### 1. Ekstrak & Instal Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`, lalu sesuaikan koneksi PostgreSQL dan kredensial Admin:
```bash
cp .env.example .env
```
Edit `.env`:
- `DATABASE_URL`: URL koneksi PostgreSQL Anda (lokal maupun cloud seperti Neon/Supabase/Railway).
- `JWT_SECRET`: String acak panjang untuk keamanan sesi login.
- `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Kredensial akun Admin pertama yang akan dibuat di database.

### 3. Sinkronisasi Database & Buat Akun Admin
Jalankan perintah berikut untuk membuat tabel database dan menyuntikkan akun Admin awal (**tanpa data dummy**):
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Jalankan di Mode Pengembangan atau Produksi
- **Development**:
  ```bash
  npm run dev
  ```
- **Production Build & Start**:
  ```bash
  npm run build
  npm start
  ```

### 5. Langkah Awal Setelah Login Admin
1. Masuk ke `/login` menggunakan `ADMIN_EMAIL` dan `ADMIN_PASSWORD` yang diatur di `.env`.
2. Buka menu **Master Data Harga**, lalu isi **Pengaturan Toko & Rekening**, tambahkan **Jenis & Harga Cetak**, serta **Opsi Finishing**.
3. Setelah Master Data terisi, pelanggan dapat mendaftar melalui `/register` dan langsung melakukan pemesanan cetak.
