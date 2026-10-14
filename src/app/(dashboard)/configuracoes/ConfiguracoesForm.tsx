"use client";
// src/app/(dashboard)/configuracoes/ConfiguracoesForm.tsx

import React, { useActionState, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { salvarConfiguracoesAction } from "@/app/actions/configuracoes";
import type { ProponenteData } from "@/app/actions/configuracoes";

function maskDoc(value: string, tipo: string): string {
  const digits = value.replace(/\D/g, "");
  if (tipo === "PF") {
    return digits
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function ConfiguracoesForm({ proponente }: { proponente: ProponenteData }) {
  const [tipo, setTipo]         = useState(proponente.tipo);
  const [docDisplay, setDoc]    = useState(maskDoc(proponente.cpf_cnpj, proponente.tipo));
  const [telDisplay, setTel]    = useState(maskPhone(proponente.whatsapp ?? ""));
  const [saved, setSaved]       = useState(false);

  const [state, formAction, pending] = useActionState(salvarConfiguracoesAction, null);

  useEffect(() => {
    if (state?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  function handleTipoChange(novo: string) {
    setTipo(novo);
    setDoc("");
  }

  function handleDocInput(e: React.ChangeEvent<HTMLInputElement>) {
    setDoc(maskDoc(e.target.value, tipo));
  }

  function handleTelInput(e: React.ChangeEvent<HTMLInputElement>) {
    setTel(maskPhone(e.target.value));
  }

  const docRaw = docDisplay.replace(/\D/g, "");

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="tipo"    value={tipo} />
      <input type="hidden" name="cpf_cnpj" value={docRaw} />

      {/* ── Tipo de pessoa ── */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4"
        >
          Tipo de pessoa
        </h2>
        <div className="flex gap-3">
          {(["PF", "PJ"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTipoChange(t)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all border"
              style={{
                background:
                  tipo === t
                    ? "rgba(34,211,238,0.08)"
                    : "rgba(8,17,33,0.6)",
                borderColor:
                  tipo === t
                    ? "rgba(34,211,238,0.30)"
                    : "rgba(142,177,214,0.12)",
                color: tipo === t ? "#22d3ee" : "#64748b",
              }}
            >
              {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
            </button>
          ))}
        </div>
      </section>

      {/* ── Dados pessoais ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">
          Dados pessoais
        </h2>
        <div className="space-y-4">
          <div className="ds-field">
            <label className="ds-label" htmlFor="cfg-nome">
              {tipo === "PF" ? "Nome completo" : "Razão social"}
            </label>
            <input
              id="cfg-nome"
              name="nome_razao_social"
              type="text"
              className="ds-input"
              defaultValue={proponente.nome_razao_social}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="ds-field">
              <label className="ds-label" htmlFor="cfg-doc">
                {tipo === "PF" ? "CPF" : "CNPJ"}
              </label>
              <input
                id="cfg-doc"
                type="text"
                inputMode="numeric"
                className="ds-input num-tabular"
                value={docDisplay}
                onChange={handleDocInput}
                placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label" htmlFor="cfg-tel">WhatsApp</label>
              <input
                id="cfg-tel"
                name="whatsapp"
                type="text"
                inputMode="numeric"
                className="ds-input num-tabular"
                value={telDisplay}
                onChange={handleTelInput}
                placeholder="(21) 99999-9999"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Conta ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">
          Conta
        </h2>
        <div className="ds-field">
          <label className="ds-label">E-mail</label>
          <input
            type="email"
            className="ds-input"
            value={proponente.email}
            readOnly
            style={{ opacity: 0.5, cursor: "not-allowed" }}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Para alterar o e-mail, entre em contato pelo suporte.
          </p>
        </div>
      </section>

      {/* ── Rodapé ── */}
      {state?.error && <p className="form-error">{state.error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
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
          style={{ fontSize: "13px", minWidth: "120px" }}
        >
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
