import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
  active: z.boolean().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("users.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  // Pastikan user yang diedit benar-benar bagian dari perusahaan ini.
  const owned = await prisma.user.findFirst({ where: { id, companyId } });
  if (!owned) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const dup = await prisma.user.findFirst({ where: { email: parsed.data.email, NOT: { id } } });
  if (dup) return NextResponse.json({ message: "Email sudah dipakai user lain" }, { status: 409 });

  const data: any = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    active: parsed.data.active ?? true,
  };
  if (parsed.data.password) {
    data.password = await bcrypt.hash(parsed.data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("users.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  if (id === Number(session!.user.id)) {
    return NextResponse.json({ message: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
  }

  const owned = await prisma.user.findFirst({ where: { id, companyId } });
  if (!owned) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "User dihapus" });
}
