
import { GameParameters } from "@/components/GameSetup";
import { getRomaQuestionByIndex } from "@/utils/expandedRomaFallbacks";

interface FallbackContent {
  story?: {
    title: string;
    content: string;
  };
  question?: {
    content: string;
    choices: string[];
    answer: string;
    word: string;
  };
  character_info?: {
    background_description: string;
    personality_traits: string[];
    special_abilities: string[];
    motivations: string[];
  };
}

// Gerar questões ESPECÍFICAS por matéria, série e tema COM QUESTIONINDEX
const generateSubjectSpecificQuestion = (gameParams: GameParameters, questionIndex: number = 0): FallbackContent['question'] => {
  const { subject, schoolGrade, theme } = gameParams;
  const grade = parseInt(schoolGrade.charAt(0));

  console.log(`[INTELLIGENT-FALLBACK] Gerando questão ${questionIndex} para ${subject} - ${schoolGrade} - ${theme}`);

  // HISTÓRIA - Roma Antiga com 4 questões DIFERENTES por índice
  if (subject === 'História') {
    if (theme.toLowerCase().includes('roma')) {
      console.log(`[INTELLIGENT-FALLBACK] 🏛️ Usando fallback específico para Roma Antiga - Questão ${questionIndex}`);
      return getRomaQuestionByIndex(schoolGrade, questionIndex);
    }
    
    if (theme.toLowerCase().includes('egito')) {
      return {
        content: `História - Egito Antigo (${schoolGrade}): O que são as pirâmides?`,
        choices: ["Casas", "Túmulos dos faraós", "Templos", "Mercados"],
        answer: "Túmulos dos faraós",
        word: "pirâmide"
      };
    }

    // Fallback genérico para História
    return {
      content: `História - ${theme} (${schoolGrade}): Qual é a importância de estudar história?`,
      choices: ["Entender o passado", "Decorar datas", "Falar latim", "Nenhuma"],
      answer: "Entender o passado",
      word: "passado"
    };
  }

  // CIÊNCIAS
  if (subject === 'Ciências') {
    if (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta')) {
      if (grade >= 1 && grade <= 3) {
        return {
          content: `Ciências - Sistema Solar (${schoolGrade}): Quantos planetas existem no Sistema Solar?`,
          choices: ["6 planetas", "7 planetas", "8 planetas", "9 planetas"],
          answer: "8 planetas",
          word: "planeta"
        };
      } else {
        return {
          content: `Ciências - Sistema Solar (${schoolGrade}): Qual é o maior planeta do Sistema Solar?`,
          choices: ["Terra", "Marte", "Júpiter", "Saturno"],
          answer: "Júpiter",
          word: "gigante"
        };
      }
    }

    if (theme.toLowerCase().includes('animal')) {
      return {
        content: `Ciências - Animais (${schoolGrade}): Como os peixes respiram?`,
        choices: ["Com pulmões", "Com guelras", "Com pele", "Com nadadeiras"],
        answer: "Com guelras",
        word: "respiração"
      };
    }

    return {
      content: `Ciências - ${theme} (${schoolGrade}): O que estudamos em Ciências?`,
      choices: ["Apenas plantas", "Apenas animais", "A natureza", "Apenas o corpo"],
      answer: "A natureza",
      word: "natureza"
    };
  }

  // PORTUGUÊS
  if (subject === 'Português') {
    if (grade >= 1 && grade <= 3) {
      return {
        content: `Português - ${theme} (${schoolGrade}): Quantas vogais tem o alfabeto?`,
        choices: ["4 vogais", "5 vogais", "6 vogais", "7 vogais"],
        answer: "5 vogais",
        word: "vogal"
      };
    } else {
      return {
        content: `Português - ${theme} (${schoolGrade}): O que é um substantivo?`,
        choices: ["Palavra que indica ação", "Palavra que dá nome", "Palavra que liga", "Palavra que descreve"],
        answer: "Palavra que dá nome",
        word: "substantivo"
      };
    }
  }

  // GEOGRAFIA
  if (subject === 'Geografia') {
    if (theme.toLowerCase().includes('brasil')) {
      return {
        content: `Geografia - Brasil (${schoolGrade}): Qual é a capital do Brasil?`,
        choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
        answer: "Brasília",
        word: "capital"
      };
    }

    return {
      content: `Geografia - ${theme} (${schoolGrade}): O que estudamos em Geografia?`,
      choices: ["Apenas mapas", "Lugares e pessoas", "Apenas rios", "Apenas países"],
      answer: "Lugares e pessoas",
      word: "lugar"
    };
  }

  // MATEMÁTICA - só como último recurso e respeitando o tema
  if (subject === 'Matemática') {
    const idx = questionIndex ?? 0;
    if (grade >= 1 && grade <= 3) {
      const options = [
        {
          content: `Matemática - ${theme} (${schoolGrade}): Quanto é 2 + 3?`,
          choices: ["4", "5", "6", "7"],
          answer: "5",
          word: "soma"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): Se você tem 7 balas e dá 2, com quantas fica?`,
          choices: ["3", "4", "5", "6"],
          answer: "5",
          word: "tirar"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): Complete: 9 − 4 = ?`,
          choices: ["3", "4", "5", "6"],
          answer: "5",
          word: "subtração"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): Conte: 3 + 2 = ?`,
          choices: ["4", "5", "6", "7"],
          answer: "5",
          word: "contar"
        }
      ];
      return options[idx % options.length];
    } else if (grade >= 4 && grade <= 6) {
      const options = [
        {
          content: `Matemática - ${theme} (${schoolGrade}): Quanto é 6 × 4?`,
          choices: ["20", "22", "24", "26"],
          answer: "24",
          word: "produto"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): Resolva 45 ÷ 5`,
          choices: ["7", "8", "9", "10"],
          answer: "9",
          word: "divisão"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): 18 + 27 = ?`,
          choices: ["43", "44", "45", "46"],
          answer: "45",
          word: "soma"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): 100 − 37 = ?`,
          choices: ["61", "62", "63", "64"],
          answer: "63",
          word: "subtração"
        }
      ];
      return options[idx % options.length];
    } else {
      const options = [
        {
          content: `Matemática - ${theme} (${schoolGrade}): Se x + 5 = 12, x = ?`,
          choices: ["5", "6", "7", "8"],
          answer: "7",
          word: "incógnita"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): Resolva 3y = 21. y = ?`,
          choices: ["5", "6", "7", "8"],
          answer: "7",
          word: "variável"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): 2a − 4 = 10. a = ?`,
          choices: ["5", "6", "7", "8"],
          answer: "7",
          word: "equação"
        },
        {
          content: `Matemática - ${theme} (${schoolGrade}): Em uma expressão, o que representa 'x'?`,
          choices: ["Número conhecido", "Operação", "Número desconhecido", "Fração"],
          answer: "Número desconhecido",
          word: "desconhecido"
        }
      ];
      return options[idx % options.length];
    }
  }

  // Fallback final respeitando a matéria selecionada
  return {
    content: `${subject} - ${theme} (${schoolGrade}): Questão sobre ${theme} em ${subject}`,
    choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
    answer: "Opção A",
    word: "conhecimento"
  };
};

