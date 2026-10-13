"use client";
// src/app/(dashboard)/projeto/[id]/TabelaItens.tsx

import React, { useActionState, useEffect, useState } from "react";
import { Pencil, Trash2, X, ReceiptText } from "lucide-react";
import { editarItemAction, deletarItemAction } from "@/app/actions/itens";

const CATEGORIAS = [
  "Cachê artístico",
  "Produção",
  "Infraestrutura",
  "Divulgação e marketing",
  "Administração",
  "Captação",
  "Transporte e logística",
  "Alimentação",
  "Hospedagem",
  "Equipamentos",
  "Figurino e adereços",
  "Cenografia",
  "Audiovisual",
  "Impostos e taxas",
  "Outro",
];

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export interface ItemRow {
  id: string;
  descricao: string;
  valor: number;
  quantidade: number;
  categoria: string | null;
  fonte_id: string | null;
}

interface Fonte {
  id: string;
  tipo: string;
  nome_fonte: string | null;
}

interface Props {
  projetoId: string;
  itens: ItemRow[];
  fontes: Fonte[];
  totalOrcado: number;
}

export function TabelaItens({ projetoId, itens, fontes, totalOrcado }: Props) {
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (itens.length === 0) return <EmptyItens />;

  async function handleDelete(itemId: string) {
    setDeleteError(null);
    const res = await deletarItemAction(projetoId, itemId);
    if (res.error) {
      setDeleteError(res.error);
    } else {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div
        className="ds-card overflow-hidden"
        style={{ background: "#081121", padding: 0 }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Descrição</th>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden sm:table-cell">Categoria</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Qtd</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Valor unit.</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Total</th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {itens.map((item, idx) => {
              const total = Number(item.valor) * item.quantidade;
              const isLast = idx === itens.length - 1;
              const isConfirmingDelete = deletingId === item.id;

              return (
                <tr
                  key={item.id}
                  style={isLast ? undefined : { borderBottom: "1px solid rgba(142,177,214,0.07)" }}
                >
                  <td className="px-4 py-3 text-slate-200 max-w-[180px] truncate">{item.descricao}</td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{item.categoria ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-400 num-tabular">{item.quantidade}</td>
                  <td className="px-4 py-3 text-right text-slate-300 num-tabular">{brl(Number(item.valor))}</td>
                  <td className="px-4 py-3 text-right text-white font-medium num-tabular">{brl(total)}</td>
                  <td className="px-4 py-3">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors whitespace-nowrap"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="text-slate-500 hover:text-cyan-400 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid rgba(142,177,214,0.12)" }}>
              <td colSpan={4} className="px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">
                Total orçado
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-cyan-300 num-tabular">
                {brl(totalOrcado)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {deleteError && (
        <p className="form-error mt-2">{deleteError}</p>
      )}

      {/* Modal de edição */}
      {editingItem && (
        <EditarModal
          projetoId={projetoId}
          item={editingItem}
          fontes={fontes}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}

/* ─── Modal de edição ───────────────────────────────────────────────── */
function EditarModal({
  projetoId,
  item,
  fontes,
  onClose,
}: {
  projetoId: string;
  item: ItemRow;
  fontes: Fonte[];
  onClose: () => void;
}) {
  const [valorDisplay, setValorDisplay] = useState(
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.valor))
  );

  const boundAction = editarItemAction.bind(null, projetoId, item.id);
  const [state, formAction, pending] = useActionState(boundAction, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  function handleValorInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setValorDisplay(""); return; }
    const num = parseInt(raw, 10) / 100;
    setValorDisplay(
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num)
    );
  }

  const valorNum = valorDisplay
    ? parseFloat(valorDisplay.replace(/[R$\s.]/g, "").replace(",", "."))
    : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(2,11,24,0.85)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <dialog
        open
        className="fixed z-50 w-full max-w-md rounded-2xl outline-none"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#0a1628",
          border: "1px solid rgba(34,211,238,0.18)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          padding: 0, margin: 0,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}
        >
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            Editar item
          </h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="px-5 py-5 space-y-4">

          <div className="ds-field">
            <label className="ds-label" htmlFor="edit-descricao">Descrição</label>
            <input
              id="edit-descricao"
              name="descricao"
              type="text"
              className="ds-input"
              defaultValue={item.descricao}
              required
              autoFocus
            />
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="edit-categoria">Categoria</label>
            <select id="edit-categoria" name="categoria" className="ds-input" defaultValue={item.categoria ?? ""}>
              <option value="">Selecione (opcional)</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="ds-field">
              <label className="ds-label" htmlFor="edit-quantidade">Quantidade</label>
              <input
                id="edit-quantidade"
                name="quantidade"
                type="number"
                className="ds-input num-tabular"
                min={1}
                defaultValue={item.quantidade}
                required
              />
            </div>
            <div className="ds-field">
              <label className="ds-label" htmlFor="edit-valor">Valor unitário</label>
              <input
                id="edit-valor"
                type="text"
                inputMode="numeric"
                className="ds-input num-tabular"
                value={valorDisplay}
                onChange={handleValorInput}
                required
              />
              <input type="hidden" name="valor_num" value={valorNum || ""} />
            </div>
          </div>

          {fontes.length > 0 && (
            <div className="ds-field">
              <label className="ds-label" htmlFor="edit-fonte">Vincular à fonte (opcional)</label>
              <select id="edit-fonte" name="fonte_id" className="ds-input" defaultValue={item.fonte_id ?? ""}>
                <option value="">Nenhuma</option>
                {fontes.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome_fonte ?? f.tipo}</option>
                ))}
              </select>
            </div>
          )}

          {state?.error && <p className="form-error">{state.error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="ds-btn" style={{ fontSize: "13px" }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="ds-btn ds-btn-primary"
              style={{ fontSize: "13px" }}
            >
              {pending ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function EmptyItens() {
  return (
    <div
      className="ds-card flex flex-col items-center justify-center text-center py-12"
      style={{ background: "#081121" }}
    >
      <ReceiptText size={28} className="text-slate-600 mb-3" />
      <p className="text-sm font-medium text-slate-300 mb-1">Nenhum item orçamentário ainda</p>
      <p className="text-xs text-slate-500 max-w-xs">
        Adicione os itens de despesa do projeto para acompanhar o orçamento.
      </p>
    </div>
  );
}
