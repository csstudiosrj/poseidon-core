// src/app/actions/itens.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ─── Adicionar ─────────────────────────────────────────────────────── */
export async function adicionarItemAction(
  projetoId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const descricao = (formData.get("descricao") as string)?.trim();
  const categoria = (formData.get("categoria") as string)?.trim() || null;
  const quantStr  =  formData.get("quantidade") as string;
  const valorStr  =  formData.get("valor_num")  as string;
  const fonte_id  = (formData.get("fonte_id")   as string) || null;

  if (!descricao || descricao.length < 2)
    return { error: "Descrição deve ter pelo menos 2 caracteres." };

  const quantidade = parseInt(quantStr, 10);
  if (!quantidade || quantidade < 1)
    return { error: "Quantidade deve ser pelo menos 1." };

  const valor = parseFloat(valorStr);
  if (!valor || valor <= 0)
    return { error: "Informe um valor unitário válido." };

  const { data: projeto } = await supabase
    .from("projetos")
    .select("id, proponentes!inner(user_id)")
    .eq("id", projetoId)
    .eq("proponentes.user_id", user.id)
    .single();

  if (!projeto) return { error: "Projeto não encontrado." };

  const { error: insertError } = await supabase
    .from("itens_orcamentarios")
    .insert({
      projeto_id: projetoId,
      descricao,
      categoria,
      quantidade,
      valor,
      fonte_id: fonte_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error("Erro ao inserir item:", insertError);
    return { error: "Erro ao salvar o item. Tente novamente." };
  }

  revalidatePath(`/projeto/${projetoId}`);
  return { success: true };
}

/* ─── Editar ────────────────────────────────────────────────────────── */
export async function editarItemAction(
  projetoId: string,
  itemId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const descricao = (formData.get("descricao") as string)?.trim();
  const categoria = (formData.get("categoria") as string)?.trim() || null;
  const quantStr  =  formData.get("quantidade") as string;
  const valorStr  =  formData.get("valor_num")  as string;
  const fonte_id  = (formData.get("fonte_id")   as string) || null;

  if (!descricao || descricao.length < 2)
    return { error: "Descrição deve ter pelo menos 2 caracteres." };

  const quantidade = parseInt(quantStr, 10);
  if (!quantidade || quantidade < 1)
    return { error: "Quantidade deve ser pelo menos 1." };

  const valor = parseFloat(valorStr);
  if (!valor || valor <= 0)
    return { error: "Informe um valor unitário válido." };

  // Confirma ownership via projeto
  const { data: item } = await supabase
    .from("itens_orcamentarios")
    .select("id, projeto_id, projetos!inner(proponentes!inner(user_id))")
    .eq("id", itemId)
    .eq("projeto_id", projetoId)
    .single();

  if (!item) return { error: "Item não encontrado." };

  const { error: updateError } = await supabase
    .from("itens_orcamentarios")
    .update({
      descricao,
      categoria,
      quantidade,
      valor,
      fonte_id: fonte_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (updateError) {
    console.error("Erro ao editar item:", updateError);
    return { error: "Erro ao atualizar o item. Tente novamente." };
  }

  revalidatePath(`/projeto/${projetoId}`);
  return { success: true };
}

/* ─── Deletar ───────────────────────────────────────────────────────── */
export async function deletarItemAction(
  projetoId: string,
  itemId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  // Confirma ownership
  const { data: item } = await supabase
    .from("itens_orcamentarios")
    .select("id, projeto_id, projetos!inner(proponentes!inner(user_id))")
    .eq("id", itemId)
    .eq("projeto_id", projetoId)
    .single();

  if (!item) return { error: "Item não encontrado." };

  const { error: deleteError } = await supabase
    .from("itens_orcamentarios")
    .delete()
    .eq("id", itemId);

  if (deleteError) {
    console.error("Erro ao deletar item:", deleteError);
    return { error: "Erro ao remover o item." };
  }

  revalidatePath(`/projeto/${projetoId}`);
  return { success: true };
}
