
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
  const subjectChoices = {
    'História': ['Período Colonial', 'República', 'Império', 'Era Vargas'],
    'Ciências': ['Reino Animal', 'Reino Vegetal', 'Reino Mineral', 'Reino Protista'],
    'Geografia': ['Região Norte', 'Região Sul', 'Região Nordeste', 'Região Sudeste'],
    'Português': ['Prosa', 'Verso', 'Drama', 'Épico'],
    'Matemática': ['Adição', 'Subtração', 'Multiplicação', 'Divisão']
  };
  
  const choices = subjectChoices[subject as keyof typeof subjectChoices] || subjectChoices['Ciências'];
  
  return {
    content: `${subject} - ${theme} (${schoolGrade}): Questão sobre ${theme} em ${subject}`,
    choices: choices,
    answer: choices[0],
    word: "conhecimento"
  };
};

// Gerar história específica por matéria e tema
const generateSubjectSpecificStory = (gameParams: GameParameters): FallbackContent['story'] => {
  const { subject, theme, schoolGrade } = gameParams;

  const makeAdventure = (title: string, story: string): FallbackContent['story'] => ({
    title,
    content: story
  });

  const lowerTheme = theme.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  if (lowerSubject === 'história') {
    if (lowerTheme.includes('roma')) {
      return makeAdventure(
        'A Aventura de Marco em Roma Antiga',
        `Era uma vez um garoto romano chamado Marco que vivia nas ruas movimentadas de Roma. Uma manhã, seu avô, um senador respeitado, lhe deu uma missão especial.

"Marco", disse o avô com um sorriso misterioso, "preciso que você descubra os segredos da nossa grande cidade. Cada lugar que visitar te ensinará algo importante sobre Roma."

Marco ficou animado! Primeiro, foi ao Coliseu, onde conheceu um gladiador chamado Marcus. "Aqui lutamos para entreter o povo", explicou Marcus. "O Coliseu mostra a força e o poder de Roma!"

Depois, Marco seguiu os aquedutos que traziam água fresca para a cidade. Um engenheiro lhe mostrou como a água viajava por quilômetros. "Sem água limpa, Roma não poderia ter tantos habitantes", disse o homem.

No fórum, Marco conversou com mercadores de várias terras. Eles usavam moedas romanas e seguiam as leis criadas pelo Senado. "Roma une todo o mundo conhecido", explicou um comerciante.

Ao voltar para casa, Marco estava cheio de orgulho. Agora entendia que Roma era especial porque cuidava do seu povo, construía coisas incríveis e criava leis justas para todos.`
      );
    }

    return makeAdventure(
      `Aventura no Tempo: ${theme}`,
      `Era uma vez uma menina chamada Clara que encontrou um relógio mágico no sótão da vovó. Quando o tocou, uma luz dourada a envolveu e ela viajou para uma época muito antiga!

"Onde estou?", perguntou Clara, olhando ao redor com curiosidade. As pessoas usavam roupas diferentes e viviam de forma muito especial.

Uma criança da sua idade se aproximou. "Bem-vinda ao passado! Sou João e vou te mostrar como era nossa vida."

Clara descobriu como as pessoas daquela época faziam suas casas, que comidas tinham, como se vestiam e que trabalhos faziam. Cada descoberta era mais interessante que a anterior!

Ela viu como as pessoas eram corajosas e inteligentes, criando soluções incríveis para seus problemas do dia a dia. Participou de uma festa tradicional e aprendeu músicas e danças antigas.

Quando o relógio brilhou novamente, Clara estava de volta ao presente. Mas agora sabia que o passado estava cheio de pessoas especiais que construíram o mundo que conhecemos hoje. Cada época tinha suas próprias aventuras e heróis!`
    );
  }

  if (lowerSubject === 'ciências') {
    if (lowerTheme.includes('sistema solar') || lowerTheme.includes('solar') || lowerTheme.includes('planeta')) {
      return makeAdventure(
        'A Aventura de Luna no Sistema Solar',
        `Era uma vez uma menina chamada Luna que sonhava em conhecer o espaço. Uma noite, enquanto observava as estrelas, um pequeno robô chamado Astro apareceu em seu quintal!

"Oi Luna! Sou o robô Astro e preciso de sua ajuda para explorar os planetas do Sistema Solar", disse ele com luzes piscando.

Juntos, eles subiram numa nave espacial mágica. Primeiro visitaram Mercúrio, o planeta mais próximo do Sol. "Nossa, que calor!", disse Luna. "É por isso que não tem vida aqui."

Depois foram a Vênus, coberto de nuvens grossas. Em Marte, Luna ficou impressionada com as rochas vermelhas por todo lado. "Parece um deserto!", exclamou.

Quando chegaram a Júpiter, Luna não acreditou no tamanho! "É gigante! E tem uma mancha vermelha enorme!" Saturno a deixou ainda mais encantada com seus lindos anéis brilhantes.

Ao retornar à Terra, Luna olhou para seu planeta azul com novo carinho. "Astro, nossa Terra é realmente especial - tem água, ar e vida!" disse ela, agora sonhando em ser uma grande exploradora espacial.`
      );
    }

    return makeAdventure(
      `A Descoberta Científica de Ana`,
      `Era uma vez uma menina chamada Ana que adorava fazer experiências. Um dia, ela encontrou um laboratório secreto no porão de sua escola!

"Bem-vinda, jovem cientista!", disse uma voz misteriosa. Era o Professor Sábio, um cientista muito antigo. "Você pode me ajudar a desvendar os mistérios da natureza?"

Ana ficou super animada! O professor lhe deu um jaleco pequeno e óculos de proteção. Juntos, eles começaram a observar diferentes fenômenos naturais.

Primeiro, Ana aprendeu sobre os animais - como respiram, onde vivem, o que comem. Depois descobriu as plantas - como crescem, por que precisam de luz solar, como fazem seu próprio alimento.

Quando estudaram o corpo humano, Ana ficou impressionada! "Professor, nosso coração bate o dia todo sem parar!", disse ela maravilhada.

No final do dia, Ana estava radiante. "Ciência é incrível! Tudo na natureza tem um propósito especial", disse ela, decidindo que queria ser cientista para sempre.`
    );
  }

  if (lowerSubject === 'geografia') {
    return makeAdventure(
      `A Grande Viagem de Carlos pelo Brasil`,
      `Era uma vez um menino chamado Carlos que ganhou um mapa mágico do seu avô. O mapa mostrava todos os lugares incríveis do Brasil!

"Carlos", disse o avô com um sorriso, "este mapa vai te levar numa aventura por todo nosso país. Você vai conhecer lugares que nem imagina!"

Carlos tocou o mapa e, como num passe de mágica, se viu voando pelo Brasil! Primeiro, sobrevoou as montanhas do Sudeste - que altas! Depois viu as praias lindas do Nordeste, com águas azuis cristalinas.

No Norte, Carlos ficou impressionado com a floresta amazônica. "É gigante! E cheia de animais diferentes!", exclamou. No Sul, viu plantações enormes e pessoas trabalhando no campo.

O menino descobriu rios gigantes como o Amazonas, montanhas altíssimas e cidades movimentadas como São Paulo e Rio de Janeiro. Em Brasília, viu a capital com seus prédios modernos.

Quando voltou para casa, Carlos estava cheio de orgulho do seu país. "Vovô, o Brasil é imenso e cheio de lugares diferentes e especiais!", disse ele, prometendo visitar todos um dia.`
    );
  }

  if (lowerSubject === 'português' || lowerSubject === 'portugues') {
    return makeAdventure(
      `Maria e a Biblioteca Mágica das Palavras`,
      `Era uma vez uma menina chamada Maria que adorava ler e escrever. Um dia, ela descobriu uma biblioteca muito especial onde as palavras saltavam dos livros!

"Olá, Maria!", disse uma voz melodiosa. Era a Fada das Palavras, guardião da biblioteca. "Quer aprender os segredos da língua portuguesa comigo?"

Maria ficou encantada! A fada lhe mostrou como as palavras tinham diferentes famílias: os substantivos que davam nomes às coisas, os verbos que mostravam ações, e os adjetivos que descreviam tudo.

"Veja só!", disse a fada, fazendo as vogais dançarem no ar: "A, E, I, O, U! Elas são as estrelas do alfabeto!" Maria riu vendo as letrinhas coloridas voando ao redor.

A fada ensinou Maria sobre frases bonitas, histórias emocionantes e poemas rimados. "Cada palavra tem sua magia especial", explicou.

Quando chegou a hora de ir embora, Maria estava radiante. "Fada, agora sei que as palavras são como ferramentas mágicas para contar histórias!", disse ela, prometendo voltar sempre para aprender mais.`
    );
  }

  if (lowerSubject === 'matemática' || lowerSubject === 'matematica') {
    return makeAdventure(
      `João e o Reino dos Números`,
      `Era uma vez um menino chamado João que pensava que matemática era difícil. Mas um dia, ele encontrou uma porta secreta que o levou ao Reino dos Números!

"Bem-vindo!", disse um número 7 saltitante. "Sou o Sete Sábio! Aqui você vai descobrir que matemática é divertida!"

João conheceu a família dos números. Os pequeninos de 1 a 10 estavam sempre brincando de somar e subtrair. "Olha só!", disse o número 2, "quando me junto com o 3, viramos 5!"

Depois João conheceu os números maiores, que adoravam multiplicar e dividir. "É como uma dança!", explicou o número 8. "Quando danço com o 3, viramos 24!"

João aprendeu que os números estavam em toda parte - contando seus dedos, medindo sua altura, dividindo pizza com os amigos. "Nossa, vocês são úteis mesmo!", disse ele admirado.

Quando voltou para casa, João estava sorrindo. "Mamãe, matemática é incrível! Os números são nossos amigos e nos ajudam todos os dias!", disse ele, agora ansioso para a aula de matemática.`
    );
  }

  // Genérico (qualquer matéria)
  return makeAdventure(
    `A Aventura do Conhecimento`,
    `Era uma vez uma criança muito curiosa que adorava aprender coisas novas. Um dia, ela encontrou um livro mágico que brilhava quando tocado!

"Olá, pequeno explorador!", disse uma voz gentil saindo do livro. "Sou o Guardião do Conhecimento. Quer descobrir segredos incríveis sobre ${theme}?"

A criança aceitou na hora! O livro a levou para um mundo onde podia ver e tocar tudo que queria aprender. Era como se os conceitos ganhassem vida bem na sua frente!

Durante a aventura, ela fez descobertas surpreendentes sobre ${theme}. Cada pergunta que fazia levava a respostas ainda mais interessantes. Era como montar um quebra-cabeça gigante onde cada peça revelava algo novo.

Quando a aventura terminou, a criança estava radiante de felicidade. Agora sabia que aprender era a coisa mais divertida do mundo e que sempre haveria algo novo para descobrir!

"Obrigada, Guardião! Agora sei que o conhecimento é o maior tesouro que existe!", disse ela, prometendo nunca parar de fazer perguntas e explorar o mundo.`
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
