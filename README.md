# Inventory Dashboard

Aplikasi dashboard manajemen **barang, pengadaan, dan penjualan** berbasis **Next.js 14 (App Router) + MySQL (Prisma ORM)**. Responsif untuk desktop maupun mobile, dengan sistem login, role/akses per modul, dan **multi-tenant** (satu instalasi bisa dipakai banyak perusahaan sekaligus, masing-masing dengan datanya sendiri).

## Multi-Tenant: Pendaftaran Perusahaan

Aplikasi ini bersifat **multi-tenant** — satu deployment bisa melayani banyak perusahaan (`Company`) sekaligus, dan setiap perusahaan hanya bisa melihat & mengelola datanya sendiri.

- **Pendaftaran mandiri** — buka `/register` untuk mendaftarkan perusahaan baru. Cukup isi nama perusahaan, nama & email admin, dan password. Sistem otomatis membuat:
  1. Data **Company** baru (dengan slug unik dari nama perusahaan),
  2. User pertama dengan role **ADMIN** untuk perusahaan tersebut,
  3. **Chart of Akun default** (lihat `src/lib/defaultAkun.ts`) supaya modul Akuntansi langsung siap pakai.
  
  Setelah daftar, otomatis login dan masuk ke Dashboard.

- **Isolasi data** — setiap tabel data (barang, kategori, supplier, pelanggan, pengadaan, penjualan, akun, jurnal, user) punya kolom `companyId`. Setiap query di API **wajib** difilter dengan `companyId` milik user yang sedang login (lihat helper `getCompanyId()` di `src/lib/apiAuth.ts`, dipakai di awal hampir semua route handler). Mengakses/mengubah data milik perusahaan lain — walau tahu ID datanya — akan selalu direspons `404 Not Found`, bukan `403`, supaya tidak membocorkan informasi bahwa data itu ada.
- **Kode unik per perusahaan, bukan global** — kode barang, kode akun, dan nomor transaksi hanya perlu unik *dalam satu perusahaan*. Dua perusahaan berbeda boleh sama-sama punya barang dengan kode `BRG-001`.
- **Email tetap unik secara global** — satu alamat email hanya bisa terdaftar di satu perusahaan (dipakai untuk login tanpa perlu memilih perusahaan lebih dulu).
- **Manajemen User per perusahaan** — Administrator hanya bisa melihat, menambah, mengedit, dan menghapus user **di perusahaannya sendiri**. Ia tidak akan pernah melihat user dari perusahaan lain, sekalipun lewat API langsung.
- **Nonaktifkan perusahaan** — kolom `Company.isActive` bisa dipakai untuk menangguhkan akses seluruh user suatu perusahaan (mis. langganan berakhir) tanpa menghapus datanya; login akan ditolak selama `isActive = false`.

## Modul

| Modul | Deskripsi |
|---|---|
| **Registrasi Perusahaan** | Pendaftaran mandiri (`/register`) — membuat perusahaan baru + admin pertama + Chart of Akun default |
| **Login** | Autentikasi email/password (NextAuth, JWT session), menyertakan konteks perusahaan (`companyId`) di setiap sesi |
| **Dashboard** | Analisa barang **milik perusahaan yang login**: total jenis barang, nilai stok, tren penjualan vs pengadaan 6 bulan, komposisi kategori, barang terlaris, barang stok menipis |
| **Master Barang** | CRUD data barang: kode, nama, kategori, satuan, harga beli/jual, stok, stok minimum |
| **Pengadaan Barang** | Transaksi barang masuk (dari supplier). Menambah stok otomatis, riwayat transaksi, **edit transaksi** (stok disesuaikan otomatis berdasarkan selisih qty), batal transaksi (stok dikembalikan) |
| **Penjualan Barang** | Transaksi barang keluar. Mengurangi stok otomatis dengan validasi stok tersedia, riwayat transaksi, **edit transaksi** (stok disesuaikan otomatis, termasuk validasi jika qty baru melebihi stok tersedia), batal transaksi |
| **Manajemen User** | CRUD user & role — **dibatasi hanya untuk user dalam perusahaan yang sama** (khusus Administrator) |
| **Akuntansi** | Chart of Akun (COA), Jurnal Umum (manual + **otomatis** dari transaksi Pengadaan/Penjualan lewat double-entry bookkeeping), dan Laporan Keuangan (Laba Rugi & Neraca Saldo) |

## Role & Hak Akses

Role diatur secara terpusat di `src/lib/rbac.ts`, dipakai bersama oleh sidebar (tampilan menu), halaman (tombol aksi), dan API (validasi server-side) — sehingga konsisten di satu tempat. Role berlaku **dalam lingkup satu perusahaan**; user yang sama tidak bisa merangkap role di perusahaan lain (satu email = satu perusahaan).

