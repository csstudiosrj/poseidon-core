// src/lib/ia/tipos.ts

export type Esfera = "Federal" | "Estadual" | "Municipal";
export type SegmentoCultural =
  | "musica"
  | "teatro"
  | "danca"
  | "artes_visuais"
  | "patrimonio"
  | "audiovisual"
  | "literatura"
  | "cultura_popular"
  | "geral";

export interface SecaoObrigatoria {
  nome: string;
  campo: string;
  obrigatorio: boolean;
  descricao: string;
}

export interface TetoOrcamentario {
  categoria: string;
  percentual_maximo: number;
  percentual_minimo?: number;
  descricao: string;
}

export interface RegrasMecanismo {
  mecanismo_nome: string;
  esfera: Esfera;
  secoes_obrigatorias: SecaoObrigatoria[];
  tetos: TetoOrcamentario[];
  campos_formulario: string[];
  documentos_obrigatorios: string[];
}

export interface RespostasEntrevista {
  descricao: string;
  publico: string;
  objetivos: string;
  orcamento: number;
  local?: string;
  duracao?: string;
  contrapartida?: string;
  [key: string]: string | number | undefined;
}

export interface ProjetoBase {
  id: string;
  nome_projeto: string;
  proponente_id: string;
  mecanismo_id: string;
  segmento?: SegmentoCultural;
}

export interface ConteudoGerado {
  justificativa: string;
  objetivos: string;
  publico_alvo: string;
  acessibilidade: string;
  contrapartida: string;
  democratizacao: string;
  cronograma_resumido: string;
  ficha_tecnica: string;
  [key: string]: string;
}

export interface ItemOrcamentarioGerado {
  descricao: string;
  categoria: string;
  valor: number;
  quantidade: number;
  justificativa: string;
}

export interface ProjetoSeed {
  segmento: SegmentoCultural;
  esfera: Esfera;
  mecanismo: string;
  nome: string;
  descricao: string;
  justificativa: string;
  objetivos: string;
  publico_alvo: string;
  acessibilidade: string;
  contrapartida: string;
  democratizacao: string;
  orcamento: ItemOrcamentarioGerado[];
}