"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidateSheetsCacheAction } from "@/app/actions/sheets";
import { useRouter } from "next/navigation";

interface SyncCacheButtonProps {
  lastChecked: string;
}

export function SyncCacheButton({ lastChecked }: SyncCacheButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await revalidateSheetsCacheAction();
      if (res.success) {
        setStatusMessage({ type: "success", text: "Caché invalidado y datos resincronizados." });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Error de comunicación al revalidar el caché." });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Button
        onClick={handleSync}
        disabled={loading}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm flex items-center gap-2"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Revalidando..." : "Sincronizar Sheets Ahora"}</span>
      </Button>
    </div>
  );
}
