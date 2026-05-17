'use server';

import { createClient } from '@/lib/supabase/server';

interface ResumoProjetos {
  total: number;
  rascunhos: number;
  enviados: number;
  ativos: number;
  inativos: number;
  finalizados: number;
  prestacao_contas: number;
}

interface ProjetoHub {
  id: string;
  nome_projeto: string;
  status: string;
  created_at: string;
  updated_at: string;
  biblioteca_regras: {
    mecanismo_nome: string;
    esfera: string;
  } | null;
}

type ProjetoRowRaw = {
  id: string;
  nome_projeto: string;
  status: string;
  created_at: string;
  updated_at: string;
  biblioteca_regras: {
    mecanismo_nome: string;
    esfera: string;
  }[] | null;
};

export async function getHubData(): Promise<
  { projetos: ProjetoHub[]; resumo: ResumoProjetos } | { error: string }
> {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Erro ao obter sessão:', sessionError);
    return { error: 'Usuário não autenticado.' };
  }

  if (!session) {
    console.error('Nenhuma sessão encontrada. Verifique se os cookies estão sendo enviados.');
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

  const { data: rawProjetos, error: projetosError } = await supabase
    .from('projetos')
    .select(`
      id,
      nome_projeto,
      status,
      created_at,
      updated_at,
      biblioteca_regras ( mecanismo_nome, esfera )
    `)
    .eq('proponente_id', proponente.id)
    .order('created_at', { ascending: false });

  if (projetosError) {
    return { error: 'Erro ao carregar projetos: ' + projetosError.message };
  }

  const projetos: ProjetoHub[] = (rawProjetos as ProjetoRowRaw[]).map((item) => ({
    id: item.id,
    nome_projeto: item.nome_projeto,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    biblioteca_regras: item.biblioteca_regras?.[0] ?? null,
  }));

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