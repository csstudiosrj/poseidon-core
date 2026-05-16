"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, FolderPlus, Loader2, Info } from "lucide-react";
import type { ActionState } from "@/app/actions/setupProjeto";

const initialState: ActionState = { status: "idle" };

type SetupProjetoFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const MECANISMOS = [
  { value: "", label: "Selecione o mecanismo..." },
  { value: "incentivo_fiscal", label: "Lei Rouanet — Mecenato (Incentivo Fiscal)" },
  { value: "fundo",           label: "Lei Rouanet — FNC (Fundo Nacional)" },
  { value: "pnab",            label: "Política Nacional Aldir Blanc (PNAB)" },
] as const;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SetupProjetoForm({ action }: SetupProjetoFormProps) {
  const router  = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [orcamento, setOrcamento] = useState<number>(0);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo, state.status]);

  const adm       = orcamento * 0.15;
  const captacao  = Math.min(orcamento * 0.10, 150_000);
  const divulgacao = orcamento * 0.20;
  const showPreview = orcamento > 0;

  return (
    <form action={formAction} className="space-y-8">

      {/* ── Bloco 1: Identificação ─────────────────────────────────── */}
      <fieldset className="space-y-6">
        <legend className="ds-label mb-2 text-xs tracking-widest uppercase opacity-60">
          Identificação
        </legend>

        {/* Nome do projeto */}
        <div>
          <label htmlFor="nome_projeto" className="ds-label">
            Nome do projeto
          </label>
          <input
            id="nome_projeto"
            name="nome_projeto"
            placeholder="Ex.: Circuito Atlântico de Arte Viva"
            className="ds-input mt-1"
            autoComplete="off"
          />
          {state.fieldErrors?.nome_projeto?.[0] && (
            <p className="mt-2 text-xs text-[var(--color-ds-error)]">
              {state.fieldErrors.nome_projeto[0]}
            </p>
          )}
        </div>

        {/* Grid 2 colunas: Segmento + Mecanismo */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Segmento cultural */}
          <div>
            <label htmlFor="segmento_cultural" className="ds-label">
              Segmento cultural
            </label>
            <input
              id="segmento_cultural"
              name="segmento_cultural"
              placeholder="Teatro, Música, Circo, Artes Visuais…"
              className="ds-input mt-1"
              autoComplete="off"
            />
            {state.fieldErrors?.segmento_cultural?.[0] && (
              <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                {state.fieldErrors.segmento_cultural[0]}
              </p>
            )}
          </div>

          {/* Mecanismo — dropdown */}
          <div>
            <label htmlFor="mecanismo" className="ds-label">
              Mecanismo de fomento
            </label>
            <select
              id="mecanismo"
              name="mecanismo"
              defaultValue=""
              className="ds-input mt-1"
            >
              {MECANISMOS.map(({ value, label }) => (
                <option key={value} value={value} disabled={value === ""}>
                  {label}
                </option>
              ))}
            </select>
            {state.fieldErrors?.mecanismo?.[0] && (
              <p className="mt-2 text-xs text-[var(--color-ds-error)]">
                {state.fieldErrors.mecanismo[0]}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Bloco 2: Orçamento + Preview ──────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="ds-label mb-2 text-xs tracking-widest uppercase opacity-60">
          Orçamento
        </legend>

        <div>
          <label htmlFor="orcamento_total_aprovado" className="ds-label">
            Orçamento total aprovado
          </label>
          <input
            id="orcamento_total_aprovado"
            name="orcamento_total_aprovado"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            className="ds-input ds-mono mt-1"
            onChange={(e) => setOrcamento(parseFloat(e.target.value) || 0)}
          />
          {state.fieldErrors?.orcamento_total_aprovado?.[0] && (
            <p className="mt-2 text-xs text-[var(--color-ds-error)]">
              {state.fieldErrors.orcamento_total_aprovado[0]}
            </p>
          )}
        </div>

        {/* Preview de rubricas automáticas */}
        <div
          className={`ds-card overflow-hidden transition-all duration-300 ${
            showPreview ? "max-h-80 opacity-100" : "max-h-0 opacity-0 !p-0 !border-0"
          }`}
          aria-live="polite"
        >
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-[var(--color-ds-cyan)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ds-cyan)]">
              Rubricas geradas automaticamente (IN MinC 29/2026)
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <RubricaItem
              label="Administração"
              percentual="15%"
              valor={adm}
            />
            <RubricaItem
              label="Captação"
              percentual="10% · teto R$ 150 mil"
              valor={captacao}
            />
            <RubricaItem
              label="Divulgação / Acessibilidade"
              percentual="20%"
              valor={divulgacao}
            />
          </div>
        </div>
      </fieldset>

      {/* ── Feedback de estado ────────────────────────────────────── */}
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

      {/* ── Ação ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end pt-2">
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

/* ─── Sub-componente: cartão de rubrica ─────────────────────────── */
type RubricaItemProps = {
  label: string;
  percentual: string;
  valor: number;
};

function RubricaItem({ label, percentual, valor }: RubricaItemProps) {
  return (
    <div className="rounded-xl border border-[var(--color-ds-border)] bg-[var(--color-ds-surface-2)] px-4 py-3">
      <p className="text-xs font-semibold text-[var(--color-ds-cyan)]">{label}</p>
      <p className="mt-0.5 text-[10px] text-[var(--color-ds-text-muted)]">{percentual}</p>
      <p className="ds-mono mt-2 text-base font-bold text-[var(--color-ds-text)]">
        {formatBRL(valor)}
      </p>
    </div>
  );
}