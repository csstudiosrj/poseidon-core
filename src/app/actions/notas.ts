// src/app/actions/notas.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ─── Adicionar ─────────────────────────────────────────────────── */
export async function adicionarNotaAction(
  projetoId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const descricao   = (formData.get("descricao")   as string)?.trim();
  const categoria   = (formData.get("categoria")   as string)?.trim();
  const valorStr    =  formData.get("valor_num")   as string;
  const data_emissao = (formData.get("data_emissao") as string) || null;
  const fonte_id    = (formData.get("fonte_id")    as string) || null;
  const arquivo_url = (formData.get("arquivo_url") as string) || null;

  if (!descricao || descricao.length < 2)
    return { error: "Descrição deve ter pelo menos 2 caracteres." };
  if (!categoria)
    return { error: "Selecione uma categoria." };

  const valor = parseFloat(valorStr);
  if (!valor || valor <= 0)
    return { error: "Informe um valor válido." };

  // ownership check
  const { data: projeto } = await supabase
    .from("projetos")
    .select("id, proponentes!inner(user_id)")
    .eq("id", projetoId)
    .eq("proponentes.user_id", user.id)
    .single();

  if (!projeto) return { error: "Projeto não encontrado." };

  const { error: insertError } = await supabase
    .from("notas_fiscais")
    .insert({
      projeto_id:   projetoId,
      fonte_id:     fonte_id || null,
      categoria,
      descricao,
      valor,
      data_emissao: data_emissao || null,
      arquivo_url:  arquivo_url || null,
      status:       "pendente",
      created_at:   new Date().toISOString(),
    });

  if (insertError) {
    console.error("Erro ao inserir nota:", insertError);
    return { error: "Erro ao salvar a nota fiscal." };
  }

  revalidatePath(`/projeto/${projetoId}`);
  return { success: true };
}

/* ─── Deletar ───────────────────────────────────────────────────── */
export async function deletarNotaAction(
  projetoId: string,
  notaId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: nota } = await supabase
    .from("notas_fiscais")
    .select("id, projeto_id, projetos!inner(proponentes!inner(user_id))")
    .eq("id", notaId)
    .eq("projeto_id", projetoId)
    .single();

  if (!nota) return { error: "Nota não encontrada." };

  const { error: deleteError } = await supabase
    .from("notas_fiscais")
    .delete()
    .eq("id", notaId);

  if (deleteError) {
    console.error("Erro ao deletar nota:", deleteError);
    return { error: "Erro ao remover a nota." };
  }

  revalidatePath(`/projeto/${projetoId}`);
  return { success: true };
}
