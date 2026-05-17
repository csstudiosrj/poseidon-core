// src/app/(dashboard)/projeto/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { redirect } from "next/navigation";
import { getProjeto } from "@/app/actions/projeto";
import { FileText, ArrowLeft, Edit3, DollarSign, Layers, ShieldCheck } from "lucide-react";
import Link from "next/link";
import "../../../globals.css";

function CollapsibleSection({ titulo, conteudo }: { titulo: string; conteudo: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div>
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 w-full text-left text-xs font-semibold text-white/60 hover:text-white/90 transition-colors mb-1 cursor-pointer"
      >
        <span className={`transition-transform ${aberto ? "rotate-90" : ""}`}>▶</span>
        {titulo}
      </button>
      {aberto && (
        <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap pl-5">{conteudo}</p>
      )}
    </div>
  );
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjeto(id);

  if ("error" in data) {
    redirect("/hub");
  }

  const { projeto } = data;

  const fontes = projeto.projeto_fontes || [];
  const itens = projeto.itens_orcamentarios || [];
  const orcamentoTotal = fontes.reduce(
    (soma: number, f: any) => soma + Number(f.valor_captacao),
    0
  );

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hub"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {projeto.nome_projeto}
          </h1>
          <p className="text-sm text-white/40 flex items-center gap-2 mt-1">
            <Layers size={14} />
            {fontes.length} fonte{fontes.length !== 1 ? "s" : ""} · Status: {projeto.status}
          </p>
        </div>
        <span className="badge badge-warning">{projeto.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {fontes.length === 0 ? (
            <div className="card p-6 text-center">
              <FileText size={24} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Nenhuma fonte de captação configurada.</p>
            </div>
          ) : (
            fontes.map((fonte: any) => {
              const nomeFonte =
                fonte.tipo === "incentivo_fiscal"
                  ? fonte.biblioteca_regras?.mecanismo_nome || "Incentivo Fiscal"
                  : fonte.nome_fonte || fonte.tipo;
              const conteudo = fonte.conteudo_escrita || {};

              return (
                <div key={fonte.id} className="card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FileText size={16} className="text-cyan-400" />
                      {nomeFonte}
                    </h2>
                    <span className="text-xs text-white/40 uppercase">{fonte.tipo}</span>
                  </div>

                  {conteudo.justificativa && <CollapsibleSection titulo="Justificativa" conteudo={conteudo.justificativa} />}
                  {conteudo.objetivos && <CollapsibleSection titulo="Objetivos" conteudo={conteudo.objetivos} />}
                  {conteudo.publico_alvo && <CollapsibleSection titulo="Público-Alvo" conteudo={conteudo.publico_alvo} />}
                  {conteudo.acessibilidade && <CollapsibleSection titulo="Acessibilidade" conteudo={conteudo.acessibilidade} />}
                  {conteudo.contrapartida && <CollapsibleSection titulo="Contrapartida" conteudo={conteudo.contrapartida} />}
                  {conteudo.democratizacao && <CollapsibleSection titulo="Democratização" conteudo={conteudo.democratizacao} />}
                  {conteudo.descricao_projeto && <CollapsibleSection titulo="Descrição" conteudo={conteudo.descricao_projeto} />}

                  {Object.keys(conteudo).length === 0 && (
                    <p className="text-white/40 text-xs">Conteúdo ainda não gerado para esta fonte.</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                      href={`/escrita?projeto=${projeto.id}&fonte=${fonte.id}`}
                      className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit3 size={14} />
                      Editar Escrita
                    </Link>
                    <Link
                      href={`/projeto/${projeto.id}/execucao`}
                      className="inline-flex items-center gap-2 bg-sea-800 border border-white/10 hover:border-cyan-500/30 text-cyan-400 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                      Torre de Controle
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Informações</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Status</span>
                <span className="text-white font-medium">{projeto.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Criado em</span>
                <span className="text-white font-medium">
                  {new Date(projeto.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Atualizado</span>
                <span className="text-white font-medium">
                  {new Date(projeto.updated_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-cyan-400" />
              Captação
            </h3>
            {fontes.length > 0 ? (
              <>
                <div className="space-y-2">
                  {fontes.map((fonte: any) => {
                    const nome =
                      fonte.tipo === "incentivo_fiscal"
                        ? fonte.biblioteca_regras?.mecanismo_nome || "Incentivo Fiscal"
                        : fonte.nome_fonte || fonte.tipo;
                    return (
                      <div key={fonte.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-white/70">{nome}</span>
                        <span className="text-white font-mono">
                          {Number(fonte.valor_captacao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs font-semibold text-white/60">Total</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {orcamentoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-white/40 text-xs">Nenhuma fonte de captação.</p>
            )}
          </div>

          {itens.length > 0 && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Itens Orçamentários</h3>
              <div className="space-y-2">
                {itens.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                    <div>
                      <p className="text-white/70">{item.descricao}</p>
                      <p className="text-white/30 text-[10px]">{item.categoria} · Qtd: {item.quantidade}</p>
                    </div>
                    <span className="text-white font-mono">
                      {Number(item.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}