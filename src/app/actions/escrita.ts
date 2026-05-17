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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const projetoId = formData.get("projeto_id") as string;
  const fonteId = formData.get("fonte_id") as string;
  const descricao = formData.get("descricao") as string;
  const publico = formData.get("publico") as string;
  const objetivos = formData.get("objetivos") as string;
  const local = (formData.get("local") as string) || "";
  const contrapartida = (formData.get("contrapartida") as string) || "";
  const orcamentoStr = formData.get("orcamento") as string;
  const orcamento = parseFloat(orcamentoStr || "0");

  if (!projetoId || !fonteId) return { error: "Projeto ou fonte não identificados." };
  if (!descricao || descricao.trim().length < 50) return { error: "Descrição muito curta." };
  if (!publico || publico.trim().length < 10) return { error: "Público-alvo obrigatório." };
  if (!objetivos || objetivos.trim().length < 20) return { error: "Objetivos obrigatórios." };
  if (orcamento <= 0) return { error: "Orçamento inválido." };

  // Verifica permissão
  const { data: proponente } = await supabase.from("proponentes").select("id").eq("user_id", user.id).single();
  if (!proponente) return { error: "Proponente não encontrado." };

  const { data: projeto } = await supabase
    .from("projetos")
    .select("id, nome_projeto, proponente_id")
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id)
    .single();

  if (!projeto) return { error: "Projeto não encontrado." };

  // Busca a fonte (AGORA COM nome_fonte)
  const { data: fonte } = await supabase
    .from("projeto_fontes")
    .select("id, tipo, mecanismo_id, nome_fonte, configuracao_regras, biblioteca_regras (mecanismo_nome, esfera, configuracao_regras)")
    .eq("id", fonteId)
    .eq("projeto_id", projetoId)
    .single();

  if (!fonte) return { error: "Fonte não encontrada." };

  const biblioteca = Array.isArray(fonte.biblioteca_regras)
    ? fonte.biblioteca_regras[0]
    : fonte.biblioteca_regras;

  const regras: RegrasMecanismo = (fonte.configuracao_regras as RegrasMecanismo) ||
    (biblioteca?.configuracao_regras as RegrasMecanismo) || {
      mecanismo_nome: biblioteca?.mecanismo_nome || fonte.nome_fonte || "Fonte",
      esfera: (biblioteca?.esfera as "Federal" | "Estadual" | "Municipal") || "Federal",
      secoes_obrigatorias: [],
      tetos: [],
      campos_formulario: [],
      documentos_obrigatorios: [],
    };

  const respostas: RespostasEntrevista = { descricao, publico, objetivos, orcamento, local, contrapartida };
  const projetoBase: ProjetoBase = { id: projeto.id, nome_projeto: projeto.nome_projeto, proponente_id: projeto.proponente_id, mecanismo_id: fonte.mecanismo_id || "" };

  const { conteudo_escrita, itens_orcamentarios } = await gerarConteudoProjeto(projetoBase, respostas, regras);

  // Atualiza conteúdo na fonte
  const { error: updateFonteError } = await supabase
    .from("projeto_fontes")
    .update({ conteudo_escrita, updated_at: new Date().toISOString() })
    .eq("id", fonteId);

  if (updateFonteError) return { error: "Erro ao salvar conteúdo na fonte." };

  // Insere itens orçamentários no projeto (limpa antes)
  const { error: deleteItensError } = await supabase.from("itens_orcamentarios").delete().eq("projeto_id", projetoId);
  if (!deleteItensError) {
    await supabase.from("itens_orcamentarios").insert(
      itens_orcamentarios.map((item) => ({
        projeto_id: projetoId,
        descricao: item.descricao,
        valor: item.valor,
        quantidade: item.quantidade,
        categoria: item.categoria,
      }))
    );
  }

  return { success: true };
}

export async function buscarProjetosRascunho(userId: string) {
  const supabase = await createClient();
  const { data: proponente } = await supabase.from("proponentes").select("id").eq("user_id", userId).single();
  if (!proponente) return { error: "Perfil não encontrado.", projetos: [] };

  const { data: projetosRaw, error } = await supabase
    .from("projetos")
    .select("id, nome_projeto, created_at, projeto_fontes(id, tipo, nome_fonte, mecanismo_id, valor_captacao, biblioteca_regras(mecanismo_nome))")
    .eq("proponente_id", proponente.id)
    .eq("status", "rascunho")
    .order("created_at", { ascending: false });

  if (error) return { error: "Erro ao buscar projetos.", projetos: [] };

  const projetos = projetosRaw.map((p: any) => ({
    id: p.id,
    nome_projeto: p.nome_projeto,
    created_at: p.created_at,
    fontes: (p.projeto_fontes || []).map((f: any) => ({
      id: f.id,
      nome: f.tipo === "incentivo_fiscal" ? (Array.isArray(f.biblioteca_regras) ? f.biblioteca_regras[0]?.mecanismo_nome : f.biblioteca_regras?.mecanismo_nome) || "Incentivo Fiscal" : f.nome_fonte || f.tipo,
      tipo: f.tipo,
      valor_captacao: f.valor_captacao,
    })),
  }));

  return { projetos };
}