# Inventory Dashboard

Aplikasi dashboard manajemen **barang, pengadaan, dan penjualan** berbasis **Next.js 14 (App Router) + MySQL (Prisma ORM)**. Responsif untuk desktop maupun mobile, dengan sistem login dan role/akses per modul.

## Modul

| Modul | Deskripsi |
|---|---|
| **Login** | Autentikasi email/password (NextAuth, JWT session) |
| **Dashboard** | Analisa barang: total jenis barang, nilai stok, tren penjualan vs pengadaan 6 bulan, komposisi kategori, barang terlaris, barang stok menipis |
| **Master Barang** | CRUD data barang: kode, nama, kategori, satuan, harga beli/jual, stok, stok minimum |
| **Pengadaan Barang** | Transaksi barang masuk (dari supplier). Menambah stok otomatis, riwayat transaksi, batal transaksi (stok dikembalikan) |
| **Penjualan Barang** | Transaksi barang keluar. Mengurangi stok otomatis dengan validasi stok tersedia, riwayat transaksi, batal transaksi |
| **Manajemen User** | CRUD user & role (khusus Administrator) |

## Role & Hak Akses

Role diatur secara terpusat di `src/lib/rbac.ts`, dipakai bersama oleh sidebar (tampilan menu), halaman (tombol aksi), dan API (validasi server-side) — sehingga konsisten di satu tempat.

| Role | Hak Akses |
|---|---|
| **ADMIN** | Akses penuh ke seluruh modul, termasuk Manajemen User |
| **MANAGER** | Melihat & mengelola dashboard, master barang, pengadaan, penjualan (tanpa akses Manajemen User) |
| **STAFF** | Melihat dashboard & master barang, dapat membuat transaksi pengadaan/penjualan |

Akun demo (password: `password123`, dibuat lewat seed):

```
admin@toko.com    -> Administrator
manager@toko.com  -> Manajer
staff@toko.com    -> Staff
```

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

Buka [http://localhost:3000](http://localhost:3000) — Anda akan diarahkan ke halaman login.

### Build untuk produksi

```bash
npm run build
npm run start
```

## Struktur Proyek

```
prisma/
  schema.prisma        # Skema database (sumber kebenaran struktur tabel)
  seed.ts               # Data awal / dummy data

src/
  app/
    login/              # Halaman login (publik)
    (app)/              # Grup halaman yang wajib login (dilindungi middleware)
      layout.tsx         # Cek sesi + render Shell (sidebar & header)
      dashboard/
      master-barang/
      pengadaan/
      penjualan/
      users/
    api/                # Route handler REST (satu folder per modul/resource)
      auth/[...nextauth]/
      barang/
      kategori/
      pengadaan/
      penjualan/
      supplier/
      pelanggan/
      users/
      dashboard/stats/
  components/           # Komponen UI reusable (DataTable, Modal, Sidebar, chart, dst)
  lib/
    prisma.ts            # Prisma client singleton
    auth.ts               # Konfigurasi NextAuth
    rbac.ts                # Definisi role & permission (PUSAT kontrol akses)
    apiAuth.ts              # Helper requirePermission() untuk route handler
  middleware.ts          # Proteksi route: redirect ke /login jika belum login
```

## Cara Menambahkan Modul Baru

Aplikasi ini didesain agar penambahan modul baru cepat dan konsisten, tanpa mengubah struktur inti. Sebagai contoh, menambahkan modul **"Retur Barang"**:

1. **Skema database** — tambahkan model baru di `prisma/schema.prisma`, lalu jalankan:
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

3. **API route** — buat folder `src/app/api/retur/route.ts` (dan `[id]/route.ts` jika perlu), gunakan pola yang sama seperti modul lain: panggil `requirePermission("retur.view" | "retur.manage")` di awal setiap handler.

4. **Halaman** — buat folder `src/app/(app)/retur/page.tsx`, gunakan komponen siap pakai `DataTable`, `Modal`, `Badge` agar tampilan tetap konsisten dengan modul lain.

5. **Sidebar** — tambahkan satu entri di `navItems` pada `src/components/Sidebar.tsx`:
   ```ts
   { href: "/retur", label: "Retur Barang", icon: Undo2, permission: "retur.view" }
   ```
   Menu otomatis muncul/hilang sesuai role user karena sudah difilter dengan `can()`.

6. **Judul halaman** (opsional) — tambahkan entri di `titleMap` pada `src/components/Shell.tsx` agar judul di header sesuai.

Tidak ada langkah lain yang diperlukan — routing, proteksi login, dan tampilan sidebar/header mengikuti pola yang sudah ada secara otomatis.

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

## Keamanan

- Password di-hash dengan **bcrypt** sebelum disimpan.
- Setiap route API memvalidasi sesi & permission lewat `requirePermission()` — bukan hanya disembunyikan di UI.
- Middleware Next.js memblokir akses langsung ke halaman terproteksi bagi yang belum login.
- Transaksi stok (pengadaan/penjualan) menggunakan `prisma.$transaction` agar perubahan data barang & detail transaksi konsisten (atomic).
