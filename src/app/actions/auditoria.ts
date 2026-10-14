// src/app/actions/auditoria.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export interface ProjetoAuditoria {
  id: string;
  nome_projeto: string;
  status: string;
  created_at: string;
  total_captacao: number;
  total_orcado: number;
  total_notas: number;
  num_notas: number;
  num_glosas: number;
  cobertura: number; // % notas / orcado
}

export interface AuditoriaResumo {
  total_projetos: number;
  total_captacao: number;
  total_orcado: number;
  total_notas: number;
  projetos_sem_nota: number;
  projetos_com_glosa: number;
}

export async function getAuditoriaData(): Promise<
  { projetos: ProjetoAuditoria[]; resumo: AuditoriaResumo } | { error: string }
> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  // Busca proponente
  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  // Todos os projetos
  const { data: projetos, error: projError } = await supabase
    .from("projetos")
    .select("id, nome_projeto, status, created_at")
    .eq("proponente_id", proponente.id)
    .order("created_at", { ascending: false });

  if (projError || !projetos) return { error: "Erro ao buscar projetos." };

  if (projetos.length === 0) {
    return {
      projetos: [],
      resumo: {
        total_projetos: 0,
        total_captacao: 0,
        total_orcado: 0,
        total_notas: 0,
        projetos_sem_nota: 0,
        projetos_com_glosa: 0,
      },
    };
  }

  const ids = projetos.map((p) => p.id);

  // Fontes — captação total por projeto
  const { data: fontes = [] } = await supabase
    .from("projeto_fontes")
    .select("projeto_id, valor_captacao")
    .in("projeto_id", ids);

  // Itens — orçado total por projeto
  const { data: itens = [] } = await supabase
    .from("itens_orcamentarios")
    .select("projeto_id, valor, quantidade")
    .in("projeto_id", ids);

  // Notas fiscais — executado por projeto
  const { data: notas = [] } = await supabase
    .from("notas_fiscais")
    .select("projeto_id, valor, status")
    .in("projeto_id", ids);

  // Agrega por projeto
  const resultado: ProjetoAuditoria[] = projetos.map((p) => {
    const total_captacao = (fontes ?? [])
      .filter((f) => f.projeto_id === p.id)
      .reduce((s, f) => s + Number(f.valor_captacao), 0);

    const total_orcado = (itens ?? [])
      .filter((i) => i.projeto_id === p.id)
      .reduce((s, i) => s + Number(i.valor) * i.quantidade, 0);

    const notasDoProjeto = (notas ?? []).filter((n) => n.projeto_id === p.id);
    const total_notas    = notasDoProjeto.reduce((s, n) => s + Number(n.valor), 0);
    const num_notas      = notasDoProjeto.length;
    const num_glosas     = notasDoProjeto.filter((n) => n.status === "glosa").length;
    const cobertura      = total_orcado > 0 ? (total_notas / total_orcado) * 100 : 0;

    return {
      id: p.id,
      nome_projeto: p.nome_projeto,
      status: p.status,
      created_at: p.created_at,
      total_captacao,
      total_orcado,
      total_notas,
      num_notas,
      num_glosas,
      cobertura,
    };
  });

  const resumo: AuditoriaResumo = {
    total_projetos:     resultado.length,
    total_captacao:     resultado.reduce((s, p) => s + p.total_captacao, 0),
    total_orcado:       resultado.reduce((s, p) => s + p.total_orcado,   0),
    total_notas:        resultado.reduce((s, p) => s + p.total_notas,    0),
    projetos_sem_nota:  resultado.filter((p) => p.num_notas === 0).length,
    projetos_com_glosa: resultado.filter((p) => p.num_glosas > 0).length,
  };

  return { projetos: resultado, resumo };
}
