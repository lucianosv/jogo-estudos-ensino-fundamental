
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

// Palavras secretas contextualizadas por matéria
const getSecretWords = (subject: string): string[] => {
  const words = {
    'Matemática': ['soma', 'número', 'resultado', 'cálculo', 'fórmula'],
    'História': ['tempo', 'passado', 'descoberta', 'civilização', 'época'],
    'Ciências': ['experimento', 'descoberta', 'natureza', 'vida', 'energia'],
    'Português': ['palavra', 'texto', 'história', 'verso', 'escrita'],
    'Geografia': ['mundo', 'terra', 'lugar', 'região', 'mapa']
  };
  return words[subject] || words['Matemática'];
};

// Gerar questões específicas por matéria e série
const generateSubjectQuestion = (gameParams: GameParameters): FallbackContent['question'] => {
  const { subject, schoolGrade, theme } = gameParams;
  const grade = parseInt(schoolGrade.charAt(0));
  const secretWords = getSecretWords(subject);
  const word = secretWords[Math.floor(Math.random() * secretWords.length)];

  if (subject === 'Matemática') {
    if (grade >= 1 && grade <= 3) {
      return {
        content: `${theme}: Se você tem 3 maçãs e ganha mais 2 maçãs, quantas maçãs você tem no total?`,
        choices: ["4 maçãs", "5 maçãs", "6 maçãs", "7 maçãs"],
        answer: "5 maçãs",
        word
      };
    } else if (grade >= 4 && grade <= 6) {
      return {
        content: `${theme}: Em uma aventura, você precisa dividir 24 tesouros igualmente entre 6 amigos. Quantos tesouros cada amigo receberá?`,
        choices: ["3 tesouros", "4 tesouros", "5 tesouros", "6 tesouros"],
        answer: "4 tesouros",
        word
      };
    } else {
      return {
        content: `${theme}: Se x + 5 = 12, qual é o valor de x?`,
        choices: ["5", "6", "7", "8"],
        answer: "7",
        word
      };
    }
  }

  if (subject === 'História') {
    if (grade >= 1 && grade <= 3) {
      return {
        content: `${theme}: Quantos dias tem uma semana?`,
        choices: ["5 dias", "6 dias", "7 dias", "8 dias"],
        answer: "7 dias",
        word
      };
    } else if (grade >= 4 && grade <= 6) {
      return {
        content: `${theme}: Qual foi o primeiro meio de transporte usado pelos portugueses para chegar ao Brasil?`,
        choices: ["Avião", "Caravela", "Trem", "Automóvel"],
        answer: "Caravela",
        word
      };
    } else {
      return {
        content: `${theme}: Em que século ocorreu a Independência do Brasil?`,
        choices: ["Século XVIII", "Século XIX", "Século XX", "Século XVII"],
        answer: "Século XIX",
        word
      };
    }
  }

  if (subject === 'Ciências') {
    if (grade >= 1 && grade <= 3) {
      return {
        content: `${theme}: Quantas patas tem um cachorro?`,
        choices: ["2 patas", "3 patas", "4 patas", "5 patas"],
        answer: "4 patas",
        word
      };
    } else if (grade >= 4 && grade <= 6) {
      return {
        content: `${theme}: Qual é a fonte de energia do nosso planeta?`,
        choices: ["Lua", "Sol", "Estrelas", "Vento"],
        answer: "Sol",
        word
      };
    } else {
      return {
        content: `${theme}: Qual é o processo pelo qual as plantas produzem seu próprio alimento?`,
        choices: ["Respiração", "Fotossíntese", "Digestão", "Transpiração"],
        answer: "Fotossíntese",
        word
      };
    }
  }

  if (subject === 'Português') {
    if (grade >= 1 && grade <= 3) {
      return {
        content: `${theme}: Quantas vogais existem no alfabeto?`,
        choices: ["4", "5", "6", "7"],
        answer: "5",
        word
      };
    } else if (grade >= 4 && grade <= 6) {
      return {
        content: `${theme}: Qual é o plural da palavra "animal"?`,
        choices: ["animais", "animals", "animales", "animaes"],
        answer: "animais",
        word
      };
    } else {
      return {
        content: `${theme}: Qual figura de linguagem está presente na frase "O vento sussurrava segredos"?`,
        choices: ["Metáfora", "Personificação", "Comparação", "Ironia"],
        answer: "Personificação",
        word
      };
    }
  }

  if (subject === 'Geografia') {
    if (grade >= 1 && grade <= 3) {
      return {
        content: `${theme}: Em qual continente fica o Brasil?`,
        choices: ["África", "Ásia", "América do Sul", "Europa"],
        answer: "América do Sul",
        word
      };
    } else if (grade >= 4 && grade <= 6) {
      return {
        content: `${theme}: Qual é a capital do Brasil?`,
        choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
        answer: "Brasília",
        word
      };
    } else {
      return {
        content: `${theme}: Qual é o maior bioma brasileiro?`,
        choices: ["Cerrado", "Amazônia", "Mata Atlântica", "Caatinga"],
        answer: "Amazônia",
        word
      };
    }
  }

  // Fallback genérico
  return {
    content: `${theme}: Questão de ${subject} para ${schoolGrade}: 2 + 2 = ?`,
    choices: ["3", "4", "5", "6"],
    answer: "4",
    word: word
  };
};

