import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET() {
  const { error, session } = await requirePermission("penjualan.view");
  if (error) return error;
  const data = await prisma.pelanggan.findMany({
    where: { companyId: getCompanyId(session!) },
    orderBy: { nama: "asc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("penjualan.manage");
  if (error) return error;
  const body = await req.json();
  if (!body.nama) return NextResponse.json({ message: "Nama pelanggan wajib diisi" }, { status: 400 });
  const pelanggan = await prisma.pelanggan.create({
    data: { nama: body.nama, alamat: body.alamat, telepon: body.telepon, companyId: getCompanyId(session!) },
  });
  return NextResponse.json(pelanggan, { status: 201 });
}
