import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { can, Permission } from "@/lib/rbac";
import type { Session } from "next-auth";

/**
 * Dipakai di awal setiap route handler untuk memastikan user login
 * dan memiliki izin yang sesuai. Jika modul baru ditambahkan, cukup
 * tentukan Permission baru di rbac.ts lalu panggil helper ini.
 */
export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { session: null, error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  if (!can(session.user.role, permission)) {
    return { session: null, error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { session, error: null };
}

/**
 * MULTI-TENANT: setiap query WAJIB di-scope dengan companyId user yang
 * login, supaya data satu perusahaan tidak pernah terlihat/tertimpa oleh
 * perusahaan lain. Pakai ini di setiap route setelah requirePermission().
 */
export function getCompanyId(session: Session): number {
  return Number(session.user.companyId);
}
