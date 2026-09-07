import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { z } from "zod";

const planSchema = z.object({
  nama: z.string().min(2, "Nama paket minimal 2 karakter"),
  harga: z.number().min(0),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  maxUser: z.number().int().positive().nullable().optional(),
  maxBarang: z.number().int().positive().nullable().optional(),
  deskripsi: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const id = Number(params.id);
  const body = await req.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
  }

  const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });

  const plan = await prisma.subscriptionPlan.update({ where: { id }, data: parsed.data });
  return NextResponse.json(plan);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const id = Number(params.id);
  const inUse = await prisma.company.count({ where: { planId: id } });
  if (inUse > 0) {
    return NextResponse.json(
      { message: `Paket masih dipakai oleh ${inUse} perusahaan. Pindahkan perusahaan ke paket lain dulu, atau nonaktifkan paket ini.` },
      { status: 409 }
    );
  }

  await prisma.subscriptionPlan.delete({ where: { id } });
  return NextResponse.json({ message: "Paket dihapus" });
}
