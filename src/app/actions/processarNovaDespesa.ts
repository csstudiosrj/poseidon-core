"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  status: "idle" | "success" | "error" | "compliance_violation";
  message?: string;
  field_errors?: {
    rubrica_id?: string[];
    descricao?: string[];
    beneficiario_nome?: string[];
    beneficiario_cpf_cnpj?: string[];
    valor_bruto?: string[];
    valor_retencoes?: string[];
    forma_pagamento?: string[];
    data_pagamento?: string[];
    comprovante_transacao?: string[];
  };
  violation?: {
    rubrica: string;
    categoria: string;
    valor_tentado: number;
    teto_legal: number;
    valor_executado_atual: number;
    referencia_legal: string;
  };
};

const FORMAS_PAGAMENTO_VALIDAS = ["pix", "ted", "doc", "cheque_nominativo"] as const;
type FormaPagamento = typeof FORMAS_PAGAMENTO_VALIDAS[number];

const REGRAS: Record<string, { percentual: number | null; absoluto: number | null; referencia: string }> = {
  administracao: {
    percentual: 0.15,
    absoluto: null,
    referencia: "IN MinC nº 29/2026, Art. 18 — Administração ≤ 15% do orçamento total",
  },
  captacao_recursos: {
    percentual: 0.10,
    absoluto: 150000,
    referencia: "IN MinC nº 29/2026, Art. 19 — Captação ≤ 10% (máx. R$ 150.000)",
  },
  divulgacao_comunicacao: {
    percentual: 0.20,
    absoluto: null,
    referencia: "IN MinC nº 29/2026, Art. 20 — Divulg.+Acessib. (teto compartilhado) ≤ 20%",
  },
  acessibilidade: {
    percentual: 0.20,
    absoluto: null,
    referencia: "IN MinC nº 29/2026, Art. 20 — Divulg.+Acessib. (teto compartilhado) ≤ 20%",
  },
  direitos_autorais: {
    percentual: 0.10,
    absoluto: null,
    referencia: "IN MinC nº 29/2026 — Direitos Autorais ≤ 10%",
  },
  cache_artista_individual: {
    percentual: null,
    absoluto: 25000,
    referencia: "IN MinC nº 29/2026 — Cachê artista individual ≤ R$ 25.000/apresentação",
  },
  cache_artista_grupo: {
    percentual: null,
    absoluto: 50000,
    referencia: "IN MinC nº 29/2026 — Cachê grupo ≤ R$ 50.000/apresentação",
  },
  cache_musico_orquestra: {
    percentual: null,
    absoluto: 5000,
    referencia: "IN MinC nº 29/2026 — Cachê músico de orquestra ≤ R$ 5.000/projeto",
  },
  cache_maestro: {
    percentual: null,
    absoluto: 25000,
    referencia: "IN MinC nº 29/2026 — Cachê maestro ≤ R$ 25.000/projeto",
  },
};

function calcularTetoLegal(categoria: string, orcamentoTotal: number): number {
  const regra = REGRAS[categoria];
  if (!regra) return Infinity;

  if (regra.percentual !== null) {
    const tetoPercentual = regra.percentual * orcamentoTotal;
    return regra.absoluto !== null ? Math.min(tetoPercentual, regra.absoluto) : tetoPercentual;
  }

  return regra.absoluto ?? Infinity;
}

