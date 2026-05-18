// src/app/login/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { enviarEmailConfirmacao, enviarEmailRecuperacao } from "@/lib/email";

function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, "");
}

function mascaraEmail(email: string): string {
  const [nome, dominio] = email.split("@");
  const nomeMascarado = nome.length > 2 ? nome[0] + "***" + nome.slice(-1) : "***";
  return `${nomeMascarado}@${dominio}`;
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

export async function recuperarAcesso(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const documento = formData.get("documento") as string;

  if (!email && !documento) {
    return { error: "Informe seu e-mail ou CPF/CNPJ para recuperar o acesso." };
  }

  let emailEncontrado = email;
  let nomeEncontrado = "";

  // Se informou documento, busca o e-mail associado
  if (documento && !email) {
    const cleanDoc = cleanDocument(documento);
    const { data: proponente } = await supabase
      .from("proponentes")
      .select("email, nome_razao_social")
      .eq("cpf_cnpj", cleanDoc)
      .single();

    if (!proponente) {
      return { error: "Documento não encontrado. Verifique e tente novamente." };
    }

    emailEncontrado = proponente.email;
    nomeEncontrado = proponente.nome_razao_social;

    return {
      sucesso: true,
      emailMascarado: mascaraEmail(emailEncontrado),
      emailEncontrado,
      nome: nomeEncontrado,
      etapa: "confirmar_envio",
    };
  }

  // Se informou e-mail diretamente ou confirmou o envio
  if (emailEncontrado) {
    const { data: proponente } = await supabase
      .from("proponentes")
      .select("nome_razao_social")
      .eq("email", emailEncontrado)
      .single();

    nomeEncontrado = proponente?.nome_razao_social || "Produtor";

    const { error } = await supabase.auth.resetPasswordForEmail(emailEncontrado, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha`,
    });

    if (error) {
      console.error("Erro ao enviar recuperação:", error.message);
      return { error: "Erro ao enviar link de recuperação." };
    }

    // Envia e-mail bonito via Resend
    const urlRecuperacao = `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha`;
    await enviarEmailRecuperacao(emailEncontrado, nomeEncontrado, urlRecuperacao);

    return { success: true, email: emailEncontrado };
  }

  return { error: "Não foi possível identificar seu acesso. Tente informar seu CPF/CNPJ." };
}

export async function confirmarEnvioRecuperacao(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) return { error: "E-mail não informado." };

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("nome_razao_social")
    .eq("email", email)
    .single();

  const nome = proponente?.nome_razao_social || "Produtor";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha`,
  });

  if (error) {
    return { error: "Erro ao enviar link de recuperação." };
  }

  const urlRecuperacao = `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha`;
  await enviarEmailRecuperacao(email, nome, urlRecuperacao);

  return { success: true };
}