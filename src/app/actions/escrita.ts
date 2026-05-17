// src/app/actions/escrita.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { gerarConteudoProjeto } from "@/lib/ia/gerador";
import { RespostasEntrevista, RegrasMecanismo, ProjetoBase } from "@/lib/ia/tipos";

export async function gerarProjetoAction(
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
  const projetoId = formData.get("projeto_id") as string;
  const descricao = formData.get("descricao") as string;
  const publico = formData.get("publico") as string;
  const objetivos = formData.get("objetivos") as string;
  const local = (formData.get("local") as string) || "";
  const duracao = (formData.get("duracao") as string) || "";
  const contrapartida = (formData.get("contrapartida") as string) || "";
  const orcamentoStr = formData.get("orcamento") as string;
  const orcamento = parseFloat(orcamentoStr || "0");

  if (!projetoId) {
    return { error: "Projeto não identificado." };
  }
  if (!descricao || descricao.trim().length < 50) {
    return { error: "A descrição deve ter pelo menos 50 caracteres." };
  }
  if (!publico || publico.trim().length < 10) {
    return { error: "Descreva o público-alvo do projeto." };
  }
  if (!objetivos || objetivos.trim().length < 20) {
    return { error: "Descreva os objetivos do projeto." };
  }
  if (orcamento <= 0) {
    return { error: "Informe um orçamento válido." };
  }

  // 3. Buscar o projeto e verificar permissão
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
      proponente_id,
      mecanismo_id,
      status,
      configuracao_regras,
      biblioteca_regras!inner(id, mecanismo_nome, esfera, configuracao_regras)
    `)
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id)
    .single();

  if (projError || !projeto) {
    return { error: "Projeto não encontrado ou sem permissão." };
  }

  if (projeto.status !== "rascunho") {
    return { error: "Apenas projetos em rascunho podem ser editados." };
  }

  // 4. Montar dados para o motor
  const projetoBase: ProjetoBase = {
    id: projeto.id,
    nome_projeto: projeto.nome_projeto,
    proponente_id: projeto.proponente_id,
    mecanismo_id: projeto.mecanismo_id,
  };

  const respostas: RespostasEntrevista = {
    descricao,
    publico,
    objetivos,
    orcamento,
    local,
    duracao,
    contrapartida,
  };

  // Usa as regras já carregadas ou o JSONB da biblioteca
  const regras: RegrasMecanismo = projeto.configuracao_regras as RegrasMecanismo ||
    (projeto.biblioteca_regras?.configuracao_regras as RegrasMecanismo) || {
      mecanismo_nome: projeto.biblioteca_regras?.mecanismo_nome || "Desconhecido",
      esfera: (projeto.biblioteca_regras?.esfera as "Federal") || "Federal",
      secoes_obrigatorias: [],
      tetos: [],
      campos_formulario: [],
      documentos_obrigatorios: [],
    };

  // 5. Chamar o motor de geração
  const { conteudo_escrita, itens_orcamentarios } = gerarConteudoProjeto(
    projetoBase,
    respostas,
    regras
  );

  // 6. Atualizar o projeto no banco
  const { error: updateError } = await supabase
    .from("projetos")
    .update({
      conteudo_escrita,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projetoId);

  if (updateError) {
    console.error("Erro ao atualizar projeto:", updateError);
    return { error: "Erro ao salvar o conteúdo gerado." };
  }

  // 7. Inserir os itens orçamentários
  const itensParaInserir = itens_orcamentarios.map((item) => ({
    projeto_id: projetoId,
    descricao: item.descricao,
    valor: item.valor,
    quantidade: item.quantidade,
    categoria: item.categoria,
  }));

  const { error: itensError } = await supabase
    .from("itens_orcamentarios")
    .insert(itensParaInserir);

  if (itensError) {
    console.error("Erro ao inserir itens orçamentários:", itensError);
    return { error: "Erro ao salvar os itens do orçamento." };
  }

  return { success: true };
}

export async function buscarProjetosRascunho(userId: string) {
  const supabase = await createClient();

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (propError || !proponente) {
    return { error: "Perfil não encontrado.", projetos: [] };
  }

  const { data, error } = await supabase
    .from("projetos")
    .select(`
      id,
      nome_projeto,
      created_at,
      biblioteca_regras (mecanismo_nome, esfera)
    `)
    .eq("proponente_id", proponente.id)
    .eq("status", "rascunho")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: "Erro ao buscar projetos.", projetos: [] };
  }

  return {
    projetos: data.map((p) => ({
      id: p.id,
      nome_projeto: p.nome_projeto,
      created_at: p.created_at,
      mecanismo: p.biblioteca_regras?.[0] ?? null,
    })),
  };
}