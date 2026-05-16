import SetupProjetoForm from "./setup-form";
import { setupProjeto } from "@/app/actions/setupProjeto";

export default function SetupPage() {
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

        {/* Formulario — componente client que ja existe no projeto */}
        <div className="ds-card-glow">
          <SetupProjetoForm action={setupProjeto} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-ds-text-muted)]">
          Poseidon &middot; Auditoria Cultural &middot; Lei Rouanet
        </p>
      </div>
    </main>
  );
}