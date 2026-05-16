// src/app/actions/processarNovaDespesa.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Tipo de retorno compatível com useActionState
export type ActionState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  alerta?: string
}

// Assinatura exigida pelo useActionState: (prevState, formData) => Promise<ActionState>
export async function processarNovaDespesa(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Extração e sanitização dos campos
  const projeto_id = formData.get('projeto_id')?.toString() ?? ''
  const rubrica_id = formData.get('rubrica_id')?.toString() ?? ''
  const valor_bruto_str = formData.get('valor_bruto')?.toString() ?? ''
  const cpf_cnpj_fornecedor = (formData.get('cpf_cnpj_fornecedor')?.toString() ?? '')
    .replace(/[\.\-\/]/g, '')   // remove pontos, traços e barras
  const descricao = formData.get('descricao')?.toString() ?? ''
  const data_pagamento = formData.get('data_pagamento')?.toString() ?? ''

  const valor_bruto = Number(valor_bruto_str)

  // Validação básica
  const errors: Record<string, string[]> = {}

  if (!projeto_id) errors.projeto_id = ['Projeto é obrigatório.']
  if (!rubrica_id) errors.rubrica_id = ['Rubrica é obrigatória.']
  if (!valor_bruto_str || isNaN(valor_bruto) || valor_bruto <= 0)
    errors.valor_bruto = ['Valor bruto deve ser um número positivo.']
  if (!cpf_cnpj_fornecedor) errors.cpf_cnpj_fornecedor = ['CPF/CNPJ do fornecedor é obrigatório.']
  if (!descricao) errors.descricao = ['Descrição é obrigatória.']
  if (!data_pagamento) errors.data_pagamento = ['Data de pagamento é obrigatória.']

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Dados inválidos.',
      errors,
    }
  }

  // Inicialização do Supabase (Server Side)
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
      return {
        success: false,
        message: 'Rubrica não encontrada.',
        errors: { rubrica_id: ['Rubrica inválida ou inexistente.'] },
      }
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
      return {
        success: false,
        message: 'Projeto não encontrado.',
        errors: { projeto_id: ['Projeto inválido ou inexistente.'] },
      }
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
      return {
        success: false,
        message: 'Falha ao registrar a despesa.',
      }
    }

    const despesaId = despesaInserida.id

    // 4. Atualizar valor executado da rubrica
    const { error: updateError } = await supabase
      .from('rubricas')
      .update({ valor_executado: executadoAtual + valor_bruto })
      .eq('id', rubrica_id)

    if (updateError) {
      // Rollback lógico: remove a despesa
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
        // Não revertemos; o alerta é informativo
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