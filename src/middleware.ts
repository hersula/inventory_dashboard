export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/master-barang/:path*",
    "/pengadaan/:path*",
    "/penjualan/:path*",
    "/akuntansi/:path*",
    "/users/:path*",
  ],
};
