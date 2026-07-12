import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { z } from "zod";

const akunSchema = z.object({
  kode: z.string().min(1),
  nama: z.string().min(1),
  tipe: z.enum(["ASET", "KEWAJIBAN", "MODAL", "PENDAPATAN", "BEBAN"]),
  saldoNormal: z.enum(["DEBIT", "KREDIT"]),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const q = req.nextUrl.searchParams.get("q") || "";

  const data = await prisma.akun.findMany({
    where: {
      companyId,
      ...(q ? { OR: [{ nama: { contains: q } }, { kode: { contains: q } }] } : {}),
    },
    orderBy: { kode: "asc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = akunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.akun.findFirst({ where: { kode: parsed.data.kode, companyId } });
  if (existing) {
    return NextResponse.json({ message: "Kode akun sudah digunakan" }, { status: 409 });
  }

  const akun = await prisma.akun.create({ data: { ...parsed.data, companyId } });
  return NextResponse.json(akun, { status: 201 });
}
