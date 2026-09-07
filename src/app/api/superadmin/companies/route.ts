import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/apiAuth";

// Daftar seluruh Company lintas-tenant — HANYA Super Admin yang boleh melihat
// ini tanpa scope companyId (kebalikan dari getCompanyId() di modul lain).
export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const statusParam = req.nextUrl.searchParams.get("status");
  const validStatuses = ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"] as const;
  const status = validStatuses.includes(statusParam as any) ? (statusParam as (typeof validStatuses)[number]) : null;

  const companies = await prisma.company.findMany({
    where: status ? { status } : undefined,
    include: {
      plan: { select: { id: true, nama: true, harga: true, billingCycle: true } },
      _count: { select: { users: true } },
      users: {
        where: { role: "ADMIN" },
        select: { name: true, email: true },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    companies.map((c) => ({
      id: c.id,
      nama: c.nama,
      slug: c.slug,
      email: c.email,
      telepon: c.telepon,
      status: c.status,
      rejectedReason: c.rejectedReason,
      approvedAt: c.approvedAt,
      createdAt: c.createdAt,
      plan: c.plan,
      subscriptionStatus: c.subscriptionStatus,
      subscriptionEndsAt: c.subscriptionEndsAt,
      totalUser: c._count.users,
      admin: c.users[0] ?? null,
    }))
  );
}