| Role | Hak Akses |
|---|---|
| **ADMIN** | Akses penuh ke seluruh modul, termasuk Manajemen User & Akuntansi — dibatasi ke perusahaannya sendiri |
| **MANAGER** | Melihat & mengelola dashboard, master barang, pengadaan, penjualan, dan **Akuntansi** (tanpa akses Manajemen User) |
| **STAFF** | Melihat dashboard & master barang, dapat membuat transaksi pengadaan/penjualan. Tidak punya akses ke modul Akuntansi (data keuangan dibatasi) |

Akun demo (password: `password123`, dibuat lewat seed — semuanya tergabung dalam satu perusahaan contoh "Toko Demo"):

```
admin@toko.com    -> Administrator
manager@toko.com  -> Manajer
staff@toko.com    -> Staff
```

Untuk mencoba isolasi data antar-perusahaan, buka `/register` dan daftarkan perusahaan kedua dengan email berbeda — datanya akan terpisah total dari "Toko Demo".


## Tumpukan Teknologi

- **Next.js 14** (App Router, Server Components + Client Components)
- **MySQL 8** sebagai database, diakses lewat **Prisma ORM**
- **NextAuth.js** (Credentials Provider, JWT session) untuk autentikasi
- **Tailwind CSS** untuk styling responsif (mobile-first)
- **Recharts** untuk grafik analisa dashboard
- **Zod** untuk validasi input di API
- **lucide-react** untuk ikon

## Instalasi & Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js 18+
- MySQL Server 8+ (bisa juga MariaDB 10.6+)

### 2. Install dependency

```bash
npm install
```

### 3. Konfigurasi environment

Salin `.env.example` menjadi `.env`, lalu sesuaikan:

```bash
cp .env.example .env
```

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/inventory_dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ganti-dengan-string-acak-yang-panjang"
```

> Generate `NEXTAUTH_SECRET` yang aman, contoh: `openssl rand -base64 32`

### 4. Siapkan database

Buat database MySQL kosong dengan nama sesuai `DATABASE_URL` (`inventory_dashboard`), lalu jalankan migrasi Prisma untuk membuat seluruh tabel secara otomatis:

```bash
npx prisma migrate dev --name init
```

### 5. Isi data awal (seed)

Membuat 3 akun demo (admin/manager/staff), kategori, supplier, pelanggan, dan beberapa barang serta transaksi contoh untuk mengisi grafik dashboard:

```bash
npm run prisma:seed
```

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — Anda akan diarahkan ke halaman login. Untuk instalasi baru, buka [http://localhost:3000/register](http://localhost:3000/register) untuk mendaftarkan perusahaan pertama Anda (atau pakai akun demo dari seed di atas).

> **Catatan untuk instalasi yang sudah berjalan sebelum fitur multi-tenant ditambahkan:** migrasi ini menambahkan tabel `Company` dan kolom `companyId` (NOT NULL) ke hampir semua tabel. Prisma akan meminta nilai default saat migrasi karena tabel lama sudah berisi data. Cara teraman: buat 1 baris `Company` manual dulu, lalu isi `companyId` semua tabel lama dengan ID perusahaan tersebut sebelum menjadikan kolomnya NOT NULL — atau paling sederhana, mulai dari database kosong (`DROP DATABASE` lalu buat ulang) jika datanya masih data uji coba. Setelah migrasi, **semua user yang sedang login harus login ulang** karena sesi/JWT lama belum memuat `companyId`.

### Build untuk produksi

```bash
npm run build
npm run start
```

## Struktur Proyek

```
prisma/
  schema.prisma        # Skema database (sumber kebenaran struktur tabel, termasuk model Company)
  seed.ts               # Data awal / dummy data (1 perusahaan contoh + 3 user + transaksi)

