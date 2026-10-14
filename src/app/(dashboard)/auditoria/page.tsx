// src/app/(dashboard)/auditoria/page.tsx
import React from "react";
import Link from "next/link";
import "../globals.css";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ReceiptText,
  FileCheck,
  FolderKanban,
} from "lucide-react";
import { getAuditoriaData } from "@/app/actions/auditoria";
import type { ProjetoAuditoria } from "@/app/actions/auditoria";

/* ─── Helpers ──────────────────────────────────────────────────── */
const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const pct = (v: number) => `${Math.min(v, 100).toFixed(0)}%`;

function coberturaConfig(cobertura: number, numNotas: number) {
  if (numNotas === 0)
    return { label: "Sem notas",  cls: "text-slate-500",   bar: "bg-slate-700" };
  if (cobertura >= 80)
    return { label: pct(cobertura), cls: "text-emerald-400", bar: "bg-emerald-500" };
  if (cobertura >= 40)
    return { label: pct(cobertura), cls: "text-amber-400",   bar: "bg-amber-500" };
  return   { label: pct(cobertura), cls: "text-red-400",     bar: "bg-red-500" };
}

const STATUS_LABEL: Record<string, string> = {
  rascunho:         "Rascunho",
  ativo:            "Ativo",
  enviado:          "Enviado",
  finalizado:       "Finalizado",
  inativo:          "Inativo",
  prestacao_contas: "Prest. contas",
};

/* ─── Página ───────────────────────────────────────────────────── */
export default async function AuditoriaPage() {
  const data = await getAuditoriaData();

  if ("error" in data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020b18" }}>
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{data.error}</p>
        </div>
      </div>
    );
  }

  const { projetos, resumo } = data;
  const coberturaGeral =
    resumo.total_orcado > 0
      ? (resumo.total_notas / resumo.total_orcado) * 100
      : 0;

  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <ShieldCheck size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1
              className="text-xl font-extrabold text-white"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}
            >
              Auditoria
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Visão consolidada de compliance e prestação de contas
            </p>
          </div>
        </div>

        {projetos.length === 0 ? (
          <div
            className="ds-card flex flex-col items-center justify-center text-center py-16"
            style={{ background: "#081121" }}
          >
            <FolderKanban size={32} className="text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300 mb-1">Nenhum projeto ainda</p>
            <p className="text-xs text-slate-500 mb-4">
              Crie um projeto para começar a acompanhar o compliance.
            </p>
            <Link href="/setup" className="ds-btn ds-btn-primary text-xs">
              Criar projeto
            </Link>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <KpiCard
                icon={<FolderKanban size={15} className="text-cyan-400" />}
                label="Projetos"
                valor={String(resumo.total_projetos)}
                cor="text-cyan-300"
              />
              <KpiCard
                icon={<Wallet size={15} className="text-emerald-400" />}
                label="Total Captação"
                valor={brl(resumo.total_captacao)}
                cor="text-emerald-300"
              />
              <KpiCard
                icon={<ReceiptText size={15} className="text-sky-400" />}
                label="Total Orçado"
                valor={brl(resumo.total_orcado)}
                cor="text-sky-300"
              />
              <KpiCard
                icon={<FileCheck size={15} className="text-amber-400" />}
                label="Cobertura Notas"
                valor={pct(coberturaGeral)}
                cor={coberturaGeral >= 80 ? "text-emerald-300" : coberturaGeral >= 40 ? "text-amber-300" : "text-red-400"}
              />
            </section>

            {/* Alertas */}
            {(resumo.projetos_sem_nota > 0 || resumo.projetos_com_glosa > 0) && (
              <section className="mb-6 space-y-2">
                {resumo.projetos_sem_nota > 0 && (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.20)",
                    }}
                  >
                    <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                    <span className="text-amber-200/80">
                      <strong className="text-amber-300">{resumo.projetos_sem_nota}</strong>{" "}
                      {resumo.projetos_sem_nota === 1
                        ? "projeto sem nenhuma nota fiscal cadastrada"
                        : "projetos sem nenhuma nota fiscal cadastrada"}
                    </span>
                  </div>
                )}
                {resumo.projetos_com_glosa > 0 && (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.20)",
                    }}
                  >
                    <AlertCircle size={15} className="text-red-400 shrink-0" />
                    <span className="text-red-200/80">
                      <strong className="text-red-300">{resumo.projetos_com_glosa}</strong>{" "}
                      {resumo.projetos_com_glosa === 1
                        ? "projeto com nota fiscal em glosa"
                        : "projetos com notas fiscais em glosa"}
                    </span>
                  </div>
                )}
              </section>
            )}

            {/* Tabela de projetos */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
                Projetos
              </h2>
              <div
                className="ds-card overflow-hidden"
                style={{ background: "#081121", padding: 0 }}
              >
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Projeto</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden sm:table-cell">Status</th>
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden md:table-cell">Orçado</th>
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden md:table-cell">Notas</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Cobertura</th>
                      <th className="w-8 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {projetos.map((p, idx) => (
                      <ProjetoRow
                        key={p.id}
                        projeto={p}
                        isLast={idx === projetos.length - 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* ─── ProjetoRow ───────────────────────────────────────────────── */
function ProjetoRow({
  projeto,
  isLast,
}: {
  projeto: ProjetoAuditoria;
  isLast: boolean;
}) {
  const cfg = coberturaConfig(projeto.cobertura, projeto.num_notas);
  const barWidth = Math.min(projeto.cobertura, 100);

  return (
    <tr style={isLast ? undefined : { borderBottom: "1px solid rgba(142,177,214,0.07)" }}>
      <td className="px-4 py-3">
        <Link
          href={`/projeto/${projeto.id}`}
          className="text-slate-200 hover:text-cyan-300 transition-colors font-medium truncate max-w-[180px] block"
        >
          {projeto.nome_projeto}
        </Link>
        {projeto.num_glosas > 0 && (
          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5">
            <AlertCircle size={10} />
            {projeto.num_glosas} glosa{projeto.num_glosas > 1 ? "s" : ""}
          </span>
        )}
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-[11px] text-slate-400">
          {STATUS_LABEL[projeto.status] ?? projeto.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-slate-300 num-tabular hidden md:table-cell">
        {brl(projeto.total_orcado)}
      </td>
      <td className="px-4 py-3 text-right text-slate-300 num-tabular hidden md:table-cell">
        {brl(projeto.total_notas)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1 rounded-full overflow-hidden hidden sm:block"
            style={{ background: "rgba(142,177,214,0.10)", minWidth: "60px" }}
          >
            <div
              className={`h-full rounded-full transition-all ${cfg.bar}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className={`text-[11px] font-medium num-tabular shrink-0 ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        {projeto.num_notas > 0 && projeto.cobertura >= 80 ? (
          <CheckCircle2 size={13} className="text-emerald-500/60" />
        ) : null}
      </td>
    </tr>
  );
}

/* ─── KpiCard ──────────────────────────────────────────────────── */
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
