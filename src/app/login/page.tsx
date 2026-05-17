// src/app/login/page.tsx
"use client";

import React, { useActionState } from "react";
import { Loader2 } from "lucide-react";
import "../globals.css";
import { login, signup } from "./actions";

type ActionState = { error: string } | null;

async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return (await login(formData)) ?? null;
}

async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return (await signup(formData)) ?? null;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center px-2 sm:px-4">
        {/* HERO SECTION */}
        <section className="md:col-span-5 flex flex-col items-start text-left space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <svg aria-label="Poseidon" viewBox="0 0 32 32" width="26" height="26" fill="none">
                <path d="M16 3 L16 29 M10 10 L16 3 L22 10 M8 18 L16 29 L24 18" stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={16} cy={16} r={13} stroke="rgba(34,211,238,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight leading-none">Poseidon</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 mt-1 font-medium">A tecnologia que domina a maré da burocracia cultural.</div>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/15">
            Feito para quem vive de edital
          </span>
          <p className="text-xs text-white/50 leading-relaxed max-w-sm">
            Organize captação, execução e prestação de contas em um só sistema, sem se perder em planilhas e e-mails espalhados pela maré de burocracia.
          </p>
          <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-white font-mono tracking-tight">R$ 4.200.000</span>
              <span className="text-[10px] text-white/30 font-medium">em orçamento simulado</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-white font-mono tracking-tight">IA + regras MinC</span>
              <span className="text-[10px] text-white/30 font-medium">pra não afundar em glosa</span>
            </div>
          </div>
        </section>

        {/* FORM CONTAINER */}
        <div className="md:col-span-7 w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [doc, setDoc] = React.useState("");

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, null);
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, null);

  const isLogin = mode === "login";
  const formAction = isLogin ? loginFormAction : signupFormAction;
  const state = isLogin ? loginState : signupState;
  const isPending = isLogin ? isLoginPending : isSignupPending;

  function handleToggle() {
    setMode(isLogin ? "signup" : "login");
  }

  return (
    <section className="card p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-base font-bold text-white tracking-tight">{isLogin ? "Entrar no Poseidon" : "Criar acesso ao Poseidon"}</h1>
        <p className="text-xs text-white/40 mt-1.5 leading-relaxed font-medium">
          {isLogin ? "Acompanhe seus projetos culturais com o mesmo cuidado que o fiscal do edital." : "Comece a testar o controle de rubricas e o feed de auditoria com um projeto simulado."}
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">E-mail</label>
          <input type="email" id="email" name="email" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="voce@produtora.com" required disabled={isPending} />
        </div>

        {!isLogin && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome_completo" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Nome completo</label>
              <input type="text" id="nome_completo" name="nome_completo" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Nome de quem responde pelo projeto" disabled={isPending} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="documento" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">CPF ou CNPJ</label>
              <input type="text" id="documento" name="documento" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 font-mono tabular-nums" placeholder="000.000.000-00 ou 00.000.000/0000-00" value={doc} disabled={isPending} onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 14);
                let formatted = digits;
                if (digits.length <= 11) {
                  formatted = digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
                } else {
                  formatted = digits.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4").replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
                }
                setDoc(formatted);
              }} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Senha</label>
          <input type="password" id="password" name="password" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Use uma senha forte" required disabled={isPending} />
        </div>

        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password-confirm" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Confirmar senha</label>
            <input type="password" id="password-confirm" name="password-confirm" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Repita a senha" disabled={isPending} />
          </div>
        )}

        <div className="flex items-start gap-2.5 mt-1">
          <input type="checkbox" id={isLogin ? "remember" : "terms"} name={isLogin ? "remember" : "terms"} defaultChecked={isLogin ? true : undefined} disabled={isPending} className="mt-0.5 rounded border-white/10 bg-sea-950 text-cyan-500 focus:ring-cyan-500/30 h-3.5 w-3.5 transition-all" />
          <label htmlFor={isLogin ? "remember" : "terms"} className="text-[11px] text-white/40 leading-tight font-medium cursor-pointer select-none">
            {isLogin ? "Manter conectado neste dispositivo" : "Concordo com o uso de dados para análise de projetos culturais."}
          </label>
        </div>

        <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={isPending}>
          {isPending && <Loader2 size={14} className="animate-spin" />}
          <span>{isPending ? (isLogin ? "Entrando…" : "Criando conta…") : (isLogin ? "Entrar" : "Criar conta")}</span>
        </button>

        <div className="text-center mt-2">
          <p className="text-[11px] text-white/30 font-medium">
            {isLogin ? (
              <>Ainda não tem acesso? <button type="button" onClick={handleToggle} disabled={isPending} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer disabled:opacity-50 bg-transparent border-none p-0 inline text-[11px]">Criar conta</button></>
            ) : (
              <>Já tem conta? <button type="button" onClick={handleToggle} disabled={isPending} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer disabled:opacity-50 bg-transparent border-none p-0 inline text-[11px]">Voltar para login</button></>
            )}
          </p>
        </div>

        {state?.error && (
          <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[11px] text-red-400 flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
      </form>
    </section>
  );
}