"use server";

import { supabase } from '@/lib/supabase';

export async function processarNovaDespesa(dados: {
  projetoId: string;
  rubricaId: string;
  valor: number;
  descricao: string;
}) {
  // 1. Verificar se a rubrica existe e qual o seu teto
  const { data: rubrica } = await supabase
    .from('rubricas')
    .select('*')
    .eq('id', dados.rubricaId)
    .single();

  if (!rubrica) return { success: false, error: "Rubrica não encontrada" };

  // 2. Lógica de Validação (O "Coração" do Poseidon)
  const novoTotal = Number(rubrica.executado) + dados.valor;
  const teto = Number(rubrica.teto_maximo);

  if (teto > 0 && novoTotal > teto) {
    // Registra a tentativa de violação no log de auditoria
    await supabase.from('logs_auditoria').insert({
      projeto_id: dados.projetoId,
      tipo: 'violation_attempt',
      mensagem: `Tentativa de exceder teto na rubrica ${rubrica.nome}. Valor: ${dados.valor}`,
      criticidade: 'high'
    });

    return { 
      success: false, 
      error: `Violação de teto: O limite para ${rubrica.nome} é R$ ${teto}.` 
    };
  }

  // 3. Se passou na validação, atualiza o executado e registra a movimentação
  const { error: updateError } = await supabase
    .from('rubricas')
    .update({ executado: novoTotal })
    .eq('id', dados.rubricaId);

  if (updateError) return { success: false, error: "Erro ao atualizar rubrica" };

  await supabase.from('movimentacoes').insert({
    projeto_id: dados.projetoId,
    rubrica_id: dados.rubricaId,
    valor: dados.valor,
    tipo: 'saida',
    descricao: dados.descricao
  });

  return { success: true };
}