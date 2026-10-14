// src/app/(dashboard)/escrita/page.tsx
import React from "react";
import Link from "next/link";
import "../globals.css";
import {
  AlertCircle,
  PenLine,
  FolderKanban,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { getEscritaList } from "@/app/actions/escrita";
import { SECOES } from "@/app/actions/escrita";

const STATUS_LABEL: Record<string, string> = {
  rascunho:         "Rascunho",
  ativo:            "Ativo",
  enviado:          "Enviado",
  finalizado:       "Finalizado",
  inativo:          "Inativo",
  prestacao_contas: "Prest. contas",
};

function progresso(conteudo: Record<string, string>): number {
  const preenchidos = SECOES.filter((s) => conteudo[s.key]?.trim().length > 0).length;
  return Math.round((preenchidos / SECOES.length) * 100);
}

export default async function EscritaPage() {
  const data = await getEscritaList();

  if ("error" in data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#020b18" }}
      >
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
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <PenLine size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1
              className="text-xl font-extrabold text-white"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}
            >
              Escrita
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Narrativa e textos dos seus projetos culturais
            </p>
          </div>
        </div>

        {data.length === 0 ? (
          <div
            className="ds-card flex flex-col items-center justify-center text-center py-16"
            style={{ background: "#081121" }}
          >
            <FolderKanban size={32} className="text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300 mb-1">Nenhum projeto ainda</p>
            <p className="text-xs text-slate-500 mb-4">
              Crie um projeto para começar a escrever sua proposta.
            </p>
            <Link href="/setup" className="ds-btn ds-btn-primary text-xs">
              Criar projeto
            </Link>
          </div>
        ) : (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
              Selecione um projeto
            </h2>
            <div className="space-y-2">
              {data.map((p) => {
                const pct = progresso(p.conteudo as unknown as Record<string, string>);
                const completo = pct === 100;
                return (
                  <Link
                    key={p.id}
                    href={`/escrita/${p.id}`}
                    className="ds-card flex items-center gap-4 hover:border-cyan-500/20 transition-colors group"
                    style={{
                      background: "#081121",
                      padding: "16px 20px",
                      borderColor: "rgba(142,177,214,0.08)",
                    }}
                  >
                    {/* Ícone progresso */}
                    <div className="shrink-0">
                      {completo ? (
                        <CheckCircle2 size={18} className="text-emerald-500/70" />
                      ) : (
                        <Circle size={18} className="text-slate-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {p.nome_projeto}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-slate-500">
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                        <span className="text-[11px] text-slate-600">·</span>
                        <span
                          className={`text-[11px] ${
                            completo
                              ? "text-emerald-400"
                              : pct > 0
                              ? "text-amber-400"
                              : "text-slate-600"
                          }`}
                        >
                          {pct === 0
                            ? "Não iniciado"
                            : completo
                            ? "Completo"
                            : `${pct}% preenchido`}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progresso + seta */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className="w-20 h-1 rounded-full overflow-hidden hidden sm:block"
                        style={{ background: "rgba(142,177,214,0.10)" }}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${
                            completo
                              ? "bg-emerald-500"
                              : pct > 0
                              ? "bg-amber-500"
                              : "bg-slate-700"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-slate-600 group-hover:text-cyan-400 transition-colors"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
