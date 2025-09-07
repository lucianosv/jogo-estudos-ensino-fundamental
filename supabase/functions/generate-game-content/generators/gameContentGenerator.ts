import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

interface CompleteGameContent {
  questions: Array<{
    content: string;
    choices: string[];
    answer: string;
    word: string;
  }>;
  narrative: {
    title: string;
    content: string;
  };
}

export const generateCompleteGameContent = async (
  subject: string, 
  theme: string, 
  schoolGrade: string, 
  themeDetails?: string
): Promise<CompleteGameContent> => {
  console.log(`🎯 [UNIFIED-GENERATOR] Gerando conteúdo completo para ${subject} - ${theme} (${schoolGrade})`);
  
  // Determinar nível de linguagem baseado na série
  const languageLevel = schoolGrade <= '3' ? 'simples' : schoolGrade <= '6' ? 'intermediário' : 'avançado';
  const questionComplexity = schoolGrade <= '3' ? 'básicas' : schoolGrade <= '6' ? 'intermediárias' : 'avançadas';
  
  // PROMPT ESTRUTURADO UNIFICADO - GERA TUDO EM UMA CHAMADA
  const unifiedPrompt = `
INSTRUÇÕES CRÍTICAS - FORMATO OBRIGATÓRIO:
Você deve retornar EXATAMENTE um JSON válido no formato especificado abaixo.
NÃO adicione texto antes ou depois do JSON.
NÃO use markdown ou código.
APENAS o JSON puro.

TAREFA: Criar conteúdo educativo completo para ${subject} - ${theme} (${schoolGrade}° ano)

DADOS DO JOGO:
- Matéria: ${subject}
- Tema: ${theme}
- Série: ${schoolGrade}° ano
- Nível de linguagem: ${languageLevel}
- Detalhes adicionais: ${themeDetails || 'Não especificado'}

FORMATO DE RESPOSTA OBRIGATÓRIO:
{
  "questions": [
    {
      "content": "Pergunta educativa clara e objetiva sobre ${theme}",
      "choices": ["Resposta correta", "Alternativa incorreta 1", "Alternativa incorreta 2", "Alternativa incorreta 3"],
      "answer": "Resposta correta",
      "word": "palavra-secreta-relacionada"
    },
    {
      "content": "Segunda pergunta sobre outro aspecto do ${theme}",
      "choices": ["Alternativa incorreta 1", "Resposta correta", "Alternativa incorreta 2", "Alternativa incorreta 3"],
      "answer": "Resposta correta",
      "word": "segunda-palavra-secreta"
    },
    {
      "content": "Terceira pergunta explorando conceito diferente do ${theme}",
      "choices": ["Alternativa incorreta 1", "Alternativa incorreta 2", "Resposta correta", "Alternativa incorreta 3"],
      "answer": "Resposta correta",
      "word": "terceira-palavra-secreta"
    },
    {
      "content": "Quarta pergunta completando o conjunto sobre ${theme}",
      "choices": ["Alternativa incorreta 1", "Alternativa incorreta 2", "Alternativa incorreta 3", "Resposta correta"],
      "answer": "Resposta correta",
      "word": "quarta-palavra-secreta"
    }
  ],
  "narrative": {
    "title": "Título envolvente sobre ${theme}",
    "content": "Narrativa educativa de 200-300 palavras conectando todas as palavras secretas coletadas numa história coerente sobre ${theme}. A narrativa deve ser adequada para ${schoolGrade}° ano, usar linguagem ${languageLevel} e celebrar o aprendizado sobre ${subject}."
  }
}

REQUISITOS OBRIGATÓRIOS:

1. PERGUNTAS (exatamente 4):
   - Cada pergunta deve abordar aspecto diferente do ${theme}
   - Perguntas ${questionComplexity} adequadas ao ${schoolGrade}° ano
   - 4 alternativas cada (1 correta + 3 incorretas plausíveis)
   - Resposta correta deve estar em posição aleatória nas alternativas
   - Focar em conceitos fundamentais de ${subject}

2. PALAVRAS SECRETAS (exatamente 4):
   - Uma palavra por pergunta, relacionada à resposta correta
   - Palavras simples, educativas e memoráveis
   - Sem símbolos, números ou espaços
   - Relacionadas ao tema ${theme}
   - Adequadas ao vocabulário do ${schoolGrade}° ano

3. NARRATIVA FINAL:
   - 200-300 palavras
   - Conectar organicamente todas as 4 palavras secretas
   - Celebrar aprendizado sobre ${theme}
   - Linguagem adequada ao ${schoolGrade}° ano
   - História envolvente e educativa

4. QUALIDADE DO CONTEÚDO:
   - Informações precisas sobre ${subject}
   - Conteúdo apropriado para crianças
   - Sem violência, medo ou temas inadequados
   - Foco na educação e descoberta
   - Linguagem clara e envolvente

EXEMPLOS DE BOA ESTRUTURA:

Para Ciências - Corpo Humano (3° ano):
- Pergunta sobre coração → palavra: "batimento"
- Pergunta sobre pulmões → palavra: "respiracao"
- Pergunta sobre cérebro → palavra: "pensamento"  
- Pergunta sobre ossos → palavra: "esqueleto"

Para História - Descobrimento (4° ano):
- Pergunta sobre Cabral → palavra: "navegador"
- Pergunta sobre caravelas → palavra: "embarcacao"
- Pergunta sobre Porto Seguro → palavra: "chegada"
- Pergunta sobre 1500 → palavra: "descobrimento"

RETORNE APENAS O JSON VÁLIDO - NADA MAIS.
`;

  try {
    console.log(`🚀 [UNIFIED-GENERATOR] Enviando prompt unificado para Gemini...`);
    
    const geminiResponse = await generateWithGemini(unifiedPrompt);
    
    console.log(`📥 [UNIFIED-GENERATOR] Resposta recebida (${geminiResponse.length} chars)`);
    
    // Limpar resposta e tentar parsear JSON
    let cleanResponse = geminiResponse.trim();
    
    // Remover markdown se presente
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Tentar parsear JSON
    let parsedContent: CompleteGameContent;
    try {
      parsedContent = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error(`❌ [UNIFIED-GENERATOR] Erro ao parsear JSON:`, parseError);
      console.log(`📄 [UNIFIED-GENERATOR] Resposta recebida:`, cleanResponse.substring(0, 500));
      throw new Error('Invalid JSON response from Gemini');
    }
    
    // Validação rigorosa da estrutura
    if (!parsedContent.questions || !Array.isArray(parsedContent.questions) || 
        parsedContent.questions.length !== 4) {
      throw new Error('Invalid questions structure - must have exactly 4 questions');
    }
    
    if (!parsedContent.narrative || !parsedContent.narrative.title || 
        !parsedContent.narrative.content) {
      throw new Error('Invalid narrative structure');
    }
    
    // Validar cada pergunta
    for (let i = 0; i < parsedContent.questions.length; i++) {
      const q = parsedContent.questions[i];
      if (!q.content || !Array.isArray(q.choices) || q.choices.length !== 4 || 
          !q.answer || !q.word) {
        throw new Error(`Invalid question structure at index ${i}`);
      }
      
      // Verificar se a resposta está nas alternativas
      if (!q.choices.includes(q.answer)) {
        throw new Error(`Answer not found in choices for question ${i}`);
      }
      
      // Validar palavra secreta (sem símbolos especiais)
      if (!/^[a-zA-ZÀ-ÿ]+$/.test(q.word)) {
        throw new Error(`Invalid secret word format at question ${i}: ${q.word}`);
      }
    }
    
    // Validar narrativa
    const narrativeWordCount = parsedContent.narrative.content.split(' ').length;
    if (narrativeWordCount < 150 || narrativeWordCount > 400) {
      console.warn(`⚠️ [UNIFIED-GENERATOR] Narrativa com ${narrativeWordCount} palavras (recomendado: 200-300)`);
    }
    
    // Validação de conteúdo proibido
    const contentStr = JSON.stringify(parsedContent).toLowerCase();
    if (contentStr.includes('demônio') || contentStr.includes('morte') || 
        contentStr.includes('violência') || contentStr.includes('guerra')) {
      throw new Error('Content contains inappropriate material for children');
    }
    
    console.log(`✅ [UNIFIED-GENERATOR] Conteúdo completo validado com sucesso:`, {
      questionsCount: parsedContent.questions.length,
      narrativeLength: narrativeWordCount,
      words: parsedContent.questions.map(q => q.word)
    });
    
    return parsedContent;
    
  } catch (error) {
    console.error(`❌ [UNIFIED-GENERATOR] Erro na geração unificada:`, error);
    
    // Fallback estruturado específico por matéria
    console.log(`🚨 [UNIFIED-GENERATOR] Usando fallback estruturado para ${subject}`);
    
    return generateStructuredFallback(subject, theme, schoolGrade);
  }
};

