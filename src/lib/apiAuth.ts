import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { can, Permission } from "@/lib/rbac";
import { verifyMobileToken } from "@/lib/mobileAuth";
import type { Session } from "next-auth";

/**
 * Dipakai di awal setiap route handler untuk memastikan user login
 * dan memiliki izin yang sesuai. Jika modul baru ditambahkan, cukup
 * tentukan Permission baru di rbac.ts lalu panggil helper ini.
 *
 * Mendukung DUA jalur autentikasi secara transparan (route caller tidak
 * perlu tahu/berubah sama sekali):
 *   1. Web  — session cookie NextAuth (default).
 *   2. Mobile (Flutter) — header `Authorization: Bearer <token>` dari
 *      POST /api/mobile/login. Lihat src/lib/mobileAuth.ts.
 */
export async function requirePermission(permission: Permission) {
  let session = await getServerSession(authOptions);

  if (!session) {
    const authHeader = headers().get("authorization");
    const token = authHeader?.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
    const payload = token ? verifyMobileToken(token) : null;

    if (payload) {
      // Bentuk object minimal yang strukturnya sama seperti Session NextAuth,
      // supaya seluruh route handler yang sudah ada (baca session.user.*)
      // tetap jalan tanpa perubahan apa pun.
      session = {
        user: {
          id: String(payload.userId),
          name: payload.name,
          email: payload.email,
          role: payload.role,
          companyId: String(payload.companyId),
          companyName: payload.companyName,
        },
        expires: new Date(payload.exp * 1000).toISOString(),
      } as Session;
    }
  }

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
