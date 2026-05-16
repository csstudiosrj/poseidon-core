"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function SetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="text-[var(--color-ds-text-muted)] animate-pulse">
          Carregando…
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <span className="ds-badge">IN 29/2026</span>
          <h1 className="text-3xl font-extrabold text-[var(--color-ds-text)] mt-3">
            Bem-vindo ao{" "}
            <span className="text-[var(--color-ds-cyan)]">Poseidon</span>
          </h1>
          <p className="text-[var(--color-ds-text-muted)] text-sm">
            Configure seu perfil para começar as auditorias culturais.
          </p>
        </div>

        {/* Card de perfil */}
        <div className="ds-card-glow space-y-6">
          <div>
            <p className="ds-label">E-mail autenticado</p>
            <p className="text-[var(--color-ds-text)] font-medium">
              {user?.email}
            </p>
          </div>

          <hr className="ds-divider" />

          {/* Seleção de tipo de proponente */}
          <div>
            <p className="ds-label mb-3">Tipo de Proponente</p>
            <div className="grid grid-cols-3 gap-3">
              {(["PF", "MEI", "PJ"] as const).map((tipo) => (
                <TipoCard key={tipo} tipo={tipo} />
              ))}
            </div>
          </div>

          <hr className="ds-divider" />

          {/* Próximos passos */}
          <div className="space-y-3">
            <p className="ds-label">Próximos Passos</p>
            <StepItem
              number={1}
              title="Completar Perfil"
              description="Preencha seus dados de proponente"
            />
            <StepItem
              number={2}
              title="Criar Projeto"
              description="Cadastre seu projeto cultural (Lei Rouanet)"
            />
            <StepItem
              number={3}
              title="Iniciar Auditoria"
              description="Acompanhe a conformidade com a IN 29/2026"
            />
          </div>

          <button
            className="ds-btn-primary"
            disabled={isPending}
            onClick={() =>
              startTransition(() => router.push("/dashboard"))
            }
          >
            {isPending ? "Acessando…" : "Ir para o Dashboard →"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-ds-text-muted)]">
          Poseidon · Auditoria Cultural · Lei Rouanet
        </p>
      </div>
    </main>
  );
}

/* ---- Sub-componentes ---- */

function TipoCard({ tipo }: { tipo: "PF" | "MEI" | "PJ" }) {
  const labels: Record<string, string> = {
    PF: "Pessoa Física",
    MEI: "MEI",
    PJ: "Pessoa Jurídica",
  };

  return (
    <div
      className="ds-card text-center cursor-pointer transition-all duration-200
        hover:border-[var(--color-ds-cyan)] hover:shadow-[0_0_16px_var(--color-ds-cyan-glow)]"
    >
      <p className="font-bold text-[var(--color-ds-cyan)] text-lg">{tipo}</p>
      <p className="text-[var(--color-ds-text-muted)] text-xs mt-1">
        {labels[tipo]}
      </p>
    </div>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
          text-xs font-bold text-[var(--color-ds-bg)] bg-[var(--color-ds-cyan)]"
      >
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-[var(--color-ds-text)]">
          {title}
        </p>
        <p className="text-xs text-[var(--color-ds-text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}