// src/app/actions/setup.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function criarProjetoAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const nome_projeto = formData.get("nome_projeto") as string;
  const mecanismo_id = formData.get("mecanismo_id") as string;
  const orcamentoStr = formData.get("orcamento_valor") as string;
  const orcamento_pretendido = parseFloat(orcamentoStr || "0");

  if (!nome_projeto || nome_projeto.trim().length < 3) {
    return { error: "Nome do projeto deve ter pelo menos 3 caracteres." };
  }
  if (!mecanismo_id) {
    return { error: "Selecione um mecanismo." };
  }
  if (orcamento_pretendido <= 0) {
    return { error: "Informe um orçamento válido." };
  }

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) {
    return { error: "Perfil de proponente não encontrado. Complete seu cadastro primeiro." };
  }

  // Carrega a configuração de regras do mecanismo
  const { data: mecanismo, error: mecanismoError } = await supabase
    .from("biblioteca_regras")
    .select("configuracao_regras")
    .eq("id", mecanismo_id)
    .single();

  const configuracao = mecanismo?.configuracao_regras ?? null;
  if (mecanismoError) {
    console.warn("Não foi possível carregar as regras do mecanismo.");
  }

  const conteudoInicial = {
    orcamento_pretendido,
  };

  const { error: insertError } = await supabase.from("projetos").insert({
    nome_projeto: nome_projeto.trim(),
    mecanismo_id,
    proponente_id: proponente.id,
    status: "rascunho",
    conteudo_escrita: conteudoInicial,
    configuracao_regras: configuracao,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Erro ao criar projeto:", insertError);
    return { error: "Erro ao salvar o projeto. Tente novamente." };
  }

  redirect("/hub");
}