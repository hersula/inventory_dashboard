import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { z } from "zod";

// Semua aksi Super Admin terhadap satu Company digabung di satu PATCH,
// dibedakan lewat field `action` — supaya menambah aksi baru (mis. "extendTrial")
// tidak perlu bikin route baru, cukup tambah satu case di sini.
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), planId: z.number().int().optional() }),
  z.object({ action: z.literal("reject"), reason: z.string().min(3, "Alasan penolakan wajib diisi") }),
  z.object({ action: z.literal("suspend") }),
  z.object({ action: z.literal("activate") }),
  z.object({
    action: z.literal("assignPlan"),
    planId: z.number().int().nullable(),
    subscriptionStatus: z.enum(["TRIAL", "ACTIVE", "EXPIRED", "CANCELED"]).optional(),
    subscriptionEndsAt: z.string().datetime().nullable().optional(),
  }),
]);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const id = Number(params.id);
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return NextResponse.json({ message: "Perusahaan tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.action === "approve") {
    if (company.status !== "PENDING") {
      return NextResponse.json({ message: "Hanya pendaftaran berstatus PENDING yang bisa disetujui" }, { status: 409 });
    }
    const updated = await prisma.company.update({
      where: { id },
      data: {
        status: "ACTIVE",
        approvedAt: new Date(),
        rejectedReason: null,
        ...(data.planId ? { planId: data.planId, subscriptionStatus: "ACTIVE" } : {}),
      },
    });
    return NextResponse.json(updated);
  }

  if (data.action === "reject") {
    if (company.status !== "PENDING") {
      return NextResponse.json({ message: "Hanya pendaftaran berstatus PENDING yang bisa ditolak" }, { status: 409 });
    }
    const updated = await prisma.company.update({
      where: { id },
      data: { status: "REJECTED", rejectedReason: data.reason },
    });
    return NextResponse.json(updated);
  }

  if (data.action === "suspend") {
    if (company.status !== "ACTIVE") {
      return NextResponse.json({ message: "Hanya perusahaan aktif yang bisa ditangguhkan" }, { status: 409 });
    }
    const updated = await prisma.company.update({ where: { id }, data: { status: "SUSPENDED" } });
    return NextResponse.json(updated);
  }

  if (data.action === "activate") {
    if (company.status !== "SUSPENDED") {
      return NextResponse.json({ message: "Hanya perusahaan yang ditangguhkan bisa diaktifkan kembali" }, { status: 409 });
    }
    const updated = await prisma.company.update({ where: { id }, data: { status: "ACTIVE" } });
    return NextResponse.json(updated);
  }

  // assignPlan
  if (company.status !== "ACTIVE") {
    return NextResponse.json({ message: "Paket hanya bisa diatur untuk perusahaan yang sudah aktif" }, { status: 409 });
  }
  const updated = await prisma.company.update({
    where: { id },
    data: {
      planId: data.planId,
      subscriptionStatus: data.planId ? data.subscriptionStatus ?? "ACTIVE" : "TRIAL",
      subscriptionEndsAt: data.subscriptionEndsAt ? new Date(data.subscriptionEndsAt) : data.subscriptionEndsAt,
    },
  });
  return NextResponse.json(updated);
}
