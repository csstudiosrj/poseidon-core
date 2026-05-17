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

  // Busca o projeto com suas fontes
  const { data: projeto, error: projError } = await supabase
    .from("projetos")
    .select(`
      id,
      nome_projeto,
      status,
      conteudo_escrita,
      cronograma,
      created_at,
      updated_at,
      projeto_fontes (
        id,
        tipo,
        nome_fonte,
        mecanismo_id,
        valor_captacao,
        status,
        conteudo_escrita,
        configuracao_regras,
        biblioteca_regras (mecanismo_nome, esfera)
      ),
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