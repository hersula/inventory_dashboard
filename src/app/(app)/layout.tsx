import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Shell from "@/components/Shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Sesi SUPERADMIN tidak punya companyId — seharusnya sudah dialihkan oleh
  // middleware, tapi dicek ulang di sini supaya Shell (yang butuh Role tenant
  // biasa) tidak pernah menerima role di luar ADMIN/MANAGER/STAFF.
  if (session.user.role === "SUPERADMIN") {
    redirect("/superadmin");
  }

  return (
    <Shell name={session.user.name} role={session.user.role} companyName={session.user.companyName}>
      {children}
    </Shell>
  );
}
