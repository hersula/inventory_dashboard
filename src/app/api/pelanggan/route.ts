import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requirePermission("penjualan.view");
  if (error) return error;
  const data = await prisma.pelanggan.findMany({ orderBy: { nama: "asc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("penjualan.manage");
  if (error) return error;
  const body = await req.json();
  if (!body.nama) return NextResponse.json({ message: "Nama pelanggan wajib diisi" }, { status: 400 });
  const pelanggan = await prisma.pelanggan.create({
    data: { nama: body.nama, alamat: body.alamat, telepon: body.telepon },
  });
  return NextResponse.json(pelanggan, { status: 201 });
}
