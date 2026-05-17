// Pseudocódigo da função principal
function gerarConteudoProjeto(projeto, respostas, regras) {
    const conteudo = {};
    
    // Para cada seção exigida pela lei...
    for (const secao of regras.secoes_obrigatorias) {
      conteudo[secao.nome] = gerarSecao(secao, respostas, projeto);
    }
    
    // Distribui orçamento
    const itens = distribuirOrcamento(respostas.orcamento, regras.tetos);
    
    return { conteudo, itens };
  }