"use client";

import { ReactNode } from "react";
import { Search, Loader2 } from "lucide-react";

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export default function DataTable<T>({
  columns,
  data,
  loading,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari...",
  toolbarRight,
  emptyMessage = "Belum ada data.",
}: {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  toolbarRight?: ReactNode;
  emptyMessage?: string;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      {(onSearchChange || toolbarRight) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                className="input pl-9"
              />
            </div>
          )}
          {toolbarRight && <div className="flex shrink-0 items-center gap-2">{toolbarRight}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`th ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="td py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="td py-10 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/70">
                  {columns.map((col, ci) => (
                    <td key={ci} className={`td ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