// Gerar história específica por matéria
const generateSubjectStory = (gameParams: GameParameters): FallbackContent['story'] => {
  const { subject, theme, schoolGrade } = gameParams;
  
  return {
    title: `Aventura de ${subject}: ${theme}`,
    content: `Bem-vindo à sua jornada de ${subject} com o tema ${theme}! Você está no ${schoolGrade} e está pronto para explorar conceitos fascinantes de ${subject.toLowerCase()}. Esta aventura foi criada especialmente para seu nível de aprendizado, combinando diversão com conhecimento. Prepare-se para desafios interessantes que vão testar e expandir seus conhecimentos sobre ${theme}. Vamos começar esta experiência educativa única!`
  };
};

// Gerar informações de personagem específicas
const generateSubjectCharacterInfo = (gameParams: GameParameters): FallbackContent['character_info'] => {
  const { subject, theme, schoolGrade } = gameParams;
  
  return {
    background_description: `Ambiente educativo de ${subject} com tema ${theme} apropriado para ${schoolGrade}`,
    personality_traits: ["Curioso", "Dedicado", "Inteligente", "Perseverante"],
    special_abilities: [`Conhecimento em ${subject}`, "Resolução de problemas", "Pensamento crítico"],
    motivations: ["Aprender mais", "Superar desafios", "Descobrir novos conhecimentos"]
  };
};

export const generateIntelligentFallback = (
  gameParams: GameParameters, 
  contentType: 'story' | 'question' | 'character_info'
): any => {
  console.log(`Gerando fallback inteligente para ${contentType} - ${gameParams.subject}/${gameParams.theme}/${gameParams.schoolGrade}`);
  
  switch (contentType) {
    case 'story':
      return generateSubjectStory(gameParams);
    case 'question':
      return generateSubjectQuestion(gameParams);
    case 'character_info':
      return generateSubjectCharacterInfo(gameParams);
    default:
      return null;
  }
};

// Função para validar se o conteúdo gerado é adequado
export const validateGeneratedContent = (content: any, gameParams: GameParameters): boolean => {
  if (!content) return false;
  
  // Verificar se não contém referências inadequadas quando não é o tema escolhido
  const inappropriate = ['demon slayer', 'tanjiro', 'nezuko', 'caçador', 'demônio'];
  const contentStr = JSON.stringify(content).toLowerCase();
  const themeStr = gameParams.theme.toLowerCase();
  
  // Se o tema não é relacionado ao Demon Slayer, não deve ter essas referências
  if (!themeStr.includes('demon') && !themeStr.includes('tanjiro')) {
    for (const term of inappropriate) {
      if (contentStr.includes(term)) {
        console.warn(`Conteúdo contém referência inadequada: ${term}`);
        return false;
      }
    }
  }
  
  return true;
};
