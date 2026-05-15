"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
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

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError("E-mail ou senha incorretos. Verifique seus dados.");
        setIsPending(false);
        return;
      }

      router.push("/setup");
      router.refresh();
    } catch {
      setError("Não foi possível iniciar a autenticação. Verifique a configuração do Supabase client.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="ds-card ds-card-glow flex h-12 w-12 items-center justify-center rounded-2xl">
            <Waves className="h-6 w-6 text-[var(--color-ds-cyan)]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ds-text)]">Poseidon</h1>
            <p className="mt-1 text-sm text-[var(--color-ds-text-muted)]">
              Gestão cultural com compliance IN 29/2026
            </p>
          </div>
        </div>

        <div className="ds-card p-6">
          <h2 className="mb-5 text-base font-semibold text-[var(--color-ds-text)]">Entrar na plataforma</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="ds-label">E-mail</label>
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
              <label htmlFor="password" className="ds-label">Senha</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ds-text-muted)] hover:text-[var(--color-ds-text)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border px-3 py-2 text-sm text-[var(--color-ds-error)]" style={{ borderColor: "rgba(255,77,106,.3)", background: "rgba(255,77,106,.07)" }}>
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={isPending || !email || !password} className="ds-btn-primary w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isPending ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ds-text-faint)]">Poseidon · Compliance cultural 2026</p>
      </div>
    </main>
  );
}