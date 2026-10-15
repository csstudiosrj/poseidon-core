"use client";
// src/app/(dashboard)/orcamento/[id]/OrcamentoEditor.tsx

import React, { useState, useActionState, useEffect, useTransition } from "react";
import {
  Plus, Pencil, Trash2, X, AlertCircle,
  Wallet, ReceiptText, ArrowUpRight,
} from "lucide-react";
import {
  adicionarFonteAction, editarFonteAction, deletarFonteAction,
  adicionarItemAction,  editarItemAction,  deletarItemAction,
  TIPOS_FONTE, STATUS_FONTE, CATEGORIAS_ITEM,
} from "@/app/actions/orcamento";
import type { ProjetoFonte, ItemOrcamentario } from "@/app/actions/orcamento";

/* ─── utils ─────────────────────────────────────────────────────── */
const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_FONTE_COR: Record<string, { bg: string; text: string; border: string }> = {
  pendente:  { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.20)"  },
  aprovada:  { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.20)"  },
  cancelada: { bg: "rgba(239,68,68,0.08)",   text: "#f87171", border: "rgba(239,68,68,0.20)"   },
};

function StatusFonteBadge({ status }: { status: string | null }) {
  const s = status ?? "pendente";
  const cor = STATUS_FONTE_COR[s] ?? STATUS_FONTE_COR.pendente;
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.10em] px-2 py-0.5 rounded-md shrink-0"
      style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}
    >
      {STATUS_FONTE[s] ?? s}
    </span>
  );
}

