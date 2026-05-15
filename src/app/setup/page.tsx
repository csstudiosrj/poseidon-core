import { ShieldCheck } from "lucide-react";
import { setupProjeto } from "@/app/actions/setupProjeto";
import SetupProjetoForm from "./setup-form";

export const metadata = {
  title: "Setup de Projeto — Poseidon",
  description: "Cadastro de novo projeto cultural com rubricas da IN 29/2026",
};

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-[#020b18] px-4 py-10 text-cyan-400">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-[#06101f] p-3 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/60">
              Poseidon · Deep Sea Setup
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">Novo Projeto Cultural</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Cadastre o projeto e as rubricas de{" "}
              <span className="text-cyan-400">Administração</span>,{" "}
              <span className="text-cyan-400">Captação</span> e{" "}
              <span className="text-cyan-400">Divulgação/Acessibilidade</span> serão criadas
              automaticamente com os valores-teto da{" "}
              <strong className="text-slate-300">IN MinC nº 29/2026</strong>.
            </p>
          </div>
        </div>

        {/* Card do formulário */}
        <div className="rounded-3xl border border-cyan-500/20 bg-[#06101f] p-6 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          <SetupProjetoForm action={setupProjeto} />
        </div>
      </div>
    </main>
  );
}