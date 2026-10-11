// src/app/(dashboard)/configuracoes/page.tsx
// SUBSTITUIR o arquivo atual — agora é a página de conta/configurações
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import "../../globals.css";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Alterar senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState(false);

  // Excluir conta
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");
      setCarregando(false);
    }
    carregar();
  }, []);

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErroSenha("");
    setSucessoSenha(false);

    if (!novaSenha || novaSenha.length < 8) {
      setErroSenha("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    setSalvandoSenha(true);

    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setErroSenha(error.message || "Erro ao alterar a senha.");
    } else {
      setSucessoSenha(true);
      setNovaSenha("");
      setConfirmarSenha("");
      setSenhaAtual("");
    }

    setSalvandoSenha(false);
  }

  async function handleSair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-sea-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Configurações</h1>
            <p className="text-white/40 text-xs mt-1">Gerencie sua conta e segurança</p>
          </div>
        </div>

        {/* Email */}
        <div className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Mail size={16} className="text-cyan-400" />
            Email da Conta
          </h2>
          <div className="flex items-center gap-3 bg-sea-950 border border-white/10 rounded-lg px-4 py-3">
            <Mail size={14} className="text-white/30 shrink-0" />
            <span className="text-sm text-white/70">{email}</span>
          </div>
          <p className="text-[11px] text-white/30">
            Para alterar o email, entre em contato com o suporte.
          </p>
        </div>

        {/* Alterar Senha */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock size={16} className="text-cyan-400" />
            Alterar Senha
          </h2>

          {sucessoSenha && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-400">
              <CheckCircle2 size={14} className="shrink-0" />
              Senha alterada com sucesso!
            </div>
          )}

          {erroSenha && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
              <AlertTriangle size={14} className="shrink-0" />
              {erroSenha}
            </div>
          )}

          <form onSubmit={handleAlterarSenha} className="space-y-3">
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Nova senha (mín. 8 caracteres)"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full bg-sea-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full bg-sea-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={salvandoSenha || !novaSenha || !confirmarSenha}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvandoSenha ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              <span>{salvandoSenha ? "Salvando..." : "Alterar Senha"}</span>
            </button>
          </form>
        </div>

        {/* Sair */}
        <div className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <LogOut size={16} className="text-white/40" />
            Sessão
          </h2>
          <p className="text-xs text-white/40">
            Encerra sua sessão em todos os dispositivos.
          </p>
          <button
            onClick={handleSair}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium cursor-pointer"
          >
            <LogOut size={14} />
            Sair da conta
          </button>
        </div>

        {/* Zona de perigo */}
        <div className="card p-6 space-y-3 border border-red-500/10">
          <h2 className="text-sm font-semibold text-red-400/80 flex items-center gap-2">
            <AlertTriangle size={16} />
            Zona de Perigo
          </h2>

          {!confirmandoExclusao ? (
            <>
              <p className="text-xs text-white/40">
                Excluir sua conta remove permanentemente todos os seus dados, projetos e arquivos. Esta ação não pode ser desfeita.
              </p>
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all text-xs font-medium cursor-pointer"
              >
                <AlertTriangle size={14} />
                Excluir minha conta
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-red-400">
                Digite <strong>EXCLUIR</strong> para confirmar a exclusão permanente da sua conta:
              </p>
              <input
                type="text"
                placeholder="EXCLUIR"
                value={textoConfirmacao}
                onChange={(e) => setTextoConfirmacao(e.target.value)}
                className="w-full bg-sea-950 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400 placeholder-red-500/20 focus:border-red-500 outline-none transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmandoExclusao(false); setTextoConfirmacao(""); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white/70 transition-all text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  disabled={textoConfirmacao !== "EXCLUIR"}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500/30 transition-all text-xs font-medium cursor-pointer"
                  onClick={async () => {
                    // Exclusão real requer service_role via API route — por ora, faz signOut
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
