// src/app/actions/biblioteca.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export type EsferaType = "Federal" | "Estadual" | "Municipal";

export interface TetoCategoria {
  categoria:          string;
  descricao:          string;
  percentual_maximo?: number;
  percentual_minimo?: number;
}

export interface SecaoObrigatoria {
  nome:        string;
  campo:       string;
  descricao?:  string;
  obrigatorio: boolean;
}

export interface ConfiguracaoRegras {
  tetos?:                  TetoCategoria[];
  campos_formulario?:      string[];
  secoes_obrigatorias?:    SecaoObrigatoria[];
  documentos_obrigatorios?: string[];
  limites_financeiros?:    Record<string, unknown>;
  base_legal?:             string;
}

export interface RegrasBiblioteca {
  id:                   string;
  esfera:               EsferaType;
  mecanismo_nome:       string;
  diretrizes:           string | null;
  configuracao_regras:  ConfiguracaoRegras | null;
  created_at:           string;
}

export async function listarRegras(): Promise<
  RegrasBiblioteca[] | { error: string }
> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data, error } = await supabase
    .from("biblioteca_regras")
    .select("id, esfera, mecanismo_nome, diretrizes, configuracao_regras, created_at")
    .order("esfera")
    .order("mecanismo_nome");

  if (error) return { error: "Erro ao buscar biblioteca de regras." };

  return (data ?? []) as RegrasBiblioteca[];
}
