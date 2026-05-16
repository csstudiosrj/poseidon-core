"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/* ============================================================
   Tipagem de retorno de erro
   ============================================================ */
type ActionResult = { error: string } | never;

/* ============================================================
   LOGIN
   ============================================================ */
export async function login(formData: FormData): Promise<ActionResult> {
  const email    = String(formData.get("email")    ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/setup");
}

/* ============================================================
   SIGNUP
   ============================================================ */
export async function signup(formData: FormData): Promise<ActionResult> {
  const email         = String(formData.get("email")         ?? "").trim();
  const password      = String(formData.get("password")      ?? "");
  const nome_completo = String(formData.get("nome_completo") ?? "").trim();
  const cpf           = String(formData.get("cpf")           ?? "").trim();

  if (!email || !password || !nome_completo || !cpf) {
    return { error: "Todos os campos são obrigatórios." };
  }

  const supabase = await createClient();

  /* 1. Cria o usuário no Auth */
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome_completo, cpf },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const userId = data.user?.id;

  if (!userId) {
    return { error: "Não foi possível obter o ID do usuário após o cadastro." };
  }

  /* 2. Insere o proponente na tabela pública */
  const { error: insertError } = await supabase.from("proponentes").insert({
    id:            userId,
    tipo:          "PF",          // padrão; pode ser editado no setup
    nome_completo,
    cpf,
    email,
  });

  if (insertError) {
    // Rollback lógico: remove o usuário do Auth para não deixar órfão
    await supabase.auth.admin.deleteUser(userId).catch(() => null);
    return { error: insertError.message };
  }

  redirect("/setup");
}