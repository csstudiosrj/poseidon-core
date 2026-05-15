"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  FolderPlus,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import type { ActionState } from "@/app/actions/setupProjeto";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const SEGMENTOS = [
  "Teatro",
  "Música",
  "Dança",
  "Audiovisual",
  "Artes Visuais",
  "Literatura",
  "Circo",
  "Ópera",
  "Patrimônio Cultural",
  "Humanidades",
  "Outro",
];

const MECANISMOS: { value: string; label: string }[] = [
  { value: "incentivo_fiscal", label: "Lei Rouanet — Mecenato (Incentivo Fiscal)" },
  { value: "fundo", label: "Lei Rouanet — FNC (Fundo Nacional)" },
  { value: "pnab", label: "PNAB — Política Nacional Aldir Blanc" },
];

export default function SetupProjetoForm({ action }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo, state.status]);

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-2xl border ${hasError ? "border-red-500" : "border-cyan-500/20"} bg-[#020b18] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400`;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Nome do Projeto */}
        <div className="md:col-span-2">
          <label htmlFor="nome_projeto" className="mb-2 block text-sm font-medium text-cyan-400">
            Nome do projeto <span className="text-red-400">*</span>
          </label>
          <input
            id="nome_projeto"
            name="nome_projeto"
            placeholder="Ex.: Circuito Atlântico de Arte Viva 2026"
            className={fieldClass(!!state.fieldErrors?.nome_projeto)}
          />
          {state.fieldErrors?.nome_projeto?.[0] && (
            <p className="mt-1.5 text-xs text-red-400">{state.fieldErrors.nome_projeto[0]}</p>
          )}
        </div>

        {/* Segmento Cultural */}
        <div>
          <label htmlFor="segmento_cultural" className="mb-2 block text-sm font-medium text-cyan-400">
            Segmento cultural <span className="text-red-400">*</span>
          </label>
          <select
            id="segmento_cultural"
            name="segmento_cultural"
            className={fieldClass(!!state.fieldErrors?.segmento_cultural)}
            defaultValue=""
          >
            <option value="" disabled>
              Selecione…
            </option>
            {SEGMENTOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {state.fieldErrors?.segmento_cultural?.[0] && (
            <p className="mt-1.5 text-xs text-red-400">{state.fieldErrors.segmento_cultural[0]}</p>
          )}
        </div>

        {/* Mecanismo */}
        <div>
          <label htmlFor="mecanismo" className="mb-2 block text-sm font-medium text-cyan-400">
            Mecanismo de financiamento <span className="text-red-400">*</span>
          </label>
          <select
            id="mecanismo"
            name="mecanismo"
            defaultValue="incentivo_fiscal"
            className={fieldClass(!!state.fieldErrors?.mecanismo)}
          >
            {MECANISMOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.mecanismo?.[0] && (
            <p className="mt-1.5 text-xs text-red-400">{state.fieldErrors.mecanismo[0]}</p>
          )}
        </div>

        {/* Orçamento Total */}
        <div className="md:col-span-2">
          <label htmlFor="orcamento_total_aprovado" className="mb-2 block text-sm font-medium text-cyan-400">
            Orçamento total aprovado (R$) <span className="text-red-400">*</span>
          </label>
          <input
            id="orcamento_total_aprovado"
            name="orcamento_total_aprovado"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className={fieldClass(!!state.fieldErrors?.orcamento_total_aprovado)}
          />
          {state.fieldErrors?.orcamento_total_aprovado?.[0] && (
            <p className="mt-1.5 text-xs text-red-400">{state.fieldErrors.orcamento_total_aprovado[0]}</p>
          )}
        </div>
      </div>

      {/* Rubricas auto-geradas */}
      <div className="rounded-2xl border border-cyan-500/10 bg-[#020b18] p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-500/70">
          Rubricas criadas automaticamente — IN 29/2026
        </p>
        <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="font-semibold text-cyan-400">Administração</p>
            <p className="mt-1 text-xs text-slate-400">15% do orçamento total</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="font-semibold text-cyan-400">Captação de Recursos</p>
            <p className="mt-1 text-xs text-slate-400">10% do orçamento · máx. R$ 150.000</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="font-semibold text-cyan-400">Divulgação/Acessibilidade</p>
            <p className="mt-1 text-xs text-slate-400">Teto combinado de 20% do orçamento</p>
          </div>
        </div>
      </div>

      {/* Feedback da action */}
      {state.message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#020b18] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="h-4 w-4" />
          )}
          {isPending ? "Criando…" : "Criar projeto"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}