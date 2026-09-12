import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Selain memastikan sudah login (bawaan withAuth), middleware ini juga
// memisahkan dua "dunia" sesi: SUPERADMIN hanya boleh mengakses /superadmin,
// sedangkan user perusahaan biasa tidak boleh masuk ke /superadmin.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isSuperAdminArea = req.nextUrl.pathname.startsWith("/superadmin");

    if (isSuperAdminArea && token?.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (!isSuperAdminArea && token?.role === "SUPERADMIN") {
      return NextResponse.redirect(new URL("/superadmin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/master-barang/:path*",
    "/pengadaan/:path*",
    "/penjualan/:path*",
    "/retur/:path*",
    "/stock-opname/:path*",
    "/laporan-stok/:path*",
    "/akuntansi/:path*",
    "/users/:path*",
    "/superadmin/:path*",
  ],
};
