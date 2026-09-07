import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SuperadminShell from "@/components/SuperadminShell";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "SUPERADMIN") redirect("/dashboard");

  return <SuperadminShell name={session.user.name}>{children}</SuperadminShell>;
}
