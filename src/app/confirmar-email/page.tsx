// src/app/confirmar-email/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import "../globals.css";

export default function ConfirmarEmailPage() {
  const [status, setStatus] = useState<"verificando" | "confirmado" | "erro">("verificando");
  const [mensagem, setMensagem] = useState("Verificando seu e-mail...");
  const router = useRouter();

  useEffect(() => {
    async function confirmar() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("erro");
        setMensagem("Link de confirmação inválido.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error) {
        setStatus("erro");
        setMensagem(error.message || "Erro ao confirmar e-mail.");
      } else {
        setStatus("confirmado");
        setMensagem("E-mail confirmado com sucesso! Redirecionando para o Hub...");
        setTimeout(() => router.push("/hub"), 2000);
      }
    }
    confirmar();
  }, [router]);

  return (
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md text-center space-y-4">
        {status === "verificando" && (
          <>
            <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto" />
            <p className="text-white/60 text-sm">{mensagem}</p>
          </>
        )}
        {status === "confirmado" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg">E-mail confirmado!</h2>
            <p className="text-white/40 text-xs">{mensagem}</p>
          </>
        )}
        {status === "erro" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg">Erro</h2>
            <p className="text-white/40 text-xs">{mensagem}</p>
            <button onClick={() => router.push("/login")} className="mt-4 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer">
              Voltar para login
            </button>
          </>
        )}
      </div>
    </div>
  );
}