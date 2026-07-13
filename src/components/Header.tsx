"use client";

import { Menu, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ROLE_LABEL, Role } from "@/lib/rbac";

export default function Header({
  name,
  role,
  onMenuClick,
  title,
}: {
  name: string;
  role: Role;
  onMenuClick: () => void;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6"
      style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(4rem + env(safe-area-inset-top))" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-md p-2 hover:bg-slate-100 lg:hidden">
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{name}</p>
            <p className="text-xs text-slate-400 leading-tight">{ROLE_LABEL[role]}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">{name}</p>
                <p className="text-xs text-slate-400">{ROLE_LABEL[role]}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
