// src/app/actions/projetos.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProjetoStatus =
  | "rascunho"
  | "enviado"
  | "ativo"
  | "inativo"
  | "finalizado"
  | "prestacao_contas";

export interface Projeto {
  id:           string;
  nome_projeto: string;
  status:       ProjetoStatus;
  created_at:   string;
  updated_at:   string;
}

export const STATUS_LABEL: Record<ProjetoStatus, string> = {
  rascunho:         "Rascunho",
  enviado:          "Enviado",
  ativo:            "Ativo",
  inativo:          "Inativo",
  finalizado:       "Finalizado",
  prestacao_contas: "Prestação de contas",
};

export const STATUS_ORDER: ProjetoStatus[] = [
  "rascunho",
  "enviado",
  "ativo",
  "inativo",
  "finalizado",
  "prestacao_contas",
];

/* ── listar ─────────────────────────────────────────────────────── */
export async function listarProjetos(): Promise<
  Projeto[] | { error: string }
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) return { error: "Perfil não encontrado." };

  const { data, error } = await supabase
    .from("projetos")
    .select("id, nome_projeto, status, created_at, updated_at")
    .eq("proponente_id", proponente.id)
    .order("updated_at", { ascending: false });

  if (error) return { error: "Erro ao buscar projetos." };
  return (data ?? []) as Projeto[];
}

/* ── criar ──────────────────────────────────────────────────────── */
export async function criarProjetoAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) return { error: "Perfil não encontrado." };

  const nome = (formData.get("nome_projeto") as string | null)?.trim();
  if (!nome) return { error: "Nome do projeto é obrigatório." };

  const { error } = await supabase.from("projetos").insert({
    proponente_id:    proponente.id,
    nome_projeto:     nome,
    status:           "rascunho",
    conteudo_escrita: {},
    cronograma:       {},
  });

  if (error) return { error: "Erro ao criar projeto." };
  revalidatePath("/projetos");
  return { success: true };
}

/* ── editar ─────────────────────────────────────────────────────── */
export async function editarProjetoAction(
  projetoId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) return { error: "Perfil não encontrado." };

  const nome   = (formData.get("nome_projeto") as string | null)?.trim();
  const status = formData.get("status") as ProjetoStatus | null;

  if (!nome)   return { error: "Nome é obrigatório." };
  if (!status) return { error: "Status é obrigatório." };

  const { error } = await supabase
    .from("projetos")
    .update({ nome_projeto: nome, status })
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id);

  if (error) return { error: "Erro ao salvar projeto." };
  revalidatePath("/projetos");
  return { success: true };
}

/* ── deletar ────────────────────────────────────────────────────── */
export async function deletarProjetoAction(
  projetoId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) return { error: "Perfil não encontrado." };

  const { error } = await supabase
    .from("projetos")
    .delete()
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id);

  if (error) return { error: "Erro ao excluir projeto." };
  revalidatePath("/projetos");
  return {};
}
