import { Role } from "@/lib/rbac";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      companyId: string;
      companyName: string;
    };
  }
  interface User {
    id: string;
    role: Role;
    companyId: string;
    companyName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    companyId: string;
    companyName: string;
  }
}
