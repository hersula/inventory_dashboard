import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Super Admin dicek lebih dulu dari tabel terpisah (bukan User), karena
        // levelnya di atas Company/tenant manapun. Lihat model SuperAdmin di schema.
        const superAdmin = await prisma.superAdmin.findUnique({ where: { email: credentials.email } });
        if (superAdmin) {
          const validSuper = await bcrypt.compare(credentials.password, superAdmin.password);
          if (!validSuper) return null;
          return {
            id: String(superAdmin.id),
            name: superAdmin.name,
            email: superAdmin.email,
            role: "SUPERADMIN",
            companyId: "",
            companyName: "Super Admin",
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        });
        if (!user || !user.active) return null;
        // Perusahaan belum disetujui/ditolak/ditangguhkan Super Admin -> tolak login.
        if (!user.company || user.company.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: String(user.companyId),
          companyName: user.company.nama,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
        token.companyName = (user as any).companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
        (session.user as any).companyName = token.companyName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
