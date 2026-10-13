// src/app/actions/projeto.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export interface ProjetoFonte {
  id: string;
  tipo: string;
  nome_fonte: string | null;
  mecanismo_id: string | null;
  valor_captacao: number;
  status: string | null;
}

export interface ItemOrcamentario {
  id: string;
  descricao: string;
  valor: number;
  quantidade: number;
  categoria: string | null;
  fonte_id: string | null;
}

export interface NotaFiscal {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_emissao: string | null;
  arquivo_url: string | null;
  status: string | null;
  fonte_id: string | null;
}

interface ProjetoData {
  projeto: {
    id: string;
    nome_projeto: string;
    status: string;
    created_at: string;
  };
  fontes: ProjetoFonte[];
  itens: ItemOrcamentario[];
  notas: NotaFiscal[];
  resumo: {
    total_captacao: number;
    total_orcado: number;
    total_notas: number;
    num_fontes: number;
    num_itens: number;
  };
}

export async function getProjetoData(
  projetoId: string
): Promise<ProjetoData | { error: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  // Projeto + ownership
  const { data: projeto, error: projError } = await supabase
    .from("projetos")
    .select("id, nome_projeto, status, created_at, proponentes!inner(user_id)")
    .eq("id", projetoId)
    .eq("proponentes.user_id", user.id)
    .single();

  if (projError || !projeto) return { error: "Projeto não encontrado." };

  // Fontes
  const { data: fontes = [] } = await supabase
    .from("projeto_fontes")
    .select("id, tipo, nome_fonte, mecanismo_id, valor_captacao, status")
    .eq("projeto_id", projetoId)
    .order("created_at");

  // Itens
  const { data: itens = [] } = await supabase
    .from("itens_orcamentarios")
    .select("id, descricao, valor, quantidade, categoria, fonte_id")
    .eq("projeto_id", projetoId)
    .order("created_at");

  // Notas fiscais
  const { data: notas = [] } = await supabase
    .from("notas_fiscais")
    .select("id, descricao, categoria, valor, data_emissao, arquivo_url, status, fonte_id")
    .eq("projeto_id", projetoId)
    .order("created_at");

  const total_captacao = (fontes ?? []).reduce(
    (s, f) => s + Number(f.valor_captacao),
    0
  );
  const total_orcado = (itens ?? []).reduce(
    (s, i) => s + Number(i.valor) * i.quantidade,
    0
  );
  const total_notas = (notas ?? []).reduce(
    (s, n) => s + Number(n.valor),
    0
  );

  return {
    projeto: {
      id:           projeto.id,
      nome_projeto: projeto.nome_projeto,
      status:       projeto.status,
      created_at:   projeto.created_at,
    },
    fontes:  fontes  ?? [],
    itens:   itens   ?? [],
    notas:   notas   ?? [],
    resumo: {
      total_captacao,
      total_orcado,
      total_notas,
      num_fontes: (fontes ?? []).length,
      num_itens:  (itens  ?? []).length,
    },
  };
}
