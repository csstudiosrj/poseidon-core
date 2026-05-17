// src/app/actions/projeto.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProjeto(projetoId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Usuário não autenticado." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) {
    return { error: "Perfil de proponente não encontrado." };
  }

  const { data: projeto, error: projError } = await supabase
    .from("projetos")
    .select(`
      id,
      nome_projeto,
      status,
      conteudo_escrita,
      cronograma,
      configuracao_regras,
      created_at,
      updated_at,
      mecanismo_id,
      biblioteca_regras (mecanismo_nome, esfera),
      itens_orcamentarios (id, descricao, valor, quantidade, categoria)
    `)
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id)
    .single();

  if (projError || !projeto) {
    return { error: "Projeto não encontrado ou sem permissão." };
  }

  return { projeto };
}