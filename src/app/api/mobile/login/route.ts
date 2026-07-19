import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobileAuth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Login untuk aplikasi mobile (Flutter). Validasinya sengaja dibuat identik
 * dengan `authorize()` di src/lib/auth.ts (dipakai NextAuth untuk web) supaya
 * perilaku login konsisten di kedua platform — bedanya cuma bentuk hasilnya:
 * web dapat session cookie, mobile dapat token untuk header Authorization.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
  if (!user || !user.active) {
    return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
  }
  if (!user.company || !user.company.isActive) {
    return NextResponse.json({ message: "Perusahaan Anda sedang dinonaktifkan. Hubungi Administrator." }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
  }

  const token = signMobileToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
    name: user.name,
    email: user.email,
    companyName: user.company.nama,
  });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.nama,
    },
  });
}
