// src/app/(dashboard)/setup/SetupForm.tsx
"use client";

import React, { useActionState, useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { criarProjetoAction } from "@/app/actions/setup";
import { useRouter } from "next/navigation";

interface Mecanismo {
  id: string;
  mecanismo_nome: string;
  esfera: string;
  diretrizes?: string;
}

type ActionState = { error?: string; success?: boolean } | null;

export function SetupForm({ mecanismos }: { mecanismos: Mecanismo[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    criarProjetoAction,
    null
  );

  const [mecanismoSelecionado, setMecanismoSelecionado] = useState<string>("");
  const [orcamentoRaw, setOrcamentoRaw] = useState("");

  // Atualiza o preview de compliance quando o mecanismo muda
  useEffect(() => {
    const previewEl = document.getElementById("compliance-preview");
    if (!previewEl) return;

    if (!mecanismoSelecionado) {
      previewEl.innerHTML = `<p class="text-white/30 italic">Selecione um mecanismo para ver as diretrizes aplicáveis.</p>`;
      return;
    }

    const mecanismo = mecanismos.find((m) => m.id === mecanismoSelecionado);
    if (mecanismo?.diretrizes) {
      previewEl.innerHTML = `<p class="text-white/60 font-medium mb-2">${mecanismo.mecanismo_nome} — ${mecanismo.esfera}</p><p class="text-white/40 text-[11px] leading-relaxed">${mecanismo.diretrizes}</p>`;
    } else {
      previewEl.innerHTML = `<p class="text-white/60 font-medium mb-2">${mecanismo?.mecanismo_nome ?? ""}</p><p class="text-white/30 italic text-[11px]">Diretrizes não disponíveis para este mecanismo.</p>`;
    }
  }, [mecanismoSelecionado, mecanismos]);

  // Se a action retornar sucesso, redireciona
  useEffect(() => {
    if (state?.success) {
      router.push("/hub");
    }
  }, [state, router]);

  // Formata valor monetário enquanto digita
  function formatCurrency(value: string) {
    const digits = value.replace(/\D/g, "");
    const number = parseInt(digits || "0", 10) / 100;
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

  function handleOrcamentoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setOrcamentoRaw(raw);
  }

  const valorNumerico = orcamentoRaw
    ? parseFloat(orcamentoRaw.replace(/\D/g, "")) / 100
    : 0;

  return (
    <section className="bg-sea-900 border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
      <header className="mb-6">
        <h2 className="text-base font-bold text-white tracking-tight">
          Dados do Projeto
        </h2>
        <p className="text-xs text-white/40 mt-1.5 font-medium">
          Essas informações podem ser alteradas depois no console do projeto.
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-4">
        {/* Nome do Projeto */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="nome_projeto"
            className="text-[11px] font-semibold text-white/50 uppercase tracking-wider"
          >
            Nome do Projeto
          </label>
          <input
            type="text"
            id="nome_projeto"
            name="nome_projeto"
            className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50"
            placeholder="Ex.: Festival de Música Independente"
            required
            disabled={isPending}
          />
        </div>

        {/* Esfera */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="esfera"
            className="text-[11px] font-semibold text-white/50 uppercase tracking-wider"
          >
            Esfera
          </label>
          <select
            id="esfera"
            name="esfera"
            className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
            required
            disabled={isPending}
            defaultValue=""
          >
            <option value="" disabled className="bg-sea-950 text-white/40">
              Selecione a esfera
            </option>
            <option value="Federal" className="bg-sea-950 text-white">
              Federal
            </option>
            <option value="Estadual" className="bg-sea-950 text-white">
              Estadual
            </option>
            <option value="Municipal" className="bg-sea-950 text-white">
              Municipal
            </option>
          </select>
        </div>

        {/* Mecanismo */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mecanismo_id"
            className="text-[11px] font-semibold text-white/50 uppercase tracking-wider"
          >
            Mecanismo
          </label>
          <select
            id="mecanismo_id"
            name="mecanismo_id"
            className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
            required
            disabled={isPending}
            value={mecanismoSelecionado}
            onChange={(e) => setMecanismoSelecionado(e.target.value)}
          >
            <option value="" disabled className="bg-sea-950 text-white/40">
              Selecione o mecanismo
            </option>
            {mecanismos.map((m) => (
              <option
                key={m.id}
                value={m.id}
                className="bg-sea-950 text-white"
              >
                {m.mecanismo_nome} — {m.esfera}
              </option>
            ))}
          </select>
        </div>

        {/* Orçamento Pretendido */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="orcamento_pretendido"
            className="text-[11px] font-semibold text-white/50 uppercase tracking-wider"
          >
            Orçamento Pretendido
          </label>
          <div className="relative">
            <input
              type="text"
              id="orcamento_pretendido_display"
              name="orcamento_pretendido_display"
              className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 font-mono tabular-nums"
              placeholder="R$ 0,00"
              value={orcamentoRaw ? formatCurrency(orcamentoRaw) : ""}
              onChange={handleOrcamentoChange}
              disabled={isPending}
            />
            <input
              type="hidden"
              name="orcamento_pretendido"
              value={Math.round(valorNumerico * 100)}
            />
          </div>
          <p className="text-[10px] text-white/30 font-medium mt-0.5">
            Valor total estimado para captação do projeto.
          </p>
        </div>

        {/* Botão de submit */}
        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          <span>{isPending ? "Criando projeto..." : "Criar Projeto"}</span>
        </button>

        {/* Link para voltar */}
        <div className="text-center mt-1">
          <button
            type="button"
            onClick={() => router.push("/hub")}
            disabled={isPending}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer disabled:opacity-50 bg-transparent border-none p-0 inline-flex items-center gap-1 text-[11px]"
          >
            <ArrowLeft size={12} />
            Voltar para Meus Projetos
          </button>
        </div>

        {/* Mensagem de erro da action */}
        {state?.error && (
          <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[11px] text-red-400 flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
      </form>
    </section>
  );
}