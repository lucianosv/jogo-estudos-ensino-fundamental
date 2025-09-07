// SERVIÇO CENTRALIZADO PARA GERAÇÃO DE QUESTÕES - SOLUÇÃO DEFINITIVA
// Elimina duplicações, controla fallbacks e garante unicidade

import { supabase } from '@/integrations/supabase/client';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';
import { getExpandedGranularFallback } from '@/utils/expandedGranularFallbacks';
import { generateThematicFallback } from '@/utils/thematicFallbacks';
import { validateUniqueQuestions, finalValidation } from '@/services/UnifiedContentValidator';
import { unifiedFallbackSystem, StoryData } from '@/services/UnifiedFallbackSystem';
import { getDisplayWord } from '@/utils/wordCleaner';

interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
  source: 'gemini' | 'fallback' | 'emergency' | 'legacy' | 'preloaded';
  uniqueId: string;
}

interface GenerationConfig {
  maxRetries: number;
  timeoutMs: number;
  forceUniqueness: boolean;
}

class QuestionGenerationService {
  private static instance: QuestionGenerationService;
  private questionCache = new Map<string, Question>();
  private usedContentHashes = new Set<string>();
  private usedWords = new Set<string>();
  private cachedNarrative: any = null;
  private readonly config: GenerationConfig = {
    maxRetries: 2,
    timeoutMs: 8000,
    forceUniqueness: true
  };

  static getInstance(): QuestionGenerationService {
    if (!this.instance) {
      this.instance = new QuestionGenerationService();
    }
    return this.instance;
  }

