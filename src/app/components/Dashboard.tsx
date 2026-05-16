"use client";

import { useActionState, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldAlert,
  Wallet,
  X,
} from "lucide-react";
import { processarNovaDespesa, type ActionState } from "@/app/actions/processarNovaDespesa";
import type { DashboardData } from "@/app/actions/getDashboardData";

/* ================================================================
   FONTES NECESSÁRIAS (configurar no layout.tsx / tailwind.config)
   - Syne (títulos)
   - Inter (interface)
   - JetBrains Mono (números)
   ================================================================ */

type DashboardProps = {
  initialData: DashboardData;
};

const INITIAL_STATE: ActionState = { status: "idle" };

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/* ── Helpers de estilo ───────────────────────────────────────── */
function rubricaBadge(status: "ok" | "warning" | "critical") {
  if (status === "critical")
    return "inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-400/20";
  if (status === "warning")
    return "inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-400/20";
  return "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-400/20";
}

function progressFill(status: "ok" | "warning" | "critical") {
  if (status === "critical") return "h-full rounded-full bg-red-500";
  if (status === "warning") return "h-full rounded-full bg-amber-400";
  return "h-full rounded-full bg-emerald-500";
}

function AlertIcon({ nivel }: { nivel: "info" | "aviso" | "critico" | "bloqueante" }) {
  const classes = "h-4 w-4 shrink-0";
  if (nivel === "bloqueante") return <ShieldAlert className={`${classes} text-red-400`} />;
  if (nivel === "critico") return <AlertTriangle className={`${classes} text-amber-400`} />;
  if (nivel === "aviso") return <Bell className={`${classes} text-cyan-400`} />;
  return <Clock3 className={`${classes} text-slate-500`} />;
}

function alertBorder(nivel: "info" | "aviso" | "critico" | "bloqueante") {
  if (nivel === "bloqueante") return "border-red-400/20 bg-red-500/5";
  if (nivel === "critico") return "border-amber-400/20 bg-amber-500/5";
  if (nivel === "aviso") return "border-cyan-400/20 bg-cyan-500/5";
  return "border-white/10 bg-white/[0.02]";
}

/* ── KPI Card padrão ─────────────────────────────────────────── */
function MetricCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#081121]/90 backdrop-blur-sm p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{meta}</p>
    </div>
  );
}

