// src/app/actions/configuracoes.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProponenteData {
  id: string;
  tipo: string;
  nome_razao_social: string;
  cpf_cnpj: string;
  email: string;
  whatsapp: string | null;
}

/* ─── Buscar dados do proponente ────────────────────────────────── */
export async function getProponenteData(): Promise<
  ProponenteData | { error: string }
> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data, error } = await supabase
    .from("proponentes")
    .select("id, tipo, nome_razao_social, cpf_cnpj, email, whatsapp")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { error: "Perfil não encontrado." };

  return data;
}

/* ─── Salvar alterações ─────────────────────────────────────────── */
export async function salvarConfiguracoesAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const nome_razao_social = (formData.get("nome_razao_social") as string)?.trim();
  const cpf_cnpj          = (formData.get("cpf_cnpj")          as string)?.trim();
  const whatsapp          = (formData.get("whatsapp")          as string)?.trim() || null;
  const tipo              = (formData.get("tipo")              as string)?.trim();

  if (!nome_razao_social || nome_razao_social.length < 3)
    return { error: "Nome deve ter pelo menos 3 caracteres." };

  if (!cpf_cnpj || cpf_cnpj.length < 11)
    return { error: "CPF ou CNPJ inválido." };

  if (!["PF", "PJ"].includes(tipo))
    return { error: "Tipo inválido." };

  const { error: updateError } = await supabase
    .from("proponentes")
    .update({
      nome_razao_social,
      cpf_cnpj,
      whatsapp,
      tipo,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Erro ao salvar configurações:", updateError);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}
