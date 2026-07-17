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
| **Master Barang** | CRUD data barang: kode, nama, kategori (dengan quick-add kategori baru langsung dari form), satuan, harga beli/jual, stok, stok minimum |
| **Pengadaan Barang** | Transaksi barang masuk (dari supplier), dengan **diskon (%), PPN 11%, dan metode pembayaran (Tunai/Kredit/Tempo)**. Menambah stok otomatis, quick-add supplier langsung dari form, riwayat transaksi, **cetak per transaksi & cetak laporan semua transaksi**, **edit transaksi** (stok disesuaikan otomatis berdasarkan selisih qty), batal transaksi (stok dikembalikan) |
| **Penjualan Barang** | Transaksi barang keluar, dengan **diskon (%), PPN 11%, dan metode pembayaran (Tunai/Transfer Bank/Kredit/Tempo)**. Mengurangi stok otomatis dengan validasi stok tersedia, quick-add pelanggan langsung dari form, riwayat transaksi, **cetak per transaksi & cetak laporan semua transaksi**, **edit transaksi** (stok disesuaikan otomatis, termasuk validasi jika qty baru melebihi stok tersedia), batal transaksi |
| **Manajemen User** | CRUD user & role — **dibatasi hanya untuk user dalam perusahaan yang sama** (khusus Administrator) |
| **Akuntansi** | Chart of Akun (COA), Jurnal Umum (manual + **otomatis** dari transaksi Pengadaan/Penjualan lewat double-entry bookkeeping), **Pembayaran Hutang & Piutang** (pelunasan transaksi Kredit/Tempo), dan Laporan Keuangan (Laba Rugi & Neraca Saldo) |

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

> **Catatan untuk instalasi yang sudah berjalan sebelum fitur diskon & PPN ditambahkan:** migrasi ini menambahkan kolom `subtotal`, `diskonPersen`, `diskonNominal`, `ppn` ke tabel `Pengadaan`/`Penjualan` — semuanya punya nilai default `0` sehingga migrasi aman untuk data lama (tidak perlu isi manual). Yang perlu dilakukan manual: tambahkan 2 akun baru — **PPN Masukan** (`1104`, Aset) dan **PPN Keluaran** (`2102`, Kewajiban) — di modul Akuntansi > Chart of Akun untuk setiap perusahaan yang sudah terdaftar, supaya jurnal otomatis PPN bisa ikut terposting pada transaksi baru.

> **Catatan untuk instalasi yang sudah berjalan sebelum fitur metode pembayaran & Hutang/Piutang ditambahkan:** migrasi ini menambahkan kolom `metodeBayar` ke `Pengadaan`/`Penjualan` (default `TUNAI`, aman untuk data lama — transaksi lama otomatis dianggap tunai/lunas) dan tabel baru `Pembayaran`. Tambahkan juga akun **Bank** (`1105`, Aset) secara manual di Chart of Akun untuk perusahaan yang sudah terdaftar, supaya jurnal transaksi bermetode Transfer Bank bisa terposting.

> **Troubleshooting: error TypeScript "Object literal may only specify known properties" / field seperti `metodeBayar` dianggap tidak ada.** Ini terjadi kalau `schema.prisma` sudah diupdate tapi Prisma Client (kode TypeScript hasil generate di `node_modules/@prisma/client`) belum ikut di-generate ulang, jadi tipenya masih versi lama. Jalankan:
> ```bash
> npx prisma generate
> ```
> lalu build/jalankan lagi. `package.json` sekarang juga sudah punya script `postinstall` yang otomatis menjalankan `prisma generate` setiap kali `npm install`, supaya hal ini tidak terulang di update berikutnya. Setelah mengubah `schema.prisma` secara manual (tanpa lewat `prisma migrate dev`, yang otomatis generate ulang), selalu jalankan `npx prisma generate` secara manual.

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
      pengadaan/          # + [id]/print/ (cetak per transaksi), print/ (cetak laporan semua)
      penjualan/          # + [id]/print/ (cetak per transaksi), print/ (cetak laporan semua)
      akuntansi/          # Chart of Akun, jurnal/, pembayaran/ (Hutang & Piutang), laporan/
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
      pembayaran/          # + outstanding/ (daftar hutang/piutang yang perlu dibayar)
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

