"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Loader2, Eye, EyeOff, MailCheck } from "lucide-react";
import { Toaster, toast } from "sonner";
import "../globals.css";
import { login, signup, recuperarAcesso, confirmarEnvioRecuperacao } from "./actions";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans flex items-center justify-center p-4 sm:p-6 md:p-10">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#081c35",
            border: "1px solid #0c2a4a",
            color: "#e2e8f0",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          },
          classNames: {
            success: "!border-l-[3px] !border-l-[#22d3ee]",
            error: "!border-l-[3px] !border-l-[#f43f5e]",
          },
        }}
      />
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 items-center">
        {/* HERO SECTION */}
        <section className="md:col-span-5 md:pr-10 flex flex-col items-start text-left space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <svg aria-label="Poseidon" viewBox="0 0 32 32" width="26" height="26" fill="none">
                <path d="M16 3 L16 29 M10 10 L16 3 L22 10 M8 18 L16 29 L24 18" stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={16} cy={16} r={13} stroke="rgba(34,211,238,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight leading-none">Poseidon</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 mt-1 font-medium">
                A tecnologia que domina a maré da burocracia cultural.
              </div>
            </div>
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/15">
            Pra quem vive de cultura
          </span>

          <p className="text-xs text-white/50 leading-relaxed max-w-sm">
            A primeira e única plataforma de <strong className="text-white/70">criação e gestão completa de projetos culturais</strong> com <strong className="text-cyan-400">IA própria</strong>, sem uso de APIs genéricas. Da ideia à execução, um sistema que entende toda a jornada do produtor brasileiro.
          </p>

          <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-white font-mono tracking-tight">IA proprietária</span>
              <span className="text-[10px] text-white/30 font-medium">zero APIs externas</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-white font-mono tracking-tight">+30 leis mapeadas</span>
              <span className="text-[10px] text-white/30 font-medium">federal, estadual e municipal</span>
            </div>
          </div>
        </section>

        {/* FORM CONTAINER with Suspense boundary */}
        <div className="md:col-span-7 w-full max-w-md md:max-w-none mx-auto md:ml-6">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="card p-6 md:p-8 animate-pulse">
      <div className="h-4 w-32 bg-sea-700 rounded mb-4" />
      <div className="h-3 w-64 bg-sea-700 rounded mb-6" />
      <div className="space-y-4">
        <div className="h-10 bg-sea-700 rounded" />
        <div className="h-10 bg-sea-700 rounded" />
        <div className="h-10 bg-sea-700 rounded" />
        <div className="h-10 bg-cyan-500/20 rounded mt-2" />
      </div>
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  useEffect(() => {
    if (confirmed === "true") {
      toast.success("E-mail confirmado! Faça login para acessar sua conta.");
    }
  }, [confirmed]);

  const [mode, setMode] = useState<"login" | "signup" | "recuperar">("login");
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<"inicio" | "confirmar">("inicio");
  const [emailMascarado, setEmailMascarado] = useState("");
  const [emailEncontrado, setEmailEncontrado] = useState("");
  const [nomeEncontrado, setNomeEncontrado] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"PF" | "PJ">("PF");
  const [doc, setDoc] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  function formatDocument(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    let formatted = digits;
    if (digits.length <= 11) {
      formatted = digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else {
      formatted = digits.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4").replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }
    return formatted;
  }

  async function handleRecuperarAcesso(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);

    const formData = new FormData(e.currentTarget);

    if (etapaRecuperacao === "confirmar") {
      const result = await confirmarEnvioRecuperacao(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Link de recuperação enviado! Verifique sua caixa de entrada.");
      setEnviando(false);
      return;
    }

    const result = await recuperarAcesso(formData);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.sucesso && result?.etapa === "confirmar_envio") {
      setEmailMascarado(result.emailMascarado);
      setEmailEncontrado(result.emailEncontrado || "");
      setNomeEncontrado(result.nome || "");
      setEtapaRecuperacao("confirmar");
      toast.success(`Encontramos o e-mail ${result.emailMascarado}. Confirme para enviar o link.`);
    } else if (result?.success) {
      toast.success("Link de recuperação enviado! Verifique sua caixa de entrada.");
    }
    setEnviando(false);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      toast.error(result.error);
    }
    setEnviando(false);
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("password-confirm") as string;

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      setEnviando(false);
      return;
    }

    const result = await signup(formData);

    if (!result.success) {
      toast.error(result.error || "Erro ao criar conta.");
    } else {
      setSignupSuccess(true);
      toast.success(result.message || "Conta criada com sucesso!");
      (e.target as HTMLFormElement).reset();
      setDoc("");
    }
    setEnviando(false);
  }

  function voltarParaInicio() {
    setMode("login");
    setEtapaRecuperacao("inicio");
    setEmailMascarado("");
    setEmailEncontrado("");
    setSignupSuccess(false);
  }

  if (signupSuccess) {
    return (
      <section className="card p-6 md:p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center">
            <MailCheck size={32} className="text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Conta criada!</h2>
          <p className="text-sm text-white/60 max-w-sm">
            Enviamos um e‑mail de confirmação para sua caixa de entrada. <strong>Verifique também a pasta de spam</strong> e clique no link para ativar seu acesso.
          </p>
          <button
            type="button"
            onClick={() => {
              setSignupSuccess(false);
              setMode("login");
            }}
            className="mt-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 px-6 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            Ir para login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-base font-bold text-white tracking-tight">
          {mode === "login" ? "Entrar no Poseidon" : mode === "signup" ? "Criar acesso ao Poseidon" : "Recuperar acesso"}
        </h1>
        <p className="text-xs text-white/40 mt-1.5 leading-relaxed font-medium">
          {mode === "login"
            ? "Acompanhe seus projetos culturais com o mesmo cuidado que o fiscal do edital."
            : mode === "signup"
            ? "Comece a criar projetos com a IA proprietária do Poseidon."
            : etapaRecuperacao === "confirmar"
            ? `Confirme o envio do link para ${emailMascarado}.`
            : "Informe seu e-mail ou CPF/CNPJ para recuperar o acesso."}
        </p>
      </header>

      {mode === "recuperar" ? (
        <form onSubmit={handleRecuperarAcesso} className="flex flex-col gap-4">
          {etapaRecuperacao === "inicio" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">E-mail</label>
                <input type="email" id="email" name="email" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="voce@produtora.com" disabled={enviando} />
              </div>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-white/20 uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="documento" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">CPF/CNPJ</label>
                <input type="text" id="documento" name="documento" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 font-mono tabular-nums" placeholder="000.000.000-00 ou 00.000.000/0000-00" disabled={enviando} />
              </div>
            </>
          ) : (
            <input type="hidden" name="email" value={emailEncontrado} />
          )}

          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={enviando}>
            {enviando && <Loader2 size={14} className="animate-spin" />}
            <span>{enviando ? "Enviando…" : etapaRecuperacao === "confirmar" ? "Sim, enviar link" : "Enviar link"}</span>
          </button>

          <button type="button" onClick={voltarParaInicio} className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer bg-transparent border-none p-0 text-center">
            Voltar para login
          </button>
        </form>
      ) : (
        <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">E-mail</label>
            <input type="email" id="email" name="email" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="voce@produtora.com" required disabled={enviando} />
          </div>

          {mode === "signup" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Tipo de pessoa</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setTipoPessoa("PF")} className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${tipoPessoa === "PF" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-sea-950 border-white/10 text-white/40 hover:text-white/70"}`}>Pessoa Física</button>
                  <button type="button" onClick={() => setTipoPessoa("PJ")} className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${tipoPessoa === "PJ" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-sea-950 border-white/10 text-white/40 hover:text-white/70"}`}>Pessoa Jurídica</button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nome_completo" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{tipoPessoa === "PF" ? "Nome completo" : "Nome do responsável"}</label>
                <input type="text" id="nome_completo" name="nome_completo" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder={tipoPessoa === "PF" ? "Seu nome completo" : "Nome de quem responde pelo projeto"} required disabled={enviando} />
              </div>
              {tipoPessoa === "PJ" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nome_empresa" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Nome da empresa</label>
                  <input type="text" id="nome_empresa" name="nome_empresa" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Razão social da empresa" required disabled={enviando} />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="documento" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{tipoPessoa === "PF" ? "CPF" : "CNPJ"}</label>
                <input type="text" id="documento" name="documento" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 font-mono tabular-nums" placeholder={tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} value={doc} disabled={enviando} onChange={(e) => setDoc(formatDocument(e.target.value))} />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" name="password" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 pr-10 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Use uma senha forte" required disabled={enviando} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password-confirm" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Confirmar senha</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} id="password-confirm" name="password-confirm" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 pr-10 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Repita a senha" required disabled={enviando} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 mt-1">
                <input type="checkbox" id="terms" name="terms" className="mt-0.5 rounded border-white/10 bg-sea-950 text-cyan-500 focus:ring-cyan-500/30 h-3.5 w-3.5 transition-all" required disabled={enviando} />
                <label htmlFor="terms" className="text-[11px] text-white/40 leading-tight font-medium cursor-pointer select-none">
                  Concordo com o uso de dados para análise de projetos culturais.
                </label>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={enviando}>
            {enviando && <Loader2 size={14} className="animate-spin" />}
            <span>{enviando ? (mode === "login" ? "Entrando…" : "Criando conta…") : mode === "login" ? "Entrar" : "Criar conta"}</span>
          </button>

          <div className="text-center mt-2 space-y-1">
            <p className="text-[11px] text-white/30 font-medium">
              {mode === "login" ? (
                <>Ainda não tem acesso?{" "}<button type="button" onClick={() => setMode("signup")} disabled={enviando} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer disabled:opacity-50 bg-transparent border-none p-0 inline text-[11px]">Criar conta</button></>
              ) : (
                <>Já tem conta?{" "}<button type="button" onClick={() => setMode("login")} disabled={enviando} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer disabled:opacity-50 bg-transparent border-none p-0 inline text-[11px]">Voltar para login</button></>
              )}
            </p>
            {mode === "login" && (
              <p className="text-[11px] text-white/30 font-medium">
                <button type="button" onClick={() => { setMode("recuperar"); setEtapaRecuperacao("inicio"); }} disabled={enviando} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer disabled:opacity-50 bg-transparent border-none p-0 inline text-[11px]">Esqueceu seu acesso?</button>
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  );
}