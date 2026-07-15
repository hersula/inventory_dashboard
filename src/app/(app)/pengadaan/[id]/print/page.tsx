"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";

type Barang = { id: number; kode: string; nama: string };
type Item = { id: number; barang: Barang; qty: number; hargaSatuan: string | number; subtotal: string | number };
type Pengadaan = {
  id: number;
  nomor: string;
  tanggal: string;
  supplier: { nama: string; alamat: string | null; telepon: string | null } | null;
  user: { name: string };
  metodeBayar: string;
  subtotal: string | number;
  diskonPersen: string | number;
  diskonNominal: string | number;
  ppn: string | number;
  total: string | number;
  catatan: string | null;
  detail: Item[];
};

const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;
const METODE_LABEL: Record<string, string> = { TUNAI: "Tunai", KREDIT: "Kredit", TEMPO: "Tempo" };

export default function PrintPengadaanPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [data, setData] = useState<Pengadaan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pengadaan/${params.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) {
    return <p className="py-10 text-center text-sm text-slate-500">Transaksi tidak ditemukan.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print-hide mb-4 flex items-center justify-between">
        <a href="/pengadaan" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </a>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" />
          Cetak
        </button>
      </div>

      <div className="print-area card space-y-6">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{session?.user?.companyName ?? "Perusahaan"}</h1>
            <p className="text-sm text-slate-500">Bukti Pengadaan Barang</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-700">{data.nomor}</p>
            <p className="text-slate-500">{new Date(data.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Supplier</p>
            <p className="font-medium text-slate-700">{data.supplier?.nama ?? "-"}</p>
            {data.supplier?.alamat && <p className="text-slate-500">{data.supplier.alamat}</p>}
            {data.supplier?.telepon && <p className="text-slate-500">{data.supplier.telepon}</p>}
          </div>
          <div className="text-right">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Metode Pembayaran</p>
            <p className="font-medium text-slate-700">{METODE_LABEL[data.metodeBayar] ?? data.metodeBayar}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Dibuat oleh</p>
            <p className="font-medium text-slate-700">{data.user?.name ?? "-"}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-2">Kode</th>
              <th className="py-2">Nama Barang</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Harga Satuan</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.detail.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <td className="py-2 text-slate-600">{d.barang.kode}</td>
                <td className="py-2 text-slate-700">{d.barang.nama}</td>
                <td className="py-2 text-right text-slate-600">{d.qty}</td>
                <td className="py-2 text-right text-slate-600">{rupiah(Number(d.hargaSatuan))}</td>
                <td className="py-2 text-right font-medium text-slate-700">{rupiah(Number(d.subtotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{rupiah(Number(data.subtotal))}</span>
            </div>
            {Number(data.diskonNominal) > 0 && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Diskon ({Number(data.diskonPersen)}%)</span>
                <span>- {rupiah(Number(data.diskonNominal))}</span>
              </div>
            )}
            {Number(data.ppn) > 0 && (
              <div className="flex items-center justify-between text-slate-500">
                <span>PPN 11%</span>
                <span>+ {rupiah(Number(data.ppn))}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-300 pt-1.5 text-base font-bold text-slate-800">
              <span>Total</span>
              <span>{rupiah(Number(data.total))}</span>
            </div>
          </div>
        </div>

        {data.catatan && (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Catatan: </span>
            {data.catatan}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 pt-10 text-center text-sm">
          <div>
            <p className="mb-16">Diserahkan oleh,</p>
            <p className="border-t border-slate-400 pt-1 text-slate-600">Supplier</p>
          </div>
          <div>
            <p className="mb-16">Diterima oleh,</p>
            <p className="border-t border-slate-400 pt-1 text-slate-600">{data.user?.name ?? "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