### Bisa Diinstall sebagai Aplikasi di HP (PWA)

Aplikasi ini punya `public/manifest.json` + ikon (`public/icons/`) sehingga bisa **"Ditambahkan ke Layar Utama"** dari browser HP (Android Chrome: menu ⋮ → "Add to Home screen"; iOS Safari: tombol Share → "Add to Home Screen") dan akan terbuka seperti aplikasi native — tanpa address bar browser, dengan ikon & nama sendiri ("Inventory") di home screen.

- Metadata PWA (nama, ikon, warna tema, mode tampilan `standalone`) diatur di `src/app/layout.tsx` dan `public/manifest.json`.
- **Penanganan notch/home-indicator (safe-area)** — `viewport-fit: cover` diaktifkan supaya tampilan memenuhi layar penuh di perangkat dengan notch/dynamic island (iPhone). Header, sidebar, modal (khususnya tombol sticky di bagian bawah form), serta halaman login/register semuanya sudah diberi padding `env(safe-area-inset-*)` agar tidak ada konten atau tombol yang tertutup notch di atas atau home-indicator di bawah.
- Catatan: ini adalah PWA "installable" (manifest + ikon), belum termasuk service worker untuk mode offline. Kalau suatu saat dibutuhkan akses offline, tinggal tambahkan `next-pwa` atau service worker manual di atas fondasi yang sudah ada ini.

### Input di HP/Mobile

- Semua field angka (qty, harga, stok) memakai `inputMode="numeric"` / `"decimal"` sehingga keyboard HP langsung menampilkan tombol angka, bukan keyboard huruf.
- Field email pada login memakai `inputMode="email"` dan `autoComplete`, field password memakai `autoComplete="current-password"` agar bisa terisi otomatis dari password manager HP.
- Ukuran font input dipaksa minimal 16px khusus di layar kecil (lihat `globals.css`) — ini mencegah Safari iOS otomatis melakukan zoom saat sebuah input disentuh.
- Tombol aksi (edit/hapus/lihat) memakai kelas `.icon-btn` dengan area sentuh 36x36px agar mudah ditekan jari.
- Tombol "Simpan"/"Batal" pada form transaksi bersifat *sticky* di bagian bawah modal, sehingga tetap terlihat & bisa ditekan meski form sedang di-scroll di layar kecil.
- Dropdown Supplier/Pelanggan/Kategori punya opsi tambah cepat ("+ Tambah Baru...") sehingga tidak perlu berpindah halaman saat mengisi form transaksi dari HP.

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

### Diskon & PPN 11%

Form Pengadaan dan Penjualan sekarang punya 2 pengaturan tambahan di bawah daftar barang:

- **Diskon (%)** — persentase diskon dari subtotal (0–100%). Nominalnya dihitung otomatis dan ditampilkan di ringkasan.
- **Kenakan PPN 11%** — centang untuk mengenakan PPN 11% (default aktif). PPN dihitung dari **DPP** (Dasar Pengenaan Pajak) yaitu subtotal setelah dikurangi diskon, bukan dari subtotal mentah.

Urutan perhitungannya: `Subtotal → (- Diskon) → DPP → (+ PPN 11%) → Total`. Ringkasan ini ditampilkan real-time di form maupun di modal detail transaksi.

Nilai `subtotal`, `diskonPersen`, `diskonNominal`, `ppn`, dan `total` (grand total) semuanya disimpan terpisah di database (bukan cuma total akhir), supaya riwayat transaksi tetap bisa ditelusuri berapa diskon/pajak yang berlaku saat itu meski persentase diskon/aturan pajak berubah di kemudian hari.

