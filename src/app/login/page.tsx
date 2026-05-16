'use client';

import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Grid de fundo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-[420px] bg-slate-900/80 backdrop-blur-sm border border-white/5 rounded-2xl shadow-2xl p-8">
        {/* Título */}
        <div className="mb-8 text-center">
          <h1 className="font-['Syne'] text-2xl font-semibold tracking-tight text-white">
            POSEIDON
          </h1>
          <p className="text-xs font-['Inter'] uppercase tracking-widest text-slate-400 mt-1">
            Console de Compliance
          </p>
        </div>

        <form className="space-y-5">
          {/* Email / Usuário */}
          <div>
            <label className="block text-xs font-['Inter'] uppercase tracking-wider text-slate-400 mb-1.5">
              Usuário ou E-mail
            </label>
            <input
              type="text"
              placeholder="seu@email.com"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-['Inter'] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-['Inter'] uppercase tracking-wider text-slate-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm font-['Inter'] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Link Esqueci senha */}
          <div className="flex justify-end">
            <Link
              href="#"
              className="text-xs font-['Inter'] text-slate-400 hover:text-slate-300 transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Botão entrar */}
          <button
            type="submit"
            className="w-full bg-cyan-400/90 hover:bg-cyan-400 text-slate-900 font-['Inter'] font-medium rounded-xl py-2.5 px-4 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Entrar
            <ArrowRight size={16} />
          </button>

          {/* Link criar conta */}
          <div className="text-center pt-2">
            <span className="text-xs font-['Inter'] text-slate-500">
              Não tem uma conta?{' '}
            </span>
            <Link
              href="/register"
              className="text-xs font-['Inter'] text-cyan-400/80 hover:text-cyan-400 transition-colors"
            >
              Criar nova conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}