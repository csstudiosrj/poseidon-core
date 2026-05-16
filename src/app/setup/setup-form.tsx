"use client";

import { useActionState, useEffect, useState } from "react";
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
  { value: "fundo", label: "Lei Rouanet — FNC (Fundo Nacional da Cultura)" },
  { value: "pnab", label: "Política Nacional Aldir Blanc (PNAB)" },
] as const;

const SEGMENTOS = [
  { value: "artes_cenicas", label: "Artes Cênicas" },
  { value: "musica", label: "Música" },
  { value: "artes_visuais", label: "Artes Visuais" },
  { value: "audiovisual", label: "Cinema e Audiovisual" },
  { value: "fotografia", label: "Fotografia" },
  { value: "artesanato", label: "Artesanato" },
  { value: "design_moda", label: "Design e Moda" },
  { value: "literatura", label: "Literatura" },
  { value: "patrimonio", label: "Patrimônio Cultural e Museologia" },
  { value: "artes_integradas", label: "Artes Integradas" },
] as const;

/* ── Máscara e formatação ─────────────────────────────────────── */
function digitsToDisplay(digits: string): string {
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

  // Máscara do orçamento
  const [rawDigits, setRawDigits] = useState("");
  const [displayValue, setDisplayValue] = useState("");

  // Controle visual dos selects
  const [mecanismo, setMecanismo] = useState("");
  const [segmento, setSegmento] = useState("");

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo, state.status]);

  function handleOrcamentoInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "") || "";
    setRawDigits(digits);
    setDisplayValue(digitsToDisplay(digits));
  }

  const orcamentoNum = digitsToNumber(rawDigits);
  const adm = orcamentoNum * 0.15;
  const captacao = Math.min(orcamentoNum * 0.1, 150_000);
  const divulgacao = orcamentoNum * 0.2;
  const showPreview = orcamentoNum > 0;

  const selectColor = (val: string) =>
    val === "" ? "var(--color-text-faint)" : "var(--color-text-primary)";

  return (
    <form action={formAction} className="space-y-10">
      {/* Seção 1: Identificação */}
      <section>
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">
            Identificação do Projeto
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                autoComplete="off"
              />
            </Field>
          </div>

          <Field
            id="segmento_cultural"
            label="Segmento cultural"
            error={state.fieldErrors?.segmento_cultural?.[0]}
          >
            <select
              id="segmento_cultural"
              name="segmento_cultural"
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400/40"
              style={{ color: selectColor(segmento) }}
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
            >
              <option value="" disabled style={{ color: "var(--color-text-faint)" }}>
                Selecione um segmento…
              </option>
              {SEGMENTOS.map(({ value, label }) => (
                <option key={value} value={value} style={{ color: "var(--color-text-primary)" }}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="mecanismo"
            label="Mecanismo de fomento"
            error={state.fieldErrors?.mecanismo?.[0]}
          >
            <select
              id="mecanismo"
              name="mecanismo"
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400/40"
              style={{ color: selectColor(mecanismo) }}
              value={mecanismo}
              onChange={(e) => setMecanismo(e.target.value)}
            >
              <option value="" disabled style={{ color: "var(--color-text-faint)" }}>
                Selecione o mecanismo…
              </option>
              {MECANISMOS.map(({ value, label }) => (
                <option key={value} value={value} style={{ color: "var(--color-text-primary)" }}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Seção 2: Orçamento */}
      <section>
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">
            Orçamento
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-6 space-y-6">
          <Field
            id="orcamento_total"
            label="Valor total do projeto"
            error={state.fieldErrors?.orcamento_total_aprovado?.[0]}
          >
            <input type="hidden" name="orcamento_total_aprovado" value={orcamentoNum} />
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-mono text-sm text-slate-400">
                R$
              </span>
              <input
                id="orcamento_total"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={displayValue}
                onChange={handleOrcamentoInput}
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-3 text-sm text-white tabular-nums placeholder:text-slate-500 focus:border-cyan-400/40 outline-none"
                autoComplete="off"
              />
            </div>
          </Field>

          {/* Preview de rubricas */}
          <div
            aria-live="polite"
            className={`overflow-hidden transition-all duration-300 ${
              showPreview ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-500/5 p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-400">
                Rubricas geradas automaticamente · IN MinC 29/2026
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <RubricaCard label="Administração" percent="15%" valor={adm} />
                <RubricaCard label="Captação" percent="10% · teto R$ 150 mil" valor={captacao} />
                <RubricaCard label="Divulgação / Acessibilidade" percent="20%" valor={divulgacao} />
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
            state.status === "success"
              ? "border-emerald-400/20 bg-emerald-500/5 text-emerald-400"
              : "border-red-400/20 bg-red-500/5 text-red-400"
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
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="h-4 w-4" />
          )}
          {isPending ? "Configurando…" : "Criar projeto e continuar"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}

/* ── Subcomponentes ────────────────────────────────────────────── */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function RubricaCard({
  label,
  percent,
  valor,
}: {
  label: string;
  percent: string;
  valor: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-semibold text-cyan-400">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{percent}</p>
      <p className="mt-2 text-lg font-semibold tabular-nums text-white">
        {formatBRL(valor)}
      </p>
    </div>
  );
}