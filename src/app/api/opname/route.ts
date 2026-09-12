import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { generateNomorOpname, jurnalStokOpname } from "@/lib/akuntansi";
import { z } from "zod";

const opnameSchema = z.object({
  tanggal: z.string().optional(),
  catatan: z.string().optional().nullable(),
  items: z
    .array(z.object({ barangId: z.number(), stokFisik: z.number().int().min(0) }))
    .min(1, "Isi stok fisik minimal 1 barang"),
});

export async function GET(_req: NextRequest) {
  const { error, session } = await requirePermission("opname.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const data = await prisma.stokOpname.findMany({
    where: { companyId },
    include: { user: { select: { name: true } }, detail: { include: { barang: true } } },
    orderBy: { tanggal: "desc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("opname.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = opnameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }
  const { tanggal, catatan, items } = parsed.data;

  const barangIds = items.map((it) => it.barangId);
  if (new Set(barangIds).size !== barangIds.length) {
    return NextResponse.json({ message: "Satu barang tidak boleh muncul lebih dari sekali" }, { status: 400 });
  }

  const tanggalDate = tanggal ? new Date(tanggal) : new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const barangList = await tx.barang.findMany({ where: { id: { in: barangIds }, companyId } });
      if (barangList.length !== barangIds.length) {
        throw new Error("Salah satu barang tidak ditemukan di perusahaan ini");
      }

      const detailItems = items.map((item) => {
        const barang = barangList.find((b) => b.id === item.barangId)!;
        const stokSistem = barang.stok;
        const selisih = item.stokFisik - stokSistem;
        const hargaBeli = Number(barang.hargaBeli);
        return {
          barangId: item.barangId,
          stokSistem,
          stokFisik: item.stokFisik,
          selisih,
          hargaBeli,
          nilaiSelisih: selisih * hargaBeli,
        };
      });

      const nilaiLebih = detailItems.filter((d) => d.nilaiSelisih > 0).reduce((s, d) => s + d.nilaiSelisih, 0);
      const nilaiKurang = detailItems.filter((d) => d.nilaiSelisih < 0).reduce((s, d) => s + Math.abs(d.nilaiSelisih), 0);

      const nomor = await generateNomorOpname(tx, companyId);

      const opname = await tx.stokOpname.create({
        data: {
          companyId,
          nomor,
          tanggal: tanggalDate,
          userId: Number(session!.user.id),
          catatan,
          totalNilaiSelisih: nilaiLebih - nilaiKurang,
          detail: { create: detailItems },
        },
        include: { detail: { include: { barang: true } }, user: { select: { name: true } } },
      });

      for (const d of detailItems) {
        if (d.selisih === 0) continue;
        await tx.barang.update({ where: { id: d.barangId }, data: { stok: d.stokFisik } });
      }

      // Posting jurnal bersifat fail-safe seperti modul transaksi lain — kalau
      // Chart of Akun belum lengkap, opname tetap tersimpan (jurnal manual belakangan).
      try {
        await jurnalStokOpname(tx, {
          companyId,
          opnameId: opname.id,
          nomor,
          tanggal: tanggalDate,
          nilaiLebih,
          nilaiKurang,
          userId: Number(session!.user.id),
        });
      } catch (err) {
        console.error("Gagal posting jurnal otomatis untuk stok opname", nomor, err);
      }

      return opname;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Gagal mencatat stok opname:", err);
    return NextResponse.json({ message: err.message || "Gagal mencatat stok opname" }, { status: 500 });
  }
}
