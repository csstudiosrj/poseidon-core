"use client";
// src/app/(dashboard)/biblioteca/BibliotecaList.tsx

import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, FileText, CheckSquare, BarChart2 } from "lucide-react";
import type { RegrasBiblioteca, EsferaType, TetoCategoria } from "@/app/actions/biblioteca";

const ESFERA_TABS: Array<{ key: EsferaType | "Todos"; label: string }> = [
  { key: "Todos",     label: "Todos" },
  { key: "Federal",   label: "Federal" },
  { key: "Estadual",  label: "Estadual" },
  { key: "Municipal", label: "Municipal" },
];

const ESFERA_COR: Record<string, { bg: string; text: string; border: string }> = {
  Federal:   { bg: "rgba(34,211,238,0.08)",  text: "#22d3ee", border: "rgba(34,211,238,0.25)" },
  Estadual:  { bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.25)" },
  Municipal: { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)" },
};

const CAT_LABEL: Record<string, string> = {
  administracao: "Administração",
  cache:         "Cachê",
  infraestrutura:"Infraestrutura",
  divulgacao:    "Divulgação",
  captacao:      "Captação",
  formacao:      "Formação",
};

const DOC_LABEL: Record<string, string> = {
  carta_apresentacao:          "Carta de apresentação",
  orcamento_detalhado:         "Orçamento detalhado",
  cronograma_fisico_financeiro:"Cronograma físico-financeiro",
  documentacao_proponente:     "Documentação do proponente",
  certidoes_negativas:         "Certidões negativas",
  comprovante_endereco:        "Comprovante de endereço",
  plano_trabalho:              "Plano de trabalho",
  orcamento:                   "Orçamento",
  cronograma:                  "Cronograma",
  certidoes_estaduais:         "Certidões estaduais",
  certidoes_municipais:        "Certidões municipais",
  carta_anuencia:              "Carta de anuência",
  declaracao_contrapartida:    "Declaração de contrapartida",
  declaracao_icms:             "Declaração ICMS",
};

/* ─── BibliotecaList ────────────────────────────────────────────── */
export function BibliotecaList({ regras }: { regras: RegrasBiblioteca[] }) {
  const [esfera, setEsfera] = useState<EsferaType | "Todos">("Todos");
  const [busca, setBusca]   = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const filtrados = regras.filter((r) => {
    const matchEsfera = esfera === "Todos" || r.esfera === esfera;
    const matchBusca  = busca === "" ||
      r.mecanismo_nome.toLowerCase().includes(busca.toLowerCase()) ||
      (r.diretrizes ?? "").toLowerCase().includes(busca.toLowerCase());
    return matchEsfera && matchBusca;
  });

  return (
    <div>
      {/* Tabs de esfera */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {ESFERA_TABS.map((t) => {
          const ativo = esfera === t.key;
          const cor   = t.key !== "Todos" ? ESFERA_COR[t.key] : null;
          return (
            <button
              key={t.key}
              onClick={() => setEsfera(t.key)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border"
              style={{
                background:  ativo && cor ? cor.bg  : ativo ? "rgba(34,211,238,0.08)" : "rgba(8,17,33,0.6)",
                borderColor: ativo && cor ? cor.border : ativo ? "rgba(34,211,238,0.30)" : "rgba(142,177,214,0.12)",
                color:       ativo && cor ? cor.text : ativo ? "#22d3ee" : "#64748b",
              }}
            >
              {t.label}
              <span className="ml-1.5 opacity-60">
                {t.key === "Todos"
                  ? regras.length
                  : regras.filter((r) => r.esfera === t.key).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar mecanismo…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="ds-input pl-8 text-xs"
          style={{ height: "36px" }}
        />
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-10">Nenhum resultado encontrado.</p>
      ) : (
        <div className="space-y-2">
          {filtrados.map((r) => (
            <RegraCard
              key={r.id}
              regra={r}
              isOpen={aberto === r.id}
              onToggle={() => setAberto(aberto === r.id ? null : r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── RegraCard ─────────────────────────────────────────────────── */
function RegraCard({
  regra,
  isOpen,
  onToggle,
}: {
  regra:    RegrasBiblioteca;
  isOpen:   boolean;
  onToggle: () => void;
}) {
  const cor   = ESFERA_COR[regra.esfera];
  const cfg   = regra.configuracao_regras;
  const tetos = cfg?.tetos ?? [];
  const docs  = cfg?.documentos_obrigatorios ?? [];
  const secoes = cfg?.secoes_obrigatorias ?? [];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border:     isOpen ? `1px solid ${cor.border}` : "1px solid rgba(142,177,214,0.08)",
        background: "#081121",
      }}
    >
      {/* Cabeçalho */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Badge esfera */}
        <span
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md"
          style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}
        >
          {regra.esfera}
        </span>

        {/* Nome */}
        <span className="flex-1 text-sm font-medium text-slate-200 text-left truncate">
          {regra.mecanismo_nome}
        </span>

        {/* Contadores rápidos */}
        {!isOpen && tetos.length > 0 && (
          <span className="text-[10px] text-slate-600 hidden sm:block shrink-0">
            {tetos.length} categoria{tetos.length !== 1 ? "s" : ""}
          </span>
        )}

        {isOpen
          ? <ChevronUp size={14} className="text-slate-500 shrink-0" />
          : <ChevronDown size={14} className="text-slate-600 shrink-0" />}
      </button>

      {/* Detalhe */}
      {isOpen && (
        <div className="px-4 pb-5 space-y-5" style={{ borderTop: "1px solid rgba(142,177,214,0.08)" }}>

          {/* Diretrizes */}
          {regra.diretrizes && (
            <div className="pt-4">
              <p className="text-[11px] text-slate-400 leading-relaxed">{regra.diretrizes}</p>
            </div>
          )}

          {/* Tetos por categoria */}
          {tetos.length > 0 && (
            <div>
              <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
                <BarChart2 size={11} />
                Tetos por categoria
              </h3>
              <div className="space-y-2">
                {tetos.map((t, i) => (
                  <TetoRow key={i} teto={t} />
                ))}
              </div>
            </div>
          )}

          {/* Seções obrigatórias */}
          {secoes.length > 0 && (
            <div>
              <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
                <CheckSquare size={11} />
                Seções obrigatórias
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {secoes.map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-lg text-slate-300"
                    style={{ background: "rgba(142,177,214,0.06)", border: "1px solid rgba(142,177,214,0.10)" }}
                  >
                    {s.descricao ?? s.nome}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documentos */}
          {docs.length > 0 && (
            <div>
              <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
                <FileText size={11} />
                Documentos obrigatórios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                    {DOC_LABEL[d] ?? d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── TetoRow ────────────────────────────────────────────────────── */
function TetoRow({ teto }: { teto: TetoCategoria }) {
  const isMax = teto.percentual_maximo !== undefined;
  const pct   = isMax ? teto.percentual_maximo! : teto.percentual_minimo!;
  const label = CAT_LABEL[teto.categoria] ?? teto.categoria;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-400">{label}</span>
          <span className={`text-[11px] font-medium num-tabular ${isMax ? "text-slate-300" : "text-emerald-400"}`}>
            {isMax ? `máx. ${pct}%` : `mín. ${pct}%`}
          </span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(142,177,214,0.08)" }}
        >
          <div
            className={`h-full rounded-full ${isMax ? "bg-slate-600" : "bg-emerald-600"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
