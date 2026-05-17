// src/app/(dashboard)/setup/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SetupForm } from "./SetupForm";

// Tipos para os dados que vêm do banco
interface Mecanismo {
  id: string;
  mecanismo_nome: string;
  esfera: string;
  diretrizes?: string;
}

export default async function SetupPage() {
  const supabase = await createClient();

  // Verifica sessão – se não autenticado, redireciona
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Busca mecanismos da biblioteca_regras
  const { data: mecanismos, error } = await supabase
    .from("biblioteca_regras")
    .select("id, mecanismo_nome, esfera, diretrizes")
    .order("mecanismo_nome");

  if (error || !mecanismos) {
    return (
      <div className="min-h-screen bg-sea-950 antialiased font-sans flex items-center justify-center">
        <div className="bg-sea-900 border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-red-400 text-sm">Erro ao carregar mecanismos. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sea-950 antialiased font-sans py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho técnico */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <svg
                aria-label="Poseidon Setup"
                viewBox="0 0 32 32"
                width="22"
                height="22"
                fill="none"
              >
                <path
                  d="M16 4v8M10 8l6-4 6 4M8 14l8 10 8-10"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx={16} cy={16} r={12} stroke="rgba(34,211,238,0.2)" strokeWidth={1.5} />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Configurar Novo Projeto
            </h1>
          </div>
          <p className="text-xs text-white/40 font-medium ml-[52px]">
            Preencha os dados iniciais para criar um rascunho de projeto cultural.
          </p>
        </header>

        {/* Grid: Formulário + Preview de Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal: formulário */}
          <div className="lg:col-span-2">
            <SetupForm mecanismos={mecanismos as Mecanismo[]} />
          </div>

          {/* Coluna lateral: preview de diretrizes */}
          <aside className="lg:col-span-1">
            <div className="bg-sea-900 border border-white/5 rounded-2xl p-5 shadow-2xl shadow-black/40 backdrop-blur-sm sticky top-10">
              <h2 className="text-[10px] font-semibold tracking-wide uppercase text-white/50 mb-3">
                Diretrizes de Compliance
              </h2>
              <div id="compliance-preview" className="text-xs text-white/40 leading-relaxed space-y-2">
                <p className="text-white/30 italic">
                  Selecione um mecanismo para ver as diretrizes aplicáveis.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}