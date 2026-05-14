"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — 100% idênticos à interface ActionState do Dashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────

export type ActionStatus =
  | "idle"
  | "success"
  | "error"
  | "compliance_violation";

export interface ActionState {
  status: ActionStatus;
  message?: string;
  field_errors?: Record<string, string[]>;
  violation?: {
    rubrica: string;
    teto_legal: number;
    valor_executado: number;
    percentual_excedido: number;
    referencia_legal: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES — Tetos da IN MinC nº 29/2026
// ─────────────────────────────────────────────────────────────────────────────

const TETOS_IN29: Record<
  string,
  { percentual: number | null; absoluto: number | null; descricao: string }
> = {
  administracao: {
    percentual: 0.15,
    absoluto: null,
    descricao: "IN MinC nº 29/2026, Art. 18 — Administração ≤ 15%",
  },
  captacao_recursos: {
    percentual: 0.10,
    absoluto: 150_000,
    descricao: "IN MinC nº 29/2026, Art. 19 — Captação ≤ 10% / máx. R$ 150.000",
  },
  divulgacao_comunicacao: {
    percentual: 0.20,
    absoluto: null,
    descricao:
      "IN MinC nº 29/2026, Art. 20 — Divulg.+Acessib. (teto compartilhado) ≤ 20%",
  },
  acessibilidade: {
    percentual: 0.20,
    absoluto: null,
    descricao:
      "IN MinC nº 29/2026, Art. 20 — Divulg.+Acessib. (teto compartilhado) ≤ 20%",
  },
  direitos_autorais: {
    percentual: 0.10,
    absoluto: null,
    descricao: "IN MinC nº 29/2026, Art. 21 — Direitos Autorais ≤ 10%",
  },
  cache_artista_individual: {
    percentual: null,
    absoluto: 25_000,
    descricao:
      "IN MinC nº 29/2026, Art. 22 — Cachê artista individual ≤ R$ 25.000/apresentação",
  },
  cache_artista_grupo: {
    percentual: null,
    absoluto: 50_000,
    descricao:
      "IN MinC nº 29/2026, Art. 22 — Cachê grupo ≤ R$ 50.000/apresentação",
  },
  cache_musico_orquestra: {
    percentual: null,
    absoluto: 5_000,
    descricao:
      "IN MinC nº 29/2026, Art. 22 — Cachê músico orquestra ≤ R$ 5.000/projeto",
  },
  cache_maestro: {
    percentual: null,
    absoluto: 25_000,
    descricao:
      "IN MinC nº 29/2026, Art. 22 — Cachê maestro ≤ R$ 25.000/projeto",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMA — sintaxe correta para Zod v3
// ─────────────────────────────────────────────────────────────────────────────
//
// CORREÇÃO APLICADA:
//   ❌  z.number({ invalid_type_error: "..." })   ← não existe em Zod v3
//   ✅  z.coerce.number({ message: "..." })        ← sintaxe correta
//
// z.coerce.number() converte a string vinda do FormData para number
// automaticamente, evitando erros de tipo ao usar com useActionState.
// ─────────────────────────────────────────────────────────────────────────────

const DespesaSchema = z.object({
  rubrica_id: z
    .string({ message: "Selecione uma rubrica." })
    .min(1, { message: "Selecione uma rubrica." }),

  descricao: z
    .string({ message: "Informe a descrição da despesa." })
    .min(5,  { message: "Descrição deve ter no mínimo 5 caracteres." })
    .max(500, { message: "Descrição deve ter no máximo 500 caracteres." }),

  // z.coerce.number() é a sintaxe correta para FormData (string → number)
  valor_bruto: z.coerce
    .number({ message: "Informe um valor numérico válido." })
    .positive({ message: "O valor deve ser maior que zero." })
    .max(10_000_000, { message: "Valor excede o limite por lançamento." }),

  valor_retencoes: z.coerce
    .number({ message: "Informe o valor de retenções (0 se não houver)." })
    .min(0, { message: "Retenções não podem ser negativas." })
    .default(0),

  cnpj_fornecedor: z
    .string({ message: "Informe o CNPJ do fornecedor." })
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      { message: "CNPJ inválido. Use o formato 00.000.000/0001-00." }
    ),

  forma_pagamento: z.enum(["PIX", "TED", "DOC"], {
    message: "Forma de pagamento inválida. Use PIX, TED ou DOC.",
  }),

  data_pagamento: z
    .string({ message: "Informe a data do pagamento." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida. Use AAAA-MM-DD." }),

  numero_nota_fiscal: z
    .string()
    .max(50, { message: "Número de NF deve ter no máximo 50 caracteres." })
    .optional(),
});

// Tipo inferido do schema — usado internamente
type DespesaInput = z.infer<typeof DespesaSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE CLIENT (Server-side)
// ─────────────────────────────────────────────────────────────────────────────

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Verificação de compliance IN 29/2026
// ─────────────────────────────────────────────────────────────────────────────

interface RubricaRow {
  id: string;
  categoria: string;
  orcamento_total: number;
  total_executado: number; // soma das despesas já aprovadas
  nome: string;
}

/**
 * Verifica se o novo valor viola algum teto da IN 29/2026.
 * Retorna null se estiver em conformidade, ou o objeto violation se houver violação.
 */
function verificarTeto(
  rubrica: RubricaRow,
  novoValorLiquido: number
): ActionState["violation"] | null {
  const regra = TETOS_IN29[rubrica.categoria];
  if (!regra) return null; // categoria sem teto explícito

  const projetado = rubrica.total_executado + novoValorLiquido;
  const orcamento = rubrica.orcamento_total;

  // Verifica teto percentual
  if (regra.percentual !== null) {
    const teto_legal     = regra.percentual * orcamento;
    const teto_efetivo   = regra.absoluto
      ? Math.min(teto_legal, regra.absoluto)
      : teto_legal;

    if (projetado > teto_efetivo) {
      return {
        rubrica:              rubrica.nome,
        teto_legal:           teto_efetivo,
        valor_executado:      projetado,
        percentual_excedido:  ((projetado - teto_efetivo) / teto_efetivo) * 100,
        referencia_legal:     regra.descricao,
      };
    }
  }

  // Verifica teto absoluto isolado (ex: cachês)
  if (regra.absoluto !== null && regra.percentual === null) {
    if (novoValorLiquido > regra.absoluto) {
      return {
        rubrica:              rubrica.nome,
        teto_legal:           regra.absoluto,
        valor_executado:      novoValorLiquido,
        percentual_excedido:  ((novoValorLiquido - regra.absoluto) / regra.absoluto) * 100,
        referencia_legal:     regra.descricao,
      };
    }
  }

  return null;
}

/**
 * Verifica concentração de fornecedor: nenhum único CNPJ pode
 * ultrapassar 20% do orçamento total do projeto.
 */
async function verificarConcentracaoFornecedor(
  supabase: ReturnType<typeof getSupabaseServer>,
  proponenteId: string,
  projetoId: string,
  cnpj: string,
  novoValor: number,
  orcamentoTotal: number
): Promise<ActionState["violation"] | null> {
  const { data, error } = await supabase
    .from("despesas")
    .select("valor_liquido")
    .eq("proponente_id", proponenteId)
    .eq("projeto_id",    projetoId)
    .eq("cnpj_fornecedor", cnpj)
    .eq("status_auditoria", "aprovado");

  if (error) return null; // fail-open na verificação secundária

  const totalFornecedor =
    (data ?? []).reduce((acc: number, d: { valor_liquido: number }) => acc + d.valor_liquido, 0) +
    novoValor;

  const percentual = (totalFornecedor / orcamentoTotal) * 100;

  if (percentual > 20) {
    return {
      rubrica:              `Concentração de fornecedor — CNPJ ${cnpj}`,
      teto_legal:           orcamentoTotal * 0.20,
      valor_executado:      totalFornecedor,
      percentual_excedido:  percentual - 20,
      referencia_legal:
        "IN MinC nº 29/2026, Art. 25 — Fornecedor único ≤ 20% do orçamento",
    };
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER ACTION — processarNovaDespesa
// ─────────────────────────────────────────────────────────────────────────────

export async function processarNovaDespesa(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Parse e validação do FormData
  const raw = Object.fromEntries(formData.entries());
  const parsed = DespesaSchema.safeParse(raw);

  if (!parsed.success) {
    const field_errors: Record<string, string[]> = {};
    for (const [field, msgs] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      field_errors[field] = msgs as string[];
    }
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      field_errors,
    };
  }

  const data: DespesaInput = parsed.data;
  const valor_liquido       = data.valor_bruto - (data.valor_retencoes ?? 0);

  // 2. Inicializa Supabase
  let supabase: ReturnType<typeof getSupabaseServer>;
  try {
    supabase = getSupabaseServer();
  } catch {
    return {
      status: "error",
      message: "Erro de configuração do servidor. Contate o administrador.",
    };
  }

  // 3. Busca a rubrica + totais atuais (RLS garante isolamento por proponente)
  const { data: rubricaData, error: rubricaError } = await supabase
    .from("rubricas")
    .select(`
      id,
      categoria,
      nome,
      projetos!inner(
        orcamento_total_aprovado,
        proponente_id
      ),
      despesas(valor_liquido, status_auditoria)
    `)
    .eq("id", data.rubrica_id)
    .single();

  if (rubricaError || !rubricaData) {
    return {
      status: "error",
      message: "Rubrica não encontrada ou sem permissão de acesso.",
    };
  }

  // Monta RubricaRow para as verificações
  const despesasAprovadas = (
    (rubricaData as any).despesas as Array<{
      valor_liquido: number;
      status_auditoria: string;
    }>
  ).filter((d) => d.status_auditoria === "aprovado");

  const rubricaRow: RubricaRow = {
    id:               rubricaData.id as string,
    categoria:        rubricaData.categoria as string,
    nome:             rubricaData.nome as string,
    orcamento_total:  (rubricaData as any).projetos.orcamento_total_aprovado as number,
    total_executado:  despesasAprovadas.reduce((acc, d) => acc + d.valor_liquido, 0),
  };

  const proponenteId = (rubricaData as any).projetos.proponente_id as string;
  const projetoId    = (rubricaData as any).projeto_id            as string;

  // 4. Verifica teto da rubrica (IN 29/2026)
  const violacaoTeto = verificarTeto(rubricaRow, valor_liquido);
  if (violacaoTeto) {
    return {
      status:    "compliance_violation",
      message:   `Despesa viola o teto estabelecido pela ${violacaoTeto.referencia_legal}.`,
      violation: violacaoTeto,
    };
  }

  // 5. Verifica concentração de fornecedor (IN 29/2026, Art. 25)
  const violacaoConcentracao = await verificarConcentracaoFornecedor(
    supabase,
    proponenteId,
    projetoId,
    data.cnpj_fornecedor,
    valor_liquido,
    rubricaRow.orcamento_total
  );
  if (violacaoConcentracao) {
    return {
      status:    "compliance_violation",
      message:   `Fornecedor atingiu concentração acima de 20% — ${violacaoConcentracao.referencia_legal}.`,
      violation: violacaoConcentracao,
    };
  }

  // 6. Insere a despesa (RLS do Supabase aplica proponente_id automaticamente)
  const { error: insertError } = await supabase.from("despesas").insert({
    rubrica_id:          data.rubrica_id,
    descricao:           data.descricao,
    valor_bruto:         data.valor_bruto,
    valor_retencoes:     data.valor_retencoes ?? 0,
    valor_liquido,
    cnpj_fornecedor:     data.cnpj_fornecedor,
    forma_pagamento:     data.forma_pagamento,
    data_pagamento:      data.data_pagamento,
    numero_nota_fiscal:  data.numero_nota_fiscal ?? null,
    status_auditoria:    "pendente",
    proponente_id:       proponenteId,
  });

  if (insertError) {
    console.error("[processarNovaDespesa] insert error:", insertError);
    return {
      status:  "error",
      message: "Erro ao registrar a despesa no banco de dados. Tente novamente.",
    };
  }

  // 7. Sucesso
  return {
    status:  "success",
    message: `Despesa "${data.descricao}" de ${new Intl.NumberFormat("pt-BR", {
      style:    "currency",
      currency: "BRL",
    }).format(valor_liquido)} registrada com sucesso e enviada para auditoria.`,
  };
}