// Gerar história específica por matéria e tema
const generateSubjectSpecificStory = (gameParams: GameParameters): FallbackContent['story'] => {
  const { subject, theme, schoolGrade } = gameParams;

  const makeAdventure = (title: string, hook: string, beats: string[]): FallbackContent['story'] => ({
    title,
    content: [
      `Você está prestes a começar uma missão em ${subject.toLowerCase()}!`,
      hook,
      '',
      `Sua aventura:`,
      ...beats.map((b, i) => `${i + 1}. ${b}`),
      '',
      'Complete os desafios, colete as palavras secretas e desbloqueie o final desta missão!',
    ].join('\n')
  });

  const lowerTheme = theme.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  if (lowerSubject === 'história') {
    if (lowerTheme.includes('roma')) {
      return makeAdventure(
        'Jornada Histórica: Segredos de Roma Antiga',
        'Você viaja no tempo para Roma Antiga. Nas ruas movimentadas, sente o cheiro de pão recém-assado e ouve o som distante de um gladiador treinando. Uma pergamina misteriosa revela uma missão: encontrar três pistas escondidas pela cidade para decifrar um segredo do Senado.',
        [
          'Investigue o Coliseu para entender por que ele era tão importante para os romanos.',
          'Descubra o caminho da água nos aquedutos e como Roma se mantinha abastecida.',
          'Converse com um mercador no fórum e aprenda sobre as leis e moedas romanas.',
          'Retorne ao Senado para decifrar a mensagem final com seu novo conhecimento.'
        ]
      );
    }

    return makeAdventure(
      `Jornada Histórica: ${theme}`,
      `Você acorda em uma época distante e precisa registrar os fatos mais importantes sobre ${theme.toLowerCase()}. Um historiador te presenteia com um caderno e uma dica: cada resposta correta revela uma nova pista sobre o passado.`,
      [
        'Localize os personagens-chave e entenda suas motivações.',
        'Visite um local histórico e identifique seus símbolos e seu propósito.',
        'Colete informações sobre cultura, economia e sociedade da época.',
        'Monte a linha do tempo e apresente sua conclusão histórica.'
      ]
    );
  }

  if (lowerSubject === 'ciências') {
    if (lowerTheme.includes('sistema solar') || lowerTheme.includes('solar') || lowerTheme.includes('planeta')) {
      return makeAdventure(
        'Expedição Científica: A Missão do Sistema Solar',
        'Você entra a bordo da nave Argos-6. Seu objetivo é visitar mundos diferentes para coletar dados essenciais. Cada acerto energiza os motores; cada erro exige recalibrar os instrumentos.',
        [
          'Estabeleça órbita ao redor de um planeta gasoso e identifique suas camadas.',
          'Pouse em uma lua gelada e descubra pistas sobre a presença de água.',
          'Analise a gravidade de um planeta rochoso e registre o dia e a noite.',
          'Retorne à base com um relatório que explique por que cada mundo é único.'
        ]
      );
    }

    return makeAdventure(
      `Missão Científica: ${theme}`,
      `Você recebeu um crachá de pesquisador e um laboratório portátil. Seu time precisa desvendar um mistério de ${theme.toLowerCase()}. Cada hipótese correta libera um novo equipamento para a investigação.`,
      [
        'Observe o fenômeno e descreva o que consegue medir (tempo, massa, temperatura).',
        'Forme hipóteses e compare com conhecimentos anteriores.',
        'Realize um experimento mental ou prático para testar suas ideias.',
        'Explique a conclusão usando termos científicos do seu ano escolar.'
      ]
    );
  }

  if (lowerSubject === 'geografia') {
    return makeAdventure(
      `Rota Geográfica: ${theme}`,
      `Você abre um mapa com coordenadas enigmáticas. Sua missão é traçar uma rota segura e entender as paisagens de ${theme.toLowerCase()}. Cada acerto revela um novo ponto no mapa.`,
      [
        'Identifique o tipo de relevo dominante e seu impacto nas pessoas.',
        'Reconheça o clima e explique como ele influencia a vegetação e a vida local.',
        'Localize recursos hídricos e avalie sua importância para a região.',
        'Descreva como as pessoas vivem e trabalham nesse espaço geográfico.'
      ]
    );
  }

  if (lowerSubject === 'português' || lowerSubject === 'portugues') {
    return makeAdventure(
      `Aventura das Palavras: ${theme}`,
      `Você entra na Biblioteca Encantada, onde as palavras ganham vida. O Guardião dos Textos te desafia a decifrar segredos linguísticos sobre ${theme.toLowerCase()}.`,
      [
        'Classifique corretamente termos e identifique a função de cada um na frase.',
        'Reescreva um enigma substituindo palavras por sinônimos adequados.',
        'Corrija um texto curto mantendo coesão e coerência.',
        'Crie um mini-parágrafo aplicando as regras estudadas.'
      ]
    );
  }

  if (lowerSubject === 'matemática' || lowerSubject === 'matematica') {
    return makeAdventure(
      `Desafio Matemático: ${theme}`,
      `O Mestre dos Números propõe uma trilha de desafios sobre ${theme.toLowerCase()}. A cada acerto, uma nova parte do mapa é revelada até você encontrar o tesouro lógico.`,
      [
        'Resolva um problema simples para destrancar o primeiro cadeado.',
        'Analise um padrão e explique a regra que o governa.',
        'Escolha a operação correta para um problema de situação real.',
        'Apresente a resposta final justificando cada etapa do raciocínio.'
      ]
    );
  }

  // Genérico (qualquer matéria)
  return makeAdventure(
    `${subject}: A Missão de ${theme}`,
    `Você recebe um convite misterioso: concluir uma missão sobre ${theme.toLowerCase()} no ${schoolGrade}. Cada pista correta revela a próxima parte da história.`,
    [
      'Descubra os conceitos fundamentais ligados ao tema.',
      'Conecte o tema com exemplos do dia a dia.',
      'Resolva um desafio aplicado para provar seu entendimento.',
      'Reúna tudo em uma conclusão que finalize a aventura.'
    ]
  );
};

