/**
 * Role Based Access Control
 * -------------------------------------------------------------
 * Menambahkan modul baru? cukup daftarkan izinnya di sini.
 * Tidak perlu menyentuh middleware atau halaman lain.
 */
export type Role = "ADMIN" | "MANAGER" | "STAFF";

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
  | "retur.manage";

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    "dashboard.view",
    "barang.view",
    "barang.manage",
    "pengadaan.view",
    "pengadaan.manage",
    "penjualan.view",
    "penjualan.manage",
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
    "akuntansi.view",
    "akuntansi.manage",
  ],
  STAFF: ["dashboard.view", "barang.view", "pengadaan.view", "pengadaan.manage", "penjualan.view", "penjualan.manage"],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manajer",
  STAFF: "Staff",
};
