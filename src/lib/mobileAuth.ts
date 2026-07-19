import crypto from "crypto";

/**
 * Token berbasis JWT sendiri (HMAC-SHA256) khusus untuk klien MOBILE (Flutter).
 * Web tetap pakai NextAuth (session cookie) seperti biasa — ini cuma jalur
 * tambahan supaya aplikasi mobile yang tidak bisa menyimpan cookie browser
 * bisa login dan menyertakan token di header `Authorization: Bearer <token>`.
 *
 * Sengaja tidak pakai library `jsonwebtoken` (tidak ada di dependencies dan
 * sandbox pengembangan ini tidak punya akses npm registry) — JWT itu sendiri
 * cuma base64url(header) + "." + base64url(payload) + "." + base64url(HMAC),
 * jadi cukup dibuat manual dengan modul bawaan Node `crypto`.
 */

export type MobileTokenPayload = {
  userId: number;
  companyId: number;
  role: "ADMIN" | "MANAGER" | "STAFF";
  name: string;
  email: string;
  companyName: string;
  exp: number; // unix seconds
};

const SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";
// Token mobile berlaku lama (30 hari) supaya user tidak perlu login ulang
// terus-menerus di HP — beda dengan sesi web yang lebih pendek.
const EXPIRY_SECONDS = 60 * 60 * 24 * 30;

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function sign(data: string) {
  return base64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

export function signMobileToken(payload: Omit<MobileTokenPayload, "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: MobileTokenPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + EXPIRY_SECONDS };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const signature = sign(`${headerB64}.${payloadB64}`);

  return `${headerB64}.${payloadB64}.${signature}`;
}

/** Mengembalikan payload jika token valid & belum kedaluwarsa, atau null jika tidak. */
export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    if (!headerB64 || !payloadB64 || !signature) return null;

    const expectedSignature = sign(`${headerB64}.${payloadB64}`);
    // Perbandingan panjang tetap (timing-safe) supaya tidak bocor lewat timing attack.
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(base64urlDecode(payloadB64).toString("utf8")) as MobileTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // kedaluwarsa

    return payload;
  } catch {
    return null;
  }
}
