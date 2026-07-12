import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { postJurnal } from "@/lib/akuntansi";
import { z } from "zod";

const lineSchema = z.object({
  akunId: z.number(),
  debit: z.number().nonnegative().optional(),
  kredit: z.number().nonnegative().optional(),
  keterangan: z.string().optional().nullable(),
});

const jurnalSchema = z.object({
  tanggal: z.string().optional(),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
  lines: z.array(lineSchema).min(2, "Jurnal minimal 2 baris (debit & kredit)"),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const q = req.nextUrl.searchParams.get("q") || "";
  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  const data = await prisma.jurnalEntry.findMany({
    where: {
      companyId,
      ...(q ? { OR: [{ nomor: { contains: q } }, { keterangan: { contains: q } }] } : {}),
      ...(start || end
        ? {
            tanggal: {
              ...(start ? { gte: new Date(start) } : {}),
              ...(end ? { lte: new Date(`${end}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: { select: { name: true } },
      detail: { include: { akun: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = jurnalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const { keterangan, tanggal, lines } = parsed.data;

  const totalDebit = lines.reduce((s, l) => s + (l.debit ?? 0), 0);
  const totalKredit = lines.reduce((s, l) => s + (l.kredit ?? 0), 0);
  if (Math.round(totalDebit * 100) !== Math.round(totalKredit * 100)) {
    return NextResponse.json(
      { message: `Jurnal tidak balance: total debit (Rp ${totalDebit.toLocaleString("id-ID")}) harus sama dengan total kredit (Rp ${totalKredit.toLocaleString("id-ID")}).` },
      { status: 400 }
    );
  }
  if (totalDebit === 0) {
    return NextResponse.json({ message: "Total debit/kredit tidak boleh 0" }, { status: 400 });
  }

  // Pastikan semua akun yang dipilih benar-benar milik perusahaan ini.
  const akunIds = lines.map((l) => l.akunId);
  const ownedCount = await prisma.akun.count({ where: { id: { in: akunIds }, companyId } });
  if (ownedCount !== new Set(akunIds).size) {
    return NextResponse.json({ message: "Salah satu akun tidak ditemukan" }, { status: 400 });
  }

  try {
    const result = await postJurnal(prisma, {
      companyId,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      keterangan,
      referensiTipe: "manual",
      referensiId: null,
      userId: Number(session!.user.id),
      lines,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Gagal menyimpan jurnal" }, { status: 400 });
  }
}
