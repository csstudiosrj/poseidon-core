// src/app/login/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { enviarEmailConfirmacao, enviarEmailRecuperacao } from "@/lib/email";

function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, "");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nomeCompleto = formData.get("nome_completo") as string;
  const documento = formData.get("documento") as string;
  const nomeEmpresa = (formData.get("nome_empresa") as string) || null;

  if (!email || !password || !nomeCompleto || !documento) {
    return { error: "Todos os campos são obrigatórios." };
  }

  const cleanDoc = cleanDocument(documento);
  const tipo = cleanDoc.length === 11 ? "PF" : cleanDoc.length === 14 ? "PJ" : null;

  if (!tipo) {
    return { error: "Documento inválido. Informe CPF (11 dígitos) ou CNPJ (14 dígitos)." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome_completo: nomeCompleto,
        nome_empresa: nomeEmpresa,
        tipo,
        documento: cleanDoc,
      },
    },
  });

  if (authError) {
    console.error("Erro no signup:", authError.message);
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Falha ao obter ID do usuário." };
  }

  const { error: proponenteError } = await supabase.from("proponentes").insert({
    user_id: userId,
    tipo,
    nome_razao_social: nomeEmpresa || nomeCompleto,
    cpf_cnpj: cleanDoc,
    email: email,
  });

  if (proponenteError) {
    console.error("Erro ao criar proponente:", proponenteError.message);
    await supabase.auth.admin.deleteUser(userId);
    return { error: "Erro ao criar proponente: " + proponenteError.message };
  }

  // Envia email de confirmação via Resend
  try {
    const token = authData.session?.access_token || "";
    await enviarEmailConfirmacao(email, nomeCompleto, token);
  } catch (e) {
    console.error("Erro ao enviar email de confirmação:", e);
  }

  redirect("/hub");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro no login:", error.message);
    return { error: error.message };
  }

  console.log("Login bem-sucedido para:", data.user?.email);
  redirect("/hub");
}

export async function recuperarSenha(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) return { error: "Informe seu e-mail." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("nome_razao_social")
    .eq("email", email)
    .single();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) {
    console.error("Erro ao enviar recuperação:", error.message);
    return { error: "Erro ao enviar e-mail de recuperação." };
  }

  // Envia email customizado via Resend
  try {
    const nome = proponente?.nome_razao_social || "Usuário";
    await enviarEmailRecuperacao(email, nome, "link_enviado_pelo_supabase");
  } catch (e) {
    console.error("Erro ao enviar email de recuperação via Resend:", e);
  }

  return { success: true };
}
