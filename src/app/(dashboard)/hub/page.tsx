// src/app/(dashboard)/hub/page.tsx
import React from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Meus Projetos
            </h1>
            <p className="text-xs text-white/40 mt-1">
              Console para criar, monitorar e auditar seus projetos culturais.
            </p>
          </div>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          >
            <Plus size={15} />
            <span>Novo Projeto</span>
          </Link>
        </header>

        {/* ERRO (não-autenticação já redireciona) */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI CARDS – replicando estilo dos 3 cards do dashboard */}
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

        {/* GRID / EMPTY */}
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

/* ─── Sub-componentes ───────────────────────────────────────────── */

interface ResumoCardProps {
  label: string;
  valor: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

function ResumoCard({ label, valor, icon: Icon }: ResumoCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.16em] font-medium">
            {label}
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {valor.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="text-cyan-400/70">
          <Icon size={16} />
        </div>
      </div>
      <div className="text-[10px] text-white/20 font-mono tracking-wide">
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
        className: "bg-amber-500/10 text-amber-400 border border-amber-500/15",
      };
    case "ativo":
      return {
        label: "Ativo",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15",
      };
    case "enviado":
      return {
        label: "Enviado",
        className: "bg-sky-500/10 text-sky-400 border border-sky-500/15",
      };
    case "finalizado":
      return {
        label: "Finalizado",
        className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15",
      };
    case "inativo":
      return {
        label: "Inativo",
        className: "bg-white/5 text-slate-400 border border-white/10",
      };
    case "prestacao_contas":
      return {
        label: "Prestação de Contas",
        className: "bg-purple-500/10 text-purple-400 border border-purple-500/15",
      };
    default:
      return {
        label: statusRaw || "—",
        className: "bg-white/5 text-slate-300 border border-white/10",
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
    <article className="bg-sea-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[175px] hover:border-cyan-500/15 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-white truncate tracking-tight group-hover:text-cyan-400 transition-colors">
              {projeto.nome_projeto}
            </h2>
            <p className="text-xs text-white/40 mt-0.5 truncate font-medium">
              {mecanismoLabel}
            </p>
          </div>
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap border ${statusCfg.className}`}
          >
            {statusCfg.label}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/30 mt-4 mb-3">
          <div className="inline-flex items-center gap-1.5">
            <Calendar size={12} className="text-white/20" />
            <span>Criado em {dataCriacao}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 font-mono text-white/20">
            <FolderKanban size={12} />
            <span>ID {projeto.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] mt-auto">
        <span className="text-[10px] text-white/20 font-mono">
          Up: {new Date(projeto.updated_at).toLocaleDateString("pt-BR")}
        </span>
        <button
          type="button"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Acessar Console</span>
          <span aria-hidden className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </article>
  );
}

function EmptyStateHub() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-24 card border border-dashed border-white/10 bg-transparent">
      <div className="relative mb-4">
        <div
          className="rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.02)]"
          style={{
            width: 72,
            height: 72,
            background: "radial-gradient(circle at top, rgba(34,211,238,0.12), transparent 70%)",
          }}
        >
          <FolderKanban size={26} className="text-cyan-400" />
        </div>
      </div>
      <h2 className="text-sm font-semibold text-white mb-1.5">
        Sua jornada cultural começa aqui
      </h2>
      <p className="text-xs text-white/40 mb-6 max-w-xs leading-relaxed px-4">
        Crie seu primeiro projeto para acompanhar captação, execução e prestação de contas em um console único.
      </p>
      <Link
        href="/setup"
        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.2)]"
      >
        <Plus size={15} />
        <span>Criar Primeiro Projeto</span>
      </Link>
    </section>
  );
}