// src/lib/ia/portfolio.ts

export interface DadosPortfolio {
    fotos: string[];
    links: string[];
    curriculo: string;
    nome: string;
  }
  
  export function analisarPortfolio(dados: DadosPortfolio): string {
    const secoes: string[] = [];
    
    secoes.push(`# PORTFÓLIO PROFISSIONAL\n\n## ${dados.nome}\n\n`);
    
    if (dados.curriculo) {
      secoes.push(`## Resumo da Carreira\n\n${dados.curriculo}\n\n`);
    }
    
    if (dados.fotos.length > 0) {
      secoes.push(`## Registro de Projetos Anteriores\n\n${dados.fotos.length} fotos anexadas.\n\n`);
    }
    
    if (dados.links.length > 0) {
      secoes.push(`## Links e Referências\n\n${dados.links.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n`);
    }
  
    secoes.push(`---\n*Portfólio gerado automaticamente pelo Poseidon - Tecnologia de Gestão Cultural.*`);
    
    return secoes.join('');
  }
  
  export function gerarPDF(conteudo: string): string {
    return conteudo; // placeholder: a geração real do PDF será feita no servidor
  }