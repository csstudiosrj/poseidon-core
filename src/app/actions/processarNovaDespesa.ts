"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Tipos de retorno compatíveis com useActionState ─────────────────────────
export type ActionState = {
  status: "idle" | "success" | "error" | "compliance_violation";
  message: string;
  errors?: Partial<Record<keyof DespesaInput, string[]>>;
  data?: { despesa_id: string };
  compliance?: {
    codigo: string;
    rubrica: string;
    valor_atual: number;
    teto: number;
    percentual: number;
    referencia_legal: string;
  };
};

// ─── Schema Zod — validação estrita conforme IN 29/2026 ──────────────────────
const DespesaSchema = z.object({
  rubrica_id: z.string().uuid("rubrica_id inválido"),
  projeto_id: z.string().uuid("projeto_id inválido"),

  descricao: z
    .string()
    .min(3, "Descrição deve ter ao menos 3 caracteres")
    .max(500),

  beneficiario_nome: z
    .string()
    .min(2, "Nome do beneficiário obrigatório")
    .max(300),

  beneficiario_cpf_cnpj: z
    .string()
    .regex(/^\d{11}$|^\d{14}$/, "CPF (11 dígitos) ou CNPJ (14 dígitos) sem formatação")
    .optional()
    .nullable(),

  valor_bruto: z
    .number({ invalid_type_error: "Valor deve ser número" })
    .positive("Valor deve ser positivo")
    .max(15_000_000, "Valor excede limite máximo permitido"),

  valor_retencoes: z
    .number()
    .min(0)
    .default(0),

  // IN 29/2026: pagamento em espécie é vedado — somente PIX, TED, DOC, cheque nominativo
  forma_pagamento: z.enum(["pix", "ted", "doc", "cheque_nominativo"], {
    errorMap: () => ({
      message:
        "Forma de pagamento inválida. Permitido: PIX, TED, DOC ou cheque nominativo. " +
        "Pagamento em espécie é VEDADO pela IN MinC nº 29/2026, Art. 22.",
    }),
  }),

  data_pagamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data no formato YYYY-MM-DD")
    .optional()
    .nullable(),

  comprovante_transacao: z.string().max(500).optional().nullable(),
});

export type DespesaInput = z.input<typeof DespesaSchema>;

// ─── Constantes da IN 29/2026 ────────────────────────────────────────────────
const LIMITES_IN29 = {
  ADMINISTRACAO_PERC: 0.15,
  CAPTACAO_PERC: 0.10,
  CAPTACAO_ABS: 150_000,
  DIVULGACAO_ACESSIBILIDADE_PERC: 0.20,
  DIREITOS_AUTORAIS_PERC: 0.10,
  FORNECEDOR_UNICO_PERC: 0.20,
} as const;

const CATEGORIAS_PERCENTUAIS: Record<string, keyof typeof LIMITES_IN29 | null> = {
  administracao: "ADMINISTRACAO_PERC",
  captacao_recursos: "CAPTACAO_PERC",
  divulgacao_comunicacao: "DIVULGACAO_ACESSIBILIDADE_PERC",
  acessibilidade: "DIVULGACAO_ACESSIBILIDADE_PERC",
  direitos_autorais: "DIREITOS_AUTORAIS_PERC",
};

