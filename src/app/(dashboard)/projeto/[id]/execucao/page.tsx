// src/app/(dashboard)/projeto/[id]/execucao/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Plus,
  Building2,
} from "lucide-react";
import { listarFornecedoresProjeto, cadastrarFornecedorAction } from "@/app/actions/fornecedores";
import { useActionState } from "react";
import "../../../../globals.css";

/* ─── TIPOS ─────────────────────────────────────────────────── */
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

interface Fornecedor {
  id: string;
  cnpj: string;
  nome: string;
  valor: number;
  servico: string;
  status: string;
  glosa_motivo?: string;
  data_cadastro: string;
}

/* ─── DADOS MOCK DE RUBRICAS (FUTURO: DADOS REAIS) ─────────── */
const rubricasMock: Rubrica[] = [
  { nome: "Verba de Marketing", categoria: "Desp. Operacionais", orcado: 500000, executado: 320000, tetoLegal: 750000, glosa: 12000, refLegal: "Art. 23, Lei 12.345" },
  { nome: "Cachês Artísticos", categoria: "Pagamento Artistas", orcado: 800000, executado: 780000, tetoLegal: 1200000, glosa: 0, refLegal: "Art. 5º, IN 01/2020" },
  { nome: "Infraestrutura", categoria: "Logística", orcado: 450000, executado: 430000, tetoLegal: 600000, glosa: 5000, refLegal: "Art. 17, §4º" },
];

/* ─── COMPONENTES ───────────────────────────────────────────── */

function Gauge({ percentual }: { percentual: number }) {
  const raio = 40;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (percentual / 100) * circunferencia * 0.75;
  const cor = percentual <= 40 ? "#4ade80" : percentual <= 70 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 100 100" className="transform -rotate-[135deg]">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="50" cy="50" r={raio} fill="none" stroke={cor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${preenchido} ${circunferencia - preenchido}`} className="transition-all duration-1000" />
      </svg>
      <span className="absolute text-sm font-bold font-mono text-white">{percentual.toFixed(1)}%</span>
    </div>
  );
}

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
        <div><span className="text-white/40">Orçado</span><p className="font-mono text-white/80">{rubrica.orcado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}</p></div>
        <div><span className="text-white/40">Executado</span><p className="font-mono text-white/80">{rubrica.executado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })}</p></div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Execução</span><span>{percentExecutado.toFixed(0)}%</span></div>
        <div className="progress-track"><div className={`progress-bar ${percentExecutado <= 80 ? "bg-emerald-500" : percentExecutado <= 95 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${Math.min(percentExecutado, 100)}%` }} /></div>
      </div>
    </div>
  );
}

