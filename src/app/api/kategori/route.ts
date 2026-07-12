import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET() {
  const { error, session } = await requirePermission("barang.view");
  if (error) return error;
  const data = await prisma.kategori.findMany({
    where: { companyId: getCompanyId(session!) },
    orderBy: { nama: "asc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("barang.manage");
  if (error) return error;
  const body = await req.json();
  if (!body.nama) return NextResponse.json({ message: "Nama kategori wajib diisi" }, { status: 400 });
  const kategori = await prisma.kategori.create({
    data: { nama: body.nama, companyId: getCompanyId(session!) },
  });
  return NextResponse.json(kategori, { status: 201 });
}
