// src/app/actions/setup.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface FontePayload {
  tipo: "incentivo_fiscal" | "edital" | "patrocinio_direto";
  mecanismo_id?: string | null;
  nome_fonte?: string | null;
  valor_captacao: number;
}

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
  const orcamentoTotalStr = formData.get("orcamento_total") as string;
  const fontesRaw = formData.get("fontes") as string;

  if (!nome_projeto || nome_projeto.trim().length < 3) {
    return { error: "Nome do projeto deve ter pelo menos 3 caracteres." };
  }

  const orcamentoTotal = parseFloat(orcamentoTotalStr || "0");
  if (orcamentoTotal <= 0) {
    return { error: "Informe um orçamento total válido." };
  }

  let fontes: FontePayload[] = [];
  try {
    fontes = JSON.parse(fontesRaw);
  } catch {
    return { error: "Dados das fontes inválidos." };
  }

  if (!fontes.length) {
    return { error: "Adicione pelo menos uma fonte de captação." };
  }

  const somaFontes = fontes.reduce((s, f) => s + f.valor_captacao, 0);
  if (somaFontes <= 0) {
    return { error: "A soma dos valores das fontes deve ser maior que zero." };
  }
  if (somaFontes > orcamentoTotal) {
    return { error: "A soma das fontes não pode ultrapassar o orçamento total." };
  }

  // Buscar proponente
  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) {
    return { error: "Perfil de proponente não encontrado." };
  }

  // 1. Criar o projeto
  const { data: projetoCriado, error: insertError } = await supabase
    .from("projetos")
    .insert({
      nome_projeto: nome_projeto.trim(),
      proponente_id: proponente.id,
      status: "rascunho",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !projetoCriado) {
    console.error("Erro ao criar projeto:", insertError);
    return { error: "Erro ao criar o projeto." };
  }

  // 2. Criar as fontes
  for (const fonte of fontes) {
    let configuracao_regras = null;

    if (fonte.tipo === "incentivo_fiscal" && fonte.mecanismo_id) {
      const { data: mecanismo } = await supabase
        .from("biblioteca_regras")
        .select("configuracao_regras")
        .eq("id", fonte.mecanismo_id)
        .single();
      configuracao_regras = mecanismo?.configuracao_regras ?? null;
    }

    const { error: fonteError } = await supabase
      .from("projeto_fontes")
      .insert({
        projeto_id: projetoCriado.id,
        tipo: fonte.tipo,
        mecanismo_id: fonte.tipo === "incentivo_fiscal" ? fonte.mecanismo_id : null,
        nome_fonte: fonte.tipo !== "incentivo_fiscal" ? fonte.nome_fonte : null,
        valor_captacao: fonte.valor_captacao,
        status: "rascunho",
        configuracao_regras,
      });

    if (fonteError) {
      console.error("Erro ao inserir fonte:", fonteError);
      // Tenta deletar o projeto órfão
      await supabase.from("projetos").delete().eq("id", projetoCriado.id);
      return { error: "Erro ao salvar as fontes de captação." };
    }
  }

  redirect("/hub");
}