// ─── Server Action Principal ──────────────────────────────────────────────────
export async function processarNovaDespesa(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {

  // 1. Autenticação server-side — garante isolamento multi-tenant
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Sessão expirada. Faça login novamente.",
    };
  }

  const proponente_id = user.id;

  // 2. Parse e validação Zod
  const raw = {
    rubrica_id: formData.get("rubrica_id"),
    projeto_id: formData.get("projeto_id"),
    descricao: formData.get("descricao"),
    beneficiario_nome: formData.get("beneficiario_nome"),
    beneficiario_cpf_cnpj: formData.get("beneficiario_cpf_cnpj") || null,
    valor_bruto: Number(formData.get("valor_bruto")),
    valor_retencoes: Number(formData.get("valor_retencoes") ?? 0),
    forma_pagamento: formData.get("forma_pagamento"),
    data_pagamento: formData.get("data_pagamento") || null,
    comprovante_transacao: formData.get("comprovante_transacao") || null,
  };

  const parsed = DespesaSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ActionState["errors"];

    // Destaque especial para forma_pagamento (violação mais crítica)
    if (fieldErrors?.forma_pagamento) {
      return {
        status: "compliance_violation",
        message: "Forma de pagamento não permitida pela IN MinC nº 29/2026.",
        errors: fieldErrors,
        compliance: {
          codigo: "PAGAMENTO_INFORMAL_VEDADO",
          rubrica: "geral",
          valor_atual: 0,
          teto: 0,
          percentual: 0,
          referencia_legal: "IN MinC nº 29/2026, Art. 22",
        },
      };
    }

    return {
      status: "error",
      message: "Dados inválidos. Corrija os campos abaixo.",
      errors: fieldErrors,
    };
  }

  const input = parsed.data;

  // 3. Verifica ownership do projeto (RLS + validação explícita no servidor)
  const { data: projeto, error: projetoError } = await supabase
    .from("projetos")
    .select(`
      id,
      proponente_id,
      orcamento_total_aprovado,
      teto_administracao,
      teto_captacao_recursos,
      teto_divulgacao_acessibilidade,
      teto_direitos_autorais,
      status
    `)
    .eq("id", input.projeto_id)
    .eq("proponente_id", proponente_id) // isolamento multi-tenant explícito
    .single();

  if (projetoError || !projeto) {
    return {
      status: "error",
      message: "Projeto não encontrado ou sem permissão de acesso.",
    };
  }

  if (!["em_execucao", "em_captacao"].includes(projeto.status)) {
    return {
      status: "error",
      message: `Projeto com status "${projeto.status}" não aceita novas despesas.`,
    };
  }

  // 4. Busca rubrica e valida ownership
  const { data: rubrica, error: rubricaError } = await supabase
    .from("rubricas")
    .select("id, categoria, valor_executado, valor_orcado, proponente_id")
    .eq("id", input.rubrica_id)
    .eq("projeto_id", input.projeto_id)
    .eq("proponente_id", proponente_id)
    .single();

  if (rubricaError || !rubrica) {
    return {
      status: "error",
      message: "Rubrica não encontrada ou não pertence a este projeto.",
    };
  }

  // 5. Verificação de compliance — tetos da IN 29/2026
  const complianceCheck = await verificarTetosIN29({
    supabase,
    projeto,
    rubrica,
    valor_novo: input.valor_bruto,
    projeto_id: input.projeto_id,
  });

  if (complianceCheck) {
    return {
      status: "compliance_violation",
      message: complianceCheck.message,
      compliance: complianceCheck.compliance,
    };
  }

  // 6. Verifica concentração de fornecedor único (> 20% por CPF/CNPJ)
  if (input.beneficiario_cpf_cnpj) {
    const fornecedorCheck = await verificarFornecedorUnico({
      supabase,
      projeto_id: input.projeto_id,
      beneficiario_cpf_cnpj: input.beneficiario_cpf_cnpj,
      valor_novo: input.valor_bruto,
      orcamento_total: projeto.orcamento_total_aprovado,
    });

    if (fornecedorCheck) {
      return {
        status: "compliance_violation",
        message: fornecedorCheck.message,
        compliance: fornecedorCheck.compliance,
      };
    }
  }

  // 7. Insere despesa (RLS do Supabase garante proponente_id correto)
  const { data: novaDespesa, error: insertError } = await supabase
    .from("despesas")
    .insert({
      proponente_id,
      rubrica_id: input.rubrica_id,
      projeto_id: input.projeto_id,
      descricao: input.descricao,
      beneficiario_nome: input.beneficiario_nome,
      beneficiario_cpf_cnpj: input.beneficiario_cpf_cnpj ?? null,
      valor_bruto: input.valor_bruto,
      valor_retencoes: input.valor_retencoes,
      forma_pagamento: input.forma_pagamento,
      data_pagamento: input.data_pagamento ?? null,
      comprovante_transacao: input.comprovante_transacao ?? null,
      status_auditoria: "pendente",
    })
    .select("id")
    .single();

  if (insertError) {
    // Captura erros de constraint do banco (triggers de compliance)
    if (insertError.code === "P0001" || insertError.message.includes("VEDADO")) {
      return {
        status: "compliance_violation",
        message: `Despesa bloqueada pelo sistema de auditoria: ${insertError.message}`,
      };
    }

    return {
      status: "error",
      message: `Erro ao registrar despesa: ${insertError.message}`,
    };
  }

  // 8. Atualiza valor_executado na rubrica
  await supabase
    .from("rubricas")
    .update({
      valor_executado: rubrica.valor_executado + input.valor_bruto,
    })
    .eq("id", input.rubrica_id);

  // 9. Revalida cache das páginas afetadas
  revalidatePath(`/projetos/${input.projeto_id}`);
  revalidatePath(`/projetos/${input.projeto_id}/despesas`);
  revalidatePath(`/projetos/${input.projeto_id}/compliance`);

  return {
    status: "success",
    message: "Despesa registrada com sucesso.",
    data: { despesa_id: novaDespesa.id },
  };
}

