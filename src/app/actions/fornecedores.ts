// src/app/actions/fornecedores.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Fornecedor {
  id:               string;
  nome:             string;
  tipo:             "PF" | "PJ";
  cpf_cnpj:         string;
  categoria:        string | null;
  email:            string | null;
  telefone:         string | null;
  created_at:       string;
}

export const CATEGORIAS_FORNECEDOR = [
  "Artista / Performer",
  "Produção",
  "Comunicação / Marketing",
  "Cenografia / Figurino",
  "Audiovisual",
  "Som e Iluminação",
  "Transporte / Logística",
  "Alimentação",
  "Gráfica / Impressão",
  "Consultoria",
  "Outros",
];

/* ─── Listar ────────────────────────────────────────────────────── */
export async function listarFornecedores(): Promise<
  Fornecedor[] | { error: string }
> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const { data, error } = await supabase
    .from("fornecedores")
    .select("id, nome, tipo, cpf_cnpj, categoria, email, telefone, created_at")
    .eq("proponente_id", proponente.id)
    .order("nome", { ascending: true });

  if (error) return { error: "Erro ao buscar fornecedores." };

  return data ?? [];
}

/* ─── Adicionar ─────────────────────────────────────────────────── */
export async function adicionarFornecedorAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const nome      = ((formData.get("nome")      as string) ?? "").trim();
  const tipo      = ((formData.get("tipo")      as string) ?? "PF").trim() as "PF" | "PJ";
  const cpf_cnpj  = ((formData.get("cpf_cnpj")  as string) ?? "").replace(/\D/g, "");
  const categoria = ((formData.get("categoria") as string) ?? "").trim() || null;
  const email     = ((formData.get("email")     as string) ?? "").trim() || null;
  const telefone  = ((formData.get("telefone")  as string) ?? "").replace(/\D/g, "") || null;

  if (!nome || nome.length < 2) return { error: "Nome deve ter pelo menos 2 caracteres." };
  if (!cpf_cnpj || cpf_cnpj.length < 11) return { error: "CPF ou CNPJ inválido." };

  const { error: insertError } = await supabase
    .from("fornecedores")
    .insert({ proponente_id: proponente.id, nome, tipo, cpf_cnpj, categoria, email, telefone });

  if (insertError) {
    console.error("Erro ao adicionar fornecedor:", insertError);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/fornecedores");
  return { success: true };
}

/* ─── Editar ────────────────────────────────────────────────────── */
export async function editarFornecedorAction(
  fornecedorId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const nome      = ((formData.get("nome")      as string) ?? "").trim();
  const tipo      = ((formData.get("tipo")      as string) ?? "PF").trim() as "PF" | "PJ";
  const cpf_cnpj  = ((formData.get("cpf_cnpj")  as string) ?? "").replace(/\D/g, "");
  const categoria = ((formData.get("categoria") as string) ?? "").trim() || null;
  const email     = ((formData.get("email")     as string) ?? "").trim() || null;
  const telefone  = ((formData.get("telefone")  as string) ?? "").replace(/\D/g, "") || null;

  if (!nome || nome.length < 2) return { error: "Nome deve ter pelo menos 2 caracteres." };
  if (!cpf_cnpj || cpf_cnpj.length < 11) return { error: "CPF ou CNPJ inválido." };

  const { error: updateError } = await supabase
    .from("fornecedores")
    .update({ nome, tipo, cpf_cnpj, categoria, email, telefone, updated_at: new Date().toISOString() })
    .eq("id", fornecedorId)
    .eq("proponente_id", proponente.id);

  if (updateError) {
    console.error("Erro ao editar fornecedor:", updateError);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/fornecedores");
  return { success: true };
}

/* ─── Deletar ───────────────────────────────────────────────────── */
export async function deletarFornecedorAction(
  fornecedorId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Perfil não encontrado." };

  const { error } = await supabase
    .from("fornecedores")
    .delete()
    .eq("id", fornecedorId)
    .eq("proponente_id", proponente.id);

  if (error) {
    console.error("Erro ao deletar fornecedor:", error);
    return { error: "Erro ao deletar. Verifique se o fornecedor não está vinculado a um projeto." };
  }

  revalidatePath("/fornecedores");
  return { success: true };
}
