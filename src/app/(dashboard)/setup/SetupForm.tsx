// src/app/(dashboard)/setup/SetupForm.tsx
"use client";

import React, { useActionState, useState, useEffect } from "react";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { criarProjetoAction } from "@/app/actions/setup";
import { useRouter } from "next/navigation";

// ... (interfaces Fonte, Mecanismo, ActionState)

export function SetupForm({ mecanismos }: { mecanismos: Mecanismo[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    criarProjetoAction,
    null
  );

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [orcamentoTotalRaw, setOrcamentoTotalRaw] = useState("");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [fontes, setFontes] = useState<Fonte[]>([]);

  const orcamentoTotal = orcamentoTotalRaw
    ? parseFloat(orcamentoTotalRaw.replace(/\D/g, "")) / 100
    : 0;

  const somaFontes = fontes.reduce((soma, f) => soma + f.valorNumerico, 0);
  const percentualRestante = orcamentoTotal > 0 ? ((orcamentoTotal - somaFontes) / orcamentoTotal) * 100 : 0;

  useEffect(() => {
    if (state?.success) {
      router.push("/hub");
    }
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

    // Chama a action diretamente via formAction (do useActionState)
    formAction(formData);
  }

  // ... resto do JSX igual ao enviado anteriormente, mas substituindo o botão "Criar Projeto com Fontes" por:
  <button
    onClick={handleSubmit}
    disabled={isPending || somaFontes > orcamentoTotal || somaFontes <= 0}
    className="..."
  >
    {isPending && <Loader2 size={14} className="animate-spin" />}
    <span>{isPending ? "Criando..." : "Criar Projeto com Fontes"}</span>
  </button>

  // E no final, exibe erro:
  {state?.error && (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      <span>{state.error}</span>
    </div>
  )}
}