// src/app/actions/processarNovaDespesa.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface ProcessarDespesaInput {
  projeto_id: string
  rubrica_id: string
  valor_bruto: number
  cpf_cnpj_fornecedor: string
  descricao: string
  data_pagamento: string
}

interface ProcessarDespesaOutput {
  success: boolean
  message: string
  alerta?: string
}

export async function processarNovaDespesa({
  projeto_id,
  rubrica_id,
  valor_bruto,
  cpf_cnpj_fornecedor,
  descricao,
  data_pagamento,
}: ProcessarDespesaInput): Promise<ProcessarDespesaOutput> {
  // ✅ Agora aguardamos a Promise
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Type assertion para ignorar a limitação de tipo Readonly
          (cookieStore as any).set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          (cookieStore as any).set({ name, value: '', ...options })
        },
      },
    },
  )

  try {
    // 1. Buscar rubrica e validar saldo
    const { data: rubrica, error: rubricaError } = await supabase
      .from('rubricas')
      .select('id, valor_orcado, valor_executado')
      .eq('id', rubrica_id)
      .single()

    if (rubricaError || !rubrica) {
      return { success: false, message: 'Rubrica não encontrada.' }
    }

    const executadoAtual = rubrica.valor_executado ?? 0
    const estouraOrcamento = valor_bruto + executadoAtual > rubrica.valor_orcado
    const statusAuditoria = estouraOrcamento ? 'glosada' : 'aprovada'

    // 2. Buscar proponente do projeto
    const { data: projeto, error: projetoError } = await supabase
      .from('projetos')
      .select('proponente_id')
      .eq('id', projeto_id)
      .single()

    if (projetoError || !projeto) {
      return { success: false, message: 'Projeto não encontrado.' }
    }

    // 3. Inserir despesa
    const { data: despesaInserida, error: insertError } = await supabase
      .from('despesas')
      .insert({
        projeto_id,
        rubrica_id,
        proponente_id: projeto.proponente_id,
        valor_bruto,
        beneficiario_cpf_cnpj: cpf_cnpj_fornecedor,
        descricao,
        data_pagamento,
        status_auditoria: statusAuditoria,
      })
      .select('id')
      .single()

    if (insertError || !despesaInserida) {
      return { success: false, message: 'Falha ao registrar a despesa.' }
    }

    const despesaId = despesaInserida.id

    // 4. Atualizar valor executado da rubrica
    const { error: updateError } = await supabase
      .from('rubricas')
      .update({ valor_executado: executadoAtual + valor_bruto })
      .eq('id', rubrica_id)

    if (updateError) {
      // Rollback lógico
      await supabase.from('despesas').delete().eq('id', despesaId)
      return {
        success: false,
        message: 'Falha ao atualizar o saldo da rubrica. Operação revertida.',
      }
    }

    // 5. Alerta de compliance se glosada
    if (statusAuditoria === 'glosada') {
      const { error: alertaError } = await supabase
        .from('compliance_alertas')
        .insert({
          projeto_id,
          nivel: 'critico',
          codigo: 'SALDO_INSUFICIENTE',
          mensagem: `Despesa glosada por insuficiência de saldo orçamentário (R$ ${valor_bruto} excede o disponível). Base legal: IN 29/2026.`,
        })

      if (alertaError) {
        console.error('Erro ao gerar alerta de compliance:', alertaError)
      }

      return {
        success: true,
        message: 'Despesa registrada, porém glosada por falta de saldo.',
        alerta: 'SALDO_INSUFICIENTE',
      }
    }

    return {
      success: true,
      message: 'Despesa processada com sucesso.',
    }
  } catch (erro) {
    console.error('Erro inesperado:', erro)
    return {
      success: false,
      message: 'Erro interno ao processar a despesa.',
    }
  }
}