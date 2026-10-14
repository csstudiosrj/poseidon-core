// src/app/(dashboard)/configuracoes/page.tsx
import React from "react";
import Link from "next/link";
import { AlertCircle, UserCog } from "lucide-react";
import "../globals.css";
import { getProponenteData } from "@/app/actions/configuracoes";
import { ConfiguracoesForm } from "./ConfiguracoesForm";

export default async function ConfiguracoesPage() {
  const data = await getProponenteData();

  if ("error" in data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#020b18" }}
      >
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{data.error}</p>
          <Link
            href="/hub"
            className="mt-4 inline-block text-xs text-cyan-400 hover:text-cyan-300"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <UserCog size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1
              className="text-xl font-extrabold text-white"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}
            >
              Configurações
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dados do proponente e da conta
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="ds-card"
          style={{ background: "#081121", padding: "28px" }}
        >
          <ConfiguracoesForm proponente={data} />
        </div>

      </main>
    </div>
  );
}
