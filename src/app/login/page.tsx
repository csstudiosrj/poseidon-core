"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Waves } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsPending(false);

    if (authError) {
      setError("E-mail ou senha incorretos. Verifique seus dados.");
      return;
    }

    router.push("/setup");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #0a1930, #0e2040)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              boxShadow: "0 0 18px rgba(0, 229, 255, 0.18)",
            }}
          >
            <Waves className="h-6 w-6" style={{ color: "var(--color-ds-cyan)" }} />
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--color-ds-text)" }}
            >
              Poseidon
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-ds-text-muted)" }}
            >
              Gestão cultural com compliance IN 29/2026
            </p>
          </div>
        </div>

        {/* Card de login */}
        <div className="ds-card p-6">
          <h2
            className="mb-5 text-base font-semibold"
            style={{ color: "var(--color-ds-text)" }}
          >
            Entrar na plataforma
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="ds-label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ds-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{
                    color: "var(--color-ds-text-muted)",
                    transition: "color var(--ease-interactive)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <div
                className="rounded-xl border px-3 py-2 text-sm"
                style={{
                  color: "var(--color-ds-error)",
                  borderColor: "rgba(255, 77, 106, 0.3)",
                  background: "rgba(255, 77, 106, 0.07)",
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="ds-btn-primary w-full"
              style={{ marginTop: "0.25rem" }}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--color-ds-text-faint)" }}
        >
          Poseidon · Compliance cultural 2026
        </p>
      </div>
    </main>
  );
}