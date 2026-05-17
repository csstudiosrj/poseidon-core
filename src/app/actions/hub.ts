// src/app/actions/hub.ts
'use server';

import { createClient } from '@/lib/supabase/server';

interface FonteResumo {
  tipo: string;
  nome: string;
  valor: number;
}

interface ProjetoHub {
  id: string;
  nome_projeto: string;
  status: string;
  created_at: string;
  updated_at: string;
  fontes: FonteResumo[];
  orcamento_total: number;
}

interface ResumoProjetos {
  total: number;
  rascunhos: number;
  enviados: number;
  ativos: number;
  inativos: number;
  finalizados: number;
  prestacao_contas: number;
}

export async function getHubData(): Promise<
  { projetos: ProjetoHub[]; resumo: ResumoProjetos } | { error: string }
> {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { error: 'Usuário não autenticado.' };
  }

  const userId = session.user.id;

  const { data: proponente, error: proponenteError } = await supabase
    .from('proponentes')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (proponenteError || !proponente) {
    return { error: 'Perfil de proponente não encontrado.' };
  }

  const { data: projetosRaw, error: projetosError } = await supabase
    .from('projetos')
    .select(`
      id,
      nome_projeto,
      status,
      created_at,
      updated_at,
      projeto_fontes (tipo, nome_fonte, mecanismo_id, valor_captacao, biblioteca_regras (mecanismo_nome))
    `)
    .eq('proponente_id', proponente.id)
    .order('created_at', { ascending: false });

  if (projetosError) {
    return { error: 'Erro ao carregar projetos: ' + projetosError.message };
  }

  const projetos: ProjetoHub[] = (projetosRaw as any[]).map((item) => {
    const fontes = (item.projeto_fontes || []).map((f: any) => {
      let nome = f.nome_fonte || f.tipo;
      if (f.tipo === 'incentivo_fiscal' && f.biblioteca_regras?.mecanismo_nome) {
        nome = f.biblioteca_regras.mecanismo_nome;
      }
      return {
        tipo: f.tipo,
        nome,
        valor: f.valor_captacao || 0,
      };
    });

    const orcamento_total = fontes.reduce((soma: number, f: FonteResumo) => soma + f.valor, 0);

    return {
      id: item.id,
      nome_projeto: item.nome_projeto,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      fontes,
      orcamento_total,
    };
  });

  const resumo: ResumoProjetos = {
    total: projetos.length,
    rascunhos: projetos.filter((p) => p.status === 'rascunho').length,
    enviados: projetos.filter((p) => p.status === 'enviado').length,
    ativos: projetos.filter((p) => p.status === 'ativo').length,
    inativos: projetos.filter((p) => p.status === 'inativo').length,
    finalizados: projetos.filter((p) => p.status === 'finalizado').length,
    prestacao_contas: projetos.filter((p) => p.status === 'prestacao_contas').length,
  };

  return { projetos, resumo };
}