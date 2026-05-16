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
  Phone,
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

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function maskCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [accountType, setAccountType] = useState<AccountType>("PF");
  const [showPassword, setShowPassword] = useState(false);

  const [documentValue, setDocumentValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

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
          legalHint: "Cadastro individual para proponentes pessoa física.",
        }
      : {
          primaryName: "Razão social",
          primaryDoc: "CNPJ",
          primaryPlaceholder: "Nome jurídico da organização",
          docPlaceholder: "00.000.000/0000-00",
          legalHint: "Cadastro institucional para produtoras, coletivos e empresas culturais.",
        };
  }, [accountType]);

  function handleDocumentChange(value: string) {
    const cleaned = onlyDigits(value);
    setDocumentValue(accountType === "PF" ? maskCpf(cleaned) : maskCnpj(cleaned));
  }

  function handlePhoneChange(value: string) {
    setPhoneValue(maskPhone(value));
  }

  return (
    <main className="auth-shell">
      <div className="auth-noise" />
      <div className="auth-container">
        <div className="auth-grid">
          <section className="auth-hero ds-card">
            <div className="auth-badge">
              <ShieldCheck className="h-4 w-4" />
              Poseidon
            </div>

            <div className="auth-hero-copy">
              <h1 className="auth-hero-title">
                O sistema que trata projeto cultural com a seriedade que ele merece.
              </h1>
              <p className="auth-hero-text">
                Criação, gestão e prestação de contas no mesmo ambiente. Sem gambiarra,
                sem planilha solta e sem perder prazo. O Poseidon nasceu para ser o jeito
                mais forte, completo e confiável de operar projetos culturais no Brasil.
              </p>
            </div>

            <div className="auth-hero-grid">
              <InfoCard
                icon={<FileText className="h-4 w-4" />}
                label="Compliance ativo"
                value="IN 29/2026"
                description="Estrutura pronta para execução, auditoria e rastreabilidade."
              />
              <InfoCard
                icon={<Building2 className="h-4 w-4" />}
                label="Perfis suportados"
                value="PF + PJ"
                description="Cadastro inicial já alinhado com o perfil real do proponente."
              />
            </div>
          </section>

          <section className="auth-panel ds-card">
            <div className="auth-panel-header">
              <div>
                <div className="auth-pill">
                  <span className="auth-pill-dot" />
                  acesso seguro
                </div>

                <h2 className="auth-panel-title">
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </h2>

                <p className="auth-panel-text">
                  {mode === "login"
                    ? "Acesse sua operação e continue de onde parou."
                    : "Cadastre seu perfil inicial e entre no Poseidon do jeito certo, já no primeiro acesso."}
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

            <div className="auth-panel-body">
              {mode === "signup" ? (
                <form action={signupDispatch} className="space-y-6" noValidate>
                  <input type="hidden" name="tipo" value={accountType} />
                  <input type="hidden" name="cpf_cnpj" value={onlyDigits(documentValue)} />
                  <input type="hidden" name="telefone" value={onlyDigits(phoneValue)} />

                  <div className="space-y-3">
                    <label className="ds-label">Tipo de proponente</label>

                    <div className="auth-tabs">
                      <TypeTab
                        active={accountType === "PF"}
                        title="Pessoa Física"
                        subtitle="CPF e atuação individual"
                        onClick={() => {
                          setAccountType("PF");
                          setDocumentValue("");
                        }}
                      />
                      <TypeTab
                        active={accountType === "PJ"}
                        title="Pessoa Jurídica"
                        subtitle="CNPJ e perfil institucional"
                        onClick={() => {
                          setAccountType("PJ");
                          setDocumentValue("");
                        }}
                      />
                    </div>

                    <p className="auth-help">{labels.legalHint}</p>
                  </div>

                  <div className="auth-fields">
                    <Field
                      label={labels.primaryName}
                      name="nome_razao_social"
                      placeholder={labels.primaryPlaceholder}
                      icon={<User2 className="h-4 w-4" />}
                      disabled={isPending}
                    />

                    <MaskedField
                      label={labels.primaryDoc}
                      displayName={`${accountType.toLowerCase()}_display`}
                      value={documentValue}
                      onChange={handleDocumentChange}
                      placeholder={labels.docPlaceholder}
                      icon={<FileText className="h-4 w-4" />}
                      disabled={isPending}
                      mono
                      inputMode="numeric"
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

                    <MaskedField
                      label="Telefone"
                      displayName="telefone_display"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      placeholder="(21) 99999-9999"
                      icon={<Phone className="h-4 w-4" />}
                      disabled={isPending}
                      inputMode="numeric"
                    />

                    <PasswordField
                      label="Senha"
                      name="password"
                      placeholder="Mínimo de 8 caracteres"
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                      disabled={isPending}
                    />
                  </div>

                  {error && <p className="auth-error">{error}</p>}

                  <button type="submit" disabled={isPending} className="ds-btn-primary auth-submit">
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

                  <div className="auth-row">
                    <span className="auth-help">Acesso seguro ao Poseidon.</span>
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
      <div className="auth-input-wrap">
        <div className="auth-input-icon">{icon}</div>
        <input
          {...props}
          className={`ds-input auth-input ${mono ? "ds-mono tracking-[0.04em]" : ""}`}
        />
      </div>
    </div>
  );
}

function MaskedField({
  label,
  icon,
  value,
  onChange,
  mono = false,
  displayName,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "name"> & {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
  displayName: string;
}) {
  return (
    <div className="space-y-2">
      <label className="ds-label">{label}</label>
      <div className="auth-input-wrap">
        <div className="auth-input-icon">{icon}</div>
        <input
          {...props}
          name={displayName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`ds-input auth-input ${mono ? "ds-mono tracking-[0.04em]" : ""}`}
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
      <div className="auth-input-wrap">
        <div className="auth-input-icon">
          <Lock className="h-4 w-4" />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          className="ds-input auth-input auth-input-password"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          disabled={disabled}
          className="auth-input-action"
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
      className={`auth-tab ${active ? "auth-tab-active" : ""}`}
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