/* ─── OrcamentoEditor ────────────────────────────────────────────── */
export function OrcamentoEditor({
  projetoId,
  fontesIniciais,
  itensIniciais,
}: {
  projetoId:      string;
  fontesIniciais: ProjetoFonte[];
  itensIniciais:  ItemOrcamentario[];
}) {
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [editFonte,      setEditFonte]      = useState<ProjetoFonte | null>(null);
  const [showItemModal,  setShowItemModal]  = useState(false);
  const [editItem,       setEditItem]       = useState<ItemOrcamentario | null>(null);

  const [confirmDelFonte, setConfirmDelFonte] = useState<string | null>(null);
  const [confirmDelItem,  setConfirmDelItem]  = useState<string | null>(null);
  const [delError,        setDelError]        = useState<string | null>(null);
  const [isPending,       startTransition]    = useTransition();

  /* totais */
  const totalFontes = fontesIniciais.reduce((a, f) => a + Number(f.valor_captacao), 0);
  const totalItens  = itensIniciais.reduce((a, i) => a + Number(i.valor) * i.quantidade, 0);
  const saldo       = totalFontes - totalItens;

  function handleDelFonte(id: string) {
    setDelError(null);
    startTransition(async () => {
      const res = await deletarFonteAction(id, projetoId);
      if (res.error) setDelError(res.error);
      setConfirmDelFonte(null);
    });
  }

  function handleDelItem(id: string) {
    setDelError(null);
    startTransition(async () => {
      const res = await deletarItemAction(id, projetoId);
      if (res.error) setDelError(res.error);
      setConfirmDelItem(null);
    });
  }

  return (
    <>
      {/* ── Cards de resumo ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          { label: "Total captado",  value: brl(totalFontes), accent: "#22d3ee" },
          { label: "Total orçado",   value: brl(totalItens),  accent: "#a78bfa" },
          { label: "Saldo",          value: brl(saldo),       accent: saldo >= 0 ? "#34d399" : "#f87171" },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl px-4 py-3"
            style={{ background: "#081121", border: "1px solid rgba(142,177,214,0.08)" }}
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 mb-1">{c.label}</p>
            <p className="text-base font-bold num-tabular" style={{ color: c.accent }}>{c.value}</p>
          </div>
        ))}
      </div>

      {delError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span className="text-red-300 text-xs">{delError}</span>
        </div>
      )}

      {/* ── Fontes de recurso ─────────────────────────────────────── */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Wallet size={11} />
            Fontes de recurso
            <span className="ml-1 opacity-60">({fontesIniciais.length})</span>
          </h2>
          <button
            onClick={() => { setEditFonte(null); setShowFonteModal(true); }}
            className="ds-btn ds-btn-primary"
            style={{ fontSize: "12px", padding: "5px 12px" }}
          >
            <Plus size={12} className="inline-block mr-1 -mt-0.5" />
            Fonte
          </button>
        </div>

        {fontesIniciais.length === 0 ? (
          <p className="text-xs text-slate-600 py-4 text-center">Nenhuma fonte de recurso cadastrada.</p>
        ) : (
          <div className="ds-card overflow-hidden" style={{ background: "#081121", padding: 0 }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}>
                  <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium">Tipo / Nome</th>
                  <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium hidden sm:table-cell">Valor captado</th>
                  <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium hidden md:table-cell">Status</th>
                  <th className="w-16 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {fontesIniciais.map((f, idx) => (
                  <tr key={f.id} style={idx < fontesIniciais.length - 1 ? { borderBottom: "1px solid rgba(142,177,214,0.07)" } : undefined}>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 font-medium">{f.tipo}</p>
                      {f.nome_fonte && <p className="text-[10px] text-slate-500 mt-0.5">{f.nome_fonte}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 num-tabular font-medium hidden sm:table-cell">
                      {brl(Number(f.valor_captacao))}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StatusFonteBadge status={f.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {confirmDelFonte === f.id ? (
                          <>
                            <button onClick={() => handleDelFonte(f.id)} disabled={isPending}
                              className="text-[11px] text-red-400 hover:text-red-300 font-medium">
                              {isPending ? "…" : "Confirmar"}
                            </button>
                            <button onClick={() => setConfirmDelFonte(null)} className="text-slate-600 hover:text-slate-400">
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditFonte(f); setShowFonteModal(true); }}
                              className="text-slate-500 hover:text-cyan-400 transition-colors">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => setConfirmDelFonte(f.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Itens orçamentários ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <ReceiptText size={11} />
            Itens orçamentários
            <span className="ml-1 opacity-60">({itensIniciais.length})</span>
          </h2>
          <button
            onClick={() => { setEditItem(null); setShowItemModal(true); }}
            className="ds-btn ds-btn-primary"
            style={{ fontSize: "12px", padding: "5px 12px" }}
          >
            <Plus size={12} className="inline-block mr-1 -mt-0.5" />
            Item
          </button>
        </div>

        {itensIniciais.length === 0 ? (
          <p className="text-xs text-slate-600 py-4 text-center">Nenhum item orçamentário cadastrado.</p>
        ) : (
          <div className="ds-card overflow-hidden" style={{ background: "#081121", padding: 0 }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}>
                  <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium">Descrição</th>
                  <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium hidden md:table-cell">Categoria</th>
                  <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium hidden sm:table-cell">Qtd × Valor</th>
                  <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium">Total</th>
                  <th className="w-16 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {itensIniciais.map((item, idx) => {
                  const fonte = fontesIniciais.find((f) => f.id === item.fonte_id);
                  return (
                    <tr key={item.id} style={idx < itensIniciais.length - 1 ? { borderBottom: "1px solid rgba(142,177,214,0.07)" } : undefined}>
                      <td className="px-4 py-3">
                        <p className="text-slate-200 font-medium truncate max-w-[180px]">{item.descricao}</p>
                        {fonte && (
                          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-0.5">
                            <ArrowUpRight size={9} />
                            {fonte.tipo}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                        {CATEGORIAS_ITEM[item.categoria ?? ""] ?? item.categoria ?? <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 num-tabular hidden sm:table-cell">
                        {item.quantidade} × {brl(Number(item.valor))}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 num-tabular font-medium">
                        {brl(Number(item.valor) * item.quantidade)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {confirmDelItem === item.id ? (
                            <>
                              <button onClick={() => handleDelItem(item.id)} disabled={isPending}
                                className="text-[11px] text-red-400 hover:text-red-300 font-medium">
                                {isPending ? "…" : "Confirmar"}
                              </button>
                              <button onClick={() => setConfirmDelItem(null)} className="text-slate-600 hover:text-slate-400">
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditItem(item); setShowItemModal(true); }}
                                className="text-slate-500 hover:text-cyan-400 transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => setConfirmDelItem(item.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modais */}
      {showFonteModal && (
        <FonteModal
          projetoId={projetoId}
          fonte={editFonte}
          onClose={() => { setShowFonteModal(false); setEditFonte(null); }}
        />
      )}
      {showItemModal && (
        <ItemModal
          projetoId={projetoId}
          item={editItem}
          fontes={fontesIniciais}
          onClose={() => { setShowItemModal(false); setEditItem(null); }}
        />
      )}
    </>
  );
}

/* ─── FonteModal ─────────────────────────────────────────────────── */
function FonteModal({
  projetoId, fonte, onClose,
}: {
  projetoId: string;
  fonte:     ProjetoFonte | null;
  onClose:   () => void;
}) {
  const isEdit = !!fonte;
  const boundAction = isEdit
    ? editarFonteAction.bind(null, fonte!.id, projetoId)
    : adicionarFonteAction.bind(null, projetoId);

  const [state, formAction, pending] = useActionState(boundAction, null);
  const [rawValor, setRawValor] = useState(fonte ? String(fonte.valor_captacao) : "");

  useEffect(() => { if (state?.success) onClose(); }, [state]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(2,11,24,0.85)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ds-card w-full max-w-md" style={{ background: "#081121", padding: "28px" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            {isEdit ? "Editar fonte" : "Nova fonte de recurso"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Tipo */}
          <div className="ds-field">
            <label className="ds-label">Tipo</label>
            <select name="tipo" className="ds-input" defaultValue={fonte?.tipo ?? ""} required>
              <option value="">Selecione…</option>
              {TIPOS_FONTE.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Nome */}
          <div className="ds-field">
            <label className="ds-label">Nome / identificação <span className="text-slate-600">(opcional)</span></label>
            <input name="nome_fonte" type="text" className="ds-input"
              defaultValue={fonte?.nome_fonte ?? ""}
              placeholder="Ex: Lei Rouanet — Patrocinador XYZ" />
          </div>

          {/* Valor */}
          <div className="ds-field">
            <label className="ds-label">Valor captado (R$)</label>
            <input
              name="valor_captacao" type="text" inputMode="decimal" className="ds-input num-tabular"
              value={rawValor}
              onChange={(e) => setRawValor(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="0,00"
              required
            />
          </div>

          {/* Status */}
          <div className="ds-field">
            <label className="ds-label">Status</label>
            <select name="status" className="ds-input" defaultValue={fonte?.status ?? "pendente"}>
              {Object.entries(STATUS_FONTE).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {state?.error && <p className="form-error">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="ds-btn flex-1" style={{ fontSize: "13px" }}>Cancelar</button>
            <button type="submit" disabled={pending} className="ds-btn ds-btn-primary flex-1" style={{ fontSize: "13px" }}>
              {pending ? "Salvando…" : isEdit ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── ItemModal ──────────────────────────────────────────────────── */
function ItemModal({
  projetoId, item, fontes, onClose,
}: {
  projetoId: string;
  item:      ItemOrcamentario | null;
  fontes:    ProjetoFonte[];
  onClose:   () => void;
}) {
  const isEdit = !!item;
  const boundAction = isEdit
    ? editarItemAction.bind(null, item!.id, projetoId)
    : adicionarItemAction.bind(null, projetoId);

  const [state, formAction, pending] = useActionState(boundAction, null);
  const [rawValor, setRawValor] = useState(item ? String(item.valor) : "");

  useEffect(() => { if (state?.success) onClose(); }, [state]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(2,11,24,0.85)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ds-card w-full max-w-md" style={{ background: "#081121", padding: "28px" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            {isEdit ? "Editar item" : "Novo item orçamentário"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Descrição */}
          <div className="ds-field">
            <label className="ds-label">Descrição</label>
            <input name="descricao" type="text" className="ds-input"
              defaultValue={item?.descricao ?? ""} placeholder="Ex: Cachê do artista" required />
          </div>

          {/* Categoria */}
          <div className="ds-field">
            <label className="ds-label">Categoria</label>
            <select name="categoria" className="ds-input" defaultValue={item?.categoria ?? ""}>
              <option value="">Sem categoria</option>
              {Object.entries(CATEGORIAS_ITEM).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Fonte */}
          {fontes.length > 0 && (
            <div className="ds-field">
              <label className="ds-label">Fonte de recurso <span className="text-slate-600">(opcional)</span></label>
              <select name="fonte_id" className="ds-input" defaultValue={item?.fonte_id ?? ""}>
                <option value="">Sem fonte vinculada</option>
                {fontes.map((f) => (
                  <option key={f.id} value={f.id}>{f.tipo}{f.nome_fonte ? ` — ${f.nome_fonte}` : ""}</option>
                ))}
              </select>
            </div>
          )}

          {/* Qtd + Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="ds-field">
              <label className="ds-label">Quantidade</label>
              <input name="quantidade" type="number" min="1" className="ds-input num-tabular"
                defaultValue={item?.quantidade ?? 1} required />
            </div>
            <div className="ds-field">
              <label className="ds-label">Valor unit. (R$)</label>
              <input
                name="valor" type="text" inputMode="decimal" className="ds-input num-tabular"
                value={rawValor}
                onChange={(e) => setRawValor(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {state?.error && <p className="form-error">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="ds-btn flex-1" style={{ fontSize: "13px" }}>Cancelar</button>
            <button type="submit" disabled={pending} className="ds-btn ds-btn-primary flex-1" style={{ fontSize: "13px" }}>
              {pending ? "Salvando…" : isEdit ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
