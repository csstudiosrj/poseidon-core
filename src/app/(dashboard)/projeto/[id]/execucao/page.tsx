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
  Upload,
} from "lucide-react";
import {
  getResumoFinanceiro,
  criarNotaFiscalAction,
  listarNotasFiscais,
} from "@/app/actions/notas";
import { listarFornecedoresProjeto, cadastrarFornecedorAction } from "@/app/actions/fornecedores";
import { useActionState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import "../../../../globals.css";

/* ─── TIPOS ─────────────────────────────────────────────────── */
interface Rubrica {
  categoria: string;
  orcado: number;
  executado: number;
  tetoLegal: number;
  glosa: number;
}

interface NotaFiscal {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_emissao: string;
  status: string;
  glosa_motivo?: string;
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

interface EventoAuditoria {
  tipo: "success" | "warning" | "critical" | "info";
  codigo: string;
  mensagem: string;
  timestamp: Date;
}

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
  const percentExecutado = rubrica.orcado > 0 ? (rubrica.executado / rubrica.orcado) * 100 : 0;
  const percentTeto = rubrica.tetoLegal > 0 ? (rubrica.executado / rubrica.tetoLegal) * 100 : 0;
  const status = percentTeto <= 80 ? "ok" : percentTeto <= 95 ? "warn" : "crit";
  const badgeClass = status === "ok" ? "badge badge-ok" : status === "warn" ? "badge badge-warning" : "badge bg-red-500/10 text-red-400 border border-red-500/15";
  const statusLabel = status === "ok" ? "OK" : status === "warn" ? "ATENÇÃO" : "CRÍTICO";

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-white">{rubrica.categoria}</p>
        <span className={`badge text-[9px] ${badgeClass}`}>{statusLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-white/40">Orçado</span><p className="font-mono text-white/80">{rubrica.orcado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
        <div><span className="text-white/40">Executado</span><p className="font-mono text-white/80">{rubrica.executado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
        <div><span className="text-white/40">Saldo</span><p className="font-mono text-emerald-400">{(rubrica.orcado - rubrica.executado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
        <div><span className="text-white/40">Glosa</span><p className="font-mono text-red-400">{rubrica.glosa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
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

  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("--");
  const [modoAuditoria] = useState(true);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [mostrarFormFornecedor, setMostrarFormFornecedor] = useState(false);
  const [cnpjInput, setCnpjInput] = useState("");
  const [valorInput, setValorInput] = useState("");
  const [servicoInput, setServicoInput] = useState("");
  const [enviandoFornecedor, setEnviandoFornecedor] = useState(false);
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [mostrarFormNota, setMostrarFormNota] = useState(false);
  const [notaDescricao, setNotaDescricao] = useState("");
  const [notaCategoria, setNotaCategoria] = useState("cache");
  const [notaValor, setNotaValor] = useState("");
  const [notaArquivoUrl, setNotaArquivoUrl] = useState("");
  const [enviandoNota, setEnviandoNota] = useState(false);
  const [totalCaptado, setTotalCaptado] = useState(0);
  const [totalExecutado, setTotalExecutado] = useState(0);
  const [totalGlosado, setTotalGlosado] = useState(0);

  // Carrega dados reais
  useEffect(() => {
    async function carregarDados() {
      const resumo = await getResumoFinanceiro(projetoId);
      if ("rubricas" in resumo) {
        setRubricas(resumo.rubricas as Rubrica[]);
        setTotalCaptado(resumo.totalCaptado);
        setTotalExecutado(resumo.totalExecutado);
        setTotalGlosado(resumo.totalGlosado);
      }
      const resultadoFornecedores = await listarFornecedoresProjeto(projetoId);
      if ("fornecedores" in resultadoFornecedores) {
        setFornecedores(resultadoFornecedores.fornecedores);
      }
      const resultadoNotas = await listarNotasFiscais(projetoId);
      if ("notas" in resultadoNotas) {
        setNotas(resultadoNotas.notas);
        // Gera eventos do feed baseados nas notas
        const eventosFeed: EventoAuditoria[] = resultadoNotas.notas.map((nota) => ({
          tipo: nota.status === "glosada" ? "critical" : nota.status === "pendente" ? "warning" : "success",
          codigo: `NF-${nota.id.slice(0, 5)}`,
          mensagem: `Nota fiscal: ${nota.descricao} (R$ ${nota.valor.toFixed(2)}) - ${nota.status}` + (nota.glosa_motivo ? ` - ${nota.glosa_motivo}` : ""),
          timestamp: new Date(nota.data_emissao),
        }));
        setEventos(eventosFeed.reverse());
      }
      setUltimaAtualizacao("agora");
    }
    carregarDados();
  }, [projetoId]);

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
      const resultado = await listarFornecedoresProjeto(projetoId);
      if ("fornecedores" in resultado) {
        setFornecedores(resultado.fornecedores);
      }
    }
    setEnviandoFornecedor(false);
  }

  async function handleLancarNota() {
    if (!notaDescricao || !notaValor) return;
    setEnviandoNota(true);

    const formData = new FormData();
    formData.append("projeto_id", projetoId);
    formData.append("descricao", notaDescricao);
    formData.append("categoria", notaCategoria);
    formData.append("valor", notaValor);
    if (notaArquivoUrl) formData.append("arquivo_url", notaArquivoUrl);

    const result = await criarNotaFiscalAction(null, formData);

    if (result?.success) {
      setNotaDescricao("");
      setNotaValor("");
      setNotaArquivoUrl("");
      setMostrarFormNota(false);
      // Recarrega dados
      const resumo = await getResumoFinanceiro(projetoId);
      if ("rubricas" in resumo) {
        setRubricas(resumo.rubricas as Rubrica[]);
        setTotalCaptado(resumo.totalCaptado);
        setTotalExecutado(resumo.totalExecutado);
        setTotalGlosado(resumo.totalGlosado);
      }
      const resultadoNotas = await listarNotasFiscais(projetoId);
      if ("notas" in resultadoNotas) {
        setNotas(resultadoNotas.notas);
      }
    }
    setEnviandoNota(false);
  }

  const saldoConta = totalCaptado - totalExecutado;
  const riscoMedio = rubricas.length > 0
    ? rubricas.reduce((acc, r) => acc + (r.tetoLegal > 0 ? (r.executado / r.tetoLegal) * 100 : 0), 0) / rubricas.length
    : 0;

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
        {/* COLUNA ESQUERDA: RUBRICAS + FORNECEDORES + NOTAS */}
        <div className="space-y-6">
          {/* Rubricas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/80">Rubricas</h2>
              <span className="text-[10px] text-white/30 font-mono">{rubricas.length} itens</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rubricas.map((rubrica, idx) => (
                <RubricaCard key={idx} rubrica={rubrica} />
              ))}
            </div>
          </div>

          {/* Notas Fiscais */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/80">Notas Fiscais</h2>
              <button
                onClick={() => setMostrarFormNota(!mostrarFormNota)}
                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer bg-transparent border-none"
              >
                <Plus size={14} />
                Lançar Nota
              </button>
            </div>

            {mostrarFormNota && (
              <div className="card p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Descrição da despesa"
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  value={notaDescricao}
                  onChange={(e) => setNotaDescricao(e.target.value)}
                />
                <select
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                  value={notaCategoria}
                  onChange={(e) => setNotaCategoria(e.target.value)}
                >
                  <option value="cache" className="bg-sea-950">Cachês Artísticos</option>
                  <option value="infraestrutura" className="bg-sea-950">Infraestrutura</option>
                  <option value="divulgacao" className="bg-sea-950">Divulgação</option>
                  <option value="administracao" className="bg-sea-950">Administração</option>
                  <option value="formacao" className="bg-sea-950">Formação</option>
                  <option value="logistica" className="bg-sea-950">Logística</option>
                  <option value="captacao" className="bg-sea-950">Captação</option>
                </select>
                <input
                  type="text"
                  placeholder="Valor (R$)"
                  className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  value={notaValor}
                  onChange={(e) => setNotaValor(e.target.value)}
                />
                <UploadDropzone<OurFileRouter, "portfolioPhotos">
                  endpoint="portfolioPhotos"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) setNotaArquivoUrl(res[0].url);
                  }}
                  onUploadError={() => {}}
                  className="border border-dashed border-white/10 rounded-lg p-4 text-xs text-white/40 ut-label:text-white/60 ut-button:bg-cyan-500 ut-button:text-sea-950 ut-button:text-xs ut-button:h-8 ut-button:rounded-lg ut-button:cursor-pointer"
                />
                <button
                  onClick={handleLancarNota}
                  disabled={enviandoNota || !notaDescricao || !notaValor}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {enviandoNota ? "Lançando..." : "Lançar Nota Fiscal"}
                </button>
              </div>
            )}

            <div className="space-y-2">
              {notas.length === 0 ? (
                <p className="text-white/30 text-xs">Nenhuma nota fiscal lançada.</p>
              ) : (
                notas.map((nota) => (
                  <div key={nota.id} className="flex items-center justify-between bg-sea-950 border border-white/5 rounded-xl p-3 text-xs">
                    <div>
                      <p className="text-white font-medium">{nota.descricao}</p>
                      <p className="text-white/30 text-[10px]">{nota.categoria} · {new Date(nota.data_emissao).toLocaleDateString("pt-BR")}</p>
                      {nota.glosa_motivo && <p className="text-red-400 text-[10px] mt-0.5">{nota.glosa_motivo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-white/80">R$ {nota.valor.toFixed(2)}</p>
                      <span className={`badge text-[9px] ${nota.status === "validada" ? "badge badge-ok" : nota.status === "glosada" ? "badge bg-red-500/10 text-red-400 border border-red-500/15" : "badge badge-warning"}`}>
                        {nota.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
                <input type="text" placeholder="CNPJ (14 dígitos)" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono" value={cnpjInput} onChange={(e) => setCnpjInput(e.target.value)} />
                <input type="text" placeholder="Valor (R$)" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono" value={valorInput} onChange={(e) => setValorInput(e.target.value)} />
                <input type="text" placeholder="Descrição do serviço" className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" value={servicoInput} onChange={(e) => setServicoInput(e.target.value)} />
                <button onClick={handleCadastrarFornecedor} disabled={enviandoFornecedor || !cnpjInput || !valorInput} className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 rounded-lg transition-all cursor-pointer disabled:opacity-50">{enviandoFornecedor ? "Validando..." : "Validar e Cadastrar"}</button>
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
                      <p className="font-mono text-white/80">{f.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      <span className={`badge text-[9px] ${f.status === "validado" ? "badge badge-ok" : f.status === "bloqueado" ? "badge bg-red-500/10 text-red-400 border border-red-500/15" : "badge badge-warning"}`}>{f.status}</span>
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
              <div className="flex justify-between"><span>Total de rubricas:</span><span className="font-mono text-white/70">{rubricas.length}</span></div>
              <div className="flex justify-between"><span>Glosas acumuladas:</span><span className="font-mono text-red-400">{totalGlosado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
              <div className="flex justify-between"><span>Risco médio:</span><span className="font-mono text-amber-400">{riscoMedio.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Última auditoria:</span><span className="font-mono text-white/40">{ultimaAtualizacao}</span></div>
              <div className="flex justify-between"><span>Fornecedores bloqueados:</span><span className="font-mono text-red-400">{fornecedores.filter((f) => f.status === "bloqueado").length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}