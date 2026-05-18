// src/lib/ia/orcamentista.ts
import { RegrasMecanismo, TetoOrcamentario } from "./tipos";

export interface ItemProposto {
  descricao: string;
  categoria: string;
  valor: number;
  quantidade: number;
  justificativa?: string;
}

export interface ContextoOrcamento {
  projetoId: string;
  fonteId: string;
  orcamentoTotal: number;
  itens: ItemProposto[];
  regras: RegrasMecanismo;
}

export interface MensagemChat {
  tipo: "usuario" | "assistente";
  texto: string;
  itens?: ItemProposto[];
  alertas?: string[];
}

export function extrairPromessas(conteudo: Record<string, string>): string[] {
  const promessas: string[] = [];
  const texto = Object.values(conteudo).join(" ");
  
  const padroes = [
    /distribui(?:r|ção)\s+(?:de\s+)?(.+?)(?:,|\.|;|$)/gi,
    /serão\s+(?:oferecidos|disponibilizados|entregues|fornecidos)\s+(.+?)(?:,|\.|;|$)/gi,
    /acessibilidade\s+(?:com|em|através de)\s+(.+?)(?:,|\.|;|$)/gi,
    /transporte\s+(?:para|de)\s+(.+?)(?:,|\.|;|$)/gi,
    /alimentação\s+(?:para|de)\s+(.+?)(?:,|\.|;|$)/gi,
    /hospedagem\s+(?:para|de)\s+(.+?)(?:,|\.|;|$)/gi,
  ];

  for (const regex of padroes) {
    const matches = texto.matchAll(regex);
    for (const match of matches) {
      if (match[1] && match[1].length > 5) {
        promessas.push(match[1].trim());
      }
    }
  }

  return [...new Set(promessas)];
}

export function processarComando(
  mensagem: string,
  contexto: ContextoOrcamento
): { acao: "adicionar" | "alterar" | "remover" | "listar" | "desconhecido"; item?: ItemProposto; indice?: number } {
  const texto = mensagem.toLowerCase().trim();

  const adicionarRegex = /(?:adicionar|incluir|criar|adiciona|inclui|cria)\s+(?:item\s+)?(.+?)\s+(?:de|por|no valor de)\s+R\$\s*([\d.,]+)/i;
  const matchAdicionar = texto.match(adicionarRegex);
  if (matchAdicionar) {
    const descricao = matchAdicionar[1].trim();
    const valorStr = matchAdicionar[2].replace(/\./g, "").replace(",", ".");
    const valor = parseFloat(valorStr);
    if (!isNaN(valor) && valor > 0) {
      return {
        acao: "adicionar",
        item: {
          descricao,
          categoria: detectarCategoria(descricao, contexto.regras),
          valor,
          quantidade: 1,
        },
      };
    }
  }

  const alterarRegex = /(?:alterar|mudar|ajustar|altere|mude|ajuste)\s+(?:item\s+)?(\d+)\s+(?:para|com valor de)\s+R\$\s*([\d.,]+)/i;
  const matchAlterar = texto.match(alterarRegex);
  if (matchAlterar) {
    const indice = parseInt(matchAlterar[1]) - 1;
    const valorStr = matchAlterar[2].replace(/\./g, "").replace(",", ".");
    const valor = parseFloat(valorStr);
    if (!isNaN(valor) && valor > 0 && indice >= 0) {
      return { acao: "alterar", indice, item: { descricao: "", categoria: "", valor, quantidade: 1 } };
    }
  }

  const removerRegex = /(?:remover|excluir|apagar|remove|exclui|apaga)\s+(?:item\s+)?(\d+)/i;
  const matchRemover = texto.match(removerRegex);
  if (matchRemover) {
    return { acao: "remover", indice: parseInt(matchRemover[1]) - 1 };
  }

  if (/(?:listar|mostrar|exibir|ver|quais|lista)\s+(?:itens|orcamento)/i.test(texto)) {
    return { acao: "listar" };
  }

  return { acao: "desconhecido" };
}

function detectarCategoria(descricao: string, regras: RegrasMecanismo): string {
  const texto = descricao.toLowerCase();
  const mapaPalavras: Record<string, string> = {
    "cachê": "cache",
    "artista": "cache",
    "músico": "cache",
    "ator": "cache",
    "dançarino": "cache",
    "infraestrutura": "infraestrutura",
    "palco": "infraestrutura",
    "som": "infraestrutura",
    "iluminação": "infraestrutura",
    "divulgação": "divulgacao",
    "marketing": "divulgacao",
    "mídia": "divulgacao",
    "administração": "administracao",
    "coordenação": "administracao",
    "captação": "captacao",
    "formação": "formacao",
    "oficina": "formacao",
    "logística": "logistica",
    "transporte": "logistica",
    "hospedagem": "logistica",
  };

  for (const [palavra, categoria] of Object.entries(mapaPalavras)) {
    if (texto.includes(palavra)) return categoria;
  }

  return "infraestrutura";
}

export function validarContraTetos(
  itens: ItemProposto[],
  regras: RegrasMecanismo,
  orcamentoTotal: number
): string[] {
  const alertas: string[] = [];
  const somaPorCategoria: Record<string, number> = {};

  for (const item of itens) {
    somaPorCategoria[item.categoria] = (somaPorCategoria[item.categoria] || 0) + item.valor;
  }

  for (const teto of regras.tetos) {
    const valorCategoria = somaPorCategoria[teto.categoria] || 0;
    const maximo = (orcamentoTotal * teto.percentual_maximo) / 100;
    if (valorCategoria > maximo) {
      alertas.push(
        `⚠️ Teto excedido em ${teto.descricao}: R$ ${valorCategoria.toFixed(2)} de R$ ${maximo.toFixed(2)} (${teto.percentual_maximo}%)`
      );
    }
  }

  const totalItens = itens.reduce((s, i) => s + i.valor, 0);
  if (totalItens > orcamentoTotal) {
    alertas.push(`❌ Soma dos itens (R$ ${totalItens.toFixed(2)}) excede o orçamento total (R$ ${orcamentoTotal.toFixed(2)})`);
  }

  return alertas;
}

export function sugerirDistribuicao(
  saldo: number,
  regras: RegrasMecanismo
): ItemProposto[] {
  if (saldo <= 0) return [];
  const sugestoes: ItemProposto[] = [];
  for (const teto of regras.tetos) {
    const valor = (saldo * teto.percentual_maximo) / 100;
    if (valor > 0) {
      sugestoes.push({
        descricao: `Item sugerido: ${teto.descricao}`,
        categoria: teto.categoria,
        valor: Math.round(valor * 100) / 100,
        quantidade: 1,
      });
    }
  }
  return sugestoes;
}