  // Gerar hash único para detectar duplicações
  private generateContentHash(content: string): string {
    return content
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 100);
  }

  // Normalizar palavra para detectar duplicações
  private normalizeWord(word: string): string {
    return getDisplayWord(word)
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }

  // Verificar se questão é única
  private isQuestionUnique(question: Question): boolean {
    const contentHash = this.generateContentHash(question.content);
    const normalizedWord = this.normalizeWord(question.word);
    
    const isDuplicate = this.usedContentHashes.has(contentHash) || 
                       this.usedWords.has(normalizedWord);
    
    if (isDuplicate) {
      console.log(`[QUESTION-SERVICE] ❌ Questão duplicada detectada:`, {
        content: question.content.substring(0, 60),
        word: question.word,
        contentHash,
        normalizedWord
      });
    }
    
    return !isDuplicate;
  }

  // Marcar questão como usada
  private markQuestionAsUsed(question: Question): void {
    const contentHash = this.generateContentHash(question.content);
    const normalizedWord = this.normalizeWord(question.word);
    
    this.usedContentHashes.add(contentHash);
    this.usedWords.add(normalizedWord);
    
    console.log(`[QUESTION-SERVICE] ✅ Questão marcada como usada:`, {
      word: question.word,
      source: question.source
    });
  }

  // Gerar questão via Gemini com prompt otimizado
  private async generateViaGemini(
    gameParams: GameParameters, 
    questionIndex: number
  ): Promise<Question | null> {
    const uniqueSessionId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    
    // Prompts ultra-específicos por índice para evitar similitudes
    const prompts = [
      {
        type: "DEFINIÇÕES",
        instruction: "Faça uma pergunta sobre O QUE É algo específico do tema",
        example: "O que é..."
      },
      {
        type: "PERSONAGENS", 
        instruction: "Faça uma pergunta sobre QUEM FOI uma pessoa relevante",
        example: "Quem foi..."
      },
      {
        type: "EVENTOS",
        instruction: "Faça uma pergunta sobre QUANDO ACONTECEU um evento",
        example: "Quando aconteceu..."
      },
      {
        type: "CONSEQUÊNCIAS",
        instruction: "Faça uma pergunta sobre QUAL FOI O RESULTADO de algo",
        example: "Qual foi o resultado..."
      }
    ];

    const promptConfig = prompts[questionIndex % 4];
    
    try {
      console.log(`[QUESTION-SERVICE] 🎯 Gerando via Gemini - Questão ${questionIndex + 1} - Tipo: ${promptConfig.type}`);
      
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType: 'question',
          subject: gameParams.subject,
          theme: gameParams.theme,
          schoolGrade: gameParams.schoolGrade,
          themeDetails: gameParams.themeDetails,
          questionIndex,
          forceRegenerate: true,
          uniqueSessionId,
          timestamp,
          promptType: promptConfig.type,
          promptInstruction: promptConfig.instruction,
          antiDuplicationSeed: `${uniqueSessionId}_${timestamp}_${questionIndex}`
        }
      });

      if (error || !data) {
        console.log(`[QUESTION-SERVICE] ❌ Gemini falhou para questão ${questionIndex}:`, error);
        return null;
      }

      // Validação rigorosa da resposta
      if (!data.content || !Array.isArray(data.choices) || data.choices.length !== 4 || 
          !data.answer || !data.word) {
        console.log(`[QUESTION-SERVICE] ❌ Gemini retornou estrutura inválida`);
        return null;
      }

      // Verificar conteúdo proibido
      const dataStr = JSON.stringify(data).toLowerCase();
      if (dataStr.includes('demônio') || dataStr.includes('estava caminhando') || 
          dataStr.includes('derrotá')) {
        console.log(`[QUESTION-SERVICE] ❌ Gemini retornou conteúdo proibido`);
        return null;
      }

      const question: Question = {
        content: data.content,
        choices: data.choices,
        answer: data.answer,
        word: data.word,
        source: 'gemini',
        uniqueId: `gemini_${timestamp}_${questionIndex}`
      };

      if (this.isQuestionUnique(question)) {
        console.log(`[QUESTION-SERVICE] ✅ Gemini gerou questão única para índice ${questionIndex}`);
        return question;
      } else {
        console.log(`[QUESTION-SERVICE] ❌ Gemini gerou questão duplicada`);
        return null;
      }

    } catch (error) {
      console.error(`[QUESTION-SERVICE] ❌ Erro no Gemini:`, error);
      return null;
    }
  }

  // HIERARQUIA CLARA DE FALLBACKS
  // 1. Intelligent → 2. Granular → 3. Thematic → 4. Emergency
  private generateViaFallback(
    gameParams: GameParameters, 
    questionIndex: number
  ): Question | null {
    // PRIORIDADE 1: Fallback Inteligente
    try {
      console.log(`[QUESTION-SERVICE] 🥈 P1: Tentando fallback inteligente para questão ${questionIndex}`);
      
      const intelligentData = generateIntelligentFallback(gameParams, 'question', questionIndex);
      
      if (intelligentData && intelligentData.content && intelligentData.choices && 
          intelligentData.answer && intelligentData.word) {
        
        const question: Question = {
          content: intelligentData.content,
          choices: intelligentData.choices,
          answer: intelligentData.answer,
          word: intelligentData.word,
          source: 'fallback',
          uniqueId: `intelligent_${Date.now()}_${questionIndex}`
        };

        if (this.isQuestionUnique(question)) {
          console.log(`[QUESTION-SERVICE] ✅ P1: Fallback inteligente gerou questão única`);
          return question;
        }
      }
    } catch (error) {
      console.log(`[QUESTION-SERVICE] ❌ P1: Erro no fallback inteligente:`, error);
    }

    // PRIORIDADE 2: Fallback Granular 
    try {
      console.log(`[QUESTION-SERVICE] 🥉 P2: Tentando fallback granular para questão ${questionIndex}`);
      
      const granularData = getExpandedGranularFallback(gameParams, 'question', questionIndex);
      
      // Verificar se retornou uma questão válida (não array ou story)
      if (granularData && typeof granularData === 'object' && !Array.isArray(granularData) && 
          'content' in granularData && 'choices' in granularData && 
          'answer' in granularData && 'word' in granularData) {
        
        const question: Question = {
          content: granularData.content,
          choices: granularData.choices,
          answer: granularData.answer,
          word: granularData.word,
          source: 'fallback',
          uniqueId: `granular_${Date.now()}_${questionIndex}`
        };

        if (this.isQuestionUnique(question)) {
          console.log(`[QUESTION-SERVICE] ✅ P2: Fallback granular gerou questão única`);
          return question;
        }
      }
    } catch (error) {
      console.log(`[QUESTION-SERVICE] ❌ P2: Erro no fallback granular:`, error);
    }

    // PRIORIDADE 3: Fallback Temático
    try {
      console.log(`[QUESTION-SERVICE] 🏅 P3: Tentando fallback temático para questão ${questionIndex}`);
      
      const thematicData = generateThematicFallback(gameParams);
      
      if (thematicData && thematicData.content && thematicData.choices && 
          thematicData.answer && thematicData.word) {
        
        // Adicionar unicidade ao temático baseada no índice (só no ID interno)
        const uniqueThematicData = {
          ...thematicData,
        word: thematicData.word,
        _internalId: `${thematicData.word}_t${questionIndex}`
        };
        
        const question: Question = {
          content: uniqueThematicData.content,
          choices: uniqueThematicData.choices,
          answer: uniqueThematicData.answer,
          word: uniqueThematicData.word,
          source: 'fallback',
          uniqueId: `thematic_${Date.now()}_${questionIndex}`
        };

        if (this.isQuestionUnique(question)) {
          console.log(`[QUESTION-SERVICE] ✅ P3: Fallback temático gerou questão única`);
          return question;
        }
      }
    } catch (error) {
      console.log(`[QUESTION-SERVICE] ❌ P3: Erro no fallback temático:`, error);
    }

    console.log(`[QUESTION-SERVICE] ❌ Todos os fallbacks falharam para questão ${questionIndex}`);
    return null;
  }

  // Gerar questão de emergência garantidamente única
  private generateEmergencyQuestion(
    gameParams: GameParameters, 
    questionIndex: number
  ): Question {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    // Templates específicos por matéria para evitar duplicações
    const templates = {
      'Ciências': [
        { q: 'Qual é a principal função do coração?', a: 'Bombear sangue', w: 'circulacao' },
        { q: 'Quantos pulmões temos?', a: 'Dois pulmões', w: 'respiracao' },
        { q: 'Qual órgão controla o corpo?', a: 'Cérebro', w: 'sistema' },
        { q: 'Quantos ossos tem o adulto?', a: '206 ossos', w: 'esqueleto' }
      ],
      'História': [
        { q: 'Quem descobriu o Brasil?', a: 'Pedro Álvares Cabral', w: 'descobrimento' },
        { q: 'Em que ano foi a Independência?', a: '1822', w: 'independencia' },
        { q: 'Quem foi Dom Pedro I?', a: 'Imperador do Brasil', w: 'imperio' },
        { q: 'Capital do Império Romano?', a: 'Roma', w: 'imperio' }
      ],
      'Português': [
        { q: 'O que é um substantivo?', a: 'Palavra que nomeia', w: 'gramatica' },
        { q: 'Qual é o plural de casa?', a: 'Casas', w: 'plural' },
        { q: 'O que é um verbo?', a: 'Palavra que indica ação', w: 'verbo' },
        { q: 'O que é um adjetivo?', a: 'Palavra que qualifica', w: 'qualidade' }
      ],
      'Geografia': [
        { q: 'Qual é a capital do Brasil?', a: 'Brasília', w: 'capital' },
        { q: 'Qual o maior continente?', a: 'Ásia', w: 'continente' },
        { q: 'Qual o maior oceano?', a: 'Pacífico', w: 'oceano' },
        { q: 'Quantos estados tem o Brasil?', a: '26 estados', w: 'federacao' }
      ],
      'Matemática': [
        { q: 'Quanto é 5 + 3?', a: '8', w: 'soma' },
        { q: 'Quanto é 10 - 4?', a: '6', w: 'subtracao' },
        { q: 'Quanto é 3 × 4?', a: '12', w: 'multiplicacao' },
        { q: 'Quanto é 15 ÷ 3?', a: '5', w: 'divisao' }
      ]
    };

    const subjectTemplates = templates[gameParams.subject as keyof typeof templates] || templates['Ciências'];
    const template = subjectTemplates[questionIndex % subjectTemplates.length];
    
    // Gerar opções temáticas baseadas na matéria
    const thematicChoices = this.generateThematicChoices(gameParams.subject, template.a);
    
    const question: Question = {
      content: `${template.q} (${gameParams.theme})`,
      choices: [template.a, ...thematicChoices],
      answer: template.a,
      word: `${template.w}_${questionIndex}_${randomId}`,
      source: 'emergency',
      uniqueId: `emergency_${timestamp}_${questionIndex}_${randomId}`
    };

    console.log(`[QUESTION-SERVICE] 🚨 Questão de emergência gerada para índice ${questionIndex}`);
    return question;
  }

  // Gerar opções temáticas contextualmente apropriadas
  private generateThematicChoices(subject: string, correctAnswer: string): string[] {
    // Detectar o tipo de resposta para gerar opções similares
    const answerType = this.detectAnswerType(correctAnswer);
    
    switch (answerType) {
      case 'year':
        return this.generateYearOptions(correctAnswer);
      case 'body_quantity':
        return this.generateBodyQuantityOptions(correctAnswer);
      case 'number_unit':
        return this.generateNumberUnitOptions(correctAnswer);
      case 'number':
        return this.generateNumberOptions(correctAnswer);
      case 'person':
        return this.generatePersonOptions(subject);
      case 'place':
        return this.generatePlaceOptions(subject);
      case 'organ':
        return this.generateOrganOptions();
      case 'concept':
        return this.generateConceptOptions(subject, correctAnswer);
      default:
        return this.generateGenericOptions(subject, correctAnswer);
    }
  }

  // Detectar o tipo de resposta correta
  private detectAnswerType(answer: string): string {
    const answerLower = answer.toLowerCase();
    
    // Ano (4 dígitos)
    if (/^\d{4}$/.test(answer)) return 'year';
    
    // Quantidade + órgão/parte do corpo
    if (/^(um|uma|dois|duas|três|quatro|cinco)\s+(pulmão|pulmões|rim|rins|olho|olhos|braço|braços|perna|pernas)/.test(answerLower)) {
      return 'body_quantity';
    }
    
    // Número + unidade
    if (/^\d+\s+/.test(answer)) return 'number_unit';
    
    // Só número
    if (/^\d+$/.test(answer)) return 'number';
    
    // Pessoa (contém nome próprio)
    if (/^[A-Z][a-z]+ [A-Z]/.test(answer) || answer.includes('Dom ') || answer.includes('Presidente ')) {
      return 'person';
    }
    
    // Lugar/Capital
    if (answerLower.includes('brasília') || answerLower.includes('rio') || answerLower.includes('são paulo') || 
        answer.includes('Capital') || /^[A-Z][a-z]+ília$/.test(answer)) {
      return 'place';
    }
    
    // Órgão do corpo
    if (/(coração|cérebro|fígado|estômago|intestino|pâncreas|baço|vesícula)/.test(answerLower)) {
      return 'organ';
    }
    
    return 'concept';
  }

  // Gerar opções de anos próximos
  private generateYearOptions(correctYear: string): string[] {
    const year = parseInt(correctYear);
    const options = [];
    
    // Gerar anos próximos mas diferentes
    const offsets = [-50, -25, -10, -5, 5, 10, 25, 50, 100];
    for (const offset of offsets) {
      const newYear = year + offset;
      if (newYear > 1400 && newYear < 2100 && newYear.toString() !== correctYear) {
        options.push(newYear.toString());
      }
    }
    
    return options.slice(0, 3);
  }

  // Gerar opções numéricas similares
  private generateNumberOptions(correctNumber: string): string[] {
    const num = parseInt(correctNumber.replace(/\D/g, ''));
    const unit = correctNumber.replace(/\d/g, '').trim();
    
    const options = [];
    const variations = [num - 2, num - 1, num + 1, num + 2, num * 2, Math.floor(num / 2)];
    
    for (const variation of variations) {
      if (variation > 0 && variation !== num) {
        options.push(unit ? `${variation} ${unit}` : variation.toString());
      }
    }
    
    return options.slice(0, 3);
  }

  // Gerar opções para quantidade de partes do corpo
  private generateBodyQuantityOptions(correctAnswer: string): string[] {
    const match = correctAnswer.toLowerCase().match(/^(um|uma|dois|duas|três|quatro|cinco)\s+(pulmão|pulmões|rim|rins|olho|olhos|braço|braços|perna|pernas)/);
    if (!match) return this.generateNumberOptions(correctAnswer);
    
    const [, , organ] = match;
    const organSingular = organ.replace(/s$/, '');
    const organPlural = organ.endsWith('s') ? organ : organ + 's';
    
    // Gerar variações de quantidade para o mesmo órgão
    const quantities = ['Um', 'Dois', 'Três', 'Quatro'];
    const options = [];
    
    for (const qty of quantities) {
      const option = qty === 'Um' ? `${qty} ${organSingular}` : `${qty} ${organPlural}`;
      if (option.toLowerCase() !== correctAnswer.toLowerCase()) {
        options.push(option);
      }
    }
    
    return options.slice(0, 3);
  }

  // Gerar opções para número + unidade
  private generateNumberUnitOptions(correctAnswer: string): string[] {
    const match = correctAnswer.match(/^(\d+)\s+(.+)$/);
    if (!match) return this.generateNumberOptions(correctAnswer);
    
    const [, numStr, unit] = match;
    const num = parseInt(numStr);
    
    const variations = [num - 50, num - 10, num + 10, num + 50, num * 2, Math.floor(num / 2)];
    const options = [];
    
    for (const variation of variations) {
      if (variation > 0 && variation !== num) {
        options.push(`${variation} ${unit}`);
      }
    }
    
    return options.slice(0, 3);
  }

  // Gerar opções de órgãos do corpo
  private generateOrganOptions(): string[] {
    const organs = [
      'Coração', 'Cérebro', 'Fígado', 'Estômago', 'Intestino', 'Pâncreas', 
      'Baço', 'Vesícula', 'Pulmão', 'Rim', 'Bexiga', 'Próstata'
    ];
    
    return organs.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  // Gerar opções de pessoas por matéria
  private generatePersonOptions(subject: string): string[] {
    const personsBySubject = {
      'História': ['Dom Pedro II', 'Getúlio Vargas', 'Tiradentes', 'Princesa Isabel', 'Santos Dumont', 'Zumbi dos Palmares'],
      'Ciências': ['Charles Darwin', 'Albert Einstein', 'Marie Curie', 'Isaac Newton', 'Gregor Mendel', 'Louis Pasteur'],
      'Geografia': ['Vasco da Gama', 'Cristóvão Colombo', 'Ferdinand Magellan', 'James Cook', 'Marco Polo', 'Américo Vespúcio'],
      'Português': ['Machado de Assis', 'José de Alencar', 'Carlos Drummond', 'Clarice Lispector', 'Monteiro Lobato', 'Castro Alves'],
      'Matemática': ['Pitágoras', 'Euclides', 'Arquimedes', 'René Descartes', 'Isaac Newton', 'Leonhard Euler']
    };
    
    const persons = personsBySubject[subject as keyof typeof personsBySubject] || personsBySubject['História'];
    return persons.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  // Gerar opções de lugares por matéria
  private generatePlaceOptions(subject: string): string[] {
    const placesBySubject = {
      'História': ['Roma', 'Atenas', 'Egito', 'França', 'Inglaterra', 'Espanha'],
      'Ciências': ['Laboratório', 'Universidade', 'Observatório', 'Instituto', 'Academia', 'Centro de Pesquisa'],
      'Geografia': ['Brasil', 'Argentina', 'Chile', 'Peru', 'Colômbia', 'Venezuela'],
      'Português': ['Portugal', 'Angola', 'Moçambique', 'Cabo Verde', 'São Tomé', 'Guiné-Bissau'],
      'Matemática': ['Grécia', 'Babilônia', 'Índia', 'China', 'Egito', 'Mesopotâmia']
    };
    
    const places = placesBySubject[subject as keyof typeof placesBySubject] || placesBySubject['Geografia'];
    return places.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  // Gerar opções conceituais por matéria
  private generateConceptOptions(subject: string, correctAnswer: string): string[] {
    const conceptsBySubject = {
      'História': ['Monarquia', 'República', 'Império', 'Revolução', 'Independência', 'Colonização', 'Abolição', 'Proclamação'],
      'Ciências': ['Fotossíntese', 'Respiração', 'Digestão', 'Circulação', 'Reprodução', 'Evolução', 'Seleção Natural', 'Hereditariedade'],
      'Geografia': ['Clima', 'Relevo', 'Vegetação', 'Hidrografia', 'População', 'Economia', 'Região', 'Território'],
      'Português': ['Sujeito', 'Predicado', 'Objeto', 'Complemento', 'Adjunto', 'Aposto', 'Vocativo', 'Agente'],
      'Matemática': ['Adição', 'Subtração', 'Multiplicação', 'Divisão', 'Potenciação', 'Radiciação', 'Logaritmo', 'Função']
    };
    
    const concepts = conceptsBySubject[subject as keyof typeof conceptsBySubject] || conceptsBySubject['História'];
    const available = concepts.filter(concept => concept !== correctAnswer);
    return available.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  // Fallback para opções genéricas (mantém lógica anterior como última opção)
  private generateGenericOptions(subject: string, correctAnswer: string): string[] {
    const genericBySubject = {
      'História': ['Período Colonial', 'Era Imperial', 'República Velha', 'Era Vargas', 'Regime Militar', 'Nova República'],
      'Ciências': ['Biologia', 'Química', 'Física', 'Astronomia', 'Geologia', 'Ecologia'],
      'Geografia': ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Região Amazônica'],
      'Português': ['Gramática', 'Literatura', 'Redação', 'Interpretação', 'Linguística', 'Semântica'],
      'Matemática': ['Aritmética', 'Álgebra', 'Geometria', 'Trigonometria', 'Estatística', 'Probabilidade']
    };
    
    const options = genericBySubject[subject as keyof typeof genericBySubject] || genericBySubject['História'];
    const available = options.filter(opt => opt !== correctAnswer);
    return available.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  // Método principal para gerar questão única
  public async generateUniqueQuestion(
    gameParams: GameParameters, 
    questionIndex: number
  ): Promise<Question> {
    console.log(`[QUESTION-SERVICE] 🎯 Iniciando geração da questão ${questionIndex + 1}`);
    
    // Tentar Gemini primeiro
    let question = await this.generateViaGemini(gameParams, questionIndex);
    
    // Se falhou, tentar fallback
    if (!question) {
      question = this.generateViaFallback(gameParams, questionIndex);
    }
    
    // Se ainda falhou, usar emergência
    if (!question) {
      question = this.generateEmergencyQuestion(gameParams, questionIndex);
    }
    
    // Marcar como usada e retornar
    this.markQuestionAsUsed(question);
    return question;
  }

  // Gerar conjunto completo via gerador unificado
  public async generateQuestionSet(gameParams: GameParameters): Promise<Question[]> {
    // Limpar estado anterior para garantir novo conjunto
    this.usedContentHashes.clear();
    this.usedWords.clear();
    
    console.log(`[QUESTION-SERVICE] 🎯 === GERANDO CONJUNTO VIA PROMPT UNIFICADO ===`);
    console.log(`[QUESTION-SERVICE] 📚 Matéria: ${gameParams.subject} | Tema: ${gameParams.theme} | Série: ${gameParams.schoolGrade}`);
    
    try {
      // Tentar geração unificada
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType: 'complete_game',
          subject: gameParams.subject,
          theme: gameParams.theme,
          schoolGrade: gameParams.schoolGrade,
          themeDetails: gameParams.themeDetails,
          forceRegenerate: true
        }
      });

      if (error || !data) {
        throw new Error(`Unified generation failed: ${error?.message || 'No data received'}`);
      }

      // Validar estrutura da resposta
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== 4) {
        throw new Error('Invalid unified response structure');
      }

      // Converter para formato interno
      const questions: Question[] = data.questions.map((q: any, index: number) => ({
        content: q.content,
        choices: q.choices,
        answer: q.answer,
        word: q.word,
        source: 'gemini' as const,
        uniqueId: `unified_${Date.now()}_${index}`
      }));

      // Validar unicidade
      for (const question of questions) {
        if (!this.isQuestionUnique(question)) {
          throw new Error('Unified generation produced duplicate questions');
        }
        this.markQuestionAsUsed(question);
      }

      // Armazenar narrativa separadamente para acesso posterior
      if (data.narrative) {
        this.cachedNarrative = data.narrative;
      }

      console.log(`[QUESTION-SERVICE] ✅ Conjunto unificado gerado com sucesso`);
      console.log(`[QUESTION-SERVICE] 📊 Resumo:`, questions.map((q, i) => ({
        index: i + 1,
        word: q.word,
        source: q.source,
        preview: q.content.substring(0, 40) + '...'
      })));

      return questions;

    } catch (error) {
      console.error(`[QUESTION-SERVICE] ❌ Geração unificada falhou:`, error);
      console.log(`[QUESTION-SERVICE] 🔄 Caindo para método individual...`);
      
      // Fallback para método individual
      return this.generateQuestionSetIndividual(gameParams);
    }
  }

  // Método fallback - geração individual (mantém lógica original)
  private async generateQuestionSetIndividual(gameParams: GameParameters): Promise<Question[]> {
    const questions: Question[] = [];
    
    // Gerar questões sequencialmente para garantir unicidade
    for (let i = 0; i < 4; i++) {
      const question = await this.generateUniqueQuestion(gameParams, i);
      questions.push(question);
      
      // Pequena pausa para evitar sobrecarga
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Validação final
    this.validateQuestionSet(questions);
    
    console.log(`[QUESTION-SERVICE] ✅ Conjunto individual completo gerado com ${questions.length} questões únicas`);
    return questions;
  }

  // Validação final do conjunto
  private validateQuestionSet(questions: Question[]): void {
    const contents = questions.map(q => this.generateContentHash(q.content));
    const words = questions.map(q => this.normalizeWord(q.word));
    
    const uniqueContents = new Set(contents);
    const uniqueWords = new Set(words);
    
    if (uniqueContents.size !== questions.length) {
      console.error(`[QUESTION-SERVICE] ❌ DUPLICAÇÃO DE CONTEÚDO DETECTADA!`);
    }
    
    if (uniqueWords.size !== questions.length) {
      console.error(`[QUESTION-SERVICE] ❌ DUPLICAÇÃO DE PALAVRAS DETECTADA!`);
    }
    
    if (uniqueContents.size === questions.length && uniqueWords.size === questions.length) {
      console.log(`[QUESTION-SERVICE] ✅ Validação final: Todas as questões são únicas`);
    }
  }

  // Gerar história - agora usa narrativa do conjunto unificado se disponível
  async generateStory(gameParams: GameParameters): Promise<StoryData | null> {
    // Se temos narrativa do conjunto unificado, usar ela
    if (this.cachedNarrative) {
      console.log(`[QUESTION-SERVICE] ✅ Usando narrativa do conjunto unificado`);
      const narrative = this.cachedNarrative;
      this.cachedNarrative = null; // Limpar cache após uso
      return narrative;
    }

    try {
      console.log(`[QUESTION-SERVICE] 📖 Gerando história individual para ${gameParams.subject} - ${gameParams.theme}`);
      
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType: 'story',
          subject: gameParams.subject,
          theme: gameParams.theme,
          schoolGrade: gameParams.schoolGrade,
          themeDetails: gameParams.themeDetails,
          forceRegenerate: true
        }
      });

      if (error || !data) {
        console.log(`[QUESTION-SERVICE] ❌ Supabase falhou para história:`, error);
        return null;
      }

      console.log(`[QUESTION-SERVICE] ✅ História individual gerada via Supabase`);
      return data;
      
    } catch (error) {
      console.error(`[QUESTION-SERVICE] ❌ Erro ao gerar história:`, error);
      return unifiedFallbackSystem.generateFallbackStory(gameParams);
    }
  }

  // Limpar cache e estado
  public clearCache(): void {
    this.questionCache.clear();
    this.usedContentHashes.clear();
    this.usedWords.clear();
    this.cachedNarrative = null;
    unifiedFallbackSystem.clearCache();
    console.log('[QUESTION-SERVICE] 🧹 Cache e estado limpos');
  }
}

export default QuestionGenerationService;
export type { Question };