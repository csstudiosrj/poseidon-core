"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  projetoId?: string;
  redirectTo?: string;
  fieldErrors?: {
    nome_projeto?: string[];
    orcamento_total_aprovado?: string[];
    segmento_cultural?: string[];
    mecanismo?: string[];
  };
};

const INITIAL_STATE: ActionState = { status: "idle" };
export default INITIAL_STATE;

function parseMoney(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return NaN;
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  return Number(normalized);
}

export async function setupProjeto(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Sessão expirada. Faça login novamente.",
    };
  }

  const nome_projeto = String(formData.get("nome_projeto") ?? "").trim();
  const segmento_cultural = String(formData.get("segmento_cultural") ?? "").trim();
  const mecanismo = String(formData.get("mecanismo") ?? "incentivo_fiscal").trim();
  const orcamento_total_aprovado = parseMoney(formData.get("orcamento_total_aprovado"));

  const fieldErrors: ActionState["fieldErrors"] = {};
  if (!nome_projeto) fieldErrors.nome_projeto = ["Informe o nome do projeto."];
  if (!segmento_cultural) fieldErrors.segmento_cultural = ["Informe o segmento cultural."];
  if (!Number.isFinite(orcamento_total_aprovado) || orcamento_total_aprovado <= 0) {
    fieldErrors.orcamento_total_aprovado = ["Informe um orçamento total válido."];
  }

  const mecsMV = ["incentivo_fiscal", "fundo", "pnab"] as const;
  if (!mecsMV.includes(mecanismo as typeof mecsMV[number])) {
    fieldErrors.mecanismo = ["Selecione um mecanismo válido."];
  }

  if (Object.values(fieldErrors).some((v) => v && v.length > 0)) {
    return {
      status: "error",
      message: "Corrija os campos obrigatórios.",
      fieldErrors,
    };
  }

  // teto_captacao calculado aqui para usar no valor_orcado da rubrica
  const teto_administracao = Number((orcamento_total_aprovado * 0.15).toFixed(2));
  const teto_captacao       = Number(Math.min(orcamento_total_aprovado * 0.10, 150000).toFixed(2));
  const teto_divulgacao     = Number((orcamento_total_aprovado * 0.20).toFixed(2));

  const { data: projetoData, error: projetoError } = await supabase
    .from("projetos")
    .insert({
      proponente_id: user.id,
      nome_projeto,
      segmento_cultural,
      mecanismo,
      orcamento_total_aprovado,
      status: "rascunho",
    })
    .select("id")
    .single();

  if (projetoError || !projetoData) {
    return {
      status: "error",
      message: `Erro ao criar projeto: ${projetoError?.message ?? "Resposta inesperada do banco."}`,
    };
  }

  const projetoId = projetoData.id as string;

  const { error: rubricasError } = await supabase.from("rubricas").insert([
    {
      proponente_id: user.id,
      projeto_id: projetoId,
      categoria: "administracao",
      descricao: "Administração",
      valor_orcado: teto_administracao,
      teto_percentual: 15,
    },
    {
      proponente_id: user.id,
      projeto_id: projetoId,
      categoria: "captacao_recursos",
      descricao: "Captação de Recursos",
      valor_orcado: teto_captacao,
      teto_percentual: 10,
      teto_absoluto: 150000.00,
    },
    {
      proponente_id: user.id,
      projeto_id: projetoId,
      categoria: "divulgacao_comunicacao",
      descricao: "Divulgação e Acessibilidade",
      valor_orcado: teto_divulgacao,
      teto_percentual: 20,
    },
  ]);

  if (rubricasError) {
    // rollback manual: apaga projeto para evitar registro órfão
    await supabase.from("projetos").delete().eq("id", projetoId);
    return {
      status: "error",
      message: `Projeto criado, mas falhou ao criar rubricas: ${rubricasError.message}`,
    };
  }

  const redirectTo = `/dashboard/${projetoId}`;
  revalidatePath("/setup");
  revalidatePath(redirectTo);

  return {
    status: "success",
    message: "Projeto criado com sucesso.",
    projetoId,
    redirectTo,
  };
}