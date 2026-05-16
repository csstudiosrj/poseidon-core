import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ projetoId: string }>;
}

export default async function ProjetoPage({ params }: Props) {
  const { projetoId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projeto, error } = await supabase
    .from("projetos")
    .select("*")
    .eq("id", projetoId)
    .single();

  if (error || !projeto) {
    redirect("/setup");
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <span className="ds-badge mb-3">Auditoria Cultural</span>
          <h1 className="text-3xl font-bold text-[var(--color-ds-text)]">
            {projeto.nome ?? "Projeto"}
          </h1>
          <p className="text-[var(--color-ds-text-muted)] mt-1 text-sm">
            ID: {projetoId}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card de status */}
          <div className="ds-card">
            <p className="ds-label">Status</p>
            <p className="text-lg font-semibold text-[var(--color-ds-text)]">
              {projeto.status ?? "—"}
            </p>
          </div>

          {/* Card de valor */}
          <div className="ds-card">
            <p className="ds-label">Valor Aprovado</p>
            <p className="text-lg font-semibold text-[var(--color-ds-cyan)]">
              {projeto.valor_aprovado != null
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(projeto.valor_aprovado)
                : "—"}
            </p>
          </div>

          {/* Card de mecanismo */}
          <div className="ds-card">
            <p className="ds-label">Mecanismo</p>
            <p className="text-lg font-semibold text-[var(--color-ds-text)]">
              {projeto.mecanismo ?? "—"}
            </p>
          </div>
        </div>

        {/* Área de conteúdo principal */}
        <section className="mt-8 ds-card">
          <p className="ds-label mb-4">Detalhes do Projeto</p>
          <pre className="text-xs text-[var(--color-ds-text-muted)] whitespace-pre-wrap break-words">
            {JSON.stringify(projeto, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}