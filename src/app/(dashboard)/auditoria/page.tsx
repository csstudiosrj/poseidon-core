// src/app/(dashboard)/auditoria/page.tsx
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, ArrowRight } from "lucide-react";
import "../../globals.css";

export default async function AuditoriaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) redirect("/hub");

  const { data: projetos } = await supabase
    .from("projetos")
    .select(`
      id,
      nome_projeto,
      status,
      projeto_fontes (valor_captacao),
      notas_fiscais (valor, status),
      projeto_fornecedores (id)
    `)
    .eq("proponente_id", proponente.id);

  const projetosAuditoria = (projetos || []).map((p: any) => ({
    ...p,
    totalNotas: p.notas_fiscais?.length || 0,
    glosas: p.notas_fiscais?.filter((n: any) => n.status === "glosada").length || 0,
    fornecedores: p.projeto_fornecedores?.length || 0,
  }));

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck size={22} className="text-cyan-400" />
            Auditoria
          </h1>
          <p className="text-white/40 text-xs mt-1">Visão geral de compliance dos seus projetos</p>
        </div>

        {projetosAuditoria.length === 0 ? (
          <div className="card p-6 text-center text-white/50 text-sm">Nenhum projeto encontrado.</div>
        ) : (
          <div className="space-y-3">
            {projetosAuditoria.map((projeto: any) => (
              <Link
                key={projeto.id}
                href={`/projeto/${projeto.id}/execucao`}
                className="card p-4 flex items-center justify-between hover:border-cyan-500/20 transition-all cursor-pointer group"
              >
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-cyan-400 transition-colors">{projeto.nome_projeto}</p>
                  <p className="text-white/40 text-xs">
                    {projeto.totalNotas} notas · {projeto.glosas} glosas · {projeto.fornecedores} fornecedores
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {projeto.glosas > 0 && (
                    <span className="badge bg-red-500/10 text-red-400 border border-red-500/15 text-[9px]">{projeto.glosas} glosas</span>
                  )}
                  <ArrowRight size={16} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}