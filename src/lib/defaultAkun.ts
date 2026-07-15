export const DEFAULT_AKUN: {
  kode: string;
  nama: string;
  tipe: "ASET" | "KEWAJIBAN" | "MODAL" | "PENDAPATAN" | "BEBAN";
  saldoNormal: "DEBIT" | "KREDIT";
}[] = [
  { kode: "1101", nama: "Kas", tipe: "ASET", saldoNormal: "DEBIT" },
  { kode: "1102", nama: "Piutang Usaha", tipe: "ASET", saldoNormal: "DEBIT" },
  { kode: "1103", nama: "Persediaan Barang Dagang", tipe: "ASET", saldoNormal: "DEBIT" },
  { kode: "1104", nama: "PPN Masukan", tipe: "ASET", saldoNormal: "DEBIT" },
  { kode: "1105", nama: "Bank", tipe: "ASET", saldoNormal: "DEBIT" },
  { kode: "2101", nama: "Hutang Usaha", tipe: "KEWAJIBAN", saldoNormal: "KREDIT" },
  { kode: "2102", nama: "PPN Keluaran", tipe: "KEWAJIBAN", saldoNormal: "KREDIT" },
  { kode: "3101", nama: "Modal Pemilik", tipe: "MODAL", saldoNormal: "KREDIT" },
  { kode: "4101", nama: "Pendapatan Penjualan", tipe: "PENDAPATAN", saldoNormal: "KREDIT" },
  { kode: "5101", nama: "Harga Pokok Penjualan (HPP)", tipe: "BEBAN", saldoNormal: "DEBIT" },
  { kode: "6101", nama: "Beban Operasional", tipe: "BEBAN", saldoNormal: "DEBIT" },
  { kode: "6102", nama: "Beban Gaji", tipe: "BEBAN", saldoNormal: "DEBIT" },
  { kode: "6103", nama: "Beban Sewa", tipe: "BEBAN", saldoNormal: "DEBIT" },
];
