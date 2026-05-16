'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type ActionResult = { error: string } | never

export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/setup')
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')
  const nome_completo = String(formData.get('nome_completo') ?? '').trim()
  const cpf = String(formData.get('cpf') ?? '').trim()

  if (!email || !password || !confirmPassword || !nome_completo || !cpf) {
    return { error: 'Todos os campos são obrigatórios.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  const supabase = await createClient()

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome_completo, cpf },
    },
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  const userId = data.user?.id
  if (!userId) {
    return { error: 'Não foi possível obter o ID do usuário após o cadastro.' }
  }

  const { error: insertError } = await supabase.from('proponentes').insert({
    id: userId,
    tipo: 'PF',
    nome_completo,
    cpf,
    email,
  })

  if (insertError) {
    await supabase.auth.admin.deleteUser(userId).catch(() => null)
    return { error: insertError.message }
  }

  redirect('/setup')
}