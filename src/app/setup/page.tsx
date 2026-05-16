import SetupProjetoForm from "./setup-form";
import { setupProjeto } from "@/app/actions/setupProjeto";

export default function SetupPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-[380px_1fr]">

      {/* ── Sidebar de contexto ──────────────────────────────────── */}
      <aside className="flex flex-col gap-8 border-r border-[var(--color-ds-border)] bg-[var(--color-ds-surface)] px-10 py-14">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <circle cx="22" cy="22" r="21" stroke="var(--color-ds-cyan)" strokeWidth="1" opacity="0.35" />
            <line x1="22" y1="8"  x2="22" y2="34" stroke="var(--color-ds-cyan)" strokeWidth="2"   strokeLinecap="round" />
            <line x1="14" y1="8"  x2="14" y2="20" stroke="var(--color-ds-cyan)" strokeWidth="2"   strokeLinecap="round" />
            <line x1="30" y1="8"  x2="30" y2="20" stroke="var(--color-ds-cyan)" strokeWidth="2"   strokeLinecap="round" />
            <path d="M11 8 L14 5 L17 8" stroke="var(--color-ds-cyan)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 8 L22 5 L25 8" stroke="var(--color-ds-cyan)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27 8 L30 5 L33 8" stroke="var(--color-ds-cyan)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 34 Q22 40 36 34" stroke="var(--color-ds-cyan)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45" />
          </svg>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--color-ds-text)]">
            Pose<span className="text-[var(--color-ds-cyan)]">idon</span>
          </span>
        </div>

        {/* Título e descrição */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-ds-text)]">
            Novo Projeto<br />Cultural
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-ds-text-muted)]">
            Preencha os dados do projeto para a Lei Rouanet. As rubricas obrigatórias
            serão calculadas e criadas automaticamente conforme a{" "}
            <span className="font-semibold text-[var(--color-ds-text)]">IN MinC 29/2026</span>.
          </p>
        </div>

        {/* O que é criado automaticamente */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ds-cyan)]">
            Gerado automaticamente
          </p>
          <ul className="space-y-3">
            {[
              { rubrica: "Administração",             regra: "15% do valor total do projeto" },
              { rubrica: "Captação",                  regra: "10% — teto de R$ 150.000" },
              { rubrica: "Divulgação/Acessibilidade", regra: "20% do valor total do projeto" },
            ].map(({ rubrica, regra }) => (
              <li
                key={rubrica}
                className="flex flex-col gap-0.5 rounded-xl border border-[var(--color-ds-border)] bg-[var(--color-ds-surface-2)] px-4 py-3"
              >
                <span className="text-sm font-semibold text-[var(--color-ds-cyan)]">{rubrica}</span>
                <span className="text-xs text-[var(--color-ds-text-muted)]">{regra}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé da sidebar */}
        <div className="mt-auto">
          <p className="font-mono text-[10px] text-[var(--color-ds-text-muted)] opacity-50">
            Poseidon · Auditoria Cultural · Lei Rouanet
          </p>
        </div>
      </aside>

      {/* ── Área do formulário ───────────────────────────────────── */}
      <main className="px-12 py-14">
        <div className="mx-auto max-w-2xl">
          <p className="mb-10 font-mono text-[10px] uppercase tracking-widest text-[var(--color-ds-text-muted)]">
            Configuração do projeto
          </p>
          <SetupProjetoForm action={setupProjeto} />
        </div>
      </main>

    </div>
  );
}