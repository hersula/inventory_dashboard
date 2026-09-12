/**
 * Role Based Access Control
 * -------------------------------------------------------------
 * Menambahkan modul baru? cukup daftarkan izinnya di sini.
 * Tidak perlu menyentuh middleware atau halaman lain.
 */
export type Role = "ADMIN" | "MANAGER" | "STAFF";

// Role sesi yang mungkin muncul di NextAuth (lihat src/types/next-auth.d.ts).
// SUPERADMIN ada di luar Role di atas karena tidak terikat companyId/permission
// per-modul manapun — akses & halamannya sepenuhnya terpisah (src/app/superadmin).
export type AppRole = Role | "SUPERADMIN";

export type Permission =
  | "dashboard.view"
  | "barang.view"
  | "barang.manage"
  | "pengadaan.view"
  | "pengadaan.manage"
  | "penjualan.view"
  | "penjualan.manage"
  | "akuntansi.view"
  | "akuntansi.manage"
  | "users.manage"
  | "retur.view"
  | "retur.manage"
  | "opname.view"
  | "opname.manage";

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    "dashboard.view",
    "barang.view",
    "barang.manage",
    "pengadaan.view",
    "pengadaan.manage",
    "penjualan.view",
    "penjualan.manage",
    "retur.view",
    "retur.manage",
    "opname.view",
    "opname.manage",
    "akuntansi.view",
    "akuntansi.manage",
    "users.manage",
  ],
  MANAGER: [
    "dashboard.view",
    "barang.view",
    "barang.manage",
    "pengadaan.view",
    "pengadaan.manage",
    "penjualan.view",
    "penjualan.manage",
    "retur.view",
    "retur.manage",
    "opname.view",
    "opname.manage",
    "akuntansi.view",
    "akuntansi.manage",
  ],
  // Retur & Stock Opname mengubah stok & memposting jurnal seperti
  // Pengadaan/Penjualan, jadi STAFF ikut diberi akses (sama seperti mereka
  // sudah bisa pengadaan.manage/penjualan.manage) — staf gudanglah yang
  // biasanya turun langsung menghitung stok fisik.
  STAFF: [
    "dashboard.view",
    "barang.view",
    "pengadaan.view",
    "pengadaan.manage",
    "penjualan.view",
    "penjualan.manage",
    "retur.view",
    "retur.manage",
    "opname.view",
    "opname.manage",
  ],
};

export function can(role: AppRole | undefined, permission: Permission): boolean {
  // SUPERADMIN sengaja tidak pernah lolos permission tenant biasa — aksesnya
  // sepenuhnya lewat requireSuperAdmin() & halaman /superadmin, bukan rbac ini.
  if (!role || role === "SUPERADMIN") return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manajer",
  STAFF: "Staff",
};
