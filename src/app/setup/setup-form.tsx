"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, FolderPlus, Loader2 } from "lucide-react";
import type { ActionState } from "@/app/actions/setupProjeto";

const initialState: ActionState = { status: "idle" };

type SetupProjetoFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export default function SetupProjetoForm({ action }: SetupProjetoFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo, state.status]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="nome" className="ds-label">Nome do projeto</label>
          <input
            id="nome"
            name="nome"
            placeholder="Ex.: Circuito Atlântico de Arte Viva"
            className="ds-input"
          />
          {state.fieldErrors?.nome?.[0] ? <p className="mt-2 text-xs text-[var(--color-ds-error)]">{state.fieldErrors.nome[0]}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="orcamento_total" className="ds-label">Orçamento total aprovado</label>
          <input
            id="orcamento_total"
            name="orcamento_total"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            className="ds-input ds-mono"
          />
          {state.fieldErrors?.orcamento_total?.[0] ? <p className="mt-2 text-xs text-[var(--color-ds-error)]">{state.fieldErrors.orcamento_total[0]}</p> : null}
        </div>
      </div>

      <div className="ds-card p-4">
        <div className="grid gap-3 text-sm text-[var(--color-ds-text-muted)] md:grid-cols-3">
          <div>
            <p className="font-medium text-[var(--color-ds-cyan)]">Administração</p>
            <p className="mt-1 text-xs">15% do orçamento total.</p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-ds-cyan)]">Captação</p>
            <p className="mt-1 text-xs">10% do orçamento, limitado a R$ 150.000.</p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-ds-cyan)]">Divulgação/Acessibilidade</p>
            <p className="mt-1 text-xs">20% do orçamento total.</p>
          </div>
        </div>
      </div>

      {state.message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-[rgba(0,214,143,.3)] bg-[rgba(0,214,143,.07)] text-[var(--color-ds-success)]"
              : "border-[rgba(255,77,106,.3)] bg-[rgba(255,77,106,.07)] text-[var(--color-ds-error)]"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button type="submit" disabled={isPending} className="ds-btn-primary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
          {isPending ? "Configurando..." : "Criar projeto e continuar"}
          {!isPending ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
    </form>
  );
}