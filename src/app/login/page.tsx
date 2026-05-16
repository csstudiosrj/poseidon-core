// src/app/login/page.tsx
"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, signup } from "./actions";

type FormState = { error: string } | null;

async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return login(formData) as Promise<FormState>;
}

async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return signup(formData) as Promise<FormState>;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, null);
  const [signupState, signupDispatch, isSignupPending] = useActionState(signupAction, null);

  const isPending = isLoginPending || isSignupPending;
  const error = isLogin ? loginState?.error : signupState?.error;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logotipo */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white font-['Syne']">
            Pose<span className="text-cyan-400">idon</span>
          </h1>
          <p className="text-sm text-slate-400">
            Auditoria Cultural · Lei Rouanet · IN 29/2026
          </p>
        </div>

        {/* Card principal */}
        <div className="rounded-2xl border border-white/10 bg-[#081121]/90 backdrop-blur-sm p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)] space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-white font-['Syne']">
              {isLogin ? "Entrar na plataforma" : "Criar conta"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin
                ? "Acesse seu painel de auditorias."
                : "Preencha os dados para se cadastrar como proponente."}
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Formulário de LOGIN */}
          {isLogin && (
            <form action={loginDispatch} className="space-y-4" noValidate>
              <Field
                id="email"
                label="E-mail"
                type="email"
                name="email"
                placeholder="seu@email.com"
                disabled={isPending}
                autoComplete="email"
              />
              <div className="relative">
                <Field
                  id="password"
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  disabled={isPending}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-cyan-400 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 inline-flex items-center justify-center"
              >
                {isPending ? "Autenticando..." : "Entrar"}
              </button>
            </form>
          )}

          {/* Formulário de CADASTRO */}
          {!isLogin && (
            <form action={signupDispatch} className="space-y-4" noValidate>
              <Field
                id="nome_completo"
                label="Nome Completo"
                type="text"
                name="nome_completo"
                placeholder="Maria da Silva"
                disabled={isPending}
                autoComplete="name"
              />
              <Field
                id="cpf"
                label="CPF"
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                disabled={isPending}
                autoComplete="off"
                maxLength={14}
              />
              <Field
                id="email"
                label="E-mail"
                type="email"
                name="email"
                placeholder="seu@email.com"
                disabled={isPending}
                autoComplete="email"
              />
              <div className="relative">
                <Field
                  id="password"
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  disabled={isPending}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Field
                  id="confirm_password"
                  label="Confirmar Senha"
                  type={showConfirm ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Repita a senha"
                  disabled={isPending}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-cyan-400 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 inline-flex items-center justify-center"
              >
                {isPending ? "Criando conta..." : "Criar Conta"}
              </button>
            </form>
          )}

          {/* Alternador de modo */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsLogin((v) => !v)}
              disabled={isPending}
              className="text-sm text-slate-400 hover:text-cyan-400 transition"
            >
              {isLogin ? "Não tem conta? Criar conta gratuita" : "Já tem conta? Entrar"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Poseidon · Todos os direitos reservados
        </p>
      </div>
    </main>
  );
}

/* ── Campo reutilizável ─────────────────────────────── */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function Field({ id, label, ...inputProps }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500"
      >
        {label}
      </label>
      <input
        id={id}
        className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 outline-none transition"
        {...inputProps}
      />
    </div>
  );
}