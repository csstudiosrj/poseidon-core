"use client";

import React from "react";
import "../globals.css";

export default function LoginPage() {
  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        {/* Lado hero / branding */}
        <section className="login-hero">
          <div className="login-hero-header">
            <svg
              aria-label="Poseidon"
              viewBox="0 0 32 32"
              width="28"
              height="28"
              fill="none"
            >
              <path
                d="M16 3 L16 29 M10 10 L16 3 L22 10 M8 18 L16 29 L24 18"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={16}
                cy={16}
                r={13}
                stroke="rgba(34,211,238,0.2)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            </svg>
            <div>
              <div className="login-hero-title">Poseidon</div>
              <div
                className="text-[11px] uppercase tracking-[0.14em]"
                style={{ color: "rgba(148,163,184,0.9)" }}
              >
                Controle e auditoria cultural
              </div>
            </div>
          </div>

          <span
            className="ds-badge ds-badge-warning"
            style={{ marginBottom: 10 }}
          >
            Feito para quem vive de edital
          </span>

          <p className="login-hero-sub">
            Organize captação, execução e prestação de contas em um só sistema,
            sem se perder em planilhas e e-mails espalhados pela maré de
            burocracia.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              fontSize: 11,
              color: "rgba(148,163,184,0.9)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span className="num-tabular">R$ 4.200.000</span>
              <span style={{ opacity: 0.8 }}>em orçamento simulado</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span className="num-tabular">IA + regras MinC</span>
              <span style={{ opacity: 0.8 }}>pra não afundar em glosa</span>
            </div>
          </div>
        </section>

        {/* Lado formulário */}
        <LoginForm />
      </div>
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [error, setError] = React.useState<string | null>(null);

  const isLogin = mode === "login";

  function handleToggle() {
    setError(null);
    setMode(isLogin ? "signup" : "login");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(
      isLogin
        ? "Login ainda não conectado ao backend."
        : "Cadastro ainda não conectado ao backend."
    );
  }

  return (
    <section className="ds-card-soft" style={{ padding: "22px 20px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--color-text)",
            }}
          >
            {isLogin ? "Entrar no Poseidon" : "Criar acesso ao Poseidon"}
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "rgba(148,163,184,0.9)",
              marginTop: 4,
            }}
          >
            {isLogin
              ? "Acompanhe seus projetos culturais com o mesmo cuidado que o fiscal do edital."
              : "Comece a testar o controle de rubricas e o feed de auditoria com um projeto simulado."}
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div className="ds-field">
          <label htmlFor="email" className="ds-label">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="ds-input"
            placeholder="voce@produtora.com"
            required
          />
        </div>

        {!isLogin && (
          <>
            <div className="ds-field">
              <label htmlFor="name" className="ds-label">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="ds-input"
                placeholder="Nome de quem responde pelo projeto"
              />
            </div>

            <div className="ds-field">
              <label htmlFor="doc" className="ds-label">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                id="doc"
                name="doc"
                className="ds-input num-tabular"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>
          </>
        )}

        <div className="ds-field">
          <label htmlFor="password" className="ds-label">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="ds-input"
            placeholder="Use uma senha forte"
            required
          />
        </div>

        {!isLogin && (
          <div className="ds-field">
            <label htmlFor="password-confirm" className="ds-label">
              Confirmar senha
            </label>
            <input
              type="password"
              id="password-confirm"
              name="password-confirm"
              className="ds-input"
              placeholder="Repita a senha"
            />
          </div>
        )}

        <div className="ds-checkbox-row" style={{ marginTop: 4 }}>
          {isLogin ? (
            <>
              <input
                type="checkbox"
                id="remember"
                name="remember"
                defaultChecked
              />
              <label htmlFor="remember">
                Manter conectado neste dispositivo
              </label>
            </>
          ) : (
            <>
              <input type="checkbox" id="terms" name="terms" />
              <label htmlFor="terms">
                Concordo com o uso de dados para análise de projetos culturais.
              </label>
            </>
          )}
        </div>

        <button
          type="submit"
          className="ds-btn ds-btn-primary"
          style={{ width: "100%", marginTop: 10 }}
        >
          {isLogin ? "Entrar" : "Criar conta"}
        </button>

        <p
          className="ds-link-muted"
          style={{ marginTop: 10, textAlign: "center" }}
        >
          {isLogin ? (
            <>
              Ainda não tem acesso?{" "}
              <button
                type="button"
                onClick={handleToggle}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#22d3ee",
                }}
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                onClick={handleToggle}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#22d3ee",
                }}
              >
                Voltar para login
              </button>
            </>
          )}
        </p>

        {error && (
          <p className="form-error" style={{ textAlign: "center" }}>
            {error}
          </p>
        )}
      </form>
    </section>
  );
}