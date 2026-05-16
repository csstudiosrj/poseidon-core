"use server";

import { createClient } from "@/lib/supabase/server";

/* ============================================================
   Tipo exportado — consumido pelo setup-form.tsx
   Objeto unico com campos opcionais evita o problema de
   narrowing de union na dependency array do useEffect.
   ============================================================ */
export type ActionState = {
  status:      "idle" | "success" | "error";
  message?:    string;
  redirectTo?: string;
  fieldErrors?: {
    nome_projeto?:             string[];
    orcamento_total_aprovado?: string[];
    segmento_cultural?:        string[];
    mecanismo?:                string[];
  };
};

/* ============================================================
   Constantes IN 29/2026
   ============================================================ */
const LIMITE_CAPTACAO = 150_000;

function calcularRubricas(orcamento: number) {
  return [
    {
      categoria:    "Administracao",
      descricao:    "Rubrica de Administracao - 15% do orcamento total (IN 29/2026)",
      valor_orcado: orcamento * 0.15,
    },
    {
      categoria:    "Captacao de Recursos",
      descricao:    "Rubrica de Captacao - 10% do orcamento, limitado a R$ 150.000,00 (IN 29/2026)",
      valor_orcado: Math.min(orcamento * 0.10, LIMITE_CAPTACAO),
    },
    {
      categoria:    "Divulgacao e Acessibilidade",
      descricao:    "Rubrica de Divulgacao/Acessibilidade - 20% do orcamento total (IN 29/2026)",
      valor_orcado: orcamento * 0.20,
    },
  ];
}

/* ============================================================
   Action principal
   ============================================================ */
export async function setupProjeto(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  /* 1. Valida sessao */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status:  "error",
      message: "Sessao expirada. Faca login novamente.",
    };
  }

  /* 2. Extrai campos */
  const nome_projeto      = String(formData.get("nome_projeto")             ?? "").trim();
  const orcamento_str     = String(formData.get("orcamento_total_aprovado") ?? "").replace(",", ".");
  const segmento_cultural = String(formData.get("segmento_cultural")        ?? "").trim();
  const mecanismo         = String(formData.get("mecanismo")                ?? "").trim();

  /* 3. Validacao por campo */
  const fieldErrors: ActionState["fieldErrors"] = {};

  if (!nome_projeto) {
    fieldErrors.nome_projeto = ["O nome do projeto e obrigatorio."];
  }

  const orcamento_total_aprovado = parseFloat(orcamento_str);
  if (isNaN(orcamento_total_aprovado) || orcamento_total_aprovado <= 0) {
    fieldErrors.orcamento_total_aprovado = ["Informe um valor valido maior que zero."];
  }

  if (!segmento_cultural) {
    fieldErrors.segmento_cultural = ["O segmento cultural e obrigatorio."];
  }

  if (!mecanismo) {
    fieldErrors.mecanismo = ["O mecanismo e obrigatorio."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status:      "error",
      message:     "Corrija os campos abaixo antes de continuar.",
      fieldErrors,
    };
  }

  /* 4. Insere o projeto */
  const { data: projeto, error: projetoError } = await supabase
    .from("projetos")
    .insert({
      proponente_id:            user.id,
      nome_projeto,
      orcamento_total_aprovado,
      segmento_cultural,
      mecanismo,
    })
    .select("id")
    .single();

  if (projetoError || !projeto) {
    return {
      status:  "error",
      message: projetoError?.message ?? "Erro ao criar o projeto.",
    };
  }

  /* 5. Insere as 3 rubricas obrigatorias */
  const rubricas = calcularRubricas(orcamento_total_aprovado).map((r) => ({
    ...r,
    projeto_id:    projeto.id,
    proponente_id: user.id,
  }));

  const { error: rubricasError } = await supabase
    .from("rubricas")
    .insert(rubricas);

  if (rubricasError) {
    /* Rollback logico: remove o projeto para nao deixar registro sem rubricas */
    await supabase.from("projetos").delete().eq("id", projeto.id);
    return {
      status:  "error",
      message: `Erro ao criar as rubricas: ${rubricasError.message}`,
    };
  }

  /* 6. Sucesso — setup-form.tsx faz o redirect via useEffect */
  return {
    status:     "success",
    message:    "Projeto criado com sucesso!",
    redirectTo: `/dashboard/${projeto.id}`,
  };
}