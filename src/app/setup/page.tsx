"use client";

import { useActionState, useState } from "react";
import { setupProjeto } from "@/app/actions/setupProjeto";

type SetupState =
  | { status: "success"; projetoId: string }
  | { status: "error"; message: string }
  | null;

/* ============================================================
   Preview das rubricas calculadas em tempo real
   ============================================================ */
function PreviewRubricas({ orcamento }: { orcamento: number }) {
  if (!orcamento || orcamento <= 0) return null;

  const administracao = orcamento * 0.15;
  const captacao      = Math.min(orcamento * 0.10, 150_000);
  const divulgacao    = orcamento * 0.20;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-2">
      <p className="ds-label">Rubricas geradas automaticamente (IN 29/2026)</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="ds-card" style={{ padding: "12px" }}>
          <p className="text-[var(--color-ds-text-muted)] text-xs mb-1">
            Administracao
          </p>
          <p className="text-[var(--color-ds-text)] font-bold text-sm">
            {fmt(administracao)}
          </p>
          <p className="text-[var(--color-ds-text-muted)] text-xs mt-1">
            15% do orcamento
          </p>
        </div>
        <div className="ds-card" style={{ padding: "12px" }}>
          <p className="text-[var(--color-ds-text-muted)] text-xs mb-1">
            Captacao
          </p>
          <p className="text-[var(--color-ds-cyan)] font-bold text-sm">
            {fmt(captacao)}
          </p>
          <p className="text-[var(--color-ds-text-muted)] text-xs mt-1">
            10%, limite R$ 150k
          </p>
        </div>
        <div className="ds-card" style={{ padding: "12px" }}>
          <p className="text-[var(--color-ds-text-muted)] text-xs mb-1">
            Divulgacao
          </p>
          <p className="text-[var(--color-ds-text)] font-bold text-sm">
            {fmt(divulgacao)}
          </p>
          <p className="text-[var(--color-ds-text-muted)] text-xs mt-1">
            20% do orcamento
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Campo de orcamento com preview reativo
   Componente separado para isolar o estado local do input
   ============================================================ */
function OrcamentoField({ isPending }: { isPending: boolean }) {
  const [raw, setRaw] = useState("");

  const parsed   = parseFloat(raw.replace(",", "."));
  const orcamento = isNaN(parsed) ? 0 : parsed;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="orcamento_total_aprovado" className="ds-label">
          Orcamento Total Aprovado (R$)
        </label>
        <input
          id="orcamento_total_aprovado"
          name="orcamento_total_aprovado"
          type="number"
          min="0"
          step="0.01"
          className="ds-input"
          placeholder="0,00"
          disabled={isPending}
          required
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
      </div>

      <PreviewRubricas orcamento={orcamento} />
    </div>
  );
}

/* ============================================================
   Pagina principal
   ============================================================ */
export default function SetupPage() {
  const [state, dispatch, isPending] = useActionState<SetupState, FormData>(
    setupProjeto,
    null
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">

        {/* Cabecalho */}
        <div className="text-center space-y-2">
          <span className="ds-badge">POSEIDON &middot; DEEP SEA SETUP</span>
          <h1 className="text-3xl font-extrabold text-[var(--color-ds-text)] mt-3">
            Novo Projeto Cultural
          </h1>
          <p className="text-[var(--color-ds-text-muted)] text-sm max-w-md mx-auto">
            Cadastre o projeto e as rubricas de{" "}
            <span className="text-[var(--color-ds-cyan)]">Administracao</span>
            {", "}
            <span className="text-[var(--color-ds-cyan)]">Captacao</span> e{" "}
            <span className="text-[var(--color-ds-cyan)]">
              Divulgacao/Acessibilidade
            </span>{" "}
            serao criadas automaticamente com os valores-teto da{" "}
            <strong className="text-[var(--color-ds-text)]">
              IN MinC 29/2026
            </strong>
            .
          </p>
        </div>

        {/* Formulario */}
        <form action={dispatch} className="ds-card-glow space-y-6">

          {/* Nome do projeto */}
          <div>
            <label htmlFor="nome_projeto" className="ds-label">
              Nome do Projeto
            </label>
            <input
              id="nome_projeto"
              name="nome_projeto"
              type="text"
              className="ds-input"
              placeholder="Ex.: Circuito Atlantico de Arte Viva"
              disabled={isPending}
              required
            />
          </div>

          {/* Orcamento com preview reativo */}
          <OrcamentoField isPending={isPending} />

          {/* Segmento + Mecanismo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="segmento_cultural" className="ds-label">
                Segmento Cultural
              </label>
              <input
                id="segmento_cultural"
                name="segmento_cultural"
                type="text"
                className="ds-input"
                placeholder="Ex.: Artes integradas"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <label htmlFor="mecanismo" className="ds-label">
                Mecanismo
              </label>
              <input
                id="mecanismo"
                name="mecanismo"
                type="text"
                className="ds-input"
                placeholder="Ex.: FIA / Fomento direto"
                disabled={isPending}
                required
              />
            </div>
          </div>

          {/* Erro */}
          {state?.status === "error" && (
            <div
              className="ds-error"
              style={{
                background: "rgba(255,83,112,0.08)",
                border: "1px solid rgba(255,83,112,0.25)",
                borderRadius: "6px",
                padding: "10px 14px",
              }}
            >
              {state.message}
            </div>
          )}

          {/* Botao */}
          <button
            type="submit"
            className="ds-btn-primary"
            disabled={isPending}
          >
            {isPending ? "Criando projeto..." : "Criar projeto e continuar"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-ds-text-muted)]">
          Poseidon &middot; Auditoria Cultural &middot; Lei Rouanet
        </p>
      </div>
    </main>
  );
}