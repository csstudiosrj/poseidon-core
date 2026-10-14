"use client";
// src/app/(dashboard)/portfolio/PortfolioForm.tsx

import React, { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { salvarPortfolioAction, AREAS_CULTURAIS } from "@/app/actions/portfolio";
import type { PortfolioData, ProjetoDestaque } from "@/app/actions/portfolio";

/* ─── PortfolioForm ─────────────────────────────────────────────── */
export function PortfolioForm({ portfolio }: { portfolio: PortfolioData }) {
  const [bio, setBio]               = useState(portfolio.bio);
  const [areas, setAreas]           = useState<string[]>(portfolio.areas);
  const [linkSite, setLinkSite]     = useState(portfolio.links.site ?? "");
  const [linkIg, setLinkIg]         = useState(portfolio.links.instagram ?? "");
  const [linkLi, setLinkLi]         = useState(portfolio.links.linkedin ?? "");
  const [projetos, setProjetos]     = useState<ProjetoDestaque[]>(
    portfolio.projetos_destaque
  );
  const [saved, setSaved]           = useState(false);

  const [state, formAction, pending] = useActionState(salvarPortfolioAction, null);

  useEffect(() => {
    if (state?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  /* ── Áreas toggle ── */
  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  /* ── Projetos destaque ── */
  function addProjeto() {
    if (projetos.length >= 5) return;
    setProjetos((prev) => [...prev, { nome: "", ano: new Date().getFullYear(), mecanismo: "" }]);
  }

  function removeProjeto(idx: number) {
    setProjetos((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateProjeto(idx: number, field: keyof ProjetoDestaque, value: string | number) {
    setProjetos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden fields para áreas e projetos */}
      {areas.map((a) => (
        <input key={a} type="hidden" name="areas" value={a} />
      ))}
      <input type="hidden" name="projetos_destaque" value={JSON.stringify(projetos)} />

      {/* ── Bio ── */}
      <section>
        <h2 className="ds-section-title">Bio</h2>
        <div className="ds-field">
          <label className="ds-label" htmlFor="pf-bio">
            Apresentação pessoal / institucional
          </label>
          <textarea
            id="pf-bio"
            name="bio"
            rows={5}
            maxLength={1000}
            className="ds-input resize-none"
            placeholder="Conte brevemente sua trajetória cultural, experiências e objetivos…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-[11px] text-slate-500 mt-1 text-right">
            {bio.length}/1000
          </p>
        </div>
      </section>

      {/* ── Áreas de atuação ── */}
      <section>
        <h2 className="ds-section-title">Áreas de atuação</h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Selecione as áreas que melhor representam seu trabalho cultural.
        </p>
        <div className="flex flex-wrap gap-2">
          {AREAS_CULTURAIS.map((area) => {
            const active = areas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background: active
                    ? "rgba(34,211,238,0.08)"
                    : "rgba(8,17,33,0.6)",
                  borderColor: active
                    ? "rgba(34,211,238,0.30)"
                    : "rgba(142,177,214,0.12)",
                  color: active ? "#22d3ee" : "#64748b",
                }}
              >
                {area}
              </button>
            );
          })}
        </div>
        {areas.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-2">
            {areas.length} área{areas.length > 1 ? "s" : ""} selecionada{areas.length > 1 ? "s" : ""}
          </p>
        )}
      </section>

      {/* ── Links ── */}
      <section>
        <h2 className="ds-section-title">Links</h2>
        <div className="space-y-4">
          <div className="ds-field">
            <label className="ds-label" htmlFor="pf-site">
              Site / Portfólio
            </label>
            <input
              id="pf-site"
              name="link_site"
              type="url"
              className="ds-input"
              placeholder="https://seuprojeto.com.br"
              value={linkSite}
              onChange={(e) => setLinkSite(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="ds-field">
              <label className="ds-label" htmlFor="pf-ig">
                Instagram
              </label>
              <input
                id="pf-ig"
                name="link_instagram"
                type="url"
                className="ds-input"
                placeholder="https://instagram.com/seuperfil"
                value={linkIg}
                onChange={(e) => setLinkIg(e.target.value)}
              />
            </div>
            <div className="ds-field">
              <label className="ds-label" htmlFor="pf-li">
                LinkedIn
              </label>
              <input
                id="pf-li"
                name="link_linkedin"
                type="url"
                className="ds-input"
                placeholder="https://linkedin.com/in/seuperfil"
                value={linkLi}
                onChange={(e) => setLinkLi(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Projetos em destaque ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="ds-section-title mb-0">Projetos em destaque</h2>
          {projetos.length < 5 && (
            <button
              type="button"
              onClick={addProjeto}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Plus size={13} />
              Adicionar
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mb-4">
          Até 5 projetos que representam melhor sua trajetória.
        </p>

        {projetos.length === 0 ? (
          <div
            className="rounded-xl py-6 text-center text-sm text-slate-500"
            style={{ border: "1px dashed rgba(142,177,214,0.15)" }}
          >
            Nenhum projeto adicionado ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {projetos.map((p, idx) => (
              <ProjetoDestaqueRow
                key={idx}
                projeto={p}
                idx={idx}
                onUpdate={updateProjeto}
                onRemove={removeProjeto}
              />
            ))}
          </div>
        )}
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
          style={{ fontSize: "13px", minWidth: "140px" }}
        >
          {pending ? "Salvando…" : "Salvar portfólio"}
        </button>
      </div>
    </form>
  );
}

/* ─── ProjetoDestaqueRow ────────────────────────────────────────── */
function ProjetoDestaqueRow({
  projeto,
  idx,
  onUpdate,
  onRemove,
}: {
  projeto: ProjetoDestaque;
  idx: number;
  onUpdate: (idx: number, field: keyof ProjetoDestaque, value: string | number) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "rgba(142,177,214,0.04)",
        border: "1px solid rgba(142,177,214,0.10)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.12em]">
          Projeto {idx + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="text-slate-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 ds-field">
          <label className="ds-label">Nome do projeto</label>
          <input
            type="text"
            className="ds-input"
            placeholder="Ex: Sarau das Artes"
            value={projeto.nome}
            onChange={(e) => onUpdate(idx, "nome", e.target.value)}
            required
          />
        </div>
        <div className="ds-field">
          <label className="ds-label">Ano</label>
          <input
            type="number"
            className="ds-input num-tabular"
            placeholder="2024"
            min={1990}
            max={new Date().getFullYear() + 2}
            value={projeto.ano}
            onChange={(e) => onUpdate(idx, "ano", Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="ds-field">
        <label className="ds-label">Mecanismo / Editais</label>
        <input
          type="text"
          className="ds-input"
          placeholder="Ex: Lei Rouanet, ProAC SP, Edital Municipal…"
          value={projeto.mecanismo}
          onChange={(e) => onUpdate(idx, "mecanismo", e.target.value)}
        />
      </div>
    </div>
  );
}