function FeedAuditoria({ eventos }: { eventos: EventoAuditoria[] }) {
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [eventos]);

  const iconeMap = {
    success: <CheckCircle2 size={14} className="text-emerald-400" />,
    warning: <AlertTriangle size={14} className="text-amber-400" />,
    critical: <XCircle size={14} className="text-red-400" />,
    info: <Info size={14} className="text-cyan-400" />,
  };

  return (
    <div ref={feedRef} className="h-[360px] overflow-y-auto space-y-0 pr-1 custom-scrollbar">
      {eventos.map((evt, i) => (
        <div key={i} className="feed-item flex items-start gap-2.5 py-2.5">
          <div className="mt-0.5">{iconeMap[evt.tipo]}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-white/30">{evt.codigo}</span>
              <span className="text-[10px] text-white/20">{evt.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{evt.mensagem}</p>
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

  const [eventos, setEventos] = useState<EventoAuditoria[]>([
    { tipo: "info", codigo: "SYS-01", mensagem: "Sincronização com SALIC concluída", timestamp: new Date(Date.now() - 900000) },
  ]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("10s");
  const [modoAuditoria] = useState(true);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [mostrarFormFornecedor, setMostrarFormFornecedor] = useState(false);
  const [cnpjInput, setCnpjInput] = useState("");
  const [valorInput, setValorInput] = useState("");
  const [servicoInput, setServicoInput] = useState("");
  const [enviandoFornecedor, setEnviandoFornecedor] = useState(false);

  // Carrega fornecedores
  useEffect(() => {
    async function carregar() {
      const resultado = await listarFornecedoresProjeto(projetoId);
      if ("fornecedores" in resultado) {
        setFornecedores(resultado.fornecedores);
      }
    }
    carregar();
  }, [projetoId]);

  // Feed em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const novosEventos: EventoAuditoria[] = [
        { tipo: "info", codigo: "SYS-" + Math.floor(Math.random() * 1000), mensagem: "Verificação de rotina concluída", timestamp: new Date() },
      ];
      if (Math.random() > 0.6) {
        novosEventos.push({ tipo: "warning", codigo: "GL-" + Math.floor(Math.random() * 100), mensagem: "Alerta de proximidade do teto em rubrica", timestamp: new Date() });
      }
      setEventos((prev) => [...novosEventos, ...prev].slice(0, 20));
      setUltimaAtualizacao(`${Math.floor(Math.random() * 20) + 1}s`);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  async function handleCadastrarFornecedor() {
    if (!cnpjInput || !valorInput) return;
    setEnviandoFornecedor(true);

    const formData = new FormData();
    formData.append("cnpj", cnpjInput);
    formData.append("valor", valorInput);
    formData.append("servico_descricao", servicoInput);
    formData.append("projeto_id", projetoId);

    const result = await cadastrarFornecedorAction(null, formData);

    if (result?.success) {
      setEventos((prev) => [
        {
          tipo: result.data.status === "BLOQUEADO" ? "critical" : "success",
          codigo: "FORN-" + Math.floor(Math.random() * 100),
          mensagem: `Fornecedor ${result.data.fornecedor}: ${result.data.mensagem}`,
          timestamp: new Date(),
        },
        ...prev,
      ]);
      setCnpjInput("");
      setValorInput("");
      setServicoInput("");
      setMostrarFormFornecedor(false);
      // Recarrega lista
      const resultado = await listarFornecedoresProjeto(projetoId);
      if ("fornecedores" in resultado) {
        setFornecedores(resultado.fornecedores);
      }
    }
    setEnviandoFornecedor(false);
  }

  const totalCaptado = rubricasMock.reduce((acc, r) => acc + r.orcado, 0);
  const saldoConta = totalCaptado - rubricasMock.reduce((acc, r) => acc + r.executado, 0);
  const glosaTotal = rubricasMock.reduce((acc, r) => acc + r.glosa, 0);
  const riscoMedio = rubricasMock.reduce((acc, r) => acc + (r.executado / r.tetoLegal) * 100, 0) / rubricasMock.length;

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-8 space-y-6">
      {/* TOPBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap size={22} className="text-cyan-400" />
            POSEIDON
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">Console de Compliance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-[10px]">Auditoria {modoAuditoria ? "Ativa" : "Pausada"}</span>
          <span className="text-[10px] text-white/30 font-mono flex items-center gap-1"><Clock size={12} /> Última atualização: {ultimaAtualizacao}</span>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard label="Total Captado" valor={totalCaptado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })} meta="+8.2% vs mês anterior" icone={TrendingUp} />
        <KpiCard label="Saldo em Conta" valor={saldoConta.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })} meta="Liquidez disponível" icone={Wallet} />
        <KpiCard label="Risco de Glosa" valor={`${riscoMedio.toFixed(1)}%`} meta={riscoMedio <= 40 ? "Abaixo do limite" : riscoMedio <= 70 ? "Atenção" : "Crítico"} icone={AlertTriangle}>
          <div className="mt-3 flex justify-center"><Gauge percentual={riscoMedio} /></div>
        </KpiCard>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_360px] gap-6">
        {/* COLUNA ESQUERDA: RUBRICAS + FORNECEDORES */}
        <div className="space-y-6">
          {/* Rubricas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/80">Rubricas</h2>
              <span className="text-[10px] text-white/30 font-mono">{rubricasMock.length} itens</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rubricasMock.map((rubrica, idx) => (
                <RubricaCard key={idx} rubrica={rubrica} />
              ))}
            </div>
          </div>

          {/* Fornecedores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/80">Fornecedores</h2>
              <button
                onClick={() => setMostrarFormFornecedor(!mostrarFormFornecedor)}
                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer bg-transparent border-none"
              >
                <Plus size={14} />
                Cadastrar Fornecedor
              </button>
            </div>

            {mostrarFormFornecedor && (
              <div className="card p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="CNPJ (14 dígitos)"
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Valor (R$)"
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Descrição do serviço"
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  value={servicoInput}
                  onChange={(e) => setServicoInput(e.target.value)}
                />
                <button
                  onClick={handleCadastrarFornecedor}
                  disabled={enviandoFornecedor || !cnpjInput || !valorInput}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {enviandoFornecedor ? "Validando..." : "Validar e Cadastrar"}
                </button>
              </div>
            )}

            <div className="space-y-2">
              {fornecedores.length === 0 ? (
                <p className="text-white/30 text-xs">Nenhum fornecedor cadastrado.</p>
              ) : (
                fornecedores.map((f) => (
                  <div key={f.id} className="flex items-center justify-between bg-sea-950 border border-white/5 rounded-xl p-3 text-xs">
                    <div>
                      <p className="text-white font-medium">{f.nome}</p>
                      <p className="text-white/30 text-[10px]">CNPJ: {f.cnpj} · {f.servico}</p>
                      {f.glosa_motivo && <p className="text-red-400 text-[10px] mt-0.5">{f.glosa_motivo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-white/80">
                        {f.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <span className={`badge text-[9px] ${f.status === "validado" ? "badge badge-ok" : f.status === "bloqueado" ? "badge bg-red-500/10 text-red-400 border border-red-500/15" : "badge badge-warning"}`}>
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FEED + RESUMO */}
        <div className="space-y-5">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Feed de Auditoria</h3>
            <FeedAuditoria eventos={eventos} />
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Resumo Executivo</h3>
            <div className="space-y-2 text-xs text-white/50">
              <div className="flex justify-between"><span>Total de rubricas:</span><span className="font-mono text-white/70">{rubricasMock.length}</span></div>
              <div className="flex justify-between"><span>Glosas acumuladas:</span><span className="font-mono text-red-400">{glosaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
              <div className="flex justify-between"><span>Risco médio:</span><span className="font-mono text-amber-400">{riscoMedio.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Última auditoria:</span><span className="font-mono text-white/40">{ultimaAtualizacao}</span></div>
              <div className="flex justify-between">
                <span>Fornecedores bloqueados:</span>
                <span className="font-mono text-red-400">{fornecedores.filter((f) => f.status === "bloqueado").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}