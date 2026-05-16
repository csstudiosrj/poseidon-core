"use client";

import { useActionState, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  User2,
} from "lucide-react";
import { login, signup } from "./actions";

type FormState = { error: string } | null;
type AccountType = "PF" | "PJ";

async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return login(formData) as Promise<FormState>;
}

async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return signup(formData) as Promise<FormState>;
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [accountType, setAccountType] = useState<AccountType>("PF");
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, null);
  const [signupState, signupDispatch, isSignupPending] = useActionState(signupAction, null);

  const isPending = isLoginPending || isSignupPending;
  const error = mode === "login" ? loginState?.error : signupState?.error;

  const labels = useMemo(() => {
    return accountType === "PF"
      ? {
          primaryName: "Nome completo",
          primaryDoc: "CPF",
          primaryPlaceholder: "Seu nome completo",
          docPlaceholder: "000.000.000-00",
          summaryTitle: "Resumo de portfólio",
          summaryPlaceholder:
            "Descreva sua trajetória, áreas de atuação, projetos realizados e experiência cultural.",
        }
      : {
          primaryName: "Razão social",
          primaryDoc: "CNPJ",
          primaryPlaceholder: "Nome jurídico da organização",
          docPlaceholder: "00.000.000/0000-00",
          summaryTitle: "Resumo de portfólio institucional",
          summaryPlaceholder:
            "Descreva o histórico da organização, principais projetos, atuação cultural e capacidade de execução.",
        };
  }, [accountType]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl gap-6 xl:grid-cols-[1.05fr_560px]">
          <section className="hidden xl:flex xl:flex-col xl:justify-between rounded-3xl border border-white/10 bg-[var(--color-surface)]/80 p-8 shadow-[var(--shadow-card)] backdrop-blur-sm">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                Console Poseidon
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white">
                  Gestão cultural com cara de console operacional.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300">
                  Controle captação, compliance de rubricas, concentração por fornecedor
                  e risco de glosa em um ambiente técnico, direto e feito para operação real.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<FileText className="h-4 w-4" />}
                  label="Compliance ativo"
                  value="IN 29/2026"
                  description="Estrutura preparada para auditoria, execução e rastreabilidade."
                />
                <InfoCard
                  icon={<Building2 className="h-4 w-4" />}
                  label="Perfis suportados"
                  value="PF + PJ"
                  description="Cadastro com identificação inicial do proponente no primeiro acesso."
                />
              </div>
            </div>
          </section>

          <section className="ds-card overflow-hidden">
            <div className="border-b border-white/10 px-5 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Acesso seguro
                  </div>

                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {mode === "login" ? "Entrar no Poseidon" : "Criar conta"}
                  </h2>

                  <p className="text-sm leading-6 text-slate-400">
                    {mode === "login"
                      ? "Use suas credenciais para acessar o console."
                      : "Cadastre seu perfil inicial e entre no fluxo operacional."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
                >
                  {mode === "login" ? "Criar conta" : "Já tenho acesso"}
                </button>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-8 sm:py-8">
              {mode === "signup" ? (
                <form action={signupDispatch} className="space-y-6" noValidate>
                  <input type="hidden" name="tipo" value={accountType} />

                  <div className="space-y-3">
                    <label className="ds-label">Tipo de proponente</label>

                    <div className="grid grid-cols-2 gap-3">
                      <TypeTab
                        active={accountType === "PF"}
                        title="Pessoa Física"
                        subtitle="CPF e atuação individual"
                        onClick={() => setAccountType("PF")}
                      />
                      <TypeTab
                        active={accountType === "PJ"}
                        title="Pessoa Jurídica"
                        subtitle="CNPJ e perfil institucional"
                        onClick={() => setAccountType("PJ")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Field
                      label={labels.primaryName}
                      name="nome_razao_social"
                      placeholder={labels.primaryPlaceholder}
                      icon={<User2 className="h-4 w-4" />}
                      disabled={isPending}
                    />

                    <Field
                      label={labels.primaryDoc}
                      name="cpf_cnpj"
                      placeholder={labels.docPlaceholder}
                      icon={<FileText className="h-4 w-4" />}
                      mono
                      disabled={isPending}
                    />

                    <Field
                      label="E-mail"
                      name="email"
                      type="email"
                      placeholder="voce@projeto.com"
                      autoComplete="email"
                      icon={<Mail className="h-4 w-4" />}
                      disabled={isPending}
                    />

                    <PasswordField
                      label="Senha"
                      name="password"
                      placeholder="Mínimo de 8 caracteres"
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                      disabled={isPending}
                    />

                    <div className="space-y-2">
                      <label className="ds-label">{labels.summaryTitle}</label>
                      <textarea
                        name="portfolio_resumo"
                        rows={5}
                        placeholder={labels.summaryPlaceholder}
                        className="ds-input min-h-[132px]"
                        disabled={isPending}
                      />
                      <p className="text-xs text-slate-500">
                        Esse resumo ajuda a montar o perfil inicial do proponente.
                      </p>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <button type="submit" disabled={isPending} className="ds-btn-primary h-12 w-full">
                    {isPending ? "Criando conta..." : "Criar conta"}
                    {!isPending && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              ) : (
                <form action={loginDispatch} className="space-y-5" noValidate>
                  <Field
                    label="E-mail"
                    name="email"
                    type="email"
                    placeholder="voce@projeto.com"
                    autoComplete="email"
                    icon={<Mail className="h-4 w-4" />}
                    disabled={isPending}
                  />

                  <PasswordField
                    label="Senha"
                    name="password"
                    placeholder="Sua senha de acesso"
                    showPassword={showPassword}
                    onToggle={() => setShowPassword((value) => !value)}
                    disabled={isPending}
                  />

                  <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>Autenticação segura do console.</span>
                    <button type="button" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                      Esqueci minha senha
                    </button>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <button type="submit" disabled={isPending} className="ds-btn-primary h-12 w-full">
                    {isPending ? "Entrando..." : "Entrar"}
                    {!isPending && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  mono = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="ds-label">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
          {icon}
        </div>
        <input
          {...props}
          className={`ds-input h-12 pl-11 ${mono ? "ds-mono tracking-[0.04em]" : ""}`}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  placeholder,
  showPassword,
  onToggle,
  disabled,
}: {
  label: string;
  name: string;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="ds-label">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
          <Lock className="h-4 w-4" />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          className="ds-input h-12 pl-11 pr-12"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition hover:text-cyan-300"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function TypeTab({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-4 text-left transition",
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-white"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</div>
    </button>
  );
}

function InfoCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between text-slate-400">
        <span className="text-[11px] uppercase tracking-[0.22em]">{label}</span>
        {icon}
      </div>
      <div className="text-lg font-semibold tracking-[-0.03em] text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}