src/
  app/
    login/              # Halaman login (publik)
    register/           # Halaman pendaftaran perusahaan baru (publik)
    (app)/              # Grup halaman yang wajib login (dilindungi middleware)
      layout.tsx         # Cek sesi + render Shell (sidebar & header)
      dashboard/
      master-barang/
      pengadaan/
      penjualan/
      akuntansi/          # Chart of Akun, jurnal/, laporan/
      users/
    api/                # Route handler REST (satu folder per modul/resource)
      auth/[...nextauth]/
      register/           # Endpoint publik pendaftaran perusahaan
      barang/
      kategori/
      pengadaan/
      penjualan/
      supplier/
      pelanggan/
      akun/
      jurnal/
      laporan/
      users/
      dashboard/stats/
  components/           # Komponen UI reusable (DataTable, Modal, Sidebar, chart, dst)
  lib/
    prisma.ts            # Prisma client singleton
    auth.ts               # Konfigurasi NextAuth (JWT menyertakan companyId)
    rbac.ts                # Definisi role & permission (PUSAT kontrol akses)
    apiAuth.ts              # Helper requirePermission() & getCompanyId() untuk route handler
    akuntansi.ts             # Posting jurnal otomatis (double-entry), semua company-aware
    defaultAkun.ts            # Daftar Chart of Akun default (dipakai seed & pendaftaran baru)
  middleware.ts          # Proteksi route: redirect ke /login jika belum login
