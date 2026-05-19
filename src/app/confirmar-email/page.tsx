"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MailCheck, XCircle } from "lucide-react";

function ConfirmarEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function confirmar() {
      const supabase = createClient();

      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      try {
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "signup" | "recovery" | "email_change" | "magiclink" | "email",
          });
          if (error) throw error;
        } else {
          throw new Error("Link inválido ou expirado. Nenhum código de confirmação encontrado na URL.");
        }

        setStatus("success");
        await supabase.auth.signOut();
        setTimeout(() => router.push("/login?confirmed=true"), 2500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro desconhecido ao confirmar e-mail.";
        setStatus("error");
        setErrorMessage(message);
        console.error("[confirmar-email]", message);
      }
    }

    confirmar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {status === "loading" && (
          <div className="card p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Loader2 size={28} className="text-cyan-400 animate-spin" />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Confirmando seu e-mail…
            </h1>
            <p className="text-xs text-white/40">
              Aguarde enquanto validamos seu acesso.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="card p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MailCheck size={28} className="text-emerald-400" />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              E-mail confirmado!
            </h1>
            <p className="text-xs text-white/40 leading-relaxed">
              Seu cadastro foi ativado com sucesso.
              <br />
              Redirecionando para o login…
            </p>
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden mt-2">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ animation: "grow 2.5s ease-in-out forwards" }}
              />
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="card p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle size={28} className="text-red-400" />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Falha na confirmação
            </h1>
            <p className="text-xs text-white/40 leading-relaxed max-w-xs">
              {errorMessage || "Link inválido ou expirado."}
            </p>
            <p className="text-[11px] text-white/30 leading-relaxed max-w-xs">
              Tente fazer login normalmente — se o e-mail já estiver confirmado
              no banco, o acesso funcionará. Caso contrário, crie uma nova conta.
            </p>
            <a
              href="/login"
              className="mt-2 inline-flex items-center justify-center w-full h-10 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)]"
            >
              Ir para o login
            </a>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sea-950 flex items-center justify-center">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      }
    >
      <ConfirmarEmailContent />
    </Suspense>
  );
}
