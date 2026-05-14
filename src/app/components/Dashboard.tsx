"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function PoseidonDashboard() {
  const [time, setTime] = useState("");
  const [riskScore, setRiskScore] = useState(0);

  // Relógio e Animação inicial
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    setTimeout(() => setRiskScore(78), 500); // Simula o cálculo de risco
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020b18] text-slate-200 p-4 md:p-8">
      {/* Estilos locais para não precisar mexer no config do Tailwind agora */}
      <style jsx global>{`
        @keyframes gauge-fill {
          from { stroke-dashoffset: 226; }
          to { stroke-dashoffset: ${226 - (riskScore / 100) * 226}; }
        }
        .animate-gauge { animation: gauge-fill 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* HEADER SIMPLIFICADO */}
      <header className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tighter">POSEIDON</h1>
            <p className="text-[10px] text-cyan-500/50 font-mono tracking-[0.2em]">AUDITORIA V1.0</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-slate-500">{time}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Live Engine</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD PRINCIPAL: RISCO */}
        <div className="lg:col-span-1 bg-[#081c35] border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.05)]">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Risco de Glosa</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke={riskScore > 70 ? "#ef4444" : "#22d3ee"} 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="251"
                  strokeDashoffset={251 - (riskScore / 100) * 251}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-mono font-bold text-white">{riskScore}%</span>
              </div>
            </div>
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${riskScore > 70 ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {riskScore > 70 ? 'Crítico' : 'Estável'}
              </span>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Baseado na IN 29/2026. Violação detectada na rubrica Adm.
              </p>
            </div>
          </div>
        </div>

        {/* CARD CAPTAÇÃO */}
        <div className="bg-[#081c35] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Captado</h2>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-mono font-bold text-white">R$ 2.940.000</p>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
            <div className="bg-cyan-500 h-full w-[70%]" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Meta: R$ 4.200.000 (70%)</p>
        </div>

        {/* CARD SALDO */}
        <div className="bg-[#081c35] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saldo em Conta</h2>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-mono font-bold text-white">R$ 1.380.000</p>
          <div className="flex items-center gap-2 mt-6">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Conta Exclusiva Validada</span>
          </div>
        </div>

      </div>

      {/* AVISO DE VIOLAÇÃO */}
      <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 animate-pulse">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <p className="text-xs text-red-200">
          <span className="font-bold">VIOLAÇÃO IDENTIFICADA:</span> A rubrica "Administração" (18.2%) excede o teto de 15% permitido pelo Art. 18 da IN 29/2026.
        </p>
      </div>
    </div>
  );
}