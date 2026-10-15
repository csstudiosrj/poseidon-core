"use client";
// src/app/(dashboard)/projetos/ProjetosList.tsx

import React, { useState, useActionState, useEffect, useTransition } from "react";
import { Plus, Pencil, Trash2, AlertCircle, X, FolderOpen, ChevronRight } from "lucide-react";
import {
  criarProjetoAction,
  editarProjetoAction,
  deletarProjetoAction,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/app/actions/projetos";
import type { Projeto, ProjetoStatus } from "@/app/actions/projetos";

/* ─── status visual ─────────────────────────────────────────────── */
const STATUS_COR: Record<ProjetoStatus, { bg: string; text: string; border: string }> = {
  rascunho:         { bg: "rgba(100,116,139,0.12)", text: "#94a3b8",  border: "rgba(100,116,139,0.20)" },
  enviado:          { bg: "rgba(34,211,238,0.08)",  text: "#22d3ee",  border: "rgba(34,211,238,0.20)" },
  ativo:            { bg: "rgba(52,211,153,0.08)",  text: "#34d399",  border: "rgba(52,211,153,0.20)" },
  inativo:          { bg: "rgba(71,85,105,0.12)",   text: "#64748b",  border: "rgba(71,85,105,0.20)" },
  finalizado:       { bg: "rgba(167,139,250,0.08)", text: "#a78bfa",  border: "rgba(167,139,250,0.20)" },
  prestacao_contas: { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24",  border: "rgba(251,191,36,0.20)" },
};

function StatusBadge({ status }: { status: ProjetoStatus }) {
  const cor = STATUS_COR[status];
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.10em] px-2 py-0.5 rounded-md shrink-0"
      style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── ProjetosList ───────────────────────────────────────────────── */
export function ProjetosList({ projetos: initial }: { projetos: Projeto[] }) {
  const [showModal, setShowModal]   = useState(false);
  const [editando, setEditando]     = useState<Projeto | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delError, setDelError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAdd()  { setEditando(null); setShowModal(true); }
  function openEdit(p: Projeto) { setEditando(p); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditando(null); }

  function handleDelete(id: string) {
    setDelError(null);
    startTransition(async () => {
      const res = await deletarProjetoAction(id);
      if (res.error) setDelError(res.error);
      setConfirmDel(null);
    });
  }

  return (
    <>
      {/* Cabeçalho da seção */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {initial.length} projeto{initial.length !== 1 ? "s" : ""}
        </h2>
        <button onClick={openAdd} className="ds-btn ds-btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
          <Plus size={13} className="inline-block mr-1 -mt-0.5" />
          Novo
        </button>
      </div>

      {delError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-3"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span className="text-red-300 text-xs">{delError}</span>
        </div>
      )}

      {/* Lista vazia */}
      {initial.length === 0 ? (
        <div className="ds-card flex flex-col items-center justify-center text-center py-14"
          style={{ background: "#081121" }}>
          <FolderOpen size={28} className="text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-300 mb-1">Nenhum projeto ainda</p>
          <p className="text-xs text-slate-500 mb-4">Crie seu primeiro projeto para começar.</p>
          <button onClick={openAdd} className="ds-btn ds-btn-primary text-xs">
            Criar projeto
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {initial.map((p) => (
            <div
              key={p.id}
              className="rounded-xl px-4 py-3.5 flex items-center gap-3"
              style={{ background: "#081121", border: "1px solid rgba(142,177,214,0.08)" }}
            >
              {/* Status */}
              <StatusBadge status={p.status} />

              {/* Nome + data */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{p.nome_projeto}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Atualizado {formatDate(p.updated_at)}
                </p>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 shrink-0">
                {confirmDel === p.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={isPending}
                      className="text-[11px] text-red-400 hover:text-red-300 font-medium"
                    >
                      {isPending ? "…" : "Confirmar"}
                    </button>
                    <button onClick={() => setConfirmDel(null)} className="text-slate-600 hover:text-slate-400">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openEdit(p)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirmDel(p.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjetoModal projeto={editando} onClose={closeModal} />
      )}
    </>
  );
}

/* ─── ProjetoModal ───────────────────────────────────────────────── */
function ProjetoModal({
  projeto,
  onClose,
}: {
  projeto: Projeto | null;
  onClose: () => void;
}) {
  const isEdit = !!projeto;
  const boundAction = isEdit
    ? editarProjetoAction.bind(null, projeto!.id)
    : criarProjetoAction;

  const [state, formAction, pending] = useActionState(boundAction, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(2,11,24,0.85)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="ds-card w-full max-w-md"
        style={{ background: "#081121", padding: "28px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            {isEdit ? "Editar projeto" : "Novo projeto"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Nome */}
          <div className="ds-field">
            <label className="ds-label">Nome do projeto</label>
            <input
              name="nome_projeto"
              type="text"
              className="ds-input"
              defaultValue={projeto?.nome_projeto ?? ""}
              placeholder="Ex: Show de Jazz no Parque"
              required
            />
          </div>

          {/* Status — só no modo edição */}
          {isEdit && (
            <div className="ds-field">
              <label className="ds-label">Status</label>
              <select name="status" className="ds-input" defaultValue={projeto?.status}>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          )}

          {state?.error && <p className="form-error">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="ds-btn flex-1" style={{ fontSize: "13px" }}>
              Cancelar
            </button>
            <button type="submit" disabled={pending} className="ds-btn ds-btn-primary flex-1" style={{ fontSize: "13px" }}>
              {pending ? "Salvando…" : isEdit ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
