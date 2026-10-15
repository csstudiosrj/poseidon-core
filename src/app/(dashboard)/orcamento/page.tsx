// src/app/(dashboard)/orcamento/page.tsx
import React from "react";
import "../globals.css";
import Link from "next/link";
import { AlertCircle, Calculator, ChevronRight, FolderOpen } from "lucide-react";
import { listarProjetos } from "@/app/actions/projetos";
import type { ProjetoStatus } from "@/app/actions/projetos";

const STATUS_COR: Record<ProjetoStatus, { text: string; bg: string; border: string }> = {
  rascunho:         { text: "#94a3b8", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.20)" },
  enviado:          { text: "#22d3ee", bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.20)"  },
  ativo:            { text: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.20)"  },
  inativo:          { text: "#64748b", bg: "rgba(71,85,105,0.12)",   border: "rgba(71,85,105,0.20)"   },
  finalizado:       { text: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.20)" },
  prestacao_contas: { text: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.20)"  },
};

const STATUS_LABEL: Record<ProjetoStatus, string> = {
  rascunho:         "Rascunho",
  enviado:          "Enviado",
  ativo:            "Ativo",
  inativo:          "Inativo",
  finalizado:       "Finalizado",
  prestacao_contas: "Prestação de contas",
};

export default async function OrcamentoPage() {
  const data = await listarProjetos();

  if ("error" in data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020b18" }}>
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)" }}>
            <Calculator size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}>
              Orçamento
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie fontes de recurso e itens orçamentários por projeto
            </p>
          </div>
        </div>

        {/* Lista de projetos */}
        {data.length === 0 ? (
          <div className="ds-card flex flex-col items-center justify-center text-center py-14" style={{ background: "#081121" }}>
            <FolderOpen size={28} className="text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300 mb-1">Nenhum projeto encontrado</p>
            <p className="text-xs text-slate-500">Crie um projeto primeiro para gerenciar seu orçamento.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((p) => {
              const cor = STATUS_COR[p.status];
              return (
                <Link
                  key={p.id}
                  href={`/orcamento/${p.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group"
                  style={{ background: "#081121", border: "1px solid rgba(142,177,214,0.08)" }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.10em] px-2 py-0.5 rounded-md shrink-0"
                    style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {p.nome_projeto}
                  </span>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
