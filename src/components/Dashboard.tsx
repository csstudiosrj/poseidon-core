"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useActionState,
} from "react";
import {
  DollarSign,
  CreditCard,
  ShieldAlert,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Plus,
  ArrowUpRight,
  Loader2,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ActionStatus = "idle" | "success" | "error" | "compliance_violation";

export interface ActionState {
  status: ActionStatus;
  message?: string;
  field_errors?: Record<string, string[]>;
  violation?: {
    rubrica: string;
    teto_legal: number;
    valor_executado: number;
    percentual_excedido: number;
    referencia_legal: string;
  };
}

type RubricaCategoria =
  | "administracao"
  | "cache_artista_grupo"
  | "cache_artista_individual"
  | "captacao_recursos"
  | "divulgacao_comunicacao"
  | "producao_artistica"
  | "direitos_autorais"
  | "viagens_diarias";

interface Rubrica {
  id: string;
  nome: string;
  categoria: RubricaCategoria;
  limite: number | null; // percentual decimal ex: 0.15
  orcado: number;
  executado: number;
}

type FeedTipo = "ok" | "warn" | "err" | "info";

interface FeedEvent {
  id: string;
  tipo: FeedTipo;
  msg: string;
  ts: Date;
}

interface ComplianceCheck {
  label: string;
  ok: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA  (substituir por props / fetch da vw_compliance_projeto)
// ─────────────────────────────────────────────────────────────────────────────

const ORCAMENTO = 4_200_000;
const CAPTADO   = 2_940_000;
const SALDO     = 1_380_000;

const RUBRICAS_MOCK: Rubrica[] = [
  { id: "adm",   nome: "Administração",          categoria: "administracao",          limite: 0.15, orcado: 480_000,  executado: 580_000  },
  { id: "cache", nome: "Cachê Artístico",         categoria: "cache_artista_grupo",    limite: null, orcado: 1_200_000, executado: 860_000 },
  { id: "capt",  nome: "Captação de Recursos",    categoria: "captacao_recursos",      limite: 0.10, orcado: 390_000,  executado: 412_000  },
  { id: "div",   nome: "Divulg. + Acessib.",       categoria: "divulgacao_comunicacao", limite: 0.20, orcado: 720_000,  executado: 590_000  },
  { id: "prod",  nome: "Produção Artística",       categoria: "producao_artistica",     limite: null, orcado: 980_000,  executado: 410_000  },
  { id: "dir",   nome: "Direitos Autorais",        categoria: "direitos_autorais",      limite: 0.10, orcado: 300_000,  executado: 198_000  },
  { id: "viag",  nome: "Viagens e Diárias",        categoria: "viagens_diarias",        limite: null, orcado: 130_000,  executado: 88_000   },
];

const FEED_INITIAL: FeedEvent[] = [
  { id: "f1", tipo: "ok",   msg: "NF-e 003421 validada — Fornecedor: Som & Luz Eventos LTDA",                           ts: minsAgo(8) },
  { id: "f2", tipo: "ok",   msg: "Pagamento PIX confirmado — R$ 48.000 → CC Artistas Unidos",                           ts: minsAgo(7) },
  { id: "f3", tipo: "warn", msg: "CNPJ 18.432.910/0001-22 atingiu 18,4% de concentração no projeto",                   ts: minsAgo(5) },
  { id: "f4", tipo: "ok",   msg: "Contrato de cachê assinado — Grupo Teatral Horizonte (R$ 120k)",                     ts: minsAgo(4) },
  { id: "f5", tipo: "err",  msg: "ALERTA: Adm. ultrapassou teto de 15% — glosa automática ativada",                    ts: minsAgo(2) },
  { id: "f6", tipo: "ok",   msg: "Rubrica 'Produção Artística' dentro dos limites orçados",                             ts: minsAgo(1) },
  { id: "f7", tipo: "info", msg: "IA analisou 14 notas fiscais — 13 aprovadas, 1 em diligência",                       ts: minsAgo(0) },
];

const EXTRA_EVENTS: Omit<FeedEvent, "id" | "ts">[] = [
  { tipo: "ok",   msg: "Extrato bancário sincronizado — saldo confirmado: R$ 1.380.000" },
  { tipo: "warn", msg: "Fornecedor XYZ Produções: 3ª nota do mesmo CNPJ neste mês" },
  { tipo: "info", msg: "IA validou RPA nº 00891 — Músico Rodrigo Mendes (R$ 4.800)" },
  { tipo: "ok",   msg: "Direitos Autorais: 47,1% do teto — situação confortável" },
  { tipo: "warn", msg: "Data de vencimento do contrato de locação se aproxima (15 dias)" },
  { tipo: "ok",   msg: "NF-e 004102 processada — Gráfica Sul Ltda — R$ 28.500" },
  { tipo: "err",  msg: "Captação de Recursos: teto de 10% excedido em R$ 22.000" },
  { tipo: "info", msg: "Relatório de execução do mês gerado automaticamente" },
];

const COMPLIANCE_CHECKS_MOCK: ComplianceCheck[] = [
  { label: "Adm ≤ 15%",                ok: false },
  { label: "Captação ≤ 10% / R$150k",  ok: false },
  { label: "Divulg + Acessib ≤ 20%",   ok: true  },
  { label: "Dir. Autorais ≤ 10%",       ok: true  },
  { label: "Pagamentos rastreáveis",    ok: true  },
  { label: "Fornecedor único ≤ 20%",   ok: false  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function minsAgo(n: number): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d;
}

function fmtBRL(v: number): string {
  return "R$ " + Math.round(v).toLocaleString("pt-BR");
}

function fmtPct(v: number): string {
  return v.toFixed(1) + "%";
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function calcRiskScore(rubricas: Rubrica[], orcamento: number): number {
  let score = 0;
  rubricas.forEach((r) => {
    if (!r.limite) return;
    const teto = r.limite * orcamento;
    const pct  = r.executado / teto;
    if (pct > 1)       score += 35;
    else if (pct > 0.8) score += 15;
    else if (pct > 0.6) score += 5;
  });
  return Math.min(score, 100);
}

function getRubricaStatus(pct: number, overLimit: boolean): "ok" | "warning" | "danger" {
  if (overLimit || pct >= 100) return "danger";
  if (pct >= 80) return "warning";
  return "ok";
}

let _eventCounter = 0;
function nextEventId(): string {
  return `ev_${Date.now()}_${_eventCounter++}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Poseidon Logo SVG ────────────────────────────────────────────────────────
function PoseidonLogo() {
  return (
    <svg
      aria-label="Poseidon"
      viewBox="0 0 32 32"
      width="26"
      height="26"
      fill="none"
    >
      <path
        d="M16 3L16 29M10 10L16 3L22 10M8 18L16 29L24 18"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="16" cy="16" r="13"
        stroke="rgba(34,211,238,0.2)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "ok" | "warning" | "danger" | "neutral";
function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const styles: Record<BadgeVariant, string> = {
    ok:      "bg-green-500/10  text-green-400  border border-green-500/25",
    warning: "bg-amber-500/10  text-amber-400  border border-amber-500/25",
    danger:  "bg-red-500/10    text-red-400    border border-red-500/25",
    neutral: "bg-white/5       text-white/50   border border-white/10",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ── Gauge SVG ────────────────────────────────────────────────────────────────
function GaugeArc({ score }: { score: number }) {
  const r           = 36;
  const circ        = 2 * Math.PI * r;
  const arcLength   = circ * (226 / 360); // 226° arc
  const fillLength  = arcLength * (score / 100);
  const offset      = arcLength - fillLength;
  const color = score < 40 ? "#22c55e" : score < 70 ? "#f59e0b" : "#ef4444";

  return (
    <svg
      viewBox="0 0 100 100"
      width="90"
      height="90"
      style={{ marginTop: "-30px" }}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
        strokeDasharray={`${arcLength} ${circ}`}
        strokeDashoffset={-((circ - arcLength) / 2)}
        transform="rotate(-210 50 50)"
      />
      {/* Fill */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${fillLength} ${circ}`}
        strokeDashoffset={0}
        transform="rotate(-210 50 50)"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1), stroke 0.4s ease" }}
      />
    </svg>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, status }: { pct: number; status: "ok" | "warning" | "danger" }) {
  const colors = { ok: "#22d3ee", warning: "#f59e0b", danger: "#ef4444" };
  const color  = colors[status];
  const w      = Math.min(pct, 100);
  return (
    <div className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
      <div
        className="h-full rounded-full relative"
        style={{
          width: `${w}%`,
          background: color,
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span
          className="absolute right-0 top-0 bottom-0 w-4 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.25))` }}
        />
      </div>
    </div>
  );
}

// ── Feed Icon ────────────────────────────────────────────────────────────────
function FeedIcon({ tipo }: { tipo: FeedTipo }) {
  const map: Record<FeedTipo, { icon: React.ReactNode; color: string }> = {
    ok:   { icon: <CheckCircle2  size={13} />, color: "text-green-400" },
    warn: { icon: <AlertTriangle size={13} />, color: "text-amber-400"  },
    err:  { icon: <XCircle       size={13} />, color: "text-red-400"    },
    info: { icon: <Info          size={13} />, color: "text-cyan-400"   },
  };
  const { icon, color } = map[tipo];
  return <span className={`${color} flex-shrink-0 mt-0.5`}>{icon}</span>;
}

// ── Nova Despesa Modal ────────────────────────────────────────────────────────
interface NovaDespesaModalProps {
  open: boolean;
  onClose: () => void;
  state: ActionState;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  rubricas: Rubrica[];
}

function NovaDespesaModal({
  open, onClose, state, formAction, isPending, rubricas,
}: NovaDespesaModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal(); else el.close();
  }, [open]);

  // Fecha modal em backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  if (!open && !dialogRef.current?.open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto w-full max-w-md rounded-xl p-0 bg-[#081c35] border border-cyan-500/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop:bg-black/60 open:animate-[fade-slide_0.2s_ease_both]"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Nova Despesa</h2>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <form action={formAction} className="px-6 py-5 flex flex-col gap-4">
        {/* Feedback de ação */}
        {state.status === "compliance_violation" && state.violation && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
            <p className="text-xs font-semibold text-red-400 mb-1">
              Violação de Compliance — {state.violation.referencia_legal}
            </p>
            <p className="text-xs text-white/40">
              {state.violation.rubrica}: excedeu {fmtPct(state.violation.percentual_excedido)} do teto.
              Executado {fmtBRL(state.violation.valor_executado)} de máx.{" "}
              {fmtBRL(state.violation.teto_legal)}.
            </p>
          </div>
        )}
        {state.status === "error" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <p className="text-xs text-amber-400">{state.message ?? "Erro ao processar despesa."}</p>
          </div>
        )}
        {state.status === "success" && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3">
            <p className="text-xs text-green-400 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Despesa registrada com sucesso.
            </p>
          </div>
        )}

        {/* Rubrica */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rubrica_id" className="text-xs text-white/40 font-medium">
            Rubrica *
          </label>
          <select
            id="rubrica_id"
            name="rubrica_id"
            required
            className="w-full rounded-lg bg-[#040f20] border border-white/10 text-sm text-white/80 px-3 py-2.5 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          >
            <option value="">Selecione a rubrica</option>
            {rubricas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
                {r.limite ? ` (teto: ${(r.limite * 100).toFixed(0)}%)` : ""}
              </option>
            ))}
          </select>
          {state.field_errors?.rubrica_id && (
            <p className="text-xs text-red-400">{state.field_errors.rubrica_id[0]}</p>
          )}
        </div>

        {/* Descrição */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="descricao" className="text-xs text-white/40 font-medium">
            Descrição *
          </label>
          <input
            id="descricao"
            name="descricao"
            type="text"
            required
            placeholder="Ex: NF-e 00421 — Som & Luz Eventos"
            className="w-full rounded-lg bg-[#040f20] border border-white/10 text-sm text-white/80 px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          />
          {state.field_errors?.descricao && (
            <p className="text-xs text-red-400">{state.field_errors.descricao[0]}</p>
          )}
        </div>

        {/* Valor + CNPJ lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="valor" className="text-xs text-white/40 font-medium">
              Valor (R$) *
            </label>
            <input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              className="w-full rounded-lg bg-[#040f20] border border-white/10 text-sm text-white/80 px-3 py-2.5 placeholder:text-white/20 font-mono focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors tabular-nums"
            />
            {state.field_errors?.valor && (
              <p className="text-xs text-red-400">{state.field_errors.valor[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cnpj_fornecedor" className="text-xs text-white/40 font-medium">
              CNPJ Fornecedor *
            </label>
            <input
              id="cnpj_fornecedor"
              name="cnpj_fornecedor"
              type="text"
              required
              placeholder="00.000.000/0001-00"
              maxLength={18}
              className="w-full rounded-lg bg-[#040f20] border border-white/10 text-sm text-white/80 px-3 py-2.5 placeholder:text-white/20 font-mono focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
            {state.field_errors?.cnpj_fornecedor && (
              <p className="text-xs text-red-400">{state.field_errors.cnpj_fornecedor[0]}</p>
            )}
          </div>
        </div>

        {/* Forma de pagamento */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium">Forma de Pagamento *</label>
          <div className="flex gap-3">
            {(["PIX", "TED", "DOC"] as const).map((forma) => (
              <label
                key={forma}
                className="flex items-center gap-1.5 text-sm text-white/60 cursor-pointer"
              >
                <input
                  type="radio"
                  name="forma_pagamento"
                  value={forma}
                  defaultChecked={forma === "PIX"}
                  className="accent-cyan-400"
                />
                {forma}
              </label>
            ))}
          </div>
          {state.field_errors?.forma_pagamento && (
            <p className="text-xs text-red-400">{state.field_errors.forma_pagamento[0]}</p>
          )}
        </div>

        {/* Data */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="data_pagamento" className="text-xs text-white/40 font-medium">
            Data do Pagamento *
          </label>
          <input
            id="data_pagamento"
            name="data_pagamento"
            type="date"
            required
            className="w-full rounded-lg bg-[#040f20] border border-white/10 text-sm text-white/80 px-3 py-2.5 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 text-sm text-white/50 py-2.5 hover:bg-white/[0.03] hover:text-white/70 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#020b18] text-sm font-semibold py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Validando…</>
            ) : (
              <><Plus size={14} /> Registrar</>
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dashboard de Controle de Rubricas — Poseidon
 *
 * Integração com Server Action:
 * import { processarNovaDespesa } from "@/app/actions/processarNovaDespesa";
 * Passe via prop `action` ou use diretamente como default abaixo.
 *
 * Props opcionais (para substituir mock data por dados reais):
 *   rubricas, captado, saldo, orcamento, feedInicial
 */

interface DashboardProps {
  /** Server Action compatível com ActionState */
  action?: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  rubricas?: Rubrica[];
  captado?: number;
  saldo?: number;
  orcamento?: number;
  feedInicial?: FeedEvent[];
  nomeProponente?: string;
  numeroSALIC?: string;
}

// Placeholder para quando a action não é injetada via prop
async function _noopAction(_prev: ActionState, _fd: FormData): Promise<ActionState> {
  return { status: "idle" };
}

const INITIAL_STATE: ActionState = { status: "idle" };

export default function Dashboard({
  action           = _noopAction,
  rubricas         = RUBRICAS_MOCK,
  captado          = CAPTADO,
  saldo            = SALDO,
  orcamento        = ORCAMENTO,
  feedInicial      = FEED_INITIAL,
  nomeProponente   = "Festival Marés Vivas 2026",
  numeroSALIC      = "01400.082741/2026-71",
}: DashboardProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [clock, setClock]             = useState<string>("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [feedEvents, setFeedEvents]   = useState<FeedEvent[]>(feedInicial);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const extraIdxRef                   = useRef(0);

  // ── Server Action ──────────────────────────────────────────────────────────
  const [formState, formAction, isPending] = useActionState(action, INITIAL_STATE);

  // ── Computed ───────────────────────────────────────────────────────────────
  const riskScore     = calcRiskScore(rubricas, orcamento);
  const captadoPct    = (captado / orcamento) * 100;
  const hasHighRisk   = riskScore >= 70;

  const gaugeBadge: BadgeVariant =
    riskScore < 40 ? "ok" : riskScore < 70 ? "warning" : "danger";
  const gaugeLabel =
    riskScore < 40 ? "Baixo" : riskScore < 70 ? "Médio" : "Alto";
  const gaugeDesc =
    riskScore < 40 ? "Projeto em conformidade"
    : riskScore < 70 ? "Monitoramento necessário"
    : "Intervenção imediata";

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("pt-BR"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-feed a cada 9s
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.45) injectFeedEvent();
    }, 9000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Injeta evento de auditoria no feed quando a action retorna compliance_violation
  useEffect(() => {
    if (formState.status === "compliance_violation" && formState.violation) {
      const ev: FeedEvent = {
        id:   nextEventId(),
        tipo: "err",
        msg:  `Glosa automática: ${formState.violation.rubrica} excedeu teto em ${fmtPct(formState.violation.percentual_excedido)} — ${formState.violation.referencia_legal}`,
        ts:   new Date(),
      };
      setFeedEvents((prev) => [ev, ...prev]);
    }
    if (formState.status === "success") {
      setModalOpen(false);
      const ev: FeedEvent = {
        id:   nextEventId(),
        tipo: "ok",
        msg:  formState.message ?? "Nova despesa registrada com sucesso.",
        ts:   new Date(),
      };
      setFeedEvents((prev) => [ev, ...prev]);
    }
  }, [formState]);

  const injectFeedEvent = useCallback(() => {
    const base = EXTRA_EVENTS[extraIdxRef.current % EXTRA_EVENTS.length];
    extraIdxRef.current++;
    const ev: FeedEvent = { ...base, id: nextEventId(), ts: new Date() };
    setFeedEvents((prev) => [ev, ...prev.slice(0, 49)]);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen text-slate-200"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#020b18",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-white/5 flex-shrink-0"
        style={{ background: "rgba(2,11,24,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <PoseidonLogo />
            <span className="font-semibold text-sm tracking-tight text-white">Poseidon</span>
            <span className="hidden sm:inline text-white/20 text-xs">|</span>
            <span className="hidden sm:inline text-white/40 text-xs">Auditoria Cultural</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-xs text-white/40 font-mono">Sistema ativo</span>
            </div>
            {clock && (
              <span className="text-xs text-white/30 font-mono hidden md:block tabular-nums">
                {clock}
              </span>
            )}
            <button
              aria-label="Filtrar período"
              className="flex items-center gap-1.5 text-xs text-cyan-400/80 border border-cyan-400/20 rounded-md px-2.5 py-1.5 hover:bg-cyan-400/5 transition-colors"
            >
              <Calendar size={12} />
              Mai 2026
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE ───────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* Project strip */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-[15px] font-semibold text-white">{nomeProponente}</h1>
            <p className="text-xs text-white/40 mt-0.5 font-mono">
              SALIC {numeroSALIC} · Teatro Musical · {fmtBRL(orcamento)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">Em Captação</Badge>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-cyan-400 border border-cyan-400/25 rounded-lg px-3 py-1.5 hover:bg-cyan-400/5 transition-colors"
            >
              <Plus size={12} />
              Nova Despesa
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_316px] gap-5">

          {/* ── COLUNA ESQUERDA ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* ── KPI CARDS ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Total Captado */}
              <div className="rounded-xl bg-[#081c35] border border-cyan-500/10 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Total Captado</p>
                    <p className="text-[22px] font-bold text-white tabular-nums mt-1">
                      {fmtBRL(captado)}
                    </p>
                  </div>
                  <DollarSign size={17} className="text-cyan-400/50 flex-shrink-0 mt-0.5" />
                </div>
                <ProgressBar pct={captadoPct} status="ok" />
                <div className="flex justify-between mt-1.5 text-xs text-white/30 tabular-nums">
                  <span>{fmtPct(captadoPct)}</span>
                  <span>Meta: {fmtBRL(orcamento)}</span>
                </div>
              </div>

              {/* Saldo em Conta */}
              <div className="rounded-xl bg-[#081c35] border border-cyan-500/10 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Saldo em Conta</p>
                    <p className="text-[22px] font-bold text-white tabular-nums mt-1">
                      {fmtBRL(saldo)}
                    </p>
                  </div>
                  <CreditCard size={17} className="text-cyan-400/50 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 size={11} className="text-green-400" />
                  <span className="text-xs text-green-400/70">Conta exclusiva validada</span>
                </div>
                <p className="text-xs text-white/20 font-mono mt-1">
                  AG 0001 · CC 12345-6 · Banco do Brasil
                </p>
              </div>

              {/* Risco de Glosa — Gauge */}
              <div
                className="rounded-xl bg-[#081c35] border border-cyan-500/15 p-5"
                style={{ boxShadow: "0 0 0 1px rgba(34,211,238,0.08), 0 4px 24px rgba(0,0,0,0.4), 0 0 40px rgba(34,211,238,0.05)" }}
              >
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium mb-2">
                  Risco de Glosa
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 w-[90px] h-[60px] overflow-hidden">
                    <GaugeArc score={riskScore} />
                    <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                      <span className="text-lg font-bold text-white tabular-nums">{riskScore}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Badge variant={gaugeBadge}>{gaugeLabel}</Badge>
                    <p className="text-xs text-white/30 leading-relaxed">{gaugeDesc}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 text-xs text-white/25">
                  {[
                    { color: "bg-green-500",  label: "0–40%" },
                    { color: "bg-amber-400",  label: "40–70%" },
                    { color: "bg-red-500",    label: "70–100%" },
                  ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

            </div>{/* /KPI CARDS */}

            {/* ── ALERTA BANNER ────────────────────────────────────────────── */}
            {hasHighRisk && !alertDismissed && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/[0.05] px-5 py-4 flex items-start gap-3">
                <ShieldAlert size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-400">Teto de Administração ultrapassado</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Rubrica excede 15% do orçamento. Glosa automática ativada.
                    Referência: IN MinC nº 29/2026, Art. 18.
                  </p>
                </div>
                <button
                  aria-label="Fechar alerta"
                  onClick={() => setAlertDismissed(true)}
                  className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ── TABELA DE RUBRICAS ────────────────────────────────────────── */}
            <div className="rounded-xl bg-[#081c35] border border-cyan-500/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">Rubricas do Projeto</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/25">IN 29/2026</span>
                  <button
                    aria-label="Atualizar rubricas"
                    className="text-xs text-cyan-400/50 flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  >
                    <RefreshCw size={11} />
                    Atualizar
                  </button>
                </div>
              </div>

              {/* Header row */}
              <div
                className="hidden md:grid px-5 py-2.5 text-[10px] text-white/25 uppercase tracking-widest font-medium border-b border-white/5"
                style={{ gridTemplateColumns: "1fr 108px 108px 130px 80px" }}
              >
                <span>Rubrica</span>
                <span className="text-right">Orçado</span>
                <span className="text-right">Executado</span>
                <span className="text-center">Utilização</span>
                <span className="text-center">Status</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/[0.04]">
                {rubricas.map((r) => {
                  const teto     = r.limite ? r.limite * orcamento : r.orcado;
                  const rawPct   = (r.executado / teto) * 100;
                  const over     = !!r.limite && r.executado > teto;
                  const status   = getRubricaStatus(rawPct, over);
                  const valueColor = { ok: "#22d3ee", warning: "#f59e0b", danger: "#ef4444" }[status];

                  return (
                    <div
                      key={r.id}
                      className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Desktop grid */}
                      <div
                        className="hidden md:grid items-center gap-x-2"
                        style={{ gridTemplateColumns: "1fr 108px 108px 130px 80px" }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-white/90 font-medium truncate">{r.nome}</p>
                          <p className="text-[11px] text-white/25 mt-0.5">
                            {r.limite
                              ? `Teto: ${(r.limite * 100).toFixed(0)}% · ${fmtBRL(teto)}`
                              : "Sem teto percentual"}
                          </p>
                        </div>
                        <p className="text-right text-sm tabular-nums text-white/45">{fmtBRL(r.orcado)}</p>
                        <p className="text-right text-sm tabular-nums font-medium" style={{ color: valueColor }}>
                          {fmtBRL(r.executado)}
                        </p>
                        <div className="px-2">
                          <ProgressBar pct={rawPct} status={status} />
                          <div className="flex justify-between mt-1">
                            <span className="text-[11px] tabular-nums" style={{ color: valueColor }}>
                              {fmtPct(rawPct)}
                            </span>
                            {over && (
                              <span className="text-[11px] text-red-400/70 tabular-nums">
                                +{fmtBRL(r.executado - teto)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <Badge variant={status}>
                            {status === "ok" ? "OK" : status === "warning" ? "Atenção" : "Estourado"}
                          </Badge>
                        </div>
                      </div>

                      {/* Mobile stack */}
                      <div className="md:hidden flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white/90 font-medium">{r.nome}</p>
                          <Badge variant={status}>
                            {status === "ok" ? "OK" : status === "warning" ? "Atenção" : "Estourado"}
                          </Badge>
                        </div>
                        <ProgressBar pct={rawPct} status={status} />
                        <div className="flex justify-between text-xs tabular-nums">
                          <span style={{ color: valueColor }}>{fmtPct(rawPct)} utilizado</span>
                          <span className="text-white/30">{fmtBRL(r.executado)} / {fmtBRL(teto)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>{/* /COLUNA ESQUERDA */}

          {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-5">

            {/* Feed de Auditoria */}
            <div
              className="rounded-xl bg-[#081c35] border border-cyan-500/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col"
              style={{ maxHeight: "480px" }}
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-cyan-400 animate-pulse" />
                  <h2 className="text-sm font-semibold text-white">Feed de Auditoria</h2>
                </div>
                <span className="text-xs text-white/25 font-mono tabular-nums">
                  {feedEvents.length} eventos
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
                {feedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <FeedIcon tipo={ev.tipo} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-white/70 leading-relaxed">{ev.msg}</p>
                      <p className="text-[11px] text-white/20 font-mono mt-0.5">{fmtTime(ev.ts)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
                <button
                  type="button"
                  onClick={injectFeedEvent}
                  className="w-full text-xs text-cyan-400/50 hover:text-cyan-400 border border-cyan-400/10 hover:border-cyan-400/25 rounded-lg py-2 transition-all"
                >
                  + Simular evento
                </button>
              </div>
            </div>

            {/* Compliance IN 29/2026 */}
            <div className="rounded-xl bg-[#081c35] border border-cyan-500/10 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <h3 className="text-[11px] text-white/40 uppercase tracking-widest font-medium mb-3">
                Compliance IN 29/2026
              </h3>
              <div className="flex flex-col gap-2.5">
                {COMPLIANCE_CHECKS_MOCK.map((c) => (
                  <div key={c.label} className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-white/50">{c.label}</span>
                    <span className={`flex items-center gap-1 text-[12px] font-medium ${c.ok ? "text-green-400" : "text-red-400"}`}>
                      {c.ok
                        ? <><CheckCircle2 size={12} />OK</>
                        : <><XCircle      size={12} />Violado</>
                      }
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  <Plus size={12} />
                  Registrar despesa
                  <ChevronRight size={11} className="ml-auto" />
                </button>
              </div>
            </div>

          </aside>{/* /SIDEBAR */}

        </div>{/* /MAIN GRID */}
      </div>{/* /PAGE */}

      {/* ── MODAL NOVA DESPESA ─────────────────────────────────────────────── */}
      <NovaDespesaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        state={formState}
        formAction={formAction}
        isPending={isPending}
        rubricas={rubricas}
      />

    </div>
  );
}