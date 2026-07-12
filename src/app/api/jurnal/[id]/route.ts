import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const data = await prisma.jurnalEntry.findFirst({
    where: { id: Number(params.id), companyId },
    include: { user: { select: { name: true } }, detail: { include: { akun: true } } },
  });
  if (!data) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const jurnal = await prisma.jurnalEntry.findFirst({ where: { id: Number(params.id), companyId } });
  if (!jurnal) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  if (jurnal.referensiTipe !== "manual") {
    return NextResponse.json(
      {
        message:
          "Jurnal ini dibuat otomatis dari transaksi Pengadaan/Penjualan dan tidak bisa dihapus langsung. Edit atau batalkan transaksi sumbernya di modul terkait — jurnalnya akan ikut disesuaikan otomatis.",
      },
      { status: 409 }
    );
  }

  await prisma.jurnalEntry.delete({ where: { id: jurnal.id } });
  return NextResponse.json({ message: "Jurnal dihapus" });
}
