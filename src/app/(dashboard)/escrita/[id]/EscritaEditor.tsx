"use client";
// src/app/(dashboard)/escrita/[id]/EscritaEditor.tsx

import React, { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { ConteudoEscrita } from "@/app/actions/escrita";
import { SECOES } from "@/app/actions/escrita";
import { salvarEscritaAction } from "@/app/actions/escrita";

/* word count helper */
function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function EscritaEditor({
  projetoId,
  conteudo: initialConteudo,
}: {
  projetoId: string;
  conteudo: ConteudoEscrita;
}) {
  const [conteudo, setConteudo] = useState<ConteudoEscrita>(initialConteudo);
  const [aberta, setAberta]     = useState<keyof ConteudoEscrita>(SECOES[0].key);
  const [saved, setSaved]       = useState(false);

  const boundAction = salvarEscritaAction.bind(null, projetoId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  useEffect(() => {
    if (state?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  function handleChange(key: keyof ConteudoEscrita, value: string) {
    setConteudo((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="space-y-2">
      {SECOES.map((secao) => {
        const isOpen    = aberta === secao.key;
        const texto     = conteudo[secao.key];
        const palavras  = wordCount(texto);
        const temConteudo = texto.trim().length > 0;

        return (
          <div
            key={secao.key}
            className="rounded-xl overflow-hidden"
            style={{
              border: isOpen
                ? "1px solid rgba(34,211,238,0.20)"
                : "1px solid rgba(142,177,214,0.08)",
              background: "#081121",
            }}
          >
            {/* Cabeçalho da seção */}
            <button
              type="button"
              onClick={() => setAberta(secao.key)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: temConteudo
                      ? isOpen
                        ? "#22d3ee"
                        : "#10b981"
                      : "rgba(142,177,214,0.20)",
                  }}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    isOpen ? "text-cyan-300" : "text-slate-300"
                  }`}
                >
                  {secao.titulo}
                </span>
                {temConteudo && !isOpen && (
                  <span className="text-[10px] text-slate-500 num-tabular">
                    {palavras} palavra{palavras !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {isOpen ? (
                <ChevronUp size={14} className="text-slate-500" />
              ) : (
                <ChevronDown size={14} className="text-slate-600" />
              )}
            </button>

            {/* Corpo */}
            {isOpen && (
              <div className="px-5 pb-5">
                <p className="text-[11px] text-slate-500 mb-3">{secao.dica}</p>
                <textarea
                  name={secao.key}
                  rows={8}
                  className="ds-input resize-y"
                  placeholder={secao.placeholder}
                  value={texto}
                  onChange={(e) => handleChange(secao.key, e.target.value)}
                  style={{ minHeight: "160px" }}
                />
                <div className="flex justify-end mt-1.5">
                  <span className="text-[11px] text-slate-600 num-tabular">
                    {palavras} palavra{palavras !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Hidden para seções fechadas (necessário para o formData) */}
            {!isOpen && (
              <input type="hidden" name={secao.key} value={texto} />
            )}
          </div>
        );
      })}

      {/* Rodapé */}
      {state?.error && (
        <p className="form-error pt-2">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 size={14} />
            Salvo com sucesso
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="ds-btn ds-btn-primary"
          style={{ fontSize: "13px", minWidth: "140px" }}
        >
          {pending ? "Salvando…" : "Salvar textos"}
        </button>
      </div>
    </form>
  );
}
