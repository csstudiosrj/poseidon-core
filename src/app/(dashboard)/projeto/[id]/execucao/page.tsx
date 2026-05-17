// src/app/(dashboard)/projeto/[id]/execucao/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Zap,
} from "lucide-react";
import "../../../../globals.css";

/* tipos mantidos... */
interface Rubrica {
  nome: string;
  categoria: string;
  orcado: number;
  executado: number;
  tetoLegal: number;
  glosa: number;
  refLegal: string;
}

interface EventoAuditoria {
  tipo: "success" | "warning" | "critical" | "info";
  codigo: string;
  mensagem: string;
  timestamp: Date;
}

const rubricasMock: Rubrica[] = [ /* ... dados mantidos ... */ ];
const eventosIniciais: EventoAuditoria[] = [ /* ... dados mantidos ... */ ];

function Gauge({ percentual }: { percentual: number }) { /* ... igual ... */ }

function KpiCard({ label, valor, meta, icone: Icon, children }: { label: string; valor: string; meta: string; icone: React.ElementType; children?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.16em] font-medium">{label}</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{valor}</span>
        </div>
        <Icon size={18} className="text-cyan-400/70" />
      </div>
      <div className="text-[10px] text-white/20 font-mono tracking-wide">{meta}</div>
      {children}
    </div>
  );
}

function RubricaCard({ rubrica }: { rubrica: Rubrica }) {
  const percentExecutado = (rubrica.executado / rubrica.orcado) * 100;
  const percentTeto = (rubrica.executado / rubrica.tetoLegal) * 100;
  const status = percentTeto <= 80 ? "ok" : percentTeto <= 95 ? "warn" : "crit";
  const badgeClass = status === "ok" ? "badge badge-ok" : status === "warn" ? "badge badge-warning" : "badge bg-red-500/10 text-red-400 border border-red-500/15";
  const statusLabel = status === "ok" ? "OK" : status === "warn" ? "ATENÇÃO" : "CRÍTICO";

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white">{rubrica.nome}</p>
          <p className="text-[11px] text-white/40">{rubrica.categoria}</p>
        </div>
        <span className={`badge text-[9px] ${badgeClass}`}>{statusLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-white/40">Orçado</span>
          <p className="font-mono text-white/80">
            {rubrica.orcado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-white/40">Executado</span>
          <p className="font-mono text-white/80">
            {rubrica.executado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-white/40">Saldo</span>
          <p className="font-mono text-emerald-400">
            {(rubrica.orcado - rubrica.executado).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-white/40">Glosa</span>
          <p className="font-mono text-red-400">
            {rubrica.glosa.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-white/40 mb-1">
          <span>Execução</span>
          <span>{percentExecutado.toFixed(0)}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-bar ${percentExecutado <= 80 ? "bg-emerald-500" : percentExecutado <= 95 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(percentExecutado, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-white/30">
        <span>Teto: {rubrica.tetoLegal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })} ({percentTeto.toFixed(0)}%)</span>
        <span>{rubrica.refLegal}</span>
      </div>
    </div>
  );
}

function FeedAuditoria({ eventos }: { eventos: EventoAuditoria[] }) { /* ... igual ... */ }

export default function ExecucaoPage() {
  /* estados e efeitos mantidos... */

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-8 space-y-6">
      {/* Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap size={22} className="text-cyan-400" />
            POSEIDON
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">Console de Compliance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-[10px]">Auditoria Ativa</span>
          <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
            <Clock size={12} /> Última atualização: {ultimaAtualizacao}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard label="Total Captado" valor={totalCaptado.toLocaleString(...)} meta="+8.2% vs mês anterior" icone={TrendingUp} />
        <KpiCard label="Saldo em Conta" valor={saldoConta.toLocaleString(...)} meta="Liquidez disponível" icone={Wallet} />
        <KpiCard label="Risco de Glosa" valor={`${riscoMedio.toFixed(1)}%`} meta={riscoMedio <= 40 ? "Abaixo do limite" : riscoMedio <= 70 ? "Atenção" : "Crítico"} icone={AlertTriangle}>
          <div className="mt-3 flex justify-center"><Gauge percentual={riscoMedio} /></div>
        </KpiCard>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_360px] gap-6">
        {/* Rubricas como grid de 2 colunas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Rubricas</h2>
            <span className="text-[10px] text-white/30 font-mono">{rubricasMock.length} itens</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rubricasMock.map((rubrica, idx) => (
              <RubricaCard key={idx} rubrica={rubrica} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Feed de Auditoria</h3>
            <FeedAuditoria eventos={eventos} />
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Resumo Executivo</h3>
            <div className="space-y-2 text-xs text-white/50">
              {/* ... linhas do resumo ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}