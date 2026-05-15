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

const INITIAL_STATE: ActionState = {
  status: "idle",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function statusClasses(status: "ok" | "warning" | "critical") {
  if (status === "critical") return "border-red-200 bg-red-50 text-red-700";
  if (status === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function alertClasses(nivel: "info" | "aviso" | "critico" | "bloqueante") {
  if (nivel === "bloqueante") return "border-red-300 bg-red-50";
  if (nivel === "critico") return "border-orange-300 bg-orange-50";
  if (nivel === "aviso") return "border-amber-300 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

function AlertIcon({ nivel }: { nivel: "info" | "aviso" | "critico" | "bloqueante" }) {
  if (nivel === "bloqueante") return <ShieldAlert className="h-4 w-4 text-red-600" />;
  if (nivel === "critico") return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  if (nivel === "aviso") return <Bell className="h-4 w-4 text-amber-600" />;
  return <Clock3 className="h-4 w-4 text-slate-600" />;
}

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
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Valor captado</span>
            <BadgeDollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{currency.format(data.valorCaptado)}</p>
          <p className="mt-2 text-xs text-slate-500">Projeto {data.projetoId}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Executado</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{currency.format(data.valorExecutado)}</p>
          <p className="mt-2 text-xs text-slate-500">{percent.format(executionProgress)}% da base financeira</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Saldo disponível</span>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{currency.format(data.saldoConta)}</p>
          <p className="mt-2 text-xs text-slate-500">Status do projeto: {data.status}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Risco</span>
            <ShieldAlert className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{data.riscoLabel}</p>
          <p className="mt-2 text-xs text-slate-500">{percent.format(data.riscoPercentual)}% do limite crítico</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Teto Administração</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{currency.format(data.tetoAdministracao)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Teto Captação</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{currency.format(data.tetoCaptacao)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Teto Divulgação + Acessibilidade</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{currency.format(data.tetoDivulgacao)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Rubricas do projeto</h2>
              <p className="text-sm text-slate-500">Execução orçamentária e travas legais da IN 29/2026.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <BadgeDollarSign className="h-4 w-4" />
              Nova Despesa
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {data.rubricas.map((rubrica) => {
              const progresso = rubrica.valor_orcado > 0 ? (rubrica.valor_executado / rubrica.valor_orcado) * 100 : 0;
              const saldoRubrica = Math.max(rubrica.valor_orcado - rubrica.valor_executado, 0);

              return (
                <div key={rubrica.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900">{rubrica.descricao}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses(rubrica.status)}`}>
                          {rubrica.status === "critical" ? "Bloqueada" : rubrica.status === "warning" ? "Atenção" : "OK"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        Categoria: {rubrica.categoria} · Orçado {currency.format(rubrica.valor_orcado)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-medium text-slate-900">Executado {currency.format(rubrica.valor_executado)}</p>
                      <p className="text-xs text-slate-500">Saldo {currency.format(saldoRubrica)}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${rubrica.status === "critical" ? "bg-red-500" : rubrica.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{percent.format(progresso)}% da rubrica consumida</span>
                    <span>{percent.format(rubrica.percentualTeto)}% do teto legal</span>
                    <span>Glosado {currency.format(rubrica.valor_glosado)}</span>
                    <span>Teto legal {currency.format(rubrica.tetoLegal)}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">{rubrica.referenciaLegal}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Alertas de compliance</h2>
            </div>
            <div className="mt-5 space-y-3">
              {data.alertas.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Nenhum alerta ativo para este projeto.
                </div>
              ) : (
                data.alertas.map((item) => (
                  <article key={item.id} className={`rounded-2xl border p-4 ${alertClasses(item.nivel)}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertIcon nivel={item.nivel} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium text-slate-900">{item.codigo}</h3>
                          <span className="text-[11px] uppercase tracking-wide text-slate-500">{item.nivel}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{item.mensagem}</p>
                        {item.referencia_legal ? <p className="mt-2 text-xs text-slate-500">{item.referencia_legal}</p> : null}
                        <p className="mt-2 text-xs text-slate-500">{new Date(item.criado_em).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-900">Resumo</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>{summary.warnings} rubrica(s) em atenção.</p>
              <p>{summary.blocked} rubrica(s) em estado crítico.</p>
              <p>Projeto: {data.nomeP}</p>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Nova Despesa</h2>
                <p className="text-sm text-slate-500">Preencha os dados para validar compliance e bloqueios.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="projeto_id" value={data.projetoId} />

              <div className="space-y-2">
                <label htmlFor="rubrica_id" className="text-sm font-medium text-slate-700">Rubrica</label>
                <select
                  id="rubrica_id"
                  name="rubrica_id"
                  defaultValue={data.rubricas[0]?.id}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
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
                {state.field_errors?.rubrica_id ? <p className="text-xs text-red-600">{state.field_errors.rubrica_id[0]}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="descricao" className="text-sm font-medium text-slate-700">Descrição</label>
                <input
                  id="descricao"
                  name="descricao"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  placeholder="Ex.: pagamento de mídia digital"
                />
                {state.field_errors?.descricao ? <p className="text-xs text-red-600">{state.field_errors.descricao[0]}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="beneficiario_nome" className="text-sm font-medium text-slate-700">Beneficiário</label>
                  <input
                    id="beneficiario_nome"
                    name="beneficiario_nome"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Nome do favorecido"
                  />
                  {state.field_errors?.beneficiario_nome ? <p className="text-xs text-red-600">{state.field_errors.beneficiario_nome[0]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="beneficiario_cpf_cnpj" className="text-sm font-medium text-slate-700">CPF/CNPJ</label>
                  <input
                    id="beneficiario_cpf_cnpj"
                    name="beneficiario_cpf_cnpj"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Documento do beneficiário"
                  />
                  {state.field_errors?.beneficiario_cpf_cnpj ? <p className="text-xs text-red-600">{state.field_errors.beneficiario_cpf_cnpj[0]}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="valor_bruto" className="text-sm font-medium text-slate-700">Valor bruto</label>
                  <input
                    id="valor_bruto"
                    name="valor_bruto"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_bruto ? <p className="text-xs text-red-600">{state.field_errors.valor_bruto[0]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="valor_retencoes" className="text-sm font-medium text-slate-700">Retenções</label>
                  <input
                    id="valor_retencoes"
                    name="valor_retencoes"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_retencoes ? <p className="text-xs text-red-600">{state.field_errors.valor_retencoes[0]}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="forma_pagamento" className="text-sm font-medium text-slate-700">Forma de pagamento</label>
                  <select
                    id="forma_pagamento"
                    name="forma_pagamento"
                    defaultValue="pix"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    <option value="pix">PIX</option>
                    <option value="ted">TED</option>
                    <option value="doc">DOC</option>
                    <option value="cheque_nominativo">Cheque nominativo</option>
                  </select>
                  {state.field_errors?.forma_pagamento ? <p className="text-xs text-red-600">{state.field_errors.forma_pagamento[0]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="data_pagamento" className="text-sm font-medium text-slate-700">Data de pagamento</label>
                  <input
                    id="data_pagamento"
                    name="data_pagamento"
                    type="date"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  />
                  {state.field_errors?.data_pagamento ? <p className="text-xs text-red-600">{state.field_errors.data_pagamento[0]}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comprovante_transacao" className="text-sm font-medium text-slate-700">Comprovante / ID da transação</label>
                <input
                  id="comprovante_transacao"
                  name="comprovante_transacao"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  placeholder="Hash PIX, TED ou identificador interno"
                />
                {state.field_errors?.comprovante_transacao ? <p className="text-xs text-red-600">{state.field_errors.comprovante_transacao[0]}</p> : null}
              </div>

              {state.status === "error" && state.message ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {state.message}
                </div>
              ) : null}

              {state.status === "success" && state.message ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {state.message}
                </div>
              ) : null}

              {state.status === "compliance_violation" && state.violation ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  <p className="font-medium">Bloqueio preventivo de compliance</p>
                  <p className="mt-1">Rubrica: {state.violation.rubrica}</p>
                  <p>Categoria: {state.violation.categoria}</p>
                  <p>Valor tentado: {currency.format(state.violation.valor_tentado)}</p>
                  <p>Executado atual: {currency.format(state.violation.valor_executado_atual)}</p>
                  <p>Teto legal: {currency.format(state.violation.teto_legal)}</p>
                  <p className="mt-1 text-xs">{state.violation.referencia_legal}</p>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeDollarSign className="h-4 w-4" />}
                  Registrar despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}