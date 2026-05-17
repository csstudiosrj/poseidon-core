// src/app/actions/setup.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function criarProjetoAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  // 1. Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  // 2. Extrair dados do formulário
  const nome_projeto = formData.get("nome_projeto") as string;
  const esfera = formData.get("esfera") as string;
  const mecanismo_id = formData.get("mecanismo_id") as string;
  const orcamentoStr = formData.get("orcamento_pretendido") as string;
  const orcamento_pretendido = parseInt(orcamentoStr || "0", 10);

  // Validações básicas
  if (!nome_projeto || nome_projeto.trim().length < 3) {
    return { error: "Nome do projeto deve ter pelo menos 3 caracteres." };
  }
  if (!esfera) {
    return { error: "Selecione a esfera do projeto." };
  }
  if (!mecanismo_id) {
    return { error: "Selecione um mecanismo." };
  }
  if (orcamento_pretendido <= 0) {
    return { error: "Informe um orçamento válido." };
  }

  // 3. Buscar proponente vinculado ao usuário
  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) {
    return {
      error:
        "Perfil de proponente não encontrado. Complete seu cadastro primeiro.",
    };
  }

  // 4. Carregar a configuração de regras do mecanismo
  const { data: mecanismo, error: mecanismoError } = await supabase
    .from("biblioteca_regras")
    .select("configuracao_regras")
    .eq("id", mecanismo_id)
    .single();

  const configuracao = mecanismo?.configuracao_regras ?? null;
  if (mecanismoError) {
    console.warn("Não foi possível carregar as regras do mecanismo. Projeto será criado sem elas.");
  }

  // 5. Inserir o projeto com status 'rascunho' e as regras herdadas
  const { error: insertError } = await supabase.from("projetos").insert({
    nome_projeto: nome_projeto.trim(),
    esfera,
    mecanismo_id,
    orcamento_pretendido,
    proponente_id: proponente.id,
    status: "rascunho",
    configuracao_regras: configuracao, // JSONB com limites, campos, etc.
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Erro ao criar projeto:", insertError);
    return { error: "Erro ao salvar o projeto. Tente novamente." };
  }

  // 6. Redirecionar para o hub
  redirect("/hub");
}