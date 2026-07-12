import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET() {
  const { error, session } = await requirePermission("pengadaan.view");
  if (error) return error;
  const data = await prisma.supplier.findMany({
    where: { companyId: getCompanyId(session!) },
    orderBy: { nama: "asc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("pengadaan.manage");
  if (error) return error;
  const body = await req.json();
  if (!body.nama) return NextResponse.json({ message: "Nama supplier wajib diisi" }, { status: 400 });
  const supplier = await prisma.supplier.create({
    data: {
      nama: body.nama,
      alamat: body.alamat,
      telepon: body.telepon,
      email: body.email,
      companyId: getCompanyId(session!),
    },
  });
  return NextResponse.json(supplier, { status: 201 });
}
