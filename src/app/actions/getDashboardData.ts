"use server";

import { createClient } from "@/lib/supabase/server";

export type DashboardRubrica = {
  id: string;
  categoria: string;
  descricao: string;
  valor_orcado: number;
  valor_executado: number;
  valor_glosado: number;
  excede_teto: boolean;
  tetoLegal: number;
  percentualTeto: number;
  status: "ok" | "warning" | "critical";
  referenciaLegal: string;
};

export type DashboardAlerta = {
  id: string;
  nivel: "info" | "aviso" | "critico" | "bloqueante";
  codigo: string;
  mensagem: string;
  referencia_legal: string | null;
  criado_em: string;
};

export type DashboardData = {
  projetoId: string;
  nomeP: string;
  status: string;
  orcamentoTotalAprovado: number;
  valorCaptado: number;
  valorExecutado: number;
  saldoConta: number;
  tetoAdministracao: number;
  tetoCaptacao: number;
  tetoDivulgacao: number;
  riscoPercentual: number;
  riscoLabel: "Estável" | "Atenção" | "Crítico";
  rubricas: DashboardRubrica[];
  alertas: DashboardAlerta[];
};

const REGRAS: Record<string, { referencia: string }> = {
  administracao:           { referencia: "IN 29/2026, Art. 18 — Adm. ≤ 15%" },
  captacao_recursos:       { referencia: "IN 29/2026, Art. 19 — Capt. ≤ 10% / máx. R$ 150k" },
  divulgacao_comunicacao:  { referencia: "IN 29/2026, Art. 20 — Divulg.+Acess. ≤ 20% (teto compartilhado)" },
  acessibilidade:          { referencia: "IN 29/2026, Art. 20 — Divulg.+Acess. ≤ 20% (teto compartilhado)" },
  direitos_autorais:       { referencia: "IN 29/2026 — Dir. Autorais ≤ 10%" },
  cache_artista_individual:{ referencia: "IN 29/2026 — Cachê individual ≤ R$ 25k/apresentação" },
  cache_artista_grupo:     { referencia: "IN 29/2026 — Cachê grupo ≤ R$ 50k/apresentação" },
  cache_musico_orquestra:  { referencia: "IN 29/2026 — Cachê músico ≤ R$ 5k/projeto" },
  cache_maestro:           { referencia: "IN 29/2026 — Cachê maestro ≤ R$ 25k/projeto" },
};

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}

type ProjetoRow = {
  id: string;
  nome_projeto: string;
  status: string;
  orcamento_total_aprovado: number;
  valor_captado: number;
  valor_executado: number;
  teto_administracao: number;
  teto_captacao_recursos: number;
  teto_divulgacao_acessibilidade: number;
};

type RubricaRow = {
  id: string;
  categoria: string;
  descricao: string;
  valor_orcado: number;
  valor_executado: number;
  valor_glosado: number;
  teto_absoluto: number | null;
  teto_percentual: number | null;
  excede_teto: boolean;
};

type AlertaRow = {
  id: string;
  nivel: "info" | "aviso" | "critico" | "bloqueante";
  codigo: string;
  mensagem: string;
  referencia_legal: string | null;
  criado_em: string;
};

export async function getDashboardData(projetoId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: projeto, error: projetoError } = await supabase
    .from("projetos")
    .select(`
      id,
      nome_projeto,
      status,
      orcamento_total_aprovado,
      valor_captado,
      valor_executado,
      teto_administracao,
      teto_captacao_recursos,
      teto_divulgacao_acessibilidade
    `)
    .eq("id", projetoId)
    .single();

  if (projetoError || !projeto) {
    return {
      projetoId,
      nomeP: "Projeto não encontrado",
      status: "rascunho",
      orcamentoTotalAprovado: 0,
      valorCaptado: 0,
      valorExecutado: 0,
      saldoConta: 0,
      tetoAdministracao: 0,
      tetoCaptacao: 0,
      tetoDivulgacao: 0,
      riscoPercentual: 0,
      riscoLabel: "Estável",
      rubricas: [],
      alertas: [],
    };
  }

  const p = projeto as ProjetoRow;

  const { data: rubricasData } = await supabase
    .from("rubricas")
    .select(`
      id,
      categoria,
      descricao,
      valor_orcado,
      valor_executado,
      valor_glosado,
      teto_absoluto,
      teto_percentual,
      excede_teto
    `)
    .eq("projeto_id", projetoId)
    .order("categoria", { ascending: true });

  const { data: alertasData } = await supabase
    .from("compliance_alertas")
    .select("id, nivel, codigo, mensagem, referencia_legal, criado_em")
    .eq("projeto_id", projetoId)
    .eq("resolvido", false)
    .order("criado_em", { ascending: false })
    .limit(15);

  const orcamento = Number(p.orcamento_total_aprovado);

  const rubricas: DashboardRubrica[] = (rubricasData ?? []).map((r) => {
    const row = r as RubricaRow;
    let tetoLegal: number;

    if (row.teto_absoluto != null) {
      tetoLegal = Number(row.teto_absoluto);
    } else if (row.teto_percentual != null) {
      tetoLegal = orcamento * (Number(row.teto_percentual) / 100);
      if (row.categoria === "captacao_recursos") {
        tetoLegal = Math.min(tetoLegal, 150000);
      }
    } else {
      tetoLegal = Number(row.valor_orcado);
    }

    const executado = Number(row.valor_executado ?? 0);
    const percentualTeto = tetoLegal > 0 ? (executado / tetoLegal) * 100 : 0;

    return {
      id: row.id,
      categoria: row.categoria,
      descricao: row.descricao,
      valor_orcado: Number(row.valor_orcado),
      valor_executado: executado,
      valor_glosado: Number(row.valor_glosado ?? 0),
      excede_teto: Boolean(row.excede_teto),
      tetoLegal,
      percentualTeto,
      status: row.excede_teto || percentualTeto >= 100 ? "critical" : percentualTeto >= 90 ? "warning" : "ok",
      referenciaLegal: REGRAS[row.categoria]?.referencia ?? "Sem regra específica",
    };
  });

  const maiorPercentual = rubricas.reduce((m, r) => Math.max(m, r.percentualTeto), 0);
  const riscoPercentual = clamp(maiorPercentual);
  const riscoLabel = riscoPercentual >= 90 ? "Crítico" : riscoPercentual >= 60 ? "Atenção" : "Estável";

  return {
    projetoId,
    nomeP: p.nome_projeto,
    status: p.status,
    orcamentoTotalAprovado: orcamento,
    valorCaptado: Number(p.valor_captado),
    valorExecutado: Number(p.valor_executado),
    saldoConta: Math.max(Number(p.valor_captado) - Number(p.valor_executado), 0),
    tetoAdministracao: Number(p.teto_administracao),
    tetoCaptacao: Number(p.teto_captacao_recursos),
    tetoDivulgacao: Number(p.teto_divulgacao_acessibilidade),
    riscoPercentual,
    riscoLabel,
    rubricas,
    alertas: (alertasData ?? []) as AlertaRow[],
  };
}