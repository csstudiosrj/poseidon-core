'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nomeCompleto = formData.get('nome_completo') as string;
  const documento = formData.get('documento') as string;

  if (!email || !password || !nomeCompleto || !documento) {
    return { error: 'Todos os campos são obrigatórios.' };
  }

  const cleanDoc = cleanDocument(documento);
  const tipo = cleanDoc.length === 11 ? 'PF' : cleanDoc.length === 14 ? 'PJ' : null;

  if (!tipo) {
    return { error: 'Documento inválido. Informe CPF (11 dígitos) ou CNPJ (14 dígitos).' };
  }

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
    console.error('Erro no signup:', authError.message);
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: 'Falha ao obter ID do usuário.' };
  }

  const { error: proponenteError } = await supabase.from('proponentes').insert({
    user_id: userId,
    tipo,
    nome_razao_social: nomeCompleto,
    cpf_cnpj: cleanDoc,
    email: email,
  });

  if (proponenteError) {
    console.error('Erro ao criar proponente:', proponenteError.message);
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Erro no login:', error.message);
    return { error: error.message };
  }

  console.log('Login bem-sucedido para:', data.user?.email);
  redirect('/hub');
}