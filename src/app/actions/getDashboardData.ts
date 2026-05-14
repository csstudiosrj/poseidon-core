"use server";

import { supabase } from '@/lib/supabase';

export async function getDashboardData(projetoId: string) {
  // 1. Busca os dados do projeto (Orçamento, Nome, etc)
  const { data: projeto, error: pError } = await supabase
    .from('projetos')
    .select('*')
    .eq('id', projetoId)
    .single();

  if (pError) throw new Error("Erro ao buscar projeto");

  // 2. Busca as rubricas ligadas a esse projeto
  const { data: rubricas, error: rError } = await supabase
    .from('rubricas')
    .select('*')
    .eq('projeto_id', projetoId);

  if (rError) throw new Error("Erro ao buscar rubricas");

  // 3. Busca o saldo atualizado (da tabela de contas ou movimentações)
  const { data: movimentacoes, error: mError } = await supabase
    .from('movimentacoes')
    .select('valor, tipo')
    .eq('projeto_id', projetoId);

  // Cálculo simples de saldo (Entradas - Saídas)
  const saldo = movimentacoes?.reduce((acc, mov) => {
    return mov.tipo === 'entrada' ? acc + Number(mov.valor) : acc - Number(mov.valor);
  }, 0) || 0;

  return {
    projeto,
    rubricas,
    saldo,
    totalCaptado: projeto.valor_captado || 0,
    orcamentoTotal: projeto.valor_total || 0
  };
}