// Gerar informações de personagem específicas
const generateSubjectSpecificCharacterInfo = (gameParams: GameParameters): FallbackContent['character_info'] => {
  const { subject, theme, schoolGrade } = gameParams;
  
  return {
    background_description: `Ambiente educativo de ${subject} focado em ${theme} para estudantes do ${schoolGrade}`,
    personality_traits: ["Curioso sobre " + theme, "Dedicado aos estudos", "Inteligente", "Perseverante"],
    special_abilities: [`Conhecimento em ${subject}`, `Especialista em ${theme}`, "Pensamento crítico"],
    motivations: [`Dominar ${theme}`, "Superar desafios educativos", "Compartilhar conhecimento"]
  };
};

export const generateIntelligentFallback = (
  gameParams: GameParameters, 
  contentType: 'story' | 'question' | 'character_info',
  questionIndex: number = 0
): any => {
  console.log(`[INTELLIGENT-FALLBACK] Gerando ${contentType} (índice: ${questionIndex}) para ${gameParams.subject}/${gameParams.theme}/${gameParams.schoolGrade}`);
  
  switch (contentType) {
    case 'story':
      return generateSubjectSpecificStory(gameParams);
    case 'question':
      return generateSubjectSpecificQuestion(gameParams, questionIndex);
    case 'character_info':
      return generateSubjectSpecificCharacterInfo(gameParams);
    default:
      return null;
  }
};

