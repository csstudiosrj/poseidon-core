// src/app/not-found.tsx
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "#020b18", color: "#e2e8f0" }}
    >
      {/* Tridente SVG */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22d3ee"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-6 opacity-60"
      >
        <line x1="12" y1="4" x2="12" y2="22" />
        <line x1="6" y1="4" x2="12" y2="10" />
        <line x1="12" y1="10" x2="18" y2="4" />
        <path d="M8 20 Q12 16 16 20" />
        <line x1="8" y1="14" x2="8" y2="18" />
        <line x1="16" y1="14" x2="16" y2="18" />
      </svg>

      <p
        className="text-6xl font-bold mb-3 tabular-nums"
        style={{
          background: "linear-gradient(135deg, #22d3ee, #0891b2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </p>
      <h1 className="text-lg font-semibold text-white mb-2">
        Página não encontrada
      </h1>
      <p className="text-sm text-slate-400 max-w-sm mb-8">
        Esta rota não existe no Poseidon. Pode ter sido removida ou o endereço está incorreto.
      </p>
      <Link
        href="/hub"
        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold h-10 px-6 rounded-lg transition-all"
      >
        Voltar para o Hub
      </Link>
    </div>
  );
}
