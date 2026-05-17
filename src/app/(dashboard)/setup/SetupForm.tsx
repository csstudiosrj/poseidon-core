// src/app/(dashboard)/setup/SetupForm.tsx
"use client";

import React, { useActionState, useState, useEffect } from "react";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { criarProjetoAction } from "@/app/actions/setup";
import { useRouter } from "next/navigation";

interface Mecanismo {
  id: string;
  mecanismo_nome: string;
  esfera: string;
  diretrizes?: string;
}

interface Fonte {
  id: string; // temporário no front
  tipo: "incentivo_fiscal" | "edital" | "patrocinio_direto";
  esfera?: string;
  mecanismo_id?: string;
  nome_fonte?: string;
  valor: string; // string monetária para controle do input
  valorNumerico: number;
}

type ActionState = { error?: string; success?: boolean } | null;

export function SetupForm({ mecanismos }: { mecanismos: Mecanismo[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(criarProjetoAction, null);

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [orcamentoTotalRaw, setOrcamentoTotalRaw] = useState("");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [fontes, setFontes] = useState<Fonte[]>([]);

  const orcamentoTotal = orcamentoTotalRaw
    ? parseFloat(orcamentoTotalRaw.replace(/\D/g, "")) / 100
    : 0;

  const somaFontes = fontes.reduce((soma, f) => soma + f.valorNumerico, 0);
  const percentualRestante = orcamentoTotal > 0 ? ((orcamentoTotal - somaFontes) / orcamentoTotal) * 100 : 0;

  // Redireciona em caso de sucesso
  useEffect(() => {
    if (state?.success) router.push("/hub");
  }, [state, router]);

  function formatCurrency(value: string) {
    const digits = value.replace(/\D/g, "");
    const number = parseInt(digits || "0", 10) / 100;
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  }

  function adicionarFonte() {
    setFontes([...fontes, {
      id: crypto.randomUUID(),
      tipo: "incentivo_fiscal",
      esfera: "",
      mecanismo_id: "",
      nome_fonte: "",
      valor: "",
      valorNumerico: 0,
    }]);
  }

  function removerFonte(id: string) {
    setFontes(fontes.filter((f) => f.id !== id));
  }

  function atualizarFonte(id: string, campo: keyof Fonte, valor: any) {
    setFontes(fontes.map((f) => {
      if (f.id !== id) return f;
      const atualizada = { ...f, [campo]: valor };
      if (campo === "valor") {
        atualizada.valorNumerico = valor ? parseFloat(valor.replace(/\D/g, "")) / 100 : 0;
      }
      if (campo === "tipo") {
        // Reseta campos específicos ao trocar tipo
        atualizada.esfera = "";
        atualizada.mecanismo_id = "";
        atualizada.nome_fonte = "";
      }
      return atualizada;
    }));
  }

  function avancar() {
    if (!nomeProjeto.trim() || nomeProjeto.trim().length < 3) {
      alert("Nome do projeto deve ter pelo menos 3 caracteres.");
      return;
    }
    if (orcamentoTotal <= 0) {
      alert("Informe um orçamento total válido.");
      return;
    }
    setEtapa(2);
  }

  function handleSubmit() {
    if (fontes.length === 0) {
      alert("Adicione pelo menos uma fonte de captação.");
      return;
    }
    if (somaFontes <= 0) {
      alert("A soma dos valores das fontes deve ser maior que zero.");
      return;
    }
    if (somaFontes > orcamentoTotal) {
      alert("A soma das fontes não pode ultrapassar o orçamento total.");
      return;
    }

    const formData = new FormData();
    formData.append("nome_projeto", nomeProjeto.trim());
    formData.append("orcamento_total", orcamentoTotal.toString());
    formData.append("fontes", JSON.stringify(fontes.map((f) => ({
      tipo: f.tipo,
      mecanismo_id: f.mecanismo_id || null,
      nome_fonte: f.nome_fonte || null,
      valor_captacao: f.valorNumerico,
    }))));
    formAction(formData);
  }

  if (etapa === 1) {
    return (
      <section className="card p-6 md:p-8">
        <header className="mb-6">
          <h2 className="text-base font-bold text-white tracking-tight">Dados do Projeto</h2>
          <p className="text-xs text-white/40 mt-1.5 font-medium">Defina o nome e o orçamento total antes de escolher as fontes.</p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Nome do Projeto</label>
            <input
              type="text"
              className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              placeholder="Ex.: Festival de Música Independente"
              value={nomeProjeto}
              onChange={(e) => setNomeProjeto(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Orçamento Total Estimado</label>
            <input
              type="text"
              className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono tabular-nums"
              placeholder="R$ 0,00"
              value={orcamentoTotalRaw ? formatCurrency(orcamentoTotalRaw) : ""}
              onChange={(e) => setOrcamentoTotalRaw(e.target.value)}
            />
          </div>

          <button
            onClick={avancar}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            Próximo: Definir Fontes
          </button>
        </div>
      </section>
    );
  }

  // ETAPA 2: FONTES DE CAPTAÇÃO
  return (
    <section className="card p-6 md:p-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setEtapa(1)} className="p-1 rounded hover:bg-white/5 transition-colors text-white/50 hover:text-white/70 cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-base font-bold text-white tracking-tight">Fontes de Captação</h2>
        </div>
        <p className="text-xs text-white/40 font-medium">
          Seu projeto pode ter uma ou mais fontes (incentivo fiscal, editais, patrocínio direto).
        </p>
      </header>

      {/* Resumo do orçamento */}
      <div className="bg-sea-950 border border-white/5 rounded-lg p-4 mb-6 flex items-center justify-between text-sm">
        <span className="text-white/60">Orçamento total: <strong className="text-white font-mono">{orcamentoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
        <span className={`font-mono font-bold ${somaFontes > orcamentoTotal ? "text-red-400" : "text-emerald-400"}`}>
          {somaFontes > 0 ? somaFontes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}
          <span className="text-white/40 text-xs ml-1">({somaFontes > 0 ? ((somaFontes / orcamentoTotal) * 100).toFixed(1) : 0}%)</span>
        </span>
      </div>

      {/* Lista de fontes */}
      <div className="space-y-4 mb-6">
        {fontes.map((fonte) => {
          const mecanismosFiltrados = fonte.esfera
            ? mecanismos.filter((m) => m.esfera === fonte.esfera)
            : [];
          const percentual = orcamentoTotal > 0 ? ((fonte.valorNumerico / orcamentoTotal) * 100).toFixed(1) : 0;

          return (
            <div key={fonte.id} className="bg-sea-950 border border-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-semibold">Fonte {fontes.indexOf(fonte) + 1}</span>
                <button onClick={() => removerFonte(fonte.id)} className="text-white/30 hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-wider">Tipo</label>
                <select
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                  value={fonte.tipo}
                  onChange={(e) => atualizarFonte(fonte.id, "tipo", e.target.value)}
                >
                  <option value="incentivo_fiscal" className="bg-sea-950">Incentivo Fiscal</option>
                  <option value="edital" className="bg-sea-950">Edital</option>
                  <option value="patrocinio_direto" className="bg-sea-950">Patrocínio Direto</option>
                </select>
              </div>

              {/* Se incentivo fiscal */}
              {fonte.tipo === "incentivo_fiscal" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider">Esfera</label>
                    <select
                      className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                      value={fonte.esfera}
                      onChange={(e) => atualizarFonte(fonte.id, "esfera", e.target.value)}
                    >
                      <option value="" className="bg-sea-950 text-white/40">Selecione a esfera</option>
                      <option value="Federal" className="bg-sea-950">Federal</option>
                      <option value="Estadual" className="bg-sea-950">Estadual</option>
                      <option value="Municipal" className="bg-sea-950">Municipal</option>
                    </select>
                  </div>
                  {fonte.esfera && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider">Mecanismo ({mecanismosFiltrados.length})</label>
                      <select
                        className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                        value={fonte.mecanismo_id}
                        onChange={(e) => atualizarFonte(fonte.id, "mecanismo_id", e.target.value)}
                      >
                        <option value="" className="bg-sea-950 text-white/40">Selecione o mecanismo</option>
                        {mecanismosFiltrados.map((m) => (
                          <option key={m.id} value={m.id} className="bg-sea-950">{m.mecanismo_nome}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Se edital ou patrocínio direto */}
              {fonte.tipo !== "incentivo_fiscal" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">
                    {fonte.tipo === "edital" ? "Nome do Edital" : "Nome da Empresa"}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    placeholder={fonte.tipo === "edital" ? "Ex.: Edital Petrobras Cultural" : "Ex.: Vale S.A."}
                    value={fonte.nome_fonte}
                    onChange={(e) => atualizarFonte(fonte.id, "nome_fonte", e.target.value)}
                  />
                </div>
              )}

              {/* Valor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center justify-between">
                  <span>Valor a captar</span>
                  {fonte.valorNumerico > 0 && <span className="text-cyan-400 font-mono">{percentual}%</span>}
                </label>
                <input
                  type="text"
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono tabular-nums"
                  placeholder="R$ 0,00"
                  value={fonte.valor ? formatCurrency(fonte.valor) : ""}
                  onChange={(e) => atualizarFonte(fonte.id, "valor", e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão adicionar fonte */}
      <button
        onClick={adicionarFonte}
        className="w-full border border-dashed border-white/10 rounded-lg h-10 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 hover:border-white/20 transition-all cursor-pointer text-xs"
      >
        <Plus size={14} />
        Adicionar Fonte de Captação
      </button>

      {/* Resumo final e envio */}
      <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Total alocado</span>
          <span className="font-mono text-white font-bold">
            {somaFontes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Restante</span>
          <span className={`font-mono ${somaFontes > orcamentoTotal ? "text-red-400" : "text-white/40"}`}>
            {(orcamentoTotal - somaFontes).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            <span className="text-xs ml-1">({percentualRestante.toFixed(1)}%)</span>
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || somaFontes > orcamentoTotal || somaFontes <= 0}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          <span>{isPending ? "Criando..." : "Criar Projeto com Fontes"}</span>
        </button>

        {state?.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
      </div>
    </section>
  );
}