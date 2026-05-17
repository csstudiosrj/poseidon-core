// src/app/actions/setup.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface SetupFormData {
  nome_projeto: string;
  esfera: string;
  mecanismo_id: string;
  orcamento_pretendido: number; // em centavos (ex.: 500000 para R$ 5.000,00)
}

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

  // 4. Inserir o projeto com status 'rascunho'
  const { error: insertError } = await supabase.from("projetos").insert({
    nome_projeto: nome_projeto.trim(),
    esfera,
    mecanismo_id,
    orcamento_pretendido,
    proponente_id: proponente.id,
    status: "rascunho",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Erro ao criar projeto:", insertError);
    return { error: "Erro ao salvar o projeto. Tente novamente." };
  }

  // 5. Redirecionar para o hub (o retorno com success dispara o redirect no client)
  // Como é server action, podemos usar redirect diretamente aqui
  redirect("/hub");
}