import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
});

export async function GET() {
  const { error, session } = await requirePermission("users.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("users.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  // Email dipakai untuk login lintas-perusahaan (satu email = satu akun),
  // jadi harus unik secara global, bukan hanya dalam satu perusahaan.
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { ...parsed.data, password: hashed, companyId },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
