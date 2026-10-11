// src/app/error.tsx
"use client"; // Error boundaries devem ser Client Components

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loga o erro no console (pode integrar com Sentry/LogRocket futuramente)
    console.error("[Poseidon Error]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "#020b18", color: "#e2e8f0" }}
    >
      <div
        className="rounded-full flex items-center justify-center mb-6"
        style={{
          width: 72,
          height: 72,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <AlertTriangle size={28} className="text-red-400" />
      </div>

      <h1 className="text-lg font-semibold text-white mb-2">
        Algo deu errado
      </h1>
      <p className="text-sm text-slate-400 max-w-sm mb-2">
        Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
      </p>
      {error?.digest && (
        <p className="text-[11px] font-mono text-white/20 mb-8">
          Código: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold h-10 px-6 rounded-lg transition-all cursor-pointer"
      >
        <RotateCcw size={14} />
        Tentar novamente
      </button>
    </div>
  );
}
