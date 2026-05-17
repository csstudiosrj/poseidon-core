// src/app/(dashboard)/hub/page.tsx
import React from "react";
import {
  Plus,
  FolderKanban,
  Calendar,
  Layers,
  PlayCircle,
  FilePenLine,
  Clock,
} from "lucide-react";
import { getHubData } from "@/app/actions/hub";
import { redirect } from "next/navigation";

// Tipos mantidos inalterados
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
    <div className="min-h-screen bg-slate-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* HEADER – hierarquia Poseidon */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-['Syne'] tracking-tight text-white">
              Meus Projetos
            </h1>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-['Inter']">
              Console para criar, monitorar e auditar projetos culturais
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-cyan-400/90 hover:bg-cyan-400 text-slate-900 font-medium rounded-xl py-2.5 px-4 text-sm transition-colors"
          >
            <Plus size={16} />
            <span>Novo Projeto</span>
          </button>
        </header>

        {/* ERRO */}
        {error && (
          <div className="bg-red-950/30 border border-red-500/40 text-xs text-red-200 mb-6 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* KPI CARDS – replicando visual dos 3 cards do dashboard */}
        {resumo && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <ResumoCard
              label="Total de Projetos"
              valor={resumo.total}
              icon={Layers}
            />
            <ResumoCard
              label="Ativos"
              valor={resumo.ativos}
              icon={PlayCircle}
            />
            <ResumoCard
              label="Rascunhos"
              valor={resumo.rascunhos}
              icon={FilePenLine}
            />
            <ResumoCard
              label="Pendentes"
              valor={resumo.enviados}
              icon={Clock}
            />
          </section>
        )}

        {/* GRID DE PROJETOS / EMPTY STATE */}
        {!error && (
          <>
            {isEmpty ? (
              <EmptyStateHub />
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

/* ─── Sub-componentes refatorados com tokens Poseidon ───────────── */

interface ResumoCardProps {
  label: string;
  valor: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

function ResumoCard({ label, valor, icon: Icon }: ResumoCardProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium font-['Inter']">
            {label}
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {valor.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="text-cyan-400/70">
          <Icon size={18} />
        </div>
      </div>
      <div className="text-[11px] text-slate-500 font-mono">
        console://{label.toLowerCase().replace(/\s+/g, "_")}
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
        // Sem roxo, usamos um tom de cyan mais neutro
        className:
          "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40",
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
    <article className="bg-slate-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white truncate font-['Inter']">
            {projeto.nome_projeto}
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate font-['Inter']">
            {mecanismoLabel}
          </p>
        </div>
        <div
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${statusCfg.className}`}
        >
          {statusCfg.label}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 font-['Inter']">
        <div className="inline-flex items-center gap-1">
          <Calendar size={12} className="text-slate-500" />
          <span>Criado em {dataCriacao}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-slate-500">
          <FolderKanban size={12} />
          <span>ID {projeto.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-[11px] text-slate-500 font-['Inter']">
          Última atualização em{" "}
          {new Date(projeto.updated_at).toLocaleDateString("pt-BR")}
        </span>
        <button
          type="button"
          className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
        >
          Acessar Console
          <span aria-hidden className="text-cyan-400">→</span>
        </button>
      </div>
    </article>
  );
}

function EmptyStateHub() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-24">
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
      <h2 className="text-sm font-semibold text-white mb-2 font-['Inter']">
        Sua jornada cultural começa aqui
      </h2>
      <p className="text-xs text-slate-400 mb-5 max-w-xs font-['Inter']">
        Crie seu primeiro projeto para acompanhar captação, execução e
        prestação de contas em um console único.
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 bg-cyan-400/90 hover:bg-cyan-400 text-slate-900 font-medium rounded-xl py-2.5 px-4 text-sm transition-colors"
      >
        <Plus size={16} />
        <span>Criar Primeiro Projeto</span>
      </button>
    </section>
  );
}