"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";

type Pengadaan = {
  id: number;
  nomor: string;
  tanggal: string;
  supplier: { nama: string } | null;
  metodeBayar: string;
  total: string | number;
  sisa?: number;
};

const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;
const METODE_LABEL: Record<string, string> = { TUNAI: "Tunai", KREDIT: "Kredit", TEMPO: "Tempo" };

export default function PrintPengadaanAllPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { data: session } = useSession();
  const [data, setData] = useState<Pengadaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pengadaan${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [q]);

  const grandTotal = data.reduce((s, p) => s + Number(p.total), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="print-hide mb-4 flex items-center justify-between">
        <a href="/pengadaan" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </a>
        <button onClick={() => window.print()} className="btn-primary" disabled={loading}>
          <Printer className="h-4 w-4" />
          Cetak
        </button>
      </div>

      <div className="print-area card space-y-4">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-lg font-bold text-slate-800">{session?.user?.companyName ?? "Perusahaan"}</h1>
          <p className="text-sm text-slate-500">
            Laporan Pengadaan Barang {q && <span>— pencarian: &quot;{q}&quot;</span>}
          </p>
          <p className="text-xs text-slate-400">
            Dicetak {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2">No. Transaksi</th>
                  <th className="py-2">Tanggal</th>
                  <th className="py-2">Supplier</th>
                  <th className="py-2">Metode Bayar</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-700">{p.nomor}</td>
                    <td className="py-2 text-slate-600">{new Date(p.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="py-2 text-slate-600">{p.supplier?.nama ?? "-"}</td>
                    <td className="py-2 text-slate-600">{METODE_LABEL[p.metodeBayar] ?? p.metodeBayar}</td>
                    <td className="py-2 text-right font-medium text-slate-700">{rupiah(Number(p.total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300">
                  <td colSpan={4} className="py-2 text-right font-semibold text-slate-700">
                    Grand Total
                  </td>
                  <td className="py-2 text-right text-base font-bold text-slate-800">{rupiah(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
            {data.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Tidak ada transaksi.</p>}
            <p className="text-xs text-slate-400">Total {data.length} transaksi.</p>
          </>
        )}
      </div>
    </div>
  );
}
