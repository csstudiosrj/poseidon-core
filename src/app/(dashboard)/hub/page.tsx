// src/app/(dashboard)/hub/page.tsx
import React from "react";
import "../../globals.css";
import { Plus, FolderKanban, Calendar, Sparkles } from "lucide-react";
import { getHubData } from "@/app/actions/hub";
import { redirect } from "next/navigation";

/* ─── Tipos (espelham exatamente o que a action retorna) ─────────── */
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

/* ─── Página (Server Component) ──────────────────────────────────── */
export default async function HubPage() {
  const data = await getHubData();

  // 🚨 Redireciona imediatamente se a sessão não for encontrada
  if ('error' in data && data.error.includes('não autenticado')) {
    redirect('/login');
  }

  const error    = "error"   in data ? data.error    : null;
  const projetos = "projetos" in data ? (data.projetos as ProjetoHub[]) : [];
  const resumo   = "resumo"  in data ? (data.resumo  as ResumoProjetos) : null;
  const isEmpty  = !error && projetos.length === 0;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#020b18", color: "#e2e8f0" }}
    >
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Meus Projetos</h1>
            <p className="text-xs text-slate-400 mt-1">
              Seu painel para criar, acompanhar e finalizar projetos culturais.
            </p>
          </div>
          <button type="button" className="ds-btn ds-btn-primary">
            <Plus size={16} />
            <span>Novo Projeto</span>
          </button>
        </header>

        {/* ERRO (que não seja de autenticação) */}
        {error && (
          <div className="text-xs text-red-400 mb-4">{error}</div>
        )}

        {/* GRID RESUMO */}
        {resumo && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ResumoCard label="Total de Projetos" valor={resumo.total}    cor="text-cyan-300"    />
            <ResumoCard label="Ativos"             valor={resumo.ativos}   cor="text-emerald-300" />
            <ResumoCard label="Rascunhos"          valor={resumo.rascunhos} cor="text-slate-200"  />
            <ResumoCard label="Pendentes"          valor={resumo.enviados}  cor="text-sky-300"    />
          </section>
        )}

        {/* LISTA / EMPTY STATE */}
        {!error && (
          isEmpty ? (
            <EmptyStateHub />
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetos.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))}
            </section>
          )
        )}

      </main>
    </div>
  );
}

/* ─── Sub-componentes (sem hooks — compatíveis com Server Component) */

function ResumoCard({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: number;
  cor: string;
}) {
  return (
    <div
      className="ds-card"
      style={{ background: "#081121", padding: "14px 14px" }}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-1">
        {label}
      </p>
      <p className={`text-xl font-semibold num-tabular ${cor}`}>
        {valor.toString().padStart(2, "0")}
      </p>
    </div>
  );
}

function getStatusConfig(statusRaw: string) {
  const status = statusRaw as ProjetoStatus;
  switch (status) {
    case "rascunho":
      return { label: "Rascunho",            className: "bg-slate-700/40 text-slate-200 border border-slate-500/60" };
    case "ativo":
      return { label: "Ativo",               className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50" };
    case "enviado":
      return { label: "Enviado",             className: "bg-sky-500/15 text-sky-300 border border-sky-500/60" };
    case "finalizado":
      return { label: "Finalizado",          className: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/60" };
    case "inativo":
      return { label: "Inativo",             className: "bg-slate-800/60 text-slate-300 border border-slate-600/80" };
    case "prestacao_contas":
      return { label: "Prestação de contas", className: "bg-amber-500/15 text-amber-300 border border-amber-500/60" };
    default:
      return { label: statusRaw || "—",      className: "bg-slate-800/60 text-slate-200 border border-slate-600/80" };
  }
}

function ProjetoCard({ projeto }: { projeto: ProjetoHub }) {
  const statusCfg = getStatusConfig(projeto.status);
  const mecanismoLabel = projeto.biblioteca_regras
    ? `${projeto.biblioteca_regras.mecanismo_nome} — ${projeto.biblioteca_regras.esfera}`
    : "Mecanismo não informado";
  const dataCriacao = new Date(projeto.created_at).toLocaleDateString("pt-BR");

  return (
    <article
      className="ds-card flex flex-col justify-between"
      style={{ background: "#081121", padding: "14px 14px" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
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

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div className="inline-flex items-center gap-1">
          <Calendar size={12} className="text-slate-500" />
          <span>Criado em {dataCriacao}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-slate-500">
          <FolderKanban size={12} />
          <span>ID {projeto.id.slice(0, 8)}</span>
        </div>
      </div>
    </article>
  );
}

function EmptyStateHub() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-16">
      <div className="relative mb-6">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            background: "radial-gradient(circle at top, rgba(56,189,248,0.25), transparent 60%)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <Sparkles size={30} className="text-cyan-300" />
        </div>
      </div>
      <h2 className="text-sm font-semibold text-white mb-2">
        Sua jornada cultural começa aqui
      </h2>
      <p className="text-xs text-slate-400 mb-5 max-w-xs">
        Crie seu primeiro projeto para acompanhar captação, execução e
        prestação de contas em um painel único.
      </p>
      <button type="button" className="ds-btn ds-btn-primary">
        <Plus size={16} />
        <span>Criar primeiro projeto</span>
      </button>
    </section>
  );
}