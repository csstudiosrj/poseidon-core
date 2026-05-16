'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

function validateCPF(cpf: string): boolean {
  // Remove não dígitos
  cpf = cleanDocument(cpf);
  if (cpf.length !== 11) return false;
  // Validação simples de CPF (opcional, mas pode ser adicionada)
  return true;
}

function validateCNPJ(cnpj: string): boolean {
  cnpj = cleanDocument(cnpj);
  if (cnpj.length !== 14) return false;
  return true;
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nomeCompleto = formData.get('nome_completo') as string;
  const documento = formData.get('documento') as string;

  // Validações básicas
  if (!email || !password || !nomeCompleto || !documento) {
    return { error: 'Todos os campos são obrigatórios.' };
  }

  const cleanDoc = cleanDocument(documento);
  const tipo = cleanDoc.length === 11 ? 'PF' : cleanDoc.length === 14 ? 'PJ' : null;

  if (!tipo) {
    return { error: 'Documento inválido. Informe CPF (11 dígitos) ou CNPJ (14 dígitos).' };
  }

  // Validação opcional de formato (pode ser aprofundada se desejar)
  if (tipo === 'PF' && !validateCPF(cleanDoc)) {
    return { error: 'CPF inválido.' };
  }
  if (tipo === 'PJ' && !validateCNPJ(cleanDoc)) {
    return { error: 'CNPJ inválido.' };
  }

  // Cadastro no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome_completo: nomeCompleto,
        tipo,
        documento: cleanDoc,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: 'Falha ao obter ID do usuário.' };
  }

  // Inserir na tabela proponentes
  const { error: proponenteError } = await supabase.from('proponentes').insert({
    user_id: userId,
    tipo,
    nome_razao_social: nomeCompleto,
    cpf_cnpj: cleanDoc,
    email: email,
  });

  if (proponenteError) {
    // Se falhar a inserção, remover o usuário auth (rollback manual)
    await supabase.auth.admin.deleteUser(userId);
    return { error: 'Erro ao criar proponente: ' + proponenteError.message };
  }

  redirect('/hub');
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/hub');
}