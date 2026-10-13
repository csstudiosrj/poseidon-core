"use client";
// src/app/(dashboard)/projeto/[id]/NovoItemModal.tsx

import React, { useActionState, useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { adicionarItemAction } from "@/app/actions/itens";

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

interface Fonte {
  id: string;
  tipo: string;
  nome_fonte: string | null;
}

interface Props {
  projetoId: string;
  fontes: Fonte[];
}

export function NovoItemModal({ projetoId, fontes }: Props) {
  const [open, setOpen] = useState(false);
  const [valorDisplay, setValorDisplay] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const boundAction = adicionarItemAction.bind(null, projetoId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  // Fecha ao ter sucesso
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setValorDisplay("");
    }
  }, [state]);

  // Foca o dialog ao abrir
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  // Máscara BRL no input de valor
  function handleValorInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setValorDisplay(""); return; }
    const num = parseInt(raw, 10) / 100;
    setValorDisplay(
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num)
    );
  }

  const valorNum = valorDisplay
    ? parseFloat(
        valorDisplay
          .replace(/[R$\s.]/g, "")
          .replace(",", ".")
      )
    : 0;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ds-btn ds-btn-primary"
        style={{ padding: "5px 12px", fontSize: "12px" }}
      >
        <Plus size={13} />
        <span>Adicionar item</span>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(2,11,24,0.85)", backdropFilter: "blur(4px)" }}
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <dialog
        ref={dialogRef}
        open
        tabIndex={-1}
        className="fixed z-50 w-full max-w-md rounded-2xl outline-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#0a1628",
          border: "1px solid rgba(34,211,238,0.18)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          padding: 0,
          margin: 0,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}
        >
          <h2
            className="text-sm font-semibold text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Novo item orçamentário
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="px-5 py-5 space-y-4">

          {/* Descrição */}
          <div className="ds-field">
            <label className="ds-label" htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              className="ds-input"
              placeholder="Ex: Cachê do diretor musical"
              required
              autoFocus
            />
          </div>

          {/* Categoria */}
          <div className="ds-field">
            <label className="ds-label" htmlFor="categoria">Categoria</label>
            <select id="categoria" name="categoria" className="ds-input">
              <option value="">Selecione (opcional)</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Qtd + Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="ds-field">
              <label className="ds-label" htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                name="quantidade"
                type="number"
                className="ds-input num-tabular"
                min={1}
                defaultValue={1}
                required
              />
            </div>
            <div className="ds-field">
              <label className="ds-label" htmlFor="valor_display">Valor unitário</label>
              <input
                id="valor_display"
                type="text"
                inputMode="numeric"
                className="ds-input num-tabular"
                placeholder="R$ 0,00"
                value={valorDisplay}
                onChange={handleValorInput}
                required
              />
              {/* Hidden com valor numérico para a action */}
              <input type="hidden" name="valor_num" value={valorNum || ""} />
            </div>
          </div>

          {/* Fonte (opcional) */}
          {fontes.length > 0 && (
            <div className="ds-field">
              <label className="ds-label" htmlFor="fonte_id">Vincular à fonte (opcional)</label>
              <select id="fonte_id" name="fonte_id" className="ds-input">
                <option value="">Nenhuma</option>
                {fontes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome_fonte ?? f.tipo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Erro */}
          {state?.error && (
            <p className="form-error">{state.error}</p>
          )}

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ds-btn"
              style={{ fontSize: "13px" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="ds-btn ds-btn-primary"
              style={{ fontSize: "13px" }}
            >
              {pending ? "Salvando…" : "Salvar item"}
            </button>
          </div>

        </form>
      </dialog>
    </>
  );
}
