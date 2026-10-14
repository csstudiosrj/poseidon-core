// src/app/(dashboard)/escrita/[id]/page.tsx
import React from "react";
import Link from "next/link";
import "../../globals.css";
import { AlertCircle, ArrowLeft, PenLine } from "lucide-react";
import { getEscritaProjeto } from "@/app/actions/escrita";
import { EscritaEditor } from "./EscritaEditor";

export default async function EscritaProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getEscritaProjeto(id);

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
            href="/escrita"
            className="mt-4 inline-block text-xs text-cyan-400 hover:text-cyan-300"
          >
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Voltar */}
        <Link
          href="/escrita"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft size={12} />
          Todos os projetos
        </Link>

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
              {data.nome_projeto}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Narrativa do projeto · clique em cada seção para expandir
            </p>
          </div>
        </div>

        {/* Editor */}
        <EscritaEditor projetoId={data.id} conteudo={data.conteudo} />

      </main>
    </div>
  );
}
