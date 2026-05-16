// src/app/actions/processarNovaDespesa.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type ActionState = {
  status: 'idle' | 'success' | 'error' | 'compliance_violation'
  message?: string
  field_errors?: Record<string, string[]>
  violation?: {
    rubrica: string
    categoria: string
    valor_tentado: number
    valor_executado_atual: number
    teto_legal: number
    referencia_legal: string
  }
}

export async function processarNovaDespesa(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extrai e sanitiza os campos
  const projeto_id = formData.get('projeto_id')?.toString() ?? ''
  const rubrica_id = formData.get('rubrica_id')?.toString() ?? ''
  const valor_bruto_str = formData.get('valor_bruto')?.toString() ?? ''
  const beneficiario_cpf_cnpj = (
    formData.get('beneficiario_cpf_cnpj')?.toString() ?? ''
  ).replace(/[\.\-\/]/g, '')
  const descricao = formData.get('descricao')?.toString() ?? ''
  const data_pagamento = formData.get('data_pagamento')?.toString() ?? ''

  const valor_bruto = Number(valor_bruto_str)

  // Validação dos campos obrigatórios
  const field_errors: Record<string, string[]> = {}

  if (!projeto_id) field_errors.projeto_id = ['Projeto é obrigatório.']
  if (!rubrica_id) field_errors.rubrica_id = ['Rubrica é obrigatória.']
  if (!valor_bruto_str || isNaN(valor_bruto) || valor_bruto <= 0)
    field_errors.valor_bruto = ['Valor bruto deve ser um número positivo.']
  if (!beneficiario_cpf_cnpj)
    field_errors.beneficiario_cpf_cnpj = ['CPF/CNPJ do beneficiário é obrigatório.']
  if (!descricao) field_errors.descricao = ['Descrição é obrigatória.']
  if (!data_pagamento) field_errors.data_pagamento = ['Data de pagamento é obrigatória.']

  if (Object.keys(field_errors).length > 0) {
    return {
      status: 'error',
      message: 'Dados inválidos.',
      field_errors,
    }
  }

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
          ;(cookieStore as any).set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          ;(cookieStore as any).set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    // 1. Busca rubrica com dados completos para auditoria
    const { data: rubrica, error: rubricaError } = await supabase
      .from('rubricas')
      .select(
        'id, valor_orcado, valor_executado, descricao, categoria, teto_legal, referencia_legal'
      )
      .eq('id', rubrica_id)
      .single()

    if (rubricaError || !rubrica) {
      return {
        status: 'error',
        message: 'Rubrica não encontrada.',
        field_errors: { rubrica_id: ['Rubrica inválida.'] },
      }
    }

    const executadoAtual = rubrica.valor_executado ?? 0
    const estouraOrcamento = valor_bruto + executadoAtual > rubrica.valor_orcado
    const statusAuditoria = estouraOrcamento ? 'glosada' : 'aprovada'

    // 2. Proponente do projeto
    const { data: projeto, error: projetoError } = await supabase
      .from('projetos')
      .select('proponente_id')
      .eq('id', projeto_id)
      .single()

    if (projetoError || !projeto) {
      return {
        status: 'error',
        message: 'Projeto não encontrado.',
        field_errors: { projeto_id: ['Projeto inválido.'] },
      }
    }

    // 3. Insere a despesa
    const { data: despesaInserida, error: insertError } = await supabase
      .from('despesas')
      .insert({
        projeto_id,
        rubrica_id,
        proponente_id: projeto.proponente_id,
        valor_bruto,
        beneficiario_cpf_cnpj,
        descricao,
        data_pagamento,
        status_auditoria: statusAuditoria,
      })
      .select('id')
      .single()

    if (insertError || !despesaInserida) {
      return {
        status: 'error',
        message: 'Falha ao registrar a despesa.',
      }
    }

    const despesaId = despesaInserida.id

    // 4. Atualiza saldo da rubrica
    const { error: updateError } = await supabase
      .from('rubricas')
      .update({ valor_executado: executadoAtual + valor_bruto })
      .eq('id', rubrica_id)

    if (updateError) {
      // Rollback lógico
      await supabase.from('despesas').delete().eq('id', despesaId)
      return {
        status: 'error',
        message: 'Falha ao atualizar o saldo da rubrica. Operação revertida.',
      }
    }

    // 5. Se foi glosada, gera alerta e retorna violação
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
        status: 'compliance_violation',
        message: 'Despesa registrada, porém glosada por falta de saldo.',
        violation: {
          rubrica: rubrica.descricao,
          categoria: rubrica.categoria,
          valor_tentado: valor_bruto,
          valor_executado_atual: executadoAtual,
          teto_legal: rubrica.teto_legal,
          referencia_legal: rubrica.referencia_legal,
        },
      }
    }

    return {
      status: 'success',
      message: 'Despesa processada com sucesso.',
    }
  } catch (erro) {
    console.error('Erro inesperado:', erro)
    return {
      status: 'error',
      message: 'Erro interno ao processar a despesa.',
    }
  }
}