import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiAuth";

/**
 * Dipanggil aplikasi mobile saat pertama dibuka untuk mengecek apakah token
 * tersimpan masih valid, sekaligus mengambil data user/role/perusahaan
 * terbaru (mis. kalau role-nya baru saja diubah Admin dari web).
 */
export async function GET() {
  const { error, session } = await requirePermission("dashboard.view");
  if (error) return error;

  return NextResponse.json({ user: session!.user });
}
