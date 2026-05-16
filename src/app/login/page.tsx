"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
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

  // Estado do seletor de tipo de conta (só no cadastro)
  const [tipoConta, setTipoConta] = useState<"PF" | "PJ">("PF");

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className={`w-full ${isLogin ? "max-w-[420px]" : "max-w-[520px]"} space-y-6`}>
        {/* ── Cabeçalho ─────────────────────────────────────── */}
        <div className="relative text-center space-y-2">
          {!isLogin && (
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              aria-label="Voltar para login"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white font-['Syne']">
            {isLogin ? "POSEIDON" : "CRIAR CONTA"}
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-['Inter']">
            {isLogin ? "Console de Compliance" : "Acesso ao Console Poseidon"}
          </p>
        </div>

        {/* ── Card principal ────────────────────────────────── */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-sm p-8 shadow-2xl space-y-5">
          {/* Seletor de tipo de conta (só no cadastro) */}
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-['Inter'] mb-3">
                Tipo de conta
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipoConta("PF")}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    tipoConta === "PF"
                      ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-400"
                      : "bg-slate-800/30 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => setTipoConta("PJ")}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    tipoConta === "PJ"
                      ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-400"
                      : "bg-slate-800/30 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  Pessoa Jurídica
                </button>
              </div>
            </div>
          )}

          {/* ── Formulário de LOGIN ────────────────────────── */}
          {isLogin && (
            <form action={loginDispatch} className="space-y-4" noValidate>
              <Field
                id="email"
                label="Usuário ou E-mail"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-slate-400 hover:text-slate-300 transition">
                  Esqueci minha senha
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-cyan-400/90 text-sm font-medium text-slate-900 transition hover:bg-cyan-400 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isPending ? "Autenticando..." : "Entrar"}
                {!isPending && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* ── Formulário de CADASTRO ──────────────────────── */}
          {!isLogin && (
            <form action={signupDispatch} className="space-y-4" noValidate>
              <Field
                id="nome_completo"
                label="Nome completo"
                type="text"
                name="nome_completo"
                placeholder="João da Silva"
                disabled={isPending}
                autoComplete="name"
              />
              <Field
                id="username"
                label="Nome de usuário"
                type="text"
                name="username"
                placeholder="joaosilva"
                disabled={isPending}
                autoComplete="username"
              />
              <Field
                id="email"
                label="E-mail"
                type="email"
                name="email"
                placeholder="joao@email.com"
                disabled={isPending}
                autoComplete="email"
              />
              <Field
                id="telefone"
                label="Telefone (opcional)"
                type="tel"
                name="telefone"
                placeholder="(11) 99999-9999"
                disabled={isPending}
                autoComplete="tel"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Field
                  id="confirm_password"
                  label="Confirmar senha"
                  type={showConfirm ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Digite a senha novamente"
                  disabled={isPending}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-cyan-400/90 text-sm font-medium text-slate-900 transition hover:bg-cyan-400 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isPending ? "Criando conta..." : "Criar conta"}
                {!isPending && <Check className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* ── Link de alternância ─────────────────────────── */}
          <div className="text-center text-sm">
            <span className="text-slate-500">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400/80 hover:text-cyan-400 transition font-medium"
            >
              {isLogin ? "Criar nova conta" : "Entrar"}
            </button>
          </div>
        </div>
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
        className="block text-xs uppercase tracking-wider text-slate-400 font-['Inter'] mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        className="h-11 w-full rounded-xl border border-white/10 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 outline-none transition font-['Inter']"
        {...inputProps}
      />
    </div>
  );
}