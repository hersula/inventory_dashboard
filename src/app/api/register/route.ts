import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_AKUN } from "@/lib/defaultAkun";
import { z } from "zod";

const registerSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  adminName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "perusahaan";
}

async function generateUniqueSlug(base: string) {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let i = 1;
  // Coba tambahkan angka di belakang jika slug sudah dipakai perusahaan lain.
  while (await prisma.company.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Data tidak valid", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { companyName, adminName, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Email sudah terdaftar. Gunakan email lain atau login." }, { status: 409 });
  }

  const slug = await generateUniqueSlug(companyName);
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { nama: companyName, slug, email },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: adminName,
          email,
          password: passwordHash,
          role: "ADMIN",
        },
      });

      // Chart of Akun default supaya modul Akuntansi & jurnal otomatis
      // langsung bisa dipakai tanpa perlu setup manual.
      await tx.akun.createMany({
        data: DEFAULT_AKUN.map((a) => ({ ...a, companyId: company.id })),
      });

      return { company, user };
    });

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil. Silakan login.",
        company: { id: result.company.id, nama: result.company.nama, slug: result.company.slug },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Gagal mendaftarkan perusahaan:", err);
    return NextResponse.json({ message: "Gagal mendaftarkan perusahaan. Coba lagi." }, { status: 500 });
  }
}
