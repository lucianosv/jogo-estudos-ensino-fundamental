
import { GameParameters } from "@/components/GameSetup";

interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

// Fallbacks específicos e organizados por tema
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
        content: "Em que ano começou a Revolução Francesa?",
        choices: ["1789", "1792", "1804", "1815"],
        answer: "1789",
        word: "igualdade"
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
      }
    ],
    'Brasil Colonial': [
      {
        content: "Qual foi o primeiro produto explorado pelos portugueses no Brasil?",
        choices: ["Ouro", "Açúcar", "Pau-brasil", "Café"],
        answer: "Pau-brasil",
        word: "colônia"
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
      },
      {
        content: "Qual é o maior planeta do Sistema Solar?",
        choices: ["Terra", "Saturno", "Júpiter", "Netuno"],
        answer: "Júpiter",
        word: "espaço"
      },
      {
        content: "O que está no centro do Sistema Solar?",
        choices: ["A Terra", "A Lua", "O Sol", "Júpiter"],
        answer: "O Sol",
        word: "estrela"
      },
      {
        content: "Qual planeta é conhecido como 'Planeta Vermelho'?",
        choices: ["Vênus", "Marte", "Júpiter", "Saturno"],
        answer: "Marte",
        word: "astronomia"
      }
    ],
    'Corpo Humano': [
      {
        content: "Qual órgão é responsável por bombear o sangue?",
        choices: ["Pulmão", "Fígado", "Coração", "Cérebro"],
        answer: "Coração",
        word: "saúde"
      },
      {
        content: "Quantos ossos tem o corpo humano de um adulto?",
        choices: ["186", "206", "226", "246"],
        answer: "206",
        word: "esqueleto"
      }
    ],
    'Plantas': [
      {
        content: "O que as plantas fazem durante a fotossíntese?",
        choices: ["Respiram", "Produzem alimento", "Crescem", "Florescem"],
        answer: "Produzem alimento",
        word: "fotossíntese"
      }
    ],
    'Água': [
      {
        content: "Em que temperatura a água ferve?",
        choices: ["50°C", "75°C", "100°C", "125°C"],
        answer: "100°C",
        word: "ebulição"
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
    ],
    'Frações': [
      {
        content: "Quanto é 1/2 + 1/4?",
        choices: ["2/6", "2/4", "3/4", "1/3"],
        answer: "3/4",
        word: "fração"
      }
    ],
    'Multiplicação': [
      {
        content: "Quanto é 7 x 8?",
        choices: ["54", "56", "58", "60"],
        answer: "56",
        word: "produto"
      }
    ]
  },
  'Português': {
    'Verbos': [
      {
        content: "Qual é o tempo verbal da frase 'Eu estudei ontem'?",
        choices: ["Presente", "Pretérito", "Futuro", "Gerúndio"],
        answer: "Pretérito",
        word: "verbo"
      }
    ],
    'Substantivos': [
      {
        content: "Qual palavra é um substantivo próprio?",
        choices: ["casa", "Maria", "bonito", "correr"],
        answer: "Maria",
        word: "substantivo"
      }
    ]
  },
  'Geografia': {
    'Brasil': [
      {
        content: "Qual é a capital do Brasil?",
        choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte"],
        answer: "Brasília",
        word: "capital"
      }
    ],
    'Continentes': [
      {
        content: "Quantos continentes existem no mundo?",
        choices: ["5", "6", "7", "8"],
        answer: "7",
        word: "continente"
      }
    ]
  }
};

