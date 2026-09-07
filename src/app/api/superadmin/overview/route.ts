import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const [pending, active, suspended, rejected, totalCompanies, totalPlans, planBreakdown] = await Promise.all([
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.company.count({ where: { status: "ACTIVE" } }),
    prisma.company.count({ where: { status: "SUSPENDED" } }),
    prisma.company.count({ where: { status: "REJECTED" } }),
    prisma.company.count(),
    prisma.subscriptionPlan.count({ where: { isActive: true } }),
    prisma.company.groupBy({
      by: ["planId"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
  ]);

  const plans = await prisma.subscriptionPlan.findMany({ select: { id: true, nama: true } });
  const planMap = new Map(plans.map((p) => [p.id, p.nama]));

  return NextResponse.json({
    pending,
    active,
    suspended,
    rejected,
    totalCompanies,
    totalPlans,
    planBreakdown: planBreakdown.map((p) => ({
      planId: p.planId,
      planName: p.planId ? planMap.get(p.planId) ?? "Tidak diketahui" : "Belum ada paket",
      total: p._count._all,
    })),
  });
}
