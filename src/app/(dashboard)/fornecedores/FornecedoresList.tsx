"use client";
// src/app/(dashboard)/fornecedores/FornecedoresList.tsx

import React, { useState, useActionState, useEffect, useTransition } from "react";
import {
  Plus, Pencil, Trash2, AlertCircle, CheckCircle2, X, Users,
} from "lucide-react";
import {
  adicionarFornecedorAction,
  editarFornecedorAction,
  deletarFornecedorAction,
  CATEGORIAS_FORNECEDOR,
} from "@/app/actions/fornecedores";
import type { Fornecedor } from "@/app/actions/fornecedores";

/* ─── masks ──────────────────────────────────────────────────────── */
function maskDoc(value: string, tipo: string): string {
  const d = value.replace(/\D/g, "");
  if (tipo === "PF")
    return d.slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
  return d.slice(0,14).replace(/(\d{2})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1/$2").replace(/(\d{4})(\d{1,2})$/,"$1-$2");
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0,11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/,"($1) $2-$3")
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/,"($1) $2-$3");
}

function docDisplay(cpf_cnpj: string, tipo: string): string {
  return maskDoc(cpf_cnpj, tipo);
}

/* ─── FornecedoresList ───────────────────────────────────────────── */
export function FornecedoresList({ fornecedores: initial }: { fornecedores: Fornecedor[] }) {
  const [showModal, setShowModal]       = useState(false);
  const [editando, setEditando]         = useState<Fornecedor | null>(null);
  const [confirmDel, setConfirmDel]     = useState<string | null>(null);
  const [delError, setDelError]         = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  function openAdd() { setEditando(null); setShowModal(true); }
  function openEdit(f: Fornecedor) { setEditando(f); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditando(null); }

  function handleDelete(id: string) {
    setDelError(null);
    startTransition(async () => {
      const res = await deletarFornecedorAction(id);
      if (res.error) { setDelError(res.error); }
      setConfirmDel(null);
    });
  }

  return (
    <>
      {/* Cabeçalho da seção */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {initial.length} fornecedor{initial.length !== 1 ? "es" : ""}
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

      {/* Lista */}
      {initial.length === 0 ? (
        <div className="ds-card flex flex-col items-center justify-center text-center py-14"
          style={{ background: "#081121" }}>
          <Users size={28} className="text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-300 mb-1">Nenhum fornecedor ainda</p>
          <p className="text-xs text-slate-500 mb-4">Cadastre fornecedores para vincular aos seus projetos.</p>
          <button onClick={openAdd} className="ds-btn ds-btn-primary text-xs">
            Cadastrar fornecedor
          </button>
        </div>
      ) : (
        <div className="ds-card overflow-hidden" style={{ background: "#081121", padding: 0 }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden sm:table-cell">Documento</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden md:table-cell">Categoria</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {initial.map((f, idx) => (
                <tr key={f.id} style={idx < initial.length - 1 ? { borderBottom: "1px solid rgba(142,177,214,0.07)" } : undefined}>
                  <td className="px-4 py-3">
                    <p className="text-slate-200 font-medium truncate max-w-[160px]">{f.nome}</p>
                    <span className="text-[10px] text-slate-500">{f.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 num-tabular hidden sm:table-cell">
                    {docDisplay(f.cpf_cnpj, f.tipo)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {f.categoria ?? <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {confirmDel === f.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(f.id)}
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
                          <button onClick={() => openEdit(f)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setConfirmDel(f.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
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

      {/* Modal */}
      {showModal && (
        <FornecedorModal fornecedor={editando} onClose={closeModal} />
      )}
    </>
  );
}

/* ─── FornecedorModal ────────────────────────────────────────────── */
function FornecedorModal({
  fornecedor,
  onClose,
}: {
  fornecedor: Fornecedor | null;
  onClose: () => void;
}) {
  const isEdit = !!fornecedor;
  const boundAction = isEdit
    ? editarFornecedorAction.bind(null, fornecedor!.id)
    : adicionarFornecedorAction;

  const [state, formAction, pending] = useActionState(boundAction, null);
  const [tipo, setTipo]   = useState<"PF" | "PJ">(fornecedor?.tipo ?? "PF");
  const [doc, setDoc]     = useState(maskDoc(fornecedor?.cpf_cnpj ?? "", fornecedor?.tipo ?? "PF"));
  const [tel, setTel]     = useState(maskPhone(fornecedor?.telefone ?? ""));

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
        style={{ background: "#081121", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            {isEdit ? "Editar fornecedor" : "Novo fornecedor"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="tipo"     value={tipo} />
          <input type="hidden" name="cpf_cnpj" value={doc.replace(/\D/g, "")} />

          {/* Tipo */}
          <div>
            <p className="ds-label mb-2">Tipo</p>
            <div className="flex gap-2">
              {(["PF","PJ"] as const).map((t) => (
                <button
                  key={t} type="button"
                  onClick={() => { setTipo(t); setDoc(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background:   tipo === t ? "rgba(34,211,238,0.08)" : "rgba(8,17,33,0.6)",
                    borderColor:  tipo === t ? "rgba(34,211,238,0.30)" : "rgba(142,177,214,0.12)",
                    color:        tipo === t ? "#22d3ee" : "#64748b",
                  }}
                >
                  {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div className="ds-field">
            <label className="ds-label">Nome / Razão social</label>
            <input name="nome" type="text" className="ds-input" defaultValue={fornecedor?.nome ?? ""} required />
          </div>

          {/* Documento */}
          <div className="ds-field">
            <label className="ds-label">{tipo === "PF" ? "CPF" : "CNPJ"}</label>
            <input
              type="text" inputMode="numeric" className="ds-input num-tabular"
              value={doc} onChange={(e) => setDoc(maskDoc(e.target.value, tipo))}
              placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
              required
            />
          </div>

          {/* Categoria */}
          <div className="ds-field">
            <label className="ds-label">Categoria</label>
            <select name="categoria" className="ds-input" defaultValue={fornecedor?.categoria ?? ""}>
              <option value="">Selecione…</option>
              {CATEGORIAS_FORNECEDOR.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Email + Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="ds-field">
              <label className="ds-label">E-mail</label>
              <input name="email" type="email" className="ds-input" defaultValue={fornecedor?.email ?? ""} placeholder="email@exemplo.com" />
            </div>
            <div className="ds-field">
              <label className="ds-label">Telefone / WhatsApp</label>
              <input
                name="telefone" type="text" inputMode="numeric" className="ds-input num-tabular"
                value={tel} onChange={(e) => setTel(maskPhone(e.target.value))}
                placeholder="(21) 99999-9999"
              />
            </div>
          </div>

          {state?.error && <p className="form-error">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="ds-btn flex-1" style={{ fontSize: "13px" }}>
              Cancelar
            </button>
            <button type="submit" disabled={pending} className="ds-btn ds-btn-primary flex-1" style={{ fontSize: "13px" }}>
              {pending ? "Salvando…" : isEdit ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
