// src/app/actions/projeto.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export interface ItemOrcamentario {
  id: string;
  descricao: string;
  valor: number;
  quantidade: number;
  categoria: string | null;
  fonte_id: string | null;
  created_at: string;
}

export interface ProjetoFonte {
  id: string;
  tipo: string;
  nome_fonte: string | null;
  valor_captacao: number;
  status: string | null;
  configuracao_regras: Record<string, unknown> | null;
  mecanismo_id: string | null;
}

export interface ProjetoDetalhe {
  id: string;
  nome_projeto: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjetoData {
  projeto: ProjetoDetalhe;
  fontes: ProjetoFonte[];
  itens: ItemOrcamentario[];
  resumo: {
    total_captacao: number;
    total_orcado: number;
    num_fontes: number;
    num_itens: number;
  };
}

export async function getProjetoData(
  projetoId: string
): Promise<ProjetoData | { error: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Sessão expirada." };
  }

  // Buscar projeto — verifica que pertence ao usuário via proponente
  const { data: projeto, error: projetoError } = await supabase
    .from("projetos")
    .select(`
      id, nome_projeto, status, created_at, updated_at,
      proponentes!inner(user_id)
    `)
    .eq("id", projetoId)
    .eq("proponentes.user_id", user.id)
    .single();

  if (projetoError || !projeto) {
    return { error: "Projeto não encontrado ou sem permissão de acesso." };
  }

  // Buscar fontes
  const { data: fontes, error: fontesError } = await supabase
    .from("projeto_fontes")
    .select("id, tipo, nome_fonte, valor_captacao, status, configuracao_regras, mecanismo_id")
    .eq("projeto_id", projetoId)
    .order("created_at", { ascending: true });

  if (fontesError) {
    return { error: "Erro ao carregar fontes de captação." };
  }

  // Buscar itens orçamentários
  const { data: itens, error: itensError } = await supabase
    .from("itens_orcamentarios")
    .select("id, descricao, valor, quantidade, categoria, fonte_id, created_at")
    .eq("projeto_id", projetoId)
    .order("created_at", { ascending: true });

  if (itensError) {
    return { error: "Erro ao carregar itens orçamentários." };
  }

  const fontesList = (fontes ?? []) as ProjetoFonte[];
  const itensList = (itens ?? []) as ItemOrcamentario[];

  const total_captacao = fontesList.reduce((s, f) => s + Number(f.valor_captacao), 0);
  const total_orcado = itensList.reduce((s, i) => s + Number(i.valor) * i.quantidade, 0);

  return {
    projeto: {
      id: projeto.id,
      nome_projeto: projeto.nome_projeto,
      status: projeto.status,
      created_at: projeto.created_at,
      updated_at: projeto.updated_at,
    },
    fontes: fontesList,
    itens: itensList,
    resumo: {
      total_captacao,
      total_orcado,
      num_fontes: fontesList.length,
      num_itens: itensList.length,
    },
  };
}
