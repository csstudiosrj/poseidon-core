"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/* ============================================================
   Tipos
   ============================================================ */
type SetupProjetoResult =
  | { status: "success"; projetoId: string }
  | { status: "error"; message: string };

/* ============================================================
   Constantes das rubricas obrigatorias (IN 29/2026)
   ============================================================ */
const LIMITE_CAPTACAO = 150_000;

function calcularRubricas(orcamento: number) {
  const administracao   = orcamento * 0.15;
  const captacaoRaw     = orcamento * 0.10;
  const captacao        = Math.min(captacaoRaw, LIMITE_CAPTACAO);
  const divulgacao      = orcamento * 0.20;

  return [
    {
      categoria:   "Administracao",
      descricao:   "Rubrica de Administracao - 15% do orcamento total (IN 29/2026)",
      valor_orcado: administracao,
    },
    {
      categoria:   "Captacao de Recursos",
      descricao:   "Rubrica de Captacao - 10% do orcamento, limitado a R$ 150.000,00 (IN 29/2026)",
      valor_orcado: captacao,
    },
    {
      categoria:   "Divulgacao e Acessibilidade",
      descricao:   "Rubrica de Divulgacao/Acessibilidade - 20% do orcamento total (IN 29/2026)",
      valor_orcado: divulgacao,
    },
  ];
}

/* ============================================================
   Action principal
   ============================================================ */
export async function setupProjeto(
  _prevState: SetupProjetoResult | null,
  formData: FormData
): Promise<SetupProjetoResult> {
  const supabase = await createClient();

  /* 1. Valida sessao */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "error", message: "Sessao expirada. Faca login novamente." };
  }

  /* 2. Extrai e valida campos do formulario */
  const nome_projeto              = String(formData.get("nome_projeto") ?? "").trim();
  const orcamento_str             = String(formData.get("orcamento_total_aprovado") ?? "").replace(",", ".");
  const segmento_cultural         = String(formData.get("segmento_cultural") ?? "").trim();
  const mecanismo                 = String(formData.get("mecanismo") ?? "").trim();

  if (!nome_projeto) {
    return { status: "error", message: "O nome do projeto e obrigatorio." };
  }

  const orcamento_total_aprovado = parseFloat(orcamento_str);

  if (isNaN(orcamento_total_aprovado) || orcamento_total_aprovado <= 0) {
    return { status: "error", message: "Informe um orcamento valido maior que zero." };
  }

  if (!segmento_cultural) {
    return { status: "error", message: "O segmento cultural e obrigatorio." };
  }

  if (!mecanismo) {
    return { status: "error", message: "O mecanismo e obrigatorio." };
  }

  /* 3. Insere o projeto */
  const { data: projeto, error: projetoError } = await supabase
    .from("projetos")
    .insert({
      proponente_id:           user.id,
      nome_projeto,
      orcamento_total_aprovado,
      segmento_cultural,
      mecanismo,
    })
    .select("id")
    .single();

  if (projetoError || !projeto) {
    return {
      status: "error",
      message: projetoError?.message ?? "Erro ao criar o projeto.",
    };
  }

  /* 4. Calcula e insere as 3 rubricas obrigatorias */
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
      status: "error",
      message: `Erro ao criar as rubricas: ${rubricasError.message}`,
    };
  }

  /* 5. Sucesso — redireciona para o dashboard do projeto */
  redirect(`/dashboard/${projeto.id}`);
}