// Função para validar se o conteúdo gerado é adequado
export const validateGeneratedContent = (content: any, gameParams: GameParameters): boolean => {
  if (!content) return false;

  // Try to extract human-readable text
  const contentStr = JSON.stringify(content).toLowerCase();
  const text = (
    (typeof content === 'string' && content) ||
    (typeof content?.content === 'string' && content.content) ||
    contentStr
  ).toLowerCase();

  const { subject, theme } = gameParams;
  const subjectLower = subject.toLowerCase();

  // Minimal structural checks for questions
  const looksLikeQuestion = typeof (content as any)?.content === 'string';
  const hasChoices = Array.isArray((content as any)?.choices) && (content as any).choices.length === 4;
  const hasAnswer = typeof (content as any)?.answer === 'string' && (content as any).answer.length > 0;

  // If it looks like a question but lacks structure, reject
  if (looksLikeQuestion && (!hasChoices || !hasAnswer)) {
    return false;
  }

  // Subject-specific allow/deny keywords
  const mathAllow = [
    'matemática','quanto é','soma','subtração','multiplicação','divisão','calcular','número','resultado','operações','equação','x '
  ];
  const mathDeny = ['roma', 'história', 'faraó', 'pirâmide', 'planeta', 'sistema solar', 'capital', 'substantivo', 'vogal'];

  const histAllow = ['história','romano','roma','egito','civilização','imperador','coliseu','gladiador','antigo'];
  const histDenyMathPatterns = [/\bquanto\s+é\b/, /\d+\s*[+\-×x*÷/]\s*\d+/];

  const sciAllow = ['ciências','planeta','sistema solar','gravidade','órbita','coração','pulmões','respiração','neurônio','astronomia','animal','plantas','energia','dinossauro','dinossauros','fóssil','fósseis'];
  const sciDenyMath = [/\bquanto\s+é\b/, /\d+\s*[+\-×x*÷/]\s*\d+/];

  const geoAllow = ['geografia','mapa','capital','país','continente','coordenada','latitude','longitude','rio','montanha','clima'];
  const geoDenyMath = [/\bquanto\s+é\b/, /\d+\s*[+\-×x*÷/]\s*\d+/];

  const porAllow = ['português','gramática','substantivo','verbo','vogal','consoante','texto','sílaba','ortografia'];
  const porDenyMath = [/\bquanto\s+é\b/, /\d+\s*[+\-×x*÷/]\s*\d+/];

  const includesAny = (arr: string[]) => arr.some(k => text.includes(k));
  const matchesAny = (arr: RegExp[]) => arr.some(rx => rx.test(text));

  if (subjectLower === 'matemática') {
    if (mathDeny.some(k => text.includes(k))) return false;
    if (!includesAny(mathAllow)) return false;
  } else if (subjectLower === 'história') {
    if (matchesAny(histDenyMathPatterns)) return false;
    if (!includesAny(histAllow)) return false;
  } else if (subjectLower === 'ciências') {
    if (matchesAny(sciDenyMath)) return false;
    if (!includesAny(sciAllow)) return false;
  } else if (subjectLower === 'geografia') {
    if (matchesAny(geoDenyMath)) return false;
    if (!includesAny(geoAllow)) return false;
  } else if (subjectLower === 'português' || subjectLower === 'portugues') {
    if (matchesAny(porDenyMath)) return false;
    if (!includesAny(porAllow)) return false;
  }

  return true;
};
