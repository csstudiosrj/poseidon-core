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
  ChevronRight,
  Zap,
} from "lucide-react";
import "../../../../globals.css";

/* ─── TIPOS MOCK ─────────────────────────────────────────────── */
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

/* ─── DADOS MOCK ─────────────────────────────────────────────── */
const rubricasMock: Rubrica[] = [
  {
    nome: "Verba de Marketing",
    categoria: "Desp. Operacionais",
    orcado: 500000,
    executado: 320000,
    tetoLegal: 750000,
    glosa: 12000,
    refLegal: "Art. 23, Lei 12.345",
  },
  {
    nome: "Cachês Artísticos",
    categoria: "Pagamento Artistas",
    orcado: 800000,
    executado: 780000,
    tetoLegal: 1200000,
    glosa: 0,
    refLegal: "Art. 5º, IN 01/2020",
  },
  {
    nome: "Infraestrutura",
    categoria: "Logística",
    orcado: 450000,
    executado: 430000,
    tetoLegal: 600000,
    glosa: 5000,
    refLegal: "Art. 17, §4º",
  },
  {
    nome: "Administração",
    categoria: "Custos Fixos",
    orcado: 150000,
    executado: 148000,
    tetoLegal: 180000,
    glosa: 2000,
    refLegal: "Art. 12, Lei 8.313",
  },
  {
    nome: "Divulgação",
    categoria: "Mídia",
    orcado: 200000,
    executado: 60000,
    tetoLegal: 250000,
    glosa: 0,
    refLegal: "Art. 31, IN 02/2021",
  },
  {
    nome: "Transporte",
    categoria: "Logística",
    orcado: 120000,
    executado: 118000,
    tetoLegal: 150000,
    glosa: 800,
    refLegal: "Art. 9º, Lei 12.345",
  },
  {
    nome: "Captação de Recursos",
    categoria: "Financeiro",
    orcado: 80000,
    executado: 80000,
    tetoLegal: 100000,
    glosa: 0,
    refLegal: "Art. 45, IN 03/2022",
  },
];

const eventosIniciais: EventoAuditoria[] = [
  {
    tipo: "success",
    codigo: "AUD-001",
    mensagem: "Glosa identificada na rubrica Verba de Marketing",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    tipo: "warning",
    codigo: "GL-23",
    mensagem: "Teto legal de Infraestrutura próximo do limite (95%)",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    tipo: "critical",
    codigo: "COMP-12",
    mensagem: "Erro de conformidade na rubrica Administração",
    timestamp: new Date(Date.now() - 600000),
  },
  {
    tipo: "info",
    codigo: "SYS-01",
    mensagem: "Sincronização com SALIC concluída",
    timestamp: new Date(Date.now() - 900000),
  },
];

/* ─── COMPONENTES ────────────────────────────────────────────── */