```

## Cara Menambahkan Modul Baru

Aplikasi ini didesain agar penambahan modul baru cepat dan konsisten, tanpa mengubah struktur inti. Sebagai contoh, menambahkan modul **"Retur Barang"**:

1. **Skema database** — tambahkan model baru di `prisma/schema.prisma`. **Sertakan kolom `companyId Int` + relasi ke `Company`** (lihat model lain sebagai contoh) supaya data modul baru otomatis ikut ter-isolasi per perusahaan, lalu jalankan:
   ```bash
   npx prisma migrate dev --name add_retur
   ```

2. **Permission** — tambahkan permission baru di `src/lib/rbac.ts`:
   ```ts
   export type Permission =
     | ... // permission lain
     | "retur.view"
     | "retur.manage";
   ```
   Lalu daftarkan permission tersebut ke role yang berhak di `rolePermissions`.

3. **API route** — buat folder `src/app/api/retur/route.ts` (dan `[id]/route.ts` jika perlu), gunakan pola yang sama seperti modul lain: panggil `requirePermission("retur.view" | "retur.manage")` di awal setiap handler, lalu **`getCompanyId(session)`** dan sertakan `companyId` di setiap `where` (list/detail) dan `data` (create). Untuk route `[id]`, selalu cek kepemilikan lebih dulu (`findFirst({ where: { id, companyId } })`) sebelum update/delete — lihat `src/app/api/barang/[id]/route.ts` sebagai contoh polanya.

4. **Halaman** — buat folder `src/app/(app)/retur/page.tsx`, gunakan komponen siap pakai `DataTable`, `Modal`, `Badge` agar tampilan tetap konsisten dengan modul lain.

5. **Sidebar** — tambahkan satu entri di `navItems` pada `src/components/Sidebar.tsx` (field `section` menentukan pengelompokan menu):
   ```ts
   { href: "/retur", label: "Retur Barang", icon: Undo2, permission: "retur.view", section: "Utama" }
   ```
   Menu otomatis muncul/hilang sesuai role user karena sudah difilter dengan `can()`.

6. **Judul halaman** (opsional) — tambahkan entri di `titleMap` pada `src/components/Shell.tsx` agar judul di header sesuai.

7. **Middleware** — tambahkan `"/retur/:path*"` ke array `matcher` di `src/middleware.ts`. Tanpa ini halaman tetap aman (layout `(app)` sudah redirect ke `/login` di server), tapi menambahkannya membuat proteksi konsisten dengan modul lain.

Tidak ada langkah lain yang diperlukan — routing, proteksi login, dan tampilan sidebar/header mengikuti pola yang sudah ada secara otomatis. Modul **Akuntansi** di aplikasi ini dibangun persis dengan 7 langkah di atas (termasuk `companyId` di setiap query) — jadi bisa dipakai sebagai contoh nyata jika ingin menambahkan modul multi-halaman (COA, Jurnal, Laporan sekaligus).

## Desain Responsif

- Sidebar berubah menjadi off-canvas drawer (dapat dibuka/tutup) di layar mobile (`< 1024px`), dan statis di desktop.
- Seluruh tabel data dibungkus `overflow-x-auto` sehingga tetap bisa digeser secara horizontal di layar kecil tanpa merusak tata letak.
- Form transaksi & modal menggunakan lebar penuh di mobile dan menempel di bagian bawah layar (bottom sheet style) agar mudah dijangkau ibu jari.
- Grid statistik & grafik menyesuaikan jumlah kolom otomatis (1 kolom di mobile, hingga 4 kolom di layar besar).

### Input di HP/Mobile

- Semua field angka (qty, harga, stok) memakai `inputMode="numeric"` / `"decimal"` sehingga keyboard HP langsung menampilkan tombol angka, bukan keyboard huruf.
- Field email pada login memakai `inputMode="email"` dan `autoComplete`, field password memakai `autoComplete="current-password"` agar bisa terisi otomatis dari password manager HP.
- Ukuran font input dipaksa minimal 16px khusus di layar kecil (lihat `globals.css`) — ini mencegah Safari iOS otomatis melakukan zoom saat sebuah input disentuh.
- Tombol aksi (edit/hapus/lihat) memakai kelas `.icon-btn` dengan area sentuh 36x36px agar mudah ditekan jari.
- Tombol "Simpan"/"Batal" pada form transaksi bersifat *sticky* di bagian bawah modal, sehingga tetap terlihat & bisa ditekan meski form sedang di-scroll di layar kecil.

### Auto-Refresh (Tanpa Perlu Reload Manual)

Setiap halaman (Dashboard, Master Barang, Pengadaan, Penjualan, Users) memakai hook `useAutoRefresh` (`src/lib/useAutoRefresh.ts`) dengan 3 pemicu:

1. **Polling berkala** — data diambil ulang otomatis setiap 15 detik, sehingga perubahan dari user/perangkat lain (mis. admin di kantor menambah barang, kasir di HP membuat transaksi penjualan) ikut muncul tanpa reload.
2. **Saat tab/aplikasi kembali aktif** — jika pengguna berpindah aplikasi di HP lalu kembali ke browser, data langsung di-refresh.
3. **Instan setelah input berhasil** — begitu sebuah transaksi/data disimpan, fungsi `notifyDataChanged()` dipanggil. Ini langsung memperbarui data di tab yang sama, dan juga di tab/jendela lain pada perangkat yang sama (lewat event `storage`) — misalnya jika Anda membuka Master Barang dan Pengadaan di dua tab sekaligus, stok di kedua tab akan sinkron otomatis.

Indikator kecil "● Auto-refresh aktif · diperbarui HH:mm:ss" ditampilkan di pojok kanan atas setiap halaman sebagai penanda bahwa data selalu ter-update.

> Catatan: polling berkala mengambil data lewat REST API biasa (bukan WebSocket), jadi cocok untuk skala toko/gudang menengah. Jika ke depan dibutuhkan update super real-time (misalnya banyak kasir aktif bersamaan), interval 15 detik pada `useAutoRefresh(loadData, 15000)` bisa diperpendek, atau diganti dengan WebSocket/Server-Sent Events.

## Edit Transaksi Pengadaan & Penjualan

Selain tambah, lihat detail, dan batalkan, kedua modul transaksi kini punya tombol **Edit** (ikon pensil) yang bisa mengubah tanggal, supplier/pelanggan, catatan, dan daftar item (barang, qty, harga satuan) pada transaksi yang sudah tersimpan.

Penyesuaian stok saat edit dihitung berbasis **selisih (delta)**, bukan reset total, supaya tetap konsisten meski sudah ada transaksi lain setelahnya:

- **Pengadaan**: jika qty sebuah barang dinaikkan, stok ikut bertambah sebesar selisihnya; jika diturunkan, stok dikurangi sebesar selisihnya. Sistem menolak perubahan (error 409) jika pengurangan tersebut akan membuat stok menjadi minus — misalnya karena barang tersebut sudah terlanjur terjual.
- **Penjualan**: jika qty diturunkan, sebagian stok dikembalikan; jika dinaikkan, stok dikurangi lagi. Sistem menolak perubahan jika stok yang tersedia tidak mencukupi untuk qty baru.
- Mengganti barang pada suatu baris (bukan cuma qty-nya) juga ditangani dengan benar: stok barang lama disesuaikan kembali, stok barang baru dipotong/ditambah sesuai jenis transaksinya.
- Semua penyesuaian stok + perubahan detail transaksi dibungkus dalam satu `prisma.$transaction` agar tetap atomic (tidak ada kondisi stok "nyangkut" di tengah jalan bila terjadi error).

Hanya role dengan permission `pengadaan.manage` / `penjualan.manage` (ADMIN, MANAGER, STAFF — lihat tabel role di atas) yang melihat tombol Edit dan Batalkan; role lain hanya bisa melihat.

### Menambah Beberapa Barang dalam 1 Transaksi

Form transaksi (baik saat membuat baru maupun edit) mendukung banyak baris barang. Sejak versi ini, baris kosong baru **muncul otomatis** begitu Anda memilih barang di baris terakhir — jadi Anda tidak perlu mengingat untuk menekan tombol "+ Tambah baris" secara manual setiap kali ingin menambah barang lain. Tombol "+ Tambah baris" tetap tersedia (kini dengan gaya lebih menonjol) untuk menambah baris kosong tanpa langsung memilih barang. Label "Daftar Barang" juga menampilkan penghitung real-time jumlah barang yang sudah dipilih, sehingga mudah memastikan semua barang benar-benar masuk sebelum menekan "Simpan".

## Modul Akuntansi

Modul ini menerapkan **double-entry bookkeeping** (akuntansi berpasangan) sederhana yang terintegrasi dengan modul operasional, terdiri dari 3 halaman:

### 1. Chart of Akun (`/akuntansi`)
Daftar akun keuangan (kode, nama, tipe: Aset/Kewajiban/Modal/Pendapatan/Beban, dan saldo normal). Sistem butuh 4 akun dengan kode tertentu (dibuat otomatis lewat `npm run prisma:seed`, lihat `src/lib/akuntansi.ts` → `KODE_AKUN`) untuk posting jurnal otomatis:

| Kode | Akun | Dipakai untuk |
|---|---|---|
| 1101 | Kas | Sisi kas di setiap transaksi pengadaan/penjualan tunai |
| 1103 | Persediaan Barang Dagang | Nilai stok barang dagang |
| 4101 | Pendapatan Penjualan | Pendapatan dari transaksi penjualan |
| 5101 | Harga Pokok Penjualan (HPP) | Beban pokok atas barang yang terjual |

Akun lain (Piutang, Hutang Usaha, Modal, Beban Operasional/Gaji/Sewa) sudah disiapkan di seed sebagai contoh dan bisa dipakai untuk jurnal manual.

### 2. Jurnal Umum (`/akuntansi/jurnal`)
Menampilkan seluruh jurnal — baik yang **otomatis** dibuat sistem maupun **manual**:

- **Otomatis** — setiap kali transaksi Pengadaan atau Penjualan dibuat, diedit, atau dibatalkan, sistem otomatis memposting/menyesuaikan jurnalnya (lihat detail di bawah). Jurnal jenis ini tidak bisa dihapus langsung dari sini — ubah lewat transaksi sumbernya di modul Pengadaan/Penjualan agar datanya tetap konsisten.
- **Manual** — untuk mencatat transaksi keuangan di luar pengadaan/penjualan (mis. bayar gaji, sewa, setoran modal). Form mendukung banyak baris debit/kredit dan memvalidasi bahwa **total debit harus sama dengan total kredit** sebelum bisa disimpan.

**Logika posting otomatis** (lihat `src/lib/akuntansi.ts`):

- **Pengadaan** (asumsi pembelian tunai): `Debit Persediaan` / `Kredit Kas` sebesar total pengadaan.
- **Penjualan**: dua pasang entri sekaligus —
  1. Pengakuan pendapatan: `Debit Kas` / `Kredit Pendapatan Penjualan` sebesar total jual.
  2. Pengakuan HPP: `Debit HPP` / `Kredit Persediaan` sebesar qty × **harga beli** barang saat itu.

Posting bersifat **fail-safe**: jika Chart of Akun belum disiapkan (instalasi baru yang belum di-seed), transaksi pengadaan/penjualan tetap berhasil disimpan — jurnalnya cukup diposting manual belakangan. Errornya dicatat di server log (`console.error`), tidak menggagalkan transaksi operasional.

### 3. Laporan Keuangan (`/akuntansi/laporan`)
- **Laba Rugi** — total Pendapatan dikurangi total Beban (termasuk HPP) dalam rentang tanggal yang dipilih (default: bulan berjalan).
- **Neraca Saldo** — akumulasi debit/kredit tiap akun sejak awal, dengan indikator apakah total debit = total kredit di seluruh sistem (tanda jurnal sudah balance).

## Keamanan

- **Isolasi antar-perusahaan (multi-tenant)** — setiap query API di-scope dengan `companyId` milik user yang login (`getCompanyId()` di `src/lib/apiAuth.ts`). Endpoint `[id]` (detail/edit/hapus) selalu memverifikasi kepemilikan data lebih dulu, dan mengembalikan `404` (bukan `403`) untuk data milik perusahaan lain — supaya keberadaan data tersebut pun tidak bocor.
- Password di-hash dengan **bcrypt** sebelum disimpan.
- Setiap route API memvalidasi sesi & permission lewat `requirePermission()` — bukan hanya disembunyikan di UI.
- Middleware Next.js memblokir akses langsung ke halaman terproteksi bagi yang belum login.
- Transaksi stok (pengadaan/penjualan) menggunakan `prisma.$transaction` agar perubahan data barang & detail transaksi konsisten (atomic).
- Login ditolak jika perusahaan (`Company.isActive`) dinonaktifkan, meski password user benar.
