"use client";

import { RefreshCw } from "lucide-react";

export default function LiveIndicator({
  lastUpdated,
  refreshing,
}: {
  lastUpdated: Date | null;
  refreshing?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-400" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
      <span>
        Auto-refresh aktif
        {lastUpdated && (
          <>
            {" "}
            · diperbarui{" "}
            {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </>
        )}
      </span>
    </div>
  );
}
