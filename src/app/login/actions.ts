"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | null;

function normalizeDocument(value: string) {
  return value.replace(/\D/g, "");
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
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

  redirect("/hub");
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const tipo = String(formData.get("tipo") ?? "").trim().toUpperCase();
  const nomeRazaoSocial = String(formData.get("nome_razao_social") ?? "").trim();
  const cpfCnpjRaw = String(formData.get("cpf_cnpj") ?? "").trim();
  const portfolioResumo = String(formData.get("portfolio_resumo") ?? "").trim();

  if (!email || !password || !tipo || !nomeRazaoSocial || !cpfCnpjRaw || !portfolioResumo) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (tipo !== "PF" && tipo !== "PJ") {
    return { error: "Tipo de proponente inválido." };
  }

  if (password.length < 8) {
    return { error: "A senha deve ter no mínimo 8 caracteres." };
  }

  const cpfCnpj = normalizeDocument(cpfCnpjRaw);

  if (!cpfCnpj) {
    return { error: "CPF ou CNPJ inválido." };
  }

  const supabase = await createClient();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tipo,
        nome_razao_social: nomeRazaoSocial,
        cpf_cnpj: cpfCnpj,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const userId = data.user?.id;

  if (!userId) {
    return { error: "Não foi possível obter o ID do usuário cadastrado." };
  }

  const { error: insertError } = await supabase.from("proponentes").insert({
    user_id: userId,
    tipo,
    nome_razao_social: nomeRazaoSocial,
    cpf_cnpj: cpfCnpj,
    email,
    portfolio_data: {
      resumo: portfolioResumo,
    },
  });

  if (insertError) {
    return { error: insertError.message };
  }

  redirect("/hub");
}