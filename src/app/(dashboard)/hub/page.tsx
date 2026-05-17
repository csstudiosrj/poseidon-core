// src/app/(dashboard)/hub/page.tsx
import React from "react";
import "../../globals.css";
import {
  Plus,
  FolderKanban,
  Calendar,
  Sparkles,
  Layers,
  PlayCircle,
  FilePenLine,
  Clock,
} from "lucide-react";
import { getHubData } from "@/app/actions/hub";
import { redirect } from "next/navigation";

/* ─── Tipos (espelham a action) ─────────────────────────────────── */

type ProjetoStatus =
  | "rascunho"
  | "enviado"
  | "ativo"
  | "inativo"
  | "finalizado"
  | "prestacao_contas";

interface ProjetoHub {
  id: string;
  nome_projeto: string;
  status: ProjetoStatus | string;
  created_at: string;
  updated_at: string;
  biblioteca_regras: {
    mecanismo_nome: string;
    esfera: string;
  } | null;
}

interface ResumoProjetos {
  total: number;
  rascunhos: number;
  enviados: number;
  ativos: number;
  inativos: number;
  finalizados: number;
  prestacao_contas: number;
}

/* ─── Página (Server Component) ─────────────────────────────────── */

export default async function HubPage() {
  const data = await getHubData();

  if ("error" in data && data.error.includes("não autenticado")) {
    redirect("/login");
  }

  const error = "error" in data ? data.error : null;
  const projetos =
    "projetos" in data ? (data.projetos as ProjetoHub[]) : [];
  const resumo =
    "resumo" in data ? (data.resumo as ResumoProjetos) : null;
  const isEmpty = !error && projetos.length === 0;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#020b18", color: "#e2e8f0" }}
    >
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Meus Projetos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Console para criar, monitorar e auditar seus projetos
              culturais.
            </p>
          </div>
          <button type="button" className="ds-btn ds-btn-primary">
            <Plus size={16} />
            <span>Novo Projeto</span>
          </button>
        </header>

        {/* ERRO (não-autenticação já redireciona) */}
        {error && (
          <div className="ds-card border border-red-500/40 bg-red-950/30 text-xs text-red-200 mb-6 px-4 py-3">
            {error}
          </div>
        )}

        {/* KPI CARDS – estilo console */}
        {resumo && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ResumoCard
              label="Total de projetos"
              valor={resumo.total}
              icon={Layers}
              cor="text-cyan-300"
            />
            <ResumoCard
              label="Ativos"
              valor={resumo.ativos}
              icon={PlayCircle}
              cor="text-emerald-300"
            />
            <ResumoCard
              label="Rascunhos"
              valor={resumo.rascunhos}
              icon={FilePenLine}
              cor="text-slate-200"
            />
            <ResumoCard
              label="Pendentes"
              valor={resumo.enviados}
              icon={Clock}
              cor="text-sky-300"
            />
          </section>
        )}

        {/* GRID / EMPTY */}
        {!error && (
          <>
            {isEmpty ? (
              <EmptyStateHub />
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projetos.map((projeto) => (
                  <ProjetoCard key={projeto.id} projeto={projeto} />
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── Sub-componentes (sem hooks) ───────────────────────────────── */

interface ResumoCardProps {
  label: string;
  valor: number;
  cor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

function ResumoCard({ label, valor, cor, icon: Icon }: ResumoCardProps) {
  return (
    <div
      className="ds-card relative overflow-hidden"
      style={{
        background: "#081121",
        borderColor: "rgba(255,255,255,0.08)",
        padding: "14px 14px",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">
            {label}
          </p>
          <p
            className={`text-2xl font-semibold num-tabular ${cor}`}
          >
            {valor.toString().padStart(2, "0")}
          </p>
        </div>
        <div className="p-1.5 rounded-md bg-slate-900/70 border border-slate-700/80 text-slate-300">
          <Icon size={14} className="opacity-80" />
        </div>
      </div>
    </div>
  );
}

function getStatusConfig(statusRaw: string) {
  const status = statusRaw as ProjetoStatus;

  switch (status) {
    case "rascunho":
      return {
        label: "Rascunho",
        className:
          "bg-amber-500/10 text-amber-300 border border-amber-500/50",
      };
    case "ativo":
      return {
        label: "Ativo",
        className:
          "bg-emerald-500/12 text-emerald-300 border border-emerald-500/55",
      };
    case "enviado":
      return {
        label: "Enviado",
        className:
          "bg-sky-500/12 text-sky-300 border border-sky-500/60",
      };
    case "finalizado":
      return {
        label: "Finalizado",
        className:
          "bg-cyan-500/12 text-cyan-300 border border-cyan-500/60",
      };
    case "inativo":
      return {
        label: "Inativo",
        className:
          "bg-slate-800/70 text-slate-300 border border-slate-600/80",
      };
    case "prestacao_contas":
      return {
        label: "Prestação de contas",
        className:
          "bg-purple-500/14 text-purple-200 border border-purple-500/60",
      };
    default:
      return {
        label: statusRaw || "—",
        className:
          "bg-slate-800/70 text-slate-200 border border-slate-600/80",
      };
  }
}

function ProjetoCard({ projeto }: { projeto: ProjetoHub }) {
  const statusCfg = getStatusConfig(projeto.status);
  const mecanismoLabel = projeto.biblioteca_regras
    ? `${projeto.biblioteca_regras.mecanismo_nome} · ${projeto.biblioteca_regras.esfera}`
    : "Mecanismo não informado";

  const dataCriacao = new Date(projeto.created_at).toLocaleDateString(
    "pt-BR"
  );

  return (
    <article
      className="ds-card flex flex-col justify-between"
      style={{
        background: "#081121",
        borderColor: "rgba(255,255,255,0.08)",
        padding: "14px 14px",
      }}
    >
      {/* Topo */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">
            {projeto.nome_projeto}
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {mecanismoLabel}
          </p>
        </div>
        <div
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${statusCfg.className}`}
        >
          {statusCfg.label}
        </div>
      </div>

      {/* Corpo */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
        <div className="inline-flex items-center gap-1">
          <Calendar size={12} className="text-slate-500" />
          <span>Criado em {dataCriacao}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-slate-500">
          <FolderKanban size={12} />
          <span>ID {projeto.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span className="text-[11px] text-slate-500">
          Última atualização em{" "}
          {new Date(projeto.updated_at).toLocaleDateString("pt-BR")}
        </span>
        <button
          type="button"
          className="text-[11px] font-medium text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
        >
          Acessar Console
          <span aria-hidden className="text-cyan-400">
            →
          </span>
        </button>
      </div>
    </article>
  );
}

function EmptyStateHub() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20">
      <div className="relative mb-6">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            background:
              "radial-gradient(circle at top, rgba(56,189,248,0.22), transparent 60%)",
            border: "1px solid rgba(148,163,184,0.45)",
          }}
        >
          <FolderKanban size={34} className="text-cyan-300" />
        </div>
      </div>
      <h2 className="text-sm font-semibold text-white mb-2">
        Sua jornada cultural começa aqui
      </h2>
      <p className="text-xs text-slate-400 mb-5 max-w-xs">
        Crie seu primeiro projeto para acompanhar captação, execução e
        prestação de contas em um console único.
      </p>
      <button type="button" className="ds-btn ds-btn-primary">
        <Plus size={16} />
        <span>Criar Primeiro Projeto</span>
      </button>
    </section>
  );
}