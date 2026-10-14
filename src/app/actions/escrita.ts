// src/app/actions/escrita.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ConteudoEscrita {
  sinopse:       string;
  justificativa: string;
  objetivos:     string;
  metodologia:   string;
  impacto:       string;
}

export interface ProjetoEscrita {
  id:           string;
  nome_projeto: string;
  status:       string;
  conteudo:     ConteudoEscrita;
}

const EMPTY_CONTEUDO: ConteudoEscrita = {
  sinopse:       "",
  justificativa: "",
  objetivos:     "",
  metodologia:   "",
  impacto:       "",
};

export const SECOES: Array<{
  key:         keyof ConteudoEscrita;
  titulo:      string;
  placeholder: string;
  dica:        string;
}> = [
  {
    key:    "sinopse",
    titulo: "Sinopse",
    placeholder:
      "Descreva o projeto de forma clara e objetiva. O que é, o que propõe e qual o seu diferencial…",
    dica: "Apresentação geral do projeto em até 300 palavras.",
  },
  {
    key:    "justificativa",
    titulo: "Justificativa",
    placeholder:
      "Por que este projeto é necessário? Qual problema cultural ou social ele endereça?",
    dica: "Contextualize a relevância cultural e social do projeto.",
  },
  {
    key:    "objetivos",
    titulo: "Objetivos",
    placeholder:
      "Objetivo geral: …\n\nObjetivos específicos:\n- …\n- …",
    dica: "Liste o objetivo geral e os específicos de forma mensurável.",
  },
  {
    key:    "metodologia",
    titulo: "Metodologia",
    placeholder:
      "Como o projeto será executado? Quais etapas, processos e profissionais envolvidos?",
    dica: "Descreva o passo a passo da execução, incluindo cronograma narrativo.",
  },
  {
    key:    "impacto",
    titulo: "Impacto e Público",
    placeholder:
      "Qual o público esperado? Quais os resultados e impactos culturais esperados?",
    dica: "Defina o público-alvo e os resultados concretos ao final do projeto.",
  },
];

/* ─── Listar projetos com progresso de escrita ──────────────────── */
export async function getEscritaList(): Promise<
  ProjetoEscrita[] | { error: string }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const { data: projetos, error } = await supabase
    .from("projetos")
    .select("id, nome_projeto, status, conteudo_escrita")
    .eq("proponente_id", proponente.id)
    .order("created_at", { ascending: false });

  if (error || !projetos) return { error: "Erro ao buscar projetos." };

  return projetos.map((p) => ({
    id:           p.id,
    nome_projeto: p.nome_projeto,
    status:       p.status,
    conteudo:     parseConteudo(p.conteudo_escrita),
  }));
}

/* ─── Buscar um projeto para edição ────────────────────────────── */
export async function getEscritaProjeto(
  projetoId: string
): Promise<ProjetoEscrita | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const { data, error } = await supabase
    .from("projetos")
    .select("id, nome_projeto, status, conteudo_escrita")
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id)
    .single();

  if (error || !data) return { error: "Projeto não encontrado." };

  return {
    id:           data.id,
    nome_projeto: data.nome_projeto,
    status:       data.status,
    conteudo:     parseConteudo(data.conteudo_escrita),
  };
}

/* ─── Salvar conteúdo de escrita ────────────────────────────────── */
export async function salvarEscritaAction(
  projetoId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const conteudo_escrita: ConteudoEscrita = {
    sinopse:       ((formData.get("sinopse")       as string) ?? "").trim(),
    justificativa: ((formData.get("justificativa") as string) ?? "").trim(),
    objetivos:     ((formData.get("objetivos")     as string) ?? "").trim(),
    metodologia:   ((formData.get("metodologia")   as string) ?? "").trim(),
    impacto:       ((formData.get("impacto")       as string) ?? "").trim(),
  };

  const { error: updateError } = await supabase
    .from("projetos")
    .update({
      conteudo_escrita,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id);

  if (updateError) {
    console.error("Erro ao salvar escrita:", updateError);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath(`/escrita/${projetoId}`);
  revalidatePath("/escrita");
  return { success: true };
}

/* ─── Helper ────────────────────────────────────────────────────── */
function parseConteudo(raw: unknown): ConteudoEscrita {
  if (!raw || typeof raw !== "object") return { ...EMPTY_CONTEUDO };
  const r = raw as Record<string, unknown>;
  return {
    sinopse:       typeof r.sinopse       === "string" ? r.sinopse       : "",
    justificativa: typeof r.justificativa === "string" ? r.justificativa : "",
    objetivos:     typeof r.objetivos     === "string" ? r.objetivos     : "",
    metodologia:   typeof r.metodologia   === "string" ? r.metodologia   : "",
    impacto:       typeof r.impacto       === "string" ? r.impacto       : "",
  };
}
