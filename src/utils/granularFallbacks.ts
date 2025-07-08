
import { GameParameters } from "@/components/GameSetup";

interface GranularQuestion {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

interface GranularStory {
  title: string;
  content: string;
}

// Fallbacks organizados por Matéria > Série > Tema
const granularFallbacks = {
  'Matemática': {
    '1º ano': {
      'Números': {
        questions: [
          {
            content: "Contando com os dedos: Se você levanta 2 dedos de uma mão e 3 da outra, quantos dedos você tem levantados?",
            choices: ["4 dedos", "5 dedos", "6 dedos", "7 dedos"],
            answer: "5 dedos",
            word: "soma"
          },
          {
            content: "Quantos objetos há na figura: 🍎🍎🍎?",
            choices: ["1 objeto", "2 objetos", "3 objetos", "4 objetos"],
            answer: "3 objetos",
            word: "contar"
          },
          {
            content: "Se você tem 4 brinquedos e ganha mais 1, quantos brinquedos você tem no total?",
            choices: ["3 brinquedos", "4 brinquedos", "5 brinquedos", "6 brinquedos"],
            answer: "5 brinquedos",
            word: "total"
          },
          {
            content: "Qual é o número que vem depois do 7?",
            choices: ["6", "7", "8", "9"],
            answer: "8",
            word: "sequência"
          }
        ],
        story: {
          title: "A Aventura dos Números",
          content: "Era uma vez uma criança curiosa que adorava contar tudo ao seu redor. Ela contava os brinquedos, os dedos, as estrelas no céu. Um dia, descobriu que os números tinham poderes mágicos e podia usá-los para resolver problemas do dia a dia. Que aventura matemática incrível a esperava!"
        }
      }
    },
    '4º ano': {
      'Multiplicação': {
        questions: [
          {
            content: "Na feira, uma banca vende maçãs em sacos de 6 unidades. Se você comprar 4 sacos, quantas maçãs terá?",
            choices: ["18 maçãs", "20 maçãs", "24 maçãs", "26 maçãs"],
            answer: "24 maçãs",
            word: "produto"
          },
          {
            content: "Uma caixa tem 8 lápis. Quantos lápis há em 3 caixas?",
            choices: ["20 lápis", "22 lápis", "24 lápis", "26 lápis"],
            answer: "24 lápis",
            word: "multiplicar"
          },
          {
            content: "Se cada mesa da sala tem 4 cadeiras e há 5 mesas, quantas cadeiras há no total?",
            choices: ["16 cadeiras", "18 cadeiras", "20 cadeiras", "22 cadeiras"],
            answer: "20 cadeiras",
            word: "conjunto"
          },
          {
            content: "João tem 7 potes com 3 biscoitos cada. Quantos biscoitos ele tem?",
            choices: ["19 biscoitos", "20 biscoitos", "21 biscoitos", "22 biscoitos"],
            answer: "21 biscoitos",
            word: "grupos"
          }
        ],
        story: {
          title: "O Mercado Matemático",
          content: "No mercado da cidade, os vendedores usavam a multiplicação para calcular rapidamente quantos produtos vendiam. Ana descobriu que podia ajudar sua avó no mercado usando seus conhecimentos de multiplicação. Cada cálculo correto a aproximava de se tornar a melhor ajudante da feira!"
        }
      }
    },
    '7º ano': {
      'Álgebra': {
        questions: [
          {
            content: "Se em uma equação x + 8 = 15, qual é o valor de x?",
            choices: ["5", "6", "7", "8"],
            answer: "7",
            word: "incógnita"
          },
          {
            content: "Resolva: 2y = 14. Qual é o valor de y?",
            choices: ["6", "7", "8", "9"],
            answer: "7",
            word: "variável"
          },
          {
            content: "Se a + 12 = 20, qual é o valor de a?",
            choices: ["6", "7", "8", "9"],
            answer: "8",
            word: "equação"
          },
          {
            content: "Em 3z - 6 = 9, qual é o valor de z?",
            choices: ["3", "4", "5", "6"],
            answer: "5",
            word: "solução"
          }
        ],
        story: {
          title: "O Mistério das Incógnitas",
          content: "No laboratório matemático, o professor apresentou um desafio: encontrar valores desconhecidos usando pistas numéricas. Cada equação era como um enigma a ser desvendado, onde o X representava um tesouro escondido esperando para ser descoberto através da lógica e do raciocínio."
        }
      }
    }
  },
  'Ciências': {
    '3º ano': {
      'Sistema Solar': {
        questions: [
          {
            content: "Qual é a estrela mais importante para a vida na Terra?",
            choices: ["A Lua", "O Sol", "As estrelas", "Os cometas"],
            answer: "O Sol",
            word: "estrela"
          },
          {
            content: "Quantos planetas existem no Sistema Solar?",
            choices: ["7 planetas", "8 planetas", "9 planetas", "10 planetas"],
            answer: "8 planetas",
            word: "planeta"
          },
          {
            content: "Qual é o planeta mais próximo do Sol?",
            choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
            answer: "Mercúrio",
            word: "órbita"
          },
          {
            content: "O que a Terra faz ao redor do Sol?",
            choices: ["Gira", "Para", "Cresce", "Diminui"],
            answer: "Gira",
            word: "movimento"
          }
        ],
        story: {
          title: "Viagem pelo Sistema Solar",
          content: "Imagine que você é um astronauta em uma nave espacial explorando nosso Sistema Solar. Você passa pelo Sol brilhante, visita planetas coloridos como Marte vermelho e Júpiter gigante, e aprende que cada planeta tem suas próprias características especiais. Que descobertas incríveis você faria nesta jornada espacial!"
        }
      }
    },
    '6º ano': {
      'Corpo Humano': {
        questions: [
          {
            content: "Qual órgão é responsável por bombear sangue para todo o corpo?",
            choices: ["Pulmão", "Fígado", "Coração", "Estômago"],
            answer: "Coração",
            word: "circulação"
          },
          {
            content: "Qual órgão nos permite respirar?",
            choices: ["Coração", "Pulmão", "Fígado", "Rim"],
            answer: "Pulmão",
            word: "respiração"
          },
          {
            content: "Onde fica o cérebro humano?",
            choices: ["No peito", "Na barriga", "Na cabeça", "Nas pernas"],
            answer: "Na cabeça",
            word: "pensamento"
          },
          {
            content: "Quantos ossos principais formam o braço humano?",
            choices: ["1 osso", "2 ossos", "3 ossos", "4 ossos"],
            answer: "2 ossos",
            word: "esqueleto"
          }
        ],
        story: {
          title: "A Incrível Máquina Humana",
          content: "Seu corpo é como uma máquina perfeita onde cada órgão tem uma função importante. O coração trabalha sem parar bombeando sangue, os pulmões captam oxigênio, o cérebro comanda tudo. Descobrir como funciona esta máquina incrível que é o corpo humano é uma aventura fascinante pela vida!"
        }
      }
    }
  },
  'História': {
    '5º ano': {
      'Grandes Navegações': {
        questions: [
          {
            content: "Qual tipo de embarcação foi mais utilizada pelos portugueses nas Grandes Navegações?",
            choices: ["Canoa", "Caravela", "Jangada", "Submarino"],
            answer: "Caravela",
            word: "descoberta"
          },
          {
            content: "Quem foi o navegador português que chegou ao Brasil em 1500?",
            choices: ["Vasco da Gama", "Pedro Álvares Cabral", "Cristóvão Colombo", "Fernão de Magalhães"],
            answer: "Pedro Álvares Cabral",
            word: "navegador"
          },
          {
            content: "Qual oceano os portugueses navegaram para chegar às Índias?",
            choices: ["Oceano Pacífico", "Oceano Ártico", "Oceano Atlântico", "Oceano Índico"],
            answer: "Oceano Atlântico",
            word: "oceano"
          },
          {
            content: "O que os navegadores usavam para se orientar no mar?",
            choices: ["Celular", "Bússola", "Televisão", "Rádio"],
            answer: "Bússola",
            word: "orientação"
          }
        ],
        story: {
          title: "Os Corajosos Navegadores",
          content: "Há muito tempo, navegadores corajosos saíam em caravelas para explorar oceanos desconhecidos. Eles enfrentavam tempestades, descobriam novas terras e povos diferentes. Cada viagem era uma aventura cheia de perigos e descobertas que mudaram a história do mundo para sempre."
        }
      }
    },
    '8º ano': {
      'Revolução Francesa': {
        questions: [
          {
            content: "Qual foi o lema principal da Revolução Francesa?",
            choices: ["Paz e Amor", "Liberdade, Igualdade, Fraternidade", "Força e Honra", "Trabalho e Progresso"],
            answer: "Liberdade, Igualdade, Fraternidade",
            word: "revolução"
          },
          {
            content: "Em que século aconteceu a Revolução Francesa?",
            choices: ["Século XVI", "Século XVII", "Século XVIII", "Século XIX"],
            answer: "Século XVIII",
            word: "século"
          },
          {
            content: "Qual era a classe social mais privilegiada antes da Revolução Francesa?",
            choices: ["Camponeses", "Burguesia", "Nobreza", "Clero"],
            answer: "Nobreza",
            word: "nobreza"
          },
          {
            content: "Qual símbolo representa a Revolução Francesa?",
            choices: ["A águia", "O leão", "A coroa", "A bandeira tricolor"],
            answer: "A bandeira tricolor",
            word: "símbolo"
          }
        ],
        story: {
          title: "A Revolução que Mudou o Mundo",
          content: "Na França do século XVIII, o povo se levantou contra a injustiça e a desigualdade. Gritando por liberdade, igualdade e fraternidade, eles mudaram não apenas seu país, mas inspiraram revoluções ao redor do mundo. Foi um momento histórico que mostrou o poder do povo lutando por seus direitos."
        }
      }
    }
  },
  'Português': {
    '3º ano': {
      'Alfabeto': {
        questions: [
          {
            content: "Quantas letras tem o alfabeto português?",
            choices: ["24 letras", "25 letras", "26 letras", "27 letras"],
            answer: "26 letras",
            word: "alfabeto"
          },
          {
            content: "Quantas vogais existem no alfabeto?",
            choices: ["3 vogais", "4 vogais", "5 vogais", "6 vogais"],
            answer: "5 vogais",
            word: "vogal"
          },
          {
            content: "Qual é a primeira letra do alfabeto?",
            choices: ["B", "A", "C", "D"],
            answer: "A",
            word: "primeira"
          },
          {
            content: "As letras que não são vogais são chamadas de:",
            choices: ["Números", "Consoantes", "Símbolos", "Acentos"],
            answer: "Consoantes",
            word: "consoante"
          }
        ],
        story: {
          title: "O Reino das Letras",
          content: "No Reino das Letras, cada letra tinha um som especial e juntas formavam palavras mágicas. As vogais A, E, I, O, U eram as rainhas que davam vida às palavras, enquanto as consoantes eram os guerreiros que davam força. Juntas, elas criavam histórias incríveis!"
        }
      }
    },
    '6º ano': {
      'Substantivos': {
        questions: [
          {
            content: "Qual das palavras abaixo é um substantivo próprio?",
            choices: ["cidade", "Brasil", "animal", "bonito"],
            answer: "Brasil",
            word: "substantivo"
          },
          {
            content: "Qual palavra é um substantivo comum?",
            choices: ["João", "São Paulo", "livro", "Maria"],
            answer: "livro",
            word: "comum"
          },
          {
            content: "Os substantivos próprios sempre começam com:",
            choices: ["Letra minúscula", "Letra maiúscula", "Número", "Símbolo"],
            answer: "Letra maiúscula",
            word: "próprio"
          },
          {
            content: "Qual é a função do substantivo na frase?",
            choices: ["Dar ação", "Dar nome", "Dar cor", "Dar som"],
            answer: "Dar nome",
            word: "função"
          }
        ],
        story: {
          title: "A Família das Palavras",
          content: "No mundo da gramática, as palavras viviam em famílias organizadas. Os substantivos eram responsáveis por dar nome a tudo: pessoas, lugares, objetos e sentimentos. Alguns eram próprios, como nomes de pessoas e cidades, outros eram comuns, como mesa e cadeira. Cada um tinha sua importância na construção das frases."
        }
      }
    }
  },
  'Geografia': {
    '4º ano': {
      'Brasil': {
        questions: [
          {
            content: "Qual é a capital do Brasil?",
            choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
            answer: "Brasília",
            word: "capital"
          },
          {
            content: "Qual é a maior floresta do Brasil?",
            choices: ["Mata Atlântica", "Caatinga", "Amazônia", "Cerrado"],
            answer: "Amazônia",
            word: "floresta"
          },
          {
            content: "Quantas regiões o Brasil possui?",
            choices: ["3 regiões", "4 regiões", "5 regiões", "6 regiões"],
            answer: "5 regiões",
            word: "região"
          },
          {
            content: "Qual oceano banha o litoral brasileiro?",
            choices: ["Oceano Pacífico", "Oceano Atlântico", "Oceano Índico", "Oceano Ártico"],
            answer: "Oceano Atlântico",
            word: "litoral"
          }
        ],
        story: {
          title: "Descobrindo o Brasil",
          content: "O Brasil é um país continental cheio de diversidades. Das praias do nordeste às montanhas do sul, das florestas da Amazônia ao pantanal, cada região tem suas belezas e características únicas. Conhecer o próprio país é uma aventura geográfica emocionante!"
        }
      }
    },
    '7º ano': {
      'Continentes': {
        questions: [
          {
            content: "Quantos continentes existem no planeta Terra?",
            choices: ["5 continentes", "6 continentes", "7 continentes", "8 continentes"],
            answer: "7 continentes",
            word: "continente"
          },
          {
            content: "Qual é o maior continente do mundo?",
            choices: ["África", "Ásia", "América", "Europa"],
            answer: "Ásia",
            word: "maior"
          },
          {
            content: "Em qual continente fica o Brasil?",
            choices: ["África", "Ásia", "América", "Europa"],
            answer: "América",
            word: "localização"
          },
          {
            content: "Qual continente é conhecido como o berço da humanidade?",
            choices: ["Ásia", "Europa", "África", "Oceania"],
            answer: "África",
            word: "berço"
          }
        ],
        story: {
          title: "Volta ao Mundo",
          content: "Imagine dar a volta ao mundo visitando todos os continentes: a tecnologia da Ásia, a história da Europa, a natureza da África, a diversidade das Américas, a Oceania com suas ilhas paradisíacas, e a misteriosa Antártida. Cada continente tem culturas, climas e paisagens únicos para descobrir!"
        }
      }
    }
  }
};

export const getGranularFallback = (gameParams: GameParameters, contentType: 'question' | 'story'): GranularQuestion | GranularStory | null => {
  const { subject, schoolGrade, theme } = gameParams;
  
  console.log(`[GRANULAR-FALLBACK] Buscando: ${subject} > ${schoolGrade} > ${theme}`);
  
  const subjectFallbacks = granularFallbacks[subject];
  if (!subjectFallbacks) {
    console.log(`[GRANULAR-FALLBACK] Matéria ${subject} não encontrada`);
    return null;
  }
  
  const gradeFallbacks = subjectFallbacks[schoolGrade];
  if (!gradeFallbacks) {
    console.log(`[GRANULAR-FALLBACK] Série ${schoolGrade} não encontrada para ${subject}`);
    return null;
  }
  
  const themeFallbacks = gradeFallbacks[theme];
  if (!themeFallbacks) {
    console.log(`[GRANULAR-FALLBACK] Tema ${theme} não encontrado para ${subject} - ${schoolGrade}`);
    return null;
  }
  
  if (contentType === 'question') {
    const questions = themeFallbacks.questions;
    if (questions && questions.length > 0) {
      // Sempre retornar todas as 4 questões disponíveis
      console.log(`[GRANULAR-FALLBACK] Retornando ${questions.length} questões específicas para ${subject} - ${schoolGrade} - ${theme}`);
      return questions;
    }
  }
  
  if (contentType === 'story') {
    const story = themeFallbacks.story;
    if (story) {
      console.log(`[GRANULAR-FALLBACK] Retornando história específica para ${subject} - ${schoolGrade} - ${theme}`);
      return story;
    }
  }
  
  console.log(`[GRANULAR-FALLBACK] Conteúdo ${contentType} não encontrado para ${subject} - ${schoolGrade} - ${theme}`);
  return null;
};

// Função para verificar se existe fallback granular
export const hasGranularFallback = (gameParams: GameParameters): boolean => {
  const { subject, schoolGrade, theme } = gameParams;
  return !!(granularFallbacks[subject]?.[schoolGrade]?.[theme]);
};

// Função para listar temas disponíveis por matéria e série
export const getAvailableThemes = (subject: string, schoolGrade: string): string[] => {
  const gradeFallbacks = granularFallbacks[subject]?.[schoolGrade];
  return gradeFallbacks ? Object.keys(gradeFallbacks) : [];
};
