'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowRight, FolderPlus, Loader2 } from 'lucide-react'
import type { ActionState } from '@/app/actions/setupProjeto'

const initialState: ActionState = { status: 'idle' }

type SetupProjetoFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

// Opções de mecanismo e segmento
const MECANISMOS = [
  { value: 'incentivo_fiscal', label: 'Lei Rouanet – Mecenato (Incentivo Fiscal)' },
  { value: 'fundo', label: 'Lei Rouanet – FNC (Fundo Nacional da Cultura)' },
  { value: 'pnab', label: 'Política Nacional Aldir Blanc (PNAB)' },
] as const

const SEGMENTOS = [
  { value: 'artes_cenicas', label: 'Artes Cênicas' },
  { value: 'musica', label: 'Música' },
  { value: 'artes_visuais', label: 'Artes Visuais' },
  { value: 'audiovisual', label: 'Cinema e Audiovisual' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'artesanato', label: 'Artesanato' },
  { value: 'design_moda', label: 'Design e Moda' },
  { value: 'literatura', label: 'Literatura' },
  { value: 'patrimonio', label: 'Patrimônio Cultural e Museologia' },
  { value: 'artes_integradas', label: 'Artes Integradas' },
] as const

// Helpers de máscara e formatação
function digitsToDisplay(digits: string): string {
  if (!digits) return ''
  const num = parseInt(digits, 10) / 100
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function digitsToNumber(digits: string): number {
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function SetupProjetoForm({ action }: SetupProjetoFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(action, initialState)

  // Máscara do orçamento
  const [rawDigits, setRawDigits] = useState('')
  const [displayValue, setDisplayValue] = useState('')

  // Estados visuais dos selects
  const [mecanismo, setMecanismo] = useState('')
  const [segmento, setSegmento] = useState('')

  // Redireciona no sucesso
  useEffect(() => {
    if (state.status === 'success' && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [router, state.redirectTo, state.status])

  // Máscara: apenas dígitos, formata em tempo real
  function handleOrcamentoInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+/, '') || ''
    setRawDigits(digits)
    setDisplayValue(digitsToDisplay(digits))
  }

  const orcamentoNum = digitsToNumber(rawDigits)
  const adm = orcamentoNum * 0.15
  const captacao = Math.min(orcamentoNum * 0.1, 150_000)
  const divulgacao = orcamentoNum * 0.2
  const showPreview = orcamentoNum > 0

  // Cor condicional dos selects
  const selectColor = (val: string) =>
    val === '' ? 'var(--color-ds-text-muted)' : 'var(--color-ds-text)'

  return (
    <form action={formAction} className="space-y-10">
      {/* Seção: Identificação */}
      <section>
        <SectionTitle>Identificação do Projeto</SectionTitle>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nome do projeto ocupa as duas colunas */}
          <div className="md:col-span-2">
            <Field
              id="nome_projeto"
              label="Nome do projeto"
              error={state.fieldErrors?.nome_projeto?.[0]}
            >
              <input
                id="nome_projeto"
                name="nome_projeto"
                placeholder="Ex.: Circuito Atlântico de Arte Viva"
                className="ds-input"
                autoComplete="off"
              />
            </Field>
          </div>

          {/* Segmento cultural */}
          <Field
            id="segmento_cultural"
            label="Segmento cultural"
            error={state.fieldErrors?.segmento_cultural?.[0]}
          >
            <select
              id="segmento_cultural"
              name="segmento_cultural"
              className="ds-input"
              value={segmento}
              style={{ color: selectColor(segmento) }}
              onChange={(e) => setSegmento(e.target.value)}
            >
              <option value="" disabled style={{ color: 'var(--color-ds-text-muted)' }}>
                Selecione um segmento…
              </option>
              {SEGMENTOS.map(({ value, label }) => (
                <option key={value} value={value} style={{ color: 'var(--color-ds-text)' }}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          {/* Mecanismo */}
          <Field
            id="mecanismo"
            label="Mecanismo de fomento"
            error={state.fieldErrors?.mecanismo?.[0]}
          >
            <select
              id="mecanismo"
              name="mecanismo"
              className="ds-input"
              value={mecanismo}
              style={{ color: selectColor(mecanismo) }}
              onChange={(e) => setMecanismo(e.target.value)}
            >
              <option value="" disabled style={{ color: 'var(--color-ds-text-muted)' }}>
                Selecione o mecanismo…
              </option>
              {MECANISMOS.map(({ value, label }) => (
                <option key={value} value={value} style={{ color: 'var(--color-ds-text)' }}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Seção: Orçamento */}
      <section>
        <SectionTitle>Orçamento</SectionTitle>

        <div className="mt-6 space-y-6">
          {/* Campo com máscara */}
          <Field
            id="orcamento_total"
            label="Valor total do projeto"
            error={state.fieldErrors?.orcamento_total_aprovado?.[0]}
          >
            <input type="hidden" name="orcamento_total_aprovado" value={orcamentoNum} />
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-mono text-sm text-[var(--color-ds-text-muted)]">
                R$
              </span>
              <input
                id="orcamento_total"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={displayValue}
                onChange={handleOrcamentoInput}
                className="ds-input ds-mono pl-10"
                autoComplete="off"
              />
            </div>
          </Field>

          {/* Preview de blindagem automática */}
          <div
            aria-live="polite"
            className={`overflow-hidden transition-all duration-300 ${
              showPreview ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="rounded-2xl border border-[var(--color-ds-cyan)]/15 bg-[var(--color-ds-cyan)]/5 p-5 backdrop-blur-sm">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-ds-cyan)]">
                Rubricas geradas automaticamente · IN MinC 29/2026
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <RubricaCard
                  label="Administração"
                  percent="15%"
                  valor={adm}
                />
                <RubricaCard
                  label="Captação"
                  percent="10% · teto R$ 150 mil"
                  valor={captacao}
                />
                <RubricaCard
                  label="Divulgação / Acessibilidade"
                  percent="20%"
                  valor={divulgacao}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback de estado */}
      {state.message && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            state.status === 'success'
              ? 'border-[rgba(0,214,143,.3)] bg-[rgba(0,214,143,.07)] text-[var(--color-ds-success)]'
              : 'border-[rgba(255,77,106,.3)] bg-[rgba(255,77,106,.07)] text-[var(--color-ds-error)]'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      {/* Botão de envio */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ds-cyan)] px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[var(--color-ds-cyan)]/20 transition-all hover:bg-[var(--color-ds-cyan)]/90 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="h-4 w-4" />
          )}
          {isPending ? 'Configurando…' : 'Criar projeto e continuar'}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  )
}

/* ── Subcomponentes ─────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ds-cyan)]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="ds-label text-white/80">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-[var(--color-ds-error)] mt-1">{error}</p>}
    </div>
  )
}

function RubricaCard({
  label,
  percent,
  valor,
}: {
  label: string
  percent: string
  valor: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-semibold text-[var(--color-ds-cyan)]">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-[var(--color-ds-text-muted)]">
        {percent}
      </p>
      <p className="ds-mono mt-2 text-lg font-bold text-white">
        {formatBRL(valor)}
      </p>
    </div>
  )
}