import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { z } from "zod";

const akunSchema = z.object({
  kode: z.string().min(1),
  nama: z.string().min(1),
  tipe: z.enum(["ASET", "KEWAJIBAN", "MODAL", "PENDAPATAN", "BEBAN"]),
  saldoNormal: z.enum(["DEBIT", "KREDIT"]),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const id = Number(params.id);
  const owned = await prisma.akun.findFirst({ where: { id, companyId } });
  if (!owned) return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = akunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const dup = await prisma.akun.findFirst({ where: { kode: parsed.data.kode, companyId, NOT: { id } } });
  if (dup) {
    return NextResponse.json({ message: "Kode akun sudah digunakan akun lain" }, { status: 409 });
  }

  const akun = await prisma.akun.update({ where: { id }, data: parsed.data });
  return NextResponse.json(akun);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const id = Number(params.id);
  const owned = await prisma.akun.findFirst({ where: { id, companyId } });
  if (!owned) return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });

  const dipakai = await prisma.jurnalDetail.findFirst({ where: { akunId: id } });
  if (dipakai) {
    return NextResponse.json(
      { message: "Akun tidak bisa dihapus karena sudah punya riwayat jurnal. Nonaktifkan saja akun ini." },
      { status: 409 }
    );
  }

  await prisma.akun.delete({ where: { id } });
  return NextResponse.json({ message: "Akun dihapus" });
}
