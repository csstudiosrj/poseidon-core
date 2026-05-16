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
          title: "Pessoa Física",
          primaryName: "Nome completo",
          primaryDoc: "CPF",
          primaryPlaceholder: "Seu nome completo",
          docPlaceholder: "000.000.000-00",
          summaryTitle: "Resumo de portfólio",
          summaryPlaceholder:
            "Descreva sua trajetória, áreas de atuação, projetos realizados e experiência cultural.",
        }
      : {
          title: "Pessoa Jurídica",
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
    <main className="auth-shell">
      <div className="auth-grid">
        <section className="auth-panel auth-panel--info">
          <div className="auth-badge">
            <ShieldCheck className="h-4 w-4" />
            Console Poseidon
          </div>

          <div className="auth-copy">
            <h1 className="auth-title">
              Gestão cultural com cara de console operacional.
            </h1>
            <p className="auth-description">
              Controle captação, compliance de rubricas, concentração por fornecedor
              e risco de glosa em um ambiente técnico, direto e feito para operação real.
            </p>
          </div>

          <div className="auth-info-grid">
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
        </section>

        <section className="auth-panel auth-panel--form ds-card">
          <div className="auth-header">
            <div className="auth-header-copy">
              <div className="auth-pill">
                <span className="auth-pill-dot" />
                Acesso seguro
              </div>
              <h2 className="auth-heading">
                {mode === "login" ? "Entrar no Poseidon" : "Criar conta"}
              </h2>
              <p className="auth-subheading">
                {mode === "login"
                  ? "Use suas credenciais para acessar o console."
                  : "Cadastre seu perfil inicial e entre no fluxo operacional."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
              className="auth-switch"
            >
              {mode === "login" ? "Criar conta" : "Já tenho acesso"}
            </button>
          </div>

          <div className="auth-body">
            {mode === "signup" ? (
              <form action={signupDispatch} className="auth-form" noValidate>
                <input type="hidden" name="tipo" value={accountType} />

                <div className="auth-section">
                  <label className="ds-label">Tipo de proponente</label>
                  <div className="auth-tabs">
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

                <div className="auth-fields">
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

                  <div className="auth-section">
                    <label className="ds-label">{labels.summaryTitle}</label>
                    <textarea
                      name="portfolio_resumo"
                      rows={5}
                      placeholder={labels.summaryPlaceholder}
                      className="ds-input auth-textarea"
                      disabled={isPending}
                    />
                    <p className="auth-help">
                      Esse resumo ajuda a montar o perfil inicial do proponente.
                    </p>
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" disabled={isPending} className="ds-btn-primary auth-submit">
                  {isPending ? "Criando conta..." : "Criar conta"}
                  {!isPending && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            ) : (
              <form action={loginDispatch} className="auth-form" noValidate>
                <div className="auth-fields">
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
                </div>

                <div className="auth-row">
                  <span className="auth-help">Autenticação segura do console.</span>
                  <button type="button" className="auth-link">
                    Esqueci minha senha
                  </button>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" disabled={isPending} className="ds-btn-primary auth-submit">
                  {isPending ? "Entrando..." : "Entrar"}
                  {!isPending && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}
          </div>
        </section>
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
    <div className="auth-field">
      <label className="ds-label">{label}</label>
      <div className="auth-input-wrap">
        <div className="auth-input-icon">{icon}</div>
        <input {...props} className={`ds-input auth-input ${mono ? "ds-mono" : ""}`} />
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
    <div className="auth-field">
      <label className="ds-label">{label}</label>
      <div className="auth-input-wrap">
        <div className="auth-input-icon">
          <Lock className="h-4 w-4" />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className="ds-input auth-input auth-input--password"
          disabled={disabled}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="auth-input-action"
          disabled={disabled}
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
      className={`auth-tab ${active ? "auth-tab--active" : ""}`}
    >
      <span className="auth-tab-title">{title}</span>
      <span className="auth-tab-subtitle">{subtitle}</span>
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
    <div className="auth-mini-card">
      <div className="auth-mini-card-top">
        <span className="auth-mini-card-label">{label}</span>
        {icon}
      </div>
      <div className="auth-mini-card-value">{value}</div>
      <p className="auth-mini-card-description">{description}</p>
    </div>
  );
}