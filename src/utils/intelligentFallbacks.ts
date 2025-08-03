
import { GameParameters } from "@/components/GameSetup";

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

// Gerar questões ESPECÍFICAS por matéria, série e tema
const generateSubjectSpecificQuestion = (gameParams: GameParameters): FallbackContent['question'] => {
  const { subject, schoolGrade, theme } = gameParams;
  const grade = parseInt(schoolGrade.charAt(0));

  console.log(`[INTELLIGENT-FALLBACK] Gerando para ${subject} - ${schoolGrade} - ${theme}`);

  // HISTÓRIA
  if (subject === 'História') {
    if (theme.toLowerCase().includes('roma')) {
      if (grade >= 1 && grade <= 3) {
        return {
          content: `História - Roma Antiga (${schoolGrade}): Onde ficava o Império Romano?`,
          choices: ["Na América", "Na Europa", "Na África", "Na Ásia"],
          answer: "Na Europa",
          word: "império"
        };
      } else if (grade >= 4 && grade <= 6) {
        return {
          content: `História - Roma Antiga (${schoolGrade}): Qual era a capital do Império Romano?`,
          choices: ["Atenas", "Roma", "Esparta", "Alexandria"],
          answer: "Roma",
          word: "capital"
        };
      } else {
        return {
          content: `História - Roma Antiga (${schoolGrade}): Em que século começou o Império Romano?`,
          choices: ["Século I a.C.", "Século I d.C.", "Século II d.C.", "Século III d.C."],
          answer: "Século I a.C.",
          word: "século"
        };
      }
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
    if (grade >= 1 && grade <= 3) {
      return {
        content: `Matemática - ${theme} (${schoolGrade}): Quanto é 2 + 3?`,
        choices: ["4", "5", "6", "7"],
        answer: "5",
        word: "soma"
      };
    } else if (grade >= 4 && grade <= 6) {
      return {
        content: `Matemática - ${theme} (${schoolGrade}): Quanto é 6 × 4?`,
        choices: ["20", "22", "24", "26"],
        answer: "24",
        word: "produto"
      };
    } else {
      return {
        content: `Matemática - ${theme} (${schoolGrade}): Se x + 5 = 12, quanto vale x?`,
        choices: ["5", "6", "7", "8"],
        answer: "7",
        word: "incógnita"
      };
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
  
  if (subject === 'História' && theme.toLowerCase().includes('roma')) {
    return {
      title: `História: Roma Antiga`,
      content: `Era uma vez, há mais de 2000 anos, existiu um dos maiores impérios da história: Roma! Começou como uma pequena cidade na península italiana e cresceu até dominar grande parte do mundo conhecido. Os romanos eram famosos por suas estradas bem construídas, seus aquedutos que levavam água limpa para as cidades, e seus soldados corajosos chamados legionários. Eles construíram o Coliseu, onde gladiadores lutavam, e criaram leis que ainda influenciam nosso mundo hoje. A cidade de Roma era governada por imperadores poderosos como Júlio César. Estudar Roma Antiga nos ensina sobre coragem, organização e como uma civilização pode deixar sua marca na história para sempre!`
    };
  }
  
  if (subject === 'Ciências' && (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta'))) {
    return {
      title: `Ciências: Sistema Solar`,
      content: `Era uma vez uma família muito especial chamada Sistema Solar! No centro vivia o Sr. Sol, uma estrela brilhante e quente que iluminava todos ao seu redor. Seus oito filhos planetas giravam em círculos perfeitos ao seu redor: Mercúrio o mais rápido, Vênus a mais quente, Terra nossa casa azul e verde, Marte o vermelho, Júpiter o gigante, Saturno com seus anéis brilhantes, Urano deitado de lado, e Netuno o mais distante. Cada planeta tinha suas próprias características especiais, mas todos seguiam as regras da gravidade, dançando eternamente ao redor do Sol em uma valsa cósmica perfeita!`
    };
  }
  
  return {
    title: `${subject}: ${theme}`,
    content: `Era uma vez um estudante curioso que descobriu o fascinante mundo de ${theme} em ${subject}. Durante sua jornada de aprendizado no ${schoolGrade}, ele encontrou conceitos interessantes que mudaram sua forma de ver o mundo. Com a ajuda de professores dedicados e muito estudo, conseguiu dominar os segredos de ${theme}. Sua aventura mostrou que aprender é sempre uma experiência mágica, cheia de descobertas surpreendentes que nos tornam pessoas mais sábias e preparadas para enfrentar os desafios da vida com conhecimento e confiança!`
  };
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
  contentType: 'story' | 'question' | 'character_info'
): any => {
  console.log(`[INTELLIGENT-FALLBACK] Gerando ${contentType} para ${gameParams.subject}/${gameParams.theme}/${gameParams.schoolGrade}`);
  
  switch (contentType) {
    case 'story':
      return generateSubjectSpecificStory(gameParams);
    case 'question':
      return generateSubjectSpecificQuestion(gameParams);
    case 'character_info':
      return generateSubjectSpecificCharacterInfo(gameParams);
    default:
      return null;
  }
};

// Função para validar se o conteúdo gerado é adequado
export const validateGeneratedContent = (content: any, gameParams: GameParameters): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const { subject, theme } = gameParams;
  
  // Verificar se o conteúdo é realmente sobre a matéria selecionada
  const subjectLower = subject.toLowerCase();
  
  // Para História, não deve ter questões de matemática
  if (subjectLower === 'história' && (contentStr.includes('2 + 2') || contentStr.includes('soma') || contentStr.includes('multiplicação'))) {
    console.warn(`[VALIDATION] Conteúdo de História contém matemática inadequadamente`);
    return false;
  }
  
  // Para Ciências, deve ser sobre ciência
  if (subjectLower === 'ciências' && contentStr.includes('quanto é') && contentStr.includes(' + ')) {
    console.warn(`[VALIDATION] Conteúdo de Ciências contém matemática inadequadamente`);
    return false;
  }
  
  return true;
};
