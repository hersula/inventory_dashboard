import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { z } from "zod";

const planSchema = z.object({
  nama: z.string().min(2, "Nama paket minimal 2 karakter"),
  harga: z.number().min(0),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  maxUser: z.number().int().positive().nullable().optional(),
  maxBarang: z.number().int().positive().nullable().optional(),
  deskripsi: z.string().optional(),
  isActive: z.boolean().optional(),
});

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "paket"
  );
}

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const plans = await prisma.subscriptionPlan.findMany({
    include: { _count: { select: { companies: true } } },
    orderBy: { harga: "asc" },
  });
  return NextResponse.json(
    plans.map((p) => ({ ...p, totalPerusahaan: p._count.companies, _count: undefined }))
  );
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.nama);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.subscriptionPlan.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }

  const plan = await prisma.subscriptionPlan.create({ data: { ...parsed.data, slug } });
  return NextResponse.json(plan, { status: 201 });
}
