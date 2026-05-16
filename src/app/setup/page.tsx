import SetupProjetoForm from "./setup-form";
import { setupProjeto } from "@/app/actions/setupProjeto";

export default function SetupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl space-y-8">

        {/* ── Cabeçalho ──────────────────────────────────────────── */}
        <header className="text-center space-y-3">
          <span className="ds-badge">
            POSEIDON &middot; DEEP SEA SETUP
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-ds-text)] mt-4">
            Novo Projeto Cultural
          </h1>

          <p className="text-[var(--color-ds-text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
            Cadastre o projeto e as rubricas de{" "}
            <span className="text-[var(--color-ds-cyan)] font-medium">Administração</span>
            {", "}
            <span className="text-[var(--color-ds-cyan)] font-medium">Captação</span> e{" "}
            <span className="text-[var(--color-ds-cyan)] font-medium">
              Divulgação/Acessibilidade
            </span>{" "}
            serão criadas automaticamente com os valores-teto da{" "}
            <strong className="text-[var(--color-ds-text)]">IN MinC 29/2026</strong>.
          </p>
        </header>

        {/* ── Card principal ─────────────────────────────────────── */}
        <div className="ds-card-glow p-10">
          <SetupProjetoForm action={setupProjeto} />
        </div>

        {/* ── Rodapé ─────────────────────────────────────────────── */}
        <footer>
          <p className="text-center text-xs text-[var(--color-ds-text-muted)]">
            Poseidon &middot; Auditoria Cultural &middot; Lei Rouanet
          </p>
        </footer>

      </div>
    </main>
  );
}