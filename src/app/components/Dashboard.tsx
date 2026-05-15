"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  DollarSign,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { ActionState } from "@/app/actions/processarNovaDespesa";
import type { DashboardData } from "@/app/actions/getDashboardData";

type Props = {
  initialData: DashboardData;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const INITIAL_STATE: ActionState = { status: "idle" };

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PCT = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function PoseidonDashboard({ initialData, action }: Props) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [clock, setClock] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR")), 1000);
    return () => clearInterval(t);
  }, []);

  // Fecha modal e optimistic-update ao sucesso
  useEffect(() => {
    if (state.status === "success") {
      setIsModalOpen(false);
    }
  }, [state.status]);

  const riscoTone = useMemo(() => {
    if (data.riscoPercentual >= 90) return "critical";
    if (data.riscoPercentual >= 60) return "warning";
    return "ok";
  }, [data.riscoPercentual]);

  const riskColor = riscoTone === "critical" ? "#ef4444" : riscoTone === "warning" ? "#f59e0b" : "#22d3ee";

  const fieldError = (key: keyof NonNullable<ActionState["field_errors"]>) =>
    state.field_errors?.[key]?.[0];

  const inputClass = (key: keyof NonNullable<ActionState["field_errors"]>) =>
    `w-full rounded-xl border ${fieldError(key) ? "border-red-500" : "border-white/10"} bg-[#061628] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400`;

  return (
    <div className="min-h-screen bg-[#020b18] text-slate-200 p-4 md:p-8">
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between border-b border-white/5 pb-6 mb-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tighter">POSEIDON</h1>
            <p className="text-[10px] text-cyan-500/50 font-mono tracking-[0.2em]">AUDITORIA v1.0.0</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-slate-500">{clock}</p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Live Engine</span>
          </div>
        </div>
      </header>

      {/* ── PROJETO LABEL ── */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-widest">Projeto ativo</p>
        <h2 className="text-lg font-semibold text-white mt-1">{data.nomeP}</h2>
        <span className="inline-flex items-center gap-1.5 mt-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-cyan-400">
          {data.status.replace("_", " ")}
        </span>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* Risco */}
        <div className="bg-[#081c35] border border-cyan-500/20 rounded-2xl p-5 shadow-[0_0_40px_rgba(34,211,238,0.05)]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Risco de Glosa</p>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke={riskColor}
                  strokeWidth="10" fill="none"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (data.riscoPercentual / 100) * 251}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-mono font-bold text-white">{PCT.format(data.riscoPercentual)}%</span>
              </div>
            </div>
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                riscoTone === "critical" ? "bg-red-500/20 text-red-400" : riscoTone === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/20 text-cyan-400"
              }`}>
                {data.riscoLabel}
              </span>
              <p className="text-xs text-slate-400 mt-2">IN MinC nº 29/2026</p>
            </div>
          </div>
        </div>

        {/* Orçamento */}
        <div className="bg-[#081c35] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Orçamento Aprovado</p>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">{BRL.format(data.orcamentoTotalAprovado)}</p>
        </div>

        {/* Captado */}
        <div className="bg-[#081c35] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Captado</p>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">{BRL.format(data.valorCaptado)}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(data.orcamentoTotalAprovado > 0 ? (data.valorCaptado / data.orcamentoTotalAprovado) * 100 : 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-[#081c35] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Saldo em Conta</p>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">{BRL.format(data.saldoConta)}</p>
          <p className="mt-2 text-xs text-slate-500">Executado: {BRL.format(data.valorExecutado)}</p>
        </div>
      </div>

      {/* ── TETOS CALCULADOS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Teto Administração (15%)", valor: data.tetoAdministracao },
          { label: "Teto Captação (10% / máx R$150k)", valor: data.tetoCaptacao },
          { label: "Teto Divulg.+Acess. (20%)", valor: data.tetoDivulgacao },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl border border-white/5 bg-[#081c35] px-5 py-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{t.label}</p>
            <p className="mt-2 text-lg font-mono font-bold text-cyan-300">{BRL.format(t.valor)}</p>
          </div>
        ))}
      </div>

      {/* ── RUBRICAS + ALERTAS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
        {/* Rubricas */}
        <section className="bg-[#081c35] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Rubricas monitoradas</h3>
              <p className="text-xs text-slate-500 mt-1">{data.rubricas.length} rubrica(s) ativas</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Nova Despesa
            </button>
          </div>

          <div className="space-y-4">
            {data.rubricas.map((r) => (
              <article key={r.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{r.descricao}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{r.referenciaLegal}</p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase ${
                    r.status === "critical" ? "bg-red-500/20 text-red-400" : r.status === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {r.status === "critical" ? "Crítico" : r.status === "warning" ? "Atenção" : "OK"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>{PCT.format(r.percentualTeto)}% do teto usado</span>
                    <span>{BRL.format(r.valor_executado)} / {BRL.format(r.tetoLegal)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full transition-all duration-700 ${
                        r.status === "critical" ? "bg-red-500" : r.status === "warning" ? "bg-amber-500" : "bg-cyan-500"
                      }`}
                      style={{ width: `${Math.min(r.percentualTeto, 100)}%` }}
                    />
                  </div>
                </div>

                {r.excede_teto && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-red-400">
                    <ShieldAlert className="w-3.5 h-3.5" /> Teto legal excedido — {r.referenciaLegal}
                  </p>
                )}
              </article>
            ))}

            {data.rubricas.length === 0 && (
              <p className="text-sm text-slate-500 py-8 text-center">Nenhuma rubrica encontrada para este projeto.</p>
            )}
          </div>
        </section>

        {/* Alertas de compliance */}
        <aside className="space-y-4">
          <section className="bg-[#081c35] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Alertas de Compliance
              </h3>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {data.alertas.map((alerta) => (
                <div key={alerta.id} className={`rounded-xl border p-3 ${
                  alerta.nivel === "bloqueante" ? "border-red-500/30 bg-red-500/5" :
                  alerta.nivel === "critico" ? "border-orange-500/30 bg-orange-500/5" :
                  alerta.nivel === "aviso" ? "border-amber-500/30 bg-amber-500/5" :
                  "border-white/5 bg-white/[0.02]"
                }`}>
                  <div className="flex items-start gap-2">
                    {alerta.nivel === "bloqueante" || alerta.nivel === "critico" ? (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    ) : alerta.nivel === "aviso" ? (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    ) : (
                      <Bell className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white">{alerta.codigo}</p>
                      <p className="text-xs text-slate-400 mt-1">{alerta.mensagem}</p>
                      {alerta.referencia_legal && (
                        <p className="text-[10px] text-slate-500 mt-1">{alerta.referencia_legal}</p>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1 font-mono">
                        {new Date(alerta.criado_em).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {data.alertas.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
                  <p className="text-sm font-medium text-emerald-400">Sem alertas ativos</p>
                  <p className="text-xs text-slate-500 mt-1">Projeto em conformidade com a IN 29/2026</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* ── MODAL NOVA DESPESA ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/20 bg-[#081c35] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Nova Despesa</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Lançamento com validação automática dos tetos da IN MinC nº 29/2026.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rubrica */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Rubrica <span className="text-red-400">*</span>
                </label>
                <select name="rubrica_id" className={inputClass("rubrica_id")} defaultValue="">
                  <option value="" disabled>Selecione…</option>
                  {data.rubricas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.descricao} — {PCT.format(r.percentualTeto)}% do teto
                    </option>
                  ))}
                </select>
                {fieldError("rubrica_id") && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldError("rubrica_id")}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <input name="descricao" className={inputClass("descricao")} placeholder="Ex.: Assessoria de comunicação" />
                {fieldError("descricao") && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldError("descricao")}</p>
                )}
              </div>

              {/* Beneficiário nome */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Nome do beneficiário <span className="text-red-400">*</span>
                </label>
                <input name="beneficiario_nome" className={inputClass("beneficiario_nome")} placeholder="Nome completo ou razão social" />
                {fieldError("beneficiario_nome") && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldError("beneficiario_nome")}</p>
                )}
              </div>

              {/* Beneficiário CPF/CNPJ */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">CPF / CNPJ do beneficiário</label>
                <input name="beneficiario_cpf_cnpj" className={inputClass("beneficiario_cpf_cnpj")} placeholder="000.000.000-00 ou 00.000.000/0001-00" />
              </div>

              {/* Valor bruto */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Valor bruto (R$) <span className="text-red-400">*</span>
                </label>
                <input name="valor_bruto" type="number" step="0.01" min="0.01" className={inputClass("valor_bruto")} placeholder="0.00" />
                {fieldError("valor_bruto") && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldError("valor_bruto")}</p>
                )}
              </div>

              {/* Retenções */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Retenções (R$)</label>
                <input name="valor_retencoes" type="number" step="0.01" min="0" defaultValue="0" className={inputClass("valor_retencoes")} />
                {fieldError("valor_retencoes") && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldError("valor_retencoes")}</p>
                )}
              </div>

              {/* Forma de pagamento */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Forma de pagamento <span className="text-red-400">*</span>
                </label>
                <select name="forma_pagamento" defaultValue="pix" className={inputClass("forma_pagamento")}>
                  <option value="pix">PIX</option>
                  <option value="ted">TED</option>
                  <option value="doc">DOC</option>
                  <option value="cheque_nominativo">Cheque Nominativo</option>
                </select>
                {fieldError("forma_pagamento") && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldError("forma_pagamento")}</p>
                )}
              </div>

              {/* Data de pagamento */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Data de pagamento</label>
                <input name="data_pagamento" type="date" className={inputClass("data_pagamento")} />
              </div>

              {/* Comprovante */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Comprovante (hash PIX / nº TED)</label>
                <input name="comprovante_transacao" className={inputClass("comprovante_transacao")} placeholder="ID ou hash da transação" />
              </div>

              {/* Mensagem de retorno */}
              {state.message && (
                <div className={`md:col-span-2 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                  state.status === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
                  state.status === "compliance_violation" ? "border-red-500/30 bg-red-500/10 text-red-300" :
                  "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}>
                  {state.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p>{state.message}</p>
                    {state.violation && (
                      <ul className="mt-2 space-y-0.5 text-xs opacity-80">
                        <li>Executado atual: {BRL.format(state.violation.valor_executado_atual)}</li>
                        <li>Teto legal: {BRL.format(state.violation.teto_legal)}</li>
                        <li>Referência: {state.violation.referencia_legal}</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-[#020b18] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Registrar despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}