export async function processarNovaDespesa(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  // Campos obrigatórios do schema real
  const rubrica_id          = String(formData.get("rubrica_id") ?? "").trim();
  const descricao           = String(formData.get("descricao") ?? "").trim();
  const beneficiario_nome   = String(formData.get("beneficiario_nome") ?? "").trim();
  const beneficiario_cpf_cnpj = String(formData.get("beneficiario_cpf_cnpj") ?? "").trim() || null;
  const valor_bruto         = Number(String(formData.get("valor_bruto") ?? "0").replace(",", "."));
  const valor_retencoes     = Number(String(formData.get("valor_retencoes") ?? "0").replace(",", "."));
  const forma_pagamento_raw = String(formData.get("forma_pagamento") ?? "").trim().toLowerCase();
  const data_pagamento      = String(formData.get("data_pagamento") ?? "").trim() || null;
  const comprovante_transacao = String(formData.get("comprovante_transacao") ?? "").trim() || null;

  // Validações de campo
  const field_errors: ActionState["field_errors"] = {};
  if (!rubrica_id) field_errors.rubrica_id = ["Selecione uma rubrica."];
  if (!descricao) field_errors.descricao = ["Informe a descrição da despesa."];
  if (!beneficiario_nome) field_errors.beneficiario_nome = ["Informe o nome do beneficiário."];
  if (!Number.isFinite(valor_bruto) || valor_bruto <= 0) field_errors.valor_bruto = ["Informe um valor bruto válido."];
  if (!Number.isFinite(valor_retencoes) || valor_retencoes < 0) field_errors.valor_retencoes = ["Retenções inválidas."];
  if (!FORMAS_PAGAMENTO_VALIDAS.includes(forma_pagamento_raw as FormaPagamento)) {
    field_errors.forma_pagamento = ["Forma de pagamento inválida. Use PIX, TED, DOC ou Cheque Nominativo."];
  }

  if (Object.values(field_errors).some((v) => v && v.length > 0)) {
    return { status: "error", message: "Corrija os campos indicados.", field_errors };
  }

  // Busca rubrica + projeto (para checar tetos)
  const { data: rubrica, error: rubricaError } = await supabase
    .from("rubricas")
    .select(`
      id,
      categoria,
      descricao,
      valor_orcado,
      valor_executado,
      projeto_id,
      projetos!inner(
        id,
        orcamento_total_aprovado,
        nome_projeto
      )
    `)
    .eq("id", rubrica_id)
    .eq("proponente_id", user.id)
    .single();

  if (rubricaError || !rubrica) {
    return { status: "error", message: "Rubrica não encontrada ou sem permissão de acesso." };
  }

  const projeto = (rubrica.projetos as unknown as {
    id: string;
    orcamento_total_aprovado: number;
    nome_projeto: string;
  });

  const orcamentoTotal        = Number(projeto.orcamento_total_aprovado);
  const valorExecutadoAtual   = Number(rubrica.valor_executado ?? 0);
  const categoria             = rubrica.categoria as string;
  const tetoLegal             = calcularTetoLegal(categoria, orcamentoTotal);

  // Teto compartilhado: divulgacao_comunicacao + acessibilidade somam juntos
  let valorAcumuladoCategoria = valorExecutadoAtual;
  if (categoria === "divulgacao_comunicacao" || categoria === "acessibilidade") {
    const { data: rubricasIrmas } = await supabase
      .from("rubricas")
      .select("valor_executado")
      .eq("projeto_id", projeto.id)
      .in("categoria", ["divulgacao_comunicacao", "acessibilidade"])
      .neq("id", rubrica_id);

    const somaIrmas = (rubricasIrmas ?? []).reduce(
      (acc, r) => acc + Number(r.valor_executado ?? 0),
      0
    );
    valorAcumuladoCategoria = valorExecutadoAtual + somaIrmas;
  }

  const projecao = valorAcumuladoCategoria + valor_bruto - valor_retencoes;
  const referencia = REGRAS[categoria]?.referencia ?? "IN MinC nº 29/2026";

  if (projecao > tetoLegal) {
    return {
      status: "compliance_violation",
      message: `Violação detectada: a despesa de R$ ${(valor_bruto - valor_retencoes).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} excederia o teto legal de R$ ${tetoLegal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para a rubrica "${rubrica.descricao}". Operação bloqueada.`,
      violation: {
        rubrica: rubrica.descricao,
        categoria,
        valor_tentado: valor_bruto - valor_retencoes,
        teto_legal: tetoLegal,
        valor_executado_atual: valorAcumuladoCategoria,
        referencia_legal: referencia,
      },
    };
  }

  // Insere a despesa — valor_liquido é GENERATED ALWAYS no banco
  const { error: insertError } = await supabase.from("despesas").insert({
    proponente_id: user.id,
    rubrica_id,
    projeto_id: projeto.id,
    descricao,
    beneficiario_nome,
    beneficiario_cpf_cnpj,
    valor_bruto,
    valor_retencoes,
    forma_pagamento: forma_pagamento_raw,
    data_pagamento: data_pagamento || null,
    comprovante_transacao: comprovante_transacao || null,
    status_auditoria: "pendente",
  });

  if (insertError) {
    return {
      status: "error",
      message: `Erro ao inserir despesa: ${insertError.message}`,
    };
  }

  // Atualiza valor_executado na rubrica
  const novoExecutado = valorExecutadoAtual + (valor_bruto - valor_retencoes);
  const { error: updateRubricaError } = await supabase
    .from("rubricas")
    .update({ valor_executado: novoExecutado })
    .eq("id", rubrica_id);

  if (updateRubricaError) {
    return {
      status: "error",
      message: `Despesa inserida, mas falhou ao atualizar rubrica: ${updateRubricaError.message}`,
    };
  }

  return {
    status: "success",
    message: `Despesa de R$ ${(valor_bruto - valor_retencoes).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} registrada com sucesso na rubrica "${rubrica.descricao}".`,
  };
}