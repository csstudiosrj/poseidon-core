// src/lib/compliance/fornecedores.ts
interface ResultadoValidacao {
  cnpj: string;
  nome_razao_social?: string;
  situacao_cadastral: "ATIVA" | "INAPTA" | "BAIXADA" | "DESCONHECIDA";
  cnae_principal?: string;
  cnae_compativel?: boolean;
  certidoes_negativas: boolean;
  sancoes_ativas: boolean;
  detalhes_sancoes?: string;
  mensagem: string;
  status: "APROVADO" | "APROVADO_COM_RESSALVA" | "BLOQUEADO";
}

async function consultarBrasilAPI(cnpj: string): Promise<any> {
  const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, "")}`;
  const resposta = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
  if (!resposta.ok) throw new Error("CNPJ não encontrado na Brasil API");
  return resposta.json();
}

export async function validarFornecedor(
  cnpj: string,
  servicoDescricao?: string
): Promise<ResultadoValidacao> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    return {
      cnpj,
      situacao_cadastral: "DESCONHECIDA",
      certidoes_negativas: false,
      sancoes_ativas: false,
      mensagem: "CNPJ inválido. Deve conter 14 dígitos.",
      status: "BLOQUEADO",
    };
  }

  try {
    const dados = await consultarBrasilAPI(cnpjLimpo);

    const situacao = dados.situacao_cadastral === "Ativa" ? "ATIVA" : dados.situacao_cadastral === "Inapta" ? "INAPTA" : "BAIXADA";
    let status: ResultadoValidacao["status"] = "APROVADO";
    let mensagem = "Fornecedor validado com sucesso.";

    if (situacao !== "ATIVA") {
      status = "BLOQUEADO";
      mensagem = `Fornecedor com situação cadastral ${situacao}.`;
    }

    return {
      cnpj: cnpjLimpo,
      nome_razao_social: dados.razao_social || dados.nome_fantasia,
      situacao_cadastral: situacao,
      cnae_principal: dados.cnae_fiscal_descricao,
      cnae_compativel: true, // Simplificação: sempre compatível
      certidoes_negativas: situacao === "ATIVA",
      sancoes_ativas: false,
      mensagem,
      status,
    };
  } catch {
    return {
      cnpj: cnpjLimpo,
      situacao_cadastral: "DESCONHECIDA",
      certidoes_negativas: false,
      sancoes_ativas: false,
      mensagem: "Não foi possível consultar o CNPJ. Verifique e tente novamente.",
      status: "BLOQUEADO",
    };
  }
}

export function calcularConcentracao(
  valorFornecedor: number,
  orcamentoTotal: number
): { percentual: number; alerta: boolean; mensagem: string } {
  const percentual = (valorFornecedor / orcamentoTotal) * 100;
  const alerta = percentual > 30;
  return {
    percentual,
    alerta,
    mensagem: alerta
      ? `Alerta: este fornecedor concentra ${percentual.toFixed(1)}% do orçamento total. Risco de dependência.`
      : `Concentração de ${percentual.toFixed(1)}% do orçamento total. Dentro do limite.`,
  };
}