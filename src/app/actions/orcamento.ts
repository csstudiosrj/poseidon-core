// src/app/actions/orcamento.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ─── tipos ────────────────────────────────────────────────────── */
export interface ProjetoFonte {
  id:             string;
  projeto_id:     string;
  tipo:           string;
  nome_fonte:     string | null;
  valor_captacao: number;
  status:         string | null;
  created_at:     string | null;
}

export interface ItemOrcamentario {
  id:         string;
  projeto_id: string;
  fonte_id:   string | null;
  descricao:  string;
  valor:      number;
  quantidade: number;
  categoria:  string | null;
  created_at: string;
}

export interface OrcamentoData {
  projeto: { id: string; nome_projeto: string };
  fontes:  ProjetoFonte[];
  itens:   ItemOrcamentario[];
}

export const TIPOS_FONTE = [
  "Lei de Incentivo",
  "Edital Público",
  "Patrocínio Direto",
  "Contrapartida",
  "Recurso Próprio",
  "Outros",
] as const;

export const STATUS_FONTE: Record<string, string> = {
  pendente:  "Pendente",
  aprovada:  "Aprovada",
  cancelada: "Cancelada",
};

export const CATEGORIAS_ITEM: Record<string, string> = {
  administracao:  "Administração",
  cache:          "Cachê",
  infraestrutura: "Infraestrutura",
  divulgacao:     "Divulgação",
  captacao:       "Captação",
  formacao:       "Formação",
};

/* ─── helper: verifica posse do projeto ──────────────────────────── */
async function resolverProjeto(projetoId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." } as const;

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!proponente) return { error: "Perfil não encontrado." } as const;

  const { data: projeto } = await supabase
    .from("projetos")
    .select("id, nome_projeto")
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id)
    .single();
  if (!projeto) return { error: "Projeto não encontrado." } as const;

  return { supabase, proponente, projeto } as const;
}

/* ─── buscar orçamento de um projeto ─────────────────────────────── */
export async function getOrcamento(
  projetoId: string,
): Promise<OrcamentoData | { error: string }> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return ctx;
  const { supabase, projeto } = ctx;

  const [{ data: fontes, error: fe }, { data: itens, error: ie }] =
    await Promise.all([
      supabase
        .from("projeto_fontes")
        .select("id, projeto_id, tipo, nome_fonte, valor_captacao, status, created_at")
        .eq("projeto_id", projetoId)
        .order("created_at"),
      supabase
        .from("itens_orcamentarios")
        .select("id, projeto_id, fonte_id, descricao, valor, quantidade, categoria, created_at")
        .eq("projeto_id", projetoId)
        .order("created_at"),
    ]);

  if (fe) return { error: "Erro ao buscar fontes." };
  if (ie) return { error: "Erro ao buscar itens." };

  return {
    projeto,
    fontes:  (fontes ?? []) as ProjetoFonte[],
    itens:   (itens  ?? []) as ItemOrcamentario[],
  };
}

/* ─── FONTES ──────────────────────────────────────────────────────── */
export async function adicionarFonteAction(
  projetoId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const tipo           = (formData.get("tipo")           as string | null)?.trim();
  const nome_fonte     = (formData.get("nome_fonte")     as string | null)?.trim() || null;
  const valor_captacao = parseFloat((formData.get("valor_captacao") as string) ?? "0");
  const status         = (formData.get("status") as string | null) || "pendente";

  if (!tipo)             return { error: "Tipo é obrigatório." };
  if (isNaN(valor_captacao) || valor_captacao < 0) return { error: "Valor inválido." };

  const { error } = await supabase.from("projeto_fontes").insert({
    projeto_id: projetoId, tipo, nome_fonte, valor_captacao, status,
  });

  if (error) return { error: "Erro ao adicionar fonte." };
  revalidatePath(`/orcamento/${projetoId}`);
  return { success: true };
}

export async function editarFonteAction(
  fonteId: string,
  projetoId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const tipo           = (formData.get("tipo")           as string | null)?.trim();
  const nome_fonte     = (formData.get("nome_fonte")     as string | null)?.trim() || null;
  const valor_captacao = parseFloat((formData.get("valor_captacao") as string) ?? "0");
  const status         = (formData.get("status") as string | null) || "pendente";

  if (!tipo) return { error: "Tipo é obrigatório." };

  const { error } = await supabase
    .from("projeto_fontes")
    .update({ tipo, nome_fonte, valor_captacao, status })
    .eq("id", fonteId)
    .eq("projeto_id", projetoId);

  if (error) return { error: "Erro ao salvar fonte." };
  revalidatePath(`/orcamento/${projetoId}`);
  return { success: true };
}

export async function deletarFonteAction(
  fonteId: string,
  projetoId: string,
): Promise<{ error?: string }> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { error } = await supabase
    .from("projeto_fontes")
    .delete()
    .eq("id", fonteId)
    .eq("projeto_id", projetoId);

  if (error) return { error: "Erro ao excluir fonte." };
  revalidatePath(`/orcamento/${projetoId}`);
  return {};
}

/* ─── ITENS ───────────────────────────────────────────────────────── */
export async function adicionarItemAction(
  projetoId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const descricao  = (formData.get("descricao")  as string | null)?.trim();
  const categoria  = (formData.get("categoria")  as string | null) || null;
  const fonte_id   = (formData.get("fonte_id")   as string | null) || null;
  const valor      = parseFloat((formData.get("valor")      as string) ?? "0");
  const quantidade = parseInt  ((formData.get("quantidade") as string) ?? "1", 10);

  if (!descricao)                    return { error: "Descrição é obrigatória." };
  if (isNaN(valor) || valor < 0)     return { error: "Valor inválido." };
  if (isNaN(quantidade) || quantidade < 1) return { error: "Quantidade inválida." };

  const { error } = await supabase.from("itens_orcamentarios").insert({
    projeto_id: projetoId, fonte_id, descricao, valor, quantidade, categoria,
  });

  if (error) return { error: "Erro ao adicionar item." };
  revalidatePath(`/orcamento/${projetoId}`);
  return { success: true };
}

export async function editarItemAction(
  itemId: string,
  projetoId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const descricao  = (formData.get("descricao")  as string | null)?.trim();
  const categoria  = (formData.get("categoria")  as string | null) || null;
  const fonte_id   = (formData.get("fonte_id")   as string | null) || null;
  const valor      = parseFloat((formData.get("valor")      as string) ?? "0");
  const quantidade = parseInt  ((formData.get("quantidade") as string) ?? "1", 10);

  if (!descricao) return { error: "Descrição é obrigatória." };

  const { error } = await supabase
    .from("itens_orcamentarios")
    .update({ fonte_id, descricao, valor, quantidade, categoria })
    .eq("id", itemId)
    .eq("projeto_id", projetoId);

  if (error) return { error: "Erro ao salvar item." };
  revalidatePath(`/orcamento/${projetoId}`);
  return { success: true };
}

export async function deletarItemAction(
  itemId: string,
  projetoId: string,
): Promise<{ error?: string }> {
  const ctx = await resolverProjeto(projetoId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { error } = await supabase
    .from("itens_orcamentarios")
    .delete()
    .eq("id", itemId)
    .eq("projeto_id", projetoId);

  if (error) return { error: "Erro ao excluir item." };
  revalidatePath(`/orcamento/${projetoId}`);
  return {};
}
