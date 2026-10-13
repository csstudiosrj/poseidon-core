"use client";
// src/app/(dashboard)/projeto/[id]/NotasFiscais.tsx

import React, { useActionState, useEffect, useState, useRef } from "react";
import { Plus, Trash2, X, FileText, ExternalLink, Upload, Check } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { adicionarNotaAction, deletarNotaAction } from "@/app/actions/notas";

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

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "text-amber-400" },
  aprovada: { label: "Aprovada", cls: "text-emerald-400" },
  glosa:    { label: "Glosa",    cls: "text-red-400" },
};

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export interface NotaRow {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_emissao: string | null;
  arquivo_url: string | null;
  status: string | null;
  fonte_id: string | null;
}

interface Fonte {
  id: string;
  tipo: string;
  nome_fonte: string | null;
}

interface Props {
  projetoId: string;
  notas: NotaRow[];
  fontes: Fonte[];
}

/* ─── Componente principal ──────────────────────────────────────── */
export function NotasFiscais({ projetoId, notas, fontes }: Props) {
  const [open, setOpen]           = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(notaId: string) {
    setDeleteError(null);
    const res = await deletarNotaAction(projetoId, notaId);
    if (res.error) setDeleteError(res.error);
    else setDeletingId(null);
  }

  const totalNotas = notas.reduce((s, n) => s + Number(n.valor), 0);

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Notas Fiscais
        </h2>
        <button
          onClick={() => setOpen(true)}
          className="ds-btn ds-btn-primary flex items-center gap-1.5"
          style={{ fontSize: "12px", padding: "6px 12px" }}
        >
          <Plus size={13} />
          Adicionar nota
        </button>
      </div>

      {notas.length === 0 ? (
        <div
          className="ds-card flex flex-col items-center justify-center text-center py-10"
          style={{ background: "#081121" }}
        >
          <FileText size={26} className="text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-300 mb-1">
            Nenhuma nota fiscal ainda
          </p>
          <p className="text-xs text-slate-500 max-w-xs">
            Adicione as notas fiscais para compor a prestação de contas do projeto.
          </p>
        </div>
      ) : (
        <div
          className="ds-card overflow-hidden"
          style={{ background: "#081121", padding: 0 }}
        >
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(142,177,214,0.10)" }}>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden sm:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden md:table-cell">Data</th>
                <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium hidden sm:table-cell">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {notas.map((nota, idx) => {
                const isLast = idx === notas.length - 1;
                const isConfirmingDelete = deletingId === nota.id;
                const statusCfg =
                  STATUS_CFG[nota.status ?? "pendente"] ?? STATUS_CFG.pendente;

                return (
                  <tr
                    key={nota.id}
                    style={
                      isLast
                        ? undefined
                        : { borderBottom: "1px solid rgba(142,177,214,0.07)" }
                    }
                  >
                    <td className="px-4 py-3 text-slate-200 max-w-[180px] truncate">
                      {nota.descricao}
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                      {nota.categoria}
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                      {nota.data_emissao
                        ? new Date(nota.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium num-tabular">
                      {brl(Number(nota.valor))}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[11px] font-medium ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleDelete(nota.id)}
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
                          {nota.arquivo_url && (
                            <a
                              href={nota.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-cyan-400 transition-colors"
                              title="Ver arquivo"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeletingId(nota.id)}
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
                <td
                  colSpan={3}
                  className="px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium"
                >
                  Total notas
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-cyan-300 num-tabular">
                  {brl(totalNotas)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {deleteError && <p className="form-error mt-2">{deleteError}</p>}

      {open && (
        <NovaNotaModal
          projetoId={projetoId}
          fontes={fontes}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

/* ─── Modal nova nota ───────────────────────────────────────────── */
function NovaNotaModal({
  projetoId,
  fontes,
  onClose,
}: {
  projetoId: string;
  fontes: Fonte[];
  onClose: () => void;
}) {
  const [valorDisplay, setValorDisplay]     = useState("");
  const [arquivoUrl, setArquivoUrl]         = useState("");
  const [uploadStatus, setUploadStatus]     = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadFileName, setUploadFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const boundAction = adicionarNotaAction.bind(null, projetoId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  const { startUpload } = useUploadThing("notaFiscal", {
    onUploadBegin:       () => setUploadStatus("uploading"),
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
      if (url) {
        setArquivoUrl(url);
        setUploadStatus("done");
      }
    },
    onUploadError: () => setUploadStatus("error"),
  });

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    await startUpload([file]);
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
          <h2
            className="text-sm font-semibold text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Nova nota fiscal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="px-5 py-5 space-y-4">
          <input type="hidden" name="arquivo_url" value={arquivoUrl} />
          <input type="hidden" name="valor_num"   value={valorNum || ""} />

          {/* Upload */}
          <div className="ds-field">
            <label className="ds-label">Arquivo (PDF ou imagem)</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === "uploading"}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{
                borderColor:
                  uploadStatus === "done"
                    ? "rgba(52,211,153,0.4)"
                    : "rgba(142,177,214,0.15)",
                background: "rgba(8,17,33,0.6)",
                color:
                  uploadStatus === "done" ? "#6ee7b7" : "#64748b",
              }}
            >
              {uploadStatus === "uploading" ? (
                <><Upload size={14} className="animate-bounce" /> Enviando…</>
              ) : uploadStatus === "done" ? (
                <><Check size={14} /> {uploadFileName}</>
              ) : (
                <><Upload size={14} /> {uploadFileName || "Selecionar arquivo (opcional)"}</>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadStatus === "error" && (
              <p className="form-error mt-1">Erro no upload. Tente novamente.</p>
            )}
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="nf-descricao">Descrição</label>
            <input
              id="nf-descricao"
              name="descricao"
              type="text"
              className="ds-input"
              placeholder="Ex: Cachê músico João Silva"
              required
              autoFocus
            />
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="nf-categoria">Categoria</label>
            <select id="nf-categoria" name="categoria" className="ds-input" required>
              <option value="">Selecione…</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="ds-field">
              <label className="ds-label" htmlFor="nf-valor">Valor</label>
              <input
                id="nf-valor"
                type="text"
                inputMode="numeric"
                className="ds-input num-tabular"
                placeholder="R$ 0,00"
                value={valorDisplay}
                onChange={handleValorInput}
                required
              />
            </div>
            <div className="ds-field">
              <label className="ds-label" htmlFor="nf-data">Data de emissão</label>
              <input
                id="nf-data"
                name="data_emissao"
                type="date"
                className="ds-input"
              />
            </div>
          </div>

          {fontes.length > 0 && (
            <div className="ds-field">
              <label className="ds-label" htmlFor="nf-fonte">
                Vincular à fonte (opcional)
              </label>
              <select id="nf-fonte" name="fonte_id" className="ds-input">
                <option value="">Nenhuma</option>
                {fontes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome_fonte ?? f.tipo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {state?.error && <p className="form-error">{state.error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="ds-btn"
              style={{ fontSize: "13px" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending || uploadStatus === "uploading"}
              className="ds-btn ds-btn-primary"
              style={{ fontSize: "13px" }}
            >
              {pending ? "Salvando…" : "Salvar nota"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
