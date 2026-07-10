import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { can, Permission } from "@/lib/rbac";

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
