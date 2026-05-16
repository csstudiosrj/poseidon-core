"use client";

import { useActionState, useState, useTransition } from "react";
import { login, signup } from "./actions";

/* ============================================================
   Tipos
   ============================================================ */
type FormState = { error: string } | null;

/* ============================================================
   Wrapper: adapta as actions para useActionState
   Ambas fazem redirect em sucesso, logo sÃ³ chegam aqui em erro.
   ============================================================ */
async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  return login(formData) as Promise<FormState>;
}

async function signupAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  return signup(formData) as Promise<FormState>;
}

/* ============================================================
   Componente principal
   ============================================================ */
export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [loginState,  loginDispatch,  isLoginPending]  =
    useActionState(loginAction,  null);
  const [signupState, signupDispatch, isSignupPending] =
    useActionState(signupAction, null);

  const isPending = isLoginPending || isSignupPending;
  const error     = isLogin ? loginState?.error : signupState?.error;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Logotipo / tÃ­tulo */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-ds-text)]">
            Pose<span className="text-[var(--color-ds-cyan)]">idon</span>
          </h1>
          <p className="text-sm text-[var(--color-ds-text-muted)]">
            Auditoria Cultural Â· Lei Rouanet Â· IN 29/2026
          </p>
        </div>

        {/* Card principal */}
        <div className="ds-card-glow space-y-5">

          {/* TÃ­tulo do formulÃ¡rio */}
          <div>
            <h2 className="text-xl font-bold text-[var(--color-ds-text)]">
              {isLogin ? "Entrar na plataforma" : "Criar conta"}
            </h2>
            <p className="text-xs text-[var(--color-ds-text-muted)] mt-1">
              {isLogin
                ? "Acesse seu painel de auditorias."
                : "Preencha os dados para se cadastrar como proponente."}
            </p>
          </div>

          <hr className="ds-divider" />

          {/* FormulÃ¡rio de LOGIN */}
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
              <Field
                id="password"
                label="Senha"
                type="password"
                name="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                disabled={isPending}
                autoComplete="current-password"
              />

              {error && <p className="ds-error">{error}</p>}

              <button
                type="submit"
                className="ds-btn-primary"
                disabled={isPending}
              >
                {isPending ? "Autenticandoâ€¦" : "Entrar â†’"}
              </button>
            </form>
          )}

          {/* FormulÃ¡rio de CADASTRO */}
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
              <Field
                id="password"
                label="Senha"
                type="password"
                name="password"
                placeholder="MÃ­nimo 8 caracteres"
                disabled={isPending}
                autoComplete="new-password"
              />

              {error && <p className="ds-error">{error}</p>}

              <button
                type="submit"
                className="ds-btn-primary"
                disabled={isPending}
              >
                {isPending ? "Criando contaâ€¦" : "Criar Conta â†’"}
              </button>
            </form>
          )}

          {/* Alternador de modo */}
          <div className="text-center pt-1">
            <button
              type="button"
              className="ds-btn-ghost text-sm"
              onClick={() => setIsLogin((v) => !v)}
              disabled={isPending}
            >
              {isLogin
                ? "NÃ£o tem conta? Criar conta gratuita"
                : "JÃ¡ tem conta? Entrar"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-ds-text-muted)]">
          Â© {new Date().getFullYear()} Poseidon Â· Todos os direitos reservados
        </p>
      </div>
    </main>
  );
}

/* ============================================================
   Componente de campo reutilizÃ¡vel
   ============================================================ */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function Field({ id, label, ...inputProps }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="ds-label">
        {label}
      </label>
      <input id={id} className="ds-input" {...inputProps} />
    </div>
  );
}