/* ── Gauge de risco (termômetro) ─────────────────────────────── */
function RiskGauge({ percentual }: { percentual: number }) {
  const color =
    percentual >= 85 ? "bg-red-500" : percentual >= 60 ? "bg-amber-400" : "bg-emerald-500";
  const label = percentual >= 85 ? "Crítico" : percentual >= 60 ? "Moderado" : "Normal";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#081121]/90 backdrop-blur-sm p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Risco de Glosa</span>
        <ShieldAlert className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-4 flex items-end gap-4">
        <span className="text-3xl font-semibold tabular-nums text-white">{percentual}%</span>
        <span className={`text-sm font-medium ${percentual >= 85 ? "text-red-400" : percentual >= 60 ? "text-amber-400" : "text-emerald-400"}`}>
          {label}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">Pressão orçamentária atual</p>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────────── */
export default function Dashboard({ initialData }: DashboardProps) {
  const [data] = useState<DashboardData>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(processarNovaDespesa, INITIAL_STATE);

  const executionProgress = useMemo(() => {
    const base = data.valorCaptado > 0 ? data.valorCaptado : data.orcamentoTotalAprovado;
    if (!base || base <= 0) return 0;
    return (data.valorExecutado / base) * 100;
  }, [data.valorCaptado, data.valorExecutado, data.orcamentoTotalAprovado]);

  const summary = useMemo(() => {
    const warnings = data.rubricas.filter((item) => item.status === "warning").length;
    const blocked = data.rubricas.filter((item) => item.status === "critical").length;
    return { warnings, blocked };
  }, [data.rubricas]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* ── Topbar compacta ──────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white font-['Syne']">
            Dashboard de Rubricas
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Execução orçamentária · tetos legais · alertas de compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pills de contexto */}
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-400 border border-cyan-400/20">
            {data.status}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400 border border-white/10">
            IN 29/2026
          </span>
        </div>
      </div>

      {/* ── KPIs (3 cards) ───────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Captado"
          value={currency.format(data.valorCaptado)}
          meta={`Projeto ${data.projetoId}`}
          icon={<BadgeDollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Saldo em Conta"
          value={currency.format(data.saldoConta)}
          meta={`${percent.format(executionProgress)}% executado`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <RiskGauge percentual={data.riscoPercentual} />
      </section>

      {/* ── Conteúdo principal (duas colunas) ────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_360px]">
        {/* Coluna esquerda: Rubricas */}
        <div className="rounded-2xl border border-white/10 bg-[#081121]/90 backdrop-blur-sm p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white font-['Syne']">
                Rubricas do projeto
              </h2>
              <p className="text-sm text-slate-400">
                Execução orçamentária e travas da IN 29/2026
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              <BadgeDollarSign className="h-4 w-4" />
              Nova Despesa
            </button>
          </div>

          <div className="space-y-4">
            {data.rubricas.map((rubrica) => {
              const progresso =
                rubrica.valor_orcado > 0
                  ? (rubrica.valor_executado / rubrica.valor_orcado) * 100
                  : 0;
              const saldoRubrica = Math.max(rubrica.valor_orcado - rubrica.valor_executado, 0);

              return (
                <div
                  key={rubrica.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  {/* Linha superior: nome, badge, valores */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-white">{rubrica.descricao}</h3>
                        <span className={rubricaBadge(rubrica.status)}>
                          {rubrica.status === "critical"
                            ? "Bloqueada"
                            : rubrica.status === "warning"
                            ? "Atenção"
                            : "OK"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Categoria: {rubrica.categoria} · Orçado{" "}
                        <span className="tabular-nums text-white">
                          {currency.format(rubrica.valor_orcado)}
                        </span>
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-medium text-white">
                        Executado{" "}
                        <span className="tabular-nums">
                          {currency.format(rubrica.valor_executado)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Saldo{" "}
                        <span className="tabular-nums text-white">
                          {currency.format(saldoRubrica)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Barra de progresso fina */}
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={progressFill(rubrica.status)}
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    />
                  </div>

                  {/* Metadados em linha */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{percent.format(progresso)}% consumido</span>
                    <span>{percent.format(rubrica.percentualTeto)}% do teto</span>
                    <span>
                      Glosado{" "}
                      <span className="tabular-nums text-white">
                        {currency.format(rubrica.valor_glosado)}
                      </span>
                    </span>
                    <span>
                      Teto legal{" "}
                      <span className="tabular-nums text-white">
                        {currency.format(rubrica.tetoLegal)}
                      </span>
                    </span>
                  </div>

                  {/* Referência legal */}
                  <p className="mt-2 text-xs text-slate-500">{rubrica.referenciaLegal}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna direita: Sidebar */}
        <div className="space-y-6">
          {/* Feed de auditoria */}
          <div className="rounded-2xl border border-white/10 bg-[#081121]/90 backdrop-blur-sm p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-2 mb-5">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-semibold text-white font-['Syne']">Auditoria</h2>
            </div>
            <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1">
              {data.alertas.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
                  Nenhum evento registrado.
                </div>
              ) : (
                data.alertas.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-xl border p-4 ${alertBorder(item.nivel)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertIcon nivel={item.nivel} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium text-white">{item.codigo}</h3>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                            {item.nivel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{item.mensagem}</p>
                        {item.referencia_legal && (
                          <p className="mt-2 text-xs text-slate-500">{item.referencia_legal}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(item.criado_em).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Resumo executivo */}
          <div className="rounded-2xl border border-white/10 bg-[#081121]/90 backdrop-blur-sm p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white font-['Syne']">Resumo</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p>{summary.warnings} rubrica(s) em atenção</p>
              <p>{summary.blocked} rubrica(s) bloqueadas</p>
              <p>Projeto: {data.nomeP}</p>
              <p className="text-xs text-slate-500">Mecanismo: {data.mecanismo}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal de Nova Despesa ─────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-400/10 bg-[#081121] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white font-['Syne']">Nova Despesa</h2>
                <p className="text-sm text-slate-400">Preencha os dados para validação de compliance.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="projeto_id" value={data.projetoId} />

              <div>
                <label htmlFor="rubrica_id" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Rubrica
                </label>
                <select
                  id="rubrica_id"
                  name="rubrica_id"
                  defaultValue={data.rubricas[0]?.id}
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-cyan-400/40"
                >
                  {data.rubricas.map((rubrica) => {
                    const saldoRubrica = Math.max(rubrica.valor_orcado - rubrica.valor_executado, 0);
                    return (
                      <option key={rubrica.id} value={rubrica.id}>
                        {rubrica.descricao} · saldo {currency.format(saldoRubrica)}
                      </option>
                    );
                  })}
                </select>
                {state.field_errors?.rubrica_id && (
                  <p className="mt-2 text-xs text-red-400">{state.field_errors.rubrica_id[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="descricao" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Descrição
                </label>
                <input
                  id="descricao"
                  name="descricao"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                  placeholder="Ex.: pagamento de mídia digital"
                />
                {state.field_errors?.descricao && (
                  <p className="mt-2 text-xs text-red-400">{state.field_errors.descricao[0]}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="beneficiario_nome" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Beneficiário
                  </label>
                  <input
                    id="beneficiario_nome"
                    name="beneficiario_nome"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                    placeholder="Nome do favorecido"
                  />
                  {state.field_errors?.beneficiario_nome && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.beneficiario_nome[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="beneficiario_cpf_cnpj" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    CPF/CNPJ
                  </label>
                  <input
                    id="beneficiario_cpf_cnpj"
                    name="beneficiario_cpf_cnpj"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                    placeholder="Documento do beneficiário"
                  />
                  {state.field_errors?.beneficiario_cpf_cnpj && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.beneficiario_cpf_cnpj[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="valor_bruto" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Valor bruto
                  </label>
                  <input
                    id="valor_bruto"
                    name="valor_bruto"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_bruto && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.valor_bruto[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="valor_retencoes" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Retenções
                  </label>
                  <input
                    id="valor_retencoes"
                    name="valor_retencoes"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_retencoes && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.valor_retencoes[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="forma_pagamento" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Forma de pagamento
                  </label>
                  <select
                    id="forma_pagamento"
                    name="forma_pagamento"
                    defaultValue="pix"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-cyan-400/40"
                  >
                    <option value="pix">PIX</option>
                    <option value="ted">TED</option>
                    <option value="doc">DOC</option>
                    <option value="cheque_nominativo">Cheque nominativo</option>
                  </select>
                  {state.field_errors?.forma_pagamento && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.forma_pagamento[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="data_pagamento" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Data de pagamento
                  </label>
                  <input
                    id="data_pagamento"
                    name="data_pagamento"
                    type="date"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums outline-none focus:border-cyan-400/40"
                  />
                  {state.field_errors?.data_pagamento && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.data_pagamento[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="comprovante_transacao" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Comprovante / ID da transação
                </label>
                <input
                  id="comprovante_transacao"
                  name="comprovante_transacao"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                  placeholder="Hash PIX, TED ou identificador interno"
                />
                {state.field_errors?.comprovante_transacao && (
                  <p className="mt-2 text-xs text-red-400">{state.field_errors.comprovante_transacao[0]}</p>
                )}
              </div>

              {/* Feedback de estado */}
              {state.status === "error" && state.message && (
                <div className="rounded-xl border border-red-400/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                  {state.message}
                </div>
              )}
              {state.status === "success" && state.message && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-400">
                  {state.message}
                </div>
              )}
              {state.status === "compliance_violation" && state.violation && (
                <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 px-3 py-3 text-sm text-amber-400">
                  <p className="font-medium">Bloqueio preventivo de compliance</p>
                  <p className="mt-1">Rubrica: {state.violation.rubrica}</p>
                  <p>Categoria: {state.violation.categoria}</p>
                  <p>Valor tentado: {currency.format(state.violation.valor_tentado)}</p>
                  <p>Executado atual: {currency.format(state.violation.valor_executado_atual)}</p>
                  <p>Teto legal: {currency.format(state.violation.teto_legal)}</p>
                  <p className="mt-1 text-xs text-slate-400">{state.violation.referencia_legal}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BadgeDollarSign className="h-4 w-4" />
                  )}
                  {isPending ? "Processando…" : "Registrar despesa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}