// Melhorar a geração de palavras contextualizadas
const getThematicWords = (subject: string, theme: string): string[] => {
  const fallbacks = thematicFallbacks[subject]?.[theme];
  if (fallbacks && fallbacks.length > 0) {
    return fallbacks.map(q => q.word);
  }
  
  // Palavras específicas por tema quando não há fallback direto
  const themeSpecificWords: Record<string, string[]> = {
    'sistema solar': ['planeta', 'estrela', 'universo', 'espaço', 'órbita'],
    'corpo humano': ['saúde', 'órgão', 'sangue', 'coração', 'cérebro'],
    'plantas': ['fotossíntese', 'folha', 'raiz', 'flor', 'semente'],
    'água': ['líquido', 'vapor', 'gelo', 'chuva', 'rio'],
    'revolução francesa': ['revolução', 'liberdade', 'igualdade', 'frança'],
    'brasil colonial': ['colônia', 'descoberta', 'portugal', 'açúcar'],
    'multiplicação': ['produto', 'resultado', 'tabuada', 'número'],
    'frações': ['fração', 'parte', 'metade', 'quarto']
  };
  
  const themeLower = theme.toLowerCase();
  const specificWords = themeSpecificWords[themeLower];
  if (specificWords) {
    return specificWords;
  }
  
  // Fallback genérico por matéria
  const genericWords: Record<string, string[]> = {
    'História': ['tempo', 'passado', 'descoberta', 'civilização'],
    'Matemática': ['número', 'cálculo', 'resultado', 'operação'],
    'Ciências': ['experimento', 'natureza', 'vida', 'energia'],
    'Português': ['palavra', 'texto', 'frase', 'escrita'],
    'Geografia': ['mundo', 'terra', 'lugar', 'região']
  };
  
  return genericWords[subject] || ['conhecimento', 'aprendizado', 'estudo', 'educação'];
};

export const generateThematicFallback = (gameParams: GameParameters): Question => {
  const { subject, theme, schoolGrade } = gameParams;
  
  console.log(`[FALLBACK] Gerando para: ${subject} - ${theme} (${schoolGrade})`);
  
  // Tentar usar fallback específico do tema
  const thematicQuestions = thematicFallbacks[subject]?.[theme];
  if (thematicQuestions && thematicQuestions.length > 0) {
    const randomQuestion = thematicQuestions[Math.floor(Math.random() * thematicQuestions.length)];
    console.log(`[FALLBACK-SPECIFIC] Usando questão temática para: ${theme}`);
    return randomQuestion;
  }
  
  // Gerar fallback dinâmico mais inteligente
  const words = getThematicWords(subject, theme);
  const word = words[Math.floor(Math.random() * words.length)];
  const grade = parseInt(schoolGrade.charAt(0));
  
  console.log(`[FALLBACK-DYNAMIC] Gerando questão dinâmica para: ${subject} - ${theme}`);
  
  // Fallbacks específicos por tema mesmo sem questões pré-definidas
  if (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta')) {
    return {
      content: `Sistema Solar (${schoolGrade}): Qual é o planeta mais próximo do Sol?`,
      choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
      answer: "Mercúrio",
      word: "planeta"
    };
  }
  
  if (theme.toLowerCase().includes('corpo') || theme.toLowerCase().includes('humano')) {
    return {
      content: `Corpo Humano (${schoolGrade}): Qual órgão bombeia o sangue pelo corpo?`,
      choices: ["Pulmão", "Fígado", "Coração", "Estômago"],
      answer: "Coração",
      word: "coração"
    };
  }
  
  if (subject === 'História') {
    return {
      content: `História - ${theme} (${schoolGrade}): Em que período histórico você está estudando quando falamos sobre ${theme.toLowerCase()}?`,
      choices: ["Idade Antiga", "Idade Média", "Idade Moderna", "Idade Contemporânea"],
      answer: theme.includes('Revolução') ? "Idade Moderna" : "Idade Antiga",
      word
    };
  }
  
  if (subject === 'Matemática') {
    if (grade <= 3) {
      return {
        content: `Matemática - ${theme} (${schoolGrade}): Quanto é 3 + 4?`,
        choices: ["6", "7", "8", "9"],
        answer: "7",
        word
      };
    } else {
      return {
        content: `Matemática - ${theme} (${schoolGrade}): Se você tem 15 objetos e os divide em 3 grupos iguais, quantos objetos terá cada grupo?`,
        choices: ["4", "5", "6", "7"],
        answer: "5",
        word
      };
    }
  }
  
  // Fallback mais genérico mas ainda temático
  return {
    content: `${subject} - ${theme} (${schoolGrade}): Questão sobre ${theme}. Qual é a importância de estudar este tema?`,
    choices: ["Muito importante", "Importante", "Pouco importante", "Não é importante"],
    answer: "Muito importante",
    word
  };
};