// Fallback estruturado que mantém o mesmo formato
const generateStructuredFallback = (
  subject: string, 
  theme: string, 
  schoolGrade: string
): CompleteGameContent => {
  
  const fallbackContent: Record<string, CompleteGameContent> = {
    'Ciências': {
      questions: [
        {
          content: `Qual é a principal função do coração no corpo humano?`,
          choices: ["Digerir alimentos", "Bombear sangue", "Respirar", "Pensar"],
          answer: "Bombear sangue",
          word: "circulacao"
        },
        {
          content: `Quantos pulmões nós temos?`,
          choices: ["Um pulmão", "Dois pulmões", "Três pulmões", "Quatro pulmões"],
          answer: "Dois pulmões", 
          word: "respiracao"
        },
        {
          content: `Qual órgão controla todo o nosso corpo?`,
          choices: ["Estômago", "Coração", "Cérebro", "Fígado"],
          answer: "Cérebro",
          word: "comando"
        },
        {
          content: `O que protege nossos órgãos internos?`,
          choices: ["Os ossos", "A pele", "Os músculos", "O sangue"],
          answer: "Os ossos",
          word: "protecao"
        }
      ],
      narrative: {
        title: "A Aventura do Corpo Humano",
        content: "Numa jornada incrível pelo corpo humano, você descobriu como funciona nossa circulação! O coração bombeia sangue para todo o corpo sem parar. Depois aprendeu sobre a respiração, onde os pulmões trabalham junto para nos dar oxigênio. No centro de comando, o cérebro controla tudo que fazemos, desde pensar até mover os braços. E para nossa proteção, os ossos formam um escudo resistente que mantém tudo seguro. Que aventura fantástica descobrir como nosso corpo é perfeito e trabalha em equipe para nos manter saudáveis!"
      }
    },
    'História': {
      questions: [
        {
          content: `Quem descobriu o Brasil em 1500?`,
          choices: ["Cristóvão Colombo", "Pedro Álvares Cabral", "Vasco da Gama", "Américo Vespúcio"],
          answer: "Pedro Álvares Cabral",
          word: "descobridor"
        },
        {
          content: `Em que ano o Brasil foi descoberto?`,
          choices: ["1498", "1499", "1500", "1501"],
          answer: "1500",
          word: "data"
        },
        {
          content: `Onde os portugueses chegaram primeiro no Brasil?`,
          choices: ["Rio de Janeiro", "Salvador", "Porto Seguro", "São Paulo"],
          answer: "Porto Seguro",
          word: "chegada"
        },
        {
          content: `Como se chamavam os navios dos descobridores?`,
          choices: ["Caravelas", "Jangadas", "Canoas", "Lanchas"],
          answer: "Caravelas",
          word: "navegacao"
        }
      ],
      narrative: {
        title: "A Grande Descoberta do Brasil",
        content: "Em uma época de grandes aventuras marítimas, um corajoso descobridor chamado Pedro Álvares Cabral navegou pelos oceanos. Na data histórica de 22 de abril de 1500, sua frota avistou terras brasileiras. A chegada aconteceu na região que hoje conhecemos como Porto Seguro, na Bahia. Os portugueses viajavam em embarcações especiais chamadas caravelas, barcos resistentes para a navegação oceânica. Esta descoberta mudou para sempre a história do Brasil e começou uma nova era de encontros entre culturas. Que momento especial para celebrar nossa história!"
      }
    }
  };
  
  return fallbackContent[subject] || fallbackContent['Ciências'];
};