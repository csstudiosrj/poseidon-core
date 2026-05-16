// src/app/components/Dashboard.tsx
'use client'

import { useActionState, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { processarNovaDespesa, type ActionState } from '@/app/actions/processarNovaDespesa'
import type { DashboardData } from '@/app/actions/getDashboardData'

type DashboardProps = {
  initialData: DashboardData
}

const INITIAL_STATE: ActionState = { status: 'idle' }

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
})

const percent = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function rubricaBadgeClass(status: 'ok' | 'warning' | 'critical') {
  if (status === 'critical') return 'ds-badge ds-badge-error'
  if (status === 'warning') return 'ds-badge ds-badge-warn'
  return 'ds-badge ds-badge-ok'
}

function progressFillClass(status: 'ok' | 'warning' | 'critical') {
  if (status === 'critical') return 'ds-progress-fill ds-progress-fill-error'
  if (status === 'warning') return 'ds-progress-fill ds-progress-fill-warn'
  return 'ds-progress-fill'
}

function alertContainerClass(nivel: 'info' | 'aviso' | 'critico' | 'bloqueante') {
  if (nivel === 'bloqueante') return 'border-[rgba(255,77,106,.25)] bg-[rgba(255,77,106,.07)]'
  if (nivel === 'critico') return 'border-[rgba(255,180,0,.25)] bg-[rgba(255,180,0,.08)]'
  if (nivel === 'aviso') return 'border-[rgba(0,229,255,.22)] bg-[rgba(0,229,255,.05)]'
  return 'border-[var(--color-ds-border)] bg-[var(--color-ds-surface-2)]'
}

function AlertIcon({ nivel }: { nivel: 'info' | 'aviso' | 'critico' | 'bloqueante' }) {
  if (nivel === 'bloqueante')
    return <ShieldAlert className="h-4 w-4 text-[var(--color-ds-error)]" />
  if (nivel === 'critico')
    return <AlertTriangle className="h-4 w-4 text-[var(--color-ds-warning)]" />
  if (nivel === 'aviso')
    return <Bell className="h-4 w-4 text-[var(--color-ds-cyan)]" />
  return <Clock3 className="h-4 w-4 text-[var(--color-ds-text-muted)]" />
}

function MetricCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string
  value: string
  meta: string
  icon: React.ReactNode
}) {
  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-ds-text-muted)]">{label}</span>
        <div className="text-[var(--color-ds-text-faint)]">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-[var(--color-ds-text)] ds-mono">
        {value}
      </p>
      <p className="mt-2 text-xs text-[var(--color-ds-text-muted)]">{meta}</p>
    </div>
  )
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [data] = useState<DashboardData>(initialData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(processarNovaDespesa, INITIAL_STATE)

  const executionProgress = useMemo(() => {
    const base = data.valorCaptado > 0 ? data.valorCaptado : data.orcamentoTotalAprovado
    if (!base || base <= 0) return 0
    return (data.valorExecutado / base) * 100
  }, [data.valorCaptado, data.valorExecutado, data.orcamentoTotalAprovado])

  const summary = useMemo(() => {
    const warnings = data.rubricas.filter((item) => item.status === 'warning').length
    const blocked = data.rubricas.filter((item) => item.status === 'critical').length
    return { warnings, blocked }
  }, [data.rubricas])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* Cards superiores */}
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

      {/* Lista de rubricas e alertas */}
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="ds-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-ds-text)]">
                Rubricas do projeto
              </h2>
              <p className="text-sm text-[var(--color-ds-text-muted)]">
                Execução orçamentária e travas legais da IN 29/2026.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="ds-btn-primary"
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
                  : 0
              const saldoRubrica = Math.max(rubrica.valor_orcado - rubrica.valor_executado, 0)

              return (
                <div
                  key={rubrica.id}
                  className="rounded-2xl border border-[var(--color-ds-border)] bg-[var(--color-ds-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-[var(--color-ds-text)]">
                          {rubrica.descricao}
                        </h3>
                        <span className={rubricaBadgeClass(rubrica.status)}>
                          {rubrica.status === 'critical'
                            ? 'Bloqueada'
                            : rubrica.status === 'warning'
                              ? 'Atenção'
                              : 'OK'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-ds-text-muted)]">
                        Categoria: {rubrica.categoria} · Orçado{' '}
                        <span className="ds-mono">
                          {currency.format(rubrica.valor_orcado)}
                        </span>
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-medium text-[var(--color-ds-text)]">
                        Executado{' '}
                        <span className="ds-mono">
                          {currency.format(rubrica.valor_executado)}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--color-ds-text-muted)]">
                        Saldo{' '}
                        <span className="ds-mono">
                          {currency.format(saldoRubrica)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 ds-progress-bar">
                    <div
                      className={progressFillClass(rubrica.status)}
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-ds-text-muted)]">
                    <span>{percent.format(progresso)}% da rubrica consumida</span>
                    <span>{percent.format(rubrica.percentualTeto)}% do teto legal</span>
                    <span>
                      Glosado{' '}
                      <span className="ds-mono">
                        {currency.format(rubrica.valor_glosado)}
                      </span>
                    </span>
                    <span>
                      Teto legal{' '}
                      <span className="ds-mono">
                        {currency.format(rubrica.tetoLegal)}
                      </span>
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[var(--color-ds-text-faint)]">
                    {rubrica.referenciaLegal}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="ds-card p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--color-ds-text-muted)]" />
              <h2 className="text-lg font-semibold text-[var(--color-ds-text)]">
                Alertas de compliance
              </h2>
            </div>
            <div className="mt-5 space-y-3">
              {data.alertas.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-ds-border)] bg-[var(--color-ds-surface-2)] p-4 text-sm text-[var(--color-ds-text-muted)]">
                  Nenhum alerta ativo para este projeto.
                </div>
              ) : (
                data.alertas.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-4 ${alertContainerClass(item.nivel)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertIcon nivel={item.nivel} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium text-[var(--color-ds-text)]">
                            {item.codigo}
                          </h3>
                          <span className="text-[11px] uppercase tracking-wide text-[var(--color-ds-text-muted)]">
                            {item.nivel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-ds-text-muted)]">
                          {item.mensagem}
                        </p>
                        {item.referencia_legal ? (
                          <p className="mt-2 text-xs text-[var(--color-ds-text-faint)]">
                            {item.referencia_legal}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-[var(--color-ds-text-muted)]">
                          {new Date(item.criado_em).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="ds-card p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-ds-success)]" />
              <h2 className="text-lg font-semibold text-[var(--color-ds-text)]">
                Resumo
              </h2>
            </div>
            <div className="mt-3 space-y-2 text-sm text-[var(--color-ds-text-muted)]">
              <p>{summary.warnings} rubrica(s) em atenção.</p>
              <p>{summary.blocked} rubrica(s) em estado crítico.</p>
              <p>Projeto: {data.nomeP}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de nova despesa */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="ds-card ds-card-glow w-full max-w-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-ds-text)]">
                  Nova Despesa
                </h2>
                <p className="text-sm text-[var(--color-ds-text-muted)]">
                  Preencha os dados para validar compliance e bloqueios.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="ds-btn-ghost !p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="projeto_id" value={data.projetoId} />

              <div>
                <label htmlFor="rubrica_id" className="ds-label">
                  Rubrica
                </label>
                <select
                  id="rubrica_id"
                  name="rubrica_id"
                  defaultValue={data.rubricas[0]?.id}
                  className="ds-input"
                >
                  {data.rubricas.map((rubrica) => {
                    const saldoRubrica = Math.max(
                      rubrica.valor_orcado - rubrica.valor_executado,
                      0
                    )
                    return (
                      <option key={rubrica.id} value={rubrica.id}>
                        {rubrica.descricao} · saldo {currency.format(saldoRubrica)}
                      </option>
                    )
                  })}
                </select>
                {state.field_errors?.rubrica_id ? (
                  <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                    {state.field_errors.rubrica_id[0]}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="descricao" className="ds-label">
                  Descrição
                </label>
                <input
                  id="descricao"
                  name="descricao"
                  className="ds-input"
                  placeholder="Ex.: pagamento de mídia digital"
                />
                {state.field_errors?.descricao ? (
                  <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                    {state.field_errors.descricao[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="beneficiario_nome" className="ds-label">
                    Beneficiário
                  </label>
                  <input
                    id="beneficiario_nome"
                    name="beneficiario_nome"
                    className="ds-input"
                    placeholder="Nome do favorecido"
                  />
                  {state.field_errors?.beneficiario_nome ? (
                    <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                      {state.field_errors.beneficiario_nome[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="beneficiario_cpf_cnpj" className="ds-label">
                    CPF/CNPJ
                  </label>
                  <input
                    id="beneficiario_cpf_cnpj"
                    name="beneficiario_cpf_cnpj"
                    className="ds-input"
                    placeholder="Documento do beneficiário"
                  />
                  {state.field_errors?.beneficiario_cpf_cnpj ? (
                    <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                      {state.field_errors.beneficiario_cpf_cnpj[0]}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="valor_bruto" className="ds-label">
                    Valor bruto
                  </label>
                  <input
                    id="valor_bruto"
                    name="valor_bruto"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="ds-input ds-mono"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_bruto ? (
                    <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                      {state.field_errors.valor_bruto[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="valor_retencoes" className="ds-label">
                    Retenções
                  </label>
                  <input
                    id="valor_retencoes"
                    name="valor_retencoes"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    className="ds-input ds-mono"
                    placeholder="0,00"
                  />
                  {state.field_errors?.valor_retencoes ? (
                    <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                      {state.field_errors.valor_retencoes[0]}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="forma_pagamento" className="ds-label">
                    Forma de pagamento
                  </label>
                  <select
                    id="forma_pagamento"
                    name="forma_pagamento"
                    defaultValue="pix"
                    className="ds-input"
                  >
                    <option value="pix">PIX</option>
                    <option value="ted">TED</option>
                    <option value="doc">DOC</option>
                    <option value="cheque_nominativo">Cheque nominativo</option>
                  </select>
                  {state.field_errors?.forma_pagamento ? (
                    <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                      {state.field_errors.forma_pagamento[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="data_pagamento" className="ds-label">
                    Data de pagamento
                  </label>
                  <input
                    id="data_pagamento"
                    name="data_pagamento"
                    type="date"
                    className="ds-input ds-mono"
                  />
                  {state.field_errors?.data_pagamento ? (
                    <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                      {state.field_errors.data_pagamento[0]}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="comprovante_transacao" className="ds-label">
                  Comprovante / ID da transação
                </label>
                <input
                  id="comprovante_transacao"
                  name="comprovante_transacao"
                  className="ds-input ds-mono"
                  placeholder="Hash PIX, TED ou identificador interno"
                />
                {state.field_errors?.comprovante_transacao ? (
                  <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                    {state.field_errors.comprovante_transacao[0]}
                  </p>
                ) : null}
              </div>

              {state.status === 'error' && state.message ? (
                <div className="rounded-xl border border-[rgba(255,77,106,.3)] bg-[rgba(255,77,106,.07)] px-3 py-2 text-sm text-[var(--color-ds-error)]">
                  {state.message}
                </div>
              ) : null}

              {state.status === 'success' && state.message ? (
                <div className="rounded-xl border border-[rgba(0,214,143,.3)] bg-[rgba(0,214,143,.07)] px-3 py-2 text-sm text-[var(--color-ds-success)]">
                  {state.message}
                </div>
              ) : null}

              {state.status === 'compliance_violation' && state.violation ? (
                <div className="rounded-xl border border-[rgba(255,180,0,.3)] bg-[rgba(255,180,0,.07)] px-3 py-3 text-sm text-[var(--color-ds-warning)]">
                  <p className="font-medium">Bloqueio preventivo de compliance</p>
                  <p className="mt-1">Rubrica: {state.violation.rubrica}</p>
                  <p>Categoria: {state.violation.categoria}</p>
                  <p>Valor tentado: {currency.format(state.violation.valor_tentado)}</p>
                  <p>
                    Executado atual:{' '}
                    {currency.format(state.violation.valor_executado_atual)}
                  </p>
                  <p>Teto legal: {currency.format(state.violation.teto_legal)}</p>
                  <p className="mt-1 text-xs text-[var(--color-ds-text-muted)]">
                    {state.violation.referencia_legal}
                  </p>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ds-btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="ds-btn-primary"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BadgeDollarSign className="h-4 w-4" />
                  )}
                  Registrar despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}