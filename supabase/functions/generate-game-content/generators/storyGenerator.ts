
import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

export const generateStory = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let languageLevel = "";
  let storyComplexity = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    languageLevel = "linguagem muito simples e clara, frases curtas";
    storyComplexity = "história com personagens simples e situações do cotidiano";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    languageLevel = "linguagem adequada para crianças, frases bem estruturadas";
    storyComplexity = "narrativa com aventura educativa e personagens interessantes";
  } else {
    languageLevel = "linguagem adequada para adolescentes";
    storyComplexity = "história envolvente com elementos educativos mais elaborados";
  }

  const prompt = `
Crie uma HISTÓRIA NARRATIVA ENVOLVENTE para crianças sobre:
- Matéria: ${subject}
- Tema: ${theme}
- Série: ${schoolGrade}

INSTRUÇÕES OBRIGATÓRIAS:
1. Comece com "Era uma vez" ou similar
2. Crie personagens interessantes (crianças, animais falantes, personagens mágicos)
3. Desenvolva uma aventura emocionante com início, meio e fim
4. Inclua diálogos naturais entre personagens
5. Use ${languageLevel}
6. Tenha entre 200-300 palavras
7. A história deve ensinar sobre ${theme} de forma NATURAL e divertida
8. Inclua momentos de tensão, descoberta e alegria
9. Termine com uma conclusão satisfatória e educativa

EXEMPLOS DE COMO COMEÇAR:
- "Era uma vez uma menina corajosa chamada Luna que adorava explorar..."
- "Em uma floresta mágica vivia um pequeno dragão chamado Faísca que..."
- "Numa manhã ensolarada, o jovem inventor Pedro descobriu uma porta secreta..."

ELEMENTOS ESPECÍFICOS POR MATÉRIA:
${theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta') ? 
  'SISTEMA SOLAR: Inclua uma viagem espacial, personagens explorando planetas diferentes, descobrindo suas características únicas como tamanho, temperatura, luas. Use nomes divertidos para naves ou robôs ajudantes.' : ''}
${subject === 'História' ? 
  'HISTÓRIA: Crie personagens que viajam no tempo ou descobrem artefatos antigos. Inclua detalhes sobre como as pessoas viviam na época, suas roupas, comidas, construções.' : ''}
${subject === 'Matemática' ? 
  'MATEMÁTICA: Os personagens devem resolver problemas usando números de forma criativa - contando tesouros, medindo distâncias, dividindo comida, etc.' : ''}
${subject === 'Ciências' && !theme.toLowerCase().includes('solar') ? 
  'CIÊNCIAS: Inclua experimentos divertidos, descobertas sobre animais, plantas ou corpo humano. Os personagens podem ser cientistas mirins ou animais curiosos.' : ''}
${subject === 'Geografia' ? 
  'GEOGRAFIA: Os personagens viajam por diferentes lugares, descobrem rios, montanhas, cidades. Inclua mapas mágicos ou aventuras de exploração.' : ''}

NÃO FAÇA: Listas numeradas, textos de incentivo, instruções ao leitor
FAÇA: Uma história completa com personagens fazendo coisas interessantes

Retorne APENAS a história narrativa completa.
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    const storyData = {
      title: `${subject}: ${theme}`,
      content: content.trim()
    };
    
    // Validar se é realmente uma história narrativa
    const invalidPhrases = [
      'prepare-se', 'você está prestes', 'sua aventura:', 'complete os desafios',
      'parabéns por completar', 'missão em', 'desbloqueie o final', 'colete as palavras'
    ];
    
    const hasInvalidPhrase = invalidPhrases.some(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasInvalidPhrase || content.includes('1.') || content.includes('2.')) {
      throw new Error('Conteúdo gerado não é uma história narrativa válida');
    }
    
    // Validar conteúdo temático
    if (!validateContent(storyData, subject, theme)) {
      throw new Error('Conteúdo gerado não passou na validação temática');
    }
    
    console.log(`[STORY-AI] História narrativa gerada com sucesso para ${subject} - ${theme}`);
    return storyData;
    
  } catch (error) {
    console.error('Erro ao gerar história narrativa, usando fallback:', error);
    
    // Fallback específico por tema
    let fallbackStory = '';
    
    if (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta')) {
      fallbackStory = `Era uma vez uma menina chamada Stella que sonhava em ser astronauta. Uma noite, enquanto observava as estrelas do quintal, uma pequena nave espacial pousou bem na sua frente! Dela saiu um robô amigável chamado Cosmo.

"Oi, Stella! Preciso da sua ajuda para conhecer os planetas do Sistema Solar", disse Cosmo com uma voz metálica e gentil.

Juntos, eles viajaram pelo espaço. Primeiro visitaram Mercúrio, o planeta mais próximo do Sol e muito quente. Depois foram a Vênus, coberto de nuvens espessas. Na Terra, Cosmo ficou impressionado com a água azul dos oceanos.

Em Marte, encontraram rochas vermelhas por toda parte. Júpiter os deixou boquiabertos - era gigantesco, com uma grande mancha vermelha! Saturno tinha anéis lindos feitos de gelo e rocha.

Ao final da viagem, Stella havia aprendido que cada planeta é único e especial. "Obrigada por me mostrar como o universo é incrível!", disse ela, sonhando ainda mais alto com seu futuro como exploradora espacial.`;
    } else if (subject === 'História') {
      fallbackStory = `Era uma vez um garoto chamado Pedro que adorava histórias antigas. Um dia, enquanto brincava no sótão da vovó, encontrou um baú empoeirado cheio de objetos misteriosos.

Ao abrir uma caixa pequena, uma luz dourada envolveu Pedro e ele se viu numa época muito diferente! As pessoas usavam roupas estranhas e falavam de forma diferente.

"Bem-vindo ao passado!", disse uma menina da sua idade. "Sou Ana e vou te mostrar como era a vida antigamente."

Pedro descobriu como as pessoas faziam fogo sem fósforos, como construíam casas sem máquinas modernas, e como se comunicavam sem telefones. Viu pessoas trabalhando juntas, criando ferramentas incríveis e contando histórias ao redor da fogueira.

Quando a luz dourada apareceu novamente, Pedro estava de volta ao sótão. Mas agora entendia que o passado estava cheio de pessoas corajosas e inteligentes que criaram o mundo que conhecemos hoje. Cada época tinha seus próprios heróis e descobertas especiais.`;
    } else {
      fallbackStory = `Era uma vez uma menina curiosa chamada Sofia que adorava fazer perguntas sobre tudo. Um dia, ela encontrou um livro mágico que brilhava quando ela o tocava.

"Oi, Sofia! Sou o Livro do Conhecimento", disse uma voz gentil. "Posso te levar numa aventura incrível para descobrir coisas novas!"

Sofia aceitou na hora! O livro a levou para um mundo onde podia ver de perto tudo que sempre quis entender. Ela conheceu números que dançavam, plantas que conversavam, animais que explicavam como viviam.

Durante a aventura, Sofia fez muitas descobertas surpreendentes. Cada resposta que encontrava levava a novas perguntas ainda mais interessantes. Ela percebeu que aprender era como resolver um quebra-cabeça gigante onde cada peça revelava uma nova parte do mundo.

Quando voltou para casa, Sofia estava radiante de felicidade. Agora sabia que a curiosidade era sua maior força e que sempre haveria algo novo e emocionante para descobrir. O mundo estava cheio de mistérios esperando para serem desvendados!`;
    }
    
    return {
      title: `Aventura de ${theme}`,
      content: fallbackStory
    };
  }
};
