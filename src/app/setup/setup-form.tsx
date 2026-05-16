"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, FolderPlus, Loader2 } from "lucide-react";
import type { ActionState } from "@/app/actions/setupProjeto";

const initialState: ActionState = { status: "idle" };

type SetupProjetoFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

/* ── Opções dos selects ─────────────────────────────────────────── */

const MECANISMOS = [
  { value: "incentivo_fiscal", label: "Lei Rouanet — Mecenato (Incentivo Fiscal)" },
  { value: "fundo",            label: "Lei Rouanet — FNC (Fundo Nacional da Cultura)" },
  { value: "pnab",             label: "Política Nacional Aldir Blanc (PNAB)" },
] as const;

const SEGMENTOS = [
  { value: "artes_cenicas",     label: "Artes Cênicas (Teatro, Dança, Circo, Ópera)" },
  { value: "musica",            label: "Música" },
  { value: "artes_visuais",     label: "Artes Visuais" },
  { value: "audiovisual",       label: "Cinema e Audiovisual" },
  { value: "fotografia",        label: "Fotografia" },
  { value: "artesanato",        label: "Artesanato" },
  { value: "design_moda",       label: "Design e Moda" },
  { value: "literatura",        label: "Literatura, Humanidades e Informação" },
  { value: "patrimonio",        label: "Patrimônio Cultural e Museologia" },
  { value: "artes_integradas",  label: "Artes Integradas" },
] as const;

/* ── Formatação de moeda ────────────────────────────────────────── */

/** Converte string de dígitos ("150000") em valor BRL exibível ("150.000,00") */
function digitsToDisplay(digits: string): string {
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Valor numérico bruto para cálculo e hidden input */
function digitsToNumber(digits: string): number {
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ── Componente principal ───────────────────────────────────────── */

export default function SetupProjetoForm({ action }: SetupProjetoFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);

  // Máscara de orçamento
  const [rawDigits, setRawDigits]       = useState("");
  const [displayValue, setDisplayValue] = useState("");

  // Controle dos selects (para cor do placeholder)
  const [mecanismo, setMecanismo]   = useState("");
  const [segmento,  setSegmento]    = useState("");

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo, state.status]);

  /* Máscara: aceita só dígitos, formata em tempo real */
  function handleOrcamentoInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "") || "";
    setRawDigits(digits);
    setDisplayValue(digitsToDisplay(digits));
  }

  const orcamentoNum = digitsToNumber(rawDigits);
  const adm          = orcamentoNum * 0.15;
  const captacao     = Math.min(orcamentoNum * 0.10, 150_000);
  const divulgacao   = orcamentoNum * 0.20;
  const showPreview  = orcamentoNum > 0;

  /* Cor do select: muted se nada selecionado, normal caso contrário */
  const selectColor = (val: string) =>
    val === "" ? "var(--color-ds-text-muted)" : "var(--color-ds-text)";

  return (
    <form action={formAction} className="space-y-10">

      {/* ── Seção 1: Identificação ──────────────────────────────── */}
      <section className="space-y-6">
        <SectionTitle>Identificação</SectionTitle>

        {/* Nome do projeto */}
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

        {/* Grid 2 colunas: Segmento + Mecanismo */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Segmento cultural — dropdown */}
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
              <option value="" disabled style={{ color: "var(--color-ds-text-muted)" }}>
                Selecione o segmento…
              </option>
              {SEGMENTOS.map(({ value, label }) => (
                <option key={value} value={value} style={{ color: "var(--color-ds-text)" }}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          {/* Mecanismo — dropdown */}
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
              <option value="" disabled style={{ color: "var(--color-ds-text-muted)" }}>
                Selecione o mecanismo…
              </option>
              {MECANISMOS.map(({ value, label }) => (
                <option key={value} value={value} style={{ color: "var(--color-ds-text)" }}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* ── Seção 2: Orçamento ─────────────────────────────────── */}
      <section className="space-y-6">
        <SectionTitle>Orçamento</SectionTitle>

        {/* Campo de orçamento com máscara */}
        <Field
          id="orcamento_total"
          label="Valor total do projeto"
          error={state.fieldErrors?.orcamento_total_aprovado?.[0]}
        >
          {/* Hidden input com o valor numérico bruto para o server action */}
          <input
            type="hidden"
            name="orcamento_total_aprovado"
            value={orcamentoNum}
          />
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

        {/* Preview de rubricas — aparece só ao digitar */}
        <div
          aria-live="polite"
          className={`overflow-hidden transition-all duration-300 ${
            showPreview ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-[var(--color-ds-border)] bg-[var(--color-ds-surface-2)] p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[var(--color-ds-cyan)]">
              Rubricas geradas automaticamente · IN MinC 29/2026
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <RubricaCard label="Administração"             percent="15%"                  valor={adm} />
              <RubricaCard label="Captação"                  percent="10% · teto R$ 150 mil" valor={captacao} />
              <RubricaCard label="Divulgação/Acessibilidade" percent="20%"                  valor={divulgacao} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feedback de estado ──────────────────────────────────── */}
      {state.message && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-[rgba(0,214,143,.3)] bg-[rgba(0,214,143,.07)] text-[var(--color-ds-success)]"
              : "border-[rgba(255,77,106,.3)] bg-[rgba(255,77,106,.07)] text-[var(--color-ds-error)]"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      {/* ── Ação ────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending} className="ds-btn-primary">
          {isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <FolderPlus className="h-4 w-4" />}
          {isPending ? "Configurando…" : "Criar projeto e continuar"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}

/* ── Sub-componentes ────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ds-text-muted)]">
        {children}
      </p>
      <div className="h-px flex-1 bg-[var(--color-ds-border)]" />
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="ds-label">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-ds-error)]">{error}</p>
      )}
    </div>
  );
}

type RubricaCardProps = {
  label: string;
  percent: string;
  valor: number;
};

function RubricaCard({ label, percent, valor }: RubricaCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-ds-border)] bg-[var(--color-ds-surface)] px-4 py-3">
      <p className="text-xs font-semibold text-[var(--color-ds-cyan)]">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-[var(--color-ds-text-muted)]">{percent}</p>
      <p className="ds-mono mt-2 text-lg font-bold text-[var(--color-ds-text)]">
        {formatBRL(valor)}
      </p>
    </div>
  );
}