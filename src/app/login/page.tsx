"use client";

import { useMemo, useState } from "react";
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

type AccountType = "PF" | "PJ";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [accountType, setAccountType] = useState<AccountType>("PF");
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="min-h-screen bg-[#020b18] text-white">
      <div className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.05),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_560px]">
            <section className="hidden rounded-3xl border border-white/10 bg-[#081121]/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur xl:flex xl:flex-col xl:justify-between">
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
                    Controle captação, compliance de rubricas, concentração por
                    fornecedor e risco de glosa em um ambiente técnico, direto e
                    feito para operação real.
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
                    description="Cadastro com identificação inicial de proponente logo no primeiro acesso."
                  />
                </div>
              </div>

              <div className="mt-10 grid gap-3">
                <MetricRow label="Tempo médio de análise" value="02m 14s" />
                <MetricRow label="Eventos de auditoria" value="Tempo real" />
                <MetricRow label="Estrutura visual" value="Deep Sea" />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#081121]/88 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
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
                    onClick={() =>
                      setMode((current) =>
                        current === "login" ? "signup" : "login"
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
                  >
                    {mode === "login" ? "Criar conta" : "Já tenho acesso"}
                  </button>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-8 sm:py-8">
                {mode === "signup" ? (
                  <form className="space-y-6">
                    <div className="space-y-3">
                      <Label>Tipo de proponente</Label>
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
                        name={accountType === "PF" ? "nome_completo" : "razao_social"}
                        placeholder={labels.primaryPlaceholder}
                        icon={<User2 className="h-4 w-4" />}
                      />

                      <Field
                        label={labels.primaryDoc}
                        name={accountType === "PF" ? "cpf" : "cnpj"}
                        placeholder={labels.docPlaceholder}
                        icon={<FileText className="h-4 w-4" />}
                        mono
                      />

                      <Field
                        label="E-mail"
                        name="email"
                        type="email"
                        placeholder="voce@projeto.com"
                        autoComplete="email"
                        icon={<Mail className="h-4 w-4" />}
                      />

                      <PasswordField
                        label="Senha"
                        name="password"
                        placeholder="Mínimo de 8 caracteres"
                        showPassword={showPassword}
                        onToggle={() => setShowPassword((value) => !value)}
                      />

                      <div className="space-y-2">
                        <Label>{labels.summaryTitle}</Label>
                        <textarea
                          name="portfolio_resumo"
                          rows={5}
                          placeholder={labels.summaryPlaceholder}
                          className="w-full rounded-2xl border border-white/10 bg-[#0b1730] px-4 py-3 text-sm leading-6 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
                        />
                        <p className="text-xs text-slate-500">
                          Esse resumo ajuda a montar o perfil inicial do proponente.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-medium text-[#03131f] transition hover:bg-cyan-300"
                    >
                      Criar conta
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <form className="space-y-5">
                    <Field
                      label="E-mail"
                      name="email"
                      type="email"
                      placeholder="voce@projeto.com"
                      autoComplete="email"
                      icon={<Mail className="h-4 w-4" />}
                    />

                    <PasswordField
                      label="Senha"
                      name="password"
                      placeholder="Sua senha de acesso"
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                    />

                    <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>Autenticação segura do console.</span>
                      <button
                        type="button"
                        className="font-medium text-cyan-300 transition hover:text-cyan-200"
                      >
                        Esqueci minha senha
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-medium text-[#03131f] transition hover:bg-cyan-300"
                    >
                      Entrar
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.22em] text-slate-400">
      {children}
    </label>
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
      <Label>{label}</Label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition group-focus-within:text-cyan-300">
          {icon}
        </div>
        <input
          {...props}
          className={`h-12 w-full rounded-2xl border border-white/10 bg-[#0b1730] pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15 ${
            mono ? "font-mono tracking-[0.04em]" : ""
          }`}
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
}: {
  label: string;
  name: string;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition group-focus-within:text-cyan-300">
          <Lock className="h-4 w-4" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          autoComplete={name === "password" ? "current-password" : "off"}
          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1730] pl-11 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition hover:text-cyan-300"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
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
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-white shadow-[0_0_0_1px_rgba(0,229,255,0.08)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
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
      <div className="text-lg font-semibold tracking-[-0.03em] text-white">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="font-mono text-sm text-slate-200">{value}</span>
    </div>
  );
}