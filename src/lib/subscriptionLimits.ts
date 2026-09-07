import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Menegakkan batas paket langganan (maxUser/maxBarang) yang diatur Super
 * Admin lewat SubscriptionPlan (lihat src/app/superadmin/paket). Company
 * tanpa paket (planId null) atau dengan batas null (tanpa batas) selalu lolos.
 * Dipakai di route POST yang menambah User/Barang baru — cek SETELAH
 * requirePermission() dan SEBELUM create, supaya paket free/berbayar
 * benar-benar berefek, bukan cuma informasi.
 */
export async function checkPlanLimit(companyId: number, type: "user" | "barang"): Promise<NextResponse | null> {
  const company = await prisma.company.findUnique({ where: { id: companyId }, include: { plan: true } });
  const limit = type === "user" ? company?.plan?.maxUser : company?.plan?.maxBarang;
  if (!limit) return null;

  const count =
    type === "user"
      ? await prisma.user.count({ where: { companyId } })
      : await prisma.barang.count({ where: { companyId } });

  if (count >= limit) {
    const label = type === "user" ? "user" : "jenis barang";
    return NextResponse.json(
      {
        message: `Batas paket "${company?.plan?.nama}" tercapai: maksimal ${limit} ${label}. Hubungi Super Admin untuk upgrade paket.`,
      },
      { status: 403 }
    );
  }
  return null;
}
