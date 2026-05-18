// src/lib/compliance/fornecedores.ts
// Módulo de pré-validação de fornecedores
// Consulta APIs públicas para verificar situação cadastral, CNAE e sanções

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
  
  // Mock da API da Receita Federal
  async function consultarReceitaFederal(cnpj: string): Promise<{
    nome: string;
    situacao: string;
    cnae: string;
  }> {
    // Simula uma consulta real (futuro: integrar com API oficial)
    const cnpjNumerico = cnpj.replace(/\D/g, "");
    
    // Mock: CNPJs que começam com "00" são inaptos
    if (cnpjNumerico.startsWith("00")) {
      return { nome: "Empresa Inapta Ltda", situacao: "INAPTA", cnae: "00000" };
    }
    // Mock: CNPJs que começam com "99" são baixados
    if (cnpjNumerico.startsWith("99")) {
      return { nome: "Empresa Baixada Ltda", situacao: "BAIXADA", cnae: "00000" };
    }
    
    return {
      nome: "Empresa Ativa Ltda",
      situacao: "ATIVA",
      cnae: "9001902", // CNAE de artes cênicas (exemplo)
    };
  }
  
  // Mock da consulta de certidões (Sintegra, CEIS, CNEP)
  async function consultarCertidoes(cnpj: string): Promise<{
    certidoes_negativas: boolean;
    sancoes_ativas: boolean;
    detalhes_sancoes?: string;
  }> {
    const cnpjNumerico = cnpj.replace(/\D/g, "");
    
    // Mock: CNPJs que começam com "88" têm sanções
    if (cnpjNumerico.startsWith("88")) {
      return {
        certidoes_negativas: false,
        sancoes_ativas: true,
        detalhes_sancoes: "Empresa consta no CEIS (Cadastro de Empresas Inidôneas e Suspensas)",
      };
    }
    
    return { certidoes_negativas: true, sancoes_ativas: false };
  }
  
  // Valida compatibilidade do CNAE com o serviço
  function validarCNAE(cnae: string, servicoDescricao: string): boolean {
    // Mock: sempre retorna compatível (futuro: cruzar tabela CNAE)
    return cnae !== "00000";
  }
  
  // Função principal de validação
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
  
    // Consulta APIs (mock)
    const receita = await consultarReceitaFederal(cnpjLimpo);
    const certidoes = await consultarCertidoes(cnpjLimpo);
    const cnaeCompativel = servicoDescricao
      ? validarCNAE(receita.cnae, servicoDescricao)
      : true;
  
    // Determina o status
    let status: ResultadoValidacao["status"] = "APROVADO";
    let mensagem = "Fornecedor validado com sucesso.";
  
    if (receita.situacao !== "ATIVA") {
      status = "BLOQUEADO";
      mensagem = `Fornecedor com situação cadastral ${receita.situacao}.`;
    } else if (certidoes.sancoes_ativas) {
      status = "BLOQUEADO";
      mensagem = certidoes.detalhes_sancoes || "Fornecedor possui sanções ativas.";
    } else if (!certidoes.certidoes_negativas) {
      status = "APROVADO_COM_RESSALVA";
      mensagem = "Fornecedor aprovado, mas com pendências em certidões.";
    } else if (!cnaeCompativel) {
      status = "BLOQUEADO";
      mensagem = "CNAE do fornecedor incompatível com o serviço descrito.";
    }
  
    return {
      cnpj: cnpjLimpo,
      nome_razao_social: receita.nome,
      situacao_cadastral: receita.situacao as ResultadoValidacao["situacao_cadastral"],
      cnae_principal: receita.cnae,
      cnae_compativel: cnaeCompativel,
      certidoes_negativas: certidoes.certidoes_negativas,
      sancoes_ativas: certidoes.sancoes_ativas,
      detalhes_sancoes: certidoes.detalhes_sancoes,
      mensagem,
      status,
    };
  }
  
  // Calcula concentração de valor para um fornecedor em um projeto
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