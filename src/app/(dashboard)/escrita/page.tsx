// src/app/(dashboard)/escrita/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { gerarProjetoAction, buscarProjetosRascunho } from "@/app/actions/escrita";
import { createClient } from "@/lib/supabase/client";
import "../../globals.css";

/* ─── TIPOS ─────────────────────────────────────────────────── */
interface ProjetoRascunho {
  id: string;
  nome_projeto: string;
  created_at: string;
  fontes: { id: string; nome: string; tipo: string; valor_captacao: number }[];
}

interface Etapa {
  id: string;
  titulo: string;
  descricao: string;
  campo: string;
  placeholder: string;
  obrigatorio: boolean;
}

const etapas: Etapa[] = [
  {
    id: "descricao",
    titulo: "Descrição da Proposta",
    descricao: "Descreva detalhadamente o que será realizado.",
    campo: "descricao",
    placeholder: "Ex.: O projeto consiste na realização de um festival gratuito...",
    obrigatorio: true,
  },
  {
    id: "publico",
    titulo: "Público-Alvo e Acessibilidade",
    descricao: "Descreva o perfil do público e medidas de acessibilidade.",
    campo: "publico",
    placeholder: "Ex.: Jovens de 15 a 29 anos, com intérprete de Libras...",
    obrigatorio: true,
  },
  {
    id: "objetivos",
    titulo: "Objetivos e Metas",
    descricao: "Liste os principais objetivos e metas mensuráveis.",
    campo: "objetivos",
    placeholder: "Ex.: Realizar 10 apresentações, atingir 5.000 pessoas...",
    obrigatorio: true,
  },
  {
    id: "local",
    titulo: "Local e Duração",
    descricao: "Informe onde e por quanto tempo.",
    campo: "local",
    placeholder: "Ex.: 5 cidades do interior de SP, durante 3 meses.",
    obrigatorio: false,
  },
  {
    id: "contrapartida",
    titulo: "Contrapartida Social",
    descricao: "Descreva as ações de contrapartida.",
    campo: "contrapartida",
    placeholder: "Ex.: Oficinas gratuitas para estudantes da rede pública.",
    obrigatorio: false,
  },
  {
    id: "orcamento",
    titulo: "Orçamento da Fonte",
    descricao: "Valor destinado a esta fonte. O sistema distribuirá conforme as regras.",
    campo: "orcamento",
    placeholder: "R$ 0,00",
    obrigatorio: true,
  },
];

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────── */
function EscritaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetoIdParam = searchParams.get("projeto");
  const fonteIdParam = searchParams.get("fonte");

  const supabase = createClient();

  const [projetosRascunho, setProjetosRascunho] = useState<ProjetoRascunho[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState(projetoIdParam || "");
  const [fonteSelecionada, setFonteSelecionada] = useState(fonteIdParam || "");
  const [carregandoProjetos, setCarregandoProjetos] = useState(true);

  const [etapaAtual, setEtapaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [orcamentoRaw, setOrcamentoRaw] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const resultado = await buscarProjetosRascunho(user.id);
      if ("projetos" in resultado) {
        setProjetosRascunho(resultado.projetos);
      }
      setCarregandoProjetos(false);
    }
    carregar();
  }, []);

  // Se veio direto com projeto e fonte, pula seleção
  const pularSelecao = !!projetoIdParam && !!fonteIdParam;

  const fontesDoProjeto = projetoSelecionado
    ? projetosRascunho.find((p) => p.id === projetoSelecionado)?.fontes || []
    : [];

  const etapa = etapas[etapaAtual];
  const progresso = ((etapaAtual + 1) / etapas.length) * 100;

  function avancar() {
    if (etapa.campo === "orcamento") {
      const valor = respostas["orcamento"] || "";
      if (etapa.obrigatorio && !valor.trim()) {
        setErro("O orçamento é obrigatório.");
        return;
      }
      enviarProjeto();
      return;
    }

    const valorAtual = respostas[etapa.campo] || "";
    if (etapa.obrigatorio && !valorAtual.trim()) {
      setErro("Este campo é obrigatório.");
      return;
    }
    setErro("");
    if (etapaAtual < etapas.length - 1) {
      setEtapaAtual(etapaAtual + 1);
    }
  }

  function voltar() {
    setErro("");
    if (etapaAtual > 0) setEtapaAtual(etapaAtual - 1);
  }

  function formatCurrency(value: string) {
    const digits = value.replace(/\D/g, "");
    const number = parseInt(digits || "0", 10) / 100;
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  }

  async function enviarProjeto() {
    setEnviando(true);
    setErro("");

    const formData = new FormData();
    formData.append("projeto_id", projetoSelecionado);
    formData.append("fonte_id", fonteSelecionada); // NOVO: vincula à fonte
    formData.append("descricao", respostas["descricao"] || "");
    formData.append("publico", respostas["publico"] || "");
    formData.append("objetivos", respostas["objetivos"] || "");
    formData.append("local", respostas["local"] || "");
    formData.append("contrapartida", respostas["contrapartida"] || "");
    formData.append("orcamento", respostas["orcamento"] || "0");

    const result = await gerarProjetoAction(null, formData);

    if (result?.error) {
      setErro(result.error);
      setEnviando(false);
    } else if (result?.success) {
      setConcluido(true);
    } else {
      setErro("Erro desconhecido.");
      setEnviando(false);
    }
  }

  // Tela de conclusão
  if (concluido) {
    return (
      <div className="min-h-screen bg-sea-950 flex items-center justify-center p-6">
        <div className="card p-10 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Check size={32} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Conteúdo Gerado com Sucesso!</h2>
            <p className="text-white/50 text-sm mt-2">O texto foi salvo na fonte selecionada.</p>
          </div>
          <button
            onClick={() => router.push(`/projeto/${projetoSelecionado}`)}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-10 px-6 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            Ver Projeto
          </button>
        </div>
      </div>
    );
  }

  // Tela de seleção de projeto/fonte
  if (!pularSelecao && (!projetoSelecionado || !fonteSelecionada)) {
    return (
      <div className="min-h-screen bg-sea-950 p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Fábrica de Escrita</h1>
          </div>
          <p className="text-white/50 text-sm">Selecione o projeto e a fonte de captação para gerar o texto técnico.</p>

          {carregandoProjetos ? (
            <div className="flex items-center gap-2 text-white/30">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : projetosRascunho.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-white/50 text-sm">Nenhum projeto rascunho.</p>
              <button onClick={() => router.push("/setup")} className="mt-4 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer">
                Criar Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs text-white/40 uppercase">Projeto</label>
              <select
                className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white"
                value={projetoSelecionado}
                onChange={(e) => { setProjetoSelecionado(e.target.value); setFonteSelecionada(""); }}
              >
                <option value="">Selecione</option>
                {projetosRascunho.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome_projeto}</option>
                ))}
              </select>

              {projetoSelecionado && (
                <>
                  <label className="text-xs text-white/40 uppercase mt-4">Fonte de Captação</label>
                  <select
                    className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white"
                    value={fonteSelecionada}
                    onChange={(e) => setFonteSelecionada(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {fontesDoProjeto.map((f) => (
                      <option key={f.id} value={f.id}>{f.nome} ({f.tipo})</option>
                    ))}
                  </select>
                </>
              )}

              <button
                disabled={!fonteSelecionada}
                onClick={() => setEtapaAtual(0)}
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-10 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50"
              >
                Iniciar Entrevista
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Entrevista
  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white tracking-tight">Entrevista Guiada</h1>
            <p className="text-white/40 text-xs">Etapa {etapaAtual + 1} de {etapas.length}</p>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-bar bg-cyan-500" style={{ width: `${progresso}%` }} />
        </div>

        <div className="card p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">{etapa.titulo}</h2>
          <p className="text-white/50 text-sm">{etapa.descricao}</p>

          {etapa.campo === "orcamento" ? (
            <input
              type="text"
              className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
              placeholder={etapa.placeholder}
              value={orcamentoRaw ? formatCurrency(orcamentoRaw) : ""}
              onChange={(e) => {
                const raw = e.target.value;
                setOrcamentoRaw(raw);
                const valor = parseFloat(raw.replace(/\D/g, "")) / 100;
                setRespostas({ ...respostas, [etapa.campo]: valor.toString() });
              }}
            />
          ) : (
            <textarea
              className="w-full bg-sea-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all min-h-[150px] resize-y"
              placeholder={etapa.placeholder}
              value={respostas[etapa.campo] || ""}
              onChange={(e) => setRespostas({ ...respostas, [etapa.campo]: e.target.value })}
            />
          )}

          {erro && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button onClick={voltar} disabled={etapaAtual === 0} className="text-white/40 hover:text-white/70 transition-colors text-sm cursor-pointer disabled:opacity-30">
              <ArrowLeft size={14} /> Voltar
            </button>
            <button
              onClick={avancar}
              disabled={enviando}
              className="bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-sm font-semibold h-10 px-6 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50"
            >
              {enviando ? <Loader2 size={14} className="animate-spin" /> : etapaAtual === etapas.length - 1 ? "Gerar" : "Próximo"}
              {!enviando && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EscritaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sea-950 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>}>
      <EscritaContent />
    </Suspense>
  );
}