"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, "");
}

function mascaraEmail(email: string): string {
  const [nome, dominio] = email.split("@");
  const nomeMascarado = nome.length > 2 ? nome[0] + "***" + nome.slice(-1) : "***";
  return `${nomeMascarado}@${dominio}`;
}

function traduzirErro(mensagem: string): string {
  const mapa: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos. Verifique e tente novamente.",
    "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.",
    "Invalid email or password": "E-mail ou senha inválidos.",
    "User not found": "Usuário não encontrado. Verifique o e-mail informado.",
    "User already registered": "Este e-mail já está cadastrado. Tente fazer login ou recuperar seu acesso.",
    "A user with this email address has already been registered": "Este e-mail já está cadastrado. Faça login ou recupere seu acesso.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Password should be at least 8 characters": "A senha deve ter pelo menos 8 caracteres.",
    "Password is too weak": "A senha é muito fraca. Use letras, números e caracteres especiais.",
    "Signup requires a valid password": "É necessário informar uma senha válida.",
    "New password should be different from the old password": "A nova senha deve ser diferente da senha atual.",
    "Unable to validate email address: invalid format": "Formato de e-mail inválido. Verifique e tente novamente.",
    "Email address is invalid": "Endereço de e-mail inválido.",
    "Email rate limit exceeded": "Você solicitou muitas vezes. Aguarde alguns minutos e tente novamente.",
    "For security purposes, you can only request this once every 60 seconds": "Por segurança, aguarde 60 segundos antes de solicitar novamente.",
    "Error sending confirmation email": "Erro ao enviar o e-mail de confirmação. Tente novamente em instantes.",
    "Error sending recovery email": "Erro ao enviar o e-mail de recuperação. Tente novamente em instantes.",
    "Error sending magic link": "Erro ao enviar o link de acesso. Tente novamente.",
    "Token has expired or is invalid": "O link expirou ou é inválido. Solicite um novo link de acesso.",
    "Email link is invalid or has expired": "O link de confirmação expirou. Faça login para solicitar um novo.",
    "User is already signed in": "Você já está autenticado.",
    "Session expired": "Sua sessão expirou. Faça login novamente.",
    "Session not found": "Sessão não encontrada. Faça login novamente.",
    "Invalid credentials": "Credenciais inválidas.",
  };

  return mapa[mensagem] || mensagem;
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

  const { data: existente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("email", email)
    .single();

  if (existente) {
    return { error: "Este e-mail já está cadastrado. Tente fazer login ou recuperar seu acesso." };
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
    return { error: traduzirErro(authError.message) };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Falha ao criar usuário. Tente novamente." };
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
    return { error: "Erro ao criar cadastro. Tente novamente." };
  }

  return { success: true, message: "Conta criada! Verifique seu e-mail para confirmar o cadastro." };
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("email", email)
    .single();

  if (!proponente) {
    return { error: "E-mail não cadastrado no sistema. Verifique ou crie uma nova conta." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Erro no login:", error.message);
    return { error: traduzirErro(error.message) };
  }

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

    return {
      sucesso: true,
      emailMascarado: mascaraEmail(emailEncontrado),
      emailEncontrado,
      nome: proponente.nome_razao_social,
      etapa: "confirmar_envio",
    };
  }

  if (emailEncontrado) {
    const { data: proponente } = await supabase
      .from("proponentes")
      .select("id")
      .eq("email", emailEncontrado)
      .single();

    if (!proponente) {
      return { error: "E-mail não encontrado. Verifique ou tente informar seu CPF/CNPJ." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailEncontrado, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha`,
    });

    if (error) {
      console.error("Erro ao enviar recuperação:", error.message);
      return { error: traduzirErro(error.message) };
    }

    return { success: true, email: emailEncontrado };
  }

  return { error: "Não foi possível identificar seu acesso. Tente informar seu CPF/CNPJ." };
}

export async function confirmarEnvioRecuperacao(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) return { error: "E-mail não informado." };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha`,
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  return { success: true };
}