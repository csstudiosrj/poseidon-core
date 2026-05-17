'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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

export async function getHubData(): Promise<{ projetos: ProjetoHub[]; resumo: ResumoProjetos } | { error: string }> {
  const supabase = await createClient();

  // 1. Validar sessão
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { error: 'Usuário não autenticado.' };
  }

  const userId = session.user.id;

  // 2. Obter proponente vinculado ao user_id (único por schema)
  const { data: proponente, error: proponenteError } = await supabase
    .from('proponentes')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (proponenteError || !proponente) {
    return { error: 'Perfil de proponente não encontrado.' };
  }

  // 3. Buscar projetos com join na biblioteca_regras
  const { data: projetos, error: projetosError } = await supabase
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

  // 4. Construir resumo de contadores
  const resumo: ResumoProjetos = {
    total: projetos.length,
    rascunhos: projetos.filter(p => p.status === 'rascunho').length,
    enviados: projetos.filter(p => p.status === 'enviado').length,
    ativos: projetos.filter(p => p.status === 'ativo').length,
    inativos: projetos.filter(p => p.status === 'inativo').length,
    finalizados: projetos.filter(p => p.status === 'finalizado').length,
    prestacao_contas: projetos.filter(p => p.status === 'prestacao_contas').length,
  };

  return {
    projetos: projetos as ProjetoHub[],
    resumo,
  };
}