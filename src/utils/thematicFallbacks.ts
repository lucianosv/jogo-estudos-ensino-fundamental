
import { GameParameters } from "@/components/GameSetup";

interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

// Fallbacks específicos por tema dentro de cada matéria
const thematicFallbacks: Record<string, Record<string, Question[]>> = {
  'História': {
    'Revolução Francesa': [
      {
        content: "Qual foi o símbolo principal da Revolução Francesa usado para executar os condenados?",
        choices: ["Guilhotina", "Forca", "Cadeira Elétrica", "Fogueira"],
        answer: "Guilhotina",
        word: "revolução"
      },
      {
        content: "Qual rei francês foi executado durante a Revolução Francesa?",
        choices: ["Luís XIV", "Luís XV", "Luís XVI", "Luís XVII"],
        answer: "Luís XVI",
        word: "liberdade"
      },
      {
        content: "Qual foi o lema da Revolução Francesa?",
        choices: ["Liberdade, Igualdade, Fraternidade", "Deus, Pátria, Família", "Ordem e Progresso", "União e Força"],
        answer: "Liberdade, Igualdade, Fraternidade",
        word: "igualdade"
      },
      {
        content: "Em que ano começou a Revolução Francesa?",
        choices: ["1789", "1792", "1804", "1815"],
        answer: "1789",
        word: "fraternidade"
      }
    ],
    'Grandes Navegações': [
      {
        content: "Qual embarcação foi mais utilizada pelos portugueses nas Grandes Navegações?",
        choices: ["Caravela", "Galeão", "Nau", "Fragata"],
        answer: "Caravela",
        word: "navegação"
      },
      {
        content: "Quem descobriu o caminho marítimo para as Índias?",
        choices: ["Vasco da Gama", "Pedro Álvares Cabral", "Bartolomeu Dias", "Cristóvão Colombo"],
        answer: "Vasco da Gama",
        word: "descoberta"
      },
      {
        content: "Qual instrumento de navegação foi essencial nas Grandes Navegações?",
        choices: ["Bússola", "Telescópio", "Sextante", "Astrolábio"],
        answer: "Bússola",
        word: "oceano"
      },
      {
        content: "Em que século ocorreram as Grandes Navegações?",
        choices: ["Século XIV", "Século XV", "Século XVI", "Século XVII"],
        answer: "Século XV",
        word: "expedição"
      }
    ]
  },
  'Matemática': {
    'Álgebra': [
      {
        content: "Se x + 5 = 12, qual é o valor de x?",
        choices: ["5", "6", "7", "8"],
        answer: "7",
        word: "equação"
      },
      {
        content: "Qual é o resultado de 2x quando x = 4?",
        choices: ["6", "8", "10", "12"],
        answer: "8",
        word: "variável"
      }
    ],
    'Geometria': [
      {
        content: "Quantos lados tem um triângulo?",
        choices: ["2", "3", "4", "5"],
        answer: "3",
        word: "forma"
      },
      {
        content: "Qual é a soma dos ângulos internos de um triângulo?",
        choices: ["90°", "180°", "270°", "360°"],
        answer: "180°",
        word: "ângulo"
      }
    ]
  },
  'Ciências': {
    'Sistema Solar': [
      {
        content: "Qual é o planeta mais próximo do Sol?",
        choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
        answer: "Mercúrio",
        word: "planeta"
      },
      {
        content: "Quantos planetas existem em nosso Sistema Solar?",
        choices: ["7", "8", "9", "10"],
        answer: "8",
        word: "universo"
      }
    ],
    'Corpo Humano': [
      {
        content: "Qual órgão é responsável por bombear o sangue?",
        choices: ["Pulmão", "Fígado", "Coração", "Cérebro"],
        answer: "Coração",
        word: "saúde"
      }
    ]
  }
};

// Palavras secretas contextualizadas por tema
const getThematicWords = (subject: string, theme: string): string[] => {
  const fallbacks = thematicFallbacks[subject]?.[theme];
  if (fallbacks && fallbacks.length > 0) {
    return fallbacks.map(q => q.word);
  }
  
  // Fallback genérico por matéria
  const genericWords = {
    'História': ['tempo', 'passado', 'descoberta', 'civilização'],
    'Matemática': ['número', 'cálculo', 'resultado', 'fórmula'],
    'Ciências': ['experimento', 'natureza', 'vida', 'energia'],
    'Português': ['palavra', 'texto', 'verso', 'escrita'],
    'Geografia': ['mundo', 'terra', 'lugar', 'região']
  };
  
  return genericWords[subject] || genericWords['Matemática'];
};

export const generateThematicFallback = (gameParams: GameParameters): Question => {
  const { subject, theme, schoolGrade } = gameParams;
  
  console.log(`Gerando fallback temático para: ${subject} - ${theme}`);
  
  // Tentar usar fallback específico do tema
  const thematicQuestions = thematicFallbacks[subject]?.[theme];
  if (thematicQuestions && thematicQuestions.length > 0) {
    const randomQuestion = thematicQuestions[Math.floor(Math.random() * thematicQuestions.length)];
    console.log(`Usando fallback temático específico: ${theme}`);
    return randomQuestion;
  }
  
  // Fallback genérico adaptado ao tema
  const words = getThematicWords(subject, theme);
  const word = words[Math.floor(Math.random() * words.length)];
  const grade = parseInt(schoolGrade.charAt(0));
  
  console.log(`Usando fallback genérico adaptado para: ${subject} - ${theme}`);
  
  if (subject === 'História') {
    return {
      content: `${theme}: Em que período histórico você está estudando quando falamos sobre ${theme.toLowerCase()}?`,
      choices: ["Idade Antiga", "Idade Média", "Idade Moderna", "Idade Contemporânea"],
      answer: theme.includes('Revolução Francesa') ? "Idade Moderna" : "Idade Moderna",
      word
    };
  }
  
  if (subject === 'Matemática') {
    if (grade <= 3) {
      return {
        content: `${theme}: Quanto é 2 + 3?`,
        choices: ["4", "5", "6", "7"],
        answer: "5",
        word
      };
    } else {
      return {
        content: `${theme}: Se você tem 12 objetos e os divide em 3 grupos iguais, quantos objetos terá cada grupo?`,
        choices: ["3", "4", "5", "6"],
        answer: "4",
        word
      };
    }
  }
  
  // Fallback mais genérico
  return {
    content: `${theme}: Questão sobre ${subject} relacionada ao tema ${theme}. Quanto é 1 + 1?`,
    choices: ["1", "2", "3", "4"],
    answer: "2",
    word
  };
};
