import { AppRole } from "@/lib/rbac";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: AppRole;
      // Kosong ("") khusus untuk sesi SUPERADMIN, yang tidak terikat perusahaan manapun.
      companyId: string;
      companyName: string;
    };
  }
  interface User {
    id: string;
    role: AppRole;
    companyId: string;
    companyName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    companyId: string;
    companyName: string;
  }
}
