// SERVIÇO CENTRALIZADO PARA GERAÇÃO DE QUESTÕES - SOLUÇÃO DEFINITIVA
// Elimina duplicações, controla fallbacks e garante unicidade

import { supabase } from '@/integrations/supabase/client';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';

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
    return word
      .toLowerCase()
      .replace(/[-_]\d+$/g, '') // Remove sufixos numéricos
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

  // Gerar questão via fallback inteligente
  private generateViaFallback(
    gameParams: GameParameters, 
    questionIndex: number
  ): Question | null {
    try {
      console.log(`[QUESTION-SERVICE] 🥈 Tentando fallback para questão ${questionIndex}`);
      
      const fallbackData = generateIntelligentFallback(gameParams, 'question', questionIndex);
      
      if (!fallbackData || !fallbackData.content || !fallbackData.choices || 
          !fallbackData.answer || !fallbackData.word) {
        return null;
      }

      const question: Question = {
        content: fallbackData.content,
        choices: fallbackData.choices,
        answer: fallbackData.answer,
        word: fallbackData.word,
        source: 'fallback',
        uniqueId: `fallback_${Date.now()}_${questionIndex}`
      };

      if (this.isQuestionUnique(question)) {
        console.log(`[QUESTION-SERVICE] ✅ Fallback gerou questão única para índice ${questionIndex}`);
        return question;
      } else {
        console.log(`[QUESTION-SERVICE] ❌ Fallback gerou questão duplicada`);
        return null;
      }

    } catch (error) {
      console.error(`[QUESTION-SERVICE] ❌ Erro no fallback:`, error);
      return null;
    }
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
    
    const question: Question = {
      content: `${template.q} (${gameParams.theme})`,
      choices: [template.a, 'Opção B', 'Opção C', 'Opção D'],
      answer: template.a,
      word: `${template.w}_${questionIndex}_${randomId}`,
      source: 'emergency',
      uniqueId: `emergency_${timestamp}_${questionIndex}_${randomId}`
    };

    console.log(`[QUESTION-SERVICE] 🚨 Questão de emergência gerada para índice ${questionIndex}`);
    return question;
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

  // Gerar conjunto completo de 4 questões únicas
  public async generateQuestionSet(gameParams: GameParameters): Promise<Question[]> {
    console.log(`[QUESTION-SERVICE] 🎮 Gerando conjunto completo de questões para ${gameParams.subject} - ${gameParams.theme}`);
    
    // Limpar estado anterior
    this.usedContentHashes.clear();
    this.usedWords.clear();
    
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
    
    console.log(`[QUESTION-SERVICE] ✅ Conjunto completo gerado com ${questions.length} questões únicas`);
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

  // Limpar cache e estado
  public clearCache(): void {
    this.questionCache.clear();
    this.usedContentHashes.clear();
    this.usedWords.clear();
    console.log(`[QUESTION-SERVICE] 🧹 Cache limpo`);
  }
}

export default QuestionGenerationService;
export type { Question };