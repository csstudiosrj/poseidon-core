// src/app/(dashboard)/orcamento/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Send, Save, ArrowLeft, Sparkles, Wallet, AlertTriangle } from "lucide-react";
import { enviarMensagemAction, salvarOrcamentoAction } from "@/app/actions/orcamento";
import { ContextoOrcamento, MensagemChat } from "@/lib/ia/orcamentista";
import { createClient } from "@/lib/supabase/client";
import "../../globals.css";

function OrcamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetoId = searchParams.get("projeto") || "";
  const fonteId = searchParams.get("fonte") || "";

  const [historico, setHistorico] = useState<MensagemChat[]>([
    { tipo: "assistente", texto: "Olá! Vamos construir o orçamento desta fonte. Você pode adicionar itens com comandos como:\n'adicionar [descrição] de R$ [valor]'\n'listar itens'\n'remover item [número]'" },
  ]);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [contexto, setContexto] = useState<ContextoOrcamento | null>(null);
  const [erro, setErro] = useState("");

  const totalItens = contexto?.itens.reduce((s, i) => s + i.valor, 0) || 0;
  const saldo = (contexto?.orcamentoTotal || 0) - totalItens;

  async function enviarMensagem() {
    if (!mensagem.trim() || !projetoId || !fonteId) return;
    setEnviando(true);
    setErro("");

    const formData = new FormData();
    formData.append("projeto_id", projetoId);
    formData.append("fonte_id", fonteId);
    formData.append("mensagem", mensagem);
    if (contexto) formData.append("contexto", JSON.stringify(contexto));

    const result = await enviarMensagemAction(null, formData);

    if (result?.erro) {
      setErro(result.erro);
    } else if (result?.historico) {
      setHistorico([...historico, ...result.historico]);
      if (result.contexto) setContexto(result.contexto);
      setMensagem("");
    }
    setEnviando(false);
  }

  async function handleSalvar() {
    if (!contexto || contexto.itens.length === 0) return;
    setSalvando(true);
    setErro("");

    const formData = new FormData();
    formData.append("projeto_id", projetoId);
    formData.append("fonte_id", fonteId);
    formData.append("itens", JSON.stringify(contexto.itens));

    const result = await salvarOrcamentoAction(null, formData);

    if (result?.erro) {
      setErro(result.erro);
    } else {
      setHistorico([...historico, { tipo: "assistente", texto: "✅ Orçamento salvo com sucesso!" }]);
    }
    setSalvando(false);
  }

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={22} className="text-cyan-400" />
              Orçamento Interativo
            </h1>
            <p className="text-white/40 text-xs mt-1">Converse com a IA para refinar cada rubrica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Chat */}
          <div className="card p-4 flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {historico.map((msg, i) => (
                <div key={i} className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.tipo === "usuario" ? "bg-cyan-500/10 border border-cyan-500/20 text-white/90" : "bg-sea-950 border border-white/5 text-white/70"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.texto}</p>
                    {msg.itens && (
                      <div className="mt-2 space-y-1">
                        {msg.itens.map((item, idx) => (
                          <div key={idx} className="text-xs text-white/50 flex justify-between">
                            <span>{idx + 1}. {item.descricao}</span>
                            <span className="font-mono ml-4">R$ {item.valor.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.alertas && msg.alertas.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {msg.alertas.map((alerta, idx) => (
                          <p key={idx} className="text-[11px] text-amber-400 flex items-center gap-1">
                            <AlertTriangle size={12} /> {alerta}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {erro && (
              <div className="text-xs text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={12} /> {erro}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                placeholder="Ex: adicionar cachê de R$ 5.000"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
              />
              <button
                onClick={enviarMensagem}
                disabled={enviando || !mensagem.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-10 px-4 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
              <button
                onClick={handleSalvar}
                disabled={salvando || !contexto || contexto.itens.length === 0}
                className="bg-emerald-500 hover:bg-emerald-400 text-sea-950 text-xs font-semibold h-10 px-4 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span className="hidden sm:inline">Salvar</span>
              </button>
            </div>
          </div>

          {/* Painel lateral */}
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wallet size={14} className="text-cyan-400" /> Orçamento
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Total da fonte</span>
                  <span className="font-mono text-white">R$ {(contexto?.orcamentoTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Alocado</span>
                  <span className="font-mono text-cyan-400">R$ {totalItens.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Saldo</span>
                  <span className={`font-mono ${saldo < 0 ? "text-red-400" : "text-emerald-400"}`}>R$ {saldo.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Itens ({contexto?.itens.length || 0})</h3>
              {contexto?.itens.length ? (
                <div className="space-y-2">
                  {contexto.itens.map((item, idx) => (
                    <div key={idx} className="text-xs flex justify-between bg-sea-950 rounded-lg p-2 border border-white/5">
                      <div className="min-w-0">
                        <p className="text-white/70 truncate">{item.descricao}</p>
                        <p className="text-[10px] text-white/30">{item.categoria}</p>
                      </div>
                      <span className="font-mono text-white/60 ml-2 shrink-0">R$ {item.valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-xs">Nenhum item adicionado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrcamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sea-950 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>}>
      <OrcamentoContent />
    </Suspense>
  );
}