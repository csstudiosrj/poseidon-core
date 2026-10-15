// src/app/(dashboard)/orcamento/[id]/page.tsx
import React from "react";
import "../../globals.css";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getOrcamento } from "@/app/actions/orcamento";
import { OrcamentoEditor } from "./OrcamentoEditor";

export default async function OrcamentoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrcamento(id);

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Back + título */}
        <div className="mb-6">
          <Link href="/orcamento" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3">
            <ArrowLeft size={12} />
            Orçamento
          </Link>
          <h1
            className="text-xl font-extrabold text-white truncate"
            style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}
          >
            {data.projeto.nome_projeto}
          </h1>
        </div>

        <OrcamentoEditor
          projetoId={id}
          fontesIniciais={data.fontes}
          itensIniciais={data.itens}
        />

      </main>
    </div>
  );
}