/** Gauge semicircular de risco */
function Gauge({ percentual }: { percentual: number }) {
  const raio = 40;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (percentual / 100) * circunferencia * 0.75; // 270 graus
  const cor =
    percentual <= 40
      ? "#4ade80"
      : percentual <= 70
      ? "#fbbf24"
      : "#f87171";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 100 100" className="transform -rotate-[135deg]">
        <circle
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${circunferencia - preenchido}`}
          className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute text-sm font-bold font-mono text-white">
        {percentual.toFixed(1)}%
      </span>
    </div>
  );
}

/** Card de KPI */
function KpiCard({
  label,
  valor,
  meta,
  icone: Icon,
  children,
}: {
  label: string;
  valor: string;
  meta: string;
  icone: React.ElementType;
  children?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.16em] font-medium">
            {label}
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {valor}
          </span>
        </div>
        <Icon size={18} className="text-cyan-400/70" />
      </div>
      <div className="text-[10px] text-white/20 font-mono tracking-wide">
        {meta}
      </div>
      {children}
    </div>
  );
}

/** Barra de progresso com cor dinâmica */
function ProgressBar({ percent }: { percent: number }) {
  const cor =
    percent <= 80
      ? "bg-emerald-500"
      : percent <= 95
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="progress-track w-full">
      <div
        className={`progress-bar ${cor}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

/** Linha de rubrica */
function RubricaRow({ rubrica }: { rubrica: Rubrica }) {
  const percentExecutado = (rubrica.executado / rubrica.orcado) * 100;
  const percentTeto = (rubrica.executado / rubrica.tetoLegal) * 100;
  const status =
    percentTeto <= 80 ? "ok" : percentTeto <= 95 ? "warn" : "crit";

  const badgeClass =
    status === "ok"
      ? "badge badge-ok"
      : status === "warn"
      ? "badge badge-warning"
      : "badge bg-red-500/10 text-red-400 border border-red-500/15";

  const statusLabel =
    status === "ok" ? "OK" : status === "warn" ? "ATENÇÃO" : "CRÍTICO";

  return (
    <div className="bg-sea-950 border border-white/5 rounded-xl p-4 grid grid-cols-12 gap-4 items-center text-xs hover:border-white/10 transition-colors">
      {/* Nome + Categoria */}
      <div className="col-span-2 min-w-0">
        <p className="text-white font-medium truncate">{rubrica.nome}</p>
        <p className="text-white/30 text-[10px]">{rubrica.categoria}</p>
      </div>
      {/* Orçado */}
      <div className="col-span-1 font-mono text-white/70 tabular-nums">
        {rubrica.orcado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
      </div>
      {/* Executado */}
      <div className="col-span-1 font-mono text-white/70 tabular-nums">
        {rubrica.executado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
      </div>
      {/* Saldo */}
      <div className="col-span-1 font-mono text-emerald-400 tabular-nums">
        {(rubrica.orcado - rubrica.executado).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
      </div>
      {/* Badge */}
      <div className="col-span-1">
        <span className={`badge text-[9px] ${badgeClass}`}>{statusLabel}</span>
      </div>
      {/* Barra de Progresso */}
      <div className="col-span-2 flex items-center gap-2">
        <ProgressBar percent={percentExecutado} />
        <span className="font-mono text-white/40 text-[10px] w-10 text-right">
          {percentExecutado.toFixed(0)}%
        </span>
      </div>
      {/* % Teto */}
      <div className="col-span-1 font-mono text-white/40 tabular-nums">
        {percentTeto.toFixed(0)}%
      </div>
      {/* Glosa */}
      <div className="col-span-1 font-mono text-red-400 tabular-nums">
        {rubrica.glosa.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
      </div>
      {/* Teto Legal */}
      <div className="col-span-1 font-mono text-white/50 tabular-nums">
        {rubrica.tetoLegal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}
      </div>
      {/* Ref Legal */}
      <div className="col-span-1 text-[10px] text-white/20 truncate">
        {rubrica.refLegal}
      </div>
    </div>
  );
}

/** Feed de Auditoria */
function FeedAuditoria({ eventos }: { eventos: EventoAuditoria[] }) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [eventos]);

  const iconeMap = {
    success: <CheckCircle2 size={14} className="text-emerald-400" />,
    warning: <AlertTriangle size={14} className="text-amber-400" />,
    critical: <XCircle size={14} className="text-red-400" />,
    info: <Info size={14} className="text-cyan-400" />,
  };

  return (
    <div
      ref={feedRef}
      className="h-[360px] overflow-y-auto space-y-0 pr-1 custom-scrollbar"
    >
      {eventos.map((evt, i) => (
        <div
          key={i}
          className="feed-item flex items-start gap-2.5 py-2.5"
        >
          <div className="mt-0.5">{iconeMap[evt.tipo]}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-white/30">
                {evt.codigo}
              </span>
              <span className="text-[10px] text-white/20">
                {evt.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {evt.mensagem}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PÁGINA PRINCIPAL ──────────────────────────────────────── */
export default function ExecucaoPage() {
  const params = useParams();
  const projetoId = params.id as string;

  const [eventos, setEventos] = useState<EventoAuditoria[]>(eventosIniciais);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("10s");
  const [modoAuditoria, setModoAuditoria] = useState(true);

  // Simula feed em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const novosEventos: EventoAuditoria[] = [
        {
          tipo: "info",
          codigo: "SYS-" + Math.floor(Math.random() * 1000),
          mensagem: "Verificação de rotina concluída",
          timestamp: new Date(),
        },
      ];
      if (Math.random() > 0.6) {
        novosEventos.push({
          tipo: "warning",
          codigo: "GL-" + Math.floor(Math.random() * 100),
          mensagem: "Alerta de proximidade do teto em rubrica",
          timestamp: new Date(),
        });
      }
      setEventos((prev) => [...novosEventos, ...prev].slice(0, 20));
      setUltimaAtualizacao(`${Math.floor(Math.random() * 20) + 1}s`);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const totalCaptado = rubricasMock.reduce((acc, r) => acc + r.orcado, 0);
  const saldoConta = totalCaptado - rubricasMock.reduce((acc, r) => acc + r.executado, 0);
  const glosaTotal = rubricasMock.reduce((acc, r) => acc + r.glosa, 0);
  const riscoMedio =
    rubricasMock.reduce((acc, r) => acc + (r.executado / r.tetoLegal) * 100, 0) /
    rubricasMock.length;

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-8 space-y-6">
      {/* TOPBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap size={22} className="text-cyan-400" />
            POSEIDON
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
            Console de Compliance
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-[10px]">
            Auditoria {modoAuditoria ? "Ativa" : "Pausada"}
          </span>
          <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
            <Clock size={12} /> Última atualização: {ultimaAtualizacao}
          </span>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          label="Total Captado"
          valor={totalCaptado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })}
          meta="+8.2% vs mês anterior"
          icone={TrendingUp}
        />
        <KpiCard
          label="Saldo em Conta"
          valor={saldoConta.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })}
          meta="Liquidez disponível"
          icone={Wallet}
        />
        <KpiCard
          label="Risco de Glosa"
          valor={`${riscoMedio.toFixed(1)}%`}
          meta={riscoMedio <= 40 ? "Abaixo do limite" : riscoMedio <= 70 ? "Atenção" : "Crítico"}
          icone={AlertTriangle}
        >
          <div className="mt-3 flex justify-center">
            <Gauge percentual={riscoMedio} />
          </div>
        </KpiCard>
      </div>

      {/* GRID PRINCIPAL: RUBRICAS + FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_360px] gap-6">
        {/* COLUNA ESQUERDA: RUBRICAS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/80">Rubricas</h2>
            <span className="text-[10px] text-white/30 font-mono">
              {rubricasMock.length} itens
            </span>
          </div>
          {/* Cabeçalho das colunas */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] text-white/30 uppercase tracking-wider font-medium">
            <div className="col-span-2">Rubrica</div>
            <div className="col-span-1">Orçado</div>
            <div className="col-span-1">Executado</div>
            <div className="col-span-1">Saldo</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Progresso</div>
            <div className="col-span-1">% Teto</div>
            <div className="col-span-1">Glosa</div>
            <div className="col-span-1">Teto Legal</div>
            <div className="col-span-1">Ref.</div>
          </div>
          <div className="space-y-2">
            {rubricasMock.map((rubrica, idx) => (
              <RubricaRow key={idx} rubrica={rubrica} />
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: FEED + RESUMO */}
        <div className="space-y-5">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
              Feed de Auditoria
            </h3>
            <FeedAuditoria eventos={eventos} />
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
              Resumo Executivo
            </h3>
            <div className="space-y-2 text-xs text-white/50">
              <div className="flex justify-between">
                <span>Total de rubricas:</span>
                <span className="font-mono text-white/70">{rubricasMock.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Glosas acumuladas:</span>
                <span className="font-mono text-red-400">
                  {glosaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risco médio:</span>
                <span className="font-mono text-amber-400">{riscoMedio.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Última auditoria:</span>
                <span className="font-mono text-white/40">{ultimaAtualizacao}</span>
              </div>
              <div className="flex justify-between">
                <span>Teto excedido em:</span>
                <span className="font-mono text-red-400">
                  {rubricasMock.filter((r) => r.executado / r.tetoLegal > 0.95).length} rubricas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}