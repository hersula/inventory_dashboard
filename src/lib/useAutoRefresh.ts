"use client";

import { useEffect, useRef } from "react";

/**
 * Sistem auto-refresh ringan tanpa perlu WebSocket/server tambahan.
 *
 * 3 pemicu refresh otomatis:
 * 1. Polling berkala (default 15 detik) — menangkap perubahan dari user/perangkat lain.
 * 2. Saat tab/aplikasi kembali aktif (visibilitychange/focus) — umum terjadi di HP
 *    saat pengguna berpindah aplikasi lalu kembali.
 * 3. Event "data:changed" — dipicu instan oleh notifyDataChanged() setiap kali ada
 *    input (tambah/edit/hapus) berhasil, baik di tab yang sama maupun tab lain
 *    (lewat localStorage "storage" event).
 */

const CHANNEL_KEY = "__inv_dashboard_data_changed__";

export function notifyDataChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("data:changed"));
  try {
    // Trik agar tab/browser lain yang sedang terbuka pada origin yang sama
    // ikut menerima sinyal perubahan data lewat event "storage".
    localStorage.setItem(CHANNEL_KEY, String(Date.now()));
  } catch {
    // localStorage bisa gagal di mode private/incognito tertentu — abaikan saja,
    // polling berkala tetap berjalan sebagai fallback.
  }
}

export function useAutoRefresh(callback: () => void, intervalMs: number = 15000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    const id = window.setInterval(tick, intervalMs);

    function onVisibility() {
      if (document.visibilityState === "visible") tick();
    }
    function onFocus() {
      tick();
    }
    function onDataChanged() {
      tick();
    }
    function onStorage(e: StorageEvent) {
      if (e.key === CHANNEL_KEY) tick();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("data:changed", onDataChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("data:changed", onDataChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [intervalMs]);
}
