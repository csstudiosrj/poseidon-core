// src/lib/ia/gerador.ts
//
// MOTOR DE GERAÇÃO DO POSEIDON v1.0
// Sistema especialista baseado em regras + seeds de alta qualidade.
// Zero dependência de APIs externas de IA.
//
// Estratégia de variabilidade:
// 1. Se houver seeds para o segmento, usa seed aleatório como base.
// 2. Aplica substituições inteligentes dos dados do usuário.
// 3. Fallback: banco interno de templates paramétricos com 5-10 variantes por seção.
// 4. Seleção randômica ponderada (score de qualidade, inicialmente igual).
// 5. Distribuição orçamentária 100% baseada nos tetos da lei.

import {
    ProjetoBase,
    RespostasEntrevista,
    RegrasMecanismo,
    ConteudoGerado,
    ItemOrcamentarioGerado,
    ProjetoSeed,
    SegmentoCultural,
  } from "./tipos";
  
  // ─── SEEDS (import estático) ────────────────────────────────────
  import seedsData from "./seeds.json";
  const seeds: ProjetoSeed[] = seedsData as ProjetoSeed[];
  
  // ─── BANCO DE TEMPLATES INTERNOS ─────────────────────────────────
  // Cada seção tem múltiplas variantes. O motor escolhe uma aleatoriamente.
  // Quanto mais variantes, menor a chance de repetição.
  
  interface TemplateVariante {
    id: string;
    texto: string;
    score: number; // Ajustado com feedback de aprovações (versão 2.0)
  }
  
  interface BancoTemplates {
    [secao: string]: TemplateVariante[];
  }
  
  const bancoTemplates: BancoTemplates = {
    justificativa: [
      {
        id: "just-1",
        score: 1,
        texto:
          "O presente projeto, intitulado {{NOME_PROJETO}}, encontra pleno respaldo no artigo 215 da Constituição Federal de 1988, que assegura a todos o pleno exercício dos direitos culturais e o acesso às fontes da cultura nacional. A proposta visa {{DESCRICAO_CURTA}}, configurando-se como ação estratégica de fomento à cultura brasileira e de fortalecimento das expressões artísticas locais. Em consonância com o Programa Nacional de Apoio à Cultura (PRONAC), o projeto se apresenta como instrumento de democratização do acesso, descentralização das ações culturais e estímulo à cadeia produtiva do setor. A realização desta iniciativa justifica-se pela carência de equipamentos e eventos culturais na região, bem como pela necessidade de valorização dos artistas locais e de formação de plateias.",
      },
      {
        id: "just-2",
        score: 1,
        texto:
          "A proposta cultural ora apresentada — {{NOME_PROJETO}} — fundamenta-se nos preceitos constitucionais que elevam a cultura à condição de direito fundamental (art. 215, CF/88). Trata-se de ação que se alinha às diretrizes do Ministério da Cultura e do PRONAC ao propor {{DESCRICAO_CURTA}}, contribuindo diretamente para o alcance das metas do Plano Nacional de Cultura, em especial no que tange à promoção da diversidade, à universalização do acesso e à descentralização territorial das ações culturais. A lacuna existente na oferta de eventos culturais de qualidade na região-alvo, aliada à potência criativa dos artistas locais, torna este projeto não apenas relevante, mas urgente.",
      },
      {
        id: "just-3",
        score: 1,
        texto:
          "O {{NOME_PROJETO}} constitui-se como resposta concreta à necessidade de interiorização das políticas públicas de cultura, atendendo ao que dispõe a Constituição Federal em seu artigo 215 e a Lei Rouanet (Lei nº 8.313/91). A iniciativa propõe-se a {{DESCRICAO_CURTA}}, promovendo o encontro entre a produção artística de excelência e comunidades historicamente desassistidas de equipamentos culturais. O projeto articula formação, difusão e fruição cultural, pilares da política nacional de cultura, e se insere em um ecossistema de valorização da identidade cultural brasileira.",
      },
      {
        id: "just-4",
        score: 1,
        texto:
          "Em atendimento ao que preconiza o artigo 215 da Constituição da República, que garante o exercício dos direitos culturais, o projeto {{NOME_PROJETO}} nasce do diagnóstico de que a oferta cultural concentra-se nos grandes centros urbanos, deixando à margem populações inteiras. {{DESCRICAO_CURTA}} é a essência desta proposta, que se apoia nos mecanismos de incentivo do PRONAC para viabilizar ações culturais que, de outra forma, não encontrariam lastro financeiro. A relevância social e cultural do projeto manifesta-se na sua capacidade de gerar emprego, renda e bem-estar por meio da arte.",
      },
      {
        id: "just-5",
        score: 1,
        texto:
          "A Lei nº 8.313/91, que instituiu o PRONAC, estabelece como princípios a promoção e o estímulo à regionalização da produção cultural. Nesse contexto, o {{NOME_PROJETO}} se apresenta como iniciativa transformadora ao propor {{DESCRICAO_CURTA}}. A justificativa do projeto repousa sobre três pilares: (i) a democratização do acesso à cultura; (ii) o fomento à economia criativa local; e (iii) a preservação e difusão do patrimônio cultural imaterial. Cada um desses eixos encontra amparo legal e técnico, conforme se demonstrará ao longo deste documento.",
      },
    ],
  
    objetivos: [
      {
        id: "obj-1",
        score: 1,
        texto:
          "Objetivo geral: {{OBJETIVO_GERAL}}.\n\nObjetivos específicos:\n- Realizar {{QUANTIDADE_APRESENTACOES}} apresentações/atividades culturais;\n- Atingir um público estimado de {{PUBLICO_TOTAL}} pessoas;\n- Gerar {{EMPREGOS_DIRETOS}} empregos diretos e {{EMPREGOS_INDIRETOS}} indiretos;\n- Oferecer {{OFICINAS}} ações de formação gratuitas;\n- Garantir acessibilidade plena em todas as atividades;\n- Produzir e distribuir material de divulgação em {{CIDADES}} municípios.",
      },
      {
        id: "obj-2",
        score: 1,
        texto:
          "Objetivo geral: {{OBJETIVO_GERAL}}.\n\nDesdobramentos operacionais:\n1. Estruturar e executar programação cultural com {{QUANTIDADE_APRESENTACOES}} atividades;\n2. Mobilizar e engajar o público-alvo prioritário ({{PUBLICO_ALVO}});\n3. Capacitar {{OFICINAS}} agentes culturais locais por meio de oficinas;\n4. Assegurar condições de acessibilidade universal em todos os espaços;\n5. Mensurar o impacto sociocultural por meio de pesquisa de satisfação;\n6. Prestar contas de forma transparente ao Ministério da Cultura.",
      },
      {
        id: "obj-3",
        score: 1,
        texto:
          "O {{NOME_PROJETO}} persegue os seguintes resultados mensuráveis:\n\nMeta 1: {{QUANTIDADE_APRESENTACOES}} eventos realizados em {{CIDADES}} cidades;\nMeta 2: {{PUBLICO_TOTAL}} espectadores alcançados;\nMeta 3: {{OFICINAS}} horas de formação cultural oferecidas;\nMeta 4: {{EMPREGOS_DIRETOS}} profissionais contratados diretamente;\nMeta 5: 100% das ações com recursos de acessibilidade implementados;\nMeta 6: Relatório final de impacto sociocultural publicado.",
      },
    ],
  
    publico_alvo: [
      {
        id: "pub-1",
        score: 1,
        texto:
          "O projeto destina-se prioritariamente a {{PUBLICO_ALVO}}. A estimativa de público total é de {{PUBLICO_TOTAL}} pessoas ao longo da execução. A estratégia de mobilização inclui parcerias com escolas públicas, associações comunitárias e veículos de comunicação locais, garantindo ampla capilaridade. Serão adotados critérios de gratuidade e reserva de vagas para grupos em situação de vulnerabilidade socioeconômica, conforme diretrizes do Ministério da Cultura.",
      },
      {
        id: "pub-2",
        score: 1,
        texto:
          "O perfil do público beneficiário compreende {{PUBLICO_ALVO}}, com expectativa de alcance de {{PUBLICO_TOTAL}} pessoas. A ação cultural foi desenhada considerando as características demográficas e os hábitos culturais da região, priorizando comunidades com baixo índice de acesso a bens culturais. Serão implementadas ações específicas para atrair e acolher estudantes da rede pública, idosos, pessoas com deficiência e beneficiários de programas sociais.",
      },
      {
        id: "pub-3",
        score: 1,
        texto:
          "A iniciativa alcançará um público diversificado estimado em {{PUBLICO_TOTAL}} espectadores, com foco em {{PUBLICO_ALVO}}. A política de ingressos prevê 100% de gratuidade (ou preços populares), com distribuição antecipada em pontos estratégicos da cidade. O projeto contempla ainda sessões exclusivas para escolas públicas e instituições de assistência social, garantindo que a experiência cultural chegue a quem mais precisa.",
      },
    ],
  
    acessibilidade: [
      {
        id: "aces-1",
        score: 1,
        texto:
          "Todas as atividades do projeto serão realizadas em espaços com acessibilidade universal, conforme a NBR 9050/2020. As ações contarão com: intérpretes de Libras em {{QUANTIDADE_APRESENTACOES}} apresentações; audiodescrição para pessoas com deficiência visual; material de divulgação em braile; rampas e banheiros adaptados; assentos reservados para pessoas com mobilidade reduzida e seus acompanhantes. A equipe de produção será capacitada previamente para o atendimento inclusivo.",
      },
      {
        id: "aces-2",
        score: 1,
        texto:
          "O compromisso com a acessibilidade permeia toda a execução do projeto. Além do atendimento à legislação vigente (Lei nº 10.098/00 e Decreto nº 5.296/04), serão disponibilizados: interpretação em Libras, legendagem descritiva, visita tátil aos elementos cênicos, monitores treinados para atendimento a pessoas com deficiência e comunicação acessível em todas as peças de divulgação. Os locais foram selecionados observando-se rigorosamente os critérios de acessibilidade física.",
      },
    ],
  
    contrapartida: [
      {
        id: "contra-1",
        score: 1,
        texto:
          "Como contrapartida social, o projeto oferecerá {{OFICINAS}} oficinas gratuitas de formação artística para jovens e adultos da rede pública de ensino. As oficinas serão ministradas pelos artistas participantes da programação principal, criando um ambiente de troca e aprendizado. Além disso, serão doados à comunidade equipamentos e materiais permanentes adquiridos para a execução do projeto, totalizando um legado concreto e duradouro.",
      },
      {
        id: "contra-2",
        score: 1,
        texto:
          "A contrapartida social se materializa em três frentes: (i) realização de {{OFICINAS}} atividades formativas gratuitas, abertas à comunidade; (ii) cessão de registros audiovisuais do projeto para o acervo da Secretaria Municipal de Cultura; (iii) distribuição gratuita de ingressos para instituições de ensino público, totalizando {{PUBLICO_TOTAL}} beneficiários diretos. O caráter educativo e multiplicador da proposta amplia seu alcance para além da execução imediata.",
      },
    ],
  
    democratizacao: [
      {
        id: "demo-1",
        score: 1,
        texto:
          "O projeto adota política de democratização do acesso baseada em três pilares: gratuidade total (ou ingressos a preços populares), descentralização geográfica das ações e ações afirmativas para públicos historicamente excluídos. Todas as {{QUANTIDADE_APRESENTACOES}} atividades serão realizadas em espaços públicos ou de fácil acesso por transporte coletivo. A divulgação priorizará canais comunitários e redes sociais, alcançando o público-alvo de forma direta e eficaz.",
      },
      {
        id: "demo-2",
        score: 1,
        texto:
          "Em cumprimento ao artigo 4º da Instrução Normativa MinC nº 1/2017, o projeto implementa medidas efetivas de democratização: 100% das atividades com ingresso gratuito, reserva de 20% dos assentos para idosos e estudantes, distribuição antecipada de ingressos em escolas públicas e CRAS, e realização de sessões descentralizadas em bairros periféricos. A estratégia visa remover barreiras econômicas, geográficas e simbólicas que afastam a população da fruição cultural.",
      },
    ],
  };
  
  // ─── FUNÇÕES AUXILIARES ─────────────────────────────────────────
  
  /** Sorteia um elemento aleatório de um array */
  function aleatorio<T>(lista: T[]): T {
    return lista[Math.floor(Math.random() * lista.length)];
  }
  
  /** Sorteia uma variante ponderada pelo score (maior score = mais chance) */
  function variantePonderada(variantes: TemplateVariante[]): TemplateVariante {
    const totalScore = variantes.reduce((soma, v) => soma + v.score, 0);
    let random = Math.random() * totalScore;
    for (const v of variantes) {
      random -= v.score;
      if (random <= 0) return v;
    }
    return variantes[variantes.length - 1];
  }
  
  /** Substitui placeholders {{CHAVE}} no texto */
  function preencherTemplate(texto: string, variaveis: Record<string, string | number>): string {
    let resultado = texto;
    for (const [chave, valor] of Object.entries(variaveis)) {
      resultado = resultado.replaceAll(`{{${chave}}}`, String(valor));
    }
    return resultado;
  }
  
  /** Busca seeds do segmento correspondente */
  function buscarSeeds(segmento?: SegmentoCultural): ProjetoSeed[] {
    if (!segmento) return [];
    return seeds.filter((s) => s.segmento === segmento);
  }
  
  /** Gera uma seção usando seed (modo 1) */
  function gerarSecaoPorSeed(
    seed: ProjetoSeed,
    secao: string,
    variaveis: Record<string, string | number>
  ): string | null {
    const mapa: Record<string, string> = {
      justificativa: seed.justificativa,
      objetivos: seed.objetivos,
      publico_alvo: seed.publico_alvo,
      acessibilidade: seed.acessibilidade,
      contrapartida: seed.contrapartida,
      democratizacao: seed.democratizacao,
    };
    const textoBase = mapa[secao];
    if (!textoBase) return null;
  
    // Substitui dados do seed pelos dados reais do usuário
    return preencherTemplate(textoBase, {
      NOME_PROJETO: variaveis.NOME_PROJETO || seed.nome,
      DESCRICAO_CURTA: variaveis.DESCRICAO_CURTA || seed.descricao.slice(0, 150),
      OBJETIVO_GERAL: variaveis.OBJETIVO_GERAL || seed.objetivos.split("\n")[0],
      PUBLICO_ALVO: variaveis.PUBLICO_ALVO || seed.publico_alvo,
      PUBLICO_TOTAL: variaveis.PUBLICO_TOTAL || 5000,
      QUANTIDADE_APRESENTACOES: variaveis.QUANTIDADE_APRESENTACOES || 10,
      OFICINAS: variaveis.OFICINAS || 5,
      CIDADES: variaveis.CIDADES || 3,
      EMPREGOS_DIRETOS: variaveis.EMPREGOS_DIRETOS || 30,
      EMPREGOS_INDIRETOS: variaveis.EMPREGOS_INDIRETOS || 50,
      ...variaveis,
    });
  }
  
  /** Gera uma seção usando templates internos (modo 2) */
  function gerarSecaoPorTemplate(
    secao: string,
    variaveis: Record<string, string | number>
  ): string {
    const variantes = bancoTemplates[secao];
    if (!variantes || variantes.length === 0) return "";
  
    const escolhida = variantePonderada(variantes);
    return preencherTemplate(escolhida.texto, variaveis);
  }
  
  /** Distribui o orçamento conforme os tetos da lei */
  function distribuirOrcamento(
    valorTotal: number,
    tetos: TetoOrcamentario[]
  ): ItemOrcamentarioGerado[] {
    if (!tetos || tetos.length === 0) {
      return [
        {
          descricao: "Orçamento total do projeto",
          categoria: "geral",
          valor: valorTotal,
          quantidade: 1,
          justificativa: "Valor integral do projeto",
        },
      ];
    }
  
    const itens: ItemOrcamentarioGerado[] = [];
    let saldo = valorTotal;
  
    for (const teto of tetos) {
      let valor = Math.round((valorTotal * teto.percentual_maximo) / 100);
      if (saldo < valor) valor = saldo;
  
      itens.push({
        descricao: teto.descricao || teto.categoria,
        categoria: teto.categoria,
        valor,
        quantidade: 1,
        justificativa: `Valor calculado com base no teto de ${teto.percentual_maximo}% definido pela legislação`,
      });
  
      saldo -= valor;
    }
  
    // Se sobrar saldo, distribui no maior item
    if (saldo > 0 && itens.length > 0) {
      itens[0].valor += saldo;
    }
  
    return itens;
  }
  
  /** Detecta o segmento cultural a partir do nome e descrição do projeto */
  function detectarSegmento(nome: string, descricao: string): SegmentoCultural {
    const texto = (nome + " " + descricao).toLowerCase();
    const palavrasChave: Record<SegmentoCultural, string[]> = {
      musica: ["música", "musical", "show", "concerto", "orquestra", "banda", "cantor", "festival de música", "rap", "funk", "samba", "mpb"],
      teatro: ["teatro", "peça", "espetáculo teatral", "dramaturgia", "cênico", "ator", "atriz", "palco"],
      danca: ["dança", "dançar", "balé", "coreografia", "performance", "movimento"],
      artes_visuais: ["exposição", "artes visuais", "pintura", "escultura", "fotografia", "galeria", "museu de arte"],
      patrimonio: ["patrimônio", "restauro", "tombamento", "memória", "histórico", "preservação"],
      audiovisual: ["filme", "cinema", "documentário", "curta", "longa", "produção audiovisual", "animação"],
      literatura: ["livro", "literatura", "publicação", "conto", "poesia", "romance", "escritor", "leitura"],
      cultura_popular: ["folclore", "cultura popular", "artesanato", "tradição", "festa popular", "comunidade tradicional"],
      geral: [],
    };
  
    for (const [segmento, palavras] of Object.entries(palavrasChave)) {
      for (const palavra of palavras) {
        if (texto.includes(palavra)) return segmento as SegmentoCultural;
      }
    }
  
    return "geral";
  }
  
  // ─── FUNÇÃO PRINCIPAL ───────────────────────────────────────────
  
  export function gerarConteudoProjeto(
    projeto: ProjetoBase,
    respostas: RespostasEntrevista,
    regras: RegrasMecanismo
  ): {
    conteudo_escrita: ConteudoGerado;
    itens_orcamentarios: ItemOrcamentarioGerado[];
  } {
    const segmento = projeto.segmento || detectarSegmento(projeto.nome_projeto, respostas.descricao);
    const seedsDoSegmento = buscarSeeds(segmento);
  
    // Escolhe seed aleatório se houver
    const seedEscolhido = seedsDoSegmento.length > 0 ? aleatorio(seedsDoSegmento) : null;
  
    const variaveis = {
      NOME_PROJETO: projeto.nome_projeto,
      DESCRICAO_CURTA: respostas.descricao.slice(0, 150),
      OBJETIVO_GERAL: respostas.objetivos,
      PUBLICO_ALVO: respostas.publico,
      PUBLICO_TOTAL: 5000,
      QUANTIDADE_APRESENTACOES: 10,
      OFICINAS: 5,
      CIDADES: respostas.local || 3,
      EMPREGOS_DIRETOS: 30,
      EMPREGOS_INDIRETOS: 50,
      ...respostas,
    };
  
    const secoes = ["justificativa", "objetivos", "publico_alvo", "acessibilidade", "contrapartida", "democratizacao"];
    const conteudo: Record<string, string> = {};
  
    for (const secao of secoes) {
      // Tenta gerar por seed primeiro
      const porSeed = seedEscolhido ? gerarSecaoPorSeed(seedEscolhido, secao, variaveis) : null;
      conteudo[secao] = porSeed || gerarSecaoPorTemplate(secao, variaveis);
    }
  
    // Adiciona a descrição original do usuário como base
    conteudo["descricao_projeto"] = respostas.descricao;
  
    const itens = distribuirOrcamento(respostas.orcamento, regras.tetos);
  
    return {
      conteudo_escrita: conteudo as ConteudoGerado,
      itens_orcamentarios: itens,
    };
  }
  
  // ─── EXPORTAÇÃO DE UTILITÁRIOS (para uso futuro) ─────────────────
  export { bancoTemplates, buscarSeeds, detectarSegmento, distribuirOrcamento };