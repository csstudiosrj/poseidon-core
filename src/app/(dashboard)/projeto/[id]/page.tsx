// src/app/(dashboard)/projeto/[id]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../globals.css";
import {
  ArrowLeft,
  Wallet,
  ReceiptText,
  Layers,
  GitBranch,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { getProjetoData } from "@/app/actions/projeto";
import type { ProjetoFonte } from "@/app/actions/projeto";
import { NovoItemModal } from "./NovoItemModal";
import { TabelaItens } from "./TabelaItens";
import { NotasFiscais } from "./NotasFiscais";

/* ─── Helpers ──────────────────────────────────────────────────────── */
const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  rascunho:         { label: "Rascunho",            cls: "bg-slate-700/40 text-slate-200 border border-slate-500/60" },
  ativo:            { label: "Ativo",               cls: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50" },
  enviado:          { label: "Enviado",             cls: "bg-sky-500/15 text-sky-300 border border-sky-500/60" },
  finalizado:       { label: "Finalizado",          cls: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/60" },
  inativo:          { label: "Inativo",             cls: "bg-slate-800/60 text-slate-300 border border-slate-600/80" },
  prestacao_contas: { label: "Prestação de contas", cls: "bg-amber-500/15 text-amber-300 border border-amber-500/60" },
};

const TIPO_FONTE: Record<string, string> = {
  incentivo_fiscal:  "Incentivo Fiscal",
  edital:            "Edital",
  patrocinio_direto: "Patrocínio Direto",
};

/* ─── Página ───────────────────────────────────────────────────────── */
export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjetoData(id);

  if ("error" in data) {
    if (data.error.includes("não encontrado")) notFound();
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020b18" }}>
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{data.error}</p>
          <Link href="/hub" className="mt-4 inline-block text-xs text-cyan-400 hover:text-cyan-300">
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  const { projeto, fontes, itens, notas, resumo } = data;
  const statusCfg = STATUS_CFG[projeto.status] ?? {
    label: projeto.status,
    cls: "bg-slate-700/40 text-slate-200 border border-slate-500/60",
  };
  const saldo = resumo.total_captacao - resumo.total_orcado;

  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/hub"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Meus projetos
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-extrabold text-white"
                style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.04em" }}
              >
                {projeto.nome_projeto}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ID {projeto.id.slice(0, 8)} · Criado em{" "}
                {new Date(projeto.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${statusCfg.cls}`}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* KPI CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard
            icon={<Wallet size={15} className="text-cyan-400" />}
            label="Total Captação"
            valor={brl(resumo.total_captacao)}
            cor="text-cyan-300"
          />
          <KpiCard
            icon={<ReceiptText size={15} className="text-emerald-400" />}
            label="Total Orçado"
            valor={brl(resumo.total_orcado)}
            cor="text-emerald-300"
          />
          <KpiCard
            icon={<Layers size={15} className="text-sky-400" />}
            label="Saldo"
            valor={brl(saldo)}
            cor={saldo >= 0 ? "text-sky-300" : "text-red-400"}
          />
          <KpiCard
            icon={<FileCheck size={15} className="text-amber-400" />}
            label="Notas Fiscais"
            valor={brl(resumo.total_notas)}
            cor="text-amber-300"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

          {/* ITENS ORÇAMENTÁRIOS */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Itens Orçamentários
              </h2>
              <NovoItemModal projetoId={projeto.id} fontes={fontes} />
            </div>
            <TabelaItens
              projetoId={projeto.id}
              itens={itens}
              fontes={fontes}
              totalOrcado={resumo.total_orcado}
            />
          </section>

          {/* FONTES */}
          <aside>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
              Fontes de Captação
            </h2>
            {fontes.length === 0 ? (
              <div className="ds-card text-center py-8" style={{ background: "#081121" }}>
                <p className="text-xs text-slate-500">Nenhuma fonte cadastrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {fontes.map((fonte) => <FonteCard key={fonte.id} fonte={fonte} />)}
                <div
                  className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                  style={{
                    background: "rgba(34,211,238,0.06)",
                    border: "1px solid rgba(34,211,238,0.15)",
                  }}
                >
                  <span className="text-[11px] uppercase tracking-[0.14em] text-cyan-400/70 font-medium">
                    Total captação
                  </span>
                  <span className="text-sm font-semibold text-cyan-300 num-tabular">
                    {brl(resumo.total_captacao)}
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* NOTAS FISCAIS — full width */}
        <NotasFiscais
          projetoId={projeto.id}
          notas={notas}
          fontes={fontes}
        />

      </main>
    </div>
  );
}

/* ─── Sub-componentes server ────────────────────────────────────────── */
function KpiCard({
  icon,
  label,
  valor,
  cor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
  cor: string;
}) {
  return (
    <div className="ds-card" style={{ background: "#081121", padding: "14px" }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">
          {label}
        </p>
      </div>
      <p className={`text-lg font-semibold num-tabular ${cor}`}>{valor}</p>
    </div>
  );
}

function FonteCard({ fonte }: { fonte: ProjetoFonte }) {
  const tipoLabel = TIPO_FONTE[fonte.tipo] ?? fonte.tipo;
  const statusCls =
    fonte.status === "aprovado"
      ? "text-emerald-400"
      : fonte.status === "reprovado"
      ? "text-red-400"
      : "text-slate-400";
  return (
    <div
      className="ds-card flex items-center justify-between gap-3"
      style={{ background: "#081121", padding: "12px 14px" }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {fonte.nome_fonte ?? tipoLabel}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">{tipoLabel}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-slate-200 num-tabular">
          {brl(Number(fonte.valor_captacao))}
        </p>
        {fonte.status && (
          <p className={`text-[11px] mt-0.5 capitalize ${statusCls}`}>
            {fonte.status}
          </p>
        )}
      </div>
    </div>
  );
}
