// src/app/(dashboard)/escrita/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Check, Sparkles, FileText, ShieldCheck } from "lucide-react";
import { gerarProjetoAction, buscarProjetosRascunho } from "@/app/actions/escrita";
import { createClient } from "@/lib/supabase/client";
import "../../globals.css";

interface ProjetoRascunho {
  id: string;
  nome_projeto: string;
  created_at: string;
  mecanismo: { mecanismo_nome: string; esfera: string } | null;
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
    descricao: "Descreva detalhadamente o que será realizado. Este texto será usado como base para a justificativa técnica do projeto.",
    campo: "descricao",
    placeholder: "Ex.: O projeto consiste na realização de um festival gratuito de música instrumental com 10 shows, oficinas de formação musical e exposições interativas...",
    obrigatorio: true,
  },
  {
    id: "publico",
    titulo: "Público-Alvo e Acessibilidade",
    descricao: "Descreva o perfil do público esperado, faixa etária, e como o projeto garante acessibilidade a pessoas com deficiência.",
    campo: "publico",
    placeholder: "Ex.: O festival é voltado para jovens de 15 a 29 anos da periferia, com acessibilidade total: intérpretes de Libras, rampas e material em braile.",
    obrigatorio: true,
  },
  {
    id: "objetivos",
    titulo: "Objetivos e Metas",
    descricao: "Liste os principais objetivos e metas mensuráveis do projeto. Seja específico: quantas apresentações, quantas pessoas, quantos empregos.",
    campo: "objetivos",
    placeholder: "Ex.: Realizar 10 apresentações musicais; atingir público de 5.000 pessoas; gerar 30 empregos diretos; oferecer 5 oficinas gratuitas.",
    obrigatorio: true,
  },
  {
    id: "local",
    titulo: "Local e Duração",
    descricao: "Informe onde o projeto será realizado e a duração prevista.",
    campo: "local",
    placeholder: "Ex.: 5 cidades do interior de São Paulo, durante 3 meses.",
    obrigatorio: false,
  },
  {
    id: "contrapartida",
    titulo: "Contrapartida Social",
    descricao: "Descreva as ações de contrapartida que o projeto oferecerá à comunidade.",
    campo: "contrapartida",
    placeholder: "Ex.: Oficinas gratuitas para estudantes da rede pública, distribuição de ingressos para comunidades carentes.",
    obrigatorio: false,
  },
  {
    id: "orcamento",
    titulo: "Orçamento Total",
    descricao: "Informe o valor total estimado para captação. O sistema distribuirá automaticamente entre as rubricas, respeitando os tetos da lei.",
    campo: "orcamento",
    placeholder: "R$ 0,00",
    obrigatorio: true,
  },
];

export default function EscritaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [projetosRascunho, setProjetosRascunho] = useState<ProjetoRascunho[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>("");
  const [carregandoProjetos, setCarregandoProjetos] = useState(true);

  const [etapaAtual, setEtapaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [orcamentoRaw, setOrcamentoRaw] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);

  // Carregar projetos rascunho
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
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1);
    }
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
      setErro("Erro desconhecido ao gerar o projeto.");
      setEnviando(false);
    }
  }

  // Tela de seleção de projeto
  if (!projetoSelecionado && !concluido) {
    return (
      <div className="min-h-screen bg-sea-950 p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Fábrica de Escrita</h1>
          </div>
          <p className="text-white/50 text-sm">
            Selecione um projeto em rascunho para iniciar a entrevista guiada. O motor do Poseidon gerará o texto técnico completo.
          </p>

          {carregandoProjetos ? (
            <div className="flex items-center gap-2 text-white/30">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Carregando projetos...</span>
            </div>
          ) : projetosRascunho.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-white/50 text-sm">Nenhum projeto em rascunho encontrado.</p>
              <button
                onClick={() => router.push("/setup")}
                className="mt-4 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer"
              >
                Criar Novo Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projetosRascunho.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProjetoSelecionado(p.id)}
                  className="w-full card p-4 text-left hover:border-cyan-500/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">{p.nome_projeto}</h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {p.mecanismo ? `${p.mecanismo.mecanismo_nome} · ${p.mecanismo.esfera}` : "Mecanismo não informado"}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
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
            <h2 className="text-xl font-bold text-white tracking-tight">Projeto Gerado com Sucesso!</h2>
            <p className="text-white/50 text-sm mt-2">
              O conteúdo técnico foi gerado e os itens orçamentários foram distribuídos conforme as regras do mecanismo.
            </p>
          </div>
          <button
            onClick={() => router.push("/hub")}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-10 px-6 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            Ir para o Hub
          </button>
        </div>
      </div>
    );
  }

  // Tela de entrevista
  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setProjetoSelecionado("")}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white tracking-tight">Entrevista Guiada</h1>
            <p className="text-white/40 text-xs">Etapa {etapaAtual + 1} de {etapas.length}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="progress-track">
          <div
            className="progress-bar bg-cyan-500"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {/* Card da etapa atual */}
        <div className="card p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">{etapa.titulo}</h2>
          <p className="text-white/50 text-sm">{etapa.descricao}</p>

          {etapa.campo === "orcamento" ? (
            <div>
              <input
                type="text"
                className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono tabular-nums"
                placeholder={etapa.placeholder}
                value={orcamentoRaw ? formatCurrency(orcamentoRaw) : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setOrcamentoRaw(raw);
                  const valor = parseFloat(raw.replace(/\D/g, "")) / 100;
                  setRespostas({ ...respostas, [etapa.campo]: valor.toString() });
                }}
              />
            </div>
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
            <button
              onClick={voltar}
              disabled={etapaAtual === 0}
              className="text-white/40 hover:text-white/70 transition-colors text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Voltar
            </button>

            <button
              onClick={avancar}
              disabled={enviando}
              className="bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-sm font-semibold h-10 px-6 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50"
            >
              {enviando && <Loader2 size={14} className="animate-spin" />}
              <span>
                {enviando ? "Gerando..." : etapaAtual === etapas.length - 1 ? "Gerar Projeto" : "Próximo"}
              </span>
              {!enviando && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}