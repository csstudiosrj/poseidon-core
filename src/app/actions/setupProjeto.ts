'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type ActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  redirectTo?: string
  fieldErrors?: {
    nome_projeto?: string[]
    orcamento_total_aprovado?: string[]
    segmento_cultural?: string[]
    mecanismo?: string[]
  }
}

const LIMITE_CAPTACAO = 150_000

function calcularRubricas(orcamento: number) {
  return [
    {
      categoria: 'Administracao',
      descricao: 'Rubrica de Administração – 15% do orçamento total (IN 29/2026)',
      valor_orcado: orcamento * 0.15,
    },
    {
      categoria: 'Captacao de Recursos',
      descricao:
        'Rubrica de Captação – 10% do orçamento, limitado a R$ 150.000,00 (IN 29/2026)',
      valor_orcado: Math.min(orcamento * 0.1, LIMITE_CAPTACAO),
    },
    {
      categoria: 'Divulgacao e Acessibilidade',
      descricao: 'Rubrica de Divulgação/Acessibilidade – 20% do orçamento total (IN 29/2026)',
      valor_orcado: orcamento * 0.2,
    },
  ]
}

export async function setupProjeto(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Inicialização correta do Supabase SSR
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

  // 1. Validação de sessão
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log('ERRO: Usuário não encontrado na sessão')
    return {
      status: 'error',
      message: 'Sessão expirada. Faça login novamente.',
    }
  }

  // 2. Extração de campos
  const nome_projeto = (formData.get('nome_projeto')?.toString() ?? '').trim()
  const orcamento_str = (formData.get('orcamento_total_aprovado')?.toString() ?? '').replace(',', '.')
  const segmento_cultural = (formData.get('segmento_cultural')?.toString() ?? '').trim()
  const mecanismo = (formData.get('mecanismo')?.toString() ?? '').trim()

  const fieldErrors: ActionState['fieldErrors'] = {}

  if (!nome_projeto) fieldErrors.nome_projeto = ['O nome do projeto é obrigatório.']

  const orcamento_total_aprovado = parseFloat(orcamento_str)
  if (isNaN(orcamento_total_aprovado) || orcamento_total_aprovado <= 0) {
    fieldErrors.orcamento_total_aprovado = ['Informe um valor válido maior que zero.']
  }

  if (!segmento_cultural) fieldErrors.segmento_cultural = ['O segmento cultural é obrigatório.']
  if (!mecanismo) fieldErrors.mecanismo = ['O mecanismo é obrigatório.']

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Corrija os campos abaixo antes de continuar.',
      fieldErrors,
    }
  }

  // 3. Inserção do projeto
  const { data: projeto, error: projetoError } = await supabase
    .from('projetos')
    .insert({
      proponente_id: user.id,
      nome_projeto,
      orcamento_total_aprovado,
      segmento_cultural,
      mecanismo,
    })
    .select('id')
    .single()

  if (projetoError || !projeto) {
    return {
      status: 'error',
      message: projetoError?.message ?? 'Erro ao criar o projeto.',
    }
  }

  // 4. Inserção das rubricas obrigatórias
  const rubricas = calcularRubricas(orcamento_total_aprovado).map((r) => ({
    ...r,
    projeto_id: projeto.id,
    proponente_id: user.id,
  }))

  const { error: rubricasError } = await supabase.from('rubricas').insert(rubricas)

  if (rubricasError) {
    // Rollback lógico
    await supabase.from('projetos').delete().eq('id', projeto.id)
    return {
      status: 'error',
      message: `Erro ao criar as rubricas: ${rubricasError.message}`,
    }
  }

  // 5. Sucesso
  return {
    status: 'success',
    message: 'Projeto criado com sucesso!',
    redirectTo: `/dashboard/${projeto.id}`,
  }
}