// src/app/recuperar-senha/page.tsx
"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import "../globals.css";

export default function RecuperarSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    if (password !== confirmPassword) {
      setErro("As senhas não coincidem.");
      setEnviando(false);
      return;
    }

    if (password.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      setEnviando(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErro(error.message);
    } else {
      setSucesso(true);
      setTimeout(() => router.push("/hub"), 2000);
    }
    setEnviando(false);
  }

  return (
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans flex items-center justify-center p-4">
      <div className="card p-6 md:p-8 w-full max-w-md space-y-4">
        {sucesso ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg">Senha atualizada!</h2>
            <p className="text-white/40 text-xs">Redirecionando para o Hub...</p>
          </div>
        ) : (
          <>
            <h1 className="text-base font-bold text-white tracking-tight">Criar nova senha</h1>
            <p className="text-xs text-white/40">Digite sua nova senha para acessar o Poseidon.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Nova senha</label>
                <input type="password" id="password" name="password" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Mínimo 6 caracteres" required disabled={enviando} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Confirmar senha</label>
                <input type="password" id="confirm-password" name="confirm-password" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50" placeholder="Repita a senha" required disabled={enviando} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={enviando}>
                {enviando && <Loader2 size={14} className="animate-spin" />}
                <span>{enviando ? "Salvando…" : "Salvar nova senha"}</span>
              </button>

              {erro && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[11px] text-red-400 flex items-center justify-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  <span>{erro}</span>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}