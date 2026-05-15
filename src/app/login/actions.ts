"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

function makeSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
          }
        },
      },
    }
  );
}

export type AuthResult = { error: string } | null;

export async function login(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const supabase = makeSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "E-mail ou senha incorretos." };

  redirect("/setup");
}

export async function signup(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nome_completo = String(formData.get("nome_completo") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim();

  if (!email || !password || !nome_completo || !cpf) {
    return { error: "Preencha todos os campos." };
  }

  const supabase = makeSupabase();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome_completo } },
  });

  if (signUpError) return { error: signUpError.message };

  const userId = data.user?.id;
  if (!userId) return { error: "Não foi possível obter o ID do usuário." };

  const { error: insertError } = await supabase.from("proponentes").insert({
    id: userId,
    tipo: "PF",
    nome_completo,
    cpf,
    email,
  });

  if (insertError) return { error: insertError.message };

  redirect("/setup");
}