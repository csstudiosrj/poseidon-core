import SetupProjetoForm from './setup-form'
import { setupProjeto } from '@/app/actions/setupProjeto'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[#020b18] text-white flex flex-col">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ds-cyan)]/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 text-center sm:pt-28 sm:pb-16">
          {/* Logo Waves */}
          <div className="mx-auto mb-8 flex justify-center">
            <svg
              width="56"
              height="56"
              viewBox="0 0 44 44"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="22"
                cy="22"
                r="21"
                stroke="var(--color-ds-cyan)"
                strokeWidth="1"
                opacity="0.25"
              />
              <line
                x1="22" y1="8" x2="22" y2="34"
                stroke="var(--color-ds-cyan)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="14" y1="8" x2="14" y2="20"
                stroke="var(--color-ds-cyan)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="30" y1="8" x2="30" y2="20"
                stroke="var(--color-ds-cyan)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M11 8 L14 5 L17 8"
                stroke="var(--color-ds-cyan)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 8 L22 5 L25 8"
                stroke="var(--color-ds-cyan)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27 8 L30 5 L33 8"
                stroke="var(--color-ds-cyan)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 34 Q22 40 36 34"
                stroke="var(--color-ds-cyan)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.35"
              />
            </svg>
          </div>

          {/* Títulos */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Configure seu Primeiro Projeto
          </h1>
          <p className="mt-4 text-lg text-[var(--color-ds-text-muted)] max-w-2xl mx-auto">
            O <span className="font-semibold text-[var(--color-ds-cyan)]">Poseidon</span> vai
            automatizar as rubricas obrigatórias da{' '}
            <span className="font-semibold text-white">IN MinC 29/2026</span>, aplicando os
            percentuais legais de forma transparente.
          </p>
        </div>
      </header>

      {/* Formulário */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-6 pb-20">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-12 shadow-2xl shadow-black/40">
          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ds-cyan)]">
            Configuração do projeto
          </p>
          <SetupProjetoForm action={setupProjeto} />
        </div>
      </main>
    </div>
  )
}