// ─── Helper: Verificação de tetos percentuais ────────────────────────────────
async function verificarTetosIN29({
  supabase,
  projeto,
  rubrica,
  valor_novo,
  projeto_id,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  projeto: {
    orcamento_total_aprovado: number;
    teto_administracao: number;
    teto_captacao_recursos: number;
    teto_divulgacao_acessibilidade: number;
    teto_direitos_autorais: number;
  };
  rubrica: { categoria: string; valor_executado: number };
  valor_novo: number;
  projeto_id: string;
}): Promise<null | { message: string; compliance: ActionState["compliance"] }> {

  const orcamento = projeto.orcamento_total_aprovado;
  const cat = rubrica.categoria;

  // Teto de administração: 15% do orçamento
  if (cat === "administracao") {
    const total = rubrica.valor_executado + valor_novo;
    const teto = projeto.teto_administracao;
    if (total > teto) {
      return buildViolation("TETO_ADMINISTRACAO_EXCEDIDO", cat, total, teto, orcamento,
        "IN MinC nº 29/2026, Art. 18 §1º — Despesas administrativas limitadas a 15% do orçamento aprovado.");
    }
  }

  // Teto de captação: 10% do orçamento, máximo absoluto de R$ 150.000
  if (cat === "captacao_recursos") {
    const total = rubrica.valor_executado + valor_novo;
    const teto = projeto.teto_captacao_recursos; // já calculado como LEAST(10%, 150k) no banco
    if (total > teto) {
      return buildViolation("TETO_CAPTACAO_EXCEDIDO", cat, total, teto, orcamento,
        "IN MinC nº 29/2026, Art. 19 — Captação de recursos limitada a 10% do orçamento ou R$ 150.000 (o menor).");
    }
  }

  // Teto compartilhado divulgação + acessibilidade: 20%
  if (cat === "divulgacao_comunicacao" || cat === "acessibilidade") {
    const { data: soma } = await supabase
      .from("rubricas")
      .select("valor_executado")
      .eq("projeto_id", projeto_id)
      .in("categoria", ["divulgacao_comunicacao", "acessibilidade"]);

    const totalCateg = (soma ?? []).reduce((acc, r) => acc + r.valor_executado, 0) + valor_novo;
    const teto = projeto.teto_divulgacao_acessibilidade;

    if (totalCateg > teto) {
      return buildViolation("TETO_DIVULGACAO_ACESSIBILIDADE_EXCEDIDO", cat, totalCateg, teto, orcamento,
        "IN MinC nº 29/2026, Art. 20 — Divulgação e Acessibilidade somadas não podem exceder 20% do orçamento.");
    }
  }

  // Teto de direitos autorais: 10%
  if (cat === "direitos_autorais") {
    const total = rubrica.valor_executado + valor_novo;
    const teto = projeto.teto_direitos_autorais;
    if (total > teto) {
      return buildViolation("TETO_DIREITOS_AUTORAIS_EXCEDIDO", cat, total, teto, orcamento,
        "IN MinC nº 29/2026, Art. 21 — Direitos autorais limitados a 10% do orçamento aprovado.");
    }
  }

  return null;
}

// ─── Helper: Verificação de fornecedor único (> 20%) ─────────────────────────
async function verificarFornecedorUnico({
  supabase,
  projeto_id,
  beneficiario_cpf_cnpj,
  valor_novo,
  orcamento_total,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  projeto_id: string;
  beneficiario_cpf_cnpj: string;
  valor_novo: number;
  orcamento_total: number;
}): Promise<null | { message: string; compliance: ActionState["compliance"] }> {

  const { data } = await supabase
    .from("despesas")
    .select("valor_bruto")
    .eq("projeto_id", projeto_id)
    .eq("beneficiario_cpf_cnpj", beneficiario_cpf_cnpj)
    .not("status_auditoria", "eq", "glosada");

  const totalFornecedor =
    (data ?? []).reduce((acc, d) => acc + d.valor_bruto, 0) + valor_novo;

  const teto = orcamento_total * LIMITES_IN29.FORNECEDOR_UNICO_PERC;

  if (totalFornecedor > teto) {
    return buildViolation(
      "FORNECEDOR_UNICO_EXCEDIDO",
      "geral",
      totalFornecedor,
      teto,
      orcamento_total,
      "IN MinC nº 29/2026, Art. 27 — Fornecedor único não pode concentrar mais de 20% do orçamento total do projeto."
    );
  }

  return null;
}

// ─── Helper: Formata objeto de violação ──────────────────────────────────────
function buildViolation(
  codigo: string,
  rubrica: string,
  valor_atual: number,
  teto: number,
  orcamento: number,
  referencia_legal: string
): { message: string; compliance: ActionState["compliance"] } {
  const percentual = (valor_atual / orcamento) * 100;
  const excedente = valor_atual - teto;

  return {
    message:
      `[${codigo}] Teto excedido em R$ ${excedente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. ` +
      `Valor atual: R$ ${valor_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | ` +
      `Teto: R$ ${teto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ` +
      `(${((teto / orcamento) * 100).toFixed(1)}% do orçamento). ${referencia_legal}`,
    compliance: {
      codigo,
      rubrica,
      valor_atual,
      teto,
      percentual: Math.round(percentual * 100) / 100,
      referencia_legal,
    },
  };
} 
