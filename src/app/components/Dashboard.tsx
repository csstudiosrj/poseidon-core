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

/* ── Helpers ──────────────────────────────────────────────────── */
function rubricaBadge(status: "ok" | "warning" | "critical") {
  if (status === "critical")
    return "inline-flex items-center rounded-full bg-red-500/12 px-2.5 py-0.5 text-xs font-medium text-red-300 border border-red-400/20";
  if (status === "warning")
    return "inline-flex items-center rounded-full bg-amber-500/12 px-2.5 py-0.5 text-xs font-medium text-amber-300 border border-amber-400/20";
  return "inline-flex items-center rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-400/20";
}

function progressFill(status: "ok" | "warning" | "critical") {
  if (status === "critical") return "h-full rounded-full bg-red-500";
  if (status === "warning") return "h-full rounded-full bg-amber-400";
  return "h-full rounded-full bg-emerald-500";
}

function AlertIcon({ nivel }: { nivel: "info" | "aviso" | "critico" | "bloqueante" }) {
  const classes = "h-4 w-4";
  if (nivel === "bloqueante") return <ShieldAlert className={`${classes} text-red-400`} />;
  if (nivel === "critico") return <AlertTriangle className={`${classes} text-amber-400`} />;
  if (nivel === "aviso") return <Bell className={`${classes} text-cyan-400`} />;
  return <Clock3 className={`${classes} text-slate-400`} />;
}

function alertBorder(nivel: "info" | "aviso" | "critico" | "bloqueante") {
  if (nivel === "bloqueante") return "border-red-400/20 bg-red-500/5";
  if (nivel === "critico") return "border-amber-400/20 bg-amber-500/5";
  if (nivel === "aviso") return "border-cyan-400/20 bg-cyan-500/5";
  return "border-white/10 bg-white/[0.02]";
}

/* ── Componentes internos ─────────────────────────────────────── */
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
    <div className="rounded-2xl border border-white/10 bg-[#081121]/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{meta}</p>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────── */
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Dashboard de Rubricas
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Execução orçamentária, tetos legais e alertas de compliance.
        </p>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Valor captado"
          value={currency.format(data.valorCaptado)}
          meta={`Projeto ${data.projetoId}`}
          icon={<BadgeDollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Executado"
          value={currency.format(data.valorExecutado)}
          meta={`${percent.format(executionProgress)}% da base financeira`}
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <MetricCard
          label="Saldo disponível"
          value={currency.format(data.saldoConta)}
          meta={`Status do projeto: ${data.status}`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Risco"
          value={data.riscoLabel}
          meta={`${percent.format(data.riscoPercentual)}% do limite crítico`}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
      </section>

      {/* Tetos legais */}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Teto Administração"
          value={currency.format(data.tetoAdministracao)}
          meta="15% do orçamento total"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <MetricCard
          label="Teto Captação"
          value={currency.format(data.tetoCaptacao)}
          meta="10% limitado ao teto legal"
          icon={<BadgeDollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Teto Divulgação + Acessibilidade"
          value={currency.format(data.tetoDivulgacao)}
          meta="20% compartilhado"
          icon={<Bell className="h-4 w-4" />}
        />
      </section>

      {/* Conteúdo principal */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        {/* Coluna esquerda: rubricas */}
        <div className="rounded-2xl border border-white/10 bg-[#081121]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Rubricas do projeto</h2>
              <p className="text-sm text-slate-400">
                Execução orçamentária e travas legais da IN 29/2026.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              <BadgeDollarSign className="h-4 w-4" />
              Nova Despesa
            </button>
          </div>

          <div className="mt-6 space-y-4">
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
                        <span className="tabular-nums">{currency.format(rubrica.valor_executado)}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Saldo{" "}
                        <span className="tabular-nums text-white">{currency.format(saldoRubrica)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={progressFill(rubrica.status)}
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{percent.format(progresso)}% da rubrica consumida</span>
                    <span>{percent.format(rubrica.percentualTeto)}% do teto legal</span>
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

                  <p className="mt-2 text-xs text-slate-500">{rubrica.referenciaLegal}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna direita: sidebar de auditoria + resumo */}
        <div className="space-y-6">
          {/* Auditoria */}
          <div className="rounded-2xl border border-white/10 bg-[#081121]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Alertas de compliance</h2>
            </div>
            <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
              {data.alertas.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
                  Nenhum alerta ativo para este projeto.
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
                          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
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

          {/* Resumo */}
          <div className="rounded-2xl border border-white/10 bg-[#081121]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Resumo</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>{summary.warnings} rubrica(s) em atenção.</p>
              <p>{summary.blocked} rubrica(s) em estado crítico.</p>
              <p>Projeto: {data.nomeP}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de nova despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-400/10 bg-[#081121] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Nova Despesa</h2>
                <p className="text-sm text-slate-400">
                  Preencha os dados para validar compliance e bloqueios.
                </p>
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
                <label htmlFor="rubrica_id" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
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
                <label htmlFor="descricao" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Descrição
                </label>
                <input
                  id="descricao"
                  name="descricao"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40"
                  placeholder="Ex.: pagamento de mídia digital"
                />
                {state.field_errors?.descricao && (
                  <p className="mt-2 text-xs text-red-400">{state.field_errors.descricao[0]}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="beneficiario_nome" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Beneficiário
                  </label>
                  <input
                    id="beneficiario_nome"
                    name="beneficiario_nome"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40"
                    placeholder="Nome do favorecido"
                  />
                  {state.field_errors?.beneficiario_nome && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.beneficiario_nome[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="beneficiario_cpf_cnpj" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    CPF/CNPJ
                  </label>
                  <input
                    id="beneficiario_cpf_cnpj"
                    name="beneficiario_cpf_cnpj"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40"
                    placeholder="Documento do beneficiário"
                  />
                  {state.field_errors?.beneficiario_cpf_cnpj && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.beneficiario_cpf_cnpj[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="valor_bruto" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Valor bruto
                  </label>
                  <input
                    id="valor_bruto"
                    name="valor_bruto"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_bruto && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.valor_bruto[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="valor_retencoes" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Retenções
                  </label>
                  <input
                    id="valor_retencoes"
                    name="valor_retencoes"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_retencoes && (
                    <p className="mt-2 text-xs text-red-400">{state.field_errors.valor_retencoes[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="forma_pagamento" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
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
                  <label htmlFor="data_pagamento" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
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
                <label htmlFor="comprovante_transacao" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Comprovante / ID da transação
                </label>
                <input
                  id="comprovante_transacao"
                  name="comprovante_transacao"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40"
                  placeholder="Hash PIX, TED ou identificador interno"
                />
                {state.field_errors?.comprovante_transacao && (
                  <p className="mt-2 text-xs text-red-400">{state.field_errors.comprovante_transacao[0]}</p>
                )}
              </div>

              {/* Feedback */}
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
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
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