**Dampak ke Akuntansi** — jurnal otomatis (lihat bagian [Modul Akuntansi](#modul-akuntansi)) memisahkan PPN dari nilai persediaan/pendapatan, sesuai praktik akuntansi pajak:
- Pengadaan: `Debit Persediaan` sebesar **DPP** (bukan termasuk PPN) + `Debit PPN Masukan` sebesar PPN, lawannya `Kredit Kas` (jika Tunai) atau `Kredit Hutang Usaha` (jika Kredit/Tempo) sebesar total.
- Penjualan: `Kredit Pendapatan Penjualan` sebesar **DPP** + `Kredit PPN Keluaran` sebesar PPN, lawannya `Debit Kas`/`Debit Bank`/`Debit Piutang Usaha` (tergantung metode bayar — lihat bagian berikut) sebesar total. HPP (harga pokok) tetap dihitung dari harga beli barang, tidak terpengaruh diskon/PPN sisi jual.

Ini butuh 2 akun tambahan di Chart of Akun: **PPN Masukan** (`1104`, Aset) dan **PPN Keluaran** (`2102`, Kewajiban) — sudah termasuk di `src/lib/defaultAkun.ts` sehingga otomatis dibuat untuk perusahaan baru. Untuk perusahaan yang sudah terdaftar sebelum fitur ini ada, tambahkan kedua akun tersebut secara manual di modul Akuntansi > Chart of Akun agar jurnal PPN bisa terposting (jika belum ada, posting jurnal PPN akan gagal secara diam-diam — lihat catatan fail-safe di bagian Modul Akuntansi).

### Tambah Supplier / Pelanggan Langsung dari Form Transaksi

Dropdown "Supplier" (di form Pengadaan) dan "Pelanggan" (di form Penjualan) punya opsi **"+ Tambah Supplier/Pelanggan Baru..."** di baris paling bawah. Memilihnya membuka form kecil (nama, alamat, telepon, khusus supplier ada email) tanpa perlu keluar dari form transaksi yang sedang diisi — begitu tersimpan, data baru langsung otomatis terpilih dan form transaksi tetap terisi seperti semula.

### Metode Pembayaran & Hutang/Piutang

Form Pengadaan dan Penjualan punya field **Metode Pembayaran**:

| Metode | Pengadaan | Penjualan | Efek |
|---|---|---|---|
| **Tunai** | ✅ | ✅ | Lunas seketika — langsung mengurangi/menambah akun **Kas** |
| **Transfer Bank** | – | ✅ | Lunas seketika — langsung mengurangi/menambah akun **Bank** (`1105`) |
| **Kredit** | ✅ | ✅ | Belum lunas — membentuk **Hutang Usaha** (Pengadaan) / **Piutang Usaha** (Penjualan) |
| **Tempo** | ✅ | ✅ | Sama seperti Kredit (jatuh tempo pembayaran belakangan) — dari sisi akuntansi diperlakukan identik dengan Kredit |

Transaksi dengan metode **Kredit**/**Tempo** muncul di **Akuntansi > Hutang & Piutang** (`/akuntansi/pembayaran`) sebagai item yang "Perlu Dibayar"/"Perlu Ditagih". Dari sana:

- Klik **Bayar** untuk mencatat pelunasan (bisa sebagian/cicilan atau langsung lunas), pilih metode pelunasan (Tunai/Transfer), lalu sistem otomatis memposting jurnal `Debit Hutang Usaha / Kredit Kas atau Bank` (pembayaran hutang) atau `Debit Kas atau Bank / Kredit Piutang Usaha` (penerimaan piutang).
- Sisa hutang/piutang dihitung **dinamis** (total transaksi dikurangi jumlah seluruh pembayaran yang tercatat), bukan disimpan sebagai kolom terpisah, supaya selalu akurat dan tidak berisiko tidak sinkron.
- Riwayat pembayaran bisa dibatalkan (tombol hapus) jika salah catat — jurnal terkait ikut otomatis dihapus dan sisa hutang/piutang kembali seperti semula.
- Untuk menjaga konsistensi, transaksi Pengadaan/Penjualan yang **sudah punya riwayat pembayaran** tidak bisa lagi diedit atau dibatalkan langsung — hapus dulu riwayat pembayarannya di modul Hutang & Piutang jika transaksi tersebut benar-benar perlu diubah.

### Cetak (Print) Laporan Transaksi

Setiap baris transaksi di Pengadaan dan Penjualan punya tombol cetak (ikon printer) untuk mencetak **bukti transaksi tunggal** (format invoice: info pihak terkait, daftar barang, ringkasan diskon/PPN/total, metode bayar, area tanda tangan). Tombol **"Cetak Laporan"** di toolbar mencetak **semua transaksi** yang sedang tampil (mengikuti filter pencarian yang aktif) sebagai satu laporan tabel dengan grand total di akhir.

Halaman cetak (`/pengadaan/[id]/print`, `/pengadaan/print`, `/penjualan/[id]/print`, `/penjualan/print`) memakai layout khusus: sidebar & header otomatis disembunyikan saat mode cetak/print preview (lewat CSS `@media print` di `globals.css`), sehingga yang tercetak hanya dokumennya saja — tidak perlu library PDF tambahan, cukup dialog print bawaan browser (`window.print()`). Untuk menyimpan sebagai file PDF, pilih "Save as PDF" / "Simpan sebagai PDF" di dialog cetak browser.

## Modul Akuntansi

Modul ini menerapkan **double-entry bookkeeping** (akuntansi berpasangan) sederhana yang terintegrasi dengan modul operasional, terdiri dari 4 halaman:

### 1. Chart of Akun (`/akuntansi`)
Daftar akun keuangan (kode, nama, tipe: Aset/Kewajiban/Modal/Pendapatan/Beban, dan saldo normal). Sistem butuh 8 akun dengan kode tertentu (dibuat otomatis lewat `npm run prisma:seed` atau saat perusahaan baru mendaftar, lihat `src/lib/akuntansi.ts` → `KODE_AKUN`) untuk posting jurnal otomatis:

| Kode | Akun | Dipakai untuk |
|---|---|---|
| 1101 | Kas | Sisi kas untuk transaksi bermetode Tunai |
| 1102 | Piutang Usaha | Penjualan bermetode Kredit/Tempo, berkurang saat piutang dilunasi |
| 1103 | Persediaan Barang Dagang | Nilai stok barang dagang (sebesar DPP, tidak termasuk PPN) |
| 1104 | PPN Masukan | PPN dari transaksi Pengadaan (piutang pajak, bisa dikreditkan) |
| 1105 | Bank | Sisi kas untuk transaksi bermetode Transfer Bank |
| 2101 | Hutang Usaha | Pengadaan bermetode Kredit/Tempo, berkurang saat hutang dilunasi |
| 2102 | PPN Keluaran | PPN dari transaksi Penjualan (utang pajak ke kas negara) |
| 4101 | Pendapatan Penjualan | Pendapatan dari transaksi penjualan (sebesar DPP, tidak termasuk PPN) |
| 5101 | Harga Pokok Penjualan (HPP) | Beban pokok atas barang yang terjual |

Akun lain (Modal, Beban Operasional/Gaji/Sewa) sudah disiapkan di seed sebagai contoh dan bisa dipakai untuk jurnal manual.

### 2. Jurnal Umum (`/akuntansi/jurnal`)
Menampilkan seluruh jurnal — baik yang **otomatis** dibuat sistem maupun **manual**:

- **Otomatis** — setiap kali transaksi Pengadaan, Penjualan, atau Pembayaran Hutang/Piutang dibuat/diedit/dibatalkan, sistem otomatis memposting/menyesuaikan jurnalnya (lihat detail di bawah). Jurnal jenis ini tidak bisa dihapus langsung dari sini — ubah lewat transaksi sumbernya agar datanya tetap konsisten.
- **Manual** — untuk mencatat transaksi keuangan di luar pengadaan/penjualan (mis. bayar gaji, sewa, setoran modal). Form mendukung banyak baris debit/kredit dan memvalidasi bahwa **total debit harus sama dengan total kredit** sebelum bisa disimpan.

**Logika posting otomatis** (lihat `src/lib/akuntansi.ts`), memperhitungkan diskon, PPN 11%, dan metode pembayaran dari transaksi (lihat [bagian Diskon & PPN](#diskon--ppn-11) dan [bagian Metode Pembayaran](#metode-pembayaran--hutangpiutang)):

- **Pengadaan**: `Debit Persediaan` sebesar DPP, `Debit PPN Masukan` sebesar PPN (jika ada), lawannya `Kredit Kas` (metode Tunai) atau `Kredit Hutang Usaha` (metode Kredit/Tempo).
- **Penjualan**: tiga bagian sekaligus —
  1. Pengakuan penjualan: `Debit Kas`/`Debit Bank`/`Debit Piutang Usaha` (tergantung metode bayar) sebesar total diterima, `Kredit Pendapatan Penjualan` sebesar DPP.
  2. Pengakuan PPN: `Kredit PPN Keluaran` sebesar PPN (jika ada).
  3. Pengakuan HPP: `Debit HPP` / `Kredit Persediaan` sebesar qty × **harga beli** barang saat itu (tidak terpengaruh diskon/PPN/metode bayar sisi jual).
- **Pembayaran Hutang/Piutang** (lihat halaman ke-3 di bawah): `Debit Hutang Usaha / Kredit Kas atau Bank` (pelunasan hutang) atau `Debit Kas atau Bank / Kredit Piutang Usaha` (penerimaan piutang).

Posting bersifat **fail-safe**: jika Chart of Akun belum disiapkan (instalasi baru yang belum di-seed, atau salah satu akun di atas belum dibuat), transaksi tetap berhasil disimpan — jurnalnya cukup diposting manual belakangan. Errornya dicatat di server log (`console.error`), tidak menggagalkan transaksi operasional.

### 3. Pembayaran Hutang & Piutang (`/akuntansi/pembayaran`)
Lihat penjelasan lengkap di [bagian Metode Pembayaran & Hutang/Piutang](#metode-pembayaran--hutangpiutang) di atas.

### 4. Laporan Keuangan (`/akuntansi/laporan`)
- **Laba Rugi** — total Pendapatan dikurangi total Beban (termasuk HPP) dalam rentang tanggal yang dipilih (default: bulan berjalan).
- **Neraca Saldo** — akumulasi debit/kredit tiap akun sejak awal, dengan indikator apakah total debit = total kredit di seluruh sistem (tanda jurnal sudah balance).

## Keamanan

- **Isolasi antar-perusahaan (multi-tenant)** — setiap query API di-scope dengan `companyId` milik user yang login (`getCompanyId()` di `src/lib/apiAuth.ts`). Endpoint `[id]` (detail/edit/hapus) selalu memverifikasi kepemilikan data lebih dulu, dan mengembalikan `404` (bukan `403`) untuk data milik perusahaan lain — supaya keberadaan data tersebut pun tidak bocor.
- Password di-hash dengan **bcrypt** sebelum disimpan.
- Setiap route API memvalidasi sesi & permission lewat `requirePermission()` — bukan hanya disembunyikan di UI.
- Middleware Next.js memblokir akses langsung ke halaman terproteksi bagi yang belum login.
- Transaksi stok (pengadaan/penjualan) menggunakan `prisma.$transaction` agar perubahan data barang & detail transaksi konsisten (atomic).
- Login ditolak jika perusahaan (`Company.isActive`) dinonaktifkan, meski password user benar.
