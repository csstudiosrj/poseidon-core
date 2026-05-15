"use client";

import { useActionState, useState } from "react";
import { Loader2, Eye, EyeOff, Waves } from "lucide-react";
import { login, signup, type AuthResult } from "./actions";

const INITIAL: AuthResult = null;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState(login, INITIAL);
  const [signupState, signupAction, signupPending] = useActionState(signup, INITIAL);

  const state = isLogin ? loginState : signupState;
  const formAction = isLogin ? loginAction : signupAction;
  const isPending = isLogin ? loginPending : signupPending;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="ds-card ds-card-glow flex h-12 w-12 items-center justify-center rounded-2xl">
            <Waves className="h-6 w-6 text-[var(--color-ds-cyan)]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ds-text)]">
              Poseidon
            </h1>
            <p className="mt-1 text-sm text-[var(--color-ds-text-muted)]">
              Gestão cultural com compliance IN 29/2026
            </p>
          </div>
        </div>

        <div className="ds-card p-6">
          <h2 className="mb-5 text-base font-semibold text-[var(--color-ds-text)]">
            {isLogin ? "Entrar na plataforma" : "Criar conta"}
          </h2>

          <form action={formAction} className="space-y-4" noValidate>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="nome_completo" className="ds-label">
                    Nome completo
                  </label>
                  <input
                    id="nome_completo"
                    name="nome_completo"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    className="ds-input"
                  />
                </div>

                <div>
                  <label htmlFor="cpf" className="ds-label">
                    CPF
                  </label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    className="ds-input ds-mono"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="ds-label">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="ds-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="ds-label">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="ds-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ds-text-muted)] transition hover:text-[var(--color-ds-text)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {state?.error ? (
              <div className="rounded-xl border border-[rgba(255,77,106,.3)] bg-[rgba(255,77,106,.07)] px-3 py-2 text-sm text-[var(--color-ds-error)]">
                {state.error}
              </div>
            ) : null}

            <button type="submit" disabled={isPending} className="ds-btn-primary w-full">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending
                ? isLogin
                  ? "Entrando…"
                  : "Criando conta…"
                : isLogin
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsLogin((v) => !v)}
              className="text-sm text-[var(--color-ds-text-muted)] transition hover:text-[var(--color-ds-text)]"
            >
              {isLogin
                ? "Não tem conta? Crie uma"
                : "Já tem conta? Entre"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ds-text-faint)]">
          Poseidon · Compliance cultural 2026
        </p>
      </